'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('the shared visual system is loaded last and owns common structure',()=>{
 const html=read('index.html');
 const css=read('assets/design-system-v3.css');
 assert.match(html,/assets\/design-system-v3\.css\?v=1601/);
 assert.match(html,/assets\/icon-system\.js\?v=1601/);
 assert.ok(html.indexOf('assets/visual-refinement-v2.css')<html.indexOf('assets/design-system-v3.css'));
 for(const token of ['--ui-space-1:','--ui-radius-control:','--ui-control-height:','--ui-shadow-card:'])assert.ok(css.includes(token),token);
 for(const selector of ['data-service-theme="hospital"','data-service-theme="ambulance"','data-service-theme="urgent"','data-service-theme="homecare"'])assert.ok(css.includes(selector),selector);
 assert.match(css,/@media\(max-width:480px\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/forced-colors:active/);
});

test('visual structure cannot take ownership of clinical status colors',()=>{
 const css=read('assets/design-system-v3.css');
 for(const clinical of ['.score.warning','.score.danger','.score.ok','.news-alert','.abcde-v099-emergency','.point-3','.v10-part-score.critical']){
  assert.ok(!css.includes(clinical),'shared design system must preserve clinical presentation: '+clinical);
 }
 assert.doesNotMatch(css,/--(?:coral|orange|teal|blue):/);
});

test('one local line-icon system covers every primary destination and late content',()=>{
 const js=read('assets/icon-system.js');
 for(const page of ['vurdering','historikk','verktoy','laer','simulering','om','profil'])assert.match(js,new RegExp(page+":'"));
 assert.match(js,/window\.KartleggIconSystem/);
 assert.match(js,/new MutationObserver/);
 assert.match(js,/aria-hidden/);
 assert.doesNotMatch(js,/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage)\b/);
});
