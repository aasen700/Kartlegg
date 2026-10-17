'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {estimate,ruler}=require('../assets/wound-v091-scoring.js');

test('TIMES: length × width bounding rectangle in cm²',()=>{
 assert.equal(estimate({lengthMm:20,widthMm:30}).rectangleCm2,6);
 assert.equal(estimate({lengthMm:8,widthMm:12}).rectangleCm2,0.96);
});
test('TIMES: depth is accepted but does not change rectangle approximation',()=>{
 const x=estimate({lengthMm:10,widthMm:20,depthMm:4});
 assert.equal(x.depthMm,4);assert.equal(x.rectangleCm2,2);
});
test('TIMES: zero depth is permitted',()=>{
 assert.equal(estimate({lengthMm:10,widthMm:10,depthMm:0}).depthMm,0);
});
test('TIMES: missing, invalid or extreme length and width rejected',()=>{
 for(const bad of [null,undefined,-2,0,NaN,Infinity,1001,'20']){
  assert.throws(()=>estimate({lengthMm:bad,widthMm:10}),undefined,String(bad));
  assert.throws(()=>estimate({lengthMm:10,widthMm:bad}),undefined,String(bad));
 }
});
test('TIMES: negative, impossible or nonnumeric depth rejected',()=>{
 for(const bad of [-1,1001,NaN,Infinity,'5'])assert.throws(()=>estimate({lengthMm:20,widthMm:15,depthMm:bad}));
});
test('Ruler: default bankcard reference is 85.60 mm',()=>{
 const x=ruler({referencePixels:256.8});
 assert.equal(x.referenceMm,85.6);
 assert.ok(Math.abs(x.pxPerMm-3)<1e-9);
 assert.ok(Math.abs(x.pxPerCm-30)<1e-9);
});
test('Ruler: factor follows user calibration',()=>{
 const x=ruler({referencePixels:171.2});assert.ok(Math.abs(x.pxPerMm-2)<1e-9);
 assert.ok(Math.abs(x.pxPerCm*8-160)<1e-9);
});
test('Ruler: disallow uncalibrated / implausible reference lengths',()=>{
 for(const bad of [0,79,1001,-20,Infinity,NaN,null,'280']){
  assert.throws(()=>ruler({referencePixels:bad}));
 }
 assert.throws(()=>ruler({referencePixels:280,referenceMm:100}));
});

test('Ruler: upright bankcard uses physical height 85.60 mm and width 53.98 mm',()=>{
 const x=ruler({referencePixels:300});
 assert.equal(x.orientation,'portrait');
 assert.equal(x.portraitHeightPixels,300);
 assert.equal(x.portraitWidthPixels,189);
 assert.ok(x.portraitHeightPixels>x.portraitWidthPixels);
});
