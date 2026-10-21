/* Kartlegg – tiltenkt formål og lisenser.
 * Viser en kort påminnelse om formålet ved skårene og i hvert verktøy, og lenker hvert verktøykort
 * til sin oppføring under «Kilder og lisenser». Endrer ingen beregninger.
 */
'use strict';
(()=>{
 const NOTE='Kun til opplæring og øving. Ikke medisinsk utstyr, og ikke for vurdering eller behandling av virkelige pasienter.';
 function note(){const p=document.createElement('p');p.className='purpose-note';p.textContent=NOTE;return p}
 // Ved skårene for NEWS2 og qSOFA.
 const scores=document.querySelector('#resultater>.scores');
 if(scores&&!document.querySelector('#resultater>.purpose-note'))scores.after(note());
 // I hvert verktøyvindu, nederst. Innholdet i et vindu byttes når et nytt verktøy åpnes, så påminnelsen
 // legges inn på nytt ved behov. Innstillingsark og personlige hilsener er ikke verktøy.
 const SKIP=new Set(['personalModePopup','marithaPopup']);
 function mark(dialog){
  if(!(dialog instanceof HTMLDialogElement)||dialog.classList.contains('settings-sheet')||SKIP.has(dialog.id))return;
  const host=dialog.querySelector('.dialog-body')||dialog,current=host.querySelector(':scope>.purpose-note');
  if(current&&current===host.lastElementChild)return;
  host.append(current||note());
 }
 document.querySelectorAll('dialog').forEach(mark);
 new MutationObserver(list=>{const seen=new Set();for(const m of list){const d=m.target.closest?.('dialog')||(m.target.matches?.('dialog')?m.target:null);if(d)seen.add(d);for(const n of m.addedNodes)if(n.nodeType===1){if(n.matches('dialog'))seen.add(n);n.querySelectorAll?.('dialog').forEach(x=>seen.add(x))}}seen.forEach(mark)})
  .observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
 // «Kilde og lisens» på hvert kort i Kliniske verktøy.
 function showLicense(id){
  window.KartleggShowPage?.('lisenser');
  const item=document.getElementById('lisens-'+id);
  if(item)setTimeout(()=>{item.scrollIntoView({block:'start'});item.classList.add('is-target');const h=item.querySelector('h3');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}},300);
 }
 for(const card of document.querySelectorAll('#page-verktoy [data-tool-id]')){
  const id=card.dataset.toolId;
  if(!document.getElementById('lisens-'+id)||card.querySelector('.tool-card-license'))continue;
  const b=document.createElement('button');b.type='button';b.className='btn-inline tool-card-license';b.textContent='Kilde og lisens';
  b.setAttribute('aria-label','Kilde og lisens for '+(card.querySelector('h3')?.textContent.trim()||id));
  b.addEventListener('click',()=>showLicense(id));
  const footer=card.querySelector('.tool-card-footer');footer?footer.before(b):card.append(b);
 }
 window.KartleggPurpose=Object.freeze({text:NOTE,showLicense});
})();
