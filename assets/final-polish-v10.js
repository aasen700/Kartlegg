/* Kartlegg v1.0 RC2 – final usability enhancements.
 * Optional GCS progressive disclosure, specific validation, "Nå" timestamp,
 * accessible clinical part-score display and safe responsive nav feedback.
 * No new stored data or scoring formula changes.
*/
'use strict';
(()=>{
const $=id=>document.getElementById(id),form=$('vitalsForm');
if(!form)return;
const fields=[
 ['rr','Respirasjonsfrekvens'],['spo2','Oksygenmetning (SpO₂)'],
 ['sbp','Systolisk blodtrykk'],['hr','Puls'],['temp','Temperatur'],
 ['conscious','Bevissthetsnivå (AVPU)'],['oxygen','Tilført oksygen'],
 ['scale','NEWS2 SpO₂-skala'],['confusion','Nyoppstått forvirring']
];
const gcs=$('gcs'),originalGCS=gcs.closest('.field');
const extra=document.createElement('details');extra.id='optionalGCS';extra.className='v10-optional-gcs';
const summary=document.createElement('summary');summary.id='optionalGCSSummary';
summary.textContent='＋ GCS – valgfritt for qSOFA';
const hint=document.createElement('span');hint.textContent='NEWS2 kan beregnes uten GCS. Bruk GCS bare dersom den er vurdert separat.';
extra.append(summary,hint);
originalGCS.parentElement.after(extra);extra.append(originalGCS);
function openGcsIfPopulated(){if(gcs.value.trim()){extra.open=true;summary.textContent='GCS – valgfritt for qSOFA'}}
gcs.addEventListener('input',openGcsIfPopulated);
gcs.addEventListener('focus',()=>{extra.open=true});
extra.addEventListener('toggle',()=>{summary.textContent=extra.open?'GCS – valgfritt for qSOFA':'＋ GCS – valgfritt for qSOFA'});
openGcsIfPopulated();
// Additional lightweight time utility: no polling, uses device-local clock only on click.
const now=document.createElement('button');now.type='button';now.id='setMeasurementNow';now.className='v10-now-button';now.textContent='◷ Nå';
now.setAttribute('aria-label','Sett dagens dato og klokkeslett til nå');
const meta=form.querySelector('.meta-line');
meta.insertBefore(now,meta.querySelector('small'));
function setNow(){
 const d=new Date(),pad=n=>String(n).padStart(2,'0');
 $('measureDate').value=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
 $('measureTime').value=pad(d.getHours())+':'+pad(d.getMinutes());
 for(const id of ['measureDate','measureTime'])$(id).dispatchEvent(new Event('change',{bubbles:true}));
}
now.addEventListener('click',setNow);
// Highlight only failures after an attempted action, not during ordinary entry.
const summaryBox=document.createElement('div');summaryBox.id='v10ValidationSummary';summaryBox.className='v10-validation-summary';summaryBox.hidden=true;
summaryBox.setAttribute('role','alert');summaryBox.setAttribute('aria-live','assertive');summaryBox.tabIndex=-1;
meta.before(summaryBox);
function listErrors(includeDate=false){
 const issues=[];
 for(const [id,name] of fields){
  if(id==='confusion'){
   if(!form.querySelector('input[name="confusion"]:checked'))issues.push({id,name,reason:'velg Ja eller Nei'});
   continue;
  }
  const input=$(id);
  if(!input.value.trim())issues.push({id,name,reason:'mangler'});
  else if(!input.checkValidity())issues.push({id,name,reason:'ugyldig verdi'});
 }
 if(gcs.value.trim()&&!gcs.checkValidity())issues.push({id:'gcs',name:'GCS',reason:'angi heltall fra 3 til 15'});
 if(includeDate){
  for(const [id,name] of [['measureDate','Dato'],['measureTime','Klokkeslett']]){
   if(!$(id).value)issues.push({id,name,reason:'mangler'});
   else if(!$(id).checkValidity())issues.push({id,name,reason:'ugyldig'});
  }
 }
 return issues;
}
let attempted=false;
function fieldOf(issue){
 if(issue.id==='confusion')return form.querySelector('input[name="confusion"]')?.closest('.field');
 return $(issue.id)?.closest('.field')||$(issue.id)?.closest('.meta-line');
}
function markInvalid(issues){
 form.querySelectorAll('.v10-field-error').forEach(e=>e.classList.remove('v10-field-error'));
 form.querySelectorAll('[aria-invalid="true"]').forEach(e=>e.removeAttribute('aria-invalid'));
 for(const issue of issues){
  fieldOf(issue)?.classList.add('v10-field-error');
  if(issue.id==='confusion'){
   form.querySelectorAll('input[name="confusion"]').forEach(i=>i.setAttribute('aria-invalid','true'));
  }else $(issue.id)?.setAttribute('aria-invalid','true');
 }
}
function clear(){
 attempted=false;
 markInvalid([]);
 summaryBox.hidden=true;summaryBox.replaceChildren();
}
function report(includeDate=false){
 attempted=true;
 const issues=listErrors(includeDate);
 markInvalid(issues);
 if(!issues.length){clear();return true}
 summaryBox.replaceChildren();
 const head=document.createElement('strong');head.textContent='Fullfør eller rett '+issues.length+' felt:';
 const list=document.createElement('ul');
 for(const issue of issues){
  const li=document.createElement('li'),link=document.createElement('a');
  link.href='#'+(issue.id==='confusion'?'confusion-label':issue.id);
  link.textContent=issue.name+' – '+issue.reason;
  link.addEventListener('click',event=>{
   event.preventDefault();
   if(issue.id==='gcs')extra.open=true;
   const input=issue.id==='confusion'?form.querySelector('input[name="confusion"]'):$(issue.id);
   input?.scrollIntoView({block:'center',behavior:'auto'});input?.focus({preventScroll:true});
  });
  li.append(link);list.append(li);
 }
 summaryBox.append(head,list);summaryBox.hidden=false;
 // Keep both summary and nearest failing field accessible without jumping past summary.
 summaryBox.scrollIntoView({block:'start',behavior:'auto'});summaryBox.focus({preventScroll:true});
 return false;
}
form.addEventListener('input',()=>{
 if(!attempted)return;
 const issues=listErrors(false);markInvalid(issues);
 // Full field list remains in the summary until a new submit; no distracting live jumps.
},{passive:true});
form.addEventListener('reset',()=>{setTimeout(()=>{clear();extra.open=false;},0)});
$('saveMeasurement')?.addEventListener('click',()=>{if(listErrors(true).length)report(true)},true);
const dockSave=$('dockSave');dockSave?.addEventListener('click',()=>{if(listErrors(true).length)report(true)},true);
// Runs BEFORE app.js submit listener (capturing phase), while preserving scoring.
form.addEventListener('submit',()=>{report(false)},true);
// Keep the optional GCS area visible when a saved historic observation fills the field.
document.querySelector('#historyRows')?.addEventListener('click',()=>queueMicrotask(openGcsIfPopulated));
// Visual presentation only – no color meanings changed from scoring.
const breakdown=document.createElement('div');breakdown.id='v10ClinicalParts';breakdown.className='v10-clinical-parts';breakdown.hidden=true;
breakdown.setAttribute('aria-label','Delpoeng i NEWS2');
$('newsBreakdown').before(breakdown);
const partsLabels={rr:'RF',spo:'SpO₂',sbp:'Systolisk BT',hr:'Puls',temp:'Temperatur',consciousness:'Bevissthet',oxygen:'Tilført O₂'};
function renderParts(event){
 const parts=event.detail?.parts;
 if(!parts){breakdown.hidden=true;breakdown.replaceChildren();return}
 const anyThree=Object.values(parts).some(value=>value===3);
 breakdown.replaceChildren();
 for(const [key,label] of Object.entries(partsLabels)){
  const value=parts[key];
  const chip=document.createElement('div');chip.className='v10-part-score '+(value===3?'critical':value===2?'elevated':value===1?'minor':'normal');
  const name=document.createElement('span');name.textContent=label;
  const num=document.createElement('strong');num.textContent=value+' p';
  chip.append(name,num);breakdown.append(chip);
 }
 if(anyThree){
  const note=document.createElement('p');note.className='v10-part-warning';note.textContent='Minst én enkeltparameter gir 3 poeng – vurder separat eskaleringsbehov.';
  breakdown.append(note);
 }
 breakdown.hidden=false;
}
// app.js provides the validated, already computed NEWS2 parts on each input/change.
// One calculation now drives both the score card and the detailed visualization.
window.addEventListener('kartlegg:news2-changed',renderParts);
// Visible mobile menu action without moving the original sidebar or NEWS2 form.
const menu=$('menuButton'),label=document.createElement('span');label.className='v10-menu-label';label.textContent='Meny';menu.append(label);
const menuIcon=document.createElement('span');menuIcon.className='v10-menu-symbol';menuIcon.setAttribute('aria-hidden','true');
menuIcon.textContent='☰';menu.firstChild.textContent='';menu.prepend(menuIcon);
window.KartleggFinalPolish={report,clear,listErrors,setNow};
})();