'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const T=require('../assets/theme-engine.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const css=require('./css-helper.cjs');

test('legacy preferences retain current standard appearance and safe defaults',()=>{
 assert.deepEqual(T.normalize({mode:'dark',accent:'green',service:'homecare'}),{
  mode:'dark',accent:'green',service:'homecare',base:'standard',season:'off',surface:'solid'
 });
 assert.equal(T.normalize({base:'unsafe',season:'unknown'}).base,'standard');
 assert.equal(T.normalize({base:'unsafe',season:'unknown'}).season,'off');
 assert.equal(T.normalize({surface:'unsafe'}).surface,'solid');
 assert.equal(T.normalize({base:'philip'}).surface,'glass');
 assert.equal(T.normalize(null).mode,'system');
 assert.equal(T.normalize(null).accent,'blue');
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
test('calendar automation uses local date: marked days first, then the calm season of the year',()=>{
 for(const [month,day,expected] of [
  [1,1,'winter'],[2,6,'sami-day'],[2,7,'winter'],[3,1,'spring'],[5,5,'hand-hygiene'],[5,12,'nurses-day'],[5,17,'may17'],[5,18,'spring'],
  [6,1,'pride'],[7,15,'summer'],[9,1,'autumn'],[9,17,'patient-safety'],[9,29,'heart-day'],
  [10,1,'breast-cancer'],[10,10,'mental-health'],[10,24,'breast-cancer'],[10,25,'halloween'],[10,31,'halloween'],
  [11,1,'mens-health'],[11,14,'diabetes-day'],[12,1,'christmas'],[12,31,'christmas']
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
 assert.equal(T.activeSeason('auto',new Date(2026,0,1)),'winter');
});
test('Easter runs from Palm Sunday to Easter Monday and is computed for any year',()=>{
 assert.equal(T.easterSunday(2026).toDateString(),new Date(2026,3,5).toDateString());
 assert.equal(T.easterSunday(2027).toDateString(),new Date(2027,2,28).toDateString());
 assert.equal(T.easterSunday(2028).toDateString(),new Date(2028,3,16).toDateString());
 for(const [y,m,d,expected] of [[2026,3,28,'spring'],[2026,3,29,'easter'],[2026,4,6,'easter'],[2026,4,7,'spring'],[2027,3,21,'easter']])
  assert.equal(T.autoSeason(new Date(y,m-1,d)),expected,`${y}-${m}-${d}`);
});
test('only Christmas, Halloween and 17 May are bold; the next automatic theme can be shown',()=>{
 assert.deepEqual([...T.BOLD_SEASONS].sort(),['christmas','halloween','may17']);
 for(const s of T.SEASONS)assert.equal(T.isBold(s),['christmas','halloween','may17'].includes(s),s);
 const next=T.nextSeason(new Date(2026,9,21));
 assert.equal(next.season,'halloween');assert.equal(next.date.getDate(),25);
});
test('styling leaves clinical status, escalation and scoring tokens unmodified',()=>{
 const themes=css.group('themes'),decor=css.group('decor');
 const js=read('assets/theme-engine.js');
 for(const forbidden of ['.score.warning','.score.danger','.score.ok','.news-alert','.abcde-v099-emergency','.point-3','.v10-part-score.critical']){
  assert.ok(!themes.includes(forbidden),'clinical styles must not be themed: '+forbidden);
  assert.ok(!decor.includes(forbidden),'clinical styles must not be decorated: '+forbidden);
 }
 assert.doesNotMatch(themes,/--(?:coral|orange|teal|blue):/);
 assert.doesNotMatch(js,/Scoring\.|readVitals|localStorage|sessionStorage|fetch\(/);
 assert.match(read('index.html'),/assets\/theme-engine\.js\?v=sesong1/);
 const html=read('index.html');
 assert.ok(html.indexOf('assets/css/10-themes.css')<html.indexOf('assets/css/11-clinical.css'),'clinical colours load after every theme');
});

test('solid and liquid glass are explicit, persistent visual choices',()=>{
 const themes=css.group('themes');
 const js=read('assets/v06.js');
 const html=read('index.html');
 assert.match(html,/assets\/v06\.js\?v=sesong1/);
 assert.match(js,/name='surfaceStyle'/);
 assert.match(js,/dataset\.surfaceStyle=state\.surface/);
 assert.match(themes,/data-surface-style="glass"/);
 assert.match(themes,/backdrop-filter:blur\(26px\) saturate\(175%\)/);
 assert.match(css.all(),/prefers-reduced-transparency:reduce/);
});

test('immersive atmosphere remains independent and excludes clinical scores',()=>{
 const decor=css.group('decor');
 // Oktober 2026: ett tegnet banner per tema i assets/season/ erstatter de gjentatte mønstrene bak hele siden.
 for(const theme of T.SEASONS.filter(v=>v!=='off'&&v!=='auto')){
  assert.ok(decor.includes('data-season-theme="'+theme+'"'),theme+' must work without Philip scope');
  assert.match(decor,new RegExp('\\.\\./season/'+theme+'\\.svg'),theme+' banner referenced');
  assert.ok(fs.existsSync(path.join(__dirname,'..','assets','season',theme+'.svg')),theme+' banner exists');
 }
 for(const theme of T.BOLD_SEASONS)assert.match(decor,new RegExp('data-season-theme="'+theme+'"[^{]*body \\{[^}]*--season-page|--season-page:'),theme);
 assert.match(decor,/--season-glass-edge/);
 assert.match(decor,/kartlegg-winter-drift/);
 assert.match(decor,/pointer-events:none/);
 const all=css.all();
 assert.match(all,/body\{[^}]*position:relative[^}]*isolation:isolate/);
 assert.match(all,/\.shell\{[^}]*position:relative[^}]*z-index:1/);
 assert.match(all,/body::after\{[^}]*z-index:0/);
 assert.match(all,/prefers-reduced-motion:reduce/);
});

test('theme previews and the Philip glass theme keep their styling',()=>{
 const all=css.all(),themes=css.group('themes');
 const profile=read('assets/v06.js');
 assert.match(all,/\.base-theme-preview/);
 assert.match(all,/\.season-theme-preview/);
 assert.match(themes,/--glass-surface:/);
 assert.match(themes,/backdrop-filter:blur\(28px\)/);
 assert.match(themes,/radial-gradient/);
 assert.match(profile,/dataset\.themePreview/);
 assert.match(profile,/seasonThemePreview/);
});
