/* Kartlegg – service worker: lar siden fungere uten nett, og åpne raskere.
 *
 * - Siden (index.html): nettet først, så du alltid får nyeste versjon når du er på nett. Svarer ikke nettet
 *   innen 4 sekunder, eller du er uten nett, brukes den lagrede versjonen.
 * - Kartleggs egne filer (skript, stiler, bilder, skrift): fra lageret først. Filene har versjonsnummer i
 *   adressen (?v=), så en ny versjon får en ny adresse og hentes på nytt.
 * - Firebase-programfilene fra gstatic (fast versjon 13.0.0): fra lageret først.
 * - Innlogging og database (Firebase-tjenestene): alltid nettet, aldri lagret.
 *
 * Hva som lagres, leses fra selve siden: alle filer siden lenker til, modulene de importerer og bildene
 * stilene bruker. Når siden endres, lagres de nye filene og de gamle slettes. Ingen personopplysninger lagres.
 */
'use strict';
const CACHE='kartlegg-app-v1';
const SHELL_KEY='./';
const NAV_TIMEOUT=4000;
const FIREBASE_MODULES=/^https:\/\/www\.gstatic\.com\/firebasejs\/13\.0\.0\/[\w-]+\.js$/;
// Filer som skript bygger adressen til underveis, og som derfor ikke står i siden.
const EXTRA=[
 'manifest.webmanifest','assets/app-icon-192.png','assets/app-icon-512.png','assets/app-icon-maskable-512.png',
 'assets/gcs-learning-eyes.svg','assets/gcs-learning-motor.svg','assets/gcs-learning-nt.svg','assets/gcs-learning-patient.svg','assets/gcs-learning-verbal.svg',
 'assets/wounds/arterial-clinical.svg','assets/wounds/diabetic-clinical.svg','assets/wounds/postop-clinical.svg','assets/wounds/pressure-clinical.svg','assets/wounds/skin-tear-clinical.svg','assets/wounds/venous-clinical.svg',
 'assets/sim/home-acute-001-stable.svg','assets/sim/home-acute-001-worse.svg','assets/sim/nursing-home-confusion-002-stable.svg','assets/sim/nursing-home-confusion-002-worse.svg',
 'assets/sim/postop-ward-003-stable.svg','assets/sim/postop-ward-003-worse.svg','assets/sim/copd-scale2-004-stable.svg','assets/sim/copd-scale2-004-worse.svg'
];
const scope=new URL(self.registration?.scope||self.location.href);
const own=url=>url.origin===scope.origin&&url.pathname.startsWith(scope.pathname);
const keep=url=>own(url)||FIREBASE_MODULES.test(url.href);

// Finn alle filene siden trenger: lenker i HTML, importer i moduler og url() i stiler.
async function shellFiles(html){
 const found=new Set(EXTRA.map(p=>new URL(p,scope).href));
 const queue=[];
 const add=(raw,base)=>{
  let url;try{url=new URL(raw,base)}catch(_){return}
  if(!keep(url)||url.pathname===scope.pathname||url.pathname.endsWith('/index.html'))return;
  url.hash='';
  if(!found.has(url.href)){found.add(url.href);if(/\.(m?js|css)$/.test(url.pathname))queue.push(url.href)}
 };
 for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g))add(m[1],scope);
 while(queue.length){
  const href=queue.shift();
  let text;try{const r=await fetch(href,{cache:'no-cache'});if(!r.ok)continue;text=await r.text()}catch(_){continue}
  if(href.split('?')[0].endsWith('.css'))for(const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)){if(!m[1].startsWith('data:'))add(m[1],href)}
  else{
   for(const m of text.matchAll(/(?:from\s*|import\s*\(\s*)["']([^"']+)["']/g))add(m[1],href);
   for(const m of text.matchAll(/["'](https:\/\/www\.gstatic\.com\/firebasejs\/13\.0\.0\/[\w-]+\.js)["']/g))add(m[1],href);
  }
 }
 return found;
}
async function store(cache,href){
 try{const r=await fetch(href,{cache:'no-cache'});if(r.ok)await cache.put(href,r)}catch(_){}
}
// Lagre det siden trenger nå, og slett filer fra eldre versjoner.
async function refresh(html){
 const cache=await caches.open(CACHE),files=await shellFiles(html);
 const have=new Set((await cache.keys()).map(r=>r.url));
 await Promise.all([...files].filter(href=>!have.has(href)).map(href=>store(cache,href)));
 for(const href of have)if(href!==new URL(SHELL_KEY,scope).href&&!files.has(href))await cache.delete(href);
}

self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const r=await fetch(SHELL_KEY,{cache:'no-cache'});
  if(!r.ok)throw new Error('Siden kunne ikke lastes');
  const html=await r.clone().text();
  await (await caches.open(CACHE)).put(new URL(SHELL_KEY,scope).href,r);
  await refresh(html);
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const name of await caches.keys())if(name.startsWith('kartlegg-')&&name!==CACHE)await caches.delete(name);
  await self.clients.claim();
 })());
});

async function navigation(event){
 const cache=await caches.open(CACHE),key=new URL(SHELL_KEY,scope).href;
 // Spør alltid serveren om siden er endret (nettleserens egen 10-minutters lagring hoppes over).
 const network=fetch(new Request(event.request.url,{cache:'no-cache',credentials:'same-origin'})).then(async r=>{
  if(r.ok&&r.type==='basic'){
   const html=await r.clone().text(),old=await cache.match(key),changed=!old||await old.text()!==html;
   await cache.put(key,r.clone());
   // Ny versjon av siden: hent de nye filene og rydd bort de gamle, i bakgrunnen.
   if(changed){const job=refresh(html);try{event.waitUntil(job)}catch(_){job.catch(()=>{})}}
  }
  return r;
 });
 network.catch(()=>{});
 const timeout=new Promise(res=>setTimeout(res,NAV_TIMEOUT));
 try{
  const first=await Promise.race([network,timeout]);
  if(first)return first;
  const cached=await cache.match(key);
  return cached||await network;
 }catch(_){
  const cached=await cache.match(key);
  if(cached)return cached;
  throw _;
 }
}
async function asset(request){
 const cache=await caches.open(CACHE),hit=await cache.match(request);
 if(hit)return hit;
 const r=await fetch(request);
 if(r.ok&&(r.type==='basic'||r.type==='cors'))cache.put(request,r.clone()).catch(()=>{});
 return r;
}
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(request.mode==='navigate'&&own(url)){event.respondWith(navigation(event));return}
 // Innlogging, database og alt annet utenfra går rett til nettet.
 if(!keep(url)||url.pathname.endsWith('/sw.js'))return;
 event.respondWith(asset(request));
});
