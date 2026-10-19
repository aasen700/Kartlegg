'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const html=read('index.html');

test('v1.1 exposes a direct accessible assessment path and release identity',()=>{
 assert.match(html,/v1\.1 · Demo/);
 assert.match(html,/class="skip-link" href="#top"/);
 assert.doesNotMatch(html,/class="assessment-flow"|data-assessment-step|assessmentFlowStatus/);
 assert.match(html,/id="reviewResponse"[^>]*disabled/);
 assert.match(html,/Tiltak, tolkning og forbehold/);
 assert.match(html,/Nytt i Kartlegg 1\.1/);
});

test('assessment result navigation owns focus, never scoring or storage',()=>{
 const js=read('assets/assessment-flow-v11.js');
 assert.match(js,/result-heading/);
 assert.match(js,/heading\.focus/);
 assert.match(js,/kartlegg:news2-changed/);
 assert.match(js,/resultIsbar/);
 assert.doesNotMatch(js,/data-assessment-step|assessmentFlowStatus/);
 assert.doesNotMatch(js,/\b(?:news2|qsofa)\s*\(|localStorage|sessionStorage|indexedDB|fetch\s*\(|XMLHttpRequest|sendBeacon/);
});

test('one SVG icon system covers navigation, actions, dialogs and tool cards',()=>{
 const js=read('assets/icon-system.js');
 for(const icon of ['plus','reset','clock','menu','arrowRight','arrowLeft','close','copy','check'])assert.match(js,new RegExp(icon+":|'"+icon+"'"));
 assert.match(js,/\.dialog-close/);
 assert.match(js,/\.toolbox\[data-tool-id\] h3/);
 assert.match(js,/button:not\(\[data-ui-action-icon\]\)/);
 assert.doesNotMatch(html,/type="reset">↻|id="saveMeasurement">＋|type="submit">▦/);
});

test('v1.1 layout includes reflow, zoom, focus and system-color safeguards',()=>{
 const css=read('assets/design-system-v3.css');
 assert.match(css,/\.skip-link:focus/);
 assert.match(css,/min-height:44px/);
 assert.match(css,/@media\(max-width:360px\)/);
 assert.match(css,/@media\(min-resolution:1\.8dppx\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/@media\(forced-colors:active\)/);
 assert.match(css,/overflow-wrap:anywhere/);
});

test('TIMES identifies original TIME and the pedagogical S extension with primary sources',()=>{
 const data=read('assets/wound-learning-data-v12.js');
 const cases=read('TIMES-KASUS.md');
 assert.match(data,/opprinnelige TIME-rammeverket/);
 assert.match(data,/S lagt til som en pedagogisk påminnelse/);
 assert.match(data,/pubmed\.ncbi\.nlm\.nih\.gov\/12654015/);
 assert.match(data,/IWII-CD-2022-web\.pdf/);
 assert.match(cases,/uavhengig klinisk validering eller signering av fagperson/);
});

test('documentation distinguishes automated review from independent clinical and assistive-technology review',()=>{
 const quality=read('KLINISK-KVALITET.md');
 const changelog=read('CHANGELOG.md');
 assert.match(quality,/200 % enhetsskalering/);
 assert.match(quality,/VoiceOver\/TalkBack/);
 assert.match(quality,/uavhengig klinisk signering/);
 assert.match(changelog,/## 1\.1 – 18\. oktober 2026/);
 assert.match(changelog,/Ingen endring i NEWS2-, qSOFA-/);
});
