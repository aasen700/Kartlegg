/* Kartlegg v0.9 – Homecare tools, client-side educational demo only.
   Independent tools, no patient identity or storage. Existing NEWS2 view unchanged.
*/
'use strict';
(()=>{
 const $=id=>document.getElementById(id), V=window.KartleggHomeCare;
 const library=document.querySelector('#page-verktoy .toolgrid');
 if(!library||!V)return;
 const sourceURLs={
  mst:'https://www.helsedirektoratet.no/retningslinjer/forebygging-og-behandling-av-underernaering/vurdering-av-risiko-for-underernaering',
  tug:'https://www.helsedirektoratet.no/faglige-rad/fallforebygging-hos-eldre/identifisering-av-risiko-for-fall-hjemmeboende-eldre',
  esas:'https://www.kvalitetsregistre.no/registerdrift/pasientrapporterte-data/skjema/',
  esanorsk:'https://www.cancercareontario.ca/sites/ccocancercare/files/assets/CCOESAS-Norwegian.pdf',
  orth:'https://www.helsedirektoratet.no/faglige-rad/fallforebygging-hos-eldre/multifaktoriell-kartlegging-hjemmeboende-eldre/multifaktoriell-kartlegging-av-risikofaktorer-for-fall-tabell',
  fast:'https://www.helsenorge.no/sykdom/hjerneslag/',
  skuv:'https://www.ntnu.no/ism/kurs/skuv'
 };
 const defs=[
  {id:'mst',name:'MST',sub:'Risikovurdering for underernæring',desc:'To spørsmål om ufrivillig vekttap og redusert matinntak.',tag:'Ernæring',icon:'◉'},
  {id:'tug',name:'TUG',sub:'Timed Up and Go',desc:'3-meters mobilitetstest med stoppeklokke og valgfri manuell tid.',tag:'Fall og mobilitet',icon:'◷'},
  {id:'esas',name:'ESAS-r',sub:'Symptomkartlegging',desc:'Ni symptomskalaer (0–10) og ett valgfritt tilleggssymptom.',tag:'Palliasjon',icon:'♡'},
  {id:'ortho',name:'Ortostatisk BT',sub:'Blodtrykksendring',desc:'Se systolisk og diastolisk endring fra liggende til stående.',tag:'Sirkulasjon',icon:'↕'},
  {id:'fast',name:'FAST',sub:'Tegn på hjerneslag',desc:'Prate, smile, løfte, med informasjon om når du ringer 113.',tag:'Akutt',icon:'!'},
  {id:'skuv',name:'SKUV',sub:'Systematisk klinisk undersøkelse',desc:'Faglig guide til observasjoner og undersøkelsesteknikker.',tag:'Undersøkelse',icon:'⌕'}
 ];
 const refCard=[...library.querySelectorAll('.toolbox')].find(el=>/NEWS2/.test(el.querySelector('h3')?.textContent||''))||null;
 for(const item of defs){
  const card=document.createElement('article');card.className='toolbox hc-tool-card';card.dataset.homecareCard=item.id;
  const symbol=document.createElement('div');symbol.className='hc-card-icon';symbol.textContent=item.icon;symbol.setAttribute('aria-hidden','true');
  const heading=document.createElement('h3');heading.textContent=item.name+' – '+item.sub;
  const tag=document.createElement('span');tag.className='tool-tag';tag.textContent=item.tag;
  const desc=document.createElement('p');desc.textContent=item.desc;
  const action=document.createElement('button');action.type='button';action.className='btn btn-primary hc-launch';
  action.dataset.homecare=item.id;action.textContent='Åpne '+item.name+'';
  action.addEventListener('click',()=>open(item.id));
  card.append(symbol,heading,tag,desc,action);
  library.insertBefore(card,refCard);
 }
 const chip=document.querySelector('#page-verktoy .intro .chip');if(chip)chip.textContent='12 verktøy';
 $('toolSearch')?.dispatchEvent(new Event('input',{bubbles:true}));
 const dialog=document.createElement('dialog');dialog.id='homecareDialog';dialog.className='v08-dialog hc-dialog';dialog.setAttribute('aria-labelledby','hcTitle');
 document.body.append(dialog);
 const state={stop:null};
 function elem(tag,cls,txt){
  const e=document.createElement(tag);if(cls)e.className=cls;
  if(txt!==undefined)e.textContent=txt;return e;
 }
 function sourceLink(url,label){
  const a=elem('a','hc-source',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;
 }
 function row(label,value){
  const div=elem('div','hc-result-row');div.append(elem('span','',label),elem('strong','',String(value)));return div;
 }
 function numeric(val){
  if(typeof val!=='string'||!val.trim())throw new RangeError('Fyll ut alle obligatoriske felt.');
  const n=Number(val.replace(',','.'));if(!Number.isFinite(n))throw new RangeError('Oppgi et gyldig tall.');return n;
 }
 function safeClose(){
  if(state.stop){state.stop();state.stop=null}
  if(dialog.open)dialog.close();
  dialog.replaceChildren();
 }
 dialog.addEventListener('close',()=>{if(dialog.open)return;if(state.stop){state.stop();state.stop=null}dialog.replaceChildren()});
 dialog.addEventListener('cancel',()=>{if(state.stop){state.stop();state.stop=null}});
 dialog.addEventListener('click',e=>{if(e.target===dialog)safeClose()});
 function startDialog(item){
  if(state.stop){state.stop();state.stop=null}
  const head=elem('div','v08-dialog-head');
  const copy=elem('div');
  const h=elem('h2','',item.name+' – '+item.sub);h.id='hcTitle';copy.append(h);
  const close=elem('button','dialog-close','×');close.type='button';close.setAttribute('aria-label','Lukk '+item.name);
  close.addEventListener('click',safeClose);
  head.append(copy,close);
  const content=elem('div','v08-dialog-content hc-content');content.id='hcContent';
  dialog.replaceChildren(head,content);dialog.showModal();
  return content;
 }
 function para(container,txt,cls='hc-hint'){container.append(elem('p',cls,txt))}
 function alert(container,txt,cls='hc-alert'){
  const a=elem('p',cls,txt);a.setAttribute('role','status');container.append(a);return a;
 }
 function resultArea(content){
  const div=elem('div','hc-output');div.id='hcResult';div.setAttribute('role','status');div.setAttribute('aria-live','polite');div.hidden=true;content.append(div);
  // Old results must never remain visible after the user changes a measurement.
  const inputs=content.querySelector('form');
  const invalidate=()=>{div.hidden=true;div.replaceChildren()};
  inputs?.addEventListener('input',invalidate);
  inputs?.addEventListener('change',invalidate);
  return div;
 }
 function field(id,label,min=0,max=300,required=true){
  const wrap=elem('label','hc-field');
  const caption=elem('span','',label);
  const input=elem('input','');
  input.id=id;input.type='number';input.inputMode='decimal';input.min=String(min);input.max=String(max);input.step='any';input.autocomplete='off';input.required=required;
  wrap.append(caption,input);return wrap;
 }
 function submit(text){const b=elem('button','btn btn-primary',text);b.type='submit';return b}
 function resetButton(){const b=elem('button','btn btn-secondary','Nullstill');b.type='reset';return b}
 function formWrap(content,id){
  const form=elem('form','hc-form');form.id=id;form.noValidate=true;form.autocomplete='off';content.append(form);return form;
 }
 function addSource(content,url,label){content.append(sourceLink(url,label))}
 function open(id){
  const item=defs.find(x=>x.id===id);if(!item)return;
  const content=startDialog(item);
  ({mst:showMST,tug:showTUG,esas:showESAS,ortho:showOrtho,fast:showFAST,skuv:showSKUV})[id](content);
 }
 function showMST(content){
  para(content,'MST er Helsedirektoratets anbefalte verktøy for vurdering av risiko for underernæring hos voksne. Det er ikke en ernæringsdiagnose. Ved kjent underernæring eller i terminal fase må individuell vurdering komme først.');
  const form=formWrap(content,'hcMstForm');
  const weight=elem('label','hc-field');
  weight.append(elem('span','','Ufrivillig vekttap den siste tiden (omtrent seks måneder)'));
  const w=elem('select');w.id='hcMstWeight';w.required=true;
  const choices=[
   ['','Velg svar …'],['no','Nei'],['unknown','Vet ikke om det har vært vekttap'],
   ['kg1to5','Ja, 1–5 kg'],['kg6to10','Ja, 6–10 kg'],['kg11to15','Ja, 11–15 kg'],
   ['kgOver15','Ja, over 15 kg'],['kgUnknown','Ja, men antall kg er ukjent']
  ];
  for(const [value,label] of choices){const o=elem('option','',label);o.value=value;w.append(o)}
  weight.append(w);
  const food=elem('label','hc-field');food.append(elem('span','','Spist mindre enn vanlig (uansett årsak)?'));
  const f=elem('select');f.id='hcMstIntake';f.required=true;
  for(const [value,label] of [['','Velg svar …'],['no','Nei'],['yes','Ja']]){
   const o=elem('option','',label);o.value=value;f.append(o);
  }
  food.append(f);form.append(weight,food,submit('Beregn MST'),resetButton());
  const out=resultArea(content);
  function clear(){out.hidden=true;out.replaceChildren()}
  form.addEventListener('reset',clear);
  form.addEventListener('input',clear);
  form.addEventListener('submit',e=>{
   e.preventDefault();clear();
   if(!w.value||!f.value){alert(out,'Svar på begge spørsmålene.');out.hidden=false;return}
   const score=V.mst(w.value,f.value==='yes');
   out.append(elem('strong','hc-big-result','MST '+score.total+' poeng'));
   out.append(row('Vektendring',score.weightPoints+' poeng'),row('Matinntak',score.intakePoints+' poeng'));
   alert(out,score.atRisk?'Skår ≥2: indikerer risiko for underernæring. Vurder individuell kartlegging og tiltak.':'Skår under 2: screening alene utelukker ikke underernæring; bruk klinisk skjønn.',score.atRisk?'hc-alert hc-warning':'hc-hint');
   out.hidden=false;
  });
  para(content,'Viktig: Ved kjent underernæring, væskeansamling, alvorlig sykdom eller terminal fase kan en lav/ikke aktuell MST-skår være misvisende.');
  addSource(content,sourceURLs.mst,'Kilde: Helsedirektoratet – MST');
 }
 function showTUG(content){
  para(content,'Standardisert TUG: Reis deg fra en stol, gå 3 meter, snu, gå tilbake og sett deg. Testen må bare utføres når det er trygt, med nødvendig tilsyn/hjelpemiddel.');
  const form=formWrap(content,'hcTugForm');
  const clock=elem('div','hc-tug-clock','0,0 sek');clock.id='hcTugClock';form.append(clock);
  const controls=elem('div','hc-controls');
  const start=elem('button','btn btn-primary','Start');start.id='hcTugStart';start.type='button';
  const stop=elem('button','btn btn-secondary','Stopp');stop.id='hcTugStop';stop.type='button';stop.disabled=true;
  const zero=elem('button','btn btn-secondary','Nullstill');zero.type='button';zero.id='hcTugZero';
  controls.append(start,stop,zero);form.append(controls);
  const timeField=field('hcTugSeconds','Tid i sekunder (stoppeklokke eller manuelt)',0.1,600);
  timeField.querySelector('input').placeholder='For eksempel 12,4';
  form.append(timeField,submit('Vurder målt tid'));
  const out=resultArea(content);
  let started=null,frame=null,running=false,aborted=false;
  function display(ms){clock.textContent=(Math.round(ms/100)/10).toLocaleString('nb-NO',{minimumFractionDigits:1,maximumFractionDigits:1})+' sek'}
  function stopClock(){if(frame!==null){cancelAnimationFrame(frame);frame=null}running=false}
  function tick(){if(!running)return;display(performance.now()-started);frame=requestAnimationFrame(tick)}
  function reset(){
   stopClock();aborted=false;started=null;start.disabled=false;stop.disabled=true;
   $('hcTugSeconds').value='';display(0);out.hidden=true;out.replaceChildren();
  }
  start.addEventListener('click',()=>{
   if(running)return;
   aborted=false;started=performance.now();running=true;start.disabled=true;stop.disabled=false;
   out.hidden=true;out.replaceChildren();$('hcTugSeconds').value='';frame=requestAnimationFrame(tick);
  });
  stop.addEventListener('click',()=>{
   if(!running)return;
   const elapsed=(performance.now()-started)/1000;stopClock();start.disabled=false;stop.disabled=true;
   display(elapsed*1000);$('hcTugSeconds').value=(Math.round(elapsed*10)/10).toString();
  });
  zero.addEventListener('click',reset);
  const visibility=()=>{
   if(running&&document.hidden){
    stopClock();aborted=true;start.disabled=false;stop.disabled=true;started=null;
    $('hcTugSeconds').value='';clock.textContent='Avbrutt';out.hidden=false;out.replaceChildren();
    alert(out,'Tidtaking avbrutt fordi fanen ble skjult. Gjenta testen eller oppgi en ny, manuelt målt tid.');
   }
  };
  document.addEventListener('visibilitychange',visibility);
  state.stop=()=>{stopClock();document.removeEventListener('visibilitychange',visibility)};
  form.addEventListener('submit',e=>{
   e.preventDefault();out.replaceChildren();out.hidden=false;
   try{
    const x=V.tug(numeric($('hcTugSeconds').value));
    out.append(elem('strong','hc-big-result',x.seconds.toLocaleString('nb-NO',{maximumFractionDigits:1})+' sek'));
    alert(out,x.over15?'Over 15 sekunder kan indikere økt fallrisiko hos hjemmeboende eldre. Vurder fallhistorikk, gangkvalitet og øvrige faktorer.':'Tiden er ikke over 15 sekunder. Det utelukker ikke fallrisiko.',x.over15?'hc-alert hc-warning':'hc-hint');
   }catch(err){alert(out,err.message)}
  });
  para(content,'Ikke bruk TUG-tid alene til å fastslå fallrisiko. Observer også balanse, gangmønster og assistansebehov.');
  addSource(content,sourceURLs.tug,'Kilde: Helsedirektoratet – fallforebygging');
 }
 function showESAS(content){
  para(content,'ESAS-r kartlegger hvordan pasienten har det akkurat NÅ. Velg 0–10 for hvert symptom. Ingen totalskår beregnes.');
  const form=formWrap(content,'hcEsasForm');
  const symptoms=[
   ['smerte','Smerte','Ingen smerte','Verst tenkelig smerte'],
   ['slapphet','Slapphet','Ingen slapphet','Verst tenkelig slapphet'],
   ['dosighet','Døsighet','Ingen døsighet','Verst tenkelig døsighet'],
   ['kvalme','Kvalme','Ingen kvalme','Verst tenkelig kvalme'],
   ['matlyst','Nedsatt matlyst','Ikke nedsatt matlyst','Verst tenkelig nedsatt matlyst'],
   ['tungpust','Tung pust','Ingen tung pust','Verst tenkelig tung pust'],
   ['depresjon','Nedstemthet / depresjon','Ingen depresjon','Verst tenkelig depresjon'],
   ['angst','Angst / uro','Ingen angst','Verst tenkelig angst'],
   ['velvaere','Velvære','Best tenkelig velvære','Verst tenkelig velvære']
  ];
  const container=elem('div','hc-esas-list');form.append(container);
  function addSlider(key,title,left,right,optional=false){
   const wrap=elem('div','hc-esas-item');wrap.dataset.symptom=key;
   const header=elem('div','hc-esas-head');
   const label=elem('label','',title);label.htmlFor='hcEsasNumber_'+key;
   const number=elem('input','hc-esas-number');number.type='number';number.step='1';number.min='0';number.max='10';
   number.id='hcEsasNumber_'+key;number.placeholder='–';number.inputMode='numeric';
   number.setAttribute('aria-label',title+' – tall fra 0 til 10');
   const range=elem('input','hc-esas-range');range.type='range';range.min='0';range.max='10';range.step='1';range.value='0';
   range.id='hcEsasRange_'+key;range.setAttribute('aria-label','Dra for '+title);
   const anchors=elem('div','hc-esas-anchors');anchors.append(elem('span','',left+' (0)'),elem('span','',right+' (10)'));
   header.append(label,number);
   wrap.append(header,range,anchors);container.append(wrap);
   range.addEventListener('input',()=>{number.value=range.value;wrap.dataset.touched='true'});
   number.addEventListener('input',()=>{
    if(number.value===''){delete wrap.dataset.touched;return}
    const v=Number(number.value);
    if(Number.isInteger(v)&&v>=0&&v<=10){range.value=String(v);wrap.dataset.touched='true'}
   });
   return {key,number,range,wrap,optional};
  }
  const editors=symptoms.map(x=>addSlider(...x));
  const otherTitle=elem('label','hc-field');otherTitle.append(elem('span','','Annet symptom (valgfritt)'));
  const otherName=elem('input');otherName.type='text';otherName.id='hcEsasOtherName';otherName.maxLength=80;otherName.placeholder='For eksempel forstoppelse';
  otherTitle.append(otherName);form.append(otherTitle);
  const other=addSlider('other','Intensitet – annet symptom','Ingen plage','Verst tenkelig plage',true);
  form.append(submit('Vis ESAS-r-oversikt'),resetButton());
  const out=resultArea(content);
  form.addEventListener('reset',()=>{for(const e of [...editors,other]){e.range.value='0';delete e.wrap.dataset.touched}out.hidden=true;out.replaceChildren()});
  form.addEventListener('submit',e=>{
   e.preventDefault();out.replaceChildren();out.hidden=false;
   try{
    const values={};
    for(const ed of editors)values[ed.key]=ed.number.value===''?null:Number(ed.number.value);
    if(other.number.value!==''){values.other=Number(other.number.value);values.otherName=otherName.value}
    else if(otherName.value.trim())throw new RangeError('Oppgi en verdi for annet symptom, eller tøm symptomnavnet.');
    const data=V.esas(values);
    out.append(elem('strong','hc-big-result','ESAS-r: symptomer nå'));
    for(const [key,title] of symptoms)out.append(row(title,data[key]+'/10'));
    if(data.other!==undefined)out.append(row(data.otherName,data.other+'/10'));
    para(out,'Ingen sumskår: hvert symptom tolkes separat. Skjemaet er ikke lagret.');
   }catch(err){alert(out,err.message)}
  });
  para(content,'ESAS-r: Bruera mfl.; revidert av Watanabe mfl. Norsk oversettelse fra European Palliative Care Research Centre (NTNU). Fri bruk med kilde-/forfatterhenvisning ifølge Nasjonalt servicemiljø for medisinske kvalitetsregistre.');
  addSource(content,sourceURLs.esas,'Kilde og bruksvilkår – nasjonale kvalitetsregistre');
  content.append(document.createTextNode(' · '));
  addSource(content,sourceURLs.esanorsk,'Norsk ESAS-r v2 (2015)');
 }
 function showOrtho(content){
  para(content,'Mål blodtrykket etter minst fem minutters liggende hvile og deretter i stående stilling etter ca. 1 og 3 minutter, dersom det er forsvarlig. Registrer symptomer separat i ordinær dokumentasjon.');
  const form=formWrap(content,'hcOrthoForm');
  const groups=[
   ['Liggende – utgangsverdi',[['hcOBaseSys','Systolisk (mmHg)'],['hcOBaseDia','Diastolisk (mmHg)']]],
   ['Stående etter 1 minutt',[['hcO1Sys','Systolisk (mmHg)'],['hcO1Dia','Diastolisk (mmHg)']]],
   ['Stående etter 3 minutter',[['hcO3Sys','Systolisk (mmHg)'],['hcO3Dia','Diastolisk (mmHg)']]]
  ];
  for(const [group,items] of groups){
   const block=elem('fieldset','hc-bp-group');block.append(elem('legend','',group));
   const grid=elem('div','hc-bp-grid');
   for(const [id,label] of items)grid.append(field(id,label,20,320,false));
   block.append(grid);form.append(block);
  }
  form.append(submit('Beregn blodtrykksendring'),resetButton());
  const out=resultArea(content);
  form.addEventListener('reset',()=>{out.hidden=true;out.replaceChildren()});
  form.addEventListener('submit',e=>{
   e.preventDefault();out.replaceChildren();out.hidden=false;
   try{
    function readPair(a,b,required){
     const v1=$(a).value.trim(),v2=$(b).value.trim();
     if(!v1&&!v2&&!required)return null;
     if(!v1||!v2)throw new RangeError('Fyll ut både systolisk og diastolisk trykk i hver benyttede måling.');
     return {sys:numeric(v1),dia:numeric(v2)};
    }
    const readings=V.orthostatic({supine:readPair('hcOBaseSys','hcOBaseDia',true),
     standing1:readPair('hcO1Sys','hcO1Dia',false),standing3:readPair('hcO3Sys','hcO3Dia',false)});
    out.append(elem('strong','hc-big-result','Blodtrykksendring fra liggende'));
    for(const [key,title] of [['minute1','Etter 1 minutt'],['minute3','Etter 3 minutter']]){
     const x=readings.readings[key];if(!x)continue;
     out.append(row(title+' · systolisk', (x.systolicDrop>=0?'−':'+')+Math.abs(x.systolicDrop)+' mmHg'));
     out.append(row(title+' · diastolisk',(x.diastolicDrop>=0?'−':'+')+Math.abs(x.diastolicDrop)+' mmHg'));
    }
    alert(out,readings.anyThreshold?'Blodtrykksfall når veiledende kriterier på minst 20 mmHg systolisk eller 10 mmHg diastolisk. Vurder symptomer og klinisk kontekst.':'Ingen av de oppgitte målingene oppfyller de vanlige blodtrykksfallgrensene. Et negativt funn utelukker ikke ortostatisme.',readings.anyThreshold?'hc-alert hc-warning':'hc-hint');
   }catch(err){alert(out,err.message)}
  });
  para(content,'Ufullstendige eller avvikende måletidspunkter kan påvirke vurderingen. Svimmelhet, besvimelse eller akutt sykdom krever klinisk vurdering uavhengig av resultat.');
  addSource(content,sourceURLs.orth,'Kilde: Helsedirektoratet – ortostatisk måling');
 }
 function showFAST(content){
  const emergency=elem('div','hc-emergency');
  emergency.append(elem('strong','','Ved mistanke om hjerneslag: Ring 113 umiddelbart.'));
  emergency.append(elem('p','','Ikke vent på at alle symptomene skal oppstå. Ikke bruk FAST til å utelukke hjerneslag.'));
  content.append(emergency);
  for(const [letter,title,info] of [
   ['F','Fjes / smil','Har personen plutselig skjevhet i ansiktet når hen smiler?'],
   ['A','Armer / løft','Har personen plutselig svakhet i en arm, eller vansker med å løfte begge armene?'],
   ['S','Språk / prate','Har personen plutselige vansker med å snakke eller forstå språk?'],
   ['T','Tid','Symptomene oppstår plutselig. Ring 113 straks ved mistanke, også ved forbigående symptomer.']
  ]){
   const wrap=elem('div','hc-fast-line');wrap.append(elem('span','hc-fast-letter',letter));
   const texts=elem('div');texts.append(elem('strong','',title),elem('p','',info));wrap.append(texts);content.append(wrap);
  }
  alert(content,'Også plutselige synsforstyrrelser, kraftig hodepine, svimmelhet eller balanseproblemer kan være tegn på hjerneslag. Negative FAST-funn utelukker ikke hjerneslag.','hc-alert hc-warning');
  addSource(content,sourceURLs.fast,'Kilde: Helsenorge – hjerneslag');
 }
 function showSKUV(content){
  para(content,'SKUV er systematisk klinisk undersøkelse og vurdering. Bruk relevante observasjoner og teknikker innenfor egen kompetanse; dette er ikke en prosedyre eller diagnosemotor.');
  const systems=[
   {name:'Respirasjon',steps:['Inspeksjon: frekvens, rytme, dybde, symmetri og tegn på økt pustearbeid.','Palpasjon: vurder relevante brystkassebevegelser ved behov.','Perkusjon og auskultasjon: gjennomfør bare ved opplæring og relevant indikasjon.','Relater funn til SpO₂, oksygentilførsel, allmenntilstand og NEWS2.']},
   {name:'Sirkulasjon',steps:['Inspeksjon: hudfarge, perifere ødemer og tegn på sirkulasjonssvikt.','Palpasjon: radialpuls, frekvens, rytme og perifer hudtemperatur.','Mål blodtrykk og andre relevante vitale parametere.','Ved klinisk forverring: vurder helheten og behov for rask eskalering.']},
   {name:'Nevrologi',steps:['Undersøk våkenhet, orientering og eventuelle nye endringer i mental status.','Observer ansiktssymmetri, tale, kraft og bevegelse ved mistanke om akutt nevrologisk hendelse.','Ved mistanke om hjerneslag: ring 113 straks, også ved negative FAST-funn.','GCS og 4AT er egne vurderinger. De regnes ikke ut fra vitale parametere.']},
   {name:'Abdomen',steps:['Spør om smerter, kvalme, appetitt, avføring og vannlating.','Inspiser abdominal form, distensjon og synlige forandringer.','Auskultasjon, perkusjon og palpasjon brukes bare med kompetanse og klinisk begrunnelse.','Relevante faresignaler vurderes og videreformidles etter gjeldende rutiner.']},
   {name:'Hud og funksjon',steps:['Observer hudens farge, fuktighet, temperatur og eventuelle sår.','Se etter trykkutsatte områder ved indikasjon og vurder forflytnings- og mobilitetsbehov.','Kartlegg fallhistorikk, funksjonsnivå og hjelpemidler.','Ta utgangspunkt i pasientens vanlige funksjon og nye endringer.']}
  ];
  const tabs=elem('div','hc-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Organsystem');
  const panel=elem('section','hc-skuv-panel');panel.id='hcSKUVPanel';panel.setAttribute('role','tabpanel');panel.tabIndex=0;
  const buttons=[];
  function show(index){
   panel.replaceChildren();
   const name=systems[index].name;panel.append(elem('h3','',name));
   const ul=elem('ul');
   for(const x of systems[index].steps)ul.append(elem('li','',x));
   panel.append(ul);
   buttons.forEach((btn,i)=>{btn.setAttribute('aria-selected',String(i===index));btn.tabIndex=i===index?0:-1});
   panel.setAttribute('aria-labelledby','hcTab'+index);
  }
  systems.forEach((s,index)=>{
   const b=elem('button','hc-tab',s.name);b.type='button';b.id='hcTab'+index;b.setAttribute('role','tab');
   b.setAttribute('aria-controls','hcSKUVPanel');
   b.addEventListener('click',()=>show(index));
   b.addEventListener('keydown',e=>{
    if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
    e.preventDefault();const next=(index+(e.key==='ArrowRight'?1:systems.length-1))%systems.length;
    show(next);buttons[next].focus();
   });
   buttons.push(b);tabs.append(b);
  });
  content.append(tabs,panel);show(0);
  para(content,'Denne guiden gir eksempler på observasjoner, ikke fullstendige fremgangsmåter for undersøkelse. Akutt forverring krever egnet klinisk respons.');
  addSource(content,sourceURLs.skuv,'Kilde: NTNU – SKUV');
 }
})();
