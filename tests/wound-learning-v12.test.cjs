'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const D=require('../assets/wound-learning-data-v12.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('TIMES learning has five observation domains and six separate cases',()=>{
 assert.deepEqual(D.parts.map(p=>p.letter),['T','I','M','E','S']);
 assert.equal(D.cases.length,6);
 assert.equal(D.cases.filter(q=>q.level==='Øv').length,3);
 assert.equal(D.cases.filter(q=>q.level==='Test').length,3);
 assert.equal(D.lessons.length,6);
 assert.equal(new Set(D.cases.map(c=>c.id)).size,6);
});
test('each wound case has complete legitimate answer choices, rationales and two original images',()=>{
 for(const q of D.cases){
  assert.match(q.summary,/./);
  assert.equal(D.grade(q.id,{...q.answer}).score,5);
  for(const part of D.parts){
   assert.ok(part.options.some(([id])=>id===q.answer[part.id]),q.id+' '+part.id);
   assert.ok(q.why[part.id].length>12,q.id+' '+part.id);
  }
  for(const style of ['realistic','drawn']){
   const image='assets/wounds/'+q.id+'-'+style+'.svg';
   assert.ok(fs.existsSync(path.join(__dirname,'..',image)),image);
   assert.match(read(image),/<svg[\s\S]*<\/svg>/);
   assert.match(read(image),/ikke pasientfoto/);
  }
 }
});
test('TIMES rejects incomplete, tampered and unknown case submissions',()=>{
 const q=D.cases[0],answer={...q.answer};
 assert.throws(()=>D.grade(q.id,{...answer,tissue:'unknown'}));
 assert.throws(()=>D.grade(q.id,{...answer,skin:undefined}));
 assert.throws(()=>D.grade('unknown',answer));
 assert.throws(()=>D.grade(q.id,null));
 const bad={...answer,tissue:answer.tissue==='mixed'?'necrosis':'mixed'};
 assert.equal(D.grade(q.id,bad).score,4);
});
test('TIMES is installed as a fourth learning card with client-only state and no real-photo claims',()=>{
 const html=read('index.html'),js=read('assets/wound-learning-v12.js');
 for(const name of ['wound-learning-data-v12.js','wound-learning-v12.js','wound-learning-v12.css','id="learnTimesModule"','id="woundLearningRoot"']){
  assert.ok(html.includes(name),name);
 }
 for(const text of ["dataset.learnTool='times'","switcher()","grades[q.id]=D.grade(q.id,answers[q.id])"]){
  assert.ok(js.includes(text),text);
 }
 assert.doesNotMatch(js,/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\b/);
 assert.match(js,/Ikke pasientfoto/);
});
