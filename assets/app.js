'use strict';
// Kartlegg v0.3: educational prototype, not validated for patient care.
// RCP NEWS2 (2017/2018) / Sepsis-3 qSOFA (2016).
const $ = id => document.getElementById(id);
const form = $('vitalsForm');
const notice = $('formNotice');
const measurements = []; // Working copy. Persisted only by measurement-store.js: this device, signed-in user, max 24 h, never sent anywhere.
const Store=window.KartleggMeasurementStore, Gate=window.KartleggGate;
let currentPage = 'vurdering';
const formatNumber = (value, digits = 0) => Number(value).toLocaleString('nb-NO', {minimumFractionDigits:digits, maximumFractionDigits:digits});
const pad = value => String(value).padStart(2, '0');
function defaultTimestamp() {
  const now = new Date();
  return { date: `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`, time:`${pad(now.getHours())}:${pad(now.getMinutes())}` };
}
function setTimeNow(){ const t=defaultTimestamp(); $('measureDate').value=t.date; $('measureTime').value=t.time; }
function prettyDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [y,m,d]=value.split('-'); return `${d}.${m}.${y}`;
}
function getTimeData() {
  const date=$('measureDate').value, time=$('measureTime').value;
  if (!date || !time || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const check=new Date(`${date}T${time}:00`);
  if (!Number.isFinite(check.getTime()) || check.getFullYear() !== Number(date.slice(0,4)) || (check.getMonth()+1) !== Number(date.slice(5,7)) || check.getDate() !== Number(date.slice(8,10))) return null;
  return { date, time, iso:`${date}T${time}` };
}
function calculateNEWS2(v){ return Scoring.news2(v); }
function calculateQSOFA(v){ return Scoring.qsofa(v); }
function readVitals() {
  const ids=['rr','spo2','sbp','hr','temp'];
  const ranges={rr:[1,150],spo2:[1,100],sbp:[1,350],hr:[1,300],temp:[25,45]};
  const data={};
  for(const id of ids){
    const element=$(id);
    if(!element.value.trim() || !element.validity.valid) return null;
    const number=Number(element.value.replace(',','.'));
    if(!Number.isFinite(number)||number<ranges[id][0]||number>ranges[id][1]) return null;
    if(id!=='temp'&&!Number.isInteger(number)) return null;
    if(id==='temp'&&Math.abs(number*10-Math.round(number*10))>1e-7) return null;
    data[id]=number;
  }
  let gcs=null;
  if($('gcs').value.trim()) {
    gcs=Number($('gcs').value);
    if(!$('gcs').validity.valid||!Number.isInteger(gcs)||gcs<3||gcs>15) return null;
  }
  const conscious=$('conscious').value, oxygen=$('oxygen').value, scale=$('scale').value;
  const confusion=form.querySelector('input[name="confusion"]:checked')?.value;
  if(!['A','V','P','U'].includes(conscious)||!['yes','no'].includes(oxygen)||!['1','2'].includes(scale)||!['yes','no'].includes(confusion)) return null;
  return {...data,gcs,conscious,oxygen:oxygen==='yes',scale:Number(scale),confusion:confusion==='yes'};
}
function showNotice(message){ notice.textContent=message; notice.classList.toggle('visible',Boolean(message)); }
function setCard(prefix,style,number,status,description,details) {
  const card=$(prefix==='news'?'newsCard':'qCard');
  card.className='score '+style;
  $(prefix+'Number').textContent=number;
  $(prefix+'Number').className='score-number'+(style==='neutral'?' muted':'');
  $(prefix+'Status').textContent=status;
  $(prefix+'Desc').textContent=description;
  $(prefix+'Breakdown').textContent=details;
}
function setMeter(prefix,total,position,level,label,ariaLabel){
  const block=$(prefix+'MeterBlock'),meter=$(prefix+'Meter'),marker=$(prefix+'MeterMarker');
  if(!block||!meter||!marker)return;
  const waiting=total===null;
  block.classList.toggle('is-waiting',waiting);
  if(waiting)delete block.dataset.level;else block.dataset.level=level;
  marker.style.setProperty('--meter-position',position+'%');
  $(prefix+'MeterLabel').textContent=label;
  meter.setAttribute('aria-label',ariaLabel);
}
function newsMeterPosition(total){
  if(total===0)return 6;
  if(total<=4)return 12+((total-.5)/4)*36;
  if(total<=6)return 48+((total-4.5)/2)*20;
  return Math.min(97,68+((Math.min(total,20)-6.5)/14)*32);
}
function updateNewsMeter(news){
  if(!news){
    setMeter('news',null,6,'neutral','Venter på skår','NEWS2-eskalering: venter på skår');
    $('newsRedTrigger').hidden=true;
    return;
  }
  const single3=Object.values(news.parts).some(n=>n===3);
  const level=news.total>=7?'high':news.total>=5?'medium':single3?'red':news.total===0?'routine':'low';
  const label=level==='high'?'Høy risiko':level==='medium'?'Middels risiko':level==='red'?'Enkeltparameter 3':news.total===0?'Rutinemessig':'Lav risiko';
  const trigger=$('newsRedTrigger');
  trigger.hidden=!single3;
  setMeter('news',news.total,newsMeterPosition(news.total),level,label,
    `NEWS2 ${news.total}. ${label}. Markøren viser samlet skår i RCPs eskaleringsnivåer.${single3?' Minst én enkeltparameter gir 3 poeng.':''}`);
}
function updateQMeter(q){
  if(!q){setMeter('q',null,12.5,'neutral','Venter på GCS','qSOFA: venter på separat vurdert GCS');return;}
  const level=q.total===3?'high':q.total===2?'medium':q.total===1?'low':'routine';
  const label=q.total>=2?'Økt risiko ved mistenkt infeksjon':q.total===1?'1 kriterium':'Ingen kriterier';
  setMeter('q',q.total,12.5+(q.total*25),level,label,`qSOFA ${q.total} av 3. ${label}.`);
}
function clearResults(){
  setCard('news','neutral','–','Ikke beregnet','Fyll inn målingene ovenfor for å se NEWS2.','Delpoengene vises her.');
  setCard('q','neutral','–','Ikke beregnet','Fyll inn vitale målinger og en separat vurdert GCS-totalskår.','qSOFA har tre kriterier.');
  updateNewsMeter(null);updateQMeter(null);
  $('scoreTime').textContent='Venter på målinger';
  window.dispatchEvent(new CustomEvent('kartlegg:news2-changed',{detail:null}));
}
function updateScores() {
  const v=readVitals();
  if(!v) {clearResults();return false;}
  const news=calculateNEWS2(v), q=calculateQSOFA(v);
  const single3=Object.values(news.parts).some(n=>n===3);
  const ns=news.total>=7?'danger':news.total>=5?'warning':single3?'red-trigger':'ok';
  const nl=news.total>=7?'Høy risiko · ≥7':news.total>=5?'Middels risiko · 5–6':single3?'Lav–middels · enkeltparameter 3':news.total===0?'Lav risiko · 0':'Lav risiko · 1–4';
  const nd=news.total>=7?'RCP: akutt vurdering av team med intensivkompetanse og kontinuerlig overvåking i sykehus.':
    news.total>=5?'RCP: rask vurdering av kliniker med akuttkompetanse og minst timevis observasjon i sykehus.':
    single3?'RCP: rask klinisk vurdering og minst timevis observasjon i sykehus. Ikke vent på høyere totalskår.':
    news.total===0?'RCP: rutinemessig oppfølging og minst hver 12. time i sykehus.':
    'RCP: vurdering av ansvarlig sykepleier og minst hver 4.–6. time i sykehus.';
  setCard('news',ns,news.total,nl,nd,
    `RF ${news.parts.rr} · SpO₂ ${news.parts.spo} · BT ${news.parts.sbp} · puls ${news.parts.hr} · temp ${news.parts.temp} · bevissthet ${news.parts.consciousness} · O₂ ${news.parts.oxygen}`);
  if(!q) setCard('q','neutral','–','GCS mangler','Oppgi en GCS-totalskår vurdert separat for å beregne qSOFA. AVPU brukes ikke som en automatisk erstatning.','qSOFA: RF ≥22 · systolisk BT ≤100 · GCS <15.');
  else setCard('q',q.total>=2?'warning':q.total===0?'ok':'neutral',q.total,q.total>=2?'2 eller flere kriterier':'Under 2 kriterier',
    'qSOFA ≥2 kan indikere økt risiko ved mistenkt infeksjon; lav qSOFA utelukker ikke sepsis.',
    `RF ≥22: ${q.parts.rr?'ja':'nei'} · systolisk BT ≤100: ${q.parts.sbp?'ja':'nei'} · GCS <15: ${q.parts.mentation?'ja':'nei'}`);
  updateNewsMeter(news);updateQMeter(q);
  $('scoreTime').textContent='Oppdatert fra målingene';
  window.dispatchEvent(new CustomEvent('kartlegg:news2-changed',{detail:{total:news.total,parts:news.parts}}));
  return true;
}
function showPage(page, setHash=true) {
  if(!['start','vurdering','historikk','verktoy','laer','simulering','profil','om','konto','vilkar','personvern'].includes(page)) page='start';
  // The gate decides what a visitor may see (UX only; data is protected by Firestore rules).
  if(Gate) page=Gate.resolve(page);
  currentPage=page;
  document.querySelectorAll('.page').forEach(el=>{el.hidden=el.id!==`page-${page}`;});
  document.querySelectorAll('[data-page]').forEach(button=>{
    const active=button.dataset.page===page;
    button.classList.toggle('active',active);
    if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
  if(page==='historikk') renderHistory();
  if(setHash) history.replaceState(null,'',`#${page}`);
  closeMenu();
  window.scrollTo({top:0,behavior:'instant'});
  window.dispatchEvent(new CustomEvent('kartlegg:page',{detail:{page}}));
}
function getSnapshot() {
  const v=readVitals(), stamp=getTimeData();
  if(!v) {showNotice('Fyll ut de obligatoriske målingene med gyldige verdier før du fortsetter. GCS er valgfritt, men må være 3–15 dersom du fyller den inn.');showPage('vurdering');return null;}
  if(!stamp){showNotice('Velg en gyldig dato og et klokkeslett for målingen.');showPage('vurdering');return null;}
  return {...stamp,v,news:calculateNEWS2(v),q:calculateQSOFA(v)};
}
function saveSnapshot() {
  const snapshot=getSnapshot();if(!snapshot)return;
  const existing=measurements.findIndex(m=>m.iso===snapshot.iso);
  if(existing<0&&measurements.length>=48){showNotice('Maksimalt 48 målinger i én midlertidig økt. Slett noen målinger før du legger til flere.');return;}
  if(existing>=0)measurements.splice(existing,1,{...snapshot,savedAt:measurements[existing].savedAt});else measurements.push({...snapshot,savedAt:Date.now()});
  measurements.sort((a,b)=>a.iso.localeCompare(b.iso));
  persistMeasurements();
  showNotice('Målingen er '+(existing>=0?'oppdatert':'lagret')+' på denne enheten i inntil 24 timer. Den sendes ikke til noen server.');
  updateScores();
  showPage('historikk');
}
function applySnapshot(m) {
  for(const id of ['rr','spo2','sbp','hr','temp']) $(id).value=m.v[id];
  $('gcs').value=m.v.gcs===null?'':m.v.gcs;
  $('conscious').value=m.v.conscious;
  $('oxygen').value=m.v.oxygen?'yes':'no';
  $('scale').value=String(m.v.scale);
  const radio=form.querySelector(`input[name="confusion"][value="${m.v.confusion?'yes':'no'}"]`);
  if(radio)radio.checked=true;
  $('measureDate').value=m.date; $('measureTime').value=m.time;
  showPage('vurdering');showNotice(`Måling fra ${prettyDate(m.date)} kl. ${m.time} er hentet inn i skjemaet. Endringer lagres ikke automatisk.`);
  updateScores();
}
function makeElement(tag,textValue,cls){const el=document.createElement(tag);if(textValue!==undefined)el.textContent=textValue;if(cls)el.className=cls;return el;}
// Sletting skjer med en gang, men kan angres en kort stund. Angre legger målingene tilbake i samme rekkefølge.
let undoTimer=0,undoItems=null;
function removeMeasurements(items){
  const removed=items.map(m=>({m,index:measurements.indexOf(m)})).filter(x=>x.index>=0).sort((a,b)=>a.index-b.index);
  if(!removed.length)return;
  for(const {m} of removed)measurements.splice(measurements.indexOf(m),1);
  persistMeasurements();undoItems=removed;renderHistory();
  const box=$('historyUndo'),n=removed.length;
  $('historyUndoText').textContent=n===1?'Målingen er slettet.':`${n} målinger er slettet.`;
  box.hidden=false;$('historyUndoButton').focus();
  clearTimeout(undoTimer);undoTimer=setTimeout(()=>{box.hidden=true;undoItems=null;},15000);
}
function undoRemove(){
  if(!undoItems)return;
  for(const {m,index} of undoItems)measurements.splice(Math.min(index,measurements.length),0,m);
  undoItems=null;clearTimeout(undoTimer);$('historyUndo').hidden=true;
  persistMeasurements();renderHistory();showNotice('');
}
function expiryText(){
  const at=Store?.expiresAt?.(measurements);
  if(!at)return 'Lagres bare på denne enheten i høyst 24 timer, og slettes når du logger ut. Dette er ikke en pasientjournal.';
  const d=new Date(at),today=new Date(),tomorrow=new Date();tomorrow.setDate(today.getDate()+1);
  const day=d.toDateString()===today.toDateString()?'i dag':d.toDateString()===tomorrow.toDateString()?'i morgen':prettyDate(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`);
  return `Den eldste målingen slettes automatisk ${day} kl. ${pad(d.getHours())}:${pad(d.getMinutes())}. Målingene lagres bare på denne enheten i høyst 24 timer og slettes når du logger ut. Dette er ikke en pasientjournal.`;
}
function renderHistory(){
  $('historyCounter').textContent=`${measurements.length} registrerte`;
  $('historyStorageNote').textContent=expiryText();
  $('emptyHistory').hidden=measurements.length>0;
  $('historyTableContainer').hidden=measurements.length===0;
  $('trendSection').hidden=measurements.length<2;
  $('historyRows').replaceChildren();
  for(const m of measurements) {
    const row=makeElement('tr');
    for(const value of [`${prettyDate(m.date)} kl. ${m.time}`,String(m.news.total),m.q?String(m.q.total):'—',String(m.v.rr),`${m.v.spo2} %`,`${m.v.sbp}`,`${m.v.hr}`,`${formatNumber(m.v.temp,1)} °C`]){
      row.append(makeElement('td',value));
    }
    const actions=makeElement('td');
    const load=makeElement('button','Åpne','btn-inline');load.type='button';load.setAttribute('aria-label',`Åpne måling ${m.date} kl. ${m.time}`);load.addEventListener('click',()=>applySnapshot(m));
    const remove=makeElement('button','Slett','btn-inline');remove.style.marginLeft='5px';remove.type='button';remove.setAttribute('aria-label',`Slett måling ${m.date} kl. ${m.time}`);remove.addEventListener('click',()=>removeMeasurements([m]));
    actions.append(load,remove);row.append(actions);$('historyRows').append(row);
  }
  if(measurements.length>=2) renderTrend();
}
function renderTrend(){
  const min=0,max=Math.max(10,...measurements.map(m=>m.news.total))+1;
  const width=760,height=180,padX=34,padY=17;
  const chart=document.createElementNS('http://www.w3.org/2000/svg','svg');
  chart.setAttribute('viewBox',`0 0 ${width} ${height}`);
  chart.setAttribute('role','img');chart.setAttribute('aria-label','NEWS2 tidsserie av lagrede målinger');
  const svgEl=(tag,atts)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(atts).forEach(([k,v])=>e.setAttribute(k,String(v)));return e;};
  for(let i=0;i<=4;i++){
    const y=height-padY-(height-2*padY)*i/4;
    chart.append(svgEl('line',{x1:padX,y1:y,x2:width-padX,y2:y,stroke:'#e1eaf1','stroke-width':1}));
    const text=svgEl('text',{x:4,y:y+4,fill:'#73869a','font-size':11});text.textContent=String(Math.round(max*i/4));chart.append(text);
  }
  const values=measurements.map((m,i)=>{
    const x=padX+(width-2*padX)*i/(measurements.length-1);
    const y=height-padY-(height-2*padY)*m.news.total/max;
    return {x,y,total:m.news.total};
  });
  chart.append(svgEl('polyline',{points:values.map(p=>`${p.x},${p.y}`).join(' '),fill:'none',stroke:'#ed5865','stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round'}));
  for(const v of values){const dot=svgEl('circle',{cx:v.x,cy:v.y,r:4.5,fill:v.total>=7?'#dc4654':'#0c9c91',stroke:'#fff','stroke-width':2});chart.append(dot);}
  $('trendChart').replaceChildren(chart);
  $('trendStart').textContent=`Første: ${prettyDate(measurements[0].date)} kl. ${measurements[0].time}`;
  $('trendEnd').textContent=`Siste: ${prettyDate(measurements.at(-1).date)} kl. ${measurements.at(-1).time}`;
  const first=measurements[0],last=measurements.at(-1);
  const entries=[['NEWS2',last.news.total-first.news.total,'poeng'],['Respirasjonsfrekvens',last.v.rr-first.v.rr,'/min'],['SpO₂',last.v.spo2-first.v.spo2,'%'],['Systolisk BT',last.v.sbp-first.v.sbp,'mmHg'],['Puls',last.v.hr-first.v.hr,'/min'],['Temperatur',last.v.temp-first.v.temp,'°C']];
  $('deltas').replaceChildren(...entries.map(([label,delta,unit])=>{
    const box=makeElement('div',undefined,'diff-box');
    box.append(makeElement('small',label),makeElement('strong',`${delta>0?'+':''}${formatNumber(delta,unit==='°C'?1:0)} ${unit}`),makeElement('em','Endring fra første til siste måling'));
    return box;
  }));
}
// Profile has an explicit opt-in for persistence; vitals and the ISBAR text never persist.
const PROFILE_KEY='kartlegg.sender.v03';
const PROFILE_IDS=['profileName','profileRole','profileWork','profileDepartment'];
let scriptFontSize=19;
function readProfile(){return {name:$('profileName').value.trim(),role:$('profileRole').value.trim(),work:$('profileWork').value.trim(),department:$('profileDepartment').value.trim()};}
function saveProfile(){
  const info=readProfile();
  try{
    if($('rememberProfile').checked) localStorage.setItem(PROFILE_KEY,JSON.stringify(info));
    else localStorage.removeItem(PROFILE_KEY);
    $('profileStatus').textContent=$('rememberProfile').checked?'Lagret. Nettleseren husker profilen.':'Lagret for denne fanen.';
  }catch(_){$('profileStatus').textContent='Lagret for denne fanen. Nettleseren tillater ikke å huske den.';}
  window.dispatchEvent(new Event('kartlegg:settings-changed'));
}
function loadProfile(){
  try{
    const stored=JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');
    if(stored&&typeof stored==='object') {
      for(const id of PROFILE_IDS){const key=id.replace('profile','').toLowerCase();if(typeof stored[key]==='string')$(id).value=stored[key].slice(0,120);}
      $('rememberProfile').checked=true;
    }
  }catch(_){}
}
function clearProfile(){
  for(const id of PROFILE_IDS)$(id).value='';
  $('rememberProfile').checked=false;
  try{localStorage.removeItem(PROFILE_KEY);}catch(_){}
  $('profileStatus').textContent='Profilen er slettet.';
  window.dispatchEvent(new Event('kartlegg:settings-changed'));
}
function buildIsbarText(){
  const p=readProfile(),v=readVitals(),stamp=getTimeData();
  const sender=p.name||'[ditt navn]';
  const role=p.role?p.role.toLowerCase():'[stilling]';
  const work=p.work||'[arbeidssted]';
  const dept=p.department?`, ${p.department}`:'';
  const situation=$('isbarSituation').value.trim()||'[forklar kort hvorfor du ringer]';
  const background=$('isbarBackground').value.trim()||'[oppgi relevant sykehistorie og tidligere funksjonsnivå]';
  const extra=$('isbarExtra').value.trim()||'[beskriv din kliniske vurdering og andre observasjoner]';
  const request=$('isbarRequest').value.trim()||'[si konkret hvilken hjelp eller vurdering du ønsker]';
  let vitals='Jeg har foreløpig ikke lagt inn alle nødvendige målingene i Kartlegg.';
  if(v&&stamp){
    const news=calculateNEWS2(v),q=calculateQSOFA(v);
    const consciousness={A:'er våken',V:'reagerer på tiltale',P:'reagerer på smerte',U:'reagerer ikke'}[v.conscious];
    vitals=`Jeg målte vitale parametere ${prettyDate(stamp.date)} klokken ${stamp.time}. Respirasjonsfrekvensen er ${v.rr} per minutt, oksygenmetningen er ${v.spo2} prosent ${v.oxygen?'med tilført oksygen':'på romluft'}, systolisk blodtrykk er ${v.sbp} millimeter kvikksølv, pulsen er ${v.hr} per minutt og temperaturen er ${formatNumber(v.temp,1)} grader. Pasienten ${consciousness}${v.confusion?', og det foreligger nyoppstått forvirring':', uten registrert nyoppstått forvirring'}.`;
    vitals+=` Den beregnede NEWS2-skåren er ${news.total}, med SpO₂-skala ${v.scale}.`;
    if(q) vitals+=` qSOFA er ${q.total} av 3, basert på oppgitt GCS på ${v.gcs} av 15.`;
    else vitals+=' qSOFA er ikke beregnet fordi separat GCS-måling mangler.';
  }
  // Written as a script to speak aloud – no "I, S, B, A, R" headings or list of cues.
  return `Hei, det er ${sender}. Jeg er ${role} ved ${work}${dept}. Jeg ringer angående en pasient som jeg identifiserer etter våre rutiner.\n\nGrunnen til at jeg tar kontakt, er at ${situation}.\n\nNår det gjelder bakgrunnen, så ${background}.\n\n${vitals}\n\nMin vurdering av situasjonen er at ${extra}.\n\nDet jeg ønsker hjelp til nå, er at ${request}. Hva anbefaler du at vi gjør videre, og når bør vi kontakte dere på nytt?\n\nJeg vil gjerne oppsummere planen så vi er sikre på at jeg har forstått den riktig.`;
}
function renderIsbar(){$('isbarOutput').textContent=buildIsbarText();}
function openIsbar(){
  renderIsbar();$('isbarCopyStatus').textContent='';
  const dialog=$('isbarDialog');
  if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
}
function closeIsbar(){const dialog=$('isbarDialog');if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}
async function copyIsbar(){
  const text=buildIsbarText();
  try{
    if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else {const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();if(!document.execCommand('copy'))throw new Error('copy failed');t.remove();}
    $('isbarCopyStatus').textContent='Manuset er kopiert. Les gjennom og korriger før eventuell bruk.';
  }catch(_){$('isbarCopyStatus').textContent='Kopiering ble ikke tillatt. Marker manusteksten og kopier manuelt.';}
}
const menu=$('sidebar'),backdrop=$('backdrop'),menuBtn=$('menuButton');
const mainContent=$('top');
function setMenuOpen(open){
  const mobile=window.matchMedia('(max-width: 770px)').matches;
  open=Boolean(open&&mobile);
  menu.classList.toggle('open',open);
  backdrop.classList.toggle('open',open);
  document.body.classList.toggle('mobile-menu-open',open);
  menuBtn.setAttribute('aria-expanded',String(open));
  menuBtn.setAttribute('aria-label',open?'Lukk meny':'Åpne meny');
  // An open drawer must be above page search and the fixed NEWS2 action dock.
  // Inert also prevents keyboard or assistive-technology access to obscured content.
  mainContent.inert=open;
  const dock=$('actionDock');if(dock)dock.inert=open;
  // Keep the menu button accessible while preventing focus on obscured header controls.
  document.querySelector('.header .brand').inert=open;
  document.querySelector('.header-right').inert=open;
  if(open) menu.querySelector('[data-page]')?.focus({preventScroll:true});
}
function closeMenu(){setMenuOpen(false);}
menuBtn.addEventListener('click',()=>setMenuOpen(!menu.classList.contains('open')));
backdrop.addEventListener('click',closeMenu);
menu.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>{
  const drawerWasOpen=menu.classList.contains('open');
  showPage(button.dataset.page);
  if(drawerWasOpen){
    const heading=$('page-'+button.dataset.page)?.querySelector('h1');
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}
  }
}));
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&menu.classList.contains('open')){e.preventDefault();closeMenu();menuBtn.focus({preventScroll:true});}
  if(e.key!=='Tab'||!menu.classList.contains('open'))return;
  const focusables=[menuBtn,...menu.querySelectorAll('button:not([disabled]),a[href]')];
  const first=focusables[0],last=focusables[focusables.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(e.shiftKey&&document.activeElement===focusables[1]){e.preventDefault();first.focus();}
  else if(!e.shiftKey&&document.activeElement===first){e.preventDefault();focusables[1].focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});
window.addEventListener('resize',()=>{if(window.innerWidth>770&&menu.classList.contains('open'))closeMenu();});
form.addEventListener('input',()=>{showNotice('');updateScores();});
form.addEventListener('change',()=>{showNotice('');updateScores();});
form.addEventListener('submit',e=>{e.preventDefault();if(!updateScores()){showNotice('Fyll ut alle obligatoriske målinger korrekt.');return;}showNotice('');$('resultater').scrollIntoView({behavior:'smooth',block:'start'});});
form.addEventListener('reset',()=>{setTimeout(()=>{showNotice('');clearResults();setTimeNow();},0);});
$('saveMeasurement').addEventListener('click',saveSnapshot);
$('newMeasurement').addEventListener('click',()=>{form.reset();setTimeout(()=>{setTimeNow();clearResults();showNotice('');showPage('vurdering');},0);});
$('openIsbar').addEventListener('click',openIsbar);
$('closeIsbar').addEventListener('click',closeIsbar);
$('doneIsbar').addEventListener('click',closeIsbar);
$('clearHistory').addEventListener('click',()=>removeMeasurements([...measurements]));
$('historyUndoButton').addEventListener('click',undoRemove);
$('copyIsbar').addEventListener('click',copyIsbar);
for(const id of ['isbarSituation','isbarBackground','isbarExtra','isbarRequest',...PROFILE_IDS])$(id).addEventListener('input',renderIsbar);
$('profileRole').addEventListener('change',renderIsbar);
$('saveProfile').addEventListener('click',saveProfile);
$('clearProfile').addEventListener('click',clearProfile);
for(const [id,step] of [['smallerScript',-2],['largerScript',2]])$(id).addEventListener('click',()=>{scriptFontSize=Math.max(15,Math.min(29,scriptFontSize+step));$('isbarOutput').style.fontSize=scriptFontSize+'px';});
window.addEventListener('hashchange',()=>showPage(location.hash.slice(1),false));
// «Målinger over tid»: load the signed-in user's device copy, drop anything older than 24 hours,
// and wipe the device copy when nobody is signed in (shared devices).
function withScores(item){return {...item,news:calculateNEWS2(item.v),q:calculateQSOFA(item.v)};}
function persistMeasurements(){if(Store&&Gate?.owner)Store.save(Gate.owner,measurements.map(({savedAt,date,time,v})=>({savedAt,date,time,v})));}
function loadMeasurements(){
  const owner=Gate?.owner;
  measurements.splice(0,measurements.length,...(Store&&owner?Store.load(owner).map(withScores):[]));
  measurements.sort((a,b)=>a.iso.localeCompare(b.iso));
  if(currentPage==='historikk')renderHistory();
}
Gate?.onChange(state=>{if(state==='guest')Store?.clearAll();loadMeasurements();});
setInterval(loadMeasurements,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadMeasurements();});
window.KartleggShowPage=showPage;
loadProfile();setTimeNow();clearResults();loadMeasurements();showPage(location.hash.slice(1)||'start',false);

// Explicit account adapter: only the four sender fields; never ISBAR or observations.
window.KartleggSenderProfile={read:readProfile,apply(info){for(const id of PROFILE_IDS){const key=id.replace('profile','').toLowerCase();$(id).value=typeof info?.[key]==='string'?info[key].slice(0,120):'';}saveProfile();renderIsbar();$('profileName').dispatchEvent(new Event('input',{bubbles:true}));}};
