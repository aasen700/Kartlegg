/* Kartlegg layered visual themes. Pure selection logic; no clinical data or I/O. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.KartleggThemeEngine=api;
})(typeof globalThis==='undefined'?this:globalThis,function(){
 'use strict';
 const BASES=Object.freeze(['standard','philip']);
 // Sesongtema i to nivåer: «stor» har farget bakgrunn, «rolig» bare et lyst banner øverst.
 const SEASONS=Object.freeze(['off','auto','halloween','christmas','may17','breast-cancer','mental-health','pride',
  'nurses-day','hand-hygiene','patient-safety','heart-day','diabetes-day','mens-health','sami-day','easter',
  'winter','spring','summer','autumn']);
 const BOLD_SEASONS=Object.freeze(['halloween','christmas','may17']);
 const SERVICES=Object.freeze(['custom','hospital','ambulance','urgent','homecare']);
 const MODES=Object.freeze(['light','dark','system']);
 const ACCENTS=Object.freeze(['violet','blue','green']);
 const SURFACES=Object.freeze(['solid','glass']);
 const serviceModes=Object.freeze({hospital:'light',ambulance:'dark',urgent:'dark',homecare:'light'});
 const fallback=Object.freeze({mode:'system',accent:'blue',service:'custom',base:'standard',season:'off',surface:'solid'});
 function normalize(raw){
  const p=raw&&typeof raw==='object'?raw:{};
  return {
   mode:MODES.includes(p.mode)?p.mode:fallback.mode,
   accent:ACCENTS.includes(p.accent)?p.accent:fallback.accent,
   service:SERVICES.includes(p.service)?p.service:fallback.service,
   base:BASES.includes(p.base)?p.base:fallback.base,
   season:SEASONS.includes(p.season)?p.season:fallback.season,
   surface:SURFACES.includes(p.surface)?p.surface:(p.base==='philip'?'glass':fallback.surface)
  };
 }
 // Påskedag etter den gregorianske kalenderen (anonym algoritme). Måned er 0-basert.
 function easterSunday(year){
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
  const h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  const month=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;
  return new Date(year,month-1,day);
 }
 function autoSeason(date){
  if(!(date instanceof Date)||!Number.isFinite(date.getTime()))return 'none';
  const month=date.getMonth()+1,day=date.getDate();
  // Påske: palmesøndag til andre påskedag.
  const easter=easterSunday(date.getFullYear()),dayMs=86400000;
  const today=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
  if(today>=easter.getTime()-7*dayMs&&today<=easter.getTime()+dayMs)return 'easter';
  // Enkeltdager og merkemåneder går foran årstidene.
  if(month===2&&day===6)return 'sami-day';
  if(month===5&&day===5)return 'hand-hygiene';
  if(month===5&&day===12)return 'nurses-day';
  if(month===5&&day===17)return 'may17';
  if(month===6)return 'pride';
  if(month===9&&day===17)return 'patient-safety';
  if(month===9&&day===29)return 'heart-day';
  if(month===10&&day===10)return 'mental-health';
  if(month===10&&day>=25)return 'halloween';
  if(month===10)return 'breast-cancer';
  if(month===11&&day===14)return 'diabetes-day';
  if(month===11)return 'mens-health';
  if(month===12)return 'christmas';
  // Rolige årstider resten av året.
  if(month<=2)return 'winter';
  if(month<=5)return 'spring';
  if(month<=8)return 'summer';
  return 'autumn';
 }
 function activeSeason(choice,date){
  if(choice==='off'||!SEASONS.includes(choice))return 'none';
  return choice==='auto'?autoSeason(date):choice;
 }
 function resolve(raw,systemDark=false,date=new Date()){
  const p=normalize(raw);
  // The premium cobalt theme is intentionally dark; standard service palettes retain
  // their established presentation. The season is an independent decorative overlay.
  const mode=p.base==='philip'?'dark':(serviceModes[p.service]||(p.mode==='system'?(systemDark?'dark':'light'):p.mode));
  return Object.freeze({mode,accent:p.accent,service:p.service,base:p.base,season:activeSeason(p.season,date),surface:p.surface});
 }
 // Neste automatiske tema etter datoen, til visning i innstillingene.
 function nextSeason(date){
  if(!(date instanceof Date)||!Number.isFinite(date.getTime()))return null;
  const current=autoSeason(date);
  for(let i=1;i<=370;i++){const d=new Date(date.getFullYear(),date.getMonth(),date.getDate()+i);const s=autoSeason(d);if(s!==current)return {season:s,date:d};}
  return null;
 }
 function isBold(season){return BOLD_SEASONS.includes(season)}
 return Object.freeze({BASES,SEASONS,BOLD_SEASONS,SERVICES,SURFACES,normalize,autoSeason,activeSeason,resolve,easterSunday,nextSeason,isBold});
});
