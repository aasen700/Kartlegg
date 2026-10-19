/* Kartlegg Simulering v0.1 — purely client-side fictional scenario interface.
 * No network, no clinical chart writes, no patient identifiers, no persistence.
 */
'use strict';
(()=>{
 const Engine=window.KartleggSimulationEngine;
 const root=document.getElementById('simulationRoot');
 if(!Engine||!root)return;
 let state=Engine.start(),started=false;
 const elt=(tag,cls,text)=>{
  const n=document.createElement(tag);if(cls)n.className=cls;
  if(text!==undefined)n.textContent=text;
  return n;
 };
 const button=(text,cls,cb)=>{
  const b=elt('button',cls,text);b.type='button';b.addEventListener('click',cb);return b;
 };
 const section=(title,cls)=>{
  const wrap=elt('section','sim-panel '+(cls||''));
  wrap.append(elt('h3','sim-panel-heading',title));
  return wrap;
 };
 const addParagraph=(to,txt,cls='sim-hint')=>{to.append(elt('p',cls,txt));};
 const sameTabLink=(label,url)=>{
  const a=elt('a','sim-reference',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;
 };
 function begin(){started=true;state=Engine.start();render()}
 function choose(id){
  try{state=Engine.step(state,id);render();root.querySelector('#simLatest')?.focus({preventScroll:true})}
  catch(e){announce(e.message)}
 }
 function announce(msg){const el=root.querySelector('#simAnnounce');if(el)el.textContent=msg}
 function confirmRestart(){
  if(!window.confirm('Starte øvingen på nytt? Nåværende øvingsvalg slettes fra denne fanen.'))return;
  begin();
 }
 function latest(panel){
  const last=state.timeline.at(-1);
  if(!last)return;
  const event=elt('div','sim-latest');event.id='simLatest';event.tabIndex=-1;
  event.append(elt('span','sim-eyebrow','Ny hendelse · +'+last.minute+' min (simulert)'));
  event.append(elt('strong','',last.label));
  addParagraph(event,last.text,'sim-copy');
  if(state.worsened&&!Engine.has(state,'contact')){
   addParagraph(event,'Merk: Det fiktive scenarioet har gått over i en forhåndsdefinert forverringsfase. Vurder å gjenta observasjoner og tilkalle hjelp.','sim-deterioration');
  }
  panel.append(event);
 }
 function vitalPanel(){
  const panel=section('Observerte målinger','sim-vitals');
  if(!state.lastVitals){
   addParagraph(panel,'Ingen vitale målinger er tatt i denne øvingen. Velg «Mål vitale parametere» før du vurderer skår.');return panel;
  }
  const v=state.lastVitals;
  const grid=elt('dl','sim-vital-grid');
  for(const [label,value] of [
   ['Respirasjonsfrekvens',v.rr+' /min'],
   ['SpO₂',v.spo2+' %'],
   ['Systolisk BT',v.sbp+' mmHg'],
   ['Puls',v.hr+' /min'],
   ['Temperatur',v.temp.toFixed(1).replace('.',',')+' °C'],
   ['Bevissthet',v.conscious+(v.confusion?' · ny forvirring':' · ingen ny forvirring')],
   ['Oksygen',v.oxygen?'Tilført':'Romluft'],
   ['SpO₂-skala','1']
  ]){
   const box=elt('div','sim-vital');
   box.append(elt('dt','',label),elt('dd','',value));grid.append(box);
  }
  panel.append(grid);
  addParagraph(panel,'Dette er siste målte sett med syntetiske data. Ved forverring må du selv velge nye observasjoner for å oppdatere verdiene.','sim-hint');
  return panel;
 }
 function newsPanel(){
  const panel=section('Din NEWS2-vurdering','sim-news');
  addParagraph(panel,'Beregn NEWS2 ut fra de målte, fiktive parameterne. Oppgi din totalskår. Fasit og delpoeng kommer i oppsummeringen.');
  const link=sameTabLink('Åpne Kartleggs NEWS2 i ny fane ↗','?tool=news2#vurdering');
  panel.append(link);
  if(!state.lastVitals){addParagraph(panel,'Ta først et sett vitale målinger for å få grunnlag for skåring.');return panel}
  const f=elt('form','sim-inline-form');
  const lab=elt('label','sim-form-label','Din beregnede NEWS2');
  const input=elt('input','sim-number');input.type='number';input.min='0';input.max='30';input.step='1';input.required=true;
  input.inputMode='numeric';input.autocomplete='off';input.setAttribute('aria-label','Din beregnede NEWS2-totalskår');
  if(state.enteredNews!==null)input.value=String(state.enteredNews);
  const save=elt('button','btn btn-primary','Lagre skår');save.type='submit';
  lab.append(input);f.append(lab,save);
  const msg=elt('p','sim-form-status');msg.setAttribute('role','status');
  f.addEventListener('submit',e=>{
   e.preventDefault();
   try{state=Engine.recordNews(state,Number(input.value));render();announce('NEWS2-svaret ditt er lagret kun i denne økten. Fasit vises når du avslutter.')}
   catch(err){msg.textContent=err.message}
  });
  panel.append(f,msg);
  if(state.enteredNews!==null)addParagraph(panel,'Registrert totalskår: '+state.enteredNews+'. Du kan endre svaret før avslutning.');
  return panel;
 }
 function isbarPanel(){
  const panel=section('ISBAR – øv på strukturert kommunikasjon','sim-isbar');
  addParagraph(panel,'Skriv kort hva du ville formidlet. Ingen KI vurderer teksten, og den sendes ikke til noen tjeneste. Sammenlign med sjekklisten etterpå.');
  const f=elt('form','sim-isbar-form'),vals=state.isbar||{};
  for(const [id,lab,prompt] of [
   ['s','S – Situasjon','Hva skjer nå, og hvorfor ringer du?'],
   ['b','B – Bakgrunn','Relevant tidligere sykdom og forløp?'],
   ['a','A – Aktuell vurdering','Hva har du faktisk observert, inkludert eventuelle vitale målinger?'],
   ['r','R – Råd / respons','Hva ønsker du at mottakeren skal vurdere eller gjøre?']
  ]){
   const label=elt('label','sim-form-label',lab);
   const txt=elt('textarea','sim-textarea');txt.name=id;txt.rows=2;txt.maxLength=700;txt.required=true;
   txt.placeholder=prompt;txt.value=vals[id]||'';label.append(txt);f.append(label);
  }
  const save=elt('button','btn btn-primary','Lagre ISBAR-utkast');save.type='submit';f.append(save);
  const msg=elt('p','sim-form-status');msg.setAttribute('role','status');f.append(msg);
  f.addEventListener('submit',e=>{
   e.preventDefault();
   const vals=Object.fromEntries([...f.querySelectorAll('textarea')].map(t=>[t.name,t.value]));
   try{state=Engine.recordIsbar(state,vals);render();announce('ISBAR-utkastet er lagret midlertidig i denne fanen.')}
   catch(err){msg.textContent=err.message}
  });
  panel.append(f);
  if(state.isbar)addParagraph(panel,'Utkast registrert. Du kan redigere det før du avslutter.');
  return panel;
 }
 function actionPanel(){
  const panel=section('Velg neste handling','sim-actions');
  addParagraph(panel,'Velg hva du ønsker å undersøke eller gjøre. Ingen handling er automatisk riktig i alle situasjoner. Hendelsesforløpet følger et forhåndsskrevet manus.');
  const categories=[...new Set(Engine.actions.map(a=>a.category))];
  for(const category of categories){
   const list=elt('div','sim-action-group');
   list.append(elt('h4','',category));
   const group=elt('div','sim-action-list');
   for(const a of Engine.actions.filter(x=>x.category===category)){
    const allowed=Engine.can(state,a.id);
    const b=button(a.label+(allowed?'':' ✓'),'sim-action',()=>choose(a.id));
    b.disabled=!allowed;b.setAttribute('aria-label',a.label+(allowed?'':' – allerede utført eller ikke tilgjengelig'));
    group.append(b);
   }
   list.append(group);panel.append(list);
  }
  return panel;
 }
 function notesPanel(){
  const panel=section('Hendelseslogg','sim-log');
  if(!state.timeline.length){addParagraph(panel,'Handlingene dine vises fortløpende her.');return panel}
  const ol=elt('ol','sim-timeline');
  for(const evt of state.timeline){
   const li=elt('li');
   li.append(elt('strong','',evt.minute+' min · '+evt.label));
   addParagraph(li,evt.text);ol.append(li);
  }
  panel.append(ol);return panel;
 }
 function reportPanel(){
  const report=Engine.debrief(state);
  const panel=section('Oppsummering av øvingen','sim-report');
  addParagraph(panel,'Dette er en pedagogisk sjekkliste mot en fast kasusmodell, ikke en automatisk faglig godkjenning.','sim-copy');
  const summary=elt('div','sim-report-summary');
  summary.append(elt('p','', 'Simulert tid: '+report.minutes+' minutter'));
  summary.append(elt('p','', 'NEWS2 fra sist målte sett: '+report.score));
  if(report.entered!==null)summary.append(elt('p','', 'Din registrering: '+report.entered+(report.entered===report.score?' – samsvarer med beregningen.':' – avviker fra den beregnede skåren.')));
  else summary.append(elt('p','','Du registrerte ingen NEWS2-totalskår.'));
  panel.append(summary);
  const ul=elt('ul','sim-feedback');
  for(const item of report.items){
   const li=elt('li');
   li.append(elt('strong','', (item.done?'✓ ':'○ ')+item.label));
   addParagraph(li,item.reason);ul.append(li);
  }
  panel.append(ul);
  const details=elt('details','sim-details');
  details.append(elt('summary','','Vis NEWS2-delpoengene'));
  const d=elt('div','sim-parts');
  for(const [n,v] of Object.entries(report.parts)){
   const map={rr:'Respirasjon',spo:'SpO₂',sbp:'Systolisk BT',hr:'Puls',temp:'Temperatur',consciousness:'Bevissthet / ny forvirring',oxygen:'O₂'};
   d.append(elt('span','',map[n]+': '+v+' p'));
  }
  details.append(d);panel.append(details);
  if(state.isbar){
   const ref=elt('details','sim-details');
   ref.append(elt('summary','','Se og sammenlign ditt ISBAR-utkast'));
   for(const [key,title] of [['s','Situasjon'],['b','Bakgrunn'],['a','Aktuell vurdering'],['r','Råd / respons']]){
    ref.append(elt('strong','',title),elt('p','sim-copy',state.isbar[key]));
   }
   panel.append(ref);
  }
  if(report.deteriorated)addParagraph(panel,'I dette manusstyrte forløpet oppstod forverring etter forsinket eskalering. Dette er et pedagogisk valg i casen, ikke en generell prognose.','sim-deterioration');
  addParagraph(panel,report.note,'sim-hint');
  panel.append(button('Start øvingen på nytt','btn btn-primary',begin));
  return panel;
 }
 function render(){
  root.replaceChildren();
  const top=elt('div','sim-top');
  const meta=elt('div','sim-case-meta');
  top.append(meta);
  const intro=elt('p','sim-copy',Engine.caseData.opening);
  root.append(top,intro);
  if(!started){
   const overview=section('Hva øver du på?','sim-overview');
   addParagraph(overview,'Du bestemmer hvilke spørsmål, observasjoner og tiltak du gjør. Noen funn er skjult til du undersøker dem. Øv på klinisk prioritering, NEWS2 og ISBAR før du sammenligner med en refleksjonssjekkliste.');
   overview.append(button('Start pasientcasen →','btn btn-primary',begin));root.append(overview);
  }else if(state.finished){
   root.append(reportPanel());
  }else{
   const stat=elt('div','sim-status');
   stat.append(elt('span','sim-time','Simulert tid: '+state.minutes+' min'));
   stat.append(button('Start på nytt','sim-reset',confirmRestart));
   root.append(stat);
   const latestWrap=elt('div');latest(latestWrap);root.append(latestWrap);
   const columns=elt('div','sim-columns');
   const left=elt('div','sim-column'),right=elt('div','sim-column');
   left.append(actionPanel(),vitalPanel(),newsPanel());
   right.append(isbarPanel(),notesPanel());
   columns.append(left,right);root.append(columns);
   const end=elt('div','sim-finish');
   addParagraph(end,'Du kan avslutte når som helst. Oppsummeringen viser både det du gjorde og hva som eventuelt mangler.');
   end.append(button('Avslutt og se refleksjon →','btn btn-primary',()=>{state=Engine.finish(state);render();root.scrollIntoView({block:'start',behavior:'auto'})}));
   root.append(end);
  }
  const footer=elt('div','sim-references');
  addParagraph(footer,Engine.caseData.warning);
  footer.append(elt('strong','','Faglig grunnlag: '));
  for(const s of Engine.caseData.sources)footer.append(sameTabLink(s.name+' ↗',s.url));
  root.append(footer);
  const announcer=elt('p','sim-sr');announcer.id='simAnnounce';
  announcer.setAttribute('role','status');announcer.setAttribute('aria-live','polite');root.append(announcer);
 }
 render();
 window.KartleggSimulationPilot=Object.freeze({
  get started(){return started},
  get state(){return state},
  begin,
  choose,
  get root(){return root}
 });
})();
