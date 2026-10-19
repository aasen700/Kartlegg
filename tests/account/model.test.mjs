import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {settings,documentData,validDocument,reconcile,errorMessage,TOOL_IDS,canonical} from '../../assets/account/model.mjs';
test('cloud builder excludes clinical and arbitrary keys at every level',()=>{
 const d=documentData({password:'never',measurements:[{hr:160}],isbar:'patient',profile:{name:'Anna',role:'Spl',work:'Kommune',department:'Sone',patientId:'123'},favorites:['news2','patient','gcs','news2',4],appearance:{mode:'dark',hr:160},history:'x'},1,'server');
 assert.deepEqual(Object.keys(d).sort(),['revision','schemaVersion','settings','state','updatedAt']);
 assert.deepEqual(d.settings.profile,{name:'Anna',role:'Spl',work:'Kommune',department:'Sone'});
 assert.deepEqual(d.settings.favorites,['news2','gcs']);assert.equal(JSON.stringify(d).includes('patient'),false);
});
test('profile limits, hostile types and enum allowlists',()=>{
 const d=settings({profile:{name:'x'.repeat(200),role:44,work:null,department:{}},favorites:[{},null],appearance:{mode:'evil',season:'christmas',base:'philip'}});
 assert.equal(d.profile.name.length,120);assert.equal(d.profile.role,'');assert.equal(d.appearance.mode,'system');assert.equal(d.appearance.season,'christmas');assert.deepEqual(d.favorites,[]);
});
test('Firestore map ordering does not invalidate a valid document',()=>{
 const d=documentData(settings(),1,null);const reordered=JSON.parse(canonical(d));assert.ok(validDocument(reordered));
 reordered.settings.secret='no';assert.equal(validDocument(reordered),false);
});
test('reconciliation distinguishes unchanged, unilateral and concurrent changes',()=>{
 const b=settings(),l=settings({profile:{name:'local'}}),r=settings({profile:{name:'remote'}});
 assert.equal(reconcile(b,b,r),'remote');assert.equal(reconcile(b,l,b),'local');assert.equal(reconcile(b,l,r),'conflict');assert.equal(reconcile(b,r,r),'equal');assert.equal(reconcile(null,l,r),'conflict');
});
test('tool IDs match the existing registry',async()=>{
 const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);const registry=require('../../assets/tool-registry.js');assert.deepEqual(TOOL_IDS,registry.all.map(x=>x.id));
});
test('Norwegian messages avoid raw SDK errors and account enumeration in reset',()=>{
 assert.match(errorMessage({code:'auth/invalid-credential'}),/Innloggingen/);assert.match(errorMessage({code:'permission-denied'}),/Lokale/);assert.equal(errorMessage({message:'secret credential'}).includes('secret'),false);
});
test('runtime is limited to Auth and Firestore with a memory-only database cache',()=>{
 const src=fs.readFileSync(new URL('../../assets/account/firebase.mjs',import.meta.url),'utf8');assert.match(src,/memoryLocalCache/);assert.doesNotMatch(src,/getAnalytics|persistentLocalCache|localStorage|serviceAccount|adminSDK/);
});
