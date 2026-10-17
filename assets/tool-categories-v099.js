/* Kartlegg v0.99 – categorised clinical toolbox.
 * Categories are a PRESENTATION layer; no scoring, storage or NEWS2 input modified.
 * Must load after every tool has registered its card.
 */
'use strict';
(()=>{
 const grid=document.querySelector('#page-verktoy .toolgrid'),library=document.getElementById('page-verktoy');
 const search=document.getElementById('toolSearch');if(!grid||!library||!search)return;
 const h=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el};
 // Expose the existing respiratory counter in the library as well as in the NEWS2 field.
 const timer=h('article','toolbox hc-tool-card v099-timer-card');timer.dataset.homecareCard='resp-timer';
 const icon=h('div','hc-card-icon','◷');icon.setAttribute('aria-hidden','true');
 const title=h('h3','','Respirasjonstimer');const tag=h('span','tool-tag','Målehjelp');
 const desc=h('p','','Tell pust over 15, 30 eller 60 sekunder. Overfør et ferdig resultat til NEWS2 bare etter eget valg.');
 const launch=h('button','btn btn-primary hc-launch','Åpne respirasjonstimer →');launch.type='button';launch.id='launchRespTimer';
 launch.addEventListener('click',()=>document.getElementById('respTimerLaunch')?.click());
 timer.append(icon,title,tag,desc,launch);grid.append(timer);
 const classification=[
  {id:'assess',name:'Kartleggingsverktøy og skårer',description:'Strukturerte vurderinger, skårer og standardiserte kartlegginger'},
  {id:'calc',name:'Kalkulatorer og målehjelp',description:'Beregninger og målinger som støtte for selvstendig observasjon'},
  {id:'guide',name:'Kliniske veiledere',description:'Observasjonstegn, prioritering og faglige oppslagsguider'}
 ];
 function category(card){
  const key=card.dataset.homecareCard||'';
  if(['ortho','resp-timer'].includes(key))return 'calc';
  if(['fast','skuv','times','pall','abcde'].includes(key))return 'guide';
  if(['mst','tug','esas'].includes(key))return 'assess';
  if(card.classList.contains('v08-bmi-card'))return 'calc';
  const heading=(card.querySelector('h3')?.textContent||'').toLocaleLowerCase('nb-NO');
  if(/news2|qsofa|gcs|4at|nrs/.test(heading))return 'assess';
  return 'guide';
 }
 const cards=[...grid.querySelectorAll('.toolbox')];let active='all';
 for(const card of cards)card.dataset.toolCategory=category(card);
 const toolbar=h('nav','v099-categories');toolbar.id='libraryCategories';toolbar.setAttribute('aria-label','Filtrer verktøy etter kategori');
 const buttons=[],options=[{id:'all',name:'Alle verktøy'},...classification.map(x=>({id:x.id,name:x.name}))];
 for(const cat of options){
  const button=h('button','v099-category-button',cat.name);button.type='button';button.dataset.category=cat.id;
  button.setAttribute('aria-pressed','false');
  const count=h('span','v099-category-count',String(cat.id==='all'?cards.length:cards.filter(c=>c.dataset.toolCategory===cat.id).length));
  button.append(count);
  button.addEventListener('click',()=>{
   active=cat.id;
   // The verified baseline search re-applies textual matches and emits kartlegg:library-filtered.
   search.dispatchEvent(new Event('input',{bubbles:true}));
  });buttons.push(button);toolbar.append(button);
 }
 const status=h('p','v099-category-status','');status.id='libraryCategoryStatus';status.setAttribute('role','status');
 const panel=grid.parentElement;panel.insertBefore(toolbar,grid);panel.insertBefore(status,grid);
 const headers={};
 for(const cat of classification){
  const heading=h('div','v099-category-heading');
  heading.dataset.categoryHeading=cat.id;
  heading.append(h('h3','',cat.name),h('p','',cat.description));
  headers[cat.id]=heading;grid.append(heading);
  for(const card of cards)if(card.dataset.toolCategory===cat.id)grid.append(card);
 }
 // All cards retain their original handlers despite reordering.
 function sync(){
  let total=0;
  const visibleCounts={assess:0,calc:0,guide:0};
  for(const card of cards){
   const textMatched=!card.hidden;
   const rightCat=active==='all'||card.dataset.toolCategory===active;
   card.hidden=!textMatched||!rightCat;
   if(!card.hidden){visibleCounts[card.dataset.toolCategory]++;total++}
  }
  for(const cat of classification)headers[cat.id].hidden=visibleCounts[cat.id]===0;
  for(const btn of buttons)btn.setAttribute('aria-pressed',String(btn.dataset.category===active));
  status.textContent=total+' av '+cards.length+' verktøy vises';
  const count=document.getElementById('toolSearchCount');
  if(count)count.textContent=total+' av '+cards.length+' verktøy';
  const empty=document.getElementById('toolNoMatches');if(empty)empty.hidden=total!==0;
 }
 // Important: lexical search dispatches this after resetting .hidden for all cards.
 search.addEventListener('kartlegg:library-filtered',sync);
 // Initialize search after all 16 cards exist; fixes stale 6/12 count on first load.
 search.dispatchEvent(new Event('input',{bubbles:true}));
 const chip=library.querySelector('.intro .chip');if(chip)chip.textContent=cards.length+' tilgjengelige verktøy';
 const description=library.querySelector('.intro p:not(.eyebrow)');
 if(description)description.textContent='Finn en kalkulator, et kartleggingsverktøy eller en klinisk veileder. Filtrer etter kategori eller søk på navn og symptomer.';
 const sectionHeader=library.querySelector('.section-header p');
 if(sectionHeader)sectionHeader.textContent='Velg fagkategori, eller søk etter et konkret verktøy.';
 window.KartleggToolCategories={get active(){return active},get total(){return cards.length}};
})();