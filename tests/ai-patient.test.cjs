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
 assert.match(html,/<script type="module" src="assets\/ai\/ai-sim\.mjs\?v=ai6"><\/script>/);
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
 assert.match(w,/const over = await limit\(env, who\.uid, isLocal\(request\.url\)\);/);
 assert.doesNotMatch(w,/console\.log\([^)]*text/,'conversation text is never logged');
 assert.match(read('worker/.gitignore'),/\.dev\.vars/);
});
test('beta code unlocks the AI patient per browser, and focus mode covers the screen on phones',()=>{
 const ui=read('assets/ai/ai-sim.mjs'),sim=read('assets/simulation-ui.js'),css=read('assets/css/07-simulation.css');
 assert.doesNotMatch(ui,/BETA_CODE/,'the beta code is checked by the service and never shipped in the page');
 assert.match(ui,/'\/beta', \{ method: 'POST'/);
 assert.match(ui,/write\(BETA_KEY, '1'\)/);
 assert.match(sim,/await AI\(\)\.unlock\(input\.value\)/);
 assert.match(ui,/document\.documentElement\.classList\.toggle\('ai-focus'/);
 assert.match(ui,/host = h\('div', 'ai-focus-host'\); document\.body\.append\(host\)/,'focus mode renders outside cards that could trap position: fixed');
 assert.match(css,/html\.ai-focus \.mobile-primary-nav \{ display: none !important; \}/);
 assert.match(css,/height: var\(--visible-height, 100dvh\)/);
});
test('phone calls can insert address, measured values and medication without sending',async()=>{
 const ui=read('assets/ai/ai-sim.mjs');
 const {randi}=await import('../assets/ai/randi.mjs');
 assert.ok(randi.patient.address);
 assert.match(randi.roles.patient,new RegExp(randi.patient.address.split(',')[0]));
 assert.match(ui,/\['Adresse', /);
 assert.match(ui,/MEASURES\.filter\(\(\[k\]\) => S\.measured\[k\]\)/,'only values the student actually measured');
 assert.match(ui,/function insert\(text\) \{[\s\S]*?ta\.value = /);
 assert.doesNotMatch(ui.match(/function insert\(text\) \{[\s\S]*?\n\}/)[0],/send\(/);
});
test('focus mode hides the page behind it and keeps the chat at the latest message',()=>{
 const ui=read('assets/ai/ai-sim.mjs'),css=read('assets/css/07-simulation.css');
 assert.match(css,/html\.ai-focus body > :not\(\.ai-focus-host\) \{ display: none !important; \}/);
 assert.match(css,/html\.ai-focus\.keyboard-open \.ai-chips:not\(:has\(\.ai-insert\)\) \{ display: none; \}/);
 assert.match(ui,/visualViewport\?\.addEventListener\('resize', keepAtBottom\)/);
 assert.match(ui,/stick = log\.scrollHeight - log\.scrollTop - log\.clientHeight < 48/);
});
test('the service lets in the owner list or a correct beta code, and fails closed without a counter',()=>{
 const w=read('worker/src/index.js'),toml=read('worker/wrangler.toml');
 assert.match(w,/list\(env\.ALLOWED_UIDS\)\.includes\(who\.uid\)/);
 assert.match(w,/env\.BETA_CODE && code && await sameText\(code, env\.BETA_CODE\)/);
 assert.doesNotMatch(toml,/^BETA_CODE\s*=/m,'the beta code is a secret, not a var');
 assert.match(w,/if \(!env\.LIMITS\) return local \? null : 'busy';/);
 assert.match(w,/catch \(_\) \{\n  return 'busy';/);
 for(const p of ['/chat','/debrief','/beta'])assert.ok(w.includes("path === '"+p+"'"),p);
});
test('AI feedback reads the whole case, keeps the score from the answer key, and is labelled',async()=>{
 const w=read('worker/src/build.js'),ui=read('assets/ai/ai-sim.mjs');
 const {randi}=await import('../assets/ai/randi.mjs');
 assert.match(randi.debriefGuide,/Finn aldri på noe studenten sa eller gjorde/);
 assert.match(w,/system: c\.debriefGuide/,'the grading instruction comes from the case file');
 assert.match(w,/format: \{ type: 'json_schema', schema: debriefSchema\(c\) \}/);
 assert.match(w,/enum: guessIds/,'the AI may only correct keyword-based checks');
 assert.match(ui,/const ai = guess \? S\.ai\?\.data\?\.checks/);
 assert.match(ui,/'Kommentar fra AI'\), h\('span', 'ai-muted', 'Kan ta feil'\)/);
});
test('chat and feedback use separate, configurable models with no automatic fallback',async()=>{
 const b=read('worker/src/build.js'),w=read('worker/src/index.js'),toml=read('worker/wrangler.toml');
 assert.match(toml,/^CHAT_MODEL = "claude-haiku-5-5"$/m);
 assert.match(toml,/^DEBRIEF_MODEL = "claude-sonnet-5-5"$/m);
 assert.doesNotMatch(toml,/^MODEL = /m);
 assert.match(b,/model: setting\(env, 'CHAT_MODEL'\)/);
 assert.match(b,/model: setting\(env, 'DEBRIEF_MODEL'\)/);
 for(const src of [b,w]){assert.doesNotMatch(src,/fallbacks|server-side-fallback/);assert.doesNotMatch(src,/temperature|top_p|top_k|budget_tokens/)}
 assert.match(w,/client\.messages\.stream\(chatParams\(env, system, messages\)\)/);
 assert.match(w,/client\.messages\.create\(debriefParams\(env, c, text\)\)/);
 assert.match(w,/console\.log\(usageLine\('chat:' \+ body\.role, final\)\)/);
 assert.match(w,/console\.log\(usageLine\('debrief', r\)\)/);
 assert.doesNotMatch(b.match(/export function usageLine[\s\S]*?\n\}/)[0],/content|text/,'the usage log never includes conversation text');
 const m=await import('../worker/src/build.js');
 const chat=m.chatParams({},'x',[{role:'user',content:'hei'}]);
 assert.equal(chat.model,'claude-haiku-5-5');assert.ok(chat.max_tokens>=1024&&chat.max_tokens<=2048);
 const {randi}=await import('../assets/ai/randi.mjs');
 const d=m.debriefParams({},randi,'referat');
 assert.equal(d.model,'claude-sonnet-5-5');assert.ok(d.max_tokens>=8000);
 assert.equal(d.output_config.format.type,'json_schema');assert.equal(d.output_config.format.schema.additionalProperties,false);
});
test('the hidden time/state line is never shown, and Randi only reveals findings when asked',async()=>{
 const ui=read('assets/ai/ai-sim.mjs');
 const {randi}=await import('../assets/ai/randi.mjs');
 assert.match(ui,/const untag = t => /);
 assert.match(ui,/onText\(untag\(text\)\)/);
 for(const [id,text] of Object.entries(randi.roles))assert.match(text,/Ikke gjenta den linjen/,id);
 assert.match(randi.roles.patient,/Ikke nevn utstråling, kvalme, oppkast, svette/);
});
