const css=require('./css-helper.cjs');
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newsAlert}=require('../assets/clinical-tools.js');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const zero=()=>({rr:0,spo:0,sbp:0,hr:0,temp:0,consciousness:0,oxygen:0});
const news=parts=>({parts,total:Object.values(parts).reduce((a,b)=>a+b,0)});

test('NEWS2 result card exposes every official aggregate band and the single-red trigger',()=>{
 const html=read('index.html');
 for(const id of ['newsMeter','newsMeterMarker','newsMeterLabel','newsRedTrigger','qMeter','qMeterMarker','qMeterLabel'])assert.match(html,new RegExp(`id="${id}"`));
 for(const label of ['0','1–4','5–6','≥7','12 t','4–6 t','≥ hver time','kontinuerlig'])assert.ok(html.includes(label),label);
 assert.match(html,/3 i én parameter/);
 assert.match(html,/RCPs responsnivåer for sykehus/);
});

test('NEWS2 official guidance covers routine, low, single-red, medium and high responses',()=>{
 const routine=newsAlert(news(zero()));
 assert.match(routine.explanation,/12\. time/);
 const lowParts=zero();lowParts.rr=1;
 assert.match(newsAlert(news(lowParts)).explanation,/4\.–6\. time/);
 const redParts=zero();redParts.rr=3;
 assert.match(newsAlert(news(redParts)).explanation,/timevis/);
 const mediumParts=zero();mediumParts.rr=3;mediumParts.hr=2;
 assert.match(newsAlert(news(mediumParts)).explanation,/60 minutter/);
 const highParts=zero();highParts.rr=3;highParts.hr=3;highParts.spo=1;
 const high=newsAlert(news(highParts));
 assert.match(high.explanation,/30 minutter/);
 assert.match(high.notes,/kommunehelsetjenesten/);
});

test('score meters use moving markers and preserve qSOFA as a criterion count',()=>{
 const app=read('assets/app.js'),styles=css.all(),html=read('index.html');
 assert.match(app,/function newsMeterPosition/);
 assert.match(app,/updateNewsMeter\(news\);updateQMeter\(q\)/);
 assert.match(styles,/transition:left/);
 assert.match(styles,/prefers-reduced-motion:reduce/);
 assert.match(html,/qSOFA har ikke egne NEWS2-lignende eskaleringsfarger/);
 assert.match(html,/Ved ≥2: undersøk organdysfunksjon/);
});
