/* Kartlegg v0.8 modern clinical layout and result refinements. No storage. */
'use strict';
(()=>{
const $=id=>document.getElementById(id), h=(tag,cls,txt)=>{
 const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;
};
const body=document.body;
body.classList.add('modern-v08');
const original=$('vitalsForm')?.querySelector('.fields');
if(original){
 const configs=[
  {title:'Respirasjon og oksygenering',note:'Luftveier, metning og oksygentilførsel',ids:['rr','spo2','oxygen','scale'],index:'01'},
  {title:'Sirkulasjon',note:'Blodtrykk og hjertefrekvens',ids:['sbp','hr'],index:'02'},
  {title:'Temperatur',note:'Kroppstemperatur',ids:['temp'],index:'03'},
  {title:'Bevissthet',note:'AVPU, nyoppstått forvirring og eventuelt GCS',ids:['conscious','gcs','confusion-label'],index:'04'}
 ];
 const nodes=new Map();
 for(const conf of configs)for(const id of conf.ids){
  const field=$(id)?.closest('.field');if(field)nodes.set(id,field);
 }
 original.replaceChildren();
 for(const config of configs){
  const group=h('section','v08-field-group');group.setAttribute('aria-label',config.title);
  const header=h('div','v08-field-group-head');
  header.append(h('span','v08-group-index',config.index));
  const groupText=h('div','v08-group-title');groupText.append(h('h3','',config.title),h('p','',config.note));header.append(groupText);
  const grid=h('div','v08-field-grid');
  config.ids.forEach(id=>{const field=nodes.get(id);if(field)grid.append(field)});
  group.append(header,grid);original.append(group);
 }
}
// Consistent monochrome field glyphs. Decorative only; labels remain accessible.
const paths={
 rr:'<path d="M12 12V3"/><path d="M12 7c-2-1-3-2-4-3"/><path d="M10 12c-2-3-3-5-5-5S2 12 2 16c0 3 2 5 5 5s4-3 4-5v-4z"/><path d="M14 12c2-3 3-5 5-5s3 5 3 9c0 3-2 5-5 5s-4-3-4-5v-4z"/>',
 spo2:'<path d="M12 3s-7 7-7 12a7 7 0 0 0 14 0c0-5-7-12-7-12z"/>',
 sbp:'<path d="M3 12h4l3-6 4 12 3-6h4"/>',
 hr:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
 temp:'<path d="M14 14.7V5a3 3 0 0 0-6 0v9.7a5 5 0 1 0 6 0z"/><path d="M11 9v8"/>',
 conscious:'<circle cx="12" cy="12" r="9"/><path d="M8 9c3-3 5 3 8 0M8 15c3 3 5-3 8 0"/>',
 gcs:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 oxygen:'<path d="M3 8h11c3 0 4-5 0-5-2 0-3 2-2 3M3 12h16M3 16h12c4 0 5 5 1 5-2 0-3-2-2-3"/>',
 scale:'<path d="M4 5h3M10 5h10M4 12h3M10 12h10M4 19h3M10 19h10"/>'
};
const labelIds=[...Object.keys(paths)];
for(const id of labelIds){
 const icon=$(id)?.closest('.field')?.querySelector('.field-icon');
 if(!icon)continue;
 icon.textContent='';icon.innerHTML='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[id]+'</svg>';
}
const cond=$('confusion-label')?.closest('.field')?.querySelector('.field-icon');
if(cond){cond.textContent='';cond.innerHTML='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 4a8 8 0 1 0 8 8"/><path d="M12 8v4l3 2"/></svg>'}
const notes=document.querySelector('#resultater details.details');
if(notes){
 const summary=notes.querySelector('summary');
 if(summary)summary.textContent='Hvorfor kan ikke alle skårer beregnes fra vitale målinger?';
 const li=notes.querySelector('ul');if(li) {
  li.replaceChildren();
  for(const msg of ['GCS og 4AT finnes som separate kalkulatorer i verktøybiblioteket.', 'GCS beregnes kun fra egne vurderinger av E, V og M, ikke ved å gjette fra AVPU.', '4AT krever egne kliniske vurderinger. NRS er pasientrapportert smerteintensitet.'])li.append(h('li','',msg));
 }
}
// Clinical risk palette is deliberately independent of user's theme accent.
const partNames=[['rr','Respirasjon'],['spo','SpO₂'],['sbp','Blodtrykk'],['hr','Puls'],['temp','Temperatur'],['consciousness','Bevissthet'],['oxygen','Tilført O₂']];
function visualRow(name,value,max,clinical=false){
 const cell=h('div','v08-metric');
 cell.append(h('span','v08-metric-label',name));
 const top=h('div','v08-metric-value',String(value));cell.append(top);
 const track=h('div','v08-metric-track');
 const fill=h('div','v08-metric-fill');
 fill.style.width=(typeof value==='number'&&Number.isFinite(value)&&max?Math.max(0,Math.min(100,100*value/max)):0)+'%';
 if(clinical)fill.dataset.points=String(value);
 track.append(fill);cell.append(track);return cell;
}
const newsViz=h('div','v08-scoring-details');newsViz.id='v08NewsViz';
const qViz=h('div','v08-scoring-details');qViz.id='v08QViz';
$('newsCard')?.append(newsViz);$('qCard')?.append(qViz);
function refreshResults(){
 const v=readVitals();newsViz.replaceChildren();qViz.replaceChildren();
 if(!v){newsViz.hidden=qViz.hidden=true;return}
 const n=Scoring.news2(v),q=Scoring.qsofa(v);
 newsViz.append(h('div','v08-viz-heading','Poeng per parameter'));
 const wrap=h('div','v08-metric-grid');for(const [key,name] of partNames)wrap.append(visualRow(name,n.parts[key],3,true));
 newsViz.append(wrap);newsViz.hidden=false;
 if(q){
  qViz.append(h('div','v08-viz-heading','Kriterier (0 eller 1 poeng)'));
  const values=h('div','v08-metric-grid v08-three');
  for(const [key,name] of [['rr','RF ≥22'],['sbp','BT ≤100'],['mentation','GCS <15']])values.append(visualRow(name,q.parts[key],1,true));
  qViz.append(values);qViz.hidden=false;
 }else qViz.hidden=true;
}
if(typeof updateScores==='function'){
 const oldUpdate=updateScores;
 updateScores=function(...args){const result=oldUpdate(...args);refreshResults();return result};
}
$('vitalsForm')?.addEventListener('reset',()=>{newsViz.hidden=true;qViz.hidden=true;});
const toolForm=$('clinicalToolForm'),toolResult=$('clinicalToolResult');
toolForm?.addEventListener('submit',()=>{
 if(toolResult?.hidden||!toolResult?.querySelector('.tool-result-heading'))return;
 const headline=$('clinicalToolTitle')?.textContent||'';
 const existing=toolResult.querySelector('.v08-tool-visual');if(existing)existing.remove();
 const viz=h('div','v08-tool-visual');
 if(headline.startsWith('GCS')){
  const values=[['Øyeåpning (E)',$('toolEyes')?.value,4],['Verbal (V)',$('toolVerbal')?.value,5],['Motorikk (M)',$('toolMotor')?.value,6]];
  for(const [name,val,max] of values)viz.append(visualRow(name,val==='NT'?'NT':Number(val),max));
 }else if(headline.startsWith('4AT')){
  for(const [name,id,max] of [['Årvåkenhet','toolAlert',4],['AMT4','toolOrientation',2],['Oppmerksomhet','toolAttention',2],['Akutt endring','toolAcute',4]])
   viz.append(visualRow(name,Number($(id)?.value),max));
 }else if(headline.startsWith('NRS')){
  const n=Number($('toolNRS')?.value);
  viz.append(visualRow('Oppgitt smerteintensitet',n,10));
 }
 if(viz.childElementCount)toolResult.append(viz);
});
// Preserve existing navigation, scoring and clinically meaningful alert text.
})();
