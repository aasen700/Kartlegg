/* Kartlegg – innloggingsvakt i nettleseren.
 * Bestemmer hvilken side som vises ut fra innloggingsstatus, og husker hvor brukeren ville.
 * Dette er brukeropplevelse, ikke sikkerhet: all kode på GitHub Pages er offentlig.
 * Private data beskyttes av Firestore-reglene på serveren (firestore.rules).
 */
'use strict';
(root=>{
 const PUBLIC=Object.freeze(['start','om','konto','vilkar','personvern']);
 const NAMES=Object.freeze({vurdering:'Ny vurdering',historikk:'Målinger over tid',verktoy:'Kliniske verktøy',laer:'Lær',simulering:'Simulering',profil:'Profil'});
 const RETURN_KEY='kartlegg.returnTo';
 // checking: Firebase sjekker en lagret innlogging. guest: ikke innlogget.
 // verify/consent: innlogget, men e-post eller vilkår mangler. member: full tilgang. open: kontoer er slått av.
 const STATES=Object.freeze(['checking','guest','verify','consent','member','open']);

 function createGate({doc,storage,test}={}){
  let state=STATES.includes(test)?test:'checking',owner=null,reason='';
  const listeners=new Set();
  const full=()=>state==='member'||state==='open';
  function read(){try{return storage?.getItem(RETURN_KEY)||''}catch(_){return ''}}
  function write(v){try{v?storage?.setItem(RETURN_KEY,v):storage?.removeItem(RETURN_KEY)}catch(_){}}
  function resolve(page){
   if(state==='checking')return page;
   if(full()){
    if(page==='start')return 'vurdering';
    // Etter innlogging: tilbake til siden brukeren ville til, men Profil gir forsiden med NEWS2.
    if(page==='konto'){const back=read();write('');return back&&!PUBLIC.includes(back)&&back!=='profil'?back:'vurdering'}
    return page;
   }
   if(PUBLIC.includes(page)){if(page==='konto'&&state==='guest')reason='';return page}
   write(page);reason=NAMES[page]||'';
   return 'konto';
  }
  function setState(next,uid){
   if(!STATES.includes(next)||next==='checking')return;
   const changed=next!==state||uid!==owner;
   state=next;owner=full()?(uid||null):null;
   if(doc)doc.documentElement.dataset.auth=state;
   if(changed)listeners.forEach(fn=>{try{fn(state,owner)}catch(_){}});
  }
  function onChange(fn){listeners.add(fn);return()=>listeners.delete(fn)}
  function whenMember(){return full()?Promise.resolve(owner):new Promise(r=>{const off=onChange(s=>{if(s==='member'||s==='open'){off();r(owner)}})})}
  if(doc)doc.documentElement.dataset.auth=state;
  return Object.freeze({resolve,setState,onChange,whenMember,
   get state(){return state},get owner(){return owner},get reason(){return reason},
   get returnTo(){return read()},isPublic:page=>PUBLIC.includes(page),names:NAMES});
 }

 if(typeof module==='object'&&module.exports){module.exports={createGate,PUBLIC,NAMES};return}
 let storage;try{storage=root.sessionStorage}catch(_){}
 // Testoppsett kan sette window.__KARTLEGG_TEST_AUTH__ før denne filen lastes. Det gir ingen tilgang til data.
 const gate=createGate({doc:root.document,storage,test:root.__KARTLEGG_TEST_AUTH__});
 root.KartleggGate=gate;
 // Når status endres, vises siden brukeren egentlig ville til.
 gate.onChange(()=>{
  const wanted=(root.location.hash||'#start').slice(1)||'start';
  root.KartleggShowPage?.(wanted==='konto'&&gate.state==='member'?'konto':wanted);
 });
 // Får vi ikke svar fra innloggingstjenesten, vises den offentlige siden i stedet for en evig lasteskjerm.
 root.setTimeout(()=>{if(gate.state==='checking')gate.setState('guest')},10000);
})(typeof window==='object'?window:globalThis);
