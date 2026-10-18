'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const G=require('../assets/gcs-learning-data.js');
const scoring=require('../assets/clinical-tools.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('GCS learning has six steps, nine guided tasks and four full patient cases',()=>{
 assert.equal(G.lessons.length,6);
 assert.equal(G.practice.length,9);
 assert.equal(G.exams.length,4);
 for(const col of [G.lessons,G.practice,G.exams])assert.equal(new Set(col.map(x=>x.id)).size,col.length);
 assert.match(G.source.url,/glasgowcomascale.org/);
});
test('GCS answer options correspond exactly to the underlying E/V/M/NT calculator',()=>{
 for(const [part,max] of [['eyes',4],['verbal',5],['motor',6]]){
  const choices=G.categories[part].map(x=>x.value);
  assert.deepEqual(choices,[...Array.from({length:max},(_,i)=>String(max-i)),'NT']);
  for(const c of choices)assert.equal(typeof c,'string');
 }
 assert.deepEqual(G.scoreValues({eyes:'3',verbal:'4',motor:'6'}),scoring.gcs({eyes:3,verbal:4,motor:6}));
 assert.equal(G.scoreValues({eyes:'3',verbal:'4',motor:'6'}).total,13);
});
test('NT never produces a fabricated total and other GCS components remain available',()=>{
 for(const name of ['eyes','verbal','motor']){
  const d={eyes:'4',verbal:'5',motor:'6',[name]:'NT'};
  const result=G.scoreValues(d);
  assert.equal(result.total,null);assert.equal(result.testable,false);
  assert.match(result.report,/NT/);
 }
});
test('practice answer key accepts each expected score and returns safe explanations',()=>{
 for(const q of G.practice){
  const result=G.gradePractice(q.id,q.answer);
  assert.equal(result.correct,true,q.id);
  assert.ok(result.why.length>10,q.id);
  const wrong=G.categories[q.part].find(x=>x.value!==q.answer).value;
  assert.equal(G.gradePractice(q.id,wrong).correct,false,q.id);
 }
 assert.throws(()=>G.gradePractice('unknown','3'));
 assert.throws(()=>G.gradePractice('e-sound','99'));
});
test('all four full-case answers are graded by the existing GCS scorer, including NT',()=>{
 const answers=Object.fromEntries(G.exams.map(x=>[x.id,{...x.answers}]));
 const grade=G.gradeExam(answers);
 assert.equal(grade.cases.length,4);
 assert.equal(grade.cases.reduce((n,c)=>n+c.correct,0),12);
 assert.equal(grade.cases.find(x=>x.id==='test-a').expected.total,14);
 assert.equal(grade.cases.find(x=>x.id==='test-b').expected.total,9);
 assert.equal(grade.cases.find(x=>x.id==='test-c').expected.total,null);
 assert.equal(grade.cases.find(x=>x.id==='test-d').expected.total,4);
 assert.equal(grade.cases.find(x=>x.id==='test-c').expected.report,'ENT V5 M6');
});
test('exam grades components separately, never guesses missing scores',()=>{
 const a=Object.fromEntries(G.exams.map(x=>[x.id,{...x.answers}]));
 a['test-a'].verbal='3';
 const r=G.gradeExam(a).cases[0];
 assert.equal(r.correct,2);assert.equal(r.parts.verbal,false);
 assert.equal(r.parts.eyes,true);assert.equal(r.parts.motor,true);
 assert.throws(()=>G.gradeExam({}));
 const b=Object.fromEntries(G.exams.map(x=>[x.id,{...x.answers}]));
 b['test-b'].motor='8';assert.throws(()=>G.gradeExam(b));
 for(const v of ['',undefined,null,8,'0',3.5])
  assert.throws(()=>G.scoreValues({eyes:v,verbal:'5',motor:'6'}));
});
test('learn mode includes an educational disclaimer, official source and static original illustrations',()=>{
 const ui=read('assets/gcs-learning-ui.js');
 const html=read('index.html');
 const app=read('assets/app.js');
 assert.match(html,/data-page="laer"/);
 assert.match(html,/id="page-laer"/);
 assert.match(html,/id="gcsLearningRoot"/);
 assert.match(app,/'laer'/);
 for(const p of ['gcs-learning-data.js','gcs-learning-ui.js','gcs-learning.css',
  'gcs-learning-patient.svg','gcs-learning-eyes.svg','gcs-learning-verbal.svg',
  'gcs-learning-motor.svg','gcs-learning-nt.svg']){
  assert.ok(fs.existsSync(path.join(__dirname,'../assets/',p)),p+' must exist');
 }
 assert.match(ui,/ikke en autorisert kompetanseprøve/);
 assert.match(ui,/Symbolsk illustrasjon/);
 assert.match(ui,/Offisiell norsk GCS-veiledning/);
 assert.doesNotMatch(ui,/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|\bfetch\s*\(|\bsendBeacon\b|\bdocument\.cookie\b/i);
 assert.doesNotMatch(read('assets/gcs-learning-data.js'),/\blocalStorage\b|\bfetch\s*\(/);
});
