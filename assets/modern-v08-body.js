/* Kartlegg v0.8 BMI and Mosteller BSA calculator; standalone, memory-only. */
'use strict';
(()=>{
const $=id=>document.getElementById(id),grid=document.querySelector('#page-verktoy .toolgrid'),V=window.KartleggV08;
if(!grid||!V)return;
const card=document.createElement('article');card.className='toolbox v08-bmi-card';
card.innerHTML='<div class="v08-tool-icon" aria-hidden="true">▤</div><h3>BMI og BSA</h3><span class="tool-tag">Selvstendig kalkulator</span><p>Kroppsmasseindeks og kroppsoverflate basert på høyde og vekt.</p>';
const launch=document.createElement('button');launch.className='btn btn-primary v08-body-launch';launch.type='button';launch.textContent='Åpne BMI / BSA →';card.append(launch);
const before=[...grid.querySelectorAll('.toolbox')].find(x=>/NEWS2/.test(x.querySelector('h3')?.textContent||''));
if(before)grid.insertBefore(card,before);else grid.append(card);
const quick=document.querySelector('#quickTools .quick-tool-buttons');
if(quick){const btn=document.createElement('button');btn.type='button';btn.className='quick-tool-link';btn.id='quickBodyCalc';btn.textContent='▤ BMI/BSA';btn.addEventListener('click',()=>launch.click());quick.append(btn)}
const chip=document.querySelector('#page-verktoy .intro .chip');if(chip)chip.textContent='6 tilgjengelige verktøy';
const search=$('toolSearch');
if(search){
 // Override the old v0.7.1 five-tool filter with the complete six-tool registry.
 search.addEventListener('input',e=>{
  e.stopImmediatePropagation();
  const q=search.value.trim().toLocaleLowerCase('nb-NO');
  const cards=[...grid.querySelectorAll('.toolbox')];let matches=0;
  for(const el of cards){
   const title=el.querySelector('h3')?.textContent||'';
   const custom=el===card?'kroppsmasseindeks kroppsoverflate body surface area vekt høyde bmi bsa':title.includes('NEWS2')?'respirasjon puls oksygen temperatur blodtrykk':title.includes('4AT')?'delirium kognitiv forvirring':title.includes('NRS')?'smerte smerteskala':'';
   const match=!q||(el.textContent+' '+custom).toLocaleLowerCase('nb-NO').includes(q);
   el.hidden=!match;if(match)matches++;
  }
  const count=$('toolSearchCount');if(count)count.textContent=matches+' av '+cards.length+' verktøy';
  const empty=$('toolNoMatches');if(empty)empty.hidden=matches!==0;
  // Category selector in v0.99 applies its own filter after the complete search index.
  search.dispatchEvent(new CustomEvent('kartlegg:library-filtered',{detail:{query:q,matches}}));
 },true);
 search.dispatchEvent(new Event('input',{bubbles:true}));
}
const dialog=document.createElement('dialog');dialog.id='bodyCalcDialog';dialog.className='v08-dialog v08-body-dialog';dialog.setAttribute('aria-labelledby','bodyCalcTitle');
dialog.innerHTML="<div class=\"v08-dialog-head\"><div><p class=\"eyebrow\">Kroppsmål</p><h2 id=\"bodyCalcTitle\">BMI og kroppsoverflate (BSA)</h2></div><button type=\"button\" class=\"dialog-close\" id=\"bodyCalcClose\" aria-label=\"Lukk BMI og BSA\">×</button></div><div class=\"v08-dialog-content\">\n<p class=\"v08-explainer\">Regn ut BMI og BSA fra høyde og vekt. Formlene gir ikke automatisk råd om legemiddeldosering.</p>\n<form id=\"bodyCalcForm\" autocomplete=\"off\">\n <div class=\"v08-body-fields\">\n  <div class=\"v08-body-field\"><label for=\"bodyHeight\">Høyde</label><div class=\"v08-value-units\"><input id=\"bodyHeight\" type=\"number\" inputmode=\"decimal\" min=\"0.01\" step=\"any\" required placeholder=\"For eksempel 180\"><select id=\"bodyHeightUnit\" aria-label=\"Høydeenhet\"><option value=\"cm\">cm</option><option value=\"in\">tommer</option></select></div></div>\n  <div class=\"v08-body-field\"><label for=\"bodyWeight\">Vekt</label><div class=\"v08-value-units\"><input id=\"bodyWeight\" type=\"number\" inputmode=\"decimal\" min=\"0.01\" step=\"any\" required placeholder=\"For eksempel 80\"><select id=\"bodyWeightUnit\" aria-label=\"Vektenhet\"><option value=\"kg\">kg</option><option value=\"lb\">pund</option></select></div></div>\n </div>\n <div class=\"v08-body-actions\"><button type=\"submit\" class=\"btn btn-primary\">Beregn BMI og BSA</button><button type=\"reset\" class=\"btn btn-secondary\">Nullstill</button></div>\n</form>\n<div class=\"v08-body-results\" id=\"bodyCalcResult\" role=\"status\" aria-live=\"polite\" hidden></div>\n<div class=\"v08-formula-guide\"><strong>Beregningsgrunnlag</strong><p>BMI = vekt (kg) / høyde² (m)</p><p>BSA (Mosteller) = √[høyde (cm) × vekt (kg) / 3600]</p><p>Kalkulatoren er kun laget for matematisk beregning med voksne måleområder. Den gir ingen legemiddeldose eller klinisk diagnose.</p></div>\n</div>";document.body.append(dialog);
const form=$('bodyCalcForm'),result=$('bodyCalcResult');
function show(){
 form.reset();result.replaceChildren();result.hidden=true;dialog.showModal();$('bodyHeight').focus();
}
launch.addEventListener('click',show);
$('bodyCalcClose').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
form.addEventListener('reset',()=>{result.replaceChildren();result.hidden=true});
for(const input of form.querySelectorAll('input,select'))input.addEventListener('input',()=>{result.hidden=true;result.replaceChildren()});
form.addEventListener('submit',e=>{
 e.preventDefault();if(!form.reportValidity())return;
 result.replaceChildren();result.hidden=false;
 let data;
 try{data=V.bmiBsa({
  height:Number($('bodyHeight').value),weight:Number($('bodyWeight').value),
  heightUnit:$('bodyHeightUnit').value,weightUnit:$('bodyWeightUnit').value
 })}catch(err){const msg=document.createElement('p');msg.textContent=err.message;msg.className='v08-body-error';result.append(msg);return}
 const fmt=(n,dp)=>n.toLocaleString('nb-NO',{minimumFractionDigits:dp,maximumFractionDigits:dp});
 const cards=document.createElement('div');cards.className='v08-body-result-grid';
 for(const [label,value,unit] of [['BMI',fmt(data.bmi,1),'kg/m²'],['BSA (Mosteller)',fmt(data.bsa,2),'m²']]){
  const box=document.createElement('div');box.className='v08-body-result-card';
  const head=document.createElement('span');head.textContent=label;
  const strong=document.createElement('strong');strong.textContent=value;
  const small=document.createElement('small');small.textContent=unit;
  box.append(head,strong,small);cards.append(box);
 }
 result.append(cards);
 const hint=document.createElement('p');hint.textContent='Beregnet fra '+fmt(data.cm,1)+' cm og '+fmt(data.kg,1)+' kg. Bruk resultatene i riktig faglig sammenheng – ingen automatisk doseringsanbefaling.';
 result.append(hint);
});
})();
