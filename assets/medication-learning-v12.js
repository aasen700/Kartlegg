/* Legemiddelverkstedet UI: fictional calculation and syringe-drawing practice.
 * No prescribing, patient data, persistence or network access.
 */
'use strict';
(()=>{
 const D=window.KartleggMedicationLearning,chooser=document.getElementById('learningHubChooser');
 const panel=document.getElementById('learnMedicationModule'),root=document.getElementById('medicationLearningRoot');
 const library=document.querySelector('#page-verktoy .toolgrid');
 if(!D||!chooser||!panel||!root||!library)return;
 const h=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el};
 const button=(text,cls,fn)=>{const el=h('button',cls,text);el.type='button';el.addEventListener('click',fn);return el};
 const card=h('article','toolbox hc-tool-card medication12-card');card.dataset.homecareCard='medication-lab';
 const icon=h('div','hc-card-icon','◇');icon.setAttribute('aria-hidden','true');
 const title=h('h3','','Legemiddelverkstedet'),tag=h('span','tool-tag','Ferdighetstrening');
 const copy=h('p','','Regn ut volum, velg treningssprøyte og dra stempelet til riktig mengde i fiktive oppgaver.');
 const launch=button('Åpne Legemiddelverkstedet →','btn btn-primary hc-launch',()=>open('home'));launch.id='launchMedicationLab';
 card.append(icon,title,tag,copy,launch);library.append(card);

 const course=button('','learn12-course-card medication12-course',()=>open('home'));course.dataset.learnTool='medication';course.setAttribute('aria-pressed','false');
 course.append(h('span','learn12-course-symbol','◇'));
 const courseCopy=h('span','learn12-course-copy');courseCopy.append(h('strong','','Legemiddelregning'),h('small','','Regn · velg sprøyte · trekk opp'));course.append(courseCopy);chooser.append(course);

 let mode='home',lesson=0,caseIndex=0,answers={},results={},finished=false;
 const cases=()=>D.cases.filter(item=>item.level===(mode==='practice'?'practice':'test'));
 const formatMl=value=>Number(value).toLocaleString('nb-NO',{minimumFractionDigits:0,maximumFractionDigits:2})+' ml';
 const strengthText=item=>D.formatDose(item.strength)+' / '+formatMl(item.strength.perMl);
 function reset(next){mode=next;lesson=0;caseIndex=0;answers={};results={};finished=false;render()}
 function open(next='home'){
  document.querySelector('[data-page="laer"]')?.click();
  for(const id of ['learnGcsModule','learn4atModule','learnNews2Module','learnTimesModule']){const item=document.getElementById(id);if(item)item.hidden=true}
  panel.hidden=false;
  chooser.querySelectorAll('[data-learn-tool]').forEach(item=>{item.classList.toggle('is-active',item===course);item.setAttribute('aria-pressed',String(item===course))});
  reset(['learn','practice','test'].includes(next)?next:'home');
 }
 chooser.addEventListener('click',event=>{if(event.target.closest('[data-learn-tool]')!==course)panel.hidden=true},true);
 const heading=(kicker,title)=>{
  const head=h('div','medication12-heading');head.append(h('small','',kicker),h('h3','',title));
  if(mode!=='home')head.append(button('← Til oversikten','learn12-secondary',()=>reset('home')));root.append(head);
 };
 function home(){
  heading('Kartlegg Lær · praktisk øving','Legemiddelverkstedet');
  const hero=h('section','medication12-hero'),heroCopy=h('div','medication12-hero-copy');
  heroCopy.append(h('span','medication12-pill','Kun fiktive preparater'),h('h4','','Fra ordinasjon til opptrukket volum'),h('p','','Øv på å kontrollere dose og styrke, regne om enheter, velge den minste treningssprøyten som rommer volumet og dra stempelet til riktig skalastrek.'));
  const mini=h('div','medication12-mini-ampoule');mini.append(h('span','','ØVING'),h('strong','','1 mg/ml'),h('small','','2 ml'));hero.append(heroCopy,mini);root.append(hero);
  const modes=h('div','wound12-modes');
  for(const [key,num,name,text] of [['learn','01','Lær','Fem korte steg om formelen, enheter, ampulleetikett, sprøytevalg og kontroll.'],['practice','02','Øv','Tre oppgaver med fasit og forklaring etter hver oppgave.'],['test','03','Test deg selv','Tre oppgaver uten fasit før hele testen er levert.']]){
   const item=h('article','wound12-mode medication12-mode');item.append(h('span','wound12-num',num),h('h4','',name),h('p','',text),button('Start '+name.toLowerCase()+' →','learn12-primary',()=>reset(key)));modes.append(item);
  }
  root.append(modes,h('p','medication12-disclaimer','Treningsmodulen erstatter ikke ordinasjon, produktinformasjon, lokale prosedyrer, praktisk veiledning eller krav til dobbeltkontroll. Ikke bruk oppgavene til reell legemiddelhåndtering.'));
 }
 function learn(){
  const item=D.lessons[lesson];heading('Lær · '+(lesson+1)+' av '+D.lessons.length,item.title);
  const sheet=h('article','medication12-lesson');sheet.append(h('span','medication12-lesson-number','0'+(lesson+1)),h('p','',item.body),h('strong','medication12-formula',item.formula));root.append(sheet);
  const actions=h('div','wound12-actions');if(lesson)actions.append(button('← Forrige','learn12-secondary',()=>{lesson--;render()}));
  actions.append(button(lesson===D.lessons.length-1?'Start øving →':'Neste →','learn12-primary',()=>{if(lesson===D.lessons.length-1)reset('practice');else{lesson++;render()}}));root.append(actions);
 }
 function ampoule(item){
  const figure=h('figure','medication12-ampoule');figure.setAttribute('aria-label','Fiktiv ampulle: '+item.medicine+', '+strengthText(item)+', totalt '+formatMl(item.ampouleMl));
  const cap=h('span','medication12-ampoule-cap'),glass=h('div','medication12-ampoule-glass');
  glass.append(h('small','','KUN ØVING'),h('strong','',item.medicine),h('b','',strengthText(item)),h('span','',formatMl(item.ampouleMl)));figure.append(cap,glass);return figure;
 }
 function syringe(answer,item,locked=false){
  const selected=D.syringes.find(value=>value.id===answer.syringeId);
  const wrap=h('section','medication12-syringe-work');wrap.append(h('h4','','2. Velg sprøyte'));
  const choices=h('div','medication12-syringe-choices');
  for(const option of D.syringes){
   const choice=button(option.label,'medication12-syringe-choice'+(selected?.id===option.id?' is-selected':''),()=>{answer.syringeId=option.id;answer.drawnMl=0;render();queueMicrotask(()=>root.querySelector('.medication12-plunger')?.focus())});
   choice.disabled=locked;
   choice.setAttribute('aria-pressed',String(selected?.id===option.id));choice.append(h('small','',option.increment.toLocaleString('nb-NO')+' ml per minste strek'));choices.append(choice);
  }
  wrap.append(choices);
  if(!selected){wrap.append(h('p','medication12-prompt','Velg den minste av treningssprøytene som rommer volumet du har beregnet.'));return wrap}
  const stage=h('div','medication12-syringe-stage');stage.style.setProperty('--drawn',String(Math.min(100,(Number(answer.drawnMl)||0)/selected.capacity*100))+'%');
  const needle=h('span','medication12-needle'),barrel=h('div','medication12-barrel'),liquid=h('span','medication12-liquid'),ticks=h('span','medication12-ticks'),plunger=h('span','medication12-plunger-visual');
  for(let n=0;n<=10;n++){const tick=h('i','');tick.style.left=(n*10)+'%';ticks.append(tick)}
  barrel.append(liquid,ticks,plunger);stage.append(needle,barrel);
  const range=h('input','medication12-plunger');range.id='medicationPlungerInput';range.type='range';range.min='0';range.max=String(selected.capacity);range.step=String(selected.increment);range.value=String(answer.drawnMl||0);range.setAttribute('aria-label','Dra sprøytestempelet til ønsket volum i '+selected.label+' sprøyten');
  range.disabled=locked;
  const output=h('output','medication12-drawn',formatMl(answer.drawnMl||0));range.addEventListener('input',()=>{answer.drawnMl=Number(range.value);stage.style.setProperty('--drawn',(answer.drawnMl/selected.capacity*100)+'%');output.textContent=formatMl(answer.drawnMl)});
  const scale=h('div','medication12-scale');scale.append(h('span','','0'),h('span','',formatMl(selected.capacity/2)),h('span','',selected.label));
  wrap.append(stage,range,scale,output,h('p','medication12-scale-note','Denne treningssprøyten har '+selected.increment.toLocaleString('nb-NO')+' ml mellom de minste strekene. Faktisk utstyr kan ha annen inndeling.'));
  return wrap;
 }
 function feedback(item,grade,answer){
  const panel=h('section','medication12-feedback');panel.append(h('strong','',grade.score+' / '+grade.max+' deler riktige'));
  const list=h('ul');
  list.append(h('li','',(grade.match.calculation?'✓':'○')+' Beregning: '+formatMl(grade.truth.exactMl)+' ('+D.formatDose(item.dose)+' ÷ '+strengthText(item)+').'));
  list.append(h('li','',(grade.match.syringe?'✓':'○')+' Sprøyte: '+D.syringes.find(x=>x.id===grade.truth.syringeId).label+' er den minste tilgjengelige som rommer volumet.'));
  list.append(h('li','',(grade.match.drawn?'✓':'○')+' Opptrekk: mål '+formatMl(grade.truth.exactMl)+', ditt stempel '+formatMl(answer.drawnMl)+'.'));
  panel.append(list,h('p','','Les alltid tilbake dose, styrke og volum, og følg lokale krav til kontroll før administrasjon.'));return panel;
 }
 function exercise(){
  const list=cases(),item=list[caseIndex],answer=answers[item.id]||(answers[item.id]={calculatedMl:'',syringeId:'',drawnMl:0}),graded=results[item.id];
  heading((mode==='practice'?'Øv':'Test')+' · '+(caseIndex+1)+' av '+list.length,item.name);
  const layout=h('div','medication12-case-layout'),caseCard=h('section','medication12-order');
  caseCard.append(h('span','medication12-case-tag','Fiktiv oppgave · ikke et legemiddel'),h('h4','',item.medicine),h('p','','Ordinert dose:'));
  caseCard.append(h('strong','medication12-ordered',D.formatDose(item.dose)),h('p','','Tilgjengelig ampulle: '+strengthText(item)+', totalt '+formatMl(item.ampouleMl)),ampoule(item));
  const work=h('section','medication12-work');work.append(h('h4','','1. Regn ut volumet'));
  const label=h('label','hc-field medication12-volume');label.append(h('span','','Hvor mange ml skal trekkes opp?'));
  const input=h('input');input.id='medicationVolumeInput';input.type='number';input.inputMode='decimal';input.min='0';input.max='10';input.step='0.01';input.value=answer.calculatedMl;input.disabled=Boolean(graded);input.autocomplete='off';input.addEventListener('input',()=>{answer.calculatedMl=input.value});label.append(input,h('small','','ml'));work.append(label,syringe(answer,item,Boolean(graded)));layout.append(caseCard,work);root.append(layout);
  const status=h('p','medication12-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');root.append(status);
  const actions=h('div','wound12-actions');
  if(mode==='practice'&&graded){
   root.append(feedback(item,graded,answer));
   actions.append(button(caseIndex===list.length-1?'Se oppsummering →':'Neste oppgave →','learn12-primary',()=>{if(caseIndex===list.length-1)finished=true;else caseIndex++;render()}));
  }else{
   const submit=button(mode==='practice'?'Sjekk opptrekket':'Lever oppgaven','learn12-primary',()=>{
    if(input.value===''||!answer.syringeId){status.textContent='Fyll inn beregnet volum og velg en sprøyte.';if(input.value==='')input.focus();return}
    try{results[item.id]=D.grade(item.id,answer)}catch(error){status.textContent=error.message;return}
    if(mode==='practice')render();
    else if(caseIndex===list.length-1){finished=true;render()}else{caseIndex++;render()}
   });actions.append(submit);
  }
  root.append(actions);
 }
 function summary(){
  const list=cases(),total=list.reduce((sum,item)=>sum+(results[item.id]?.score||0),0),max=list.length*3;
  heading('Fullført · '+(mode==='practice'?'Øv':'Test'),'Resultater og forklaringer');
  const top=h('section','learn12-summary medication12-summary');top.append(h('strong','learn12-big-score',total+' / '+max),h('p','','Beregning, sprøytevalg og opptrekk vurderes separat. Dette er pedagogisk tilbakemelding, ikke dokumentasjon på praktisk kompetanse.'));root.append(top);
  for(const item of list)root.append(feedback(item,results[item.id],answers[item.id]));
  const actions=h('div','wound12-actions');actions.append(button('Prøv igjen','learn12-secondary',()=>reset(mode)),button(mode==='practice'?'Fortsett til test →':'Til oversikten','learn12-primary',()=>reset(mode==='practice'?'test':'home')));root.append(actions);
 }
 function sources(){
  const box=h('div','learn12-references medication12-sources');box.append(h('strong','','Sikkerhetsramme og kilder'),h('p','','Oppgavene bruker fiktive preparater og konstruerte doser. Sprøyteinndelingen er definert i øvingen og må kontrolleres mot faktisk utstyr i praksis. Modulen gir ikke ordinasjon eller klarsignal for administrasjon.'));
  const link=h('a','learn12-source-link','WHO – Medication Without Harm ↗');link.href='https://www.who.int/initiatives/medication-without-harm';link.target='_blank';link.rel='noopener noreferrer';box.append(link);root.append(box);
 }
 function render(){
  root.replaceChildren();if(mode==='home')home();else if(mode==='learn')learn();else if(finished)summary();else exercise();sources();
  window.KartleggLearningFlow?.mount(root,{course:'Legemiddelregning',mode,current:mode==='learn'?lesson+1:caseIndex+1,total:mode==='learn'?D.lessons.length:cases().length,finished,onMode:reset});
 }
 window.KartleggMedicationLearningUI=Object.freeze({open,get mode(){return mode},get caseIndex(){return caseIndex}});
})();
