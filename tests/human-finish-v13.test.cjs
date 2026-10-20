const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const css=require('./css-helper.cjs');

// Logoark oktober 2026 (Designpartner): symbol med pulskurve og ordmerke i Schibsted Grotesk, Kartlegg-blå #173B58.
test('Kartlegg uses the official 2026 logo and keeps its demo identity',()=>{
 const html=read('index.html');
 const mark=read('assets/kartlegg-mark.svg');
 assert.match(html,/assets\/kartlegg-mark\.svg/);
 assert.match(html,/rel="apple-touch-icon" href="assets\/kartlegg-touch-icon\.png"/);
 // Logoarket: ingen annen tekst i frisonen. Demo-statusen står i bunnteksten og i ansvarsfraskrivelsen.
 assert.doesNotMatch(html,/class="brand-small"/);
 assert.match(html,/Kartlegg v1\.1 · Demo/);
 assert.match(html,/Kartlegg er et støtteverktøy og en demoversjon/);
 assert.doesNotMatch(html,/brand-small">PROTOTYPE</);
 assert.match(html,/class="brand-word"><svg[^>]*aria-hidden="true"[\s\S]*?<span class="sr-only">Kartlegg<\/span>/);
 assert.match(html,/data-brand-mark="kartlegg-2026"/);
 assert.doesNotMatch(html,/data-brand-mark="kartlegg-2a"/);
 assert.match(mark,/data-brand-mark="kartlegg-2026"/);
 assert.match(mark,/aria-label="Kartlegg-symbol"/);
 assert.match(mark,/#173b58/i);
 for(const f of ['assets/kartlegg-logo.svg','assets/kartlegg-logo-negativ.svg'])assert.ok(fs.existsSync(path.join(__dirname,'..',f)),f);
 const layout=css.group('layout');
 assert.match(layout,/--logo-square:#173b58/);
 assert.match(layout,/\[data-theme=dark\]\{--logo-ink:#ffffff;--logo-square:#ffffff;--logo-pulse:#173b58/);
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
