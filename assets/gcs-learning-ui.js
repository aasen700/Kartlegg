/* Kartlegg Lær – GCS 0.1. Static, no AI, no telemetry, no persistence.
 * Learn, practice and exam are deliberately separate from patient assessment.
 */
'use strict';
(()=>{
 const D=window.KartleggGcsLearning;
 const root=document.getElementById('gcsLearningRoot');
 if(!D||!root)return;
 const state={mode:'home',lesson:0,learnChoice:null,practiceIndex:0,practiceChoice:null,
  practiceMarks:[],examIndex:0,examAnswers:{},examDone:false};
 const h=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;
  if(text!==undefined)x.textContent=String(text);return x;};
 const btn=(label,cls,action)=>{const b=h('button',cls,label);b.type='button';b.addEventListener('click',action);return b;};
 const para=(p,str,cls='gcs-learn-copy')=>{p.append(h('p',cls,str))};
 const imageFile=Object.freeze({intro:'gcs-learning-patient.svg',eyes:'gcs-learning-eyes.svg',
  verbal:'gcs-learning-verbal.svg',motor:'gcs-learning-motor.svg',
  nt:'gcs-learning-nt.svg',summary:'gcs-learning-patient.svg'});
 function picture(scene,caption='Symbolsk illustrasjon. Skår etter beskrevne observasjoner, ikke bildet.'){
  const figure=h('figure','gcs-learn-figure');
  const img=h('img');img.src='assets/'+(imageFile[scene]||imageFile.intro);img.loading='lazy';
  img.alt='Stilisert pedagogisk illustrasjon av '+({eyes:'øyeåpning',verbal:'talerespons',
    motor:'motorisk respons',nt:'en ikke-testbar komponent'}[scene]||'en pasientsituasjon');
  img.decoding='async';figure.append(img,h('figcaption','',caption));return figure;
 }
 const live=h('p','gcs-learn-live');live.setAttribute('role','status');live.setAttribute('aria-live','polite');
 function announce(msg){live.textContent=msg}
 function open(mode){
  if(!['home','learn','practice','exam'].includes(mode))return;
  state.mode=mode;state.lesson=0;state.learnChoice=null;
  state.practiceIndex=0;state.practiceChoice=null;state.practiceMarks=[];
  state.examIndex=0;state.examAnswers={};state.examDone=false;
  render();root.scrollIntoView({block:'start',behavior:'auto'});
 }
 function anchor(label,url){
  const a=h('a','gcs-learn-link',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;
 }
 function heading(title,subtitle,mode){
  const wrap=h('div','gcs-learn-title');
  wrap.append(h('p','gcs-learn-eyebrow',subtitle),h('h3','',title));
  if(mode!=='home')wrap.append(btn('← Velg læringsnivå','gcs-learn-back',()=>open('home')));
  return wrap;
 }
 const mini=Object.freeze({
  intro:{question:'Hva skal du dokumentere når du bruker GCS?',opts:['Bare én totalskår','Øyeåpning, verbal og motorisk respons hver for seg','Bare motorisk respons'],answer:1,why:'E, V og M beskriver ulike responser. Totalen alene sier for lite.'},
  eyes:{question:'Pasienten åpner øynene først ved tiltale. Hva blir E?',part:'eyes',answer:'3',why:'Ved tiltale betyr E3.'},
  verbal:{question:'Pasienten snakker sammenhengende, men sier feil måned. Hva blir V?',part:'verbal',answer:'4',why:'Desorientert, men sammenhengende tale gir V4.'},
  motor:{question:'Pasienten følger en todelt oppfordring. Hva blir M?',part:'motor',answer:'6',why:'Å følge en todelt oppfordring gir M6.'},
  nt:{question:'Øyelokkene kan ikke åpnes på grunn av uttalt lokal hevelse. Hva blir E?',part:'eyes',answer:'NT',why:'Når komponenten ikke kan testes, er E-NT korrekt. E1 forutsetter at øyeåpning kunne vurderes.'},
  sum:{question:'Hva er gyldig totalskår ved E3 V4 M6?',opts:['12','13','14','Ingen totalskår'],answer:1,why:'E3 + V4 + M6 = 13. Summen oppgis bare dersom alle tre kan testes.'}
 });
 function quizBlock(item){
  const q=mini[item.id],box=h('section','gcs-learn-check');
  box.append(h('h4','','Sjekk forståelsen'),h('p','',q.question));
  const options=q.part?D.categories[q.part].map(x=>({label:x.label,value:x.value})):
   q.opts.map((label,i)=>({label,value:String(i)}));
  const controls=h('div','gcs-learn-options');
  for(const option of options){
   const selected=state.learnChoice===option.value,correct=String(q.answer)===option.value;
   const b=btn(option.label,'gcs-learn-option',()=>{
    state.learnChoice=option.value;render();
    announce(correct?'Riktig. '+q.why:'Ikke helt. '+q.why);
   });
   b.setAttribute('aria-pressed',String(selected));controls.append(b);
  }
  box.append(controls);
  if(state.learnChoice!==null){
   const correct=state.learnChoice===String(q.answer);
   const feedback=h('div','gcs-learn-feedback '+(correct?'is-correct':'is-wrong'));
   feedback.append(h('strong','',correct?'Riktig!':'Prøv å huske dette:'));
   para(feedback,q.why);box.append(feedback);
  }
  return box;
 }
 function lessonScreen(){
  const item=D.lessons[state.lesson],n=D.lessons.length;
  root.append(heading(item.title,'Lær · Trinn '+(state.lesson+1)+' av '+n,'learn'));
  root.append(progress(state.lesson+1,n));
  const grid=h('div','gcs-learn-columns');
  const intro=h('section','gcs-learn-sheet');
  intro.append(h('span','gcs-learn-pill',item.kicker),h('p','gcs-learn-lead',item.body));
  const list=h('ul','gcs-learn-tips');
  for(const tip of item.tips)list.append(h('li','',tip));
  intro.append(list);
  grid.append(picture(item.scene),intro);root.append(grid);
  root.append(quizBlock(item));
  const actions=h('nav','gcs-learn-steps');actions.setAttribute('aria-label','Gå mellom læringssteg');
  const prev=btn('← Forrige','gcs-learn-secondary',()=>{state.lesson--;state.learnChoice=null;render()});
  prev.disabled=state.lesson===0;actions.append(prev);
  if(state.lesson===n-1)actions.append(btn('Fortsett til øving →','gcs-learn-primary',()=>open('practice')));
  else actions.append(btn('Neste tema →','gcs-learn-primary',()=>{state.lesson++;state.learnChoice=null;render()}));
  root.append(actions);
 }
 function progress(current,total){
  const wrap=h('div','gcs-learn-progress');
  const words=h('div','gcs-learn-progress-label');
  words.append(h('span','','Fremdrift'),h('span','',current+' / '+total));
  const bar=h('progress');bar.max=total;bar.value=current;
  wrap.append(words,bar);return wrap;
 }
 function practiceScreen(){
  const n=D.practice.length;
  if(state.practiceIndex>=n){practiceSummary();return;}
  const q=D.practice[state.practiceIndex],answer=state.practiceChoice;
  root.append(heading('Prøv selv med veiledning','Øv · Oppgave '+(state.practiceIndex+1)+' av '+n,'practice'));
  root.append(progress(state.practiceIndex+1,n));
  const layout=h('div','gcs-learn-columns');
  const prompt=h('section','gcs-learn-sheet');
  prompt.append(h('span','gcs-learn-pill','Fiktiv pasient · '+({eyes:'E',verbal:'V',motor:'M'}[q.part])));
  prompt.append(h('h4','','Hvilken GCS-komponent passer?'));
  para(prompt,q.prompt,'gcs-learn-case');
  layout.append(picture(q.scene),prompt);root.append(layout);
  const options=h('div','gcs-learn-options');
  for(const item of D.categories[q.part]){
   const isSelected=answer===item.value;
   const b=btn(item.label,'gcs-learn-option',()=>{
    if(state.practiceChoice!==null)return;
    state.practiceChoice=item.value;
    state.practiceMarks.push(D.gradePractice(q.id,item.value).correct);
    render();
    announce(D.gradePractice(q.id,item.value).correct?'Riktig skår.':'Svar registrert. Se forklaringen.');
   });
   b.disabled=answer!==null;b.setAttribute('aria-pressed',String(isSelected));options.append(b);
  }
  root.append(options);
  if(answer!==null){
   const result=D.gradePractice(q.id,answer);
   const feedback=h('div','gcs-learn-feedback '+(result.correct?'is-correct':'is-wrong'));
   feedback.append(h('strong','',result.correct?'Riktig observasjon!':'Det riktige svaret er '+q.part.slice(0,1).toUpperCase()+result.expected+'.'));
   para(feedback,result.why);root.append(feedback);
   root.append(btn('Neste oppgave →','gcs-learn-primary',()=>{state.practiceIndex++;state.practiceChoice=null;render()}));
  }
 }
 function practiceSummary(){
  const count=state.practiceMarks.filter(Boolean).length;
  root.append(heading('Bra jobbet – øvingen er fullført','Øv · Oppsummering','practice'));
  const card=h('section','gcs-learn-summary');
  card.append(h('strong','gcs-learn-big-score',count+' av '+D.practice.length));
  para(card,'Svarene er kontrollert mot de forhåndsdefinerte eksemplene. Dette sier ikke alene noe om din praktiske kompetanse.');
  const actions=h('div','gcs-learn-summary-actions');
  actions.append(btn('Øv en gang til','gcs-learn-secondary',()=>open('practice')),
   btn('Test deg selv →','gcs-learn-primary',()=>open('exam')));
  card.append(actions);root.append(card);
 }
 function examScreen(){
  if(state.examDone){examSummary();return;}
  const q=D.exams[state.examIndex];root.append(heading('Test deg selv','Test · Case '+(state.examIndex+1)+' av '+D.exams.length,'exam'));
  root.append(progress(state.examIndex+1,D.exams.length));
  const layout=h('div','gcs-learn-columns');
  const sheet=h('section','gcs-learn-sheet');
  sheet.append(h('span','gcs-learn-pill','Fiktiv vurdering'),h('h4','',q.name));
  para(sheet,q.description,'gcs-learn-case');
  layout.append(picture(q.scene),sheet);root.append(layout);
  const form=h('form','gcs-learn-exam');
  const names={eyes:'E – Øyeåpning',verbal:'V – Verbal respons',motor:'M – Motorisk respons'};
  const draft=state.examAnswers[q.id]||{};
  for(const key of ['eyes','verbal','motor']){
   const label=h('label','gcs-learn-field',names[key]);
   const input=h('select','gcs-learn-select');input.name=key;input.required=true;
   input.append(new Option('Velg '+names[key]+' …',''));
   for(const opt of D.categories[key])input.append(new Option(opt.label,opt.value));
   input.value=draft[key]||'';
   label.append(input);form.append(label);
  }
  const note=h('p','gcs-learn-form-error');note.setAttribute('role','status');form.append(note);
  const b=h('button','gcs-learn-primary',state.examIndex===D.exams.length-1?'Fullfør testen →':'Lagre og neste case →');
  b.type='submit';form.append(b);
  form.addEventListener('submit',e=>{
   e.preventDefault();const response=Object.fromEntries([...form.querySelectorAll('select')].map(x=>[x.name,x.value]));
   if(Object.values(response).some(v=>!v)){note.textContent='Velg E, V og M før du fortsetter.';return}
   try{D.scoreValues(response)}catch(_){note.textContent='Ugyldig skåring. Kontroller feltene.';return}
   state.examAnswers[q.id]=response;
   if(state.examIndex===D.exams.length-1)state.examDone=true;
   else state.examIndex++;
   render();
  });
  root.append(form);
  para(root,'Ingen fasit vises før hele testen er levert. Svarene sendes ikke til noen server.','gcs-learn-muted');
 }
 function examSummary(){
  const result=D.gradeExam(state.examAnswers);
  const correct=result.cases.reduce((n,c)=>n+c.correct,0);
  root.append(heading('Resultat og forklaringer','Test deg selv · Ferdig','exam'));
  const top=h('section','gcs-learn-summary');
  top.append(h('strong','gcs-learn-big-score',correct+' / '+(result.cases.length*3)));
  para(top,'Riktige E-, V- og M-komponenter. Dette er en læringstest med fiktive caser, ikke en autorisert kompetanseprøve.');
  root.append(top);
  for(const item of result.cases){
   const q=D.exams.find(x=>x.id===item.id),card=h('article','gcs-learn-exam-report');
   card.append(h('h4','',q.name),h('p','gcs-learn-muted',item.correct+' av 3 komponenter riktige'));
   const report=(o)=>o.report+(o.total===null?' · ingen gyldig totalskår':' = '+o.total);
   card.append(h('p','', 'Ditt svar: '+report(item.entered)));
   card.append(h('p','', 'Fasit: '+report(item.expected)));
   const mismatches=['eyes','verbal','motor'].filter(k=>!item.parts[k]);
   if(mismatches.length)card.append(h('p','gcs-learn-error','Se spesielt på: '+mismatches.map(k=>({eyes:'E',verbal:'V',motor:'M'})[k]).join(', ')));
   para(card,q.feedback);root.append(card);
  }
  const actions=h('div','gcs-learn-summary-actions');
  actions.append(btn('Ta testen igjen','gcs-learn-secondary',()=>open('exam')),
   btn('Til oversikten','gcs-learn-primary',()=>open('home')));
  root.append(actions);
 }
 function homeScreen(){
  root.append(heading('Lær kliniske verktøy – ett om gangen','Kartlegg Lær · Gratis og uten AI','home'));
  const hero=h('section','gcs-learn-hero');
  const left=h('div','gcs-learn-hero-copy');
  left.append(h('span','gcs-learn-pill','Tilgjengelig nå · GCS'),
   h('h4','','Fra usikker til tryggere på E, V og M'));
  para(left,'Lær skåringsreglene, prøv korte fiktive pasientsituasjoner med veiledning, og test deg selv uten fasit underveis.');
  const tag=h('div','gcs-learn-tags');for(const s of ['6 læringssteg','9 veiledede spørsmål','4 testcaser','Ingen AI-kostnad'])tag.append(h('span','',s));
  left.append(tag);hero.append(left,picture('intro','Illustrasjonen er symbolsk og erstatter ikke klinisk demonstrasjon.'));
  root.append(hero);
  const modes=h('div','gcs-learn-modes');
  for(const spec of [
   {id:'learn',icon:'01',title:'Lær',subtitle:'Forstå E, V, M og NT',desc:'Seks korte temaer med illustrasjoner og små kontrollspørsmål.',button:'Start læringen →'},
   {id:'practice',icon:'02',title:'Øv',subtitle:'Få hjelp mens du lærer',desc:'Ni fiktive funn med tilbakemelding på hvert svar.',button:'Start øving →'},
   {id:'exam',icon:'03',title:'Test deg selv',subtitle:'Tenk selv før fasiten',desc:'Fire pasientcaser. Skår E, V og M, og få samlet resultat.',button:'Ta testen →'}
  ]){
   const card=h('section','gcs-learn-mode-card');
   card.append(h('span','gcs-learn-mode-num',spec.icon),h('h4','',spec.title),
    h('strong','',spec.subtitle),h('p','',spec.desc));
   card.append(btn(spec.button,'gcs-learn-primary',()=>open(spec.id)));
   modes.append(card);
  }
  root.append(modes);
  const soon=h('section','gcs-learn-soon');
  soon.append(h('h4','','Neste læringsmoduler'));
  para(soon,'4AT og NEWS2 er aktuelle neste steg. De er ikke lansert som øvingsmoduler ennå.');
  const labels=h('div','gcs-learn-tags');labels.append(h('span','','4AT · planlagt'),h('span','','NEWS2 · planlagt'));
  soon.append(labels);root.append(soon);
 }
 function footer(){
  const box=h('section','gcs-learn-source');
  box.append(h('strong','','Faglig grunnlag og viktige avgrensninger'));
  para(box,'Læreinnholdet bygger på den offisielle Glasgow Coma Scale-oversikten og vurderingshjelpen på norsk. Norsk originaldokument bruker «IT» for ikke testbar; Kartlegg bruker «NT» i skåringsmodulen. De betegner samme prinsipp. Øvelsene er pedagogiske eksempler, ikke praktisk opplæring i fysisk stimulering.');
  box.append(anchor('Offisiell norsk GCS-veiledning ↗',D.source.url),
   anchor('Offisiell veiledning om dokumentasjon ↗',D.source.recording),
   anchor('Åpne GCS-kalkulatoren ↗','?tool=gcs#verktoy'));
  para(box,'Kun fiktive situasjoner. Ikke brukt til pasientbehandling, ikke klinisk validert eller kompetansegodkjennende. Ingen fremdrift eller svar lagres etter at siden lukkes.');
  root.append(box);
 }
 function render(){
  root.replaceChildren();
  if(state.mode==='home')homeScreen();
  else if(state.mode==='learn')lessonScreen();
  else if(state.mode==='practice')practiceScreen();
  else examScreen();
  footer();root.append(live);
 }
 render();
 // Discoverability: open the tutorial directly from the GCS calculator card.
 const gcsCard=document.querySelector('#page-verktoy .toolbox[data-tool-id="gcs"]');
 const toolsBar=gcsCard?.querySelector('.tool-card-actions');
 if(toolsBar&&!toolsBar.querySelector('.gcs-learn-card-button')){
  const shortcut=btn('✦ Lær GCS','gcs-learn-card-button',()=>{
   document.querySelector('[data-page="laer"]')?.click();
   open('learn');
  });
  shortcut.setAttribute('aria-label','Åpne interaktiv GCS-opplæring');
  toolsBar.append(shortcut);
 }
 window.KartleggLearnPilot=Object.freeze({
  open,get mode(){return state.mode},get lesson(){return state.lesson},
  get practiceIndex(){return state.practiceIndex},
  get examDone(){return state.examDone},
  get examResponses(){return {...state.examAnswers}}
 });
})();
