'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('keyboard adjustment scrolls at most once per focused field (no scroll loop on iPhone)',()=>{
 const js=read('assets/mobile-ux.js');
 assert.match(js,/adjusted!==document\.activeElement/);
 assert.match(js,/adjusted=field/);
 assert.match(js,/addEventListener\('focusout',\(\)=>\{adjusted=null\}\)/);
 assert.doesNotMatch(js,/scrollIntoView/,'scrollIntoView centred in the layout viewport and could re-trigger itself');
});
test('glass header and bottom menu are dense enough to read over scrolling content',()=>{
 const css=read('assets/css/10-themes.css');
 const alpha=re=>Number(css.match(re)[1]);
 assert.ok(alpha(/\[data-surface-style="glass"\] \.mobile-primary-nav\{background:rgba\(255,255,255,(\.\d+)\)/)>=.7);
 assert.ok(alpha(/\[data-theme="dark"\] \.mobile-primary-nav\{background:rgba\(20,25,32,(\.\d+)\)/)>=.7);
 assert.ok(alpha(/\[data-surface-style="glass"\] :is\(\.header,\.sidebar\)\{background:rgba\(255,255,255,(\.\d+)\)/)>=.65);
 assert.match(css,/\[data-theme=dark\] \.footer a \{\n  color: #8cc4ee;/);
});
