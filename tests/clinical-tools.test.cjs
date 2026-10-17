const test=require('node:test');
const assert=require('node:assert/strict');
const {gcs,fourAT,nrs,newsAlert}=require('../assets/clinical-tools.js');

test('GCS – all normal gives E4 V5 M6 = 15',()=>{
 const x=gcs({eyes:4,verbal:5,motor:6});
 assert.deepEqual([x.total,x.report,x.testable],[15,'E4 V5 M6',true]);
});
test('GCS – all minimum gives 3, distinct components preserved',()=>{
 const x=gcs({eyes:1,verbal:1,motor:1});
 assert.equal(x.total,3);assert.equal(x.report,'E1 V1 M1');
});
test('GCS – 120 numeric E/V/M combinations',()=>{
 for(let e=1;e<=4;e++)for(let v=1;v<=5;v++)for(let m=1;m<=6;m++)
  assert.equal(gcs({eyes:e,verbal:v,motor:m}).total,e+v+m);
});
test('GCS – component NT prevents total; never substitutes 1 or 0',()=>{
 for(const component of ['eyes','verbal','motor']){
  const item={eyes:4,verbal:5,motor:6,[component]:'NT'};
  assert.equal(gcs(item).total,null);assert.equal(gcs(item).testable,false);
 }
});
test('GCS – missing and malformed components fail closed, even alongside NT',()=>{
 for(const value of [undefined,null,0,7,1.5,'4',NaN,Infinity])
  assert.throws(()=>gcs({eyes:value,verbal:5,motor:6}));
 assert.throws(()=>gcs({eyes:'NT',verbal:undefined,motor:6}));
 assert.throws(()=>gcs({eyes:'NT',verbal:5,motor:7}));
});
test('4AT – normal scores zero, most abnormal scores twelve',()=>{
 assert.equal(fourAT({alertness:0,orientation:0,attention:0,acute:0}).total,0);
 assert.equal(fourAT({alertness:4,orientation:2,attention:2,acute:4}).total,12);
});
test('4AT – item-specific criteria and diagnosis limitations',()=>{
 const b={alertness:0,orientation:0,attention:0,acute:0};
 assert.equal(fourAT({...b,alertness:4}).total,4);
 assert.equal(fourAT({...b,orientation:1}).total,1);
 assert.equal(fourAT({...b,orientation:2}).total,2);
 assert.equal(fourAT({...b,attention:1}).total,1);
 assert.equal(fourAT({...b,attention:2}).total,2);
 assert.equal(fourAT({...b,acute:4}).total,4);
 assert.match(fourAT({...b,acute:4}).interpretation,/delirium/);
});
test('4AT – every valid combination scores sum',()=>{
 for(const alertness of [0,4])for(const orientation of [0,1,2])
 for(const attention of [0,1,2])for(const acute of [0,4]){
  const s=fourAT({alertness,orientation,attention,acute});
  assert.equal(s.total,alertness+orientation+attention+acute);
 }
});
test('4AT – missing invalid fields never become zero',()=>{
 const b={alertness:0,orientation:0,attention:0,acute:0};
 for(const key of Object.keys(b)){
  for(const value of [undefined,null,'0',-1,3,NaN]){
   assert.throws(()=>fourAT({...b,[key]:value}),undefined,key+'='+value);
  }
 }
});
test('NRS – every integer 0–10 is accepted',()=>{
 for(let i=0;i<=10;i++)assert.equal(nrs(i).total,i);
});
test('NRS – missing/non-self-reportable values are not inferred',()=>{
 for(const v of [undefined,null,-1,11,1.5,'5',NaN,Infinity])assert.throws(()=>nrs(v));
});
function news(parts){return {parts,total:Object.values(parts).reduce((a,b)=>a+b,0)}}
const zero=()=>({rr:0,spo:0,sbp:0,hr:0,temp:0,consciousness:0,oxygen:0});
test('NEWS2 – alert on isolated three points while aggregate is three',()=>{
 for(const key of ['rr','spo','sbp','hr','temp','consciousness']){
  const p=zero();p[key]=3;
  const r=newsAlert(news(p));
  assert.equal(r.level,'red',key);
  assert.equal(r.redParameters.length,1);
  assert.match(r.explanation,/ansvarlig sykepleier/);
  assert.match(r.explanation,/legekontakt/);
 }
});
test('NEWS2 – score 5 or greater supersedes single red score',()=>{
 let p=zero();p.rr=3;p.hr=2;
 let r=newsAlert(news(p));assert.equal(r.level,'urgent');assert.deepEqual(r.redParameters,['Respirasjonsfrekvens']);
 p.hr=3;p.spo=1;
 r=newsAlert(news(p));assert.equal(r.level,'emergency');
});
test('NEWS2 – routine and watch levels',()=>{
 assert.equal(newsAlert(news(zero())).level,'routine');
 const p=zero();p.rr=1;assert.equal(newsAlert(news(p)).level,'watch');
});
test('NEWS2 – rejects incomplete, mismatched and tampered point totals',()=>{
 assert.throws(()=>newsAlert({total:0,parts:{rr:0}}));
 assert.throws(()=>newsAlert({total:0,parts:{...zero(),rr:3}}));
 assert.throws(()=>newsAlert({total:0,parts:{...zero(),oxygen:3}}));
 assert.throws(()=>newsAlert(null));
});
