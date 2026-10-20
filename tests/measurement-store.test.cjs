'use strict';
// «Målinger over tid»: lokal lagring i høyst 24 timer, bare tall og faste valg, per bruker.
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {createStore,KEY,MAX_AGE,ownerKey}=require('../assets/measurement-store.js');
const memory=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),raw:m}};
const item=(extra={})=>({savedAt:0,date:'2026-10-20',time:'08:00',v:{rr:22,spo2:95,sbp:110,hr:95,temp:37.2,gcs:null,conscious:'A',oxygen:false,scale:1,confusion:false},...extra});

test('measurements expire after 24 hours',()=>{
 let now=1_000_000;const s=memory(),store=createStore(s,()=>now);
 store.save('u1',[item({savedAt:now})]);
 now+=MAX_AGE-1;assert.equal(store.load('u1').length,1);
 now+=2;assert.equal(store.load('u1').length,0);
 assert.equal(s.getItem(KEY),null,'expired data is removed from storage, not just hidden');
});
test('only known numeric fields are stored; names, ids and free text are dropped',()=>{
 const s=memory(),store=createStore(s,()=>5);
 store.save('u1',[item({savedAt:5,name:'Kari Nordmann',note:'fritekst',v:{...item().v,patientId:'12345678901'}})]);
 const raw=s.getItem(KEY);
 assert.doesNotMatch(raw,/Kari|fritekst|12345678901|patientId|name|note/);
 assert.deepEqual(Object.keys(JSON.parse(raw).items[0]).sort(),['date','iso','savedAt','time','v']);
});
test('invalid values are rejected instead of stored',()=>{
 const s=memory(),store=createStore(s,()=>5);
 store.save('u1',[item({savedAt:5,v:{...item().v,rr:'22'}}),item({savedAt:5,date:'20.10.2026'})]);
 assert.equal(store.load('u1').length,0);
});
test('another user on the same device cannot load the measurements, and the uid is not stored in clear text',()=>{
 const s=memory(),store=createStore(s,()=>5);
 store.save('user-a',[item({savedAt:5})]);
 assert.equal(store.load('user-b').length,0);
 assert.doesNotMatch(s.getItem(KEY),/user-a/);
 assert.equal(JSON.parse(s.getItem(KEY)).owner,ownerKey('user-a'));
});
test('clearAll removes everything (used at logout and when nobody is signed in)',()=>{
 const s=memory(),store=createStore(s,()=>5);
 store.save('u1',[item({savedAt:5})]);store.clearAll();
 assert.equal(s.getItem(KEY),null);
});
test('at most 48 measurements and nothing without a signed-in user',()=>{
 const s=memory(),store=createStore(s,()=>5);
 assert.equal(store.save('',[item({savedAt:5})]),false);
 store.save('u1',Array.from({length:60},(_,i)=>item({savedAt:5,time:String(i%24).padStart(2,'0')+':'+String(i%60).padStart(2,'0')})));
 assert.equal(store.load('u1').length,48);
});
test('the store never talks to a server',()=>{
 const src=fs.readFileSync(path.join(__dirname,'../assets/measurement-store.js'),'utf8');
 assert.doesNotMatch(src,/fetch\s*\(|XMLHttpRequest|sendBeacon|new WebSocket|gstatic\.com|getFirestore|import\s*\(/);
});
