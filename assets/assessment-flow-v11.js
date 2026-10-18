/* Kartlegg 1.1 assessment flow. Navigation only; scoring remains owned by app.js. */
'use strict';
(()=>{
 const form=document.getElementById('vitalsForm');
 const steps=[...document.querySelectorAll('[data-assessment-step]')];
 const status=document.getElementById('assessmentFlowStatus');
 const review=document.getElementById('reviewResponse');
 const resultIsbar=document.getElementById('resultIsbar');
 const targets={input:['vurdering','input-heading'],result:['resultater','result-heading'],action:['forklaring','info-heading']};
 const focusStep=(name,announce=true)=>{
  const [sectionId,headingId]=targets[name]||targets.input;
  const section=document.getElementById(sectionId),heading=document.getElementById(headingId);
  steps.forEach(button=>{
   const active=button.dataset.assessmentStep===name;
   if(active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
  });
  section?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}
  if(announce&&status)status.textContent=`Trinn ${name==='input'?1:name==='result'?2:3} av 3: ${name==='input'?'Registrer':name==='result'?'Resultat':'Tiltak'}.`;
 };
 const markResult=()=>{
  const ready=document.getElementById('newsNumber')?.textContent.trim()!=='–';
  document.getElementById('resultater')?.classList.toggle('is-ready',ready);
  if(review)review.disabled=!ready;
  steps.forEach(button=>button.classList.toggle('is-complete',ready&&button.dataset.assessmentStep==='input'));
  return ready;
 };
 steps.forEach(button=>button.addEventListener('click',()=>focusStep(button.dataset.assessmentStep)));
 form?.addEventListener('submit',()=>{if(markResult())focusStep('result')});
 form?.addEventListener('reset',()=>setTimeout(()=>{markResult();focusStep('input',false)},0));
 window.addEventListener('kartlegg:news2-changed',markResult);
 review?.addEventListener('click',()=>focusStep('action'));
 resultIsbar?.addEventListener('click',()=>document.getElementById('openIsbar')?.click());
 markResult();
 window.KartleggAssessmentFlow=Object.freeze({focusStep,markResult});
})();
