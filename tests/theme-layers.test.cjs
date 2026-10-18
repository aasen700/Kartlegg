'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const T=require('../assets/theme-engine.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('legacy preferences retain current standard appearance and safe defaults',()=>{
 assert.deepEqual(T.normalize({mode:'dark',accent:'green',service:'homecare'}),{
  mode:'dark',accent:'green',service:'homecare',base:'standard',season:'off',surface:'solid'
 });
 assert.equal(T.normalize({base:'unsafe',season:'unknown'}).base,'standard');
 assert.equal(T.normalize({base:'unsafe',season:'unknown'}).season,'off');
 assert.equal(T.normalize({surface:'unsafe'}).surface,'solid');
 assert.equal(T.normalize({base:'philip'}).surface,'glass');
 assert.equal(T.normalize(null).mode,'system');
});
test('base, service and season are independent theme dimensions',()=>{
 for(const base of T.BASES)for(const service of T.SERVICES)for(const season of T.SEASONS)for(const surface of T.SURFACES){
  const result=T.resolve({base,service,season,surface},false,new Date(2026,9,29));
  assert.equal(result.base,base);
  assert.equal(result.service,service);
  assert.equal(result.season,season==='off'?'none':season==='auto'?'halloween':season);
  assert.equal(result.surface,surface);
  assert.equal(result.mode,base==='philip'?'dark':service==='ambulance'||service==='urgent'?'dark':'light');
 }
});
test('calendar automation uses local date and does not unexpectedly default to holidays',()=>{
 for(const [month,day,expected] of [
  [1,1,'none'],[6,1,'pride'],[10,1,'breast-cancer'],[10,10,'mental-health'],
  [10,24,'breast-cancer'],[10,25,'halloween'],[10,31,'halloween'],
  [11,1,'none'],[12,1,'christmas'],[12,31,'christmas']
 ]){
  assert.equal(T.autoSeason(new Date(2026,month-1,day)),expected,`${month}-${day}`);
 }
 assert.equal(T.autoSeason(new Date('invalid')),'none');
 assert.equal(T.activeSeason('off',new Date(2026,9,29)),'none');
});
test('manual season can be previewed in any month, even when auto is silent',()=>{
 for(const season of T.SEASONS.filter(v=>v!=='off'&&v!=='auto')){
  assert.equal(T.activeSeason(season,new Date(2026,0,1)),season);
 }
 assert.equal(T.activeSeason('auto',new Date(2026,0,1)),'none');
});
test('styling leaves clinical status, escalation and scoring tokens unmodified',()=>{
 const css=read('assets/theme-layers-v11.css');
 const js=read('assets/theme-engine.js');
 for(const forbidden of ['.score.warning','.score.danger','.score.ok','.news-alert','.abcde-v099-emergency','.point-3','.v10-part-score.critical']){
  assert.ok(!css.includes(forbidden),'clinical styles must not be themed: '+forbidden);
 }
 assert.doesNotMatch(css,/--(?:coral|orange|teal|blue):/);
 assert.doesNotMatch(js,/Scoring\.|readVitals|localStorage|sessionStorage|fetch\(/);
 assert.match(read('index.html'),/assets\/theme-engine\.js\?v=1201/);
 assert.match(read('index.html'),/assets\/theme-layers-v11\.css\?v=1602/);
});

test('solid and liquid glass are explicit, persistent visual choices',()=>{
 const css=read('assets/surface-styles-v12.css');
 const js=read('assets/v06.js');
 const html=read('index.html');
 assert.match(html,/assets\/surface-styles-v12\.css\?v=1201/);
 assert.match(html,/assets\/v06\.js\?v=1601/);
 assert.ok(html.indexOf('assets/design-system-v4.css')<html.indexOf('assets/surface-styles-v12.css'));
 assert.match(js,/name='surfaceStyle'/);
 assert.match(js,/dataset\.surfaceStyle=state\.surface/);
 assert.match(css,/data-surface-style="glass"/);
 assert.match(css,/backdrop-filter:blur\(26px\) saturate\(175%\)/);
 assert.match(css,/prefers-reduced-transparency:reduce/);
 for(const clinical of ['.score.warning','.score.danger','.score.ok','.news-alert','.v10-part-score.critical','.point-3'])
  assert.ok(!css.includes(clinical),'Surface material must preserve clinical presentation: '+clinical);
});

test('immersive atmosphere remains independent and excludes clinical scores',()=>{
 const css=read('assets/visual-atmospheres-v112.css');
 const html=read('index.html');
 assert.match(html,/assets\/visual-atmospheres-v112\.css\?v=1602/);
 assert.match(html,/assets\/theme-philip\.css\?v=1503/);
 assert.match(html,/assets\/visual-refinement-v2\.css\?v=1602/);
 assert.ok(html.indexOf('assets/personal-modes.css')<html.indexOf('assets/visual-atmospheres-v112.css'));
 for(const theme of ['halloween','christmas','breast-cancer','mental-health','pride'])
  assert.ok(css.includes('data-season-theme="'+theme+'"'),theme+' must work without Philip scope');
 assert.match(css,/season-halloween-web\.svg/);
 assert.match(css,/season-christmas-snow\.svg/);
 assert.match(css,/🦇[\s\S]*🎃/);
 assert.match(css,/❄[\s\S]*❅/);
 assert.match(css,/🌈[\s\S]*🏳️‍🌈/);
 assert.match(css,/--season-glass-edge/);
 assert.match(css,/kartlegg-winter-drift/);
 for(const clinical of ['.score.warning','.score.danger','.score.ok','.news-alert','.v10-part-score.critical','.point-3'])
  assert.ok(!css.includes(clinical),'Must preserve clinical presentation: '+clinical);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/pointer-events:none/);
});

test('visual refinement owns previews and motion without recoloring clinical states',()=>{
 const css=read('assets/visual-refinement-v2.css');
 const philip=read('assets/theme-philip.css');
 const profile=read('assets/v06.js');
 assert.match(css,/\.base-theme-preview/);
 assert.match(css,/\.season-theme-preview/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(philip,/--glass-surface:/);
 assert.match(philip,/backdrop-filter:blur\(28px\)/);
 assert.match(philip,/radial-gradient/);
 assert.match(profile,/dataset\.themePreview/);
 assert.match(profile,/seasonThemePreview/);
 for(const clinical of ['.score.warning','.score.danger','.score.ok','.news-alert','.v10-part-score.critical','.point-3']){
  assert.ok(!css.includes(clinical),'Refinement must preserve clinical presentation: '+clinical);
  assert.ok(!philip.includes(clinical),'Philip glass must preserve clinical presentation: '+clinical);
 }
});
