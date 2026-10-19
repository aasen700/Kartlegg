/* Kartlegg: opt-in, purely decorative profile-name easter eggs.
 * No clinical scoring, medical styling, data collection or new storage keys.
 * Names activate only when a profile is explicitly saved.
 */
'use strict';
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports={resolvePersonalMode:api.resolvePersonalMode};
 if(root&&root.document)api.init(root.document,root);
})(typeof globalThis==='undefined'?this:globalThis,function(){
 const profiles=Object.freeze({
  'kent ole hansen':Object.freeze({id:'kent',title:'Kent-modus aktivert',subtitle:'Nordlys-inspirert landskap, dype blågrønne bakgrunner og gullgule knapper med samisk-inspirerte fargedetaljer.',signature:'NORDLYS // KENT',symbol:'☀'}),
  'philip aasen':Object.freeze({id:'philip',title:'Philip-modus aktivert',subtitle:'FOUNDER EDITION. Koboltblå bakgrunn, halvgjennomsiktige glassflater og myke lysreflekser.',signature:'FOUNDER // PA',symbol:'✦'})
 });
 function resolvePersonalMode(value){
  if(typeof value!=='string')return null;
  const key=value.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('nb-NO');
  return profiles[key]||null;
 }
 const banners={
  kent:'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="24" viewBox="0 0 200 24"><rect width="200" height="24" fill="#132d56"/><path d="M0 18 32 8 51 16 85 3 118 17 148 9 180 18 200 13V24H0Z" fill="#226a57"/><path d="M0 20 30 12 52 20 85 7 117 21 152 13 184 22 200 16" fill="none" stroke="#edf0e7" stroke-width="1.4" opacity=".85"/><path d="M0 2H200" stroke="#df3b41" stroke-width="3"/><path d="M0 5H200" stroke="#f0c431" stroke-width="2"/><circle cx="165" cy="11" r="8" fill="none" stroke="#d73b43" stroke-width="2.6"/><path d="M165 3V19" stroke="#f1c332" stroke-width="2"/><path d="M0 23H200" stroke="#2c9a60" stroke-width="2"/></svg>',
  philip:'<svg xmlns="http://www.w3.org/2000/svg" width="260" height="24" viewBox="0 0 260 24"><rect width="260" height="24" fill="#071e32"/><path d="M0 24 25 13 39 18 67 5 91 20 119 10 144 24Z" fill="#16455b"/><path d="M145 24 165 16 183 5 205 17 225 10 260 23" fill="#1c5267"/><path d="M57 10 67 5 76 13M176 11 183 5 190 11" fill="none" stroke="#ddf6f4" stroke-width="1.5"/><path d="M0 13H99L108 9 115 18 123 2 130 13H158L165 10 171 15H260" fill="none" stroke="#47dfd6" stroke-width="1.7" stroke-linejoin="round"/><circle cx="223" cy="4" r="1.7" fill="#ebcf86"/><circle cx="235" cy="9" r="1" fill="#ebcf86"/><path d="M0 23H260" stroke="#d4b46b" stroke-width="1" opacity=".8"/></svg>'
 };
 function init(doc,win){
  const name=doc.getElementById('profileName'),remember=doc.getElementById('rememberProfile');
  const save=doc.getElementById('saveProfile'),clear=doc.getElementById('clearProfile');
  const ribbon=doc.getElementById('themeTopRibbon'),header=doc.querySelector('.header');
  if(!name||!remember||!save||!clear||!ribbon||!header)return;
  const root=doc.documentElement,signature=doc.createElement('span');
  signature.className='personal-mode-signature';signature.hidden=true;
  header.querySelector('.brand')?.after(signature);
  const info=doc.createElement('p');info.id='personalModeInfo';info.className='personal-mode-info';info.hidden=true;
  doc.querySelector('.profile-dialog .personalization-note')?.after(info);
  const popup=doc.createElement('dialog');popup.id='personalModePopup';popup.className='personal-mode-popup';
  popup.setAttribute('aria-labelledby','personalModeTitle');
  popup.setAttribute('aria-describedby','personalModeDescription');
  const emblem=doc.createElement('div');emblem.className='personal-mode-emblem';emblem.setAttribute('aria-hidden','true');
  const title=doc.createElement('h2');title.id='personalModeTitle';
  const description=doc.createElement('p');description.id='personalModeDescription';
  const foot=doc.createElement('p');foot.className='personal-mode-footnote';
  foot.textContent='Kun en visuell bonus. NEWS2, qSOFA, kliniske varsler og skåringsfarger er uendret.';
  const close=doc.createElement('button');close.id='closePersonalMode';close.type='button';close.textContent='Tilbake til Kartlegg';
  close.addEventListener('click',()=>popup.close());
  popup.addEventListener('click',e=>{if(e.target===popup)popup.close()});
  popup.append(emblem,title,description,foot,close);doc.body.append(popup);
  let active=null;
  function setMode(mode,announce){
   const next=mode?.id||null,changed=next!==active;
   if(changed&&popup.open)popup.close();
   active=next;
   if(mode){
    root.dataset.personalMode=mode.id;
    ribbon.style.setProperty('--personal-mode-banner','url("data:image/svg+xml,'+encodeURIComponent(banners[mode.id])+'")');
    signature.textContent=mode.signature;signature.hidden=false;
    info.textContent=mode.title+' – '+mode.subtitle;info.hidden=false;
    title.textContent=mode.title;description.textContent=mode.subtitle;emblem.textContent=mode.symbol;
    popup.dataset.mode=mode.id;
   }else{
    delete root.dataset.personalMode;
    ribbon.style.removeProperty('--personal-mode-banner');
    signature.textContent='';signature.hidden=true;
    info.textContent='';info.hidden=true;
    popup.removeAttribute('data-mode');
   }
   win.dispatchEvent(new win.CustomEvent('kartlegg:personal-mode',{detail:{id:next}}));
   if(changed&&mode&&announce)popup.showModal();
  }
  // On reload, only an explicitly remembered sender profile can restore the mode.
  setMode(remember.checked?resolvePersonalMode(name.value):null,false);
  // app.js stores or clears the sender profile before these handlers run.
  save.addEventListener('click',()=>setMode(resolvePersonalMode(name.value),true));
  clear.addEventListener('click',()=>setMode(null,false));
  win.KartleggPersonalModes=Object.freeze({
   get active(){return active},
   applyProfile(){setMode(resolvePersonalMode(name.value),false)},
   resolvePersonalMode
  });
 }
 return {resolvePersonalMode,init};
});
