/* Shared learning navigation and progress. Completed parts are remembered through
 * KartleggLearningProgress (learning-progress.js); no clinical calculations. */
'use strict';
window.KartleggLearningFlow=(()=>{
 const previous=new WeakMap();
 const make=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;if(text)el.textContent=text;return el};
 const Progress=()=>window.KartleggLearningProgress;
 // Resultatet leses fra oppsummeringen som modulen nettopp har vist («7 / 9» eller «7 av 9»).
 function summaryScore(root){
  const el=root.querySelector('.learn12-big-score,.gcs-learn-big-score,.wound12-score');
  const m=el?.textContent.match(/(\d+)\s*(?:\/|av)\s*(\d+)/);
  return m?{correct:Number(m[1]),total:Number(m[2])}:null;
 }
 function remember(root,course,phase,current,total,finished){
  const store=Progress();if(!store)return;
  if(phase==='learn'&&total&&current>=total)store.record(course,'learn');
  else if(finished&&(phase==='practice'||phase==='test'))store.record(course,phase,summaryScore(root));
 }
 function mount(root,{course,mode,current=0,total=0,finished=false,onMode}){
  const phase=mode==='exam'?'test':mode;
  const key=[course,phase,current,finished].join(':');
  if(previous.get(root)!==key)remember(root,course,phase,current,total,finished);
  const done=Progress()?.get(course)||{};
  const nav=make('nav','learning-flow');nav.setAttribute('aria-label',course+' – læringsnivå');
  for(const [id,label] of [['home','Oversikt'],['learn','01 Lær'],['practice','02 Øv'],['test','03 Test']]){
   const button=make('button','learning-flow-step',label);button.type='button';
   if(id===phase)button.setAttribute('aria-current','step');
   if(done[id]){button.classList.add('is-done');button.append(make('span','learning-flow-done','✓'));button.setAttribute('aria-label',label+', fullført')}
   button.addEventListener('click',()=>{if(id!==phase)onMode(id)});nav.append(button);
  }
  const wrap=make('div','learning-orientation');wrap.append(nav);
  if(total&&phase!=='home'){
   const progress=make('div','learning-progress');
   const label=finished?'Fullført':(phase==='learn'?'Tema ':'Oppgave ')+Math.min(current,total)+' av '+total;
   progress.append(make('span','',label));
   const bar=make('progress','');bar.max=total;bar.value=finished?total:Math.max(0,current-1);
   bar.setAttribute('aria-label',course+' – fullførte '+(phase==='learn'?'temaer':'oppgaver'));progress.append(bar);wrap.append(progress);
   wrap.append(make('p','learning-flow-hint',phase==='learn'?'Les forklaringen og gå videre i ditt tempo.':phase==='practice'?'Øv med forklaring etter hvert svar.':'Svar på alle oppgavene. Fasit og forklaringer vises til slutt.'));
  }
  root.prepend(wrap);
  // På mobil skjules introteksten til modulen når du er i gang med Lær, Øv eller Test.
  root.closest('section')?.classList.toggle('is-learning-active',phase!=='home');
  root.querySelectorAll('.gcs-learn-progress,.learn12-progress').forEach(el=>el.remove());
  const heading=root.querySelector('h3');
  if(heading)heading.tabIndex=-1;
  if(previous.has(root)&&previous.get(root)!==key&&root.getClientRects().length&&heading){
   heading.focus({preventScroll:true});wrap.scrollIntoView({block:'start',behavior:'auto'});
  }
  previous.set(root,key);
 }
 function feedback(el){el.tabIndex=-1;el.setAttribute('role','status');el.focus({preventScroll:true});el.scrollIntoView({block:'nearest',behavior:'auto'})}

 // Fremgang på kurskortene øverst i Lær, og en samlet linje med mulighet til å nullstille.
 const chooser=document.getElementById('learningHubChooser');
 const short={learn:'Lær',practice:'Øv',test:'Test'};
 function courseOf(card){return card.querySelector('.learn12-course-copy strong')?.textContent.trim()||''}
 function paint(){
  const store=Progress();if(!chooser||!store)return;
  const cards=[...chooser.querySelectorAll('.learn12-course-card')];
  let complete=0,started=0;
  for(const card of cards){
   const course=courseOf(card),p=store.get(course)||{};
   const parts=store.PHASES.filter(x=>p[x]);
   if(parts.length)started++;
   if(parts.length===3)complete++;
   let line=card.querySelector('.learn-progress-line');
   if(!parts.length){line?.remove();card.removeAttribute('data-progress');continue}
   if(!line){line=make('span','learn-progress-line');card.querySelector('.learn12-course-copy')?.append(line)}
   line.replaceChildren(...store.PHASES.map(x=>{
    const s=make('span','learn-progress-chip'+(p[x]?' is-done':''),(p[x]?'✓ ':'')+short[x]+(x==='test'&&Array.isArray(p.best)?' '+p.best[0]+'/'+p.best[1]:''));
    return s;
   }));
   line.setAttribute('aria-label','Fremgang: '+store.PHASES.map(x=>short[x]+(p[x]?' fullført':' ikke fullført')+(x==='test'&&Array.isArray(p.best)?', beste resultat '+p.best[0]+' av '+p.best[1]:'')).join(', '));
   card.dataset.progress=parts.length===3?'complete':'started';
  }
  let bar=document.getElementById('learnProgressSummary');
  if(!started){bar?.remove();return}
  if(!bar){
   bar=make('div','learn-progress-summary');bar.id='learnProgressSummary';
   bar.append(make('p','learn-progress-text'));
   const reset=make('button','btn-inline learn-progress-reset','Nullstill fremgang');reset.type='button';
   reset.addEventListener('click',()=>{if(window.confirm('Nullstille fremgangen i Lær og simuleringen på denne enheten?'))Progress()?.reset()});
   bar.append(reset);chooser.after(bar);
  }
  bar.querySelector('.learn-progress-text').textContent=complete===cards.length?'Du har fullført Lær, Øv og Test i alle '+cards.length+' modulene.':
   'Fullført: '+complete+' av '+cards.length+' moduler. Fremgangen lagres på denne enheten.';
 }
 if(chooser){
  const start=()=>{paint();Progress()?.onChange(paint);window.KartleggGate?.onChange?.(paint)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else setTimeout(start,0);
 }
 return Object.freeze({mount,feedback,paint});
})();
