'use strict';
// AI-pasienten (beta): casefilen, fasiten og at nøkkelen aldri ligger i nettsiden.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Scoring=require('../assets/scoring.js');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const load=()=>import('../assets/ai/randi.mjs');

const asNews=v=>({rr:v.rr,spo2:v.spo2,sbp:v.sbp,hr:v.hr,temp:v.temp,conscious:v.avpu,confusion:false,oxygen:false,scale:1});

test('NEWS2 in the answer key matches Kartlegg\'s own calculator before and after worsening',async()=>{
 const {randi}=await load();
 assert.equal(Scoring.news2(asNews(randi.vitals.before)).total,randi.news2.before);
 assert.equal(Scoring.news2(asNews(randi.vitals.after)).total,randi.news2.after);
 assert.ok(randi.news2.before<=2,'the lesson is that a low NEWS2 does not rule out MI');
});
test('every role, contact, trap and debrief item refers to something that exists',async()=>{
 const {randi,cases}=await load();
 assert.equal(cases[randi.id],randi);
 for(const c of randi.contacts)assert.ok(randi.roles[c.id],c.id);
 assert.ok(randi.roles.patient);
 const actions=new Set(randi.actions.map(a=>a.id));
 for(const d of randi.debrief){
  if(d.not)assert.ok(actions.has(d.not),d.id);
  if(d.call)assert.ok(randi.roles[d.call],d.id);
 }
 assert.ok(randi.actions.some(a=>a.trap&&a.id==='sobril'));
 assert.ok(randi.journal.some(j=>j.key&&/trykk i brystet/.test(j.text)),'the warning sign from last night is in the journal');
 assert.ok(!randi.medication.fixed.concat(randi.medication.prn).some(m=>/nitro/i.test(m.name)),'no nitroglycerin prescribed');
 assert.ok(randi.worsensAt>randi.travel.readFirst);
 for(const d of randi.debrief)assert.ok(d.miss&&d.label,d.id+' has advice for when it is missed');
});
test('every role keeps the AI in character and away from real patients and diagnoses',async()=>{
 const {randi}=await load();
 for(const [id,text] of Object.entries(randi.roles)){
  assert.match(text,/øvingssimulering/,id);
  assert.match(text,/norsk bokmål/,id);
 }
 assert.match(randi.roles.patient,/Fortell aldri studenten hva diagnosen er/);
 assert.match(randi.roles.patient,/Ikke finn på målinger/);
});
test('the AI patient is hidden unless beta is on and a service address is set, and holds no key',()=>{
 const ui=read('assets/ai/ai-sim.mjs'),html=read('index.html');
 assert.match(html,/<script type="module" src="assets\/ai\/ai-sim\.mjs\?v=ai2"><\/script>/);
 assert.match(ui,/const available = \(\) => read\(BETA_KEY\) === '1' && Boolean\(service\(\)\)/);
 assert.match(ui,/const SERVICE = '(https:\/\/[^']+)?';/,'the production address is https or empty');
 assert.match(ui,/Ikke skriv ekte pasientopplysninger/);
 for(const f of ['assets/ai/ai-sim.mjs','assets/ai/randi.mjs','worker/src/index.js','worker/wrangler.toml','index.html'])
  assert.doesNotMatch(read(f),/sk-ant-/,f);
});
test('the service checks login, origin, case, role and size before calling Claude',()=>{
 const w=read('worker/src/index.js');
 assert.match(w,/jwtVerify\(token, JWKS/);
 assert.match(w,/payload\.email_verified !== true/);
 assert.match(w,/env\.DEV_NO_AUTH === '1' && isLocal\(request\.url\)/,'auth bypass only on localhost');
 assert.match(w,/const system = c\?\.roles\?\.\[body\?\.role\]/,'the instruction always comes from the case file');
 assert.match(w,/withinLimit\(env, who\.uid, isLocal\(request\.url\)\)/);
 assert.match(w,/if \(!env\.LIMITS\) return local;/,'no limit store means no answers outside localhost');
 assert.doesNotMatch(w,/console\.log\([^)]*text/,'conversation text is never logged');
 assert.match(read('worker/.gitignore'),/\.dev\.vars/);
});
