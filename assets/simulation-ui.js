/* Kartlegg Simulering v0.3 — purely client-side fictional scenario interface.
 * No network, no clinical chart writes, no patient identifiers. Only which cases are finished
 * is remembered, through KartleggLearningProgress; the case itself stays in memory.
 */
'use strict';
(()=>{
 const Engine=window.KartleggSimulationEngine;
 const root=document.getElementById('simulationRoot');
 if(!Engine||!root)return;
 let state=Engine.start(),started=false;
 const Progress=()=>window.KartleggLearningProgress;
 const current=()=>Engine.getCase(state.caseId)||Engine.caseData;
 const heading=document.getElementById('simHeading');
 const elt=(tag,cls,text)=>{
  const n=document.createElement(tag);if(cls)n.className=cls;
  if(text!==undefined)n.textContent=text;
  return n;
 };
 const ICONS={
  symptoms:'<path d="M4 5h16v11H9l-5 4Z"/>',
  history:'<path d="M7 3h8l4 4v14H7Z"/><path d="M10 11h6M10 15h6"/>',
  relative:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 2 6 5"/>',
  abcde:'<path d="M8 4h8v3H8Z"/><path d="M6 6H5v15h14V6h-1"/><path d="m9 14 2 2 4-5"/>',
  vitals:'<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  mental:'<path d="M12 3a7 7 0 0 0-7 7c0 3 2 4 2 6v4h7v-3h3l1-4h2l-2-4a7 7 0 0 0-6-6Z"/>',
  skin:'<path d="M8 21v-9l-2-3a1.5 1.5 0 0 1 2.5-1.6L10 10V4a1.5 1.5 0 0 1 3 0v6-1.5a1.5 1.5 0 0 1 3 0V10a1.5 1.5 0 0 1 3 0v5c0 3-2 6-5 6Z"/>',
  glucose:'<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/>',
  contact:'<path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  reevaluate:'<path d="M20 11a8 8 0 1 0-2 5"/><path d="M20 4v7h-7"/>',
  wait:'<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>'
 };
 function icon(id){
  const span=document.createElement('span');span.className='sim-action-icon';span.setAttribute('aria-hidden','true');
  span.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">'+(ICONS[id]||'')+'</svg>';
  return span;
 }
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
 function begin(id){started=true;state=Engine.start(typeof id==='string'?id:current().id);render()}
 function toChooser(){started=false;state=Engine.start(current().id);render();root.scrollIntoView?.({block:'start',behavior:'auto'})}
 function finishCase(){
  state=Engine.finish(state);
  const report=Engine.debrief(state);
  Progress()?.record('sim:'+state.caseId,'test',{correct:report.items.filter(x=>x.done).length,total:report.items.length});
  render();root.scrollIntoView({block:'start',behavior:'auto'});
 }
 function choose(id){
  try{state=Engine.step(state,id);render();root.querySelector('#simLatest')?.focus({preventScroll:true})}
  catch(e){announce(e.message)}
 }
 function announce(msg){const el=root.querySelector('#simAnnounce');if(el)el.textContent=msg}
 function confirmRestart(){
  if(!window.confirm('Starte øvingen på nytt? Nåværende øvingsvalg slettes fra denne fanen.'))return;
  begin(state.caseId);
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
   ['SpO₂-skala',String(v.scale||1)]
  ]){
   const box=elt('div','sim-vital');
   box.append(elt('dt','',label),elt('dd','',value));grid.append(box);
  }
  panel.append(grid);
  addParagraph(panel,'Dette er siste målte sett med syntetiske data. Ved forverring må du selv velge nye observasjoner for å oppdatere verdiene.','sim-hint');
  return panel;
 }
 // Verdien som står i hver rad i NEWS2-skjemaet.
 function rowValue(id,v){
  return {rr:v.rr+' /min',spo:v.spo2+' % · skala '+(v.scale||1),sbp:v.sbp+' mmHg',hr:v.hr+' /min',
   temp:v.temp.toFixed(1).replace('.',',')+' °C',consciousness:v.conscious+(v.confusion?' · ny forvirring':' · ingen ny forvirring'),
   oxygen:v.oxygen?'Tilført O₂':'Romluft'}[id];
 }
 function pickCell(rowId,index,score){
  try{
   const sel='.sim-news-chart [data-part="'+rowId+'"][data-column="'+index+'"]';
   const top=root.querySelector(sel)?.getBoundingClientRect().top;
   state=Engine.recordNewsCell(state,rowId,index);render();
   // Skjemaet tegnes på nytt. Hold feltet du trykket på på samme sted på skjermen.
   const cell=root.querySelector(sel);
   if(cell&&top!==undefined)window.scrollBy(0,cell.getBoundingClientRect().top-top);
   cell?.focus({preventScroll:true});
   announce(Engine.rowNames[rowId]+': '+score+' poeng valgt'+(state.enteredNews!==null?'. Alle rader er skåret. Din sum er '+state.enteredNews+'.':''));
  }catch(e){announce(e.message)}
 }
 function newsChart(chart){
  const C=window.KartleggLearningContent;
  const scroll=elt('div','learn12-news-scroll sim-news-chart');
  const table=elt('div','learn12-score-grid learn12-news-chart');
  table.setAttribute('role','group');table.setAttribute('aria-label','NEWS2-skjema: velg ett poengfelt i hver rad');
  const head=elt('div','learn12-score-head');head.append(elt('span','','Observasjon'));
  for(const p of C.newsChartColumns)head.append(elt('span','',p+' poeng'));
  table.append(head);
  for(const id of Engine.rows){
   const item=elt('div','learn12-score-row'),desc=elt('div','learn12-row-name');
   desc.append(elt('strong','',Engine.rowNames[id]),elt('small','',rowValue(id,chart.vitals)));item.append(desc);
   const row=Engine.chartRow(id,chart.vitals);
   C.newsChartColumns.forEach((score,i)=>{
    const label=row.labels[i];
    if(!label){const none=elt('span','learn12-score-void','—');none.setAttribute('aria-hidden','true');item.append(none);return}
    const chosen=chart.cells[id]===i;
    const b=button('','learn12-score-option learn12-news-cell'+(chosen?' is-selected is-score-'+score:''),()=>pickCell(id,i,score));
    b.dataset.part=id;b.dataset.column=String(i);b.dataset.score=String(score);
    b.setAttribute('aria-pressed',String(chosen));
    b.setAttribute('aria-label',Engine.rowNames[id]+': '+score+' poeng – '+label);
    b.append(elt('span','learn12-news-range',label));item.append(b);
   });
   table.append(item);
  }
  scroll.append(table);
  return scroll;
 }
 function newsPanel(){
  const panel=section('Din NEWS2-vurdering','sim-news');
  const charts=state.charts||[];
  if(!charts.length){addParagraph(panel,'Ta først et sett vitale målinger. Da får du NEWS2-skjemaet her.');return panel}
  if(!window.KartleggLearningContent?.newsChartRow){addParagraph(panel,'NEWS2-skjemaet kunne ikke lastes. Last inn siden på nytt.');return panel}
  const chart=charts.at(-1);
  addParagraph(panel,'Trykk på riktig poengfelt i hver rad. Summen regnes ut mens du skårer. Fasit og forklaring kommer i oppsummeringen.');
  if(charts.length>1){
   const first=charts[0],answered=Object.keys(first.cells).length;
   addParagraph(panel,'Nye målinger etter '+chart.minute+' min. Skår på nytt. '+(answered===Engine.rows.length?'Din første skåring var '+Engine.chartSum(first)+' poeng.':'Den første skåringen ble ikke fullført.'),'sim-news-round');
  }
  panel.append(newsChart(chart));
  const answered=Engine.rows.filter(r=>Number.isInteger(chart.cells[r])).length;
  const sum=elt('div','sim-news-sum');sum.setAttribute('aria-live','polite');
  sum.append(elt('strong','',answered+' av '+Engine.rows.length+' rader skåret'),elt('span','','Din sum: '+Engine.chartSum(chart)+' poeng'+(answered===Engine.rows.length?'':' så langt')));
  panel.append(sum);
  return panel;
 }
 function chartReport(c,index,total){
  const box=elt('div','sim-chart-report');
  const title=total>1?(index===0?'Første måling':'Ny måling')+' (etter '+c.minute+' min)':'Din NEWS2-skåring';
  box.append(elt('strong','sim-chart-title',title));
  addParagraph(box,(c.complete?'Din sum: '+c.entered+' poeng. ':'Skjemaet ble ikke fullført ('+c.answered+' av 7 rader). ')+'Riktig NEWS2: '+c.total+' poeng. Du valgte riktig felt i '+c.correctRows+' av 7 rader.','sim-copy');
  const ul=elt('ul','sim-chart-rows');
  for(const r of c.rows){
   const li=elt('li',r.ok?'is-ok':'is-wrong');
   li.append(elt('strong','',(r.ok?'✓ ':'○ ')+r.name+': '+r.points+' poeng'));
   addParagraph(li,'Målt: '+rowValue(r.id,c.vitals)+'. '+(r.ok?'Riktig felt: '+r.correct+'.':'Ditt felt: '+(r.chosen||'ikke valgt')+'. Riktig felt: '+r.correct+'.'),'sim-hint');
   ul.append(li);
  }
  box.append(ul);
  return box;
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
    const b=button('','sim-action',()=>choose(a.id));
    b.append(icon(a.id),elt('span','sim-action-label',a.label+(allowed?'':' ✓')));
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
  if(!report.charts.length)summary.append(elt('p','','Du skåret ikke NEWS2 i skjemaet.'));
  else if(report.charts.length>1)summary.append(elt('p','','Riktig NEWS2 endret seg fra '+report.charts[0].total+' til '+report.charts.at(-1).total+' poeng. Din skåring: '+report.charts.map(c=>c.complete?c.entered:'ikke fullført').join(' → ')+'.'));
  panel.append(summary);
  if(report.charts.length){
   const details=elt('details','sim-details sim-chart-details');details.open=true;
   details.append(elt('summary','','Se NEWS2-skjemaet ditt rad for rad'));
   report.charts.forEach((c,i)=>details.append(chartReport(c,i,report.charts.length)));
   panel.append(details);
  }
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
  if(report.isbarExample){
   const ex=elt('details','sim-details sim-isbar-example');
   ex.append(elt('summary','',state.isbar?'Sammenlign ISBAR-utkastet ditt med et eksempel':'Se et eksempel på ISBAR for denne casen'));
   addParagraph(ex,'Et eksempel er ikke en fasit. Poenget er at mottakeren raskt forstår hva som skjer, hva du har sett, og hva du ber om.','sim-hint');
   const grid=elt('div','sim-isbar-compare');
   for(const [key,title] of [['s','S – Situasjon'],['b','B – Bakgrunn'],['a','A – Aktuell vurdering'],['r','R – Råd / respons']]){
    const row=elt('div','sim-isbar-row');row.append(elt('strong','',title));
    if(state.isbar){const mine=elt('div','sim-isbar-mine');mine.append(elt('small','','Ditt utkast'),elt('p','',state.isbar[key]));row.append(mine)}
    const theirs=elt('div','sim-isbar-theirs');theirs.append(elt('small','','Eksempel'),elt('p','',report.isbarExample[key]));row.append(theirs);
    grid.append(row);
   }
   ex.append(grid);panel.append(ex);
  }
  if(state.isbar&&!report.isbarExample){
   const ref=elt('details','sim-details');
   ref.append(elt('summary','','Se og sammenlign ditt ISBAR-utkast'));
   for(const [key,title] of [['s','Situasjon'],['b','Bakgrunn'],['a','Aktuell vurdering'],['r','Råd / respons']]){
    ref.append(elt('strong','',title),elt('p','sim-copy',state.isbar[key]));
   }
   panel.append(ref);
  }
  if(report.lesson){const box=elt('div','sim-lesson');box.append(elt('strong','','Læringspoeng i denne casen'));addParagraph(box,report.lesson,'sim-copy');panel.append(box)}
  if(report.deteriorated)addParagraph(panel,'I dette manusstyrte forløpet oppstod forverring etter forsinket eskalering. Dette er et pedagogisk valg i casen, ikke en generell prognose.','sim-deterioration');
  addParagraph(panel,report.note,'sim-hint');
  const again=elt('div','sim-report-actions');
  again.append(button('Velg en annen case →','btn btn-primary',toChooser),button('Start casen på nytt','btn btn-secondary',()=>begin(state.caseId)));
  panel.append(again);
  return panel;
 }
 function caseHeader(c){
  const top=elt('div','sim-top');
  const meta=elt('p','sim-case-meta');
  meta.append(elt('span','sim-case-level',c.level),elt('span','sim-case-patient',c.patient+' · '+c.setting));
  const worse=Boolean(started&&state.worsened);
  const fig=elt('figure','sim-scene'+(worse?' is-worse':''));
  const img=elt('img','sim-scene-img');img.src=c.images[worse?'worse':'stable'];img.decoding='async';
  img.alt='Illustrasjon av '+c.patient.replace(' (fiktiv)','')+(worse?', som nå er tydelig dårligere':'')+'. Fiktiv og stilisert.';
  img.width=720;img.height=400;
  fig.append(img);
  if(worse)fig.append(elt('figcaption','sim-scene-caption','Pasienten er blitt dårligere'));
  top.append(fig,meta,elt('p','sim-copy',c.opening));
  return top;
 }
 function render(){
  root.replaceChildren();
  const c=current();
  if(heading)heading.textContent=started?c.title:'Velg en pasientcase';
  if(!started){
   const overview=section('Hva øver du på?','sim-overview');
   addParagraph(overview,'Du bestemmer hvilke spørsmål, observasjoner og tiltak du gjør. Noen funn er skjult til du undersøker dem. Øv på klinisk prioritering, NEWS2 og ISBAR før du sammenligner med en refleksjonssjekkliste.');
   root.append(overview);
   const list=elt('ul','sim-case-list');list.setAttribute('aria-label','Pasientcaser');
   for(const item of Engine.cases){
    const li=elt('li'),card=button('','sim-case-card',()=>begin(item.id));
    card.dataset.caseId=item.id;
    const top=elt('span','sim-case-top');top.append(elt('span','sim-case-level',item.level));
    const done=Progress()?.get('sim:'+item.id)?.test;
    if(done)top.append(elt('span','sim-case-done','✓ Fullført'));
    const thumb=elt('img','sim-case-thumb');thumb.src=item.images.stable;thumb.alt='';thumb.loading='lazy';thumb.width=720;thumb.height=400;
    card.append(thumb,top,elt('strong','sim-case-title',item.title),elt('span','sim-case-patient',item.patient+' · '+item.setting),elt('span','sim-case-focus',item.focus));
    li.append(card);list.append(li);
   }
   root.append(list);
  }else if(state.finished){
   root.append(caseHeader(c));
   root.append(reportPanel());
  }else{
   root.append(caseHeader(c));
   const stat=elt('div','sim-status');
   stat.append(elt('span','sim-time','Simulert tid: '+state.minutes+' min'));
   stat.append(button('Start på nytt','sim-reset',confirmRestart));
   stat.append(button('Bytt case','sim-reset',()=>{if(window.confirm('Bytte case? Valgene i denne casen slettes.'))toChooser()}));
   root.append(stat);
   const latestWrap=elt('div');latest(latestWrap);root.append(latestWrap);
   const columns=elt('div','sim-columns');
   const left=elt('div','sim-column'),right=elt('div','sim-column');
   left.append(actionPanel(),vitalPanel());
   right.append(isbarPanel(),notesPanel());
   columns.append(left,right);root.append(columns);
   const news=newsPanel();news.classList.add('sim-news-wide');
   // Rett etter en måling står skjemaet før kolonnene, så det er lett å finne på mobil. Det blir stående
   // der mens du skårer, og flyttes ned under kolonnene når du velger en ny handling.
   if(state.charts?.length&&['vitals','reevaluate'].includes(state.timeline.at(-1)?.id))columns.before(news);
   else columns.after(news);
   const end=elt('div','sim-finish');
   addParagraph(end,'Du kan avslutte når som helst. Oppsummeringen viser både det du gjorde og hva som eventuelt mangler.');
   end.append(button('Avslutt og se refleksjon →','btn btn-primary',finishCase));
   root.append(end);
  }
  const footer=elt('div','sim-references');
  addParagraph(footer,c.warning);
  footer.append(elt('strong','','Faglig grunnlag: '));
  for(const s of c.sources)footer.append(sameTabLink(s.name+' ↗',s.url));
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
  toChooser,
  get root(){return root}
 });
})();
