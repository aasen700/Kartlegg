/* Shared learning navigation and progress; session-only, no clinical calculations. */
'use strict';
window.KartleggLearningFlow=(()=>{
 const previous=new WeakMap();
 const make=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;if(text)el.textContent=text;return el};
 function mount(root,{course,mode,current=0,total=0,finished=false,onMode}){
  const phase=mode==='exam'?'test':mode;
  const key=[course,phase,current,finished].join(':');
  const nav=make('nav','learning-flow');nav.setAttribute('aria-label',course+' – læringsnivå');
  for(const [id,label] of [['home','Oversikt'],['learn','01 Lær'],['practice','02 Øv'],['test','03 Test']]){
   const button=make('button','learning-flow-step',label);button.type='button';
   if(id===phase)button.setAttribute('aria-current','step');
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
  root.querySelectorAll('.gcs-learn-progress,.learn12-progress').forEach(el=>el.remove());
  const heading=root.querySelector('h3');
  if(heading)heading.tabIndex=-1;
  if(previous.has(root)&&previous.get(root)!==key&&root.getClientRects().length&&heading){
   heading.focus({preventScroll:true});wrap.scrollIntoView({block:'start',behavior:'auto'});
  }
  previous.set(root,key);
 }
 function feedback(el){el.tabIndex=-1;el.setAttribute('role','status');el.focus({preventScroll:true});el.scrollIntoView({block:'nearest',behavior:'auto'})}
 return Object.freeze({mount,feedback});
})();
