/* Kartlegg v0.99.2 – decorative theme ribbon and consent-by-save Maritha Easter egg.
 * No clinical scoring, patient data, external services or new storage keys.
 * The profile's existing opt-in persistence determines whether hearts survive reload.
 */
'use strict';
(()=>{
 const $=id=>document.getElementById(id),root=document.documentElement;
 const header=document.querySelector('.header'),name=$('profileName'),remember=$('rememberProfile');
 if(!header||!name||!remember)return;
 const ribbon=document.createElement('div');ribbon.id='themeTopRibbon';ribbon.className='theme-top-ribbon';
 ribbon.setAttribute('aria-hidden','true');header.prepend(ribbon);
 const popup=document.createElement('dialog');popup.id='marithaPopup';popup.className='maritha-popup';
 popup.setAttribute('aria-labelledby','marithaPopupTitle');
 const hearts=document.createElement('div');hearts.className='maritha-popup-emoji';hearts.setAttribute('aria-hidden','true');hearts.textContent='♥ ♡ ♥';
 const title=document.createElement('h2');title.id='marithaPopupTitle';title.textContent='Maritha-modus aktivert! ♥';
 const description=document.createElement('p');description.textContent='Litt ekstra kjærlighet til Kartlegg. Hjertene følger med øverst på siden – du kan fortsatt bruke alle de vanlige tjenestetemaene.';
 const note=document.createElement('p');note.textContent='Modusen slås av når du lagrer et annet navn eller velger «Slett profil».';
 const button=document.createElement('button');button.type='button';button.id='closeMarithaPopup';button.textContent='Så koselig ♥';
 button.addEventListener('click',()=>popup.close());
 popup.append(hearts,title,description,note,button);document.body.append(popup);
 const isMaritha=()=>name.value.trim().toLocaleLowerCase('nb-NO')==='maritha';
 let enabled=false;
 function setActive(active,announce){
  const wasEnabled=enabled;enabled=Boolean(active);
  if(enabled)root.dataset.marithaMode='on';else delete root.dataset.marithaMode;
  if(enabled&&!wasEnabled&&announce&&!popup.open)popup.showModal();
  if(!enabled&&popup.open)popup.close();
 }
 // Previously saved profile is already restored by app.js before this module executes.
 // Do not show an unsolicited popup on page load.
 setActive(remember.checked&&isMaritha(),false);
 // Registered after the existing app.js listener, so it reacts only to explicit save.
 $('saveProfile')?.addEventListener('click',()=>setActive(isMaritha(),true));
 $('clearProfile')?.addEventListener('click',()=>setActive(false,false));
 window.addEventListener('pageshow',e=>{
  // BFCache restores the DOM and the existing profile; keep the heart overlay in sync.
  if(e.persisted)setActive(isMaritha()&&(remember.checked||enabled),false);
 });
 window.KartleggThemeFinale={applyProfile(){setActive(isMaritha(),false)},get marithaMode(){return enabled}};
})();