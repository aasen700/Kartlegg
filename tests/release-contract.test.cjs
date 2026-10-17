'use strict';
// v1.0 release contracts guard key design/security decisions during later refactors.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const html=read('index.html');
const css=read('assets/release-candidate-v10.css');
const app=read('assets/app.js');
test('official v1.0 clearly labelled as demonstration only',()=>{
 assert.match(html,/v1\.0 · Kun demonstrasjon/);
 assert.match(html,/Ikke for reell pasientbehandling/);
});
test('all local stylesheet and script references exist exactly once',()=>{
 const refs=[...html.matchAll(/(?:src|href)="(assets\/[^"?]+)(?:\?[^"]*)?"/g)].map(m=>m[1]);
 assert.equal(refs.length,new Set(refs).size,'duplicate frontend asset');
 refs.forEach(p=>assert.ok(fs.existsSync(path.join(__dirname,'..',p)),p));
});
test('the site contains no third-party JavaScript or analytics beacons',()=>{
 assert.doesNotMatch(html,/<script\b[^>]*src=["']https?:/i);
 assert.doesNotMatch(html,/\b(?:google-analytics|gtag\(|googletagmanager|hotjar|mixpanel|segment\.io)\b/i);
 assert.doesNotMatch(html,/<form\b[^>]*\baction=/i);
});
test('each sidebar navigation route has one page',()=>{
 const routes=[...html.matchAll(/\bdata-page="([^"]+)"/g)].map(m=>m[1]);
 assert.ok(routes.includes('vurdering')&&routes.includes('om'));
 for(const r of new Set(routes)){
  const pages=html.match(new RegExp('id="page-'+r+'"','g'))||[];
  assert.equal(pages.length,1,'bad page route '+r);
 }
});
test('original NEWS2 assessment fields and qSOFA result remain intact',()=>{
 for(const id of ['vitalsForm','rr','spo2','sbp','hr','temp','conscious','gcs','oxygen','scale','newsNumber','qNumber']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/name="confusion"/);
});
test('mobile drawer overlays search and dock and locks background scrolling',()=>{
 assert.match(css,/\.sidebar\{z-index:90/);
 assert.match(css,/\.sidebar-backdrop\{z-index:80/);
 assert.match(css,/body\.mobile-menu-open\{overflow:hidden/);
 assert.match(css,/body\.mobile-menu-open \.action-dock\{display:none!important/);
 assert.match(app,/mainContent\.inert=open/);
 assert.match(app,/menuBtn\.setAttribute\('aria-expanded'/);
});
test('custom themes and service-theme choices are not replaced',()=>{
 const themes=read('assets/v06.js');
 for(const id of ['custom','hospital','ambulance','urgent','homecare'])assert.ok(themes.includes("'"+id+"'"),id);
 const cssThemes=read('assets/service-themes-v0991.css');
 assert.match(cssThemes,/--accent:#ffff00/);
 assert.match(cssThemes,/--accent:#ffcc00/);
});
test('real patient measurement persistence has not been introduced',()=>{
 const src=['assets/ux-v071.js','assets/homecare-v09-ui.js','assets/times-v091.js','assets/palliation-v091.js'];
 for(const p of src)assert.doesNotMatch(read(p),/\blocalStorage\.|\bsessionStorage\.|\bindexedDB\b|\bdocument\.cookie\b/,p);
 assert.match(app,/const measurements = \[\]/);
 assert.match(html,/Målingene forsvinner ved ny lasting eller når fanen lukkes/);
});
test('About page accurately describes its prototype purpose',()=>{
 assert.match(html,/id="page-om"/);
 assert.match(html,/Ikke registrer ekte pasientopplysninger/);
 assert.match(html,/ikke uavhengig klinisk validert/);
});
