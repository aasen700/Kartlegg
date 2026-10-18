'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../assets/wound-learning-data-v12.js');
const get=id=>D.cases.find(c=>c.id===id);
test('closed sutured incision is not scored as an open granulating wound',()=>{
 const q=get('postop');assert.equal(q.answer.tissue,'closed');assert.equal(q.answer.moisture,'closed-dry');assert.equal(q.answer.edge,'approximated');assert.match(q.why.tissue,/ingen synlig/);
});
test('red toe wound and fresh trauma do not imply necrosis or established granulation',()=>{
 assert.equal(get('arterial').answer.tissue,'red');assert.equal(get('skin-tear').answer.tissue,'red');assert.equal(get('skin-tear').answer.edge,'separated');assert.equal(get('skin-tear').answer.skin,'bruised');
});
test('each case separates visible findings from fictional clinical context and grades the full key',()=>{
 for(const q of D.cases){assert.ok(q.imageFindings.length>=2);assert.ok(q.observations.length>=3);assert.equal(D.grade(q.id,q.answer).score,5);for(const p of D.parts){const wrong=p.options.find(([id])=>id!==q.answer[p.id])[0];assert.equal(D.grade(q.id,{...q.answer,[p.id]:wrong}).score,4)}}
 assert.equal(get('pressure').answer.tissue,'mixed');assert.equal(get('venous').answer.skin,'pigmented');assert.equal(get('diabetic').answer.skin,'callus');
});
