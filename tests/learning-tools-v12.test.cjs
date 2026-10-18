'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const D=require('../assets/learning-content-v12.js');
const N=require('../assets/scoring.js');
const C=require('../assets/clinical-tools.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('4AT has exact four parts and legitimate item-specific point values',()=>{
 assert.deepEqual(D.fourParts.map(x=>x.id),['alertness','orientation','attention','acute']);
 assert.deepEqual(D.fourParts.map(x=>x.options.map(o=>o.score)),[[0,4],[0,1,2],[0,1,2],[0,4]]);
 assert.equal(D.fourLessons.length,6);
 assert.equal(D.fourCases.length,6);
 assert.deepEqual(D.fourCases.map(x=>x.level),['Øv','Øv','Øv','Test','Test','Test']);
});
test('all 4AT reference case totals come from clinical scorer',()=>{
 for(const q of D.fourCases){
  const expected=C.fourAT(q.parts),fromModule=D.expected('4at',q.id);
  assert.equal(expected.total,fromModule.total);
  assert.deepEqual(expected.parts,fromModule.parts);
  assert.deepEqual(D.grade('4at',q.id,{...q.parts}).match,
   Object.fromEntries(Object.keys(q.parts).map(k=>[k,true])));
  assert.equal(D.grade('4at',q.id,{...q.parts}).score,4);
 }
 assert.deepEqual(D.fourCases.map(x=>D.expected('4at',x.id).total),[0,2,12,7,4,4]);
});
test('4AT distinguishes unable to attempt (2) from refusing the attention test (1)',()=>{
 const inability=D.fourCases.find(x=>x.id==='four-c');
 const decline=D.fourCases.find(x=>x.id==='four-d');
 assert.equal(inability.parts.attention,2);
 assert.equal(decline.parts.attention,1);
 assert.match(D.fourLessons[3].text,/avslag|Kan ikke/);
});
test('4AT rejects incomplete, out-of-range and incorrect item options',()=>{
 const original=D.fourCases[1];
 for(const wrong of [
  {alertness:1,orientation:1,attention:1,acute:0},
  {alertness:0,orientation:3,attention:1,acute:0},
  {alertness:0,orientation:1,attention:4,acute:0},
  {alertness:0,orientation:1,attention:1,acute:1},
  {alertness:0,orientation:1,attention:'1',acute:0},
  {alertness:0,orientation:1,attention:1}
 ]) assert.throws(()=>D.grade('4at',original.id,wrong));
 const marked=D.grade('4at',original.id,{alertness:0,orientation:0,attention:1,acute:0});
 assert.equal(marked.score,3);assert.equal(marked.enteredTotal,1);assert.equal(marked.truth.total,2);
});
test('NEWS2 has seven rows with independent oxygen field and score column options',()=>{
 assert.deepEqual(D.newsRows.map(x=>x.id),['rr','spo','sbp','hr','temp','consciousness','oxygen']);
 assert.equal(D.newsLessons.length,5);
 assert.equal(D.newsCases.length,6);
 assert.deepEqual(D.newsCases.map(x=>x.level),['Øv','Øv','Øv','Test','Test','Test']);
 assert.deepEqual(Object.keys(D.newsRows.find(x=>x.id==='oxygen').bands),['0','2']);
 assert.deepEqual(Object.keys(D.newsRows.find(x=>x.id==='consciousness').bands),['0','3']);
});
test('NEWS2 answer key delegates unaltered to Scoring.news2 for each case',()=>{
 const expectedTotals=[4,3,5,18,0,12];
 for(let i=0;i<D.newsCases.length;i++){
  const q=D.newsCases[i],r=N.news2(q.v),l=D.expected('news2',q.id);
  assert.equal(r.total,expectedTotals[i],q.id);
  assert.equal(l.total,r.total);
  assert.deepEqual(l.parts,r.parts);
  assert.equal(D.grade('news2',q.id,r.parts).score,7);
 }
});
test('NEWS2 scale 2 oxygenated and non-oxygenated high saturation boundary is preserved',()=>{
 const oxygen=D.newsCases.find(x=>x.id==='news-c'),air=D.newsCases.find(x=>x.id==='news-e');
 assert.equal(oxygen.v.scale,2);assert.equal(oxygen.v.spo2,95);assert.equal(oxygen.v.oxygen,true);
 assert.equal(air.v.scale,2);assert.equal(air.v.spo2,95);assert.equal(air.v.oxygen,false);
 assert.equal(D.expected('news2',oxygen.id).parts.spo,2);
 assert.equal(D.expected('news2',air.id).parts.spo,0);
 assert.equal(D.expected('news2',oxygen.id).parts.oxygen,2);
 assert.equal(D.expected('news2',air.id).parts.oxygen,0);
});
test('NEWS2 single parameter 3 and new confusion follow reference scorer',()=>{
 const q=D.expected('news2','news-b');
 assert.equal(q.total,3);assert.equal(q.parts.rr,3);
 assert.deepEqual(Object.values(q.parts).filter(x=>x!==0),[3]);
 const severe=D.expected('news2','news-d');
 assert.equal(severe.parts.consciousness,3);assert.equal(severe.parts.oxygen,2);
});
test('NEWS2 refuses incomplete and illegal score combinations',()=>{
 const q=D.newsCases[0],b={...D.expected('news2',q.id).parts};
 for(const bad of [{...b,oxygen:1},{...b,consciousness:2},{...b,rr:4},{...b,rr:NaN},{...b,rr:'2'},((x)=>{delete x.spo;return x})({...b})])
  assert.throws(()=>D.grade('news2',q.id,bad));
 const wrong=D.grade('news2',q.id,{...b,rr:3});
 assert.equal(wrong.score,6);assert.equal(wrong.enteredTotal,5);assert.equal(wrong.truth.total,4);
});
test('learning modules have exact asset references, clinician-origin sources and no persistence',()=>{
 const html=read('index.html'),js=read('assets/learning-tools-v12.js'),data=read('assets/learning-content-v12.js');
 for(const file of ['assets/learning-tools-v12.css','assets/learning-tools-v12.js','assets/learning-content-v12.js'])
  assert.ok(fs.existsSync(path.join(__dirname,'..',file)),file);
 for(const s of ['id="learningHubChooser"','id="learn4atModule"','id="learnNews2Module"','id="learnToolExerciseRoot"'])
  assert.ok(html.includes(s),s);
 assert.ok(html.includes('learning-content-v12.js?v=1203')&&html.includes('learning-tools-v12.js?v=1401'));
 assert.ok(html.includes('learning-tools-v12.css?v=1401'));
 assert.match(js,/data-part/);
 assert.match(js,/aria-pressed/);
 assert.match(js,/4AT v1\.2/);
 assert.match(data,/the4at\.com\/userguide/);
 assert.match(data,/rcp\.ac\.uk\/resources\/national-early-warning-score-news-2/);
 for(const body of [data,js]){
  assert.doesNotMatch(body,/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\b/);
 }
});

