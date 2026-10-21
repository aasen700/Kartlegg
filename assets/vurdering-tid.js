/* Kartlegg – kompakt tidspunkt i NEWS2 og qSOFA.
 * Dato og klokkeslett vises som én linje («Målt i dag kl. 10:46») med en knapp som åpner feltene.
 * Feltene, «Nå»-knappen og valideringen er uendret; denne fila styrer bare hva som vises.
 */
'use strict';
(()=>{
 const meta=document.querySelector('#vitalsForm .meta-line'),date=document.getElementById('measureDate'),time=document.getElementById('measureTime');
 if(!meta||!date||!time)return;
 const bar=document.createElement('div');bar.className='time-summary';
 const text=document.createElement('p');text.className='time-summary-text';text.id='timeSummaryText';
 const edit=document.createElement('button');edit.type='button';edit.className='time-summary-edit';edit.id='editMeasurementTime';
 edit.setAttribute('aria-expanded','false');edit.setAttribute('aria-describedby','timeSummaryText');
 bar.append(text,edit);meta.prepend(bar);
 const pad=n=>String(n).padStart(2,'0');
 function describe(){
  const d=date.value,t=time.value;
  if(!d||!t)return 'Tidspunkt for målingen mangler';
  const now=new Date(),today=now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate());
  const y=new Date(now);y.setDate(now.getDate()-1);
  const yesterday=y.getFullYear()+'-'+pad(y.getMonth()+1)+'-'+pad(y.getDate());
  const day=d===today?'i dag':d===yesterday?'i går':d.split('-').reverse().join('.');
  return 'Målt '+day+' kl. '+t;
 }
 function render(){text.textContent=describe()}
 function setOpen(open){
  meta.classList.toggle('is-collapsed',!open);edit.setAttribute('aria-expanded',String(open));
  edit.textContent=open?'Ferdig':'Endre tidspunkt';
  render();
 }
 edit.addEventListener('click',()=>{const open=meta.classList.contains('is-collapsed');setOpen(open);(open?date:edit).focus()});
 for(const el of [date,time])for(const ev of ['input','change'])el.addEventListener(ev,render);
 // Verdiene kan settes uten hendelser (lagret måling hentes inn, skjemaet nullstilles), så linjen oppdateres også da.
 window.addEventListener('kartlegg:news2-changed',render);
 document.getElementById('vitalsForm').addEventListener('reset',()=>setTimeout(render,0));
 // Feil i dato eller klokkeslett må vises: feltene åpnes når valideringen markerer dem.
 new MutationObserver(()=>{if(meta.classList.contains('v10-field-error')&&meta.classList.contains('is-collapsed'))setOpen(true)})
  .observe(meta,{attributes:true,attributeFilter:['class']});
 setOpen(false);
 window.KartleggTimeSummary=Object.freeze({render,open:()=>setOpen(true),close:()=>setOpen(false)});
})();
