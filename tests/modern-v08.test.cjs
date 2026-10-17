const test=require('node:test');
const assert=require('node:assert/strict');
const {bmiBsa,respiratoryRate}=require('../assets/modern-v08-scoring.js');

test('BMI: 180 cm / 80 kg is 24.691…',()=>{
 const x=bmiBsa({height:180,weight:80});
 assert.ok(Math.abs(x.bmi-24.691358024691358)<1e-10);
 assert.equal(x.cm,180);assert.equal(x.kg,80);
});
test('Mosteller BSA: 180 cm / 80 kg is exactly 2 m²',()=>{
 const x=bmiBsa({height:180,weight:80});
 assert.equal(x.bsa,2);assert.equal(x.method,'Mosteller');
});
test('BMI and BSA: independent of supported measurement unit',()=>{
 const a=bmiBsa({height:187,weight:92.5});
 const b=bmiBsa({height:187/2.54,weight:92.5/0.45359237,heightUnit:'in',weightUnit:'lb'});
 assert.ok(Math.abs(a.bmi-b.bmi)<1e-9);
 assert.ok(Math.abs(a.bsa-b.bsa)<1e-9);
});
test('BMI and BSA: independent choices for height and weight units',()=>{
 const a=bmiBsa({height:165,weight:70});
 const b=bmiBsa({height:165,weight:70/0.45359237,heightUnit:'cm',weightUnit:'lb'});
 assert.ok(Math.abs(a.bsa-b.bsa)<1e-9);
});
test('BMI rejects invalid values and out-of-scope adult range',()=>{
 for(const v of [0,-1,NaN,Infinity,null,undefined,'180',89,251]){
  assert.throws(()=>bmiBsa({height:v,weight:80}),undefined,String(v));
 }
 for(const v of [0,-1,NaN,Infinity,null,'80',19,351]){
  assert.throws(()=>bmiBsa({height:180,weight:v}),undefined,String(v));
 }
});
test('BMI rejects unknown units and missing objects',()=>{
 assert.throws(()=>bmiBsa());
 assert.throws(()=>bmiBsa({height:180,weight:80,heightUnit:'ft'}));
 assert.throws(()=>bmiBsa({height:180,weight:80,weightUnit:'stone'}));
});
test('BMI accepts supported adult boundaries',()=>{
 for(const h of [90,250])for(const w of [20,350]){
  const x=bmiBsa({height:h,weight:w});assert.ok(x.bmi>0);assert.ok(x.bsa>0);
 }
});
test('Respiration: 9 breaths in 30 s = 18/min',()=>{
 assert.deepEqual(respiratoryRate(9,30),{count:9,duration:30,rate:18,estimated:true,transferable:true});
});
test('Respiration: full 60 s counted without estimation',()=>{
 const x=respiratoryRate(22,60);
 assert.equal(x.rate,22);assert.equal(x.estimated,false);assert.equal(x.transferable,true);
});
test('Respiration: short durations 15 / 30 seconds extrapolate correctly',()=>{
 assert.equal(respiratoryRate(4,15).rate,16);
 assert.equal(respiratoryRate(8,30).rate,16);
});
test('Respiration: zero or implausibly high rates not transferred into NEWS2',()=>{
 assert.equal(respiratoryRate(0,15).transferable,false);
 assert.equal(respiratoryRate(50,15).transferable,false);
 assert.equal(respiratoryRate(150,60).transferable,true);
 assert.equal(respiratoryRate(151,60).transferable,false);
});
test('Respiration: invalid count or timing rejected',()=>{
 for(const c of [-1,181,1.5,NaN,Infinity,'9',null,undefined]){
  assert.throws(()=>respiratoryRate(c,30),undefined,String(c));
 }
 for(const t of [0,10,20,45,120,'30',undefined]){
  assert.throws(()=>respiratoryRate(9,t),undefined,String(t));
 }
});
