'use strict';
// Innloggingsvakten: hvilke sider som vises, og retur til ønsket side etter innlogging.
const test=require('node:test');const assert=require('node:assert/strict');
const {createGate,PUBLIC,OPEN}=require('../assets/auth-gate.js');
const session=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};

test('public pages are the front page, About, login and the two legal pages',()=>{
 assert.deepEqual([...PUBLIC].sort(),['konto','om','personvern','start','vilkar']);
});
test('assessment and clinical tools are open to everyone, because they compute locally and store nothing',()=>{
 assert.deepEqual([...OPEN].sort(),['verktoy','vurdering']);
 for(const state of ['guest','verify','consent']){
  const g=createGate({storage:session()});g.setState(state);
  for(const page of OPEN)assert.equal(g.resolve(page),page,state+' '+page);
  assert.equal(g.returnTo,'','open pages are not remembered as a return target');
 }
});
test('a guest is sent to login from every protected page, with a reason',()=>{
 const g=createGate({storage:session()});g.setState('guest');
 for(const page of ['historikk','laer','simulering','profil']){
  assert.equal(g.resolve(page),'konto',page);assert.ok(g.reason,page);
 }
 for(const page of PUBLIC)assert.equal(g.resolve(page),page);
});
test('after login the user returns to the page they wanted',()=>{
 const g=createGate({storage:session()});g.setState('guest');
 assert.equal(g.resolve('laer'),'konto');
 g.setState('member','uid-1');
 assert.equal(g.resolve('konto'),'laer');
 assert.equal(g.resolve('konto'),'vurdering','the return target is used once');
 assert.equal(g.resolve('start'),'vurdering','members skip the public front page');
});
test('unverified e-mail or missing confirmations keep protected pages closed',()=>{
 for(const state of ['verify','consent']){
  const g=createGate({storage:session()});g.setState(state);
  assert.equal(g.resolve('laer'),'konto',state);assert.equal(g.owner,null,state);
 }
});
test('while Firebase checks the session nothing is redirected (the page is hidden by a loader)',()=>{
 const g=createGate({storage:session()});
 assert.equal(g.state,'checking');assert.equal(g.resolve('verktoy'),'verktoy');
});
test('whenReady waits only until the login state is known (used by shared tool links)',async()=>{
 const g=createGate({storage:session()});
 let state=null;const p=g.whenReady().then(s=>state=s);
 await Promise.resolve();assert.equal(state,null);
 g.setState('guest');await p;assert.equal(state,'guest');
 assert.equal(await g.whenReady(),'guest');
});
test('whenMember waits for login',async()=>{
 const g=createGate({storage:session()});g.setState('guest');
 let done=false;const p=g.whenMember().then(()=>done=true);
 await Promise.resolve();assert.equal(done,false);
 g.setState('member','u');await p;assert.equal(done,true);
});
test('logging in from Profil lands on the front page with NEWS2',()=>{
 const g=createGate({storage:session()});g.setState('guest');
 assert.equal(g.resolve('profil'),'konto');
 g.setState('member','u');
 assert.equal(g.resolve('konto'),'vurdering');
});
