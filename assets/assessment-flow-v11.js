/* Result focus and next-step navigation. Scoring remains owned by app.js. */
'use strict';
(()=>{
 const form=document.getElementById('vitalsForm');
 const review=document.getElementById('reviewResponse');
 const resultIsbar=document.getElementById('resultIsbar');
 const targets={input:['vurdering','input-heading'],result:['resultater','result-heading'],action:['forklaring','info-heading']};
 const focusStep=name=>{
  const [sectionId,headingId]=targets[name]||targets.input;
  const section=document.getElementById(sectionId),heading=document.getElementById(headingId);
  section?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}
 };
 const markResult=()=>{
  const ready=document.getElementById('newsNumber')?.textContent.trim()!=='–';
  document.getElementById('resultater')?.classList.toggle('is-ready',ready);
  if(review)review.disabled=!ready;
  return ready;
 };
 form?.addEventListener('submit',()=>{if(markResult())focusStep('result')});
 form?.addEventListener('reset',()=>setTimeout(markResult,0));
 window.addEventListener('kartlegg:news2-changed',markResult);
 review?.addEventListener('click',()=>focusStep('action'));
 resultIsbar?.addEventListener('click',()=>document.getElementById('openIsbar')?.click());
 markResult();
 window.KartleggAssessmentFlow=Object.freeze({focusStep,markResult});
})();
