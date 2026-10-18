/* TIMES interactive teaching: six fictional cases, two original image treatments.
 * Never accepts patient identifiers. No storage, networking or treatment decisions.
 */
'use strict';
(()=>{
 const D=window.KartleggWoundLearning,chooser=document.getElementById('learningHubChooser');
 const panel=document.getElementById('learnTimesModule'),root=document.getElementById('woundLearningRoot');
 if(!D||!chooser||!panel||!root)return;
 const h=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
 const b=(txt,cls,fn)=>{const e=h('button',cls,txt);e.type='button';e.addEventListener('click',fn);return e};
 let mode='home',caseIndex=0,lesson=0,realistic=false,answers={},grades={},finished=false;
 const cases=()=>D.cases.filter(c=>c.level===(mode==='practice'?'Øv':'Test'));
 const course=b('','learn12-course-card wound12-course',()=>open('home'));course.dataset.learnTool='times';
 course.setAttribute('aria-pressed','false');course.append(h('span','learn12-course-symbol','▤'));
 const words=h('span','learn12-course-copy');words.append(h('strong','','TIMES'),h('small','','Sårvurdering med seks illustrerte kasus'));course.append(words);chooser.append(course);
 function picture(c){
  const fig=h('figure','wound12-image');
  const img=h('img');img.src='assets/wounds/'+c.id+(realistic?'-realistic.svg':'-drawn.svg');
  img.alt='Digitalt laget, '+(realistic?'detaljert':'forenklet')+' sårdiagram for '+c.title+'. Ikke pasientfoto.';
  img.loading='lazy';img.decoding='async';
  fig.append(img,h('figcaption','','Fiktiv digital illustrasjon. Bruk kasusbeskrivelsen som grunnlag for svarene – ikke bildet alene.'));
  return fig;
 }
 function switcher(){
  const box=h('label','wound12-switch'),check=h('input');check.type='checkbox';check.checked=realistic;
  check.addEventListener('change',()=>{realistic=check.checked;render()});
  box.append(check,h('span','','Vis mer realistisk illustrasjon (ikke ekte fotografi)'));return box;
 }
 function header(kicker,title){
  const d=h('div','wound12-header');d.append(h('small','',kicker),h('h3','',title));
  if(mode!=='home')d.append(b('← Tilbake til nivåer','learn12-secondary',()=>setMode('home')));
  root.append(d);
 }
 function setMode(m){mode=m;lesson=0;caseIndex=0;answers={};grades={};finished=false;render()}
 function open(m='home'){
  document.querySelector('[data-page="laer"]')?.click();
  for(const id of ['learnGcsModule','learn4atModule','learnNews2Module']){const p=document.getElementById(id);if(p)p.hidden=true}
  panel.hidden=false;
  chooser.querySelectorAll('[data-learn-tool]').forEach(x=>{x.classList.toggle('is-active',x===course);x.setAttribute('aria-pressed',String(x===course))});
  setMode(['learn','practice','test'].includes(m)?m:'home');
 }
 chooser.addEventListener('click',e=>{
  if(e.target.closest('[data-learn-tool]')!==course)panel.hidden=true;
 },true);
 function home(){
  header('Kartlegg Lær · sårvurdering','TIMES – lær, øv og test');
  root.append(h('p','wound12-intro','Tren på å beskrive vev, infeksjons-/inflammasjonstegn, sårvæske, sårkant og huden rundt. Seks fiktive kasus med to originale illustrasjonsnivåer. Ikke til reell pasientbehandling.'));
  root.append(switcher());
  const cols=h('div','wound12-modes');
  for(const [key,num,title,detail] of [['learn','01','Lær','Seks korte leksjoner om TIMES-strukturen.'],['practice','02','Øv','Tre kasus med forklaring umiddelbart etter innlevering.'],['test','03','Test deg selv','Tre kasus der du får samlet fasit først til slutt.']]){
   const c=h('article','wound12-mode');c.append(h('span','wound12-num',num),h('h4','',title),h('p','',detail),b('Start '+title.toLowerCase()+' →','learn12-primary',()=>setMode(key)));cols.append(c);
  }
  root.append(cols);
  root.append(picture(D.cases[0]));
 }
 function learn(){
  const x=D.lessons[lesson];header('Lær · '+(lesson+1)+' av '+D.lessons.length,x.title);
  root.append(h('p','wound12-intro',x.body));
  const ul=h('ul','wound12-tips');x.tips.forEach(y=>ul.append(h('li','',y)));root.append(ul);
  const actions=h('div','wound12-actions');
  if(lesson)actions.append(b('← Forrige','learn12-secondary',()=>{lesson--;render()}));
  actions.append(b(lesson===D.lessons.length-1?'Start å øve →':'Neste tema →','learn12-primary',()=>{
   if(lesson===D.lessons.length-1)setMode('practice');else{lesson++;render()}
  }));root.append(actions);
 }
 function caseView(){
  const q=cases()[caseIndex],submitted=grades[q.id];
  header((mode==='practice'?'Øv':'Test')+' · kasus '+(caseIndex+1)+' av '+cases().length,q.title);
  root.append(switcher(),picture(q),h('p','wound12-subtitle',q.subtitle),h('p','wound12-intro',q.summary));
  const obs=h('details','wound12-observations');obs.append(h('summary','','Oppsummer beskrevne observasjoner'));
  const ul=h('ul');q.observations.forEach(x=>ul.append(h('li','',x)));obs.append(ul);root.append(obs);
  const fields=h('div','wound12-questions'),a=answers[q.id]||{};
  for(const part of D.parts){
   const field=h('fieldset','wound12-question'),legend=h('legend','',part.letter+' · '+part.title);
   field.append(legend,h('p','',part.prompt));
   const options=h('div','wound12-options');
   part.options.forEach(([value,label])=>{
    const choice=b(label,'wound12-choice'+(a[part.id]===value?' selected':''),()=>{
     if(submitted)return;
     answers[q.id]={...(answers[q.id]||{}),[part.id]:value};render();
    });choice.setAttribute('aria-pressed',String(a[part.id]===value));choice.disabled=Boolean(submitted);options.append(choice);
   });field.append(options);
   if(submitted){
    const correct=submitted.truth[part.id],yes=submitted.match[part.id];
    field.append(h('p','wound12-feedback', (yes?'✓ Riktig. ':'○ Se fasit. ')+D.optionLabel(part.id,correct)+'. '+q.why[part.id]));
   }
   fields.append(field);
  }
  root.append(fields);
  const footer=h('div','wound12-actions');
  if(!submitted) {
   const submit=b('Lever TIMES-vurdering','learn12-primary',()=>{
    if(D.parts.some(p=>!(answers[q.id]||{})[p.id])){document.getElementById('wound12Status').textContent='Svar på alle fem TIMES-områdene før du leverer.';return}
    grades[q.id]=D.grade(q.id,answers[q.id]);
    if(mode==='test'){if(caseIndex===cases().length-1){finished=true;render()}else{caseIndex++;render()}}
    else render();
   });
   footer.append(submit);
  }else {
   footer.append(h('strong','wound12-total',submitted.score+' / '+submitted.max+' riktige'));
   footer.append(b(caseIndex===cases().length-1?'Se oppsummering →':'Neste kasus →','learn12-primary',()=>{
    if(caseIndex===cases().length-1)finished=true;else caseIndex++;render();
   }));
  }
  root.append(footer);
 }
 function summary(){
  header('Fullført · '+(mode==='practice'?'Øv':'Test'),'Resultater og fasit');
  const list=cases(),total=list.reduce((sum,c)=>sum+(grades[c.id]?.score||0),0);
  root.append(h('p','wound12-score',total+' / '+(list.length*D.parts.length)+' riktige observasjonsvalg'));
  root.append(h('p','wound12-intro','Resultatet er pedagogisk tilbakemelding, ikke en kompetansevurdering eller klinisk godkjenning.'));
  list.forEach(q=>{
   const g=grades[q.id],card=h('article','wound12-report');card.append(h('h4','',q.title),h('strong','',g.score+' av 5 riktige'));
   const ul=h('ul');D.parts.forEach(p=>ul.append(h('li','',(g.match[p.id]?'✓ ':'○ ')+p.letter+': '+D.optionLabel(p.id,g.truth[p.id])+' – '+q.why[p.id])));
   card.append(ul);root.append(card);
  });
  root.append(b('Prøv på nytt','learn12-primary',()=>setMode(mode)));
 }
 function render(){
  root.replaceChildren();
  if(mode==='home')home();else if(mode==='learn')learn();else if(finished)summary();else caseView();
  const note=h('p','wound12-disclaimer','Illustrasjonene er digitalt laget og representerer ikke faktiske pasienter. Infeksjon, sårårsak og behandlingsbehov kan ikke avgjøres fra bilde. Følg lokale prosedyrer og faglig vurdering.');
  const src=h('a','wound12-source','Les om TIMES hos Sykepleien ↗');src.href='https://sykepleien.no/forskning/2019/02/bruk-verktoyet-times-til-vurdere-sar-strukturert';src.target='_blank';src.rel='noopener noreferrer';
  const status=h('p','wound12-status');status.id='wound12Status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  root.append(note,src,status);
 }
 window.KartleggWoundLearningUI=Object.freeze({open,get mode(){return mode},get realistic(){return realistic},get caseIndex(){return caseIndex}});
})();