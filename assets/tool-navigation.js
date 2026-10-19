/* Unified UI routing for Kartlegg tools. Only visual preferences are saved.
 * Clinical observations and calculations stay in their existing owners and RAM.
 */
'use strict';
(()=>{
 const R=window.KartleggToolRegistry;
 const $=id=>document.getElementById(id);
 if(!R||!$('page-verktoy')||!$('homeToolSearch'))return;
 const FAVORITES_KEY='kartlegg.tool-favorites.v1';
 let favorites=[];
 try{favorites=R.sanitizeFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]'))}catch(_){}
 const library=document.querySelector('#page-verktoy .toolgrid');
 const cards=[...library.querySelectorAll('.toolbox')];
 function cardFor(item){
  if(['news2','qsofa','gcs','4at','nrs'].includes(item.id)){
   const expressions={news2:/\bNEWS2\b/i,qsofa:/\bqSOFA\b/i,gcs:/\bGCS\b/i,'4at':/\b4AT\b/i,nrs:/\bNRS\b/i};
   return cards.find(card=>expressions[item.id].test(card.querySelector('h3')?.textContent||''))||null;
  }
  return document.querySelector(item.launchSelector)?.closest('.toolbox')||null;
 }
 function actionFor(item){
  if(['news2','qsofa'].includes(item.id))return null;
  return ['gcs','4at','nrs'].includes(item.id)
   ?cardFor(item)?.querySelector('.tool-launch')
   :document.querySelector(item.launchSelector);
 }
 function navigateAssessment(){
  if($('page-vurdering')?.hidden)document.querySelector('[data-page="vurdering"]')?.click();
 }
 function closeOpenDialogs(){
  document.querySelectorAll('dialog[open]').forEach(dialog=>{
   if(typeof dialog.close==='function')dialog.close();
   else dialog.removeAttribute('open');
  });
 }
 function open(id){
  if(id!=='isbar'&&!R.get(id))return false;
  closeOpenDialogs();
  if(id==='news2'){
   navigateAssessment();$('rr')?.scrollIntoView({block:'center',behavior:'auto'});$('rr')?.focus({preventScroll:true});return true;
  }
  if(id==='qsofa'){
   navigateAssessment();const extra=$('optionalGCS');if(extra)extra.open=true;
   const gcs=$('gcs');gcs?.scrollIntoView({block:'center',behavior:'auto'});gcs?.focus({preventScroll:true});return true;
  }
  if(id==='isbar'){
   navigateAssessment();$('openIsbar')?.click();return Boolean($('isbarDialog')?.open);
  }
  const action=actionFor(R.get(id));
  if(!action)return false;
  action.click();
  return true;
 }
 function persist(){
  try{localStorage.setItem(FAVORITES_KEY,JSON.stringify(favorites))}catch(_){}
 }
 function isFavorite(id){return favorites.includes(id)}
 function toggle(id){
  if(!R.get(id))return;
  favorites=isFavorite(id)?favorites.filter(x=>x!==id):[...favorites,id];
  persist();renderFavorites();syncCards();
  window.dispatchEvent(new Event('kartlegg:settings-changed'));
 }
 function directLink(id){return R.linkFor(window.location.href,id)}
 const status=document.createElement('p');status.id='toolNavigationStatus';status.className='tool-navigation-status';
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const libraryStatus=document.createElement('p');libraryStatus.id='toolLibraryCopyStatus';libraryStatus.className='tool-navigation-status';
 libraryStatus.setAttribute('role','status');libraryStatus.setAttribute('aria-live','polite');
 $('page-verktoy').querySelector('.section-header')?.after(libraryStatus);
 function message(s){status.textContent=s;libraryStatus.textContent=s}
 async function copyLink(id){
  const url=directLink(id);if(!url)return;
  try{
   if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable');
   await navigator.clipboard.writeText(url);
   message('Lenken til '+(R.get(id)?.name||'ISBAR')+' er kopiert.');
  }catch(_){
   message('Kopiering ble ikke tillatt. Lenke: '+url);
  }
 }
 function button(label,cls,callback){
  const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=label;b.addEventListener('click',callback);return b;
 }
 // Kortknapper får ikon fra ikonsystemet (data-icon) og tekst i eget element.
 function labelled(label,icon,cls,callback){
  const b=button('',cls,callback);b.dataset.icon=icon;
  const text=document.createElement('span');text.className='tool-card-action-label';text.textContent=label;b.append(text);return b;
 }
 const home=$('homeToolSearch');
 const favBlock=document.createElement('section');favBlock.className='tool-favorites';favBlock.id='toolFavorites';
 favBlock.setAttribute('aria-label','Mine favorittverktøy');
 const favTitle=document.createElement('strong');favTitle.textContent='Mine favoritter';
 const favItems=document.createElement('div');favItems.className='tool-favorites-list';favItems.id='toolFavoritesList';
 favBlock.append(favTitle,favItems);
 home.append(favBlock,status);
 const cardControls=new Map();
 function syncCards(){
  for(const [id,star] of cardControls){
   const active=isFavorite(id);
   star.querySelector('.tool-card-action-label').textContent='Favoritt';
   star.setAttribute('aria-pressed',String(active));
   star.setAttribute('aria-label',(active?'Fjern ':'Legg til ')+R.get(id).name+(active?' fra favoritter':' som favoritt'));
  }
 }
 function renderFavorites(){
  favItems.replaceChildren();
  // Favorittfeltet vises først når brukeren har stjernemerket noe.
  favBlock.hidden=!favorites.length;
  if(!favorites.length)return;
  for(const id of favorites){
   const item=R.get(id);if(!item)continue;
   const shortcut=button(item.name,'tool-favorite-shortcut',()=>open(id));shortcut.dataset.icon='star';favItems.append(shortcut);
  }
 }
 for(const item of R.all){
  const card=cardFor(item);if(!card)continue;
  card.dataset.toolId=item.id;
  const actions=document.createElement('div');actions.className='tool-card-actions';
  const star=labelled('Favoritt','star','tool-card-favorite',()=>toggle(item.id));
  const copy=labelled('Kopier lenke','link','tool-card-copy',()=>copyLink(item.id));
  cardControls.set(item.id,star);
  actions.append(star,copy);card.append(actions);
 }
 syncCards();renderFavorites();
 // These buttons remain reachable even if the corresponding dialog is open.
 // Switching always closes the current modal before opening another.
 function dialogSwitches(dialog,allowed){
  if(!dialog)return;
  const bar=document.createElement('nav');bar.className='tool-dialog-switches';
  bar.setAttribute('aria-label','Bytt klinisk arbeidsflyt');
  for(const [id,label] of allowed)bar.append(button(label,'tool-dialog-switch',()=>open(id)));
  const head=dialog.querySelector('.tool-modal-head,.isbar-toolbar');
  if(head){if(head.classList.contains('tool-modal-head'))head.after(bar);else head.prepend(bar)}
 }
 dialogSwitches($('clinicalToolDialog'),[['news2','NEWS2'],['isbar','ISBAR']]);
 dialogSwitches($('isbarDialog'),[['news2','NEWS2'],['gcs','GCS']]);
 window.KartleggToolNavigation=Object.freeze({
  open,copyLink,directLink,toggleFavorite:toggle,
  applyFavorites(value){favorites=R.sanitizeFavorites(value);persist();renderFavorites();syncCards()},
  get favorites(){return [...favorites]}
 });
 // A deep link can be bookmarked or shared; only allow exact registry IDs.
 const param=new URLSearchParams(window.location.search).get('tool');
 if(param&&(param==='isbar'||R.get(param))){
  const openDeepLink=()=>open(param);
  if(document.readyState==='complete')openDeepLink();
  else window.addEventListener('load',openDeepLink,{once:true});
 }
})();
