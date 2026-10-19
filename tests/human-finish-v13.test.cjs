const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('Kartlegg has an original reusable mark and demo identity',()=>{
 const html=read('index.html');
 const mark=read('assets/kartlegg-mark.svg');
 assert.match(html,/assets\/kartlegg-mark\.svg/);
 assert.match(html,/brand-small">DEMO</);
 assert.doesNotMatch(html,/brand-small">PROTOTYPE</);
 assert.match(html,/M47 14c-12 0-20 7-29 18/);
 assert.match(mark,/M47 14c-12 0-20 7-29 18/);
});

test('mobile header and drawer are deliberately right aligned',()=>{
 const css=read('assets/human-finish-v13.css');
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) 44px 44px/);
 assert.match(css,/\.mobile-toggle\{grid-column:3/);
 assert.match(css,/\.sidebar\{[\s\S]*left:auto!important;right:0!important/);
 assert.match(css,/\.header \.profile-trigger,[\s\S]*display:none!important/);
});

test('human finish is loaded last and quiets only presentation',()=>{
 const html=read('index.html');
 const css=read('assets/human-finish-v13.css');
 assert.match(html,/assets\/human-finish-v13\.css\?v=1301/);
 assert.ok(html.indexOf('assets/surface-styles-v12.css')<html.indexOf('assets/human-finish-v13.css'));
 assert.match(css,/data-surface-style="solid"/);
 assert.match(css,/data-surface-style="glass"|Liquid\s+Glass/);
 for(const forbidden of ['.score.warning','.score.danger','.score.ok','.news-alert','.point-3'])
  assert.ok(!css.includes(forbidden),'clinical state must stay untouched: '+forbidden);
});
