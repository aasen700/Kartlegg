/* Ankel–arm-indeks UI. Measurements remain in the open dialog only. */
'use strict';
(()=>{
 const grid=document.querySelector('#page-verktoy .toolgrid'),engine=window.KartleggABI;
 if(!grid||!engine)return;
 const h=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el};
 const card=h('article','toolbox hc-tool-card abi12-card');card.dataset.homecareCard='abi';
 const icon=h('div','hc-card-icon','↔');icon.setAttribute('aria-hidden','true');
 const title=h('h3','','Ankel–arm-indeks');
 const tag=h('span','tool-tag','Sirkulasjon og sår');
 const description=h('p','','Beregn indeks for hvert bein fra dopplermålte systoliske trykk i begge armer og fotarterier.');
 const launch=h('button','btn btn-primary hc-launch','Åpne ankel–arm-indeks →');launch.type='button';launch.id='launchAbi';
 card.append(icon,title,tag,description,launch);grid.append(card);

 const dialog=h('dialog','v08-dialog hc-dialog abi12-dialog');dialog.id='abiDialog';dialog.setAttribute('aria-labelledby','abiTitle');document.body.append(dialog);
 const close=()=>{if(dialog.open)dialog.close();dialog.replaceChildren()};
 const field=(id,label,group)=>{
  const wrap=h('label','hc-field abi12-field');wrap.dataset.group=group;wrap.append(h('span','',label));
  const control=h('span','abi12-input-wrap'),input=h('input');input.id=id;input.type='number';input.inputMode='decimal';input.min='20';input.max='300';input.step='1';input.required=true;input.autocomplete='off';
  control.append(input,h('span','abi12-unit','mmHg'));wrap.append(control);return wrap;
 };
 const source=(href,label)=>{const a=h('a','hc-source',label);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a};
 function resultCard(side,data){
  const item=h('article','abi12-result is-'+data.key);item.append(h('span','abi12-side',side),h('strong','abi12-value',data.value.toFixed(2).replace('.',',')),h('b','',data.label));
  item.append(h('p','',data.detail),h('small','','Brukt ankeltrykk '+data.anklePressure+' mmHg.'));
  return item;
 }
 function open(){
  dialog.replaceChildren();
  const head=h('div','v08-dialog-head'),copy=h('div');copy.append(h('p','eyebrow','Sirkulasjon · måle- og beregningsstøtte'));
  const heading=h('h2','','Ankel–arm-indeks');heading.id='abiTitle';copy.append(heading);
  const x=h('button','dialog-close','×');x.type='button';x.setAttribute('aria-label','Lukk ankel–arm-indeks');x.addEventListener('click',close);head.append(copy,x);
  const body=h('div','v08-dialog-content abi12-content');
  body.append(h('p','hc-hint','Bruk doppler og korrekt mansjett på en person som har hvilt liggende. Registrer systolisk trykk i begge armer og begge angitte fotarterier. Beregningen bruker høyeste armtrykk som nevner og høyeste ankeltrykk på hver side som teller.'));
  const steps=h('ol','abi12-steps');for(const text of ['La personen hvile liggende og bruk egnet mansjett.','Mål systolisk trykk i begge armer.','Mål dorsalis pedis og tibialis posterior på begge sider med doppler.','Dokumenter også dopplersignal og kliniske funn etter lokal prosedyre.'])steps.append(h('li','',text));body.append(steps);
  const form=h('form','hc-form abi12-form');form.id='abiForm';form.noValidate=true;form.autocomplete='off';
  const arm=h('fieldset','abi12-group');arm.append(h('legend','','Armtrykk'));
  const arms=h('div','abi12-grid');arms.append(field('abiArmRight','Høyre arm','arms'),field('abiArmLeft','Venstre arm','arms'));arm.append(arms);
  const ankle=h('fieldset','abi12-group');ankle.append(h('legend','','Ankeltrykk'));
  const ankles=h('div','abi12-grid abi12-grid-four');ankles.append(field('abiRightDp','Høyre dorsalis pedis','right'),field('abiRightPt','Høyre tibialis posterior','right'),field('abiLeftDp','Venstre dorsalis pedis','left'),field('abiLeftPt','Venstre tibialis posterior','left'));ankle.append(ankles);
  const actions=h('div','hc-controls'),submit=h('button','btn btn-primary','Beregn indeks');submit.type='submit';
  const reset=h('button','btn btn-secondary','Nullstill');reset.type='reset';actions.append(submit,reset);form.append(arm,ankle,actions);body.append(form);
  const output=h('section','hc-output abi12-output');output.id='abiResult';output.hidden=true;output.setAttribute('role','status');output.setAttribute('aria-live','polite');body.append(output);
  const clear=()=>{output.hidden=true;output.replaceChildren();form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'))};
  form.addEventListener('input',clear);form.addEventListener('reset',clear);
  form.addEventListener('submit',event=>{
   event.preventDefault();clear();output.hidden=false;
   try{
    const data=engine.calculate({armRight:document.getElementById('abiArmRight').value,armLeft:document.getElementById('abiArmLeft').value,rightDp:document.getElementById('abiRightDp').value,rightPt:document.getElementById('abiRightPt').value,leftDp:document.getElementById('abiLeftDp').value,leftPt:document.getElementById('abiLeftPt').value});
    output.append(h('h3','','Beregnet ankel–arm-indeks'));
    const results=h('div','abi12-results');results.append(resultCard('Høyre bein',data.right),resultCard('Venstre bein',data.left));output.append(results);
    output.append(h('p','abi12-denominator','Høyeste armtrykk brukt i begge beregninger: '+data.denominator+' mmHg.'));
    output.append(h('p','abi12-warning','Resultatet alene avgjør ikke diagnose, videre utredning eller om kompresjon er forsvarlig. Ved diabetes, nyresykdom, høy indeks eller klinisk mistanke kan ankel–arm-indeksen være misvisende og annen perfusjonsvurdering være nødvendig.'));
   }catch(error){
    output.append(h('p','hc-alert',error.message));
    const missing=[...form.querySelectorAll('input')].find(input=>!input.value||!input.checkValidity());if(missing){missing.setAttribute('aria-invalid','true');missing.focus()}
   }
  });
  const times=h('button','btn btn-secondary abi12-times','Åpne TIMES – sårvurdering');times.type='button';times.addEventListener('click',()=>{close();window.KartleggToolNavigation?.open('times')});body.append(times);
  const caveat=h('div','abi12-caveat');caveat.append(h('strong','','Viktige forbehold'),h('p','','Normal eller høy indeks utelukker ikke perifer arteriesykdom hos personer med diabetes. Sår, hvilesmerter, gangren eller andre tegn på truet sirkulasjon krever rask klinisk vurdering uavhengig av beregnet indeks.'));body.append(caveat);
  const refs=h('div','times-v091-sources');refs.append(source('https://www.nice.org.uk/guidance/cg147/chapter/recommendations','NICE – målemetode ↗'),source('https://www.ahajournals.org/doi/full/10.1161/CIR.0000000000001251','AHA/ACC 2024 – rapportering ↗'),source('https://www.helsedirektoratet.no/retningslinjer/diabetes/diabetisk-fot-og-nevropati','Helsedirektoratet – diabetisk fot ↗'));body.append(refs);
  dialog.append(head,body);dialog.showModal();
 }
 launch.addEventListener('click',open);
 dialog.addEventListener('click',event=>{if(event.target===dialog)close()});
 dialog.addEventListener('close',()=>dialog.replaceChildren());
 window.KartleggABIUI=Object.freeze({open});
})();
