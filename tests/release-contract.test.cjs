'use strict';
// Release contracts guard key design/security decisions during later refactors.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const html=read('index.html');
const css=require('./css-helper.cjs').all();
const app=read('assets/app.js');
test('official v1.1 clearly labelled as demonstration only',()=>{
 assert.match(html,/v1\.1 · Demo/);
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
 assert.match(css,/\.sidebar\{[^}]*z-index:90/);
 assert.match(css,/\.sidebar-backdrop\{[^}]*z-index:80/);
 assert.match(css,/body\.mobile-menu-open\{[^}]*overflow:hidden/);
 assert.match(app,/mainContent\.inert=open/);
 assert.match(app,/menuBtn\.setAttribute\('aria-expanded'/);
});
test('custom themes and service-theme choices are not replaced',()=>{
 const themes=require('../assets/theme-engine.js');
 for(const id of ['custom','hospital','ambulance','urgent','homecare'])assert.ok(themes.SERVICES.includes(id),id);
 const cssThemes=require('./css-helper.cjs').group('themes');
 assert.match(cssThemes,/--accent:#ffff00/);
 assert.match(cssThemes,/--accent:#ffcc00/);
});
test('real patient measurement persistence has not been introduced',()=>{
 const src=['assets/ux-v071.js','assets/homecare-v09-ui.js','assets/times-v091.js','assets/palliation-v091.js'];
 for(const p of src)assert.doesNotMatch(read(p),/\blocalStorage\.|\bsessionStorage\.|\bindexedDB\b|\bdocument\.cookie\b/,p);
 assert.match(app,/const measurements = \[\]/);
 assert.match(html,/de forsvinner når du laster siden på nytt eller lukker fanen/);
});
test('About page accurately describes its prototype purpose',()=>{
 assert.match(html,/id="page-om"/);
 assert.match(html,/Ikke registrer ekte pasientopplysninger/);
 assert.match(html,/ikke uavhengig klinisk validert/);
});

test('optional GCS shortcut is accessible and profile trigger is semantic',()=>{
 assert.match(html,/<button type="button" class="avatar profile-trigger" id="profileTrigger" aria-label="Åpne profil og utseende">/);
 assert.doesNotMatch(html,/<span class="avatar" aria-hidden="true">/);
 assert.match(html,/Fyll ut de obligatoriske observasjonene for NEWS2\. GCS er valgfritt/);
 const search=read('assets/news-first-v081.js');
 assert.match(search,/KartleggToolNavigation/);
 const nav=read('assets/tool-navigation.js');
 assert.ok(nav.includes('if(extra)extra.open=true'));
 assert.ok(nav.includes('gcs?.focus'));
});
test('NEWS2 is computed once and reused for the visible partial-score breakdown',()=>{
 const scoringUI=read('assets/final-polish-v10.js');
 assert.doesNotMatch(scoringUI,/Scoring\.news2\(/);
 assert.doesNotMatch(scoringUI,/new MutationObserver/);
 assert.match(app,/CustomEvent\('kartlegg:news2-changed'/);
 assert.match(scoringUI,/addEventListener\('kartlegg:news2-changed',renderParts\)/);
});

test('NEWS2 alert reuses the single computed score and keeps validation',()=>{
 const ui=read('assets/clinical-ui.js');
 assert.match(app,/detail:\{total:news\.total,parts:news\.parts\}/);
 assert.match(ui,/window\.addEventListener\('kartlegg:news2-changed',refreshAlert\)/);
 assert.match(ui,/T\.newsAlert\(news\)/);
 assert.doesNotMatch(ui,/Scoring\.news2\(/);
 assert.doesNotMatch(ui,/updateScores=function/);
});

test('the two optional personal modes are exact-name cosmetic decorations only',()=>{
 const modes=require('../assets/personal-modes.js');
 const expected=[['Philip Aasen','philip'],['Kent Ole Hansen','kent']];
 for(const [name,id] of expected){
  assert.equal(modes.resolvePersonalMode(name).id,id);
  assert.equal(modes.resolvePersonalMode('  '+name.toUpperCase()+'  ').id,id);
 }
 for(const name of ['Kristian','Kristian Bøe','Philip','Kent','Maritha','Kent Ole','Kristian Bøe Jr','']){
  assert.equal(modes.resolvePersonalMode(name),null);
 }
 const js=read('assets/personal-modes.js'),decor=require('./css-helper.cjs').group('decor');
 assert.match(html,/assets\/personal-modes\.js/);
 assert.match(js,/save\.addEventListener\('click'/);
 assert.match(js,/clear\.addEventListener\('click'/);
 assert.doesNotMatch(js,/localStorage|sessionStorage|indexedDB|fetch\(|sendBeacon/);
 const personal=[...decor.matchAll(/([^{}]*data-personal-mode[^{}]*)\{/g)].map(m=>m[1]);
 assert.ok(personal.length>0,'personal mode rules expected');
 for(const sel of personal)assert.doesNotMatch(sel,/\.score(?:\.|\s|,|:|$)|\.news-alert|\.v10-part-score/,sel);
});

test('NEWS2 scale 2 guidance requires confirmed hypercapnic respiratory failure',()=>{
 const html=read('index.html'), criteria=read('assets/v06.js');
 assert.match(html,/Skala 2 kun ved bekreftet hyperkapnisk respirasjonssvikt/);
 assert.match(html,/ordinert mål 88–92 %/);
 assert.match(criteria,/Skala 2 krever bekreftet hyperkapnisk respirasjonssvikt/);
});
test('appearance toggle has a single controller and homecare outputs invalidate on edit',()=>{
 const enhancements=read('assets/enhancements.js'), settings=read('assets/v06.js');
 const homecare=read('assets/homecare-v09-ui.js');
 assert.doesNotMatch(enhancements,/theme\.addEventListener\('click'/);
 assert.match(settings,/\$\('themeToggle'\)\?\.addEventListener\('click'/);
 assert.match(homecare,/inputs\?\.addEventListener\('input',invalidate\)/);
 assert.match(homecare,/inputs\?\.addEventListener\('change',invalidate\)/);
});

test('single canonical registry drives search and direct-linkable 18 tools',()=>{
 const R=require('../assets/tool-registry.js');
 assert.equal(R.all.length,18);
 assert.equal(new Set(R.all.map(x=>x.id)).size,18);
 assert.equal(R.search('gcs')[0].id,'gcs');
 assert.equal(R.search('smerte')[0].id,'nrs');
 assert.equal(R.linkFor('https://example.test/Kartlegg/?abc=1','gcs'),'https://example.test/Kartlegg/?tool=gcs#verktoy');
 assert.equal(R.linkFor('https://example.test/Kartlegg/','isbar'),'https://example.test/Kartlegg/?tool=isbar#vurdering');
 assert.equal(R.linkFor('https://example.test/Kartlegg/','made-up'),null);
 assert.deepEqual(R.sanitizeFavorites(['gcs','gcs','nrs','bogus']),['gcs','nrs']);
 assert.match(read('assets/news-first-v081.js'),/KartleggToolRegistry/);
 assert.match(read('assets/tool-categories-v099.js'),/search\.addEventListener\('input',sync\)/);
 assert.doesNotMatch(read('assets/modern-v08-body.js'),/stopImmediatePropagation\(\)/);
 assert.match(read('assets/tool-navigation.js'),/addEventListener\('load',openDeepLink/);
 assert.match(html,/assets\/tool-navigation\.js\?v=account1/);
 assert.match(html,/assets\/tool-registry\.js\?v=1201/);
});
