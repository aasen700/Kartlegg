'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createStore,KEY}=require('../assets/learning-progress.js');
const S=require('../assets/simulation-engine.js');
const Scoring=require('../assets/scoring.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function memory(){const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),raw:m}}

test('progress remembers completed parts and best test score per account',()=>{
 const storage=memory();let uid='user-a';
 const p=createStore({storage,owner:()=>uid});
 assert.equal(p.get('GCS'),null);
 assert.ok(p.record('GCS','learn'));
 assert.ok(p.record('GCS','test',{correct:6,total:12}));
 assert.ok(p.record('GCS','test',{correct:10,total:12}));
 assert.ok(p.record('GCS','test',{correct:8,total:12}));
 assert.deepEqual(p.get('GCS'),{learn:true,test:true,last:[8,12],best:[10,12]});
 uid='user-b';
 assert.equal(p.get('GCS'),null,'another account on the same device sees its own progress');
 uid='user-a';
 const raw=storage.getItem(KEY);
 assert.ok(!raw.includes('user-a'),'the uid itself is not stored');
 assert.doesNotMatch(raw,/\d{4}-\d{2}-\d{2}|savedAt|time/i,'no timestamps');
});
test('progress rejects bad input and can be reset',()=>{
 const storage=memory(),p=createStore({storage,owner:'x'});
 assert.equal(p.record('GCS','exam'),false);
 assert.equal(p.record('<script>','learn'),false);
 p.record('4AT','practice',{correct:5,total:3});
 assert.deepEqual(p.get('4AT'),{practice:true},'impossible score ignored');
 storage.setItem(KEY,'{broken');
 assert.equal(p.get('4AT'),null);
 p.record('TIMES','learn');
 p.reset();
 assert.equal(p.get('TIMES'),null);
 assert.equal(storage.getItem(KEY),null);
});
test('progress is wired into Lær, simulation, øvingsforløp and account deletion',()=>{
 const html=read('index.html');
 assert.ok(html.indexOf('learning-progress.js')<html.indexOf('simulation-ui.js'));
 assert.ok(html.indexOf('learning-progress.js')<html.indexOf('learning-flow.js'));
 assert.match(read('assets/learning-flow.js'),/store\.record\(course,'learn'\)/);
 assert.match(read('assets/simulation-ui.js'),/record\('sim:'\+state\.caseId/);
 assert.match(read('assets/app.js'),/KartleggLearningProgress\?\.record\('Øvingsforløp'/);
 assert.match(read('assets/account/ui.mjs'),/KartleggLearningProgress\?\.reset\(\)/);
 assert.match(html,/Fremgang i Lær og simuleringen/,'privacy notice mentions progress');
});
test('every simulation case is fictional, scored by the shared NEWS2 module and has text for every action',()=>{
 assert.equal(S.cases.length,4);
 assert.equal(new Set(S.cases.map(c=>c.id)).size,4);
 const expected={'home-acute-001':[11,17],'nursing-home-confusion-002':[9,15],'postop-ward-003':[3,8],'copd-scale2-004':[5,12]};
 for(const c of S.cases){
  assert.match(c.patient,/fiktiv/);assert.match(c.warning,/fiktive/);assert.ok(c.lesson&&c.focus&&c.opening);
  let s=S.step(S.start(c.id),'vitals');
  assert.equal(S.referenceNews(s).total,expected[c.id][0],c.id);
  assert.deepEqual(S.referenceNews(s),Scoring.news2(c.vitals));
  for(const a of ['symptoms','history','abcde','mental'])s=S.step(s,a);
  assert.equal(s.worsened,true);
  s=S.step(s,'reevaluate');
  assert.equal(S.referenceNews(s).total,expected[c.id][1],c.id);
  for(const a of S.actions)if(S.can(s,a.id))s=S.step(s,a.id);
  for(const e of s.timeline)assert.ok(e.text.length>20,c.id+' '+e.id);
  const d=S.debrief(S.finish(s));
  assert.equal(d.caseId,c.id);assert.equal(d.lesson,c.lesson);
 }
 assert.equal(S.getCase('nope'),null);
 assert.equal(S.start('nope').caseId,'home-acute-001','unknown id falls back to the first case');
 const copd=S.debrief(S.step(S.start('copd-scale2-004'),'vitals'));
 assert.match(copd.items.find(x=>x.id==='news').reason,/SpO₂-skala 2 og oksygentilførsel/);
});
test('øvingsforløp questions are built from the example and stored answers are not kept',()=>{
 const app=read('assets/app.js'),html=read('index.html');
 assert.ok(html.includes('id="quizExampleForlop"')&&html.includes('id="forlopQuiz"'));
 assert.match(app,/function startForlopQuiz/);
 assert.match(app,/function renderForlopQuiz/);
 assert.doesNotMatch(app.slice(app.indexOf('function startForlopQuiz'),app.indexOf('function readInterval')),/localStorage|sessionStorage|fetch\(/);
});
