'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('the app manifest is valid and its icons exist',()=>{
 const m=JSON.parse(read('manifest.webmanifest'));
 assert.equal(m.short_name,'Kartlegg');assert.equal(m.start_url,'/');assert.equal(m.display,'standalone');
 const sizes=m.icons.map(i=>i.sizes+':'+i.purpose);
 assert.ok(sizes.includes('192x192:any')&&sizes.includes('512x512:any')&&sizes.includes('512x512:maskable'));
 for(const i of m.icons)assert.ok(fs.existsSync(path.join(root,i.src)),i.src);
 const html=read('index.html');
 assert.match(html,/<link rel="manifest" href="manifest.webmanifest">/);
 assert.match(html,/assets\/pwa\.js\?v=/);
});
test('the service worker never stores login or database traffic',()=>{
 const sw=read('sw.js');
 assert.match(sw,/if\(!keep\(url\)\|\|url\.pathname\.endsWith\('\/sw\.js'\)\)return;/,'everything outside Kartlegg and the Firebase program files goes straight to the network');
 assert.match(sw,/FIREBASE_MODULES=\/\^https:\\\/\\\/www\\\.gstatic\\\.com\\\/firebasejs\\\/13\\\.0\\\.0\\\//);
 assert.doesNotMatch(sw,/googleapis|identitytoolkit|securetoken/,'no Firebase service hosts in the cache rules');
 assert.match(sw,/if\(request\.method!=='GET'\)return;/);
 assert.match(sw,/cache:'no-cache'/,'the page always asks the server for a newer version');
 assert.doesNotMatch(read('assets/pwa.js'),/localStorage\.setItem|fetch\(/);
});
test('files that scripts load by name are stored for offline use',()=>{
 const sw=read('sw.js');
 const listed=new Set([...sw.matchAll(/'(assets\/[^']+)'/g)].map(m=>m[1]));
 const want=[...fs.readdirSync(path.join(root,'assets/sim')).map(f=>'assets/sim/'+f),
  ...fs.readdirSync(path.join(root,'assets/wounds')).map(f=>'assets/wounds/'+f),
  ...fs.readdirSync(path.join(root,'assets')).filter(f=>/^gcs-learning-.*\.svg$/.test(f)).map(f=>'assets/'+f)];
 for(const f of want)assert.ok(listed.has(f),'missing in sw.js EXTRA: '+f);
 for(const f of listed)assert.ok(fs.existsSync(path.join(root,f)),'listed but missing: '+f);
});
test('the privacy notice explains the stored app files',()=>{
 assert.match(read('index.html'),/Appfiler \(for bruk uten nett\)/);
});
