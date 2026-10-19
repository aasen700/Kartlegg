/* Kartlegg v0.9.1 — TIMES: observational guide, hypothetical wound dimensions
 * and a user-calibrated on-screen ruler (not a clinical measuring instrument).
 */
'use strict';
(()=>{
const grid=document.querySelector('#page-verktoy .toolgrid'),calc=window.KartleggWound;
if(!grid||!calc)return;
const H=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const topics=[
 ['T','Tissue – vev',['Hvilke vevstyper ses i sårbunnen (granulasjon, epitel, fibrin, nekrose)?','Finnes flere typer vev samtidig?','Er det hulrom eller underminering?'],'Vurder også sårårsak, sirkulasjon og allmenntilstand.'],
 ['I','Infeksjon / inflammasjon',['Er det økende rødhet, varme, smerte, hevelse eller væske?','Er det ny lukt, endret sekresjon eller forsinket tilheling?','Finnes allmennsymptomer eller akutt forverring?'],'Inflammasjon er ikke det samme som infeksjon. Funnene må ses i sammenheng.'],
 ['M','Moisture – sårvæske',['Vurder mengde, farge, lukt og konsistens.','Hvor gjennomtrukket er bandasjen?','Er sårbunn for tørr eller omkringliggende hud oppbløtt?'],'Balansen mellom fuktighet i sårbunn og beskyttelse av omkringliggende hud er viktig.'],
 ['E','Edge – sårkanter',['Er sårkantene i tilheling eller stagnerte?','Finnes kallus, rullede kanter, tørrhet eller oppbløtthet?','Er det underminerte sårkanter?'],'Sårkanter vurderes sammen med sårårsak og behandling.'],
 ['S','Surrounding skin – huden omkring',['Observer tørrhet, rødhet, ødem og macerasjon.','Se etter eksem, hudavskalling og pigmentforandringer.','Vurder påvirkning fra sårvæske, trykk og bandasje.'],'Omkringliggende hud er sentral i sårvurderingen.']
];
const card=H('article','toolbox hc-tool-card times-v091-card');card.dataset.homecareCard='times';
const icon=H('div','hc-card-icon','▦');icon.setAttribute('aria-hidden','true');
const label=H('h3','','TIMES – sårvurdering'),tag=H('span','tool-tag','Sår');
const p=H('p','','Vurder vev, infeksjon, sårvæske, sårkanter og hud. Inkluderer sårmål og kalibrerbar skjermlinjal.');
const launch=H('button','btn btn-primary hc-launch','Åpne TIMES →');launch.id='launchTIMES';launch.type='button';
card.append(icon,label,tag,p,launch);grid.insertBefore(card,grid.querySelector('.toolbox'));
const dialog=H('dialog','v08-dialog hc-dialog times-v091-dialog');dialog.id='timesDialog';dialog.setAttribute('aria-labelledby','timesTitle');document.body.append(dialog);
function url(href,text){const a=H('a','hc-source',text);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a}
function open(){
 dialog.replaceChildren();
 const header=H('div','v08-dialog-head'),heading=H('div');
 heading.append(H('p','eyebrow','TIMES · sårvurdering · fiktive data'));
 const title=H('h2','','TIMES – sårvurdering');title.id='timesTitle';heading.append(title);
 const close=H('button','dialog-close','×');close.type='button';close.setAttribute('aria-label','Lukk TIMES');close.addEventListener('click',()=>dialog.close());
 header.append(heading,close);
 const body=H('div','v08-dialog-content times-v091-content');
 body.append(H('p','hc-hint','TIMES er et rammeverk for strukturert observasjon, ikke en erstatning for sårdiagnose eller helhetlig klinisk vurdering.'));
 const tabs=H('div','times-v091-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','TIMES-vurderingsområder');
 const panel=H('div','times-v091-panel');panel.id='timesPanel';panel.setAttribute('role','tabpanel');
 const buttons=[];
 function show(i){
  const t=topics[i];panel.replaceChildren();panel.append(H('h3','',t[1]));
  const ul=H('ul');for(const x of t[2])ul.append(H('li','',x));panel.append(ul,H('p','hc-hint',t[3]));
  panel.setAttribute('aria-labelledby','timesTab'+t[0]);
  buttons.forEach((b,k)=>{b.setAttribute('aria-selected',String(i===k));b.tabIndex=i===k?0:-1});
 }
 topics.forEach((t,i)=>{
  const b=H('button','times-v091-tab',t[0]);b.type='button';b.id='timesTab'+t[0];b.setAttribute('role','tab');b.setAttribute('aria-controls','timesPanel');
  b.setAttribute('aria-label',t[1]);
  b.addEventListener('click',()=>show(i));
  b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const k=(i+(e.key==='ArrowRight'?1:4))%5;show(k);buttons[k].focus()});
  buttons.push(b);tabs.append(b);
 });
 body.append(tabs,panel);show(0);
 const dim=H('section','times-v091-measures');dim.append(H('h3','','Sårmål – fiktivt eksempel'));
 dim.append(H('p','hc-hint','Oppgi lengde og bredde målt med egnet fysisk sårmåler. Lengde × bredde er et omkransende rektangel, ikke presist areal for uregelmessige sår.'));
 const form=H('form','times-v091-form');form.noValidate=true;form.autocomplete='off';form.id='timesMeasureForm';
 const dimensionFields=H('div','times-v091-dimensions');
 for(const [id,title] of [['timesLength','Lengde (mm)'],['timesWidth','Bredde (mm)'],['timesDepth','Dybde (mm, valgfri)']]){
  const field=H('label','hc-field');field.append(H('span','',title));
  const inp=H('input');inp.type='number';inp.step='any';inp.min='0';inp.max='1000';inp.inputMode='decimal';inp.id=id;field.append(inp);dimensionFields.append(field);
 }
 const calculate=H('button','btn btn-primary','Beregn rektangeloverslag');calculate.type='submit';
 const reset=H('button','btn btn-secondary','Nullstill');reset.type='reset';
 form.append(dimensionFields,calculate,reset);
 const output=H('div','hc-output');output.hidden=true;output.id='timesMeasurementResult';output.setAttribute('role','status');
 const erase=()=>{output.hidden=true;output.replaceChildren()};
 form.addEventListener('reset',erase);form.addEventListener('input',erase);
 form.addEventListener('submit',e=>{
  e.preventDefault();erase();output.hidden=false;
  const read=id=>{const x=document.getElementById(id).value;return x.trim()?Number(x):null};
  try{
   const data=calc.estimate({lengthMm:read('timesLength'),widthMm:read('timesWidth'),depthMm:read('timesDepth')});
   output.append(H('strong','hc-big-result',data.rectangleCm2.toLocaleString('nb-NO',{maximumFractionDigits:2})+' cm²'));
   output.append(H('p','hc-hint','Omkransende rektangel – ikke faktisk sårareal. Ingen klinisk konklusjon følger av beregningen.'));
  }catch(error){output.append(H('p','hc-alert',error.message))}
 });
 dim.append(form,output);body.append(dim);
 const ruler=H('section','times-v091-ruler');
 ruler.append(H('h3','','Skjermlinjal – kalibrering'));
 ruler.append(H('p','hc-hint','Hold et standard bankkort STÅENDE (portrettstilling). Kortets lange side er da den LODDRETTE høyden, 85,60 mm. Juster den blå kortfiguren til samme synlige HØYDE som kortet. Ved behov kan du rulle vannrett for å se hele figuren. Kalibrer på nytt ved zoom eller skjermbytte.'));
 const control=H('label','hc-field');control.append(H('span','','Bankkortets høyde på skjermen'));
 const slider=H('input');slider.type='range';slider.id='timesCardScale';slider.min='80';slider.max='620';slider.step='1';slider.value='270';slider.setAttribute('aria-label','Juster stående bankkorts høyde (85,60 mm)');
 const readout=H('output','times-v091-readout','270 piksler');readout.id='timesPixelReadout';
 control.append(slider,readout);
 const reference=H('div','times-v091-reference');reference.id='timesReference';reference.append(H('span','','BANKKORT STÅENDE · 85,60 mm ↕'));
 const svgbox=H('div','times-v091-svgbox');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='timesRulerSvg';svg.setAttribute('role','img');svg.setAttribute('aria-label','Skjermlinjal 0–8 cm etter manuell kalibrering');
 svgbox.append(svg);
 const warning=H('p','times-v091-warning','Hold kortet stående og sammenlign 85,60 mm med figurens LODDRETTE høyde. Ikke bruk skjermen mot et åpent sår. Bruk fysisk, hygienisk egnet sårmåler; digital linjal kan være unøyaktig.');
 const cardWrap=H('div','times-v099-reference-scroll');cardWrap.append(reference);
 ruler.append(control,cardWrap,svgbox,warning);body.append(ruler);
 function repaint(){
  const pixels=Number(slider.value),units=calc.ruler({referencePixels:pixels});
  reference.style.height=units.portraitHeightPixels+'px';reference.style.width=units.portraitWidthPixels+'px';readout.textContent=pixels+' piksler i kortets loddrette høyde';svg.replaceChildren();
  const pad=14, length=units.pxPerCm*8,ns='http://www.w3.org/2000/svg';
  svg.setAttribute('width',String(pad*2+length));svg.setAttribute('height','66');
  svg.setAttribute('viewBox','0 0 '+(pad*2+length)+' 66');
  function line(x1,y1,x2,y2){
   const a=document.createElementNS(ns,'line');
   a.setAttribute('x1',String(x1));a.setAttribute('x2',String(x2));a.setAttribute('y1',String(y1));a.setAttribute('y2',String(y2));
   a.setAttribute('stroke','currentColor');a.setAttribute('stroke-width','1.5');svg.append(a);
  }
  line(pad,18,pad+length,18);
  for(let mm=0;mm<=80;mm+=5){
   const x=pad+units.pxPerMm*mm;
   line(x,18,x,mm%10===0?40:30);
   if(mm%10===0){
    const t=document.createElementNS(ns,'text');t.setAttribute('x',String(x));t.setAttribute('y','54');
    t.setAttribute('text-anchor','middle');t.setAttribute('font-size','11');t.setAttribute('fill','currentColor');
    t.textContent=String(mm/10);svg.append(t);
   }
  }
 }
 slider.addEventListener('input',repaint);repaint();
 const sources=H('div','times-v091-sources');sources.append(url('https://sykepleien.no/forskning/2019/02/bruk-verktoyet-times-til-vurdere-sar-strukturert','Fagkilde: Sykepleien – TIMES'));
 sources.append(document.createTextNode(' · '));
 sources.append(url('https://sykepleien.no/sarverktoy','Sykepleiens sårverktøy'));
 body.append(sources);dialog.append(header,body);dialog.showModal();
 }
 launch.addEventListener('click',open);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>{if(!dialog.open)dialog.replaceChildren()});
 window.KartleggTIMES={open};
})();