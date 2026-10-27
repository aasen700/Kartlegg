'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const S=require('../assets/simulation-engine.js');
const Scoring=require('../assets/scoring.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('scenario begins without exposing unmeasured vitals or saving data',()=>{
 const s=S.start();
 assert.equal(s.minutes,0);assert.equal(s.lastVitals,null);assert.deepEqual(s.done,[]);
 assert.ok(Object.isFrozen(s));assert.ok(Object.isFrozen(s.done));
 const ui=read('assets/simulation-ui.js');
 for(const forbidden of ['fetch(','XMLHttpRequest','sendBeacon(','indexedDB','localStorage.','sessionStorage.','document.cookie'])
  assert.ok(!ui.includes(forbidden),'simulation must not persist or transmit data: '+forbidden);
});
test('pilot uses canonical NEWS2 arithmetic and an explicitly fictional case',()=>{
 const state=S.step(S.start(),'vitals');
 const reference=Scoring.news2(state.lastVitals);
 assert.equal(reference.total,11);
 assert.deepEqual(S.referenceNews(state),reference);
 assert.equal(S.caseData.id,'home-acute-001');
 assert.match(S.caseData.warning,/fiktive/);
 assert.equal(S.actions.length,11,'åtte opprinnelige handlinger og tre nye');
 for(const id of ['symptoms','history','abcde','vitals','mental','contact','reevaluate','wait'])assert.ok(S.actions.some(a=>a.id===id),id);
});
test('observed measurements stay unchanged until user repeats them',()=>{
 let s=S.step(S.start(),'vitals');
 assert.equal(s.lastVitals.spo2,91);
 for(const id of ['symptoms','history','abcde','mental'])s=S.step(s,id);
 assert.equal(s.worsened,true);
 assert.equal(S.currentVitals(s).spo2,88);
 assert.equal(s.lastVitals.spo2,91,'do not reveal unmeasured deterioration');
 assert.equal(S.referenceNews(s).total,11);
 s=S.step(s,'reevaluate');
 assert.equal(s.lastVitals.spo2,88);
 assert.equal(S.referenceNews(s).total,17);
});
test('escalation prevents scripted deterioration and actions have fixed costs',()=>{
 let s=S.step(S.start(),'vitals');
 s=S.step(s,'contact');
 s=S.step(s,'symptoms');
 s=S.step(s,'history');
 s=S.step(s,'abcde');
 assert.equal(s.worsened,false);
 assert.equal(s.minutes,11);
 assert.equal(S.can(s,'contact'),false);
 assert.throws(()=>S.step(s,'contact'));
});
test('wait action is bounded; debrief marks gaps without automatic clinical credentialing',()=>{
 let s=S.step(S.start(),'wait');
 assert.equal(S.can(s,'wait'),true);
 s=S.step(s,'wait');
 assert.equal(s.worsened,false,'exactly 10 simulated minutes is before scenario trigger');
 assert.equal(S.can(s,'wait'),false);
 assert.throws(()=>S.step(s,'wait'));
 s=S.step(s,'symptoms');
 assert.equal(s.worsened,true);
 const d=S.debrief(s);
 assert.equal(d.items.find(x=>x.id==='contact').done,false);
 assert.equal(d.items.find(x=>x.id==='isbar').done,false);
 assert.match(d.note,/ikke vurdering av klinisk kompetanse/);
});
test('NEWS2 attempt is validated and not marked correct before debrief',()=>{
 let s=S.start();
 assert.throws(()=>S.recordNews(s,11));
 s=S.step(s,'vitals');
 for(const n of [-1,31,3.5,Infinity,NaN,'11'])assert.throws(()=>S.recordNews(s,n));
 s=S.recordNews(s,11);
 assert.equal(s.enteredNews,11);
 const d=S.debrief(s);
 assert.equal(d.items.find(x=>x.id==='news').done,true);
 const wrong=S.debrief(S.recordNews(s,8));
 assert.equal(wrong.items.find(x=>x.id==='news').done,false);
});
test('ISBAR text is mandatory but not machine-graded; case can finish early',()=>{
 let s=S.start();
 const fields={s:'Akutt tungpust',b:'Økende hoste',a:'Vitale parametere',r:'Ønsker vurdering'};
 for(const input of [null,{}, {...fields,a:''},{...fields,r:'x'},{...fields,b:'y'.repeat(701)}])assert.throws(()=>S.recordIsbar(s,input));
 s=S.recordIsbar(s,fields);
 assert.equal(s.isbar.a,'Vitale parametere');
 s=S.finish(s);
 assert.equal(s.finished,true);
 assert.equal(S.can(s,'vitals'),false);
 assert.throws(()=>S.step(s,'vitals'));
 assert.throws(()=>S.recordIsbar(s,fields));
});
test('a simulation route, source and front-end assets are integrated',()=>{
 const html=read('index.html'),app=read('assets/app.js');
 for(const element of ['data-page="simulering"','id="page-simulering"','id="simulationRoot"','assets/simulation-engine.js?v=sprak1','assets/simulation-ui.js?v=ai3','assets/learning-progress.js?v=laer1','assets/css/07-simulation.css'])
  assert.ok(html.includes(element),element);
 assert.ok(app.includes("'simulering'"));
 assert.doesNotMatch(read('assets/simulation-engine.js'),/localStorage|sessionStorage|fetch\(|XMLHttpRequest/);
});
test('NEWS2 is scored in the chart, one field per row, with a fresh chart after re-measuring',()=>{
 let s=S.step(S.start(),'vitals');
 assert.equal(s.charts.length,1);
 assert.throws(()=>S.recordNewsCell(s,'rr',99));
 assert.throws(()=>S.recordNewsCell(s,'nope',3));
 assert.throws(()=>S.recordNewsCell(S.start(),'rr',3),/Mål vitale/);
 for(const r of S.rows){
  s=S.recordNewsCell(s,r,S.chartRow(r,s.lastVitals).answerIndex);
  if(r!=='oxygen')assert.equal(s.enteredNews,null,'no sum before every row is scored');
 }
 assert.equal(s.enteredNews,11);
 assert.equal(S.debrief(s).items.find(x=>x.id==='news').done,true);
 const wrong=S.recordNewsCell(s,'hr',4);
 const d=S.debrief(wrong);
 assert.equal(d.items.find(x=>x.id==='news').done,false);
 assert.equal(d.charts[0].correctRows,6);
 assert.equal(d.charts[0].rows.find(r=>r.id==='hr').ok,false);
 for(const a of ['symptoms','history','abcde'])s=S.step(s,a);
 s=S.step(s,'reevaluate');
 assert.equal(s.charts.length,2,'re-measuring gives a new chart');
 assert.equal(s.enteredNews,null);
 for(const r of S.rows)s=S.recordNewsCell(s,r,S.chartRow(r,s.lastVitals).answerIndex);
 const both=S.debrief(S.finish(s));
 assert.deepEqual(both.charts.map(c=>[c.total,c.entered]),[[11,11],[17,17]]);
 assert.ok(!read('assets/simulation-ui.js').includes('tool=news2'),'no detour to a new tab');
});
test('every case has stable and worse illustrations, hidden findings, a key finding and an ISBAR example',()=>{
 for(const c of S.cases){
  for(const which of ['stable','worse']){
   const svg=read(c.images[which]);
   assert.match(svg,/^<svg [^>]*role="img"/,c.id+' '+which);
   assert.match(svg,/<title[^>]*>[^<]+<\/title>/);
   assert.match(svg,/ikke-diagnostisk/);
   assert.doesNotMatch(svg,/<script|href=|https?:\/\/(?!www\.w3\.org)/,'no scripts or external links in '+c.images[which]);
  }
  for(const id of ['relative','skin','glucose']){
   let s=S.step(S.start(c.id),id);
   assert.ok(s.timeline.at(-1).text.length>20,c.id+' '+id);
  }
  assert.ok(S.actions.some(a=>a.id===c.key.action),c.id+' key action exists');
  for(const k of ['s','b','a','r'])assert.ok(c.isbar[k].length>20,c.id+' isbar '+k);
  const before=S.debrief(S.start(c.id)).items.find(x=>x.id==='key');
  assert.equal(before.done,false);
  const after=S.debrief(S.step(S.start(c.id),c.key.action)).items.find(x=>x.id==='key');
  assert.equal(after.done,true);
  assert.deepEqual(S.debrief(S.start(c.id)).isbarExample,c.isbar);
 }
 const ui=read('assets/simulation-ui.js');
 assert.match(ui,/c\.images\[worse\?'worse':'stable'\]/);
 assert.match(ui,/Sammenlign ISBAR-utkastet ditt med et eksempel/);
});
test('debrief says concretely what went well, what to improve and when the patient got worse',()=>{
 let s=S.start('nursing-home-confusion-002');
 for(const a of ['symptoms','vitals','wait','abcde','reevaluate','contact'])s=S.step(s,a);
 for(const r of S.rows)s=S.recordNewsCell(s,r,r==='hr'?3:S.chartRow(r,s.lastVitals).answerIndex);
 const d=S.debrief(S.finish(s));
 assert.equal(d.worsenedAt,13);
 const good=d.good.map(x=>x.id),improve=d.improve.map(x=>x.id);
 assert.ok(good.includes('vitals')&&good.includes('reevaluate'));
 assert.ok(improve.includes('contact'),'calling after the deterioration is flagged as late');
 assert.match(d.improve.find(x=>x.id==='contact').text,/etter 17 min.*etter 13 min/);
 assert.match(d.improve.find(x=>x.id==='news').text,/puls \(du valgte 51–90, riktig er 111–130\)/);
 assert.ok(improve.includes('wait')&&improve.includes('key')&&improve.includes('isbar'));
 assert.equal(d.achieved,d.items.filter(x=>x.done).length);
 const tl=d.timeline.map(t=>t.id+':'+t.tag);
 assert.deepEqual(tl,['symptoms:neutral','vitals:good','wait:warn','worse:event','abcde:good','reevaluate:good','contact:late']);
 // Ringer du tidlig, får du ros for det.
 let early=S.step(S.step(S.start(),'vitals'),'contact');
 assert.ok(S.debrief(early).good.some(x=>x.id==='contact'));
 const ui=read('assets/simulation-ui.js');
 assert.match(ui,/Dette gjorde du bra/);assert.match(ui,/Dette kan du gjøre bedre/);
 assert.match(ui,/role','tablist'/,'mobile tabs');
});
