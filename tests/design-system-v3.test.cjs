'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const css=require('./css-helper.cjs');

test('the shared design tokens and structure live in assets/css/',()=>{
 const html=read('index.html');
 const tokens=css.group('tokens'),themes=css.group('themes'),all=css.all();
 assert.match(html,/assets\/icon-system\.js\?v=2000/);
 for(const token of ['--ui-space-1:','--ui-radius-control:','--ui-control-height:','--ui-shadow-card:'])assert.ok(tokens.includes(token),token);
 for(const selector of ['data-service-theme="hospital"','data-service-theme="ambulance"','data-service-theme="urgent"','data-service-theme="homecare"'])assert.ok(themes.includes(selector),selector);
 assert.match(all,/@media\(max-width:480px\)/);
 assert.match(all,/prefers-reduced-motion:reduce/);
 assert.match(all,/forced-colors:active/);
});

test('shared structure cannot take ownership of clinical status colors',()=>{
 for(const name of ['tokens','base','layout','components']){
  const layer=css.group(name);
  for(const clinical of ['.score.warning','.score.danger','.score.ok','.news-alert','.abcde-v099-emergency','.point-3','.v10-part-score.critical']){
   assert.ok(!layer.includes(clinical),name+' must preserve clinical presentation: '+clinical);
  }
 }
 assert.doesNotMatch(css.group('components'),/--(?:coral|orange|teal|blue):/);
});

test('one local line-icon system covers every primary destination and late content',()=>{
 const js=read('assets/icon-system.js');
 for(const page of ['vurdering','historikk','verktoy','laer','simulering','om','profil'])assert.match(js,new RegExp(page+":'"));
 assert.match(js,/window\.KartleggIconSystem/);
 assert.match(js,/new MutationObserver/);
 assert.match(js,/aria-hidden/);
 assert.doesNotMatch(js,/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage)\b/);
});
