/* Kartlegg v0.99 – ABCDE quick observation guide.
 * Educational demonstration: no patient details, decisions, storage or treatment protocols.
 * Source: Resuscitation Council UK, The ABCDE Approach (updated 2024), and 2025 First Aid Guidelines.
 */
'use strict';
(()=>{
 const grid=document.querySelector('#page-verktoy .toolgrid');if(!grid)return;
 const stages=[
  {key:'A',name:'Airway',norwegian:'Luftveier',summary:'Er luftveien fri?',
   checks:['Kan personen snakke eller svare?','Hør etter snorkelyder, gurgling eller stridor.','Se etter synlige tegn på blokkering og vurder om luftveien er truet.'],
   danger:['Manglende evne til å snakke eller puste normalt','Stridor, kvelning eller raskt økende luftveisproblem','Bevissthetssvekkelse med truet luftvei'],
   response:['Tilkall hjelp tidlig, og vurder akutt nødhjelp (113).','Håndter livstruende problemer straks før du går videre til B.','Bruk bare luftveistiltak og utstyr du er opplært til å bruke.']},
  {key:'B',name:'Breathing',norwegian:'Respirasjon',summary:'Puster personen tilstrekkelig?',
   checks:['Tell respirasjonsfrekvens og observer dybde, rytme og pustearbeid.','Observer brystkassebevegelser, hudfarge og eventuelle hjelpemuskler.','Mål SpO₂ ved tilgjengelig utstyr og vurder opplevd tungpust.'],
   danger:['Ingen eller unormal pust','Uttalt pustearbeid, cyanose eller hurtig forverring','Vedvarende alvorlig dyspné eller raskt fallende allmenntilstand'],
   response:['Ved manglende normal pust: ring 113, vurder HLR etter gjeldende retningslinjer.','Ved akutt pustebesvær: tilkall hjelp, vurder leie og tiltak innenfor kompetanse og lokale prosedyrer.','Observer effekt og gå tilbake til A dersom luftveien ikke er fri.']},
  {key:'C',name:'Circulation',norwegian:'Sirkulasjon',summary:'Er blodsirkulasjonen tilstrekkelig?',
   checks:['Vurder puls: frekvens, rytme og kvalitet.','Mål blodtrykk og observer hudtemperatur, hudfarge og kapillærfylning.','Se etter ytre blødning, kaldsvette og tegn på sirkulasjonssvikt.'],
   danger:['Store blødninger eller tegn på sjokk','Uttalt hypotensjon, svært dårlig perifer sirkulasjon eller akutt brystsmerte','Rask klinisk forverring eller mulig alvorlig hjerte-/karsykdom'],
   response:['Tilkall akutt hjelp ved mistanke om sirkulasjonssvikt.','Stans livstruende ytre blødning etter opplæring og gjeldende prosedyrer.','Gjenta målinger, vurder utvikling og kommuniser observasjonene tydelig.']},
  {key:'D',name:'Disability',norwegian:'Nevrologisk status',summary:'Er det en akutt nevrologisk endring?',
   checks:['Vurder bevissthet og respons (AVPU), eventuelt GCS ved kompetanse.','Observer pupiller, orientering og nye endringer i tale eller kraft.','Mål blodsukker dersom relevant og tilgjengelig; vurder kramper eller fokale tegn.'],
   danger:['Ny bevissthetssvekkelse eller pågående kramper','Plutselig talevanske, ansiktsskjevhet eller lammelser (slagmistanke)','Uforklart alvorlig endring i mental status'],
   response:['Ring 113 straks ved mistanke om hjerneslag eller annen livstruende nevrologisk hendelse.','Beskytt pasienten mot skade; undersøk alltid først A–C ved forverring.','Vurder relevante, kompetansebaserte tiltak etter lokale prosedyrer.']},
  {key:'E',name:'Exposure',norwegian:'Helkropp og omgivelser',summary:'Finnes andre viktige funn?',
   checks:['Mål temperatur og se etter utslett, skade, hevelse eller tegn på infeksjon.','Undersøk relevante hudområder med hensyn til privatliv og verdighet.','Vurder smerte, miljø, væsketap, medikamenter og mulige utløsende hendelser.'],
   danger:['Kraftig nedkjøling eller overoppheting','Utbredt utslett med alvorlig allmennpåvirkning','Alvorlig skade, sepsis-mistanke eller pågående forverring'],
   response:['Forebygg varmetap; skjerm pasienten og begrens unødig avkledning.','Meld alvorlige funn og tilkall hjelp tidlig.','Gjenta ABCDE etter tiltak og dokumenter funn i virksomhetens ordinære system.']}
 ];
 const h=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
 const card=h('article','toolbox hc-tool-card abcde-v099-card');card.dataset.homecareCard='abcde';
 const icon=h('div','hc-card-icon','A–E');icon.setAttribute('aria-hidden','true');
 const title=h('h3','','ABCDE-vurdering'),tag=h('span','tool-tag','Akutt observasjon');
 const desc=h('p','','Interaktiv gjennomgang av luftvei, respirasjon, sirkulasjon, nevrologi og helkropp – i prioritert rekkefølge.');
 const launch=h('button','btn btn-primary hc-launch','Åpne ABCDE');launch.type='button';launch.id='launchABCDE';
 card.append(icon,title,tag,desc,launch);grid.insertBefore(card,grid.querySelector('.toolbox'));
 const dialog=h('dialog','v08-dialog hc-dialog abcde-v099-dialog');dialog.id='abcdeDialog';dialog.setAttribute('aria-labelledby','abcdeTitle');document.body.append(dialog);
 let active=0,tabs=[],panel,stepInfo;
 function section(parent,title,items){
  const block=h('section','abcde-v099-section');block.append(h('h4','',title));
  const list=h('ul');for(const item of items)list.append(h('li','',item));block.append(list);parent.append(block);
 }
 function select(n,shouldFocus=false){
  active=n;tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===n));tab.tabIndex=i===n?0:-1});
  const stage=stages[n];panel.replaceChildren();
  const header=h('div','abcde-v099-current');
  header.append(h('span','abcde-v099-current-letter',stage.key));
  const text=h('div');text.append(h('h3','',stage.name+' – '+stage.norwegian),h('p','',stage.summary));header.append(text);panel.append(header);
  section(panel,'Observer / undersøk',stage.checks);
  section(panel,'Alvorlige tegn: tilkall hjelp',stage.danger);
  section(panel,'Prioritering og videre tiltak',stage.response);
  const foot=h('p','abcde-v099-reassess','Ved truet A, B eller C: håndter problemet og tilkall hjelp FØR neste steg. Gjenta hele ABCDE etter tiltak.');
  panel.append(foot);
  stepInfo.textContent=(n+1)+' av '+stages.length+' – '+stage.norwegian;
  const previous=document.getElementById('abcdePrevious'),next=document.getElementById('abcdeNext');
  if(previous)previous.disabled=n===0;if(next)next.textContent=n===stages.length-1?'Tilbake til A ↺':'Neste: '+stages[n+1].key+'';
  if(shouldFocus)tabs[n].focus();
 }
 function open(){
  dialog.replaceChildren();
  const head=h('div','v08-dialog-head');const copy=h('div');
  const heading=h('h2','','Systematisk primærvurdering med ABCDE');heading.id='abcdeTitle';copy.append(heading);
  const close=h('button','dialog-close','×');close.type='button';close.setAttribute('aria-label','Lukk ABCDE');
  close.addEventListener('click',()=>dialog.close());head.append(copy,close);
  const body=h('div','v08-dialog-content abcde-v099-content');
  const emergency=h('div','abcde-v099-emergency');
  emergency.append(h('strong','','Før A: vurder sikkerhet, respons og eventuell livstruende ytre blødning. Tilkall hjelp tidlig.'));
  emergency.append(h('p','','Ved akutt livstruende sykdom: ring 113. Er personen bevisstløs og puster ikke normalt, følg gjeldende HLR-råd. Ikke gjennomfør alle trinn før hjelp tilkalles.'));
  body.append(emergency,h('p','hc-hint','ABCDE er en systematisk og gjentatt vurdering, ikke en poengskår. Behandle livstruende problemer før du går videre, innenfor din kompetanse og gjeldende prosedyrer.'));
  const nav=h('div','abcde-v099-tabs');nav.setAttribute('role','tablist');nav.setAttribute('aria-label','ABCDE-trinn');
  tabs=[];panel=h('section','abcde-v099-panel');panel.id='abcdeStagePanel';panel.setAttribute('role','tabpanel');panel.tabIndex=0;
  stages.forEach((stage,i)=>{
   const b=h('button','abcde-v099-tab',stage.key);b.type='button';b.id='abcdeTab'+stage.key;b.setAttribute('aria-label',stage.name+' – '+stage.norwegian);
   b.setAttribute('role','tab');b.setAttribute('aria-controls','abcdeStagePanel');
   b.addEventListener('click',()=>select(i));
   b.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
    const n=e.key==='Home'?0:e.key==='End'?4:(i+(e.key==='ArrowRight'?1:4))%5;select(n,true);
   });
   nav.append(b);tabs.push(b);
  });
  stepInfo=h('span','abcde-v099-step','');
  const footer=h('div','abcde-v099-actions');
  const previous=h('button','btn btn-secondary','← Forrige');previous.type='button';previous.id='abcdePrevious';previous.addEventListener('click',()=>select(Math.max(0,active-1)));
  const next=h('button','btn btn-primary','Neste: B');next.type='button';next.id='abcdeNext';next.addEventListener('click',()=>select(active===4?0:active+1));
  footer.append(previous,stepInfo,next);
  const disclaimer=h('p','hc-hint','Ingen resultater lagres. Funn må dokumenteres i ordinært journalsystem. Denne demoen erstatter ikke opplæring, akuttprosedyrer eller klinisk hjelp.');
  const link=h('a','hc-source','Faggrunnlag: Resuscitation Council UK – ABCDE');
  link.href='https://www.resus.org.uk/library/abcde-approach';link.target='_blank';link.rel='noopener noreferrer';
  body.append(nav,panel,footer,disclaimer,link);dialog.append(head,body);
  select(0);dialog.showModal();
 }
 launch.addEventListener('click',open);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>{if(dialog.open)return;dialog.replaceChildren();tabs=[];panel=null;stepInfo=null});
 window.KartleggABCDE={open};
})();