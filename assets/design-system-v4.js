/* Kartlegg design system v4 interactions.
 * Navigation routing and visual field state only; no scoring or persistence.
 */
'use strict';
(()=>{
 const form=document.getElementById('vitalsForm');
 const mobileNav=document.querySelector('.mobile-primary-nav');

 mobileNav?.querySelectorAll('.mobile-primary-link[data-page]').forEach(button=>{
  button.addEventListener('click',()=>{
   const destination=document.querySelector(`#sidebar [data-page="${button.dataset.page}"]`);
   destination?.click();
  });
 });

 const hasValue=control=>{
  if(control.type==='radio'||control.type==='checkbox')return control.checked;
  return Boolean(control.value.trim());
 };
 const updateField=field=>{
  if(!field)return;
  const controls=[...field.querySelectorAll('input,select,textarea')];
  if(!controls.length)return;
  const radios=controls.filter(control=>control.type==='radio');
  const complete=radios.length
   ?radios.some(control=>control.checked)
   :controls.every(control=>hasValue(control)&&control.checkValidity());
  field.classList.toggle('is-complete',complete);
 };
 const updateAll=()=>form?.querySelectorAll('.field').forEach(updateField);
 form?.addEventListener('input',event=>updateField(event.target.closest('.field')));
 form?.addEventListener('change',event=>updateField(event.target.closest('.field')));
 form?.addEventListener('reset',()=>requestAnimationFrame(updateAll));
 updateAll();

 window.KartleggDesignSystemV4=Object.freeze({updateField,updateAll});
})();
