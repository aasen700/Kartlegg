/* Kartlegg – «Øvingsforløp» på denne enheten.
 * Kun for tenkte pasienter. Ingen navn, ID-er, fritekst, dato eller klokkeslett kan lagres:
 * bare tiden siden forrige måling (i minutter) og de vitale målingene som tall eller faste valg.
 * Uten ekte tidspunkt kan forløpet ikke brukes som journal eller til å overvåke en virkelig pasient.
 * Målingene sendes aldri til Firebase eller andre tjenester, utløper etter 24 timer,
 * er knyttet til innlogget bruker og slettes ved utlogging. Dette er ikke en pasientjournal.
 */
'use strict';
(root=>{
 const KEY='kartlegg.vitals-24h.v2';
 // Første versjon lagret ekte dato og klokkeslett. Den slettes ved første lasting.
 const LEGACY_KEYS=Object.freeze(['kartlegg.vitals-24h.v1']);
 const MAX_STEP=24*60;
 const MAX_AGE=24*60*60*1000;
 const MAX_ITEMS=48;
 const num=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max?v:undefined;
 // FNV-1a: bruker-ID-en lagres ikke i klartekst sammen med målingene.
 function ownerKey(uid){let h=0x811c9dc5;for(const c of String(uid||''))h=Math.imul(h^c.charCodeAt(0),0x01000193)>>>0;return h.toString(36)}
 // Bare kjente felt med gyldige verdier slipper gjennom. Alt annet forkastes.
 function clean(item,now){
  if(!item||typeof item!=='object')return null;
  const savedAt=num(item.savedAt,0,now);
  if(savedAt===undefined||now-savedAt>MAX_AGE)return null;
  const after=Number.isInteger(item.after)&&item.after>=0&&item.after<=MAX_STEP?item.after:undefined;
  if(after===undefined)return null;
  const v=item.v||{};
  const vitals={rr:num(v.rr,1,150),spo2:num(v.spo2,1,100),sbp:num(v.sbp,1,350),hr:num(v.hr,1,300),temp:num(v.temp,25,45),
   gcs:v.gcs===null?null:num(v.gcs,3,15),conscious:['A','V','P','U'].includes(v.conscious)?v.conscious:undefined,
   oxygen:typeof v.oxygen==='boolean'?v.oxygen:undefined,scale:v.scale===1||v.scale===2?v.scale:undefined,
   confusion:typeof v.confusion==='boolean'?v.confusion:undefined};
  if(Object.values(vitals).some(x=>x===undefined))return null;
  return {savedAt,after,v:vitals};
 }
 function createStore(storage,clock=()=>Date.now()){
  function dropLegacy(){for(const k of LEGACY_KEYS)try{storage.removeItem(k)}catch(_){}}
  function readAll(){dropLegacy();try{const d=JSON.parse(storage.getItem(KEY)||'null');return d&&typeof d==='object'?d:null}catch(_){return null}}
  function load(uid){
   const d=readAll(),now=clock();
   if(!d||!uid||d.owner!==ownerKey(uid))return [];
   const items=(Array.isArray(d.items)?d.items:[]).map(x=>clean(x,now)).filter(Boolean).slice(0,MAX_ITEMS);
   if(items.length!==d.items?.length)save(uid,items);
   return items;
  }
  function save(uid,items){
   if(!uid)return false;
   const now=clock();
   const kept=items.map(x=>clean({...x,savedAt:x.savedAt??now},now)).filter(Boolean).slice(0,MAX_ITEMS);
   try{kept.length?storage.setItem(KEY,JSON.stringify({owner:ownerKey(uid),items:kept})):storage.removeItem(KEY);return true}catch(_){return false}
  }
  function clearAll(){try{storage.removeItem(KEY)}catch(_){}dropLegacy()}
  // Tidspunktet da den eldste målingen utløper, for å kunne vise det i grensesnittet.
  function expiresAt(items){return items.length?Math.min(...items.map(x=>x.savedAt))+MAX_AGE:null}
  return Object.freeze({load,save,clearAll,expiresAt,MAX_AGE,MAX_ITEMS,MAX_STEP});
 }
 if(typeof module==='object'&&module.exports){module.exports={createStore,KEY,LEGACY_KEYS,MAX_AGE,ownerKey};return}
 let storage;try{storage=root.localStorage}catch(_){}
 const memory=new Map();
 root.KartleggMeasurementStore=createStore(storage||{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)});
})(typeof window==='object'?window:globalThis);
