const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {news2,qsofa} = require('../assets/scoring.js');

const base=Object.freeze({rr:16,spo2:98,sbp:120,hr:80,temp:37,conscious:'A',confusion:false,oxygen:false,scale:1,gcs:15});
const score=(delta={})=>news2({...base,...delta});

test('NEWS2 normal scenario totals 0 and all 7 components are present',()=>{
  const result=score();
  assert.equal(result.total,0);
  assert.deepEqual(Object.keys(result.parts),['rr','spo','sbp','hr','temp','consciousness','oxygen']);
});
test('NEWS2 3 points for single physiological parameter is never discarded',()=>{
  assert.deepEqual(score({rr:8}).parts.rr,3);
  assert.equal(score({rr:8}).total,3);
  assert.equal(score({spo2:91}).total,3);
});
test('NEWS2 Scale 2 score depends on supplemental oxygen above 92%',()=>{
 for(const [sat,air,oxygen] of [[92,0,0],[93,0,1],[94,0,1],[95,0,2],[96,0,2],[97,0,3]]){
   assert.equal(score({scale:2,spo2:sat,oxygen:false}).parts.spo,air,'air '+sat);
   assert.equal(score({scale:2,spo2:sat,oxygen:true}).parts.spo,oxygen,'O2 '+sat);
 }
});
test('NEWS2 both oxygen sources and AVPU/new confusion are not double counted',()=>{
 const s=score({oxygen:true,conscious:'V',confusion:true});
 assert.equal(s.parts.oxygen,2); assert.equal(s.parts.consciousness,3); assert.equal(s.total,5);
});
test('NEWS2 outputs match multiple independent known observation scenarios',()=>{
 const observations=[
  [{rr:24,spo2:92,sbp:100,hr:110,temp:38.5},8],
  [{rr:21,spo2:95,sbp:110,hr:130,temp:39.1,confusion:true},11],
  [{rr:12,spo2:97,sbp:111,hr:90,temp:36.1},0],
  [{rr:22,spo2:88,sbp:96,hr:131,temp:39.5,conscious:'V',oxygen:true},17]
 ];
 for(const [params,expected] of observations) assert.equal(score(params).total,expected,JSON.stringify(params));
});
test('NEWS2 refuses missing, nonnumeric and physiologically invalid observations',()=>{
 const cases=[
  null,{}, {rr:NaN},{rr:Infinity},{rr:'18'},{rr:0},{rr:151},
  {spo2:null},{spo2:'96'},{spo2:0},{spo2:101},
  {sbp:0},{sbp:351},{hr:-1},{hr:301},
  {temp:24.9},{temp:45.1},{temp:39.05},{temp:38.15},
  {conscious:'unknown'},{confusion:null},{oxygen:'no'},{scale:0},{scale:3}
 ];
 for(const change of cases){
   if(change===null) assert.throws(()=>news2(null));
   else if(Object.keys(change).length===0) assert.throws(()=>news2({}));
   else assert.throws(()=>news2({...base,...change}),undefined,JSON.stringify(change));
 }
});
test('NEWS2 accepts a valid one-decimal temperature at boundaries',()=>{
 for(const t of [25,35,35.1,36,36.1,38,38.1,39,39.1,45]) assert.doesNotThrow(()=>score({temp:t}));
});
test('qSOFA requires separately measured GCS and never derives it from AVPU',()=>{
 assert.equal(qsofa({...base,gcs:null}),null);
 assert.equal(qsofa({...base,gcs:undefined}),null);
 assert.equal(qsofa({...base,conscious:'U',gcs:15}).parts.mentation,0);
 assert.equal(qsofa({...base,conscious:'A',gcs:14}).parts.mentation,1);
});
test('qSOFA each boundary is inclusive as documented',()=>{
 assert.equal(qsofa({rr:21,sbp:101,gcs:15}).total,0);
 assert.equal(qsofa({rr:22,sbp:101,gcs:15}).total,1);
 assert.equal(qsofa({rr:21,sbp:100,gcs:15}).total,1);
 assert.equal(qsofa({rr:21,sbp:101,gcs:14}).total,1);
 assert.equal(qsofa({rr:22,sbp:100,gcs:14}).total,3);
});
test('qSOFA rejects missing RR/BP, improper type or invalid GCS',()=>{
 const candidates=[
  {rr:NaN,sbp:110,gcs:15},{rr:'22',sbp:110,gcs:15},
  {rr:0,sbp:110,gcs:15},{rr:151,sbp:110,gcs:15},
  {rr:22,sbp:0,gcs:15},{rr:22,sbp:351,gcs:15},
  {rr:22,sbp:110,gcs:2},{rr:22,sbp:110,gcs:16},
  {rr:22,sbp:110,gcs:14.5},{rr:22,sbp:110,gcs:'14'},
 ];
 for(const c of candidates) assert.throws(()=>qsofa(c),undefined,JSON.stringify(c));
});
test('No persistent recording of vital parameters via browser storage or fetch',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../assets/app.js'),'utf8');
 assert.match(source,/const measurements\s*=\s*\[\]/);
 assert.doesNotMatch(source,/(localStorage|sessionStorage|indexedDB)\.setItem\s*\(\s*['"`]?(measurements|vitals|patient)/i);
 assert.doesNotMatch(source,/fetch\s*\(/);
});
