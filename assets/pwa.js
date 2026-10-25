/* Kartlegg som app: registrerer service workeren (sw.js), viser når du er uten nett,
 * og forklarer hvordan Kartlegg legges til på hjemskjermen.
 * Service workeren lagrer bare Kartleggs egne filer, ingen personopplysninger.
 */
'use strict';
(()=>{
 const local=['localhost','127.0.0.1'].includes(location.hostname);
 // Lokalt (utvikling) bare når det er slått på, så gamle filer ikke henger igjen mens man jobber.
 let devOn=false;try{devOn=localStorage.getItem('kartlegg.pwa.dev')==='1'}catch(_){}
 const allowed='serviceWorker' in navigator&&(location.protocol==='https:'||local)&&(!local||devOn);
 if(allowed)addEventListener('load',()=>{navigator.serviceWorker.register('sw.js',{scope:'./'}).catch(()=>{})});

 // Uten nett: en rolig melding nederst. Verktøyene regner lokalt og virker fortsatt.
 const note=document.createElement('p');note.className='offline-note';note.setAttribute('role','status');note.hidden=true;
 note.textContent='Du er uten nett. Verktøyene og Lær virker, men innlogging og lagring i kontoen venter til du er på nett igjen.';
 document.body.append(note);
 const update=()=>{note.hidden=navigator.onLine!==false};
 addEventListener('online',update);addEventListener('offline',update);update();

 // «Legg Kartlegg på hjemskjermen» under Om Kartlegg.
 const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const page=document.getElementById('page-om');
 let prompt=null;
 const box=document.createElement('section');box.className='section install-app';box.id='installApp';box.setAttribute('aria-labelledby','installAppTitle');
 const h=document.createElement('h2');h.id='installAppTitle';h.textContent='Bruk Kartlegg som app';
 const p=document.createElement('p');
 const how=document.createElement('p');how.className='install-app-how';
 const button=document.createElement('button');button.type='button';button.className='btn btn-primary';button.textContent='Installer Kartlegg';button.hidden=true;
 button.addEventListener('click',async()=>{if(!prompt)return;prompt.prompt();try{await prompt.userChoice}catch(_){}prompt=null;button.hidden=true});
 function render(){
  if(standalone){p.textContent='Kartlegg er installert som app på denne enheten. Verktøyene og Lær virker også uten nett.';how.hidden=true;button.hidden=true;return}
  p.textContent='Legg Kartlegg på hjemskjermen, så åpnes den som en egen app i fullskjerm. Verktøyene og Lær virker også uten nett, for eksempel der dekningen er dårlig. Innlogging og lagring i kontoen trenger nett.';
  how.hidden=false;
  how.textContent=ios?'På iPhone og iPad: trykk på Del-knappen i Safari (firkanten med pil opp), og velg «Legg til på Hjem-skjerm».':
   prompt?'Trykk på knappen under.':'I Chrome og Edge: åpne menyen (⋮) og velg «Installer app» eller «Legg til på startskjermen».';
  button.hidden=!prompt;
 }
 box.append(h,p,how,button);
 page?.querySelector('.about-v0993-hero')?.after(box);
 addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;render()});
 addEventListener('appinstalled',()=>{prompt=null;render()});
 render();
 window.KartleggPwa=Object.freeze({get allowed(){return allowed},get installable(){return Boolean(prompt)}});
})();
