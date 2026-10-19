/* Kartlegg – ett felles oppsett for alle kort i verktøybiblioteket.
 * Kjører etter at alle verktøymoduler har lagt inn kortene sine. Flytter eksisterende knapper
 * (med sine hendelser) inn i samme struktur og gir hvert verktøy sitt eget ikon.
 * Ingen klinisk logikk, lagring eller nettverk.
 */
'use strict';
(()=>{
 const R=window.KartleggToolRegistry,icons=window.KartleggIconSystem;
 const library=document.querySelector('#page-verktoy .toolgrid');
 if(!R||!icons||!library)return;
 const h=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
 // NEWS2 og qSOFA beregnes på forsiden; kortet sender brukeren dit.
 const assessmentLabels={news2:'Gå til NEWS2 →',qsofa:'Gå til qSOFA →'};
 function launchFor(card,id){
  const item=R.get(id);
  const own=item&&item.launchSelector&&!['.toolbox','.tool-launch'].includes(item.launchSelector)?card.querySelector(item.launchSelector):null;
  return own||card.querySelector(':scope > .tool-launch, :scope > .hc-launch, :scope > .v08-body-launch, :scope > .btn-primary');
 }
 function normalize(card){
  const id=card.dataset.toolId;
  if(!id||card.classList.contains('tool-card'))return;
  const heading=card.querySelector(':scope > h3');
  if(!heading)return;
  card.classList.add('tool-card');
  // Fjern gamle dekorikoner: boks over tittelen og ikon inne i tittelen.
  card.querySelectorAll(':scope > .hc-card-icon, :scope > .v08-tool-icon').forEach(el=>el.remove());
  heading.querySelectorAll('.ui-icon-svg').forEach(el=>el.remove());
  heading.dataset.uiActionIcon='tool-card';
  heading.textContent=heading.textContent.replace(/^\s*[^\p{L}\p{N}]+\s*/u,'').trim();
  const tag=card.querySelector(':scope > .tool-tag');
  const head=h('div','tool-card-head');
  const icon=h('span','tool-card-icon');icon.setAttribute('aria-hidden','true');icon.innerHTML=icons.svg(icons.toolIcon(id));
  const titles=h('div','tool-card-titles');titles.append(heading);if(tag)titles.append(tag);
  head.append(icon,titles);
  card.prepend(head);
  const description=card.querySelector(':scope > p');
  if(description)description.classList.add('tool-card-description');
  // Handlinger nederst: én hovedknapp og en rad med sekundærvalg.
  const footer=h('div','tool-card-footer');
  let primary=launchFor(card,id);
  if(!primary&&assessmentLabels[id]){
   primary=h('button','btn btn-primary tool-card-open',assessmentLabels[id]);primary.type='button';
   primary.addEventListener('click',()=>window.KartleggToolNavigation?.open(id));
  }
  if(primary){
   primary.classList.add('tool-card-primary');
   // Korte, like knappetekster; fullt verktøynavn for skjermlesere.
   const item=R.get(id),name=item?.name||heading.textContent;
   if(!assessmentLabels[id]){
    primary.textContent=name.length<=12?'Åpne '+name+' →':item?.category==='guide'?'Åpne veileder →':item?.category==='learn'?'Start øving →':'Åpne verktøy →';
   }
   primary.setAttribute('aria-label',(assessmentLabels[id]?'Gå til ':'Åpne ')+name);
   footer.append(primary);
  }
  // Favoritt og lenke som ikonknapper ved siden av hovedknappen; «Lær»-snarveien som lenke over.
  const actions=card.querySelector(':scope > .tool-card-actions');
  if(actions){
   const learn=[...actions.querySelectorAll('.gcs-learn-card-button,.learn12-card-shortcut')];
   if(learn.length){
    const row=h('div','tool-card-learn');
    learn.forEach(b=>{b.classList.add('tool-card-learn-link');row.append(b)});
    card.insertBefore(row,card.querySelector(':scope > .criteria-wrap')||null);
   }
   const name=R.get(id)?.name||heading.textContent;
   const copy=actions.querySelector('.tool-card-copy');
   if(copy){copy.setAttribute('aria-label','Kopier lenke til '+name);copy.title='Kopier lenke';}
   const star=actions.querySelector('.tool-card-favorite');
   if(star)star.title='Favoritt';
   footer.append(actions);
  }
  card.append(footer);
 }
 const run=()=>library.querySelectorAll('.toolbox[data-tool-id]').forEach(normalize);
 run();
 new MutationObserver(run).observe(library,{childList:true});
 window.KartleggToolCards=Object.freeze({refresh:run});
})();
