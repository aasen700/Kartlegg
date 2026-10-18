/* Kartlegg v0.8.1 – NEWS2-first landing page with compact tool search.
 * Tool launch is delegated to the existing verified calculators; no clinical data is read or persisted.
 */
'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const home=$('page-vurdering'), form=$('vitalsForm');
 if(!home||!form)return;
 // The previous large shortcut row distracts from NEWS2 and qSOFA.
 $('quickTools')?.remove();
 // The v0.8 grouped layout and enlarged result visualizations are not loaded in v0.8.1;
 // the native compact NEWS2-first fields and score cards remain intact.
 const intro=home.querySelector('.intro');
 if(!intro)return;
 const surface=document.createElement('section');surface.className='v081-tool-search';surface.id='homeToolSearch';
 surface.setAttribute('aria-label','Søk i kliniske verktøy');
 const inputWrap=document.createElement('div');inputWrap.className='v081-search-field';
 const icon=document.createElement('span');icon.className='v081-search-icon';icon.setAttribute('aria-hidden','true');
 icon.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>';
 const label=document.createElement('label');label.htmlFor='homeToolQuery';label.className='v081-search-label';label.textContent='Finn verktøy';
 const input=document.createElement('input');input.id='homeToolQuery';input.type='search';input.autocomplete='off';input.spellcheck=false;
 input.placeholder='Søk NEWS2, TIMES, palliasjon …';
 input.setAttribute('aria-label','Søk etter klinisk verktøy');
 input.setAttribute('aria-controls','homeToolResults');
 input.setAttribute('aria-expanded','false');
 const all=document.createElement('button');all.type='button';all.className='v081-view-all';
 all.textContent='Se alle verktøy →';
 all.addEventListener('click',()=>{hide();document.querySelector('[data-page=verktoy]')?.click()});
 inputWrap.append(icon,input);
 const result=document.createElement('div');result.className='v081-search-results';result.id='homeToolResults';result.hidden=true;
 result.setAttribute('aria-label','Treff i verktøybiblioteket');
 const status=document.createElement('span');status.className='v081-sr-only';status.id='homeToolStatus';
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 surface.append(label,inputWrap,all,result,status);intro.after(surface);
 const registry=[
  {name:'NEWS2',detail:'Vitale målinger og samlet skår',terms:'news2 news score respirasjon oksygen blodtrykk temperatur',run:()=>{document.getElementById('rr')?.focus()}},
  {name:'qSOFA',detail:'Infeksjon, respirasjon, blodtrykk og GCS',terms:'qsofa sepsis infeksjon gcs',run:()=>{const optional=$('optionalGCS');if(optional)optional.open=true;const gcs=$('gcs');gcs?.scrollIntoView({block:'center',behavior:'auto'});gcs?.focus({preventScroll:true})}},
  {name:'GCS',detail:'Glasgow Coma Scale',terms:'gcs glasgow koma bevissthet øyne motor verbal',run:()=>launch('GCS')},
  {name:'4AT',detail:'Delirium og kognitiv vurdering',terms:'4at delirium kognisjon forvirring',run:()=>launch('4AT')},
  {name:'NRS',detail:'Numerisk smerteskala',terms:'nrs smerte smerter smerteskala',run:()=>launch('NRS')},
  {name:'BMI / BSA',detail:'Kroppsmasseindeks og kroppsoverflate',terms:'bmi bsa høyde vekt kroppsmasseindeks kroppsoverflate',run:()=>document.querySelector('.v08-body-launch')?.click()},
  {name:'Respirasjonstimer',detail:'Tell pust i 15, 30 eller 60 sekunder',terms:'respirasjonstimer pust pustefrekvens telling timer',run:()=>document.getElementById('respTimerLaunch')?.click()},
  {name:'MST',detail:'Ernæringsscreening',terms:'mst ernæring ernæringsrisiko vekttap matlyst malnutrition',run:()=>document.querySelector('[data-homecare="mst"]')?.click()},
  {name:'TUG',detail:'Timed Up and Go',terms:'tug mobilitet gangtest gåtest fall balanse stoppeklokke',run:()=>document.querySelector('[data-homecare="tug"]')?.click()},
  {name:'ESAS-r',detail:'Palliativ symptomkartlegging',terms:'esas esas-r palliasjon smerte kvalme slapphet angst symptom',run:()=>document.querySelector('[data-homecare="esas"]')?.click()},
  {name:'Ortostatisk BT',detail:'Liggende og stående blodtrykk',terms:'ortostatisk hypotensjon blodtrykk svimmelhet sirkulasjon fall',run:()=>document.querySelector('[data-homecare="ortho"]')?.click()},
  {name:'FAST',detail:'Prate, smile, løfte – ring 113 ved mistanke',terms:'fast hjerneslag slag prate smile løfte akutt 113',run:()=>document.querySelector('[data-homecare="fast"]')?.click()},
  {name:'SKUV',detail:'Systematisk klinisk undersøkelse og vurdering',terms:'skuv systematisk klinisk undersøkelse vurdering sykepleie',run:()=>document.querySelector('[data-homecare="skuv"]')?.click()},
  {name:'TIMES',detail:'Sårvurdering og kalibrerbar skjermlinjal',terms:'times sår sårbehandling sårvurdering linjal sårmål vev sårvæske',run:()=>document.querySelector('#launchTIMES')?.click()},
  {name:'Lindring ved livets slutt',detail:'Observasjonstegn, pleietiltak og legemiddelkunnskap',terms:'palliasjon terminalpleie medikamentskrin morfin midazolam haloperidol glykopyrronium symptomveileder',run:()=>document.querySelector('#launchPalliation')?.click()},
  {name:'ABCDE',detail:'Interaktiv primærvurdering – A, B, C, D og E',terms:'abcde akutt luftvei airway respirasjon breathing sirkulasjon circulation nevrologi disability exposure undersøkelse primærvurdering',run:()=>document.getElementById('launchABCDE')?.click()}
 ];
 // Searchable symptom shortcuts open the observation guide at the requested topic.
 for(const [name,id,terms] of [
  ['Smerter – terminalpleie','pain','stønning grimaser ubehag'],
  ['Tungpust – terminalpleie','dyspnea','dyspne åndenød puste'],
  ['Kvalme / oppkast – terminalpleie','nausea','brekninger oppkast kvalme'],
  ['Angst / panikk – terminalpleie','anxiety','angst panikk engstelig'],
  ['Delirium / agitasjon – terminalpleie','delirium','delirium forvirring agitasjon uro'],
  ['Muskelrykninger / myoklonier','myoclonus','myoklonier muskelrykninger kramper rykninger'],
  ['Surkling / sekret','secretions','surkling slim sekret dødsralling'],
  ['Munntørrhet / svelging','mouth','munntørrhet munnstell svelging']
 ]){
  registry.push({name,detail:'Tegn og vurdering ved livets slutt',terms:terms+' terminalpleie palliasjon',
   run:()=>window.KartleggPalliation?.open(id)});
 }
 function launch(title){
  const card=[...document.querySelectorAll('#page-verktoy .toolbox')].find(el=>(el.querySelector('h3')?.textContent||'').includes(title));
  card?.querySelector('.tool-launch')?.click();
 }
 let matches=[];
 function hide(){result.hidden=true;input.setAttribute('aria-expanded','false')}
 function choose(item){
  hide();input.value='';
  item.run();
 }
 function render(){
  result.replaceChildren();const q=input.value.trim().toLocaleLowerCase('nb-NO');
  if(!q){matches=[];hide();status.textContent='';return}
  matches=registry.filter(item=>(item.name+' '+item.detail+' '+item.terms).toLocaleLowerCase('nb-NO').includes(q));
  // Rank exact tool names before related clinical terms (e.g. GCS before qSOFA).
  const rank=item=>{
   const name=item.name.toLocaleLowerCase('nb-NO');
   return name===q?0:name.startsWith(q)?1:name.includes(q)?2:3;
  };
  matches.sort((a,b)=>rank(a)-rank(b));
  if(matches.length){
   // Compact search: prioritize exact-name hits without producing an enormous dropdown.
   for(const item of matches.slice(0,8)){
    const button=document.createElement('button');button.type='button';button.className='v081-tool-result';
    const words=document.createElement('span');words.className='v081-result-text';
    const name=document.createElement('strong');name.textContent=item.name;
    const note=document.createElement('small');note.textContent=item.detail;
    words.append(name,note);button.append(words);
    const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';button.append(arrow);
    button.addEventListener('click',()=>choose(item));result.append(button);
   }
  }else{
   const empty=document.createElement('p');empty.className='v081-result-empty';empty.textContent='Ingen treff. Prøv et annet søkeord.';result.append(empty);
  }
  result.hidden=false;input.setAttribute('aria-expanded','true');
  status.textContent=matches.length===1?'1 verktøy funnet':matches.length+' verktøy funnet';
 }
 input.addEventListener('input',render);
 input.addEventListener('keydown',e=>{
  if(e.key==='Escape'){hide();return}
  if(e.key==='Enter'&&matches.length){e.preventDefault();choose(matches[0])}
  if(e.key==='ArrowDown'&&!result.hidden){
   const first=result.querySelector('button');if(first){e.preventDefault();first.focus()}
  }
 });
 result.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();hide();input.focus()}});
 document.addEventListener('pointerdown',e=>{if(!surface.contains(e.target))hide()});
})();
