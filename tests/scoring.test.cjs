const test=require('node:test');
const assert=require('node:assert/strict');
const {news2,qsofa}=require('../assets/scoring.js');
const base={rr:16,spo2:98,sbp:120,hr:80,temp:37,conscious:'A',confusion:false,oxygen:false,scale:1,gcs:15};
test('baseline',()=>{assert.equal(news2(base).total,0);assert.equal(qsofa(base).total,0)});
for(const [key,rows] of Object.entries({
rr:[[8,3],[9,1],[11,1],[12,0],[20,0],[21,2],[24,2],[25,3]],
spo2:[[91,3],[92,2],[93,2],[94,1],[95,1],[96,0]],
sbp:[[90,3],[91,2],[100,2],[101,1],[110,1],[111,0],[219,0],[220,3]],
hr:[[40,3],[41,1],[50,1],[51,0],[90,0],[91,1],[110,1],[111,2],[130,2],[131,3]],
temp:[[35,3],[35.1,1],[36,1],[36.1,0],[38,0],[38.1,1],[39,1],[39.1,2]]
}))for(const [value,point] of rows)test(key+' '+value,()=>assert.equal(news2({...base,[key]:value}).parts[key==='spo2'?'spo':key],point));
for(const [value,oxygen,point] of [[83,false,3],[84,false,2],[86,false,1],[88,false,0],[92,false,0],[93,false,0],[97,false,0],[92,true,0],[93,true,1],[94,true,1],[95,true,2],[96,true,2],[97,true,3]])test('scale2 '+value+' '+oxygen,()=>assert.equal(news2({...base,scale:2,spo2:value,oxygen}).parts.spo,point));
test('supplemental oxygen',()=>assert.equal(news2({...base,oxygen:true}).parts.oxygen,2));
test('confusion and AVPU do not double count',()=>assert.equal(news2({...base,confusion:true,conscious:'V'}).parts.consciousness,3));
test('separate GCS required',()=>assert.equal(qsofa({...base,gcs:null}),null));
test('qSOFA thresholds inclusive',()=>assert.equal(qsofa({...base,rr:22,sbp:100,gcs:14}).total,3));
test('qSOFA just outside thresholds',()=>assert.equal(qsofa({...base,rr:21,sbp:101,gcs:15}).total,0));
test('NEWS2 max',()=>assert.equal(news2({rr:5,spo2:70,sbp:80,hr:20,temp:34,conscious:'U',confusion:true,oxygen:true,scale:1}).total,20));
