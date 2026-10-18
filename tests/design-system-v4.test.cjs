'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('v4 visual system is the final stylesheet and defines the eight requested layers',()=>{
 const html=read('index.html'),css=read('assets/design-system-v4.css'),philip=read('assets/theme-philip.css');
 assert.match(html,/assets\/design-system-v4\.css\?v=1802/);
 assert.ok(html.indexOf('assets/design-system-v3.css')<html.indexOf('assets/design-system-v4.css'));
 for(const selector of [
  '.surface-action','.surface-result','.surface-info','.assessment-workspace',
  '.field.is-complete','.mobile-primary-nav',
  'data-theme="light"','data-theme="dark"','#page-laer'
 ])assert.ok(css.includes(selector),selector);
 for(const role of ['--ui-action:','--ui-success:','--ui-attention:','--ui-elevated:','--ui-danger:','--ui-learning:'])assert.ok(css.includes(role),role);
 assert.match(philip,/v4 card hierarchy/);
 assert.match(philip,/data-base-theme="philip"/);
 assert.match(philip,/\.surface-result/);
 assert.match(css,/@media\(min-width:1280px\)/);
 assert.match(css,/@media\(max-width:770px\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/forced-colors:active/);
});

test('assessment markup has direct action, result and information card roles',()=>{
 const html=read('index.html');
 assert.match(html,/class="[^"]*assessment-workspace[^"]*"/);
 assert.match(html,/class="section surface-action" id="vurdering"/);
 assert.match(html,/class="section surface-result" id="resultater"/);
 assert.match(html,/class="section surface-info" id="forklaring"/);
 const input=html.indexOf('class="section surface-action" id="vurdering"');
 const result=html.indexOf('class="section surface-result" id="resultater"');
 const info=html.indexOf('class="section surface-info" id="forklaring"');
 assert.ok(input<result&&result<info,'assessment cards should follow input, result, information order');
 assert.doesNotMatch(html,/class="assessment-flow"|data-assessment-step/);
});

test('mobile primary navigation has four stable destinations and shared icons',()=>{
 const html=read('index.html'),icons=read('assets/icon-system.js');
 const nav=html.match(/<nav class="mobile-primary-nav"[\s\S]*?<\/nav>/)?.[0]||'';
 for(const page of ['vurdering','verktoy','laer','profil'])assert.match(nav,new RegExp(`data-page="${page}"`));
 assert.equal((nav.match(/mobile-primary-link/g)||[]).length,4);
 assert.match(icons,/\.mobile-primary-link/);
});

test('v4 interaction layer only routes navigation and decorates local form state',()=>{
 const js=read('assets/design-system-v4.js');
 assert.match(js,/KartleggDesignSystemV4/);
 assert.match(js,/['"]is-complete['"]/);
 assert.match(js,/#sidebar \[data-page=/);
 assert.doesNotMatch(js,/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB)\b/);
 assert.doesNotMatch(js,/news2|qsofa|calculate/i);
});
