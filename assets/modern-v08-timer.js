/* Kartlegg v0.8: stopwatch-assisted breathing observation. Never persists observations. */
'use strict';
(()=>{
const $=id=>document.getElementById(id),rr=$('rr'),V=window.KartleggV08;
if(!rr||!V)return;
const header=rr.closest('.field')?.querySelector('.field-head');if(!header)return;
const launch=document.createElement('button');launch.type='button';launch.id='respTimerLaunch';
launch.className='v08-timer-launch';launch.setAttribute('aria-label','Åpne respirasjonstimer');launch.textContent='◷ Tell pust';header.append(launch);
const dialog=document.createElement('dialog');dialog.id='respTimerDialog';dialog.className='v08-dialog v08-resp-dialog';dialog.setAttribute('aria-labelledby','respTimerTitle');
dialog.innerHTML="<div class=\"v08-dialog-head\"><div><p class=\"eyebrow\">Hjelpemiddel for observasjon</p><h2 id=\"respTimerTitle\">Respirasjonstimer</h2></div><button type=\"button\" id=\"respClose\" class=\"dialog-close\" aria-label=\"Lukk respirasjonstimer\">×</button></div>\n<div class=\"v08-dialog-content\"><p class=\"v08-explainer\">Tell åndedrag mens pasienten observeres. Bruk helst <strong>60 sekunder ved uregelmessig respirasjon</strong>. Kortere telling gir en beregnet frekvens.</p>\n<fieldset class=\"v08-duration\"><legend>Velg varighet</legend><label><input type=\"radio\" name=\"respDuration\" value=\"15\">15 sek</label><label><input type=\"radio\" name=\"respDuration\" value=\"30\">30 sek</label><label><input type=\"radio\" name=\"respDuration\" value=\"60\" checked>60 sek</label></fieldset>\n<div class=\"v08-timer-display\"><div class=\"v08-timer-count\" id=\"respCountdown\" aria-label=\"Gjenværende tid\">60,0 sek</div><div class=\"v082-timer-geometry\" id=\"respTimerGeometry\" data-shape=\"circle\"><svg viewBox=\"0 0 240 185\" aria-label=\"Visuell fremdrift for nedtellingen\" role=\"img\" focusable=\"false\"><path id=\"respTimerBase\" d=\"M120 20 A74 74 0 1 1 120 168 A74 74 0 1 1 120 20\"></path><path id=\"respTimerProgress\" d=\"M120 20 A74 74 0 1 1 120 168 A74 74 0 1 1 120 20\"></path></svg><span class=\"v082-shape-caption\" id=\"respTimerShapeCaption\">Hel sirkel · 60 sekunder</span></div><div class=\"v08-timer-stats\"><div><span>Registrerte pust</span><strong id=\"respBreaths\">0</strong></div><div><span>Tilstand</span><strong id=\"respPhase\">Klar</strong></div></div></div>\n<button class=\"v08-tap-button\" type=\"button\" id=\"respTap\" disabled>＋ 1 pust <small>Trykk én gang per observert åndedrag</small></button>\n<div class=\"v08-timer-actions\"><button class=\"btn btn-primary\" type=\"button\" id=\"respStart\">Start telling</button><button class=\"btn btn-secondary\" type=\"button\" id=\"respPause\" disabled>Pause</button><button class=\"btn btn-secondary\" type=\"button\" id=\"respReset\">Nullstill</button></div>\n<label class=\"v08-timer-audio\"><input type=\"checkbox\" id=\"respSound\"> Diskret lyd ved ferdig telling (av som standard)</label><div class=\"v08-timer-result\" id=\"respTimerResult\" role=\"status\" hidden></div>\n<p class=\"v08-smallprint\" id=\"respTimerInfo\" role=\"status\">Tiden må fullføres før resultatet kan overføres. Ingen telling lagres automatisk.</p></div>";document.body.append(dialog);
let duration=60,breaths=0,remaining=60000,deadline=0,handle=null,state='ready',audioCtx=null;
const countdown=$('respCountdown'),tap=$('respTap'),phase=$('respPhase'),start=$('respStart'),pause=$('respPause'),progress=$('respTimerProgress'),base=$('respTimerBase'),geometry=$('respTimerGeometry'),result=$('respTimerResult'),info=$('respTimerInfo');
const choices=[...dialog.querySelectorAll('[name=respDuration]')];
const shapes=Object.freeze({
  15:{kind:'line',path:'M 36 108 H 204',caption:'Rett linje · 15 sekunder'},
  30:{kind:'semicircle',path:'M 36 156 A 84 84 0 0 1 204 156',caption:'Halvsirkel · 30 sekunder'},
  60:{kind:'circle',path:'M 120 20 A 74 74 0 1 1 120 168 A 74 74 0 1 1 120 20',caption:'Hel sirkel · 60 sekunder'}
});
let pathLength=0;
function setShape(){
 const shape=shapes[duration];
 geometry.dataset.shape=shape.kind;
 base.setAttribute('d',shape.path);progress.setAttribute('d',shape.path);
 $('respTimerShapeCaption').textContent=shape.caption;
 pathLength=progress.getTotalLength();
 progress.style.strokeDasharray=String(pathLength)+' '+String(pathLength);
}

function clearTicker(){if(handle!==null){clearInterval(handle);handle=null}}
function render(){
 countdown.textContent=(Math.ceil(remaining/100)/10).toLocaleString('nb-NO',{minimumFractionDigits:1,maximumFractionDigits:1})+' sek';
 progress.style.strokeDashoffset=String(pathLength*Math.max(0,Math.min(1,remaining/(duration*1000))));
 $('respBreaths').textContent=String(breaths);phase.textContent=({ready:'Klar',running:'Teller',paused:'Pauset',done:'Fullført'})[state];
 tap.disabled=state!=='running';start.disabled=state==='running'||state==='done';pause.disabled=state!=='running';
 start.textContent=state==='paused'?'Fortsett':'Start telling';
 choices.forEach(x=>x.disabled=state==='running'||state==='paused');
}
function beep(){
 if(!$('respSound').checked)return;
 try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  audioCtx=audioCtx||new C();
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime;
  o.type='sine';o.frequency.value=520;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.035,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.22);
  o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+.24);
 }catch(_){}
}
function finish(){
 clearTicker();remaining=0;state='done';render();beep();
 const x=V.respiratoryRate(breaths,duration);result.replaceChildren();result.hidden=false;
 const heading=document.createElement('strong');heading.textContent=x.rate+' pust/min';result.append(heading);
 const p=document.createElement('p');p.textContent=x.count+' pust på '+duration+' sek'+(x.estimated?' (omregnet til ett minutt)':' (helt minutt)');result.append(p);
 const note=document.createElement('p');note.textContent=x.estimated?'Korttelling kan gi et misvisende estimat ved uregelmessig respirasjon. Tell da 60 sekunder.':'Observer også respirasjonsmønster og pasientens kliniske tilstand.';result.append(note);
 if(x.transferable){
  const button=document.createElement('button');button.type='button';button.id='respTransfer';button.className='btn btn-primary';button.textContent='Overfør '+x.rate+'/min til respirasjonsfeltet';
  button.addEventListener('click',()=>{rr.value=String(x.rate);rr.dispatchEvent(new Event('input',{bubbles:true}));rr.dispatchEvent(new Event('change',{bubbles:true}));dialog.close();rr.focus()});result.append(button);
 }else{const warning=document.createElement('p');warning.textContent='Verdien kan ikke overføres til NEWS2-feltet. Kontroller tellingen og vurder situasjonen.';result.append(warning)}
 info.textContent='Resultatet blir ikke lagret automatisk.';
}
function tick(){
 if(state!=='running')return;
 if(document.hidden){pauseTimer(true);return}
 remaining=Math.max(0,deadline-performance.now());
 if(remaining<=0)finish();else render();
}
function pauseTimer(hidden=false){
 if(state!=='running')return;
 remaining=Math.max(0,deadline-performance.now());clearTicker();
 if(remaining<=0){finish();return}
 state='paused';render();
 if(hidden)info.textContent='Tellingen er pauset fordi fanen ble skjult. Gjenoppta bare når du observerer igjen.';
}
function begin(){
 if(state==='running'||state==='done')return;
 if(state==='ready'){breaths=0;remaining=duration*1000;result.hidden=true;result.replaceChildren()}
 if($('respSound').checked){try{const C=window.AudioContext||window.webkitAudioContext;if(C){audioCtx=audioCtx||new C();audioCtx.resume().catch(()=>{})}}catch(_){}}
 deadline=performance.now()+remaining;state='running';render();clearTicker();handle=setInterval(tick,80);
 info.textContent='Trykk +1 én gang for hvert observert åndedrag.';
}
function reset(){
 clearTicker();state='ready';breaths=0;remaining=duration*1000;result.hidden=true;result.replaceChildren();
 info.textContent='Tiden må fullføres før resultatet kan overføres. Ingen telling lagres automatisk.';render();
}
function close(){dialog.close();reset()}
launch.addEventListener('click',()=>{reset();dialog.showModal()});
$('respClose').addEventListener('click',close);
dialog.addEventListener('cancel',reset);
dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
choices.forEach(x=>x.addEventListener('change',()=>{if(!x.checked||state!=='ready')return;duration=Number(x.value);remaining=duration*1000;setShape();render()}));
start.addEventListener('click',begin);pause.addEventListener('click',()=>pauseTimer());$('respReset').addEventListener('click',reset);
tap.addEventListener('click',()=>{if(state!=='running')return;breaths++;render()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='running')pauseTimer(true)});
setShape();render();
})();