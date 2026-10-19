/* Kartlegg layered visual themes. Pure selection logic; no clinical data or I/O. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.KartleggThemeEngine=api;
})(typeof globalThis==='undefined'?this:globalThis,function(){
 'use strict';
 const BASES=Object.freeze(['standard','philip']);
 const SEASONS=Object.freeze(['off','auto','halloween','christmas','breast-cancer','mental-health','pride']);
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
 function autoSeason(date){
  if(!(date instanceof Date)||!Number.isFinite(date.getTime()))return 'none';
  const month=date.getMonth()+1,day=date.getDate();
  if(month===10&&day===10)return 'mental-health';
  if(month===10&&day>=25)return 'halloween';
  if(month===10)return 'breast-cancer';
  if(month===12)return 'christmas';
  if(month===6)return 'pride';
  return 'none';
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
 return Object.freeze({BASES,SEASONS,SERVICES,SURFACES,normalize,autoSeason,activeSeason,resolve});
});
