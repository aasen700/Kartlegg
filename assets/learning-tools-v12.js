/* Kartlegg Lær: free interactive 4AT + NEWS2 chart-scoring modules.
 * Inputs are scripted fictional measurements. Existing scorers own all answer keys.
 * No AI, network access, medical record access or persistent storage.
 */
'use strict';
(()=>{
 const D=window.KartleggLearningContent,root=document.getElementById('learnToolExerciseRoot');
 const chooser=document.getElementById('learningHubChooser'),gcs=document.getElementById('learnGcsModule');
 if(!D||!root||!chooser||!gcs)return;
 const module4=document.getElementById('learn4atModule'),moduleN=document.getElementById('learnNews2Module');
 const titles={gcs:'GCS',four:'4AT',news:'NEWS2'};
 let initialized=false;
 const state={tool:'gcs',mode:'home',lesson:0,caseIndex:0,answers:{},results:{},finished:false};
 const h=(tag,cls,txt)=>{
  const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;
 };
 const button=(txt,cls,fn)=>{const b=h('button',cls,txt);b.type='button';b.addEventListener('click',fn);return b};
 const text=(parent,msg,cls='learn12-copy')=>parent.append(h('p',cls,msg));
 const collections=()=>state.tool==='four'?{
  lessons:D.fourLessons,cases:D.fourCases,parts:D.fourParts,type:'4at'}:{
  lessons:D.newsLessons,cases:D.newsCases,parts:D.newsRows,type:'news2'};
 const subset=()=>collections().cases.filter(x=>x.level===(state.mode==='practice'?'Øv':'Test'));
 const url=(href,label)=>{const a=h('a','learn12-source-link',label);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a};
 const announce=h('span','learn12-sr');announce.setAttribute('role','status');announce.setAttribute('aria-live','polite');
 function setTool(id,mode='home'){
  if(!['gcs','four','news'].includes(id))return false;
  state.tool=id;state.mode=['learn','practice','test'].includes(mode)?mode:'home';state.lesson=0;state.caseIndex=0;state.answers={};state.results={};state.finished=false;
  gcs.hidden=id!=='gcs';module4.hidden=id!=='four';moduleN.hidden=id!=='news';
  if(id==='four')module4.append(root);
  if(id==='news')moduleN.append(root);
  for(const b of chooser.querySelectorAll('[data-learn-tool]')){
   b.setAttribute('aria-pressed',String(b.dataset.learnTool===id));
   b.classList.toggle('is-active',b.dataset.learnTool===id);
  }
  if(id==='gcs'){
   if(initialized||mode!=='home')window.KartleggLearnPilot?.open(mode==='test'?'exam':mode==='practice'?'practice':mode==='learn'?'learn':'home');
  }else render();
  initialized=true;
  return true;
 }
 function chooseCourse(id,mode='home'){
  document.querySelector('[data-page="laer"]')?.click();
  setTool(id,mode);
 }
 const cards=[
  ['gcs','🧠','GCS','Øyeåpning, verbal og motorisk respons'],
  ['four','◈','4AT','Kartlegging av delirium og kognitiv funksjon'],
  ['news','▦','NEWS2','Klikk riktig poengfelt i observasjonsskjemaet']
 ];
 for(const [id,ico,name,description] of cards){
  const b=button('', 'learn12-course-card',()=>setTool(id));
  b.dataset.learnTool=id;
  b.setAttribute('aria-pressed',String(id==='gcs'));
  b.append(h('span','learn12-course-symbol',ico));
  const copy=h('span','learn12-course-copy');copy.append(h('strong','',name),h('small','',description));b.append(copy);
  chooser.append(b);
 }
 for(const [id,cardId,label] of [['four','4at','✦ Lær 4AT'],['news','news2','✦ Lær NEWS2']]){
  const card=document.querySelector('#page-verktoy .toolbox[data-tool-id="'+cardId+'"]');
  const bar=card?.querySelector('.tool-card-actions');
  if(bar&&!bar.querySelector('.learn12-card-shortcut')){
   const b=button(label,'learn12-card-shortcut',()=>chooseCourse(id,'learn'));
   b.setAttribute('aria-label','Åpne interaktiv opplæring i '+titles[id]);bar.append(b);
  }
 }
 function heading(kicker,name){
  const section=h('div','learn12-heading');section.append(h('span','learn12-kicker',kicker),h('h3','',name));
  if(state.mode!=='home')section.append(button('← Oversikten','learn12-back',()=>setMode('home')));
  root.append(section);
 }
 function setMode(mode){state.mode=mode;state.caseIndex=0;state.lesson=0;state.answers={};state.results={};state.finished=false;render()}
 function progress(cur,max){
  const bar=h('div','learn12-progress');bar.append(h('span','',cur+' / '+max));
  const p=h('progress');p.max=max;p.value=cur;bar.append(p);root.append(bar);
 }
 function currentCase(){return subset()[state.caseIndex]}
 function scoreSource(){
  const refs=h('div','learn12-references');
  if(state.tool==='four'){
   refs.append(h('strong','','Kilder og lisens'));
   text(refs,'Pedagogisk, norsktilpasset fremstilling basert på 4AT v1.2 (2014). Tilpassede oppgavetekster, illustrasjoner og interaksjon – ikke offisiell originalversjon. Publisert under CC BY 4.0 med kreditering, uten påstand om klinisk validering.');
   text(refs,'Tilpasset fra 4AT © 2011–2014 Alasdair MacLullich, Tracy Ryan og Helen Cash. Endringer: norsk pedagogisk gjengivelse, fiktive caser og interaktiv skåring. Originalversjonens validering gjelder ikke automatisk denne tilpasningen.');
   refs.append(url(D.source.fourAT,'4AT originalveiledning ↗'),url(D.source.license,'Lisens og kreditering ↗'));
  }else{
   refs.append(h('strong','','Faglig kilde'));
   text(refs,'Poenggrenser fra RCP NEWS2 (2017). Dette er et eget, interaktivt pedagogisk poengskjema, ikke RCPs originale observasjonsskjema eller en autorisert oversettelse. Skala 2 kun etter dokumentert klinisk beslutning.');
   refs.append(url(D.source.news2,'Royal College of Physicians – NEWS2 ↗'));
  }
  text(refs,'Øv kun med fiktive data. Ingen klinisk godkjenning, pasientdata, serverlagring eller AI-API. Resultatene viser skåring, ikke en diagnose eller behandlingsplan.','learn12-disclaimer');
  root.append(refs);
 }
 function landing(){
  heading('Kartlegg Lær · interaktivt','Lær '+titles[state.tool]+' steg for steg');
  const lead=h('div','learn12-intro');
  text(lead,state.tool==='four'?'Lær hvordan du skårer 4ATs fire områder, inkludert forskjellen mellom «vil ikke forsøke» og «kan ikke testes».':
   'Les en fiktiv pasients vitale verdier og trykk på poengfeltet du mener passer i hver rad. Tren også på oksygentilførsel og SpO₂-skala 2.');
  root.append(lead);
  const boxes=h('div','learn12-modes');
  for(const [mode,n,title,sub] of [
   ['learn','01','Lær','Kort introduksjon til hvert poengområde'],
   ['practice','02','Øv','Tre caser med poengvis forklaring etter hvert skjema'],
   ['test','03','Test deg selv','Tre caser uten fasit før hele testen er ferdig']
  ]){
   const block=h('article','learn12-mode');
   block.append(h('span','learn12-stepnumber',n),h('h4','',title),h('p','',sub));
   block.append(button('Start '+title.toLowerCase()+' →','learn12-primary',()=>setMode(mode)));
   boxes.append(block);
  }
  root.append(boxes);
 }
 function lessonPage(){
  const list=collections().lessons,q=list[state.lesson];
  heading('Lær · '+(state.lesson+1)+' av '+list.length,q.name);progress(state.lesson+1,list.length);
  const panel=h('article','learn12-lesson');
  panel.append(h('span','learn12-lesson-icon',state.tool==='four'?'◈':'▦'));
  text(panel,q.text,'learn12-lesson-text');
  const ul=h('ul','learn12-tips');for(const f of q.focus)ul.append(h('li','',f));panel.append(ul);
  root.append(panel);
  if(state.tool==='four'){
   const row=D.fourParts.find(x=>x.id===q.id);
   if(row){const box=h('div','learn12-rule-example');
    box.append(h('strong','','Hva er lovlige poeng her?'));
    for(const opt of row.options)box.append(h('span','',opt.label));
    root.append(box);}
  }else if(['vitals','spo','mental'].includes(q.id)){
   const box=h('div','learn12-rule-example');box.append(h('strong','','Eksempler fra NEWS2'));
   for(const row of D.newsRows.filter(x=>q.id==='spo'?['spo','oxygen'].includes(x.id):q.id==='mental'?['consciousness','oxygen'].includes(x.id):['rr','sbp','hr','temp'].includes(x.id))){
    box.append(h('span','',row.name+': '+Object.entries(row.bands).map(([p,range])=>p+'p '+range).join(' · ')));
   }root.append(box);
  }
  const footer=h('div','learn12-actions');
  const prev=button('← Tilbake','learn12-secondary',()=>{state.lesson--;render()});prev.disabled=state.lesson===0;footer.append(prev);
  footer.append(button(state.lesson===list.length-1?'Start øving →':'Neste →','learn12-primary',()=>{
   if(state.lesson===list.length-1)setMode('practice');else{state.lesson++;render()}
  }));root.append(footer);
 }
 const newsMeasurement=(row,v)=>{
  switch(row.id){
   case 'rr':return v.rr+' /min';
   case 'spo':return v.spo2+' %';
   case 'sbp':return v.sbp+' mmHg';
   case 'hr':return v.hr+' /min';
   case 'temp':return v.temp.toFixed(1).replace('.',',')+' °C';
   case 'consciousness':return v.conscious+(v.confusion?' · ny forvirring':' · ingen ny forvirring');
   case 'oxygen':return v.oxygen?'Ja · tilført O₂':'Nei · romluft';
   default:return '';
  }
 };
 function spoBands(v){
  if(v.scale===1)return {0:'≥96',1:'94–95',2:'92–93',3:'≤91'};
  if(!v.oxygen)return {0:'≥88 på luft',1:'86–87',2:'84–85',3:'≤83'};
  return {0:'88–92',1:'86–87 / 93–94',2:'84–85 / 95–96',3:'≤83 / ≥97'};
 }
 function scoreRows(){
  const data=collections(),q=currentCase();
  const answers=state.answers[q.id]||{},rows=data.parts;
  const table=h('div','learn12-score-grid');
  table.setAttribute('role','group');table.setAttribute('aria-label','Velg poeng på hvert skåringsområde');
  const header=h('div','learn12-score-head');
  header.append(h('span','','Observasjon'));
  for(const p of state.tool==='four'?[0,1,2,4]:[0,1,2,3])header.append(h('span','',p+' poeng'));
  table.append(header);
  for(const row of rows){
   const item=h('div','learn12-score-row');
   const desc=h('div','learn12-row-name');
   desc.append(h('strong','',row.name||row.title));
   desc.append(h('small','',state.tool==='four'?q.observations[row.id]:newsMeasurement(row,q.v)));
   item.append(desc);
   const options=state.tool==='four'?
    Object.fromEntries(row.options.map(o=>[o.score,o.label.replace(/^\d+ · /,'')])):
    row.id==='spo'?spoBands(q.v):row.bands;
   const range=state.tool==='four'?[0,1,2,4]:[0,1,2,3];
   for(const score of range){
    if(options[score]===undefined){
     const missing=h('span','learn12-score-void','—');missing.setAttribute('aria-label','Ikke gyldig poengverdi');item.append(missing);continue;
    }
    const chosen=answers[row.id]===score;
    const b=button('', 'learn12-score-option'+(chosen?' is-selected':''),()=>{
     if(state.results[q.id]||state.finished)return;
     if(!state.answers[q.id])state.answers[q.id]={};
     state.answers[q.id][row.id]=score;
     render();
     const focus=root.querySelector('[data-part="'+row.id+'"][data-score="'+score+'"]');
     focus?.focus({preventScroll:true});
     announce.textContent=(row.name||row.title)+' – '+score+' poeng valgt';
    });
    b.dataset.part=row.id;b.dataset.score=String(score);
    b.disabled=Boolean(state.results[q.id]||state.finished);
    b.setAttribute('aria-pressed',String(chosen));
    b.setAttribute('aria-label',(row.name||row.title)+': '+score+' poeng – '+options[score]);
    b.append(h('b','',String(score)),h('small','',options[score]));item.append(b);
   }
   table.append(item);
  }
  return table;
 }
 function narrative(){
  const q=currentCase(),p=h('section','learn12-patient');
  p.append(h('span','learn12-patient-tag','Fiktiv '+titles[state.tool]+'-case'),
   h('h4','',q.name));
  text(p,state.tool==='four'?q.summary:q.story,'learn12-story');
  if(state.tool==='news'){
   const v=q.v;
   p.append(h('p','learn12-case-detail','SpO₂-skala '+v.scale+' · '+(v.oxygen?'Oksygentilførsel':'Romluft')));
   if(v.scale===2)text(p,'Skala 2 er i denne oppgaven på forhånd valgt og dokumentert av kvalifisert kliniker. Du skal ikke velge skala 2 ut fra en lav SpO₂ alene.','learn12-safety-note');
  }
  return p;
 }
 function caseView(){
  const list=subset(),q=currentCase();
  heading((state.mode==='practice'?'Øv':'Test deg selv')+' · '+(state.caseIndex+1)+' / '+list.length,
   state.tool==='news'?'Trykk på riktig poengfelt':'Skår alle fire 4AT-delene');
  progress(state.caseIndex+1,list.length);root.append(narrative());
  if(state.mode==='test')text(root,'Ingen fasit vises før alle testcasene er levert. Skår etter pasientbeskrivelsen.','learn12-note');
  root.append(scoreRows());
  const answer=state.answers[q.id]||{},complete=collections().parts.every(row=>Number.isInteger(answer[row.id]));
  const footer=h('div','learn12-actions');
  const selectedSum=collections().parts.reduce((sum,row)=>sum+(answer[row.id]||0),0);
  const total=h('div','learn12-selection');
  total.append(h('strong','',Object.keys(answer).length+' / '+collections().parts.length+' skåret'),
   h('small','', 'Din foreløpige sum: '+selectedSum));
  footer.append(total);
  const next=button(state.caseIndex===list.length-1?
   (state.mode==='practice'?'Fullfør øvingen →':'Lever testen →'):
   'Neste case →','learn12-primary',()=>{
    const now=state.answers[q.id];
    if(!now)return;
    try{D.grade(collections().type,q.id,now)}catch(e){announce.textContent=e.message;return}
    if(state.mode==='practice'&&!state.results[q.id]){
     state.results[q.id]=D.grade(collections().type,q.id,now);render();return;
    }
    if(state.caseIndex===list.length-1){state.finished=true;render()}else{state.caseIndex++;render()}
   });
  next.disabled=!complete;footer.append(next);
  root.append(footer);
  if(state.mode==='practice'&&state.results[q.id]){
   const grade=state.results[q.id],panel=h('div','learn12-feedback');
   panel.append(h('strong','',grade.score+' av '+grade.max+' delpoeng riktige'));
   text(panel,'Beregnet total for dette tilfellet: '+grade.truth.total+' poeng. Din valgte sum: '+grade.enteredTotal+'.');
   const list=h('ul','learn12-feedback-list');
   for(const row of collections().parts){
    const li=h('li','');
    li.append(h('strong','', (grade.match[row.id]?'✓ ':'○ ')+(row.name||row.title)+': '+grade.truth.parts[row.id]+' poeng'));
    li.append(h('small','',row.rule||'Sammenlign funnet med området i poengskjemaet.'));list.append(li);
   }
   panel.append(list);
   const nextButton=[...footer.querySelectorAll('button')].at(-1);nextButton.textContent=state.caseIndex===list.length-1?'Se oppsummeringen →':'Fortsett til neste case →';
   root.append(panel);
  }
 }
 function summary(){
  const cases=subset(),results=cases.map(q=>D.grade(collections().type,q.id,state.answers[q.id]));
  const correct=results.reduce((sum,r)=>sum+r.score,0),max=results.reduce((sum,r)=>sum+r.max,0);
  heading('Oppsummering · '+titles[state.tool],state.mode==='test'?'Testen er levert':'Øvingen er fullført');
  const top=h('div','learn12-summary');
  top.append(h('strong','learn12-big-score',correct+' / '+max));
  text(top,'Antall korrekt plasserte poengvalg – ikke en formell kompetansevurdering.');root.append(top);
  for(let i=0;i<cases.length;i++){
   const q=cases[i],r=results[i],card=h('article','learn12-report');
   card.append(h('h4','',q.name),h('p','',r.score+' av '+r.max+' delområder riktige'),
    h('p','', 'Din sum: '+r.enteredTotal+' · Beregnet fasit: '+r.truth.total));
   const ul=h('ul','learn12-report-parts');
   for(const row of collections().parts){
    const val=state.answers[q.id][row.id],correct=r.truth.parts[row.id];
    ul.append(h('li','', (val===correct?'✓':'○')+' '+(row.name||row.title)+': valgt '+val+' / fasit '+correct));
   }
   card.append(ul);root.append(card);
  }
  const bar=h('div','learn12-actions');
  bar.append(button('Prøv igjen','learn12-secondary',()=>setMode(state.mode)),
   button('Velg et annet nivå','learn12-primary',()=>setMode('home')));root.append(bar);
 }
 function render(){
  root.replaceChildren();
  if(state.mode==='home')landing();
  else if(state.mode==='learn')lessonPage();
  else if(state.finished)summary();
  else caseView();
  scoreSource();root.append(announce);
 }
 setTool('gcs');
 window.KartleggLearningHub=Object.freeze({
  open:chooseCourse,setTool,
  get active(){return state.tool},
  get mode(){return state.tool==='gcs'?window.KartleggLearnPilot?.mode:state.mode},
  get current(){return state.caseIndex},
  get finished(){return state.finished},
  get answers(){return JSON.parse(JSON.stringify(state.answers))}
 });
})();
