const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const css=require('./css-helper.cjs');

test('Kartlegg has an original reusable mark and demo identity',()=>{
 const html=read('index.html');
 const mark=read('assets/kartlegg-mark.svg');
 assert.match(html,/assets\/kartlegg-mark\.svg/);
 assert.match(html,/brand-small">DEMO</);
 assert.doesNotMatch(html,/brand-small">PROTOTYPE</);
 assert.match(html,/class="brand-word">Kartlegg/);
 assert.match(html,/data-brand-mark="kartlegg-2a"/);
 assert.match(mark,/data-brand-mark="kartlegg-2a"/);
 assert.match(mark,/aria-label="Kartlegg monogram"/);
});

test('mobile header and drawer are deliberately right aligned',()=>{
 const all=css.all();
 assert.match(all,/grid-template-columns:minmax\(0,1fr\) 44px 44px/);
 assert.match(all,/\.mobile-toggle\{[^}]*grid-column:3/);
 assert.match(all,/\.sidebar\{[^}]*left:auto!important[^}]*right:0!important/);
 assert.match(all,/\.header \.profile-trigger[^{]*\{[^}]*display:none!important/);
});

test('solid and glass surfaces are styled without touching clinical state',()=>{
 const themes=css.group('themes');
 assert.match(themes,/data-surface-style="solid"/);
 assert.match(themes,/data-surface-style="glass"/);
 for(const forbidden of ['.score.warning','.score.danger','.score.ok','.news-alert','.point-3'])
  assert.ok(!themes.includes(forbidden),'clinical state must stay untouched: '+forbidden);
});
