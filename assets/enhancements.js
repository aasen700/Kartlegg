'use strict';
/* Kartlegg v0.5 – progressive enhancements; do not store observations. */
(function(){
const $=id=>document.getElementById(id);
// The header theme switch is now owned solely by v06.js.
 // Earlier versions registered a second click handler and wrote a redundant
 // localStorage key, making appearance transitions harder to reason about.
const oldUpdate=updateScores;
function partialQ(){const ids=['rr','sbp','gcs'];const vals=ids.map(x=>$(x).value.trim());if(vals.some(x=>!x))return null;const [rr,sbp,gcs]=vals.map(Number);return Number.isInteger(rr)&&rr>=1&&rr<=150&&Number.isInteger(sbp)&&sbp>=1&&sbp<=350&&Number.isInteger(gcs)&&gcs>=3&&gcs<=15?{rr,sbp,gcs}:null}
updateScores=function(){const ok=oldUpdate();if(!ok){const v=partialQ();if(v){const q=Scoring.qsofa(v);setCard('q',q.total>=2?'warning':q.total===0?'ok':'neutral',q.total,q.total>=2?'2 eller flere kriterier':'Under 2 kriterier','Lav qSOFA utelukker ikke sepsis.',`RF ≥22: ${q.parts.rr?'ja':'nei'} · BT ≤100: ${q.parts.sbp?'ja':'nei'} · GCS <15: ${q.parts.mentation?'ja':'nei'}`);$('scoreTime').textContent='qSOFA er beregnet; NEWS2 avventer';}}return ok};
const dialog=document.createElement('dialog');dialog.id='scoreDialog';dialog.setAttribute('aria-labelledby','scoreDetailTitle');dialog.innerHTML='<div class="dialog-head"><div class="section-symbol cyan">▥</div><div><h2 id="scoreDetailTitle">Delpoeng</h2><p>Kontroller målinger og beregning</p></div><button type="button" class="dialog-close" id="closeDetail" aria-label="Lukk">×</button></div><div class="dialog-body"><div id="scoreDetailContent"></div><p class="isbar-smallprint">Demoversjon med syntetiske data, ikke validert for klinisk bruk.</p></div>';document.body.append(dialog);$('closeDetail').onclick=()=>dialog.close();
function showDetails(which){
const v=readVitals(),q=partialQ();const isNews=which==='news';const available=isNews?!!v:!!q;
$('scoreDetailTitle').textContent=isNews?'Delpoeng i NEWS2':'Kriterier i qSOFA';
const mount=$('scoreDetailContent');mount.replaceChildren();
if(!available){mount.textContent=isNews?'Fyll inn alle nødvendige NEWS2-verdier først.':'Fyll inn RF, systolisk BT og separat GCS først.';dialog.showModal();return}
const r=isNews?Scoring.news2(v):Scoring.qsofa(q);
const labels=isNews?{rr:'Respirasjonsfrekvens',spo:'SpO₂',sbp:'Systolisk blodtrykk',hr:'Puls',temp:'Temperatur',consciousness:'Bevissthet / forvirring',oxygen:'Tilført oksygen'}:{rr:'RF ≥22',sbp:'Systolisk BT ≤100',mentation:'GCS <15'};
const values=isNews?{rr:v.rr+' /min',spo:v.spo2+' % (skala '+v.scale+')',sbp:v.sbp+' mmHg',hr:v.hr+' /min',temp:formatNumber(v.temp,1)+' °C',consciousness:v.conscious+(v.confusion?' / ny forvirring':''),oxygen:v.oxygen?'Ja':'Nei'}:{rr:q.rr+' /min',sbp:q.sbp+' mmHg',mentation:q.gcs+' /15'};
const table=document.createElement('table');table.className='breakdown-table';
table.innerHTML='<thead><tr><th>Parameter</th><th>Verdi</th><th>Poeng</th></tr></thead>';
const tbody=document.createElement('tbody');
for(const [key,points] of Object.entries(r.parts)){const tr=document.createElement('tr');for(const val of [labels[key],values[key],String(points)]){const td=document.createElement('td');td.textContent=val;tr.append(td)}tbody.append(tr)}
table.append(tbody);const foot=document.createElement('tfoot');const tr=document.createElement('tr');let label=document.createElement('th');label.colSpan=2;label.textContent='Totalskår';let sum=document.createElement('th');sum.textContent=r.total;tr.append(label,sum);foot.append(tr);table.append(foot);mount.append(table);dialog.showModal();
}
for(const [id,which] of [['newsCard','news'],['qCard','q']]){const btn=document.createElement('button');btn.type='button';btn.className='detail-button';btn.textContent='Se beregning og delpoeng';btn.addEventListener('click',()=>showDetails(which));$(id).append(btn)}
const selectLabel=document.createElement('label');selectLabel.className='metric-select';selectLabel.textContent='Graf for';
const select=document.createElement('select');select.id='chartMetric';
const metrics={news:['NEWS2','poeng',m=>m.news.total],q:['qSOFA','poeng',m=>m.q?.total??null],rr:['Respirasjonsfrekvens','/min',m=>m.v.rr],spo2:['SpO₂','%',m=>m.v.spo2],sbp:['Systolisk BT','mmHg',m=>m.v.sbp],hr:['Puls','/min',m=>m.v.hr],temp:['Temperatur','°C',m=>m.v.temp]};
for(const [key,v] of Object.entries(metrics)){const option=document.createElement('option');option.value=key;option.textContent=v[0];select.append(option)}
selectLabel.append(select);($('trendSection').querySelector('.trend-wrap')||$('trendSection').querySelector('.section-header')).prepend(selectLabel);
function svgEl(tag,props,content){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,val] of Object.entries(props||{}))el.setAttribute(key,String(val));if(content!==undefined)el.textContent=content;return el}
renderTrend=function(){
const [label,unit,extract]=metrics[select.value]||metrics.news;
// Øvingsforløp: x-aksen er tid siden start (minutter), ikke dato og klokkeslett.
const data=measurements.map((m,i)=>({value:extract(m),label:measurementLabel(i),t:elapsedMinutes(i)})).filter(x=>x.value!==null&&Number.isFinite(x.value)&&Number.isFinite(x.t));
$('trendChart').replaceChildren();if(data.length<2){$('trendChart').textContent='Minst to målinger med denne parameteren kreves.';renderComparison();return}
// Bredden følger beholderen, så tallene er lesbare også på mobil.
const W=Math.round(Math.max(320,Math.min(760,$('trendChart').clientWidth||760))),H=W<500?230:215,L=W<500?40:60,R=W<500?18:28,T=23,B=43;
const times=data.map(x=>x.t),values=data.map(x=>x.value),tmin=Math.min(...times),tmax=Math.max(...times),vmin=Math.min(...values),vmax=Math.max(...values);
let lo=(select.value==='news'||select.value==='q')?0:Math.floor(vmin-Math.max(1,(vmax-vmin)*.3));let hi=Math.max(lo+1,Math.ceil(vmax+Math.max(1,(vmax-vmin)*.3)));
if(select.value==='spo2'){lo=Math.max(0,lo);hi=Math.min(100,hi)}
const X=t=>L+(t-tmin)/(tmax-tmin||1)*(W-L-R),Y=v=>H-B-(v-lo)/(hi-lo)*(H-T-B);
const svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':label+' gjennom øvingsforløpet: '+data.map(d=>d.label+' '+d.value).join(', ')});
for(let i=0;i<=4;i++){const val=lo+(hi-lo)*i/4,y=Y(val);svg.append(svgEl('line',{x1:L,x2:W-R,y1:y,y2:y,stroke:'currentColor','stroke-opacity':'.17','stroke-dasharray':'4 5'}),svgEl('text',{x:3,y:y+3,fill:'currentColor','font-size':12},val.toLocaleString('nb-NO',{maximumFractionDigits:1})))}
svg.append(svgEl('polyline',{points:data.map(d=>X(d.t)+','+Y(d.value)).join(' '),fill:'none',stroke:'#ed6470','stroke-width':3,'stroke-linejoin':'round'}));
for(const d of data){const pt=svgEl('circle',{cx:X(d.t),cy:Y(d.value),r:5,fill:'#16a394',stroke:'var(--paper)','stroke-width':2});pt.append(svgEl('title',{},d.label+': '+d.value+' '+unit));svg.append(pt)}
for(const [d,anchor] of [[data[0],'start'],[data.at(-1),'end']])svg.append(svgEl('text',{x:X(d.t),y:H-12,'text-anchor':anchor,fill:'currentColor','font-size':12},d.t===0?'Start':'Etter '+formatDuration(d.t)));
$('trendChart').append(svg);$('trendStart').textContent=label+' ('+unit+')';$('trendEnd').textContent=data.length+' målinger';
renderComparison();
};select.addEventListener('change',()=>{if(measurements.length>=2)renderTrend()});
let trendWidth=0;window.addEventListener('resize',()=>{const w=$('trendChart').clientWidth;if(!$('trendSection').hidden&&measurements.length>=2&&Math.abs(w-trendWidth)>40){trendWidth=w;renderTrend()}});
const observ=document.createElement('label');observ.textContent='Andre observasjoner';const textarea=document.createElement('textarea');textarea.id='isbarObservations';textarea.rows=2;textarea.maxLength=600;textarea.placeholder='Skriv observasjoner uten pasientidentitet';observ.append(textarea);document.querySelector('.isbar-inputs').append(observ);
$('isbarModalTitle').textContent='ISBAR-manus';
document.querySelector('.isbar-preamble').textContent='Les manuset høyt. Fyll muntlig inn tekst i [klammer]. Ikke skriv inn pasientnavn eller fødselsdato i demoversjonen.';
const phrase=(id,fallback)=>$(id).value.trim().replace(/[.!?]+$/,'')||fallback;
buildIsbarText=function(){
const p=readProfile(),v=readVitals(),name=p.name||'[ditt navn]',work=p.work||'[arbeidssted]',role=p.role?', '+p.role.toLowerCase():'',dept=p.department?', '+p.department:'';
let vital='[målingene mangler]',score='[ikke beregnet]';
if(v){vital=`respirasjonsfrekvens ${v.rr} per minutt, oksygenmetning ${v.spo2} prosent ${v.oxygen?'med oksygentilførsel':'på romluft'}, systolisk blodtrykk ${v.sbp}, puls ${v.hr} og temperatur ${formatNumber(v.temp,1)} grader`;score=String(Scoring.news2(v).total)}
return `Hei, det er ${name}${role} fra ${work}${dept} som ringer angående [pasientens navn og fødselsdato].

Jeg tar kontakt fordi ${phrase('isbarSituation','[årsak til kontakt]')}.

Jeg har nettopp målt vitale parametere klokken [klokkeslett]. De er ${vital}.

Jeg har også observert ${phrase('isbarObservations','[andre observasjoner]')}.

Relevant bakgrunn er ${phrase('isbarBackground','[relevant sykehistorie]')}.

Jeg beregnet NEWS2-skåren til ${score}.

Jeg vurderer situasjonen som ${phrase('isbarExtra','[klinisk vurdering]')}, og ønsker at du vurderer ${phrase('isbarRequest','[ønsket hjelp]')}.

Hva tenker du om videre tiltak?`};
renderIsbar=function(){$('isbarOutput').textContent=buildIsbarText()};textarea.addEventListener('input',renderIsbar);
updateScores();
})();
