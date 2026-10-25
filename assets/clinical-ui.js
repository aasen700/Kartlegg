/* Kartlegg 0.7: standalone GCS, 4AT, NRS plus visible NEWS2 response alerts. */
'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const T=window.KartleggTools;
 if(!T){console.error('Kartlegg: kliniske beregninger mangler');return}
 const toolGrid=document.querySelector('#page-verktoy .toolgrid');
 if(!toolGrid)return;
 const cards=[...toolGrid.querySelectorAll('.toolbox')];
 function addToolCard(card, id, title, desc){
  card.querySelectorAll('.tool-tag').forEach(el=>{el.classList.remove('soon');el.textContent='Separat kalkulator'});
  const p=card.querySelector('p');if(p)p.textContent=desc;
  card.querySelector('.criteria-wrap,details')?.remove();
  const btn=document.createElement('button');btn.className='btn btn-primary tool-launch';btn.type='button';btn.textContent='Åpne '+title+'';btn.addEventListener('click',()=>openTool(id));
  card.append(btn);
 }
 if(cards.length>=4){
  addToolCard(cards[2],'gcs','GCS','Glasgow Coma Scale – øyeåpning, verbal og motorisk respons. Summen vises bare når alle komponentene kan testes.');
  addToolCard(cards[3],'4at','4AT','Vurdering av delirium og kognitiv svikt med fire separate elementer.');
 }
 const nrsCard=document.createElement('article');nrsCard.className='toolbox';
 const h=document.createElement('h3');h.textContent='🩹 NRS – smerte';
 const tag=document.createElement('span');tag.className='tool-tag';tag.textContent='Separat kalkulator';
 const para=document.createElement('p');para.textContent='Pasienten oppgir selv smerteintensitet fra 0 til 10. Registrer hvile eller bevegelse.';
 const launch=document.createElement('button');launch.className='btn btn-primary tool-launch';launch.type='button';launch.textContent='Åpne NRS';launch.onclick=()=>openTool('nrs');
 nrsCard.append(h,tag,para,launch);toolGrid.append(nrsCard);
 const chip=document.querySelector('#page-verktoy .intro .chip');if(chip)chip.textContent='5 tilgjengelige verktøy';
 const intro=document.querySelector('#page-verktoy .intro p:not(.eyebrow)');
 if(intro)intro.textContent='Se NEWS2 og qSOFA, eller åpne GCS, 4AT og NRS som egne kalkulatorer.';
 const box=document.createElement('dialog');box.id='clinicalToolDialog';box.className='clinical-tool-dialog';box.setAttribute('aria-labelledby','clinicalToolTitle');
 box.innerHTML='<div class="tool-modal-head"><div><h2 id="clinicalToolTitle">Kalkulator</h2></div><button id="closeClinicalTool" type="button" class="dialog-close" aria-label="Lukk">×</button></div><div class="tool-modal-body"><p class="tool-lead" id="clinicalToolLead"></p><form id="clinicalToolForm" novalidate><div id="clinicalToolFields" class="tool-input-stack"></div><div class="tool-actions"><button class="btn btn-primary" type="submit">Beregn resultat</button><button class="btn btn-secondary" id="resetClinicalTool" type="reset">Nullstill</button></div></form><div id="clinicalToolResult" class="tool-result" aria-live="polite" hidden></div><div id="clinicalToolSource"></div></div>';
 document.body.append(box);
 const title=$('clinicalToolTitle'), lead=$('clinicalToolLead'), form=$('clinicalToolForm'), fields=$('clinicalToolFields'),result=$('clinicalToolResult'),source=$('clinicalToolSource');
 let active='gcs';
 $('closeClinicalTool').onclick=()=>box.close();box.addEventListener('click',e=>{if(e.target===box)box.close()});
 function select(id,label,options,description=''){
  const wrap=document.createElement('div');wrap.className='tool-field';
  const lbl=document.createElement('label');lbl.htmlFor=id;lbl.textContent=label;
  const sel=document.createElement('select');sel.id=id;sel.required=true;
  const empty=document.createElement('option');empty.value='';empty.textContent='Velg vurdering …';sel.append(empty);
  for(const [value,text] of options){const opt=document.createElement('option');opt.value=String(value);opt.textContent=text;sel.append(opt)}
  wrap.append(lbl,sel);
  if(description){const hint=document.createElement('p');hint.className='tool-hint';hint.textContent=description;wrap.append(hint)}
  fields.append(wrap);
 }
 function sourceLink(text,url){
  const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=text;source.append(a);
 }
 function openTool(id){
  if(!['gcs','4at','nrs'].includes(id))return;
  active=id;fields.replaceChildren();result.replaceChildren();result.hidden=true;source.replaceChildren();
  if(id==='gcs'){
   title.textContent='Glasgow Coma Scale (GCS)';
   lead.textContent='Vurder hver komponent. NT betyr «kan ikke testes» og gir ingen totalskår. Dokumenter alltid E, V og M.';
   select('toolEyes','Øyeåpning (E)',[['4','4 – Spontant'],['3','3 – Ved tiltale/lyd'],['2','2 – Ved trykkstimulus'],['1','1 – Ingen'],['NT','NT – Kan ikke testes']]);
   select('toolVerbal','Verbal respons (V)',[['5','5 – Orientert'],['4','4 – Forvirret'],['3','3 – Enkelte ord'],['2','2 – Lyder'],['1','1 – Ingen'],['NT','NT – Kan ikke testes']]);
   select('toolMotor','Motorisk respons (M)',[['6','6 – Følger oppfordringer'],['5','5 – Lokaliserer trykkstimulus'],['4','4 – Normal fleksjon'],['3','3 – Unormal fleksjon'],['2','2 – Ekstensjon'],['1','1 – Ingen'],['NT','NT – Kan ikke testes']]);
   sourceLink('Kilde: Glasgow Coma Scale – offisiell veiledning','https://www.glasgowcomascale.org/recording-gcs/');
  }else if(id==='4at'){
   title.textContent='4AT for delirium';
   lead.textContent='Fire elementer – vurderes separat. Dette er Kartleggs norskspråklige tilpasning av 4AT v1.2, ikke et selvstendig validert verktøy.';
   select('toolAlert','1. Årvåkenhet', [['0','0 – Normalt våken, eller kortvarig søvnighet <10 sekunder'],['4','4 – Tydelig unormalt årvåken/agiterte eller påfallende søvnig']]);
   select('toolOrientation','2. AMT4 – alder, fødselsdato, sted og år', [['0','0 – Ingen feil'],['1','1 – Én feil'],['2','2 – To eller flere feil, eller ikke testbar']],'Ikke skriv pasientens fødselsdato inn i Kartlegg. Noter bare antall feil.');
   select('toolAttention','3. Oppmerksomhet – måneder baklengs fra desember',[['0','0 – Minst 7 måneder korrekt'],['1','1 – Færre enn 7 måneder korrekt, eller nekter å starte'],['2','2 – Kan ikke starte på grunn av tilstand']]);
   select('toolAcute','4. Akutt endring eller fluktuerende forløp',[['0','0 – Nei'],['4','4 – Ja']],'Betydelig endring de siste to ukene, fortsatt merkbar siste døgn.');
   sourceLink('Kilde og brukerveiledning – offisiell 4AT','https://www.the4at.com/userguide');
   const credit=document.createElement('p');credit.className='tool-license';credit.textContent='Norsk tilpasning av 4AT © 2011–2014 Alasdair MacLullich, Tracy Ryan og Helen Cash. CC BY 4.0. Endringer: norsk språk, digitalt inndataskjema og korte svarbeskrivelser. Publisert validering av originalen gjelder ikke automatisk denne tilpasningen. Ingen tilknytning til eller godkjenning fra opphavspersonene.';
   source.append(credit);sourceLink('Lisens: CC BY 4.0','https://creativecommons.org/licenses/by/4.0/');
  }else{
   title.textContent='NRS for smerte';
   lead.textContent='Numerisk smerteskala 0–10. Skåren skal være pasientens egen rapportering, ikke observatørens anslag.';
   select('toolNRS','Pasientrapportert smerte (0–10)',Array.from({length:11},(_,i)=>[String(i),i===0?'0 – Ingen smerter':i===10?'10 – Verst tenkelige smerter':String(i)]));
   select('toolContext','Situasjon',[['hvile','I hvile'],['bevegelse','Ved bevegelse'],['annet','Annen situasjon']]);
   sourceLink('Faglig bakgrunn: Helsedirektoratet – smertevurdering','https://www.helsedirektoratet.no/');
  }
  box.showModal();
  box.querySelector('select')?.focus();
 }
 form.addEventListener('submit',e=>{
  e.preventDefault();
  if(!form.reportValidity())return;
  let out;try{
   if(active==='gcs'){
    const x=id=>$(id).value==='NT'?'NT':Number($(id).value);
    out=T.gcs({eyes:x('toolEyes'),verbal:x('toolVerbal'),motor:x('toolMotor')});
   }else if(active==='4at'){
    out=T.fourAT({alertness:Number($('toolAlert').value),orientation:Number($('toolOrientation').value),attention:Number($('toolAttention').value),acute:Number($('toolAcute').value)});
   }else out=T.nrs(Number($('toolNRS').value));
  }catch(err){result.hidden=false;result.textContent='Kunne ikke beregne: '+err.message;return}
  result.replaceChildren();
  const heading=document.createElement('strong');heading.className='tool-result-heading';
  const body=document.createElement('p');
  if(active==='gcs'){
   heading.textContent=out.testable?'GCS '+out.total+' / 15':'GCS – ikke fullstendig';
   body.textContent=out.report+(out.testable?'':' · Ikke beregn totalskår ved NT.');
   result.append(heading,body);
   if(out.testable){
    const b=document.createElement('button');b.type='button';b.className='btn btn-tertiary';b.textContent='Bruk GCS '+out.total+' i hovedskjemaet';
    b.onclick=()=>{
     $('gcs').value=String(out.total);
     $('gcs').dispatchEvent(new Event('input',{bubbles:true}));
     box.close();
     const nav=document.querySelector('[data-page="vurdering"]');nav?.click();
     $('gcs').focus();
    };
    result.append(b);
   }
  }else if(active==='4at'){
   heading.textContent='4AT '+out.total+' / 12';
   body.textContent=out.interpretation+'. Dette er ingen diagnose.';
   result.append(heading,body);
  }else{
   heading.textContent='NRS '+out.total+' / 10';
   body.textContent=out.description+' · '+$('toolContext').selectedOptions[0].textContent+'.';
   result.append(heading,body);
  }
  result.hidden=false;
 });
 form.addEventListener('reset',()=>{result.replaceChildren();result.hidden=true});
 // NEWS2 red-score and aggregate-score escalation. No patient data retention.
 const alerts=document.createElement('section');alerts.className='news-alert';alerts.id='newsClinicalAlert';alerts.hidden=true;alerts.setAttribute('role','status');
 document.querySelector('#resultater .scores')?.after(alerts);
 function refreshAlert(event){
  const news=event.detail;
  alerts.replaceChildren();alerts.hidden=true;
  if(!news)return;
  try{
   const info=T.newsAlert(news);
   if(info.level==='routine')return;
   alerts.dataset.level=info.level;
   const h=document.createElement('h3');h.textContent='⚠ '+info.title;alerts.append(h);
   if(info.redParameters.length){
    const p=document.createElement('p');p.textContent='Enkeltparameter med 3 poeng: '+info.redParameters.join(', ')+'.';alerts.append(p);
   }
   const p=document.createElement('p');p.textContent=info.explanation;alerts.append(p);
   const note=document.createElement('small');note.textContent=info.notes;alerts.append(note);alerts.hidden=false;
  }catch(_){alerts.hidden=true}
 }
 window.addEventListener('kartlegg:news2-changed',refreshAlert);
 document.querySelector('#vitalsForm')?.addEventListener('reset',()=>{alerts.hidden=true;alerts.replaceChildren()});
 document.querySelector('#page-verktoy .section-header h2')?.setAttribute('id','clinicalLibraryHeading');
})();