test('NEWS2 white chart uses seven positional columns and gives exact interval answers',()=>{
 assert.deepEqual(D.newsChartColumns,[3,2,1,0,1,2,3]);
 for(const q of D.newsCases){
  const truth=D.expected('news2',q.id).parts;
  const cells={};
  for(const row of D.newsRows){
   const chart=D.newsChartRow(row.id,q.v);
   assert.equal(chart.labels.length,7);
   assert.ok(chart.labels[chart.answerIndex]);
   assert.equal(D.newsChartColumns[chart.answerIndex],truth[row.id],q.id+' '+row.id);
   cells[row.id]=chart.answerIndex;
  }
  const graded=D.gradeNewsChart(q.id,truth,cells);
  assert.equal(graded.score,7);
  assert.equal(graded.truth.total,D.expected('news2',q.id).total);
 }
});
test('NEWS2 duplicate score columns must not count the wrong interval as correct',()=>{
 const q=D.newsCases.find(x=>x.id==='news-c');
 const correct=D.expected('news2',q.id).parts;
 const cells=Object.fromEntries(D.newsRows.map(row=>[row.id,D.newsChartRow(row.id,q.v).answerIndex]));
 assert.equal(cells.spo,5); // SpO2 95% on scale 2 with supplemental oxygen
 const wrong={...cells,spo:1}; // Same 2 score but incorrect saturation interval.
 const result=D.gradeNewsChart(q.id,correct,wrong);
 assert.equal(result.match.spo,false);
 assert.equal(result.score,6);
 assert.throws(()=>D.gradeNewsChart(q.id,correct,{...cells,spo:4})); // 1 point column does not match answer 2.
});
test('NEWS2 UI uses explicit check and next actions, not reveal only at final summary',()=>{
 const js=read('assets/learning-tools-v12.js'),css=read('assets/learning-tools-v12.css');
 assert.match(js,/Sjekk resultat/);
 assert.match(js,/Gå videre/);
 assert.match(js,/gradeNewsChart/);
 assert.match(js,/learn12-vital-tiles/);
 assert.match(css,/learn12-news-cell\.is-selected\.is-score-3/);
 assert.match(css,/background:#fff!important/);
});

test('4AT and NEWS2 both provide GCS-level learning home screens without changing scoring',()=>{
 const ui=read('assets/learning-tools-v12.js'),css=read('assets/learning-tools-v12.css');
 assert.match(ui,/function landingArtwork\(\)/);
 assert.match(ui,/learn12-hero learn12-hero-/);
 assert.match(ui,/learn12-four-grid/);
 assert.match(ui,/learn12-monitor-vital/);
 assert.match(ui,/learn12-hero-tags/);
 assert.match(ui,/learn12-premium-modes/);
 assert.match(ui,/learn12-mode-subtitle/);
 assert.match(ui,/count\.lessons\.length\+' læringssteg'/);
 assert.match(ui,/count\.cases\.filter\(c=>c\.level==='Øv'\)\.length/);
 assert.match(css,/@media\(max-width:710px\)\{\.learn12-hero\{grid-template-columns:1fr/);
 assert.doesNotMatch(ui,/localStorage|sessionStorage|\bfetch\(/);
 const gcs=read('assets/gcs-learning-ui.js');
 assert.doesNotMatch(gcs,/4AT og NEWS2 er aktuelle neste steg/);
});
