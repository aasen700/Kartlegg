'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const T=require('../assets/homecare-v09-scoring.js');

test('MST no weight loss and normal intake = 0',()=>assert.deepEqual(T.mst('no',false),{weightPoints:0,intakePoints:0,total:0,atRisk:false}));
test('MST unknown weight loss yields 2 and risk',()=>{for(const key of ['unknown','kgUnknown']){const x=T.mst(key,false);assert.equal(x.total,2);assert.equal(x.atRisk,true)}});
test('MST maps all weight-loss categories correctly',()=>{
 for(const [key,n] of [['kg1to5',1],['kg6to10',2],['kg11to15',3],['kgOver15',4]])assert.equal(T.mst(key,false).weightPoints,n);
});
test('MST reduced intake adds one point',()=>{
 const x=T.mst('kg1to5',true);assert.equal(x.intakePoints,1);assert.equal(x.total,2);assert.equal(x.atRisk,true);
});
test('MST reduced intake alone below cut-off',()=>assert.equal(T.mst('no',true).atRisk,false));
test('MST rejects unknown or incomplete answers',()=>{
 for(const w of ['',null,undefined,'5-15','__proto__'])assert.throws(()=>T.mst(w,true));
 for(const f of [null,undefined,'yes',1,0])assert.throws(()=>T.mst('no',f));
});
test('Orthostatic supine to standing fall threshold at 20 systolic',()=>{
 const x=T.orthostatic({supine:{sys:130,dia:85},standing1:{sys:110,dia:80}});
 assert.equal(x.readings.minute1.systolicDrop,20);assert.equal(x.readings.minute1.diastolicDrop,5);
 assert.equal(x.readings.minute1.thresholdMet,true);assert.equal(x.anyThreshold,true);
});
test('Orthostatic diastolic threshold 10 independently',()=>{
 const x=T.orthostatic({supine:{sys:128,dia:90},standing3:{sys:125,dia:80}});
 assert.equal(x.readings.minute3.diastolicDrop,10);assert.equal(x.anyThreshold,true);
});
test('Orthostatic no threshold: small drops and BP rises',()=>{
 const x=T.orthostatic({supine:{sys:130,dia:85},standing1:{sys:115,dia:80},standing3:{sys:138,dia:86}});
 assert.equal(x.anyThreshold,false);assert.equal(x.readings.minute3.systolicDrop,-8);
});
test('Orthostatic two standing measurements keep 1- and 3-min separate',()=>{
 const x=T.orthostatic({supine:{sys:130,dia:80},standing1:{sys:120,dia:75},standing3:{sys:108,dia:74}});
 assert.equal(x.readings.minute1.thresholdMet,false);assert.equal(x.readings.minute3.thresholdMet,true);
});
test('Orthostatic rejects missing baseline, missing standing and invalid pair',()=>{
 assert.throws(()=>T.orthostatic());
 assert.throws(()=>T.orthostatic({supine:{sys:120,dia:80}}));
 assert.throws(()=>T.orthostatic({supine:{sys:120,dia:80},standing1:{sys:70,dia:75}}));
 assert.throws(()=>T.orthostatic({supine:{sys:120,dia:80},standing1:{sys:120.5,dia:75}}));
 assert.throws(()=>T.orthostatic({supine:{sys:120,dia:80},standing1:{sys:0,dia:75}}));
});
test('TUG >15s indicator is strictly above 15s',()=>{
 assert.equal(T.tug(15).over15,false);
 assert.equal(T.tug(15.1).over15,true);
 assert.equal(T.tug(12.4).over15,false);
});
test('TUG rejects impossible/missing times',()=>{
 for(const v of [0,-1,NaN,Infinity,601,'17',null,undefined])assert.throws(()=>T.tug(v));
});
test('ESAS-r validated dimensions exactly nine and no synthetic total',()=>{
 assert.equal(T.standardSymptoms.length,9);
 const vals=Object.fromEntries(T.standardSymptoms.map((key,i)=>[key,i]));
 const result=T.esas(vals);
 assert.equal(Object.keys(result).length,9);
 assert.equal(result.smerte,0);assert.equal(result.velvaere,8);
 assert.equal(Object.prototype.hasOwnProperty.call(result,'total'),false);
});
test('ESAS-r accepts 0 and 10 on all mandatory dimensions',()=>{
 for(const score of [0,10]){const vals=Object.fromEntries(T.standardSymptoms.map(key=>[key,score]));assert.doesNotThrow(()=>T.esas(vals))}
});
test('ESAS-r optional other symptom requires valid label',()=>{
 const vals=Object.fromEntries(T.standardSymptoms.map(key=>[key,5]));
 assert.equal(T.esas({...vals,other:9,otherName:'Forstoppelse'}).other,9);
 assert.throws(()=>T.esas({...vals,other:9}));
 assert.throws(()=>T.esas({...vals,other:9,otherName:'  '}));
 assert.throws(()=>T.esas({...vals,other:11,otherName:'Hoste'}));
});
test('ESAS-r rejects incomplete or noninteger mandatory values',()=>{
 const vals=Object.fromEntries(T.standardSymptoms.map(key=>[key,5]));
 for(const val of [null,undefined,-1,11,2.5,NaN,'5'])assert.throws(()=>T.esas({...vals,kvalme:val}));
 assert.throws(()=>T.esas(null));
});
