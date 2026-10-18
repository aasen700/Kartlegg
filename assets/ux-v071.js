/* Kartlegg v0.7.1 – faster tool discovery, temporary assessment log, NRS slider, quick actions.
 * All clinical measurements live ONLY in this page's JavaScript memory. No server or browser storage.
 */
'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const tools=document.querySelector('#page-verktoy .toolgrid');
 const library=document.querySelector('#page-verktoy');
 const assessment=document.querySelector('#page-vurdering');
 const existing=tools?[...tools.querySelectorAll('.toolbox')]:[];
 if(!tools||existing.length<5||!assessment)return;

 // Move the three interactive tools ahead of the reference scoring tables.
 for(const i of [2,3,4,0,1])tools.append(existing[i]);
 const refs=new Map([
  ['gcs',existing[2].querySelector('.tool-launch')],
  ['4at',existing[3].querySelector('.tool-launch')],
  ['nrs',existing[4].querySelector('.tool-launch')],
 ]);
 const launch=id=>refs.get(id)?.click();

 const shortcuts=document.createElement('div');
 shortcuts.id='quickTools';shortcuts.className='quick-tools';
 const qTitle=document.createElement('strong');qTitle.textContent='Hurtigverktøy';
 const qDesc=document.createElement('span');qDesc.textContent='Åpne en egen kalkulator uten å fylle ut vitale målinger';
 const qLinks=document.createElement('div');qLinks.className='quick-tool-buttons';
 for(const [id,label,icon] of [['gcs','GCS','🧠'],['4at','4AT','◉'],['nrs','NRS – smerte','◈']]){
  const b=document.createElement('button');b.type='button';b.className='quick-tool-link';b.textContent=icon+' '+label;
  b.addEventListener('click',()=>launch(id));qLinks.append(b);
 }
 shortcuts.append(qTitle,qDesc,qLinks);
 assessment.querySelector('.intro')?.after(shortcuts);

 // Search at TOP of tools page; filter without removing scored references or changing clinical data.
 const finder=document.createElement('div');finder.className='tool-finder';finder.id='toolFinder';
 const searchLabel=document.createElement('label');searchLabel.htmlFor='toolSearch';searchLabel.textContent='Finn et kartleggingsverktøy';
 const input=document.createElement('input');input.type='search';input.id='toolSearch';input.placeholder='Søk etter GCS, NRS, 4AT, NEWS2, qSOFA …';input.autocomplete='off';
 const count=document.createElement('span');count.className='tool-match-count';count.id='toolSearchCount';count.setAttribute('aria-live','polite');
 const empty=document.createElement('p');empty.className='tool-no-matches';empty.id='toolNoMatches';empty.textContent='Ingen verktøy funnet. Prøv et annet søkeord.';empty.hidden=true;
 finder.append(searchLabel,input,count);
 library.querySelector('.intro')?.after(finder);
 tools.after(empty);
 // Library search and categories are handled by one late-loaded module.
 // Real-time numeric NRS input + keyboard-accessible draggable slider.
 function upgradeNrs(){
  const sel=$('toolNRS');if(!sel||$('toolNRSNumber'))return;
  const wrap=sel.closest('.tool-field');if(!wrap)return;
  sel.required=false;sel.hidden=true;sel.style.display='none';
  const oldLabel=wrap.querySelector('label');if(oldLabel)oldLabel.htmlFor='toolNRSNumber';
  const editor=document.createElement('div');editor.className='nrs-editor';
  const marks=document.createElement('div');marks.className='nrs-range-marks';
  for(const val of [0,2,4,6,8,10]){const text=document.createElement('span');text.textContent=String(val);marks.append(text)}
  const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='10';slider.step='1';slider.value='5';slider.id='toolNRSSlider';slider.setAttribute('aria-label','Dra for å angi NRS 0 til 10');
  const line=document.createElement('div');line.className='nrs-slider-line';
  const left=document.createElement('span');left.textContent='Ingen smerte';
  const right=document.createElement('span');right.textContent='Verst tenkelig smerte';
  line.append(left,right);
  const numeric=document.createElement('input');numeric.id='toolNRSNumber';numeric.type='number';numeric.inputMode='numeric';numeric.min='0';numeric.max='10';numeric.step='1';numeric.required=true;numeric.placeholder='0–10';numeric.setAttribute('aria-label','Skriv NRS fra 0 til 10');
  const label=document.createElement('label');label.htmlFor='toolNRSNumber';label.textContent='Eller skriv inn verdi';
  const row=document.createElement('div');row.className='nrs-value-row';row.append(label,numeric);
  editor.append(marks,slider,line,row);wrap.append(editor);
  function paint(){slider.style.setProperty('--nrs-progress',String(Number(slider.value)*10)+'%')}
  slider.addEventListener('input',()=>{
   numeric.value=slider.value;sel.value=slider.value;paint();
   numeric.dispatchEvent(new Event('input',{bubbles:true}));
  });
  numeric.addEventListener('input',()=>{
   const raw=numeric.value.trim(),value=Number(raw);
   if(raw!==''&&Number.isInteger(value)&&value>=0&&value<=10){sel.value=String(value);slider.value=String(value);paint()}
   else sel.value='';
  });
  paint();numeric.focus();
 }
 document.addEventListener('click',e=>{
  if(e.target.closest('.tool-launch')===refs.get('nrs'))upgradeNrs();
 });

 // Temporary assessment records, separate from vital measurements and never mixed with patient identity.
 const saved=[];const maxRecords=50;
 const hPage=$('page-historikk'),section=document.createElement('section');
 section.id='standaloneHistory';section.className='section extra-history';section.hidden=true;
 const head=document.createElement('div');head.className='section-header';
 head.innerHTML='<div class="section-symbol teal" aria-hidden="true">◷</div><div><h2>GCS- og NRS-målinger</h2><p>Kun midlertidig i denne fanen. Ingen personopplysninger eller pasientidentifikasjon.</p></div>';
 const toolbar=document.createElement('div');toolbar.className='extra-history-toolbar';
 const number=document.createElement('span');number.id='assessmentCount';number.textContent='0 målinger';
 const erase=document.createElement('button');erase.type='button';erase.className='btn-inline';erase.id='eraseAssessments';erase.textContent='Slett alle GCS/NRS';
 toolbar.append(number,erase);
 const list=document.createElement('div');list.id='assessmentList';list.className='assessment-list';
 section.append(head,toolbar,list);
 hPage.querySelector('.intro')?.after(section);
 const clearVitals=$('clearHistory');if(clearVitals)clearVitals.textContent='Slett vitale målinger';
 const emptyVitals=$('emptyHistory');if(emptyVitals)emptyVitals.textContent='Ingen vitale målinger lagret i denne fanen.';
 function renderSaved(){
  section.hidden=saved.length===0;number.textContent=saved.length+' målinger';
  list.replaceChildren();
  for(const record of [...saved].reverse()){
   const row=document.createElement('article');row.className='assessment-record';
   const data=document.createElement('div');data.className='assessment-record-copy';
   const strong=document.createElement('strong');strong.textContent=record.title;
   const detail=document.createElement('p');detail.textContent=record.detail;
   const time=document.createElement('small');time.textContent=record.date;
   const remove=document.createElement('button');remove.type='button';remove.className='btn-inline';remove.textContent='Slett';
   remove.setAttribute('aria-label','Slett '+record.title+' fra '+record.date);
   remove.addEventListener('click',()=>{
    if(!window.confirm('Slette denne midlertidige '+record.kind+'-målingen?'))return;
    const i=saved.findIndex(item=>item.id===record.id);if(i>=0)saved.splice(i,1);renderSaved();
   });
   data.append(strong,detail,time);row.append(data,remove);list.append(row);
  }
 }
 erase.addEventListener('click',()=>{
  if(!saved.length||!window.confirm('Slette alle midlertidige GCS- og NRS-målinger?'))return;
  saved.length=0;renderSaved();
 });
 let unique=0;
 function store(record){
  if(saved.length>=maxRecords){window.alert('Du kan lagre maksimalt 50 GCS/NRS-vurderinger i én økt. Slett noen før du fortsetter.');return}
  const time=new Date();
  const date=time.toLocaleString('nb-NO',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  saved.push({...record,date,id:++unique});renderSaved();
  $('clinicalToolDialog')?.close();
  document.querySelector('[data-page=historikk]')?.click();
 }
 // Runs after the existing clinical-tool form listener has computed and displayed the score.
 const form=$('clinicalToolForm'),result=$('clinicalToolResult');
 form?.addEventListener('submit',e=>{
  if(!form.reportValidity()||result.hidden||!result.querySelector('.tool-result-heading'))return;
  const title=$('clinicalToolTitle')?.textContent||'';
  let current=null;
  try{
   if(title.startsWith('GCS')){
    const toScore=id=>$(id)?.value==='NT'?'NT':Number($(id)?.value);
    const score=KartleggTools.gcs({eyes:toScore('toolEyes'),verbal:toScore('toolVerbal'),motor:toScore('toolMotor')});
    current={kind:'GCS',title:score.total===null?'GCS – ikke fullstendig':'GCS '+score.total+'/15',detail:score.report+(score.total===null?' · Ikke testbar':'')};
   }else if(title.startsWith('NRS')){
    const val=Number($('toolNRS').value);const nrs=KartleggTools.nrs(val);
    current={kind:'NRS',title:'NRS '+nrs.total+'/10',detail:$('toolContext').selectedOptions[0]?.textContent||'Uspesifisert'};
   }
  }catch(_){return}
  if(!current)return;
  const save=document.createElement('button');save.type='button';save.className='btn btn-secondary save-standalone';save.textContent='＋ Lagre '+current.kind+' i målehistorikk';
  save.addEventListener('click',()=>store(current));result.append(save);
 });
 form?.addEventListener('input',()=>{if(!result.hidden)result.hidden=true});
 form?.addEventListener('change',()=>{if(!result.hidden)result.hidden=true});

 // Persistent-in-viewport action dock (never stores data) for the assessment page.
 const dock=document.createElement('nav');dock.id='actionDock';dock.className='action-dock';dock.setAttribute('aria-label','Hurtighandlinger for vurdering');
 for(const [id,label,source] of [['dockScore','Beregn skårer',null],['dockIsbar','ISBAR','openIsbar'],['dockSave','Lagre måling','saveMeasurement']]){
  const b=document.createElement('button');b.type='button';b.id=id;b.className=id==='dockScore'?'btn btn-primary':'btn btn-secondary';b.textContent=label;
  b.addEventListener('click',()=>{
   if(source)$(source)?.click();else $('vitalsForm')?.requestSubmit();
  });
  dock.append(b);
 }
 document.body.append(dock);
})();
