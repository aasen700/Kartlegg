'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('the page never scrolls by itself when a field gets focus (the browser already does it)',()=>{
 const js=read('assets/mobile-ux.js');
 const code=js.replace(/\/\/.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(code,/scrollIntoView|scrollBy|scrollTo/,'our own scrolling fought the browser on iPhone (AVPU, puls)');
 assert.match(code,/classList\.toggle\('keyboard-open'/,'the keyboard class for fixed controls is kept');
 const css=read('assets/css/01-base.css'),components=read('assets/css/03-components.css');
 assert.match(css,/@media\(max-width:770px\)\{\n  html \{\n    scroll-behavior: auto;/,'no smooth scrolling on phones');
 assert.doesNotMatch(css,/scroll-margin-top|scroll-padding-top: 76px/,'extra offsets made iPhone push fields to the top');
 assert.doesNotMatch(components,/\.keyboard-open \.main \{/,'page height must not change when the keyboard opens');
});
test('glass header and bottom menu are dense enough to read over scrolling content',()=>{
 const css=read('assets/css/10-themes.css');
 const alpha=re=>Number(css.match(re)[1]);
 assert.ok(alpha(/\[data-surface-style="glass"\] \.mobile-primary-nav\{background:rgba\(255,255,255,(\.\d+)\)/)>=.7);
 assert.ok(alpha(/\[data-theme="dark"\] \.mobile-primary-nav\{background:rgba\(20,25,32,(\.\d+)\)/)>=.7);
 assert.ok(alpha(/\[data-surface-style="glass"\] :is\(\.header,\.sidebar\)\{background:rgba\(255,255,255,(\.\d+)\)/)>=.65);
 assert.match(css,/\[data-theme=dark\] \.footer a \{\n  color: #8cc4ee;/);
});
test('the mobile score dock only reads the result cards and never shows on PC',()=>{
 const js=read('assets/score-dock.js'),css=read('assets/css/05-assessment.css'),html=read('index.html');
 assert.match(html,/assets\/score-dock\.js\?v=/);
 assert.ok(html.indexOf('score-dock.js')>html.indexOf('assets/app.js'),'loads after app.js');
 assert.doesNotMatch(js,/news2\(|calculateNEWS2|Scoring\./,'no scoring of its own');
 assert.match(js,/newsNumber/);
 assert.match(js,/IntersectionObserver/,'hidden when the results are visible');
 assert.match(css,/@media\(min-width:771px\)\{\n  \.score-dock \{\n    display: none !important;/);
 assert.match(css,/\.keyboard-open \.score-dock \{\n    display: none;/);
 assert.doesNotMatch(css,/score-dock-open #page-vurdering/,'page height must not toggle while scrolling');
});
