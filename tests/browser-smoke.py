#!/usr/bin/env python3
"""Open Kartlegg's actual HTML/JS in headless Chrome and run synthetic UI smoke checks.
Tests no real patient data and does not depend on npm.
"""
from pathlib import Path
import html
import os
import re
import shutil
import subprocess
import sys

root=Path(__file__).resolve().parents[1]
source=(root/"index.html").read_text(encoding="utf-8")
chrome=next((v for v in ("google-chrome","google-chrome-stable","chromium","chromium-browser") if shutil.which(v)),None)
if not chrome:
  raise SystemExit("Browser smoke check requires Google Chrome or Chromium on runner")
script=r"""
<script>
(() => {
 const errors=[];
 window.addEventListener('error',e=>errors.push(String(e.message)));
 const assert=(ok,message)=>{if(!ok)throw Error(message)};
 const put=(id,value)=>{let field=document.getElementById(id);assert(!!field,'missing '+id);field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}))};
 let status='FAIL';
 try {
  assert(!!window.KartleggTools,'scoring module did not load');
  assert(!!document.querySelector('#clinicalToolDialog'),'missing tool dialog');
  assert(!!document.querySelector('#newsClinicalAlert'),'missing NEWS2 alert');
  const btns=[...document.querySelectorAll('.tool-launch')];
  assert(btns.length===3,'expected 3 tool launch buttons, got '+btns.length);
  // GCS standalone + explicit transfer into qSOFA's input.
  btns[0].click();
  put('toolEyes','4');put('toolVerbal','5');put('toolMotor','6');
  document.querySelector('#clinicalToolForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(document.querySelector('#clinicalToolResult').textContent.includes('GCS 15'),'GCS total not displayed');
  const transfer=[...document.querySelectorAll('#clinicalToolResult button')].find(x=>x.textContent.includes('Bruk GCS'));
  assert(!!transfer,'GCS transfer not available');
  transfer.click();
  assert(document.querySelector('#gcs').value==='15','GCS was not transferred');
  // 4AT independent scoring.
  btns[1].click();
  put('toolAlert','4');put('toolOrientation','2');put('toolAttention','2');put('toolAcute','4');
  document.querySelector('#clinicalToolForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(document.querySelector('#clinicalToolResult').textContent.includes('4AT 12'),'4AT total incorrect');
  document.querySelector('#closeClinicalTool').click();
  // Save a standalone GCS without completing unrelated vital measurements.
  btns[0].click();
  put('toolEyes','4');put('toolVerbal','5');put('toolMotor','6');
  document.querySelector('#clinicalToolForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  const saveGCS=document.querySelector('.save-standalone');
  assert(!!saveGCS,'GCS save button missing');
  saveGCS.click();
  assert(document.querySelector('#assessmentList').textContent.includes('GCS 15'),'GCS memory history missing');
  assert(document.querySelectorAll('#assessmentList .assessment-record').length===1,'expected one saved GCS');
  // NRS independent scoring: draggable slider and typed numeric entry must stay in sync.
  btns[2].click();
  assert(!!document.querySelector('#toolNRSSlider'),'NRS slider not found');
  assert(!!document.querySelector('#toolNRSNumber'),'NRS numeric entry not found');
  put('toolNRSSlider','8');
  assert(document.querySelector('#toolNRSNumber').value==='8','NRS slider did not update number input');
  put('toolNRSNumber','7');
  assert(document.querySelector('#toolNRSSlider').value==='7','NRS number input did not update slider');
  put('toolContext','hvile');
  document.querySelector('#clinicalToolForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(document.querySelector('#clinicalToolResult').textContent.includes('NRS 7'),'NRS result missing');
  const saveNRS=document.querySelector('.save-standalone');
  assert(!!saveNRS,'NRS save button missing');
  saveNRS.click();
  assert(document.querySelector('#assessmentList').textContent.includes('NRS 7'),'NRS memory history missing');
  assert(document.querySelectorAll('#assessmentList .assessment-record').length===2,'GCS and NRS should both be present in history');
  // NEWS2-first: compact search replaces the 4 quick-tool cards.
  assert(!document.querySelector('#quickTools'),'old quick-tool row should be removed');
  assert(!!document.querySelector('#homeToolSearch'),'homepage tool search missing');
  assert(!!document.querySelector('#toolSearch'),'library search missing');
  put('toolSearch','smerte');
  const painMatches=[...document.querySelectorAll('#page-verktoy .toolbox:not([hidden])')];
  assert(painMatches.length>=1&&painMatches.some(card=>/NRS/.test(card.querySelector('h3')?.textContent||'')),'library pain search must include NRS');
  put('toolSearch','');
  assert(document.querySelectorAll('#page-verktoy .toolbox:not([hidden])').length===16,'library search did not reset: total='+document.querySelectorAll('#page-verktoy .toolbox').length+',visible='+document.querySelectorAll('#page-verktoy .toolbox:not([hidden])').length+',errors='+errors.join('|'));
  put('homeToolQuery','gcs');
  assert(!document.querySelector('#homeToolResults').hidden,'search suggestions not shown');
  assert(document.querySelector('#homeToolResults button').textContent.includes('GCS'),'exact GCS result must be ranked first');
  document.querySelector('#homeToolResults button').click();
  assert(document.querySelector('#clinicalToolDialog').open,'search did not open GCS calculator');
  document.querySelector('#closeClinicalTool').click();
  // v1.0.1: opening qSOFA from compact search must reveal optional GCS before focusing.
  document.querySelector('[data-page=vurdering]').click(); // The compact search is on the home page.
  const quickGCS=document.querySelector('#optionalGCS');
  quickGCS.open=false;
  put('homeToolQuery','qsofa');
  assert(document.querySelector('#homeToolResults button').textContent.includes('qSOFA'),'qSOFA search result missing');
  document.querySelector('#homeToolResults button').click();
  assert(quickGCS.open,'qSOFA shortcut must expand hidden GCS');
  assert(document.activeElement===document.querySelector('#gcs')&&document.querySelector('#gcs').getClientRects().length>0,'qSOFA shortcut must focus visible GCS on the assessment page');
  assert(document.querySelector('#homeToolResults').hidden,'qSOFA search dropdown should close');
  put('homeToolQuery','smerte');
  assert(document.querySelector('#homeToolResults').textContent.includes('NRS'),'NRS not discoverable by pain search');
  put('homeToolQuery','xyzzynotfound');
  assert(document.querySelector('#homeToolResults').textContent.includes('Ingen treff'),'missing empty search state');
  put('homeToolQuery','');
  assert(document.querySelector('#homeToolResults').hidden,'empty search should stay compact');
  assert(document.querySelector('#homeToolSearch').nextElementSibling.id==='vurdering','NEWS2 assessment must immediately follow search');

  assert(!!document.querySelector('#actionDock #dockScore'),'sticky score button missing');
  assert(!!document.querySelector('#actionDock #dockIsbar'),'sticky ISBAR button missing');
  assert(!!document.querySelector('#actionDock #dockSave'),'sticky save button missing');
  document.querySelector('[data-page=vurdering]').click();
  document.activeElement?.blur();
  assert(getComputedStyle(document.querySelector('#actionDock')).position==='fixed','action dock must stay fixed on scroll');
  assert(getComputedStyle(document.querySelector('#actionDock')).display!=='none','action dock should be visible on assessment page');
  document.querySelector('#dockIsbar').click();
  assert(document.querySelector('#isbarDialog').open,'sticky ISBAR action does not open script');
  document.querySelector('#closeIsbar').click();
  document.querySelector('[data-page=historikk]').click();
  assert(getComputedStyle(document.querySelector('#actionDock')).display==='none','action dock must hide on history page');
  document.querySelector('[data-page=vurdering]').click();
  // v0.8.1: original compact NEWS2-first form and score cards restored.
  assert(document.querySelectorAll('#vitalsForm .v08-field-group').length===0,'v0.8 oversized field groups should be gone');
  assert(document.querySelectorAll('#vitalsForm > .form-inner > .fields > .field').length>=9,'compact original fields not restored');
  assert(!document.querySelector('#v08NewsViz'),'expanded NEWS2 detail visualization should be absent');
  // BMI/BSA is retained, reachable from the compact home search.
  assert(!!document.querySelector('.v08-bmi-card'),'BMI/BSA card missing');
  put('homeToolQuery','bmi');
  assert(document.querySelector('#homeToolResults').textContent.includes('BMI / BSA'),'BMI missing from home search');
  document.querySelector('#homeToolResults button').click();
  assert(document.querySelector('#bodyCalcDialog').open,'BMI dialog failed to open');
  put('bodyHeight','180');put('bodyWeight','80');
  document.querySelector('#bodyCalcForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  const bodyCalc=document.querySelector('#bodyCalcResult');
  assert(!bodyCalc.hidden,'BMI/BSA result not displayed');
  assert(bodyCalc.textContent.includes('24,7'),'BMI must be 24,7 for 180cm and 80kg');
  assert(bodyCalc.textContent.includes('2,00'),'BSA must be 2,00 for 180cm and 80kg');
  document.querySelector('#bodyCalcClose').click();
  // v0.8: respiration stopwatch controls and default settings.
  document.querySelector('#respTimerLaunch').click();
  assert(document.querySelector('#respTimerDialog').open,'respiration timer did not open');
  assert(document.querySelector('input[name=respDuration][value="60"]').checked,'60 seconds must be default');
  assert(!document.querySelector('#respSound').checked,'sound should default off');
  const progress=document.querySelector('#respTimerProgress');
  const pathBg=document.querySelector('#respTimerBase');
  const geo=document.querySelector('#respTimerGeometry');
  assert(!!progress&&!!pathBg&&!!geo,'SVG countdown geometry missing');
  assert(geo.dataset.shape==='circle','60s must show full circle');
  assert(progress.getAttribute('d')===pathBg.getAttribute('d'),'progress track and stroke must use identical geometry');
  assert(progress.getTotalLength()>300,'circle should have a full circumference');
  assert(Number(progress.style.strokeDashoffset)>0,'new countdown must start empty');
  document.querySelector('input[name=respDuration][value="30"]').click();
  assert(geo.dataset.shape==='semicircle','30s must show semicircle');
  assert(document.querySelector('#respCountdown').textContent.includes('30'),'30s countdown failed');
  assert(progress.getTotalLength()>200&&progress.getTotalLength()<300,'30s arc should be half a circle');
  document.querySelector('input[name=respDuration][value="15"]').click();
  assert(geo.dataset.shape==='line','15s must show straight line');
  assert(progress.getAttribute('d').includes(' H '),'15s progress must use a horizontal SVG path');
  assert(document.querySelector('#respCountdown').textContent.includes('15'),'15s setting failed');
  document.querySelector('#respStart').click();
  assert(!document.querySelector('#respTap').disabled,'breath counter disabled while running');
  document.querySelector('#respTap').click();
  document.querySelector('#respTap').click();
  assert(document.querySelector('#respBreaths').textContent==='2','breaths not incremented');
  document.querySelector('#respPause').click();
  assert(document.querySelector('#respPhase').textContent==='Pauset','pause button failed');
  assert(document.querySelector('#respTap').disabled,'counter active during pause');
  document.querySelector('#respReset').click();
  assert(document.querySelector('#respBreaths').textContent==='0','counter did not reset');
  assert(document.querySelector('#respTimerResult').hidden,'reset should clear timer result');
  document.querySelector('#respClose').click();
  assert(!document.querySelector('#respTimerDialog').open,'timer dialog failed to close');
  // Regression: obsolete FAQ removed without removing NEWS2 / qSOFA results.
  assert(![...document.querySelectorAll('#resultater details summary')].some(el=>el.textContent.includes('Hvorfor vises ikke GCS og 4AT automatisk?')),'old GCS / 4AT FAQ should be removed');
  assert(!!document.querySelector('#newsCard')&&!!document.querySelector('#qCard'),'original scores must remain');
  // Entire NEWS2 with a single 3-point RF parameter must show red-parameter alert.
  put('rr','25');put('spo2','97');put('sbp','120');put('hr','80');put('temp','37');
  put('conscious','A');put('oxygen','no');put('scale','1');
  document.querySelector('input[name=confusion][value=no]').click();
  const alert=document.querySelector('#newsClinicalAlert');
  assert(!alert.hidden,'red-score warning not visible');
  assert(alert.dataset.level==='red','wrong alert priority');
  assert(alert.textContent.includes('Respirasjonsfrekvens'),'red-score parameter not named');
  assert(document.querySelector('#newsNumber').textContent==='3','original NEWS2 result should stay correct');
  assert(document.querySelector('#newsBreakdown').textContent.includes('RF 3'),'compact NEWS2 breakdown missing');

  // v0.9: six new standalone home nursing tools. Test search, launch and scoring from actual UI.
  const expected=['mst','tug','esas','ortho','fast','skuv'];
  assert(document.querySelectorAll('.hc-tool-card').length===10,'expected six homecare plus TIMES, palliation, ABCDE and respiration timer');
  for(const id of expected)assert(!!document.querySelector('[data-homecare="'+id+'"]'),'missing homecare tool '+id);
  assert(!document.querySelector('#page-vurdering .hc-tool-card'),'new tools must not expand NEWS2 page');
  assert(document.querySelector('#homeToolSearch').nextElementSibling.id==='vurdering','NEWS2 must remain first main form');
  // Every home search entry opens the correct standalone tool dialog.
  for(const [query,title] of [['mst','MST'],['tug','TUG'],['esas','ESAS-r'],['ortostatisk','Ortostatisk BT'],['fast','FAST'],['skuv','SKUV']]){
    put('homeToolQuery',query);
    assert(!document.querySelector('#homeToolResults').hidden,'home search did not find '+query);
    document.querySelector('#homeToolResults button').click();
    assert(document.querySelector('#homecareDialog').open,'failed to launch '+title);
    assert(document.querySelector('#hcTitle').textContent.startsWith(title),'wrong opened tool for '+query);
    document.querySelector('#homecareDialog .dialog-close').click();
  }
  // MST: unknown weight change yields 2 points and nutritional risk.
  document.querySelector('[data-homecare=mst]').click();
  put('hcMstWeight','unknown');put('hcMstIntake','no');
  document.querySelector('#hcMstForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(document.querySelector('#hcResult').textContent.includes('MST 2 poeng'),'MST score wrong');
  assert(document.querySelector('#hcResult').textContent.includes('risiko for underernæring'),'MST risk not shown');
  put('hcMstWeight','no');
  assert(document.querySelector('#hcResult').hidden,'editing MST must hide stale risk classification');
  document.querySelector('#homecareDialog .dialog-close').click();
  // TUG: manually observed 16s should indicate elevated risk without predicting diagnosis.
  document.querySelector('[data-homecare=tug]').click();
  put('hcTugSeconds','16');
  document.querySelector('#hcTugForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(document.querySelector('#hcResult').textContent.includes('Over 15 sekunder'),'TUG interpretation incorrect');
  put('hcTugSeconds','12');
  assert(document.querySelector('#hcResult').hidden,'editing TUG must hide stale fall-risk classification');
  document.querySelector('#hcTugStart').click();
  assert(!document.querySelector('#hcTugStop').disabled,'TUG stopwatch did not start');
  document.querySelector('#hcTugZero').click();
  assert(document.querySelector('#hcTugClock').textContent.includes('0,0'),'TUG reset failed');
  document.querySelector('#homecareDialog .dialog-close').click();
  // ESAS-r: nine independent dimensions, mandatory review and optional extra.
  document.querySelector('[data-homecare=esas]').click();
  assert(document.querySelectorAll('.hc-esas-item').length===10,'ESAS-r must have 9 core plus optional symptom');
  document.querySelector('#hcEsasForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(document.querySelector('#hcResult').textContent.includes('Ugyldig eller manglende'),'incomplete ESAS-r should be rejected');
  for(const el of document.querySelectorAll('.hc-esas-list .hc-esas-item:not([data-symptom=other]) .hc-esas-number'))put(el.id,'4');
  document.querySelector('#hcEsasForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(document.querySelector('#hcResult').textContent.includes('ESAS-r – symptomer nå'),'complete ESAS-r not shown');
  assert(!document.querySelector('#hcResult').textContent.includes('totalskår'),'ESAS-r must not show an aggregate score');
  put('hcEsasNumber_smerte','6');
  assert(document.querySelector('#hcResult').hidden,'editing ESAS-r must hide stale symptom assessment');
  document.querySelector('#homecareDialog .dialog-close').click();
  // Orthostatic BP: 20/10 difference marked and missing standing observations rejected.
  document.querySelector('[data-homecare=ortho]').click();
  put('hcOBaseSys','130');put('hcOBaseDia','80');put('hcO3Sys','110');put('hcO3Dia','70');
  document.querySelector('#hcOrthoForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(document.querySelector('#hcResult').textContent.includes('Etter 3 minutter'),'orthostatic 3-minute calculation missing');
  assert(document.querySelector('#hcResult').textContent.includes('20 mmHg'),'orthostatic threshold not explained');
  put('hcO3Sys','120');
  assert(document.querySelector('#hcResult').hidden,'editing orthostatic BP must hide stale BP-drop interpretation');
  document.querySelector('#homecareDialog .dialog-close').click();
  // FAST: 113 must be prominently visible, no negative/exclusion score.
  document.querySelector('[data-homecare=fast]').click();
  assert(document.querySelector('.hc-emergency').textContent.includes('Ring 113'),'FAST emergency guidance missing');
  assert(document.querySelectorAll('.hc-fast-line').length===4,'FAST has to show F/A/S/T');
  document.querySelector('#homecareDialog .dialog-close').click();
  // SKUV: switches systems without collecting patient data.
  document.querySelector('[data-homecare=skuv]').click();
  assert(document.querySelectorAll('.hc-tab').length>=4,'SKUV system tabs missing');
  document.querySelectorAll('.hc-tab')[2].click();
  assert(document.querySelector('#hcSKUVPanel').textContent.includes('Nevrologi'),'SKUV tab failed');
  assert(!document.querySelector('#homecareDialog input'),'SKUV should not collect patient data');
  document.querySelector('#homecareDialog .dialog-close').click();
  // v0.9.1: two new independent tools are available without changing NEWS2.
  assert(!!document.querySelector('[data-homecare-card=times]'),'TIMES card missing');
  assert(!!document.querySelector('[data-homecare-card=pall]'),'Palliative care card missing');
  put('homeToolQuery','times');
  assert(document.querySelector('#homeToolResults button').textContent.includes('TIMES'),'TIMES not searchable');
  document.querySelector('#homeToolResults button').click();
  assert(document.querySelector('#timesDialog').open,'TIMES dialog did not open');
  assert(document.querySelectorAll('.times-v091-tab').length===5,'TIMES must have five evaluation areas');
  document.querySelector('#timesTabM').click();
  assert(document.querySelector('#timesPanel').textContent.includes('sårvæske'),'TIMES M guide failed');
  put('timesLength','20');put('timesWidth','30');put('timesDepth','4');
  document.querySelector('#timesMeasureForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(document.querySelector('#timesMeasurementResult').textContent.includes('6 cm²'),'wound rectangle estimate incorrect');
  const ruler=document.querySelector('#timesRulerSvg');
  assert(!!ruler,'calibratable ruler SVG missing');
  const widthBefore=Number(ruler.getAttribute('width'));
  put('timesCardScale','300');
  const widthAfter=Number(ruler.getAttribute('width'));
  assert(widthAfter>widthBefore,'ruler ticks not scaled after calibration');
  assert(document.querySelector('#timesReference').style.height==='300px','portrait card height was not updated');
  assert(document.querySelector('#timesCardScale').max==='620','calibration range must support large mobile card display');
  assert(!!document.querySelector('.times-v099-reference-scroll'),'portrait calibration card must not overflow the page');
  assert(document.querySelector('#timesReference').style.width==='189px','portrait card width must match 53,98 / 85,60 ratio');
  put('timesCardScale','620');
  assert(document.querySelector('#timesReference').style.height==='620px','expanded mobile calibration range broken');
  assert(document.querySelector('.times-v099-reference-scroll').scrollWidth>=document.querySelector('.times-v099-reference-scroll').clientWidth,'large reference must be contained in scrollable area');
  assert(document.querySelector('.times-v091-ruler').textContent.includes('STÅENDE'),'TIMES must say bankkort stående');
  document.querySelector('#timesDialog .dialog-close').click();
  assert(!document.querySelector('#timesDialog').open,'TIMES dialog did not close');
  put('homeToolQuery','myoklonier');
  assert(document.querySelector('#homeToolResults').textContent.includes('Muskelrykninger'),'palliative myoclonus shortcut missing');
  document.querySelector('#homeToolResults button').click();
  assert(document.querySelector('#palliationDialog').open,'palliative care guide failed to open');
  assert(document.querySelector('#pallArticle h3').textContent==='Muskelrykninger / myoklonier','myoclonus deep link failed');
  assert(document.querySelector('#pallArticle').textContent.toLocaleLowerCase('nb-NO').includes('midazolam'),'symptom-specific medicine context not displayed');
  assert(!document.querySelector('#palliationDialog input[type=number]'),'palliation guide should not collect patient-specific readings');
  put('pallSymptomSearch','uro');
  assert(document.querySelectorAll('#pallTopicList .pall-topic').length>=1,'symptom filter failed');
  document.querySelector('#palliationDialog .dialog-close').click();
  assert(!document.querySelector('#palliationDialog').open,'palliation dialog failed to close');
  assert(!document.querySelector('#page-vurdering .times-v091-card')&&!document.querySelector('#page-vurdering .pall-v091-card'),'new cards must not appear on NEWS2-first landing page');
  // v0.99 categories: group counts, combined search, and previously hidden cards restored.
  assert(document.querySelectorAll('#page-verktoy .v099-category-heading').length===3,'three category headings missing');
  assert(document.querySelectorAll('#libraryCategories button').length===4,'category selector incomplete');
  assert(window.KartleggToolCategories.total===16,'expected 16 tools including ABCDE and respiration timer');
  const toolGrid=document.querySelector('#page-verktoy .toolgrid');
  const allCards=[...toolGrid.querySelectorAll('.toolbox')];
  assert(allCards.every(x=>['assess','calc','guide'].includes(x.dataset.toolCategory)),'uncategorized cards found');
  document.querySelector('[data-category=calc]').click();
  const calcCards=[...toolGrid.querySelectorAll('.toolbox:not([hidden])')];
  const counts={assess:8,calc:3,guide:5};
  for(const [id,want] of Object.entries(counts)){
    document.querySelector('[data-category="'+id+'"]').click();
    assert([...toolGrid.querySelectorAll('.toolbox:not([hidden])')].length===want,'category '+id+' expected '+want+' tools');
  }
  document.querySelector('[data-category=calc]').click();
  assert(calcCards.length===3,'calculator group must include BMI, orthostatic BP and respiratory timer');
  assert(calcCards.every(x=>x.dataset.toolCategory==='calc'),'wrong card shown in calculator category');
  put('toolSearch','ortostatisk');
  assert([...toolGrid.querySelectorAll('.toolbox:not([hidden])')].length===1,'category and text search must work together');
  assert(document.querySelector('[data-tool-category=calc]:not([hidden]) h3').textContent.includes('Ortostatisk'),'orthostatic tool missing in filtered category');
  document.querySelector('[data-category=all]').click();
  put('toolSearch','');
  assert([...toolGrid.querySelectorAll('.toolbox:not([hidden])')].length===16,'re-filtering must restore all 16 cards');
  assert(!document.querySelector('#page-vurdering .v099-categories'),'categories must not clutter NEWS2 front page');

  // v0.99 ABCDE: launch from compact search and navigate A through E safely.
  put('homeToolQuery','abcde');
  assert(document.querySelector('#homeToolResults button').textContent.includes('ABCDE'),'ABCDE not searchable from home');
  document.querySelector('#homeToolResults button').click();
  assert(document.querySelector('#abcdeDialog').open,'ABCDE did not open');
  assert(document.querySelectorAll('#abcdeDialog [role=tab]').length===5,'ABCDE must expose A/B/C/D/E');
  assert(document.querySelector('#abcdeStagePanel').textContent.includes('Airway'),'initial ABCDE stage must be A');
  assert(document.querySelector('#abcdeTabA').getAttribute('aria-selected')==='true','A tab selected state missing');
  assert(document.querySelector('.abcde-v099-emergency').textContent.includes('113'),'acute emergency guidance must be prominent');
  document.querySelector('#abcdeNext').click();
  assert(document.querySelector('#abcdeStagePanel').textContent.includes('Breathing'),'ABCDE next step B failed');
  document.querySelector('#abcdeTabD').click();
  assert(document.querySelector('#abcdeStagePanel').textContent.includes('Nevrologisk status'),'ABCDE direct D navigation failed');
  document.querySelector('#abcdeTabE').click();
  assert(document.querySelector('#abcdeStagePanel').textContent.includes('Exposure'),'ABCDE stage E failed');
  document.querySelector('#abcdeNext').click();
  assert(document.querySelector('#abcdeStagePanel').textContent.includes('Airway'),'ABCDE loop back to A failed');
  assert(!document.querySelector('#abcdeDialog input'),'ABCDE must not collect patient data');
  document.querySelector('#abcdeDialog .dialog-close').click();
  assert(!document.querySelector('#abcdeDialog').open,'ABCDE dialog did not close');
  assert(!document.querySelector('#page-vurdering .abcde-v099-card'),'ABCDE must remain in tool library');
  // The timer has a library launch too (in addition to the NEWS2 RR field).
  document.querySelector('#launchRespTimer').click();
  assert(document.querySelector('#respTimerDialog').open,'respiration timer library launch failed');
  document.querySelector('#respClose').click();
  // v0.99.1: service themes are visual presets in the profile; NEWS2 structure unchanged.
  const profileButton=document.querySelector('#profileTrigger');
  assert(!!profileButton,'profile trigger missing');
  assert(profileButton.tagName==='BUTTON'&&profileButton.type==='button','profile shortcut must be a native button');
  assert(profileButton.getAttribute('aria-label')==='Åpne profil og utseende','profile shortcut needs meaningful accessible name');
  assert(profileButton.getAttribute('aria-hidden')!=='true','profile shortcut must not be hidden from assistive technology');
  profileButton.click();
  const profileDialog=document.querySelector('#profileDialog');
  assert(profileDialog.open,'profile drawer did not open');
  assert(profileDialog.querySelectorAll('[name=serviceTheme]').length===5,'4 service presets plus custom are required');
  const root=document.documentElement;
  const preset=(id,mode,accent)=>{
   const radio=profileDialog.querySelector('[name=serviceTheme][value="'+id+'"]');
   assert(!!radio,'missing preset '+id);
   radio.click();
   assert(root.dataset.serviceTheme===id,'preset not selected '+id);
   assert(root.dataset.theme===mode,'wrong recommended day/night for '+id);
   assert(getComputedStyle(root).getPropertyValue('--accent').trim().toLowerCase()===accent,'incorrect accent for '+id);
   assert(radio.checked,'radio state not synced for '+id);
   const button=getComputedStyle(document.querySelector('#launchABCDE'));
   assert(button.backgroundColor!=='rgba(0, 0, 0, 0)'&&button.color!=='rgba(0, 0, 0, 0)','primary button not visible in '+id);
  };
  preset('hospital','light','#006edb');
  preset('ambulance','dark','#ffff00');
  assert(getComputedStyle(document.querySelector('#launchABCDE')).backgroundColor==='rgb(255, 255, 0)','prehospital primary control must be bright neon');
  preset('urgent','dark','#ffcc00');
  assert(getComputedStyle(document.querySelector('#launchABCDE')).backgroundColor==='rgb(255, 204, 0)','legevakt primary control must be vivid yellow');
  preset('homecare','light','#117c76');
  // Existing custom theme combinations remain selectable and survive preset switches.
  profileDialog.querySelector('[name=accentChoice][value=blue]').click();
  assert(root.dataset.serviceTheme==='custom','manual accent choice should return to custom');
  assert(root.dataset.accent==='blue','existing custom accent no longer works');
  profileDialog.querySelector('[name=appearanceMode][value=dark]').click();
  assert(root.dataset.theme==='dark','manual dark mode no longer works');
  profileDialog.querySelector('[name=appearanceMode][value=light]').click();
  assert(root.dataset.theme==='light','manual light mode no longer works');
  profileDialog.querySelector('[name=serviceTheme][value=ambulance]').click();
  document.querySelector('#themeToggle').click();
  assert(root.dataset.serviceTheme==='custom','header day/night switch should exit a service preset');
  assert(root.dataset.theme==='light','header day/night switch should turn from prehospital dark to light');
  // Appearance-only persistence; no patient measurements in theme preferences.
  try{
   const stored=JSON.parse(localStorage.getItem('kartlegg.appearance.v06')||'{}');
   assert(stored.service==='custom'&&stored.mode==='light','appearance preferences were not saved');
   assert(!('rr' in stored)&&!('spo2' in stored),'clinical measurements should never be stored in appearance prefs');
  }catch(error){if(!(error instanceof DOMException&&error.name==='SecurityError'))throw error}
  // Theme picker previews reflect the chosen service rather than generic accent blocks.
  for(const id of ['hospital','ambulance','urgent','homecare']){
   const preview=profileDialog.querySelector('[data-service-option="'+id+'"] .service-theme-preview');
   assert(!!preview,'missing preview for '+id);
   assert(getComputedStyle(preview,'::before').backgroundImage!=='none','missing miniature header-pattern preview for '+id);
  }
  // v0.99.2: header identity patterns and replacement of old blue utility surfaces.
  const ribbon=document.getElementById('themeTopRibbon');
  assert(!!ribbon,'full-width service header ribbon missing');
  const headerWidth=document.querySelector('.header').getBoundingClientRect().width;
  // The ribbon is deliberately hidden while the Egendefinert theme is active.
  const visibleRibbon=()=>getComputedStyle(ribbon).display!=='none';
  const color=el=>getComputedStyle(el).backgroundColor;
  const rootToken=k=>getComputedStyle(root).getPropertyValue(k).trim();
  const meta=document.querySelector('.meta-line');
  const unit=document.querySelector('#rr').closest('.field').querySelector('.unit');
  const datainput=document.querySelector('#measureDate');
  const chip=document.querySelector('#page-vurdering .chip');
  const clinical=document.querySelector('.score.danger');
  // Danger score colors must not get converted into theme accents.
  const baselineClinical=clinical?color(clinical):null;
  for(const id of ['hospital','ambulance','urgent','homecare']){
   profileDialog.querySelector('[name=serviceTheme][value="'+id+'"]').click();
   assert(visibleRibbon(),'service '+id+' must have a visible top decoration');
   assert(Math.abs(ribbon.getBoundingClientRect().width-headerWidth)<2,'ribbon width broken for '+id);
   assert(color(meta)!=='rgb(27, 52, 77)','legacy blue date/time panel still active for '+id);
   assert(color(meta)!=='rgb(27, 52, 77)','theme meta panel must not be legacy blue');
   assert(color(unit)!=='rgb(27, 52, 77)','legacy blue unit background persists in '+id);
   assert(color(datainput)!=='rgb(23, 46, 69)','legacy dark blue date input remains in '+id);
   assert(color(chip)!=='rgb(27, 52, 77)','legacy blue version badge remains in '+id);
   assert(getComputedStyle(document.querySelector('#rr')).color!== 'rgb(22, 47, 75)','old navy input text remains in '+id);
   if(clinical)assert(color(clinical)===baselineClinical,'clinical danger colors must not change with '+id);
  }
  profileDialog.querySelector('[name=serviceTheme][value="hospital"]').click();
  assert(getComputedStyle(ribbon,'::before').backgroundImage.includes('svg'),'hospital header must show clinical pulse pattern');
  profileDialog.querySelector('[name=serviceTheme][value="ambulance"]').click();
  assert(getComputedStyle(ribbon).backgroundImage.includes('conic-gradient'),'prehospital header must have green/silver reflective checkerboard');
  profileDialog.querySelector('[name=serviceTheme][value="urgent"]').click();
  assert(getComputedStyle(ribbon).backgroundImage.includes('repeating-linear-gradient'),'legevakt header needs yellow triage stripes');
  profileDialog.querySelector('[name=serviceTheme][value="homecare"]').click();
  assert(getComputedStyle(ribbon,'::after').content.includes('🚗'),'homecare header requires a car symbol');
  // Only explicit profile SAVE activates the Maritha mode, not input typing.
  assert(!document.querySelector('#marithaPopup').open,'Easter egg popup must start closed');
  put('profileName','  MaRiThA  ');
  assert(root.dataset.marithaMode!=='on','typing a name must not activate Easter egg');
  document.querySelector('#saveProfile').click();
  assert(root.dataset.marithaMode==='on','saving Maritha must activate heart mode');
  assert(document.querySelector('#marithaPopup').open,'Maritha confirmation popup did not open');
  assert(document.querySelector('#marithaPopupTitle').textContent.includes('Maritha-modus aktivert'),'missing Maritha announcement');
  assert(getComputedStyle(ribbon).backgroundImage.includes('svg'),'Maritha header must display heart pattern');
  assert(Math.abs(ribbon.getBoundingClientRect().width-headerWidth)<2,'Maritha hearts must span full header width');
  document.querySelector('#closeMarithaPopup').click();
  assert(!document.querySelector('#marithaPopup').open,'Maritha popup cannot be dismissed');
  // An explicitly saved Maritha profile may persist only when the normal opt-in is checked.
  put('profileName','Maritha');
  document.querySelector('#rememberProfile').checked=true;
  document.querySelector('#saveProfile').click();
  assert(root.dataset.marithaMode==='on','hearts must stay active for saved Maritha');
  try{
   const storedName=JSON.parse(localStorage.getItem('kartlegg.sender.v03')||'null');
   assert(storedName?.name==='Maritha','existing optional profile storage did not retain name');
  }catch(error){if(!(error instanceof DOMException&&error.name==='SecurityError'))throw error}
  profileDialog.querySelector('[name=serviceTheme][value="urgent"]').click();
  assert(root.dataset.marithaMode==='on','hearts must be compatible with different service themes');
  put('profileName','Kari');
  assert(root.dataset.marithaMode==='on','unsaved changes should not deactivate Easter egg');
  document.querySelector('#saveProfile').click();
  assert(root.dataset.marithaMode!=='on','saving a different name should remove hearts');
  put('profileName','Maritha');document.querySelector('#saveProfile').click();
  if(document.querySelector('#marithaPopup').open)document.querySelector('#closeMarithaPopup').click();
  document.querySelector('#clearProfile').click();
  assert(root.dataset.marithaMode!=='on','clearing profile should disable Easter egg');
  assert(!document.querySelector('#marithaPopup').open,'clearing profile must close Maritha popup');
  // Name-based cosmetic modes are exclusive, activate only on explicit save, and preserve risk visuals.
  const personalPopup=document.querySelector('#personalModePopup');
  assert(!!personalPopup&&!!window.KartleggPersonalModes,'personal mode module missing');
  const riskCard=document.querySelector('#newsCard');
  const initialRiskScore=getComputedStyle(riskCard).backgroundColor;
  const riskAlert=document.querySelector('#newsClinicalAlert');
  const initialRiskAlert=getComputedStyle(riskAlert).backgroundColor;
  const primaryButton=document.querySelector('#launchABCDE');
  const pageColors={
   kristian:{header:'rgb(100, 15, 37)',button:'rgb(255, 255, 255)',panel:'rgb(255, 253, 253)'},
   kent:{header:'rgb(10, 37, 73)',button:'rgb(248, 204, 71)',panel:'rgb(248, 252, 251)'},
   philip:{header:'rgb(8, 28, 45)',panel:'rgb(248, 251, 250)'}
  };
  for(const [name,mode,title] of [
   ['Kristian Bøe','kristian','Kristian-modus aktivert'],
   ['Kent Ole Hansen','kent','Kent-modus aktivert'],
   ['Philip Aasen','philip','Philip-modus aktivert']
  ]){
   put('profileName',name);
   assert(root.dataset.personalMode!==mode,'typing cannot activate '+mode);
   document.querySelector('#saveProfile').click();
   assert(root.dataset.personalMode===mode,'wrong activated personal mode '+mode);
   assert(personalPopup.open,'missing personal mode popup '+mode);
   assert(document.querySelector('#personalModeTitle').textContent===title,'wrong personal popup title');
   assert(getComputedStyle(ribbon).backgroundImage.includes('svg'),'missing SVG ribbon '+mode);
   assert(Math.abs(ribbon.getBoundingClientRect().width-headerWidth)<2,'personal ribbon not full header width '+mode);
   const strip=ribbon.getBoundingClientRect();
   const logo=document.querySelector('.header .logo').getBoundingClientRect();
   const avatar=document.querySelector('#profileTrigger').getBoundingClientRect();
   const collision=box=>strip.left<box.right-1&&strip.right>box.left+1&&strip.top<box.bottom-1&&strip.bottom>box.top+1;
   assert(!collision(logo),'header banner overlaps or clips Kartlegg logo in '+mode);
   assert(!collision(avatar),'header banner overlaps or clips profile avatar in '+mode);
   assert(strip.bottom<=document.querySelector('.header').getBoundingClientRect().bottom+1,'banner extends below header in '+mode);

   const palette=pageColors[mode];
   assert(getComputedStyle(document.querySelector('.header')).backgroundColor===palette.header,'header must switch to immersive '+mode+' palette');
   assert(getComputedStyle(document.body).backgroundImage.includes('radial-gradient'),'main page must have substantial '+mode+' colored backdrop');
   assert(getComputedStyle(document.querySelector('#vurdering')).backgroundColor===palette.panel,'content surface wrong for '+mode);
   assert(getComputedStyle(document.querySelector('.sidebar')).backgroundImage.includes('linear-gradient'),'side navigation should switch theme for '+mode);
   if(mode==='philip'){
    assert(getComputedStyle(primaryButton).backgroundImage.includes('linear-gradient'),'founder gold action gradient missing');
   }else{
    assert(getComputedStyle(primaryButton).backgroundColor===palette.button,'primary button color wrong for '+mode);
   }
   assert(getComputedStyle(riskCard).backgroundColor===initialRiskScore,'personal mode changed clinical score background '+mode);
   assert(getComputedStyle(riskAlert).backgroundColor===initialRiskAlert,'personal mode changed clinical alert background '+mode);
   document.querySelector('#closePersonalMode').click();
  }
  put('profileName','Kristian');
  document.querySelector('#saveProfile').click();
  assert(!root.dataset.personalMode,'partial name must not trigger personal mode');
  put('profileName','Kristian Bøe');
  document.querySelector('#saveProfile').click();
  assert(root.dataset.personalMode==='kristian','matching full name must work again');
  document.querySelector('#closePersonalMode').click();
  document.querySelector('#clearProfile').click();
  assert(!root.dataset.personalMode&&!personalPopup.open,'clearing profile must disable personal decoration');
  assert(!!document.querySelector('#newsCard')&&!!document.querySelector('#qCard'),'theme decorations must not disturb clinical score cards');
  document.querySelector('#closeProfile').click();
  assert(!profileDialog.open,'profile drawer did not close');
  assert(document.querySelector('#homeToolSearch').nextElementSibling.id==='vurdering','service themes must not alter NEWS2 positioning');
  // v0.99.3: About Kartlegg page explains authorship, purpose and actual storage guarantees.
  const aboutNav=document.querySelector('[data-page=om]');
  assert(!!aboutNav,'About Kartlegg sidebar navigation missing');
  aboutNav.click();
  const about=document.querySelector('#page-om');
  assert(!!about&&!about.hidden,'About page did not open');
  assert(location.hash==='#om','About page navigation URL/hash incorrect');
  assert(aboutNav.getAttribute('aria-current')==='page','About navigation active state missing');
  assert(document.querySelector('#page-vurdering').hidden,'NEWS2 must be hidden while About page active');
  assert(about.textContent.includes('Philip Aasen'),'developer attribution missing');
  assert(about.textContent.includes('Høgskulen på Vestlandet'),'educational background missing');
  assert(about.textContent.includes('NEWS2 og qSOFA'),'project motivation text missing');
  const storage=about.querySelector('.about-v0993-storage');
  assert(!!storage,'profile and measurement data explainer missing');
  assert(storage.textContent.includes('lokalt i nettleseren'),'opt-in profile storage not explained');
  assert(storage.textContent.includes('ikke lagret varig'),'temporary session-only measurement storage not explained');
  assert(storage.textContent.includes('Ikke registrer ekte pasientopplysninger'),'patient data warning missing');
  assert(about.textContent.includes('ikke uavhengig klinisk validert'),'clinical prototype caveat missing');
  // Hash route must support opening About after a hard refresh.
  document.querySelector('[data-page=vurdering]').click();
  location.hash='#om';
  window.dispatchEvent(new Event('hashchange'));
  assert(!about.hidden,'direct #om deep link failed');
  document.querySelector('[data-page=vurdering]').click();
  assert(!document.querySelector('#page-vurdering').hidden,'returning to NEWS2 from About failed');
  assert(document.querySelector('#homeToolSearch').nextElementSibling.id==='vurdering','About changes must not reorder NEWS2 form');
  // v1.0 RC1 – mobile navigation must be above search and sticky actions.
  if(matchMedia('(max-width:770px)').matches){
   const toggle=document.querySelector('#menuButton'),sidebar=document.querySelector('#sidebar'),backdrop=document.querySelector('#backdrop');
   const dock=document.querySelector('#actionDock'),main=document.querySelector('main');
   assert(getComputedStyle(toggle).display!=='none','hamburger must be visible at the mobile breakpoint');
   toggle.click();
   assert(sidebar.classList.contains('open'),'mobile drawer did not open');
   assert(backdrop.classList.contains('open'),'mobile menu scrim missing');
   assert(toggle.getAttribute('aria-expanded')==='true','menu expanded state not updated');
   assert(main.inert,'page behind an open drawer must be inert');
   assert(document.body.classList.contains('mobile-menu-open'),'background scroll lock missing');
   assert(getComputedStyle(document.body).overflow==='hidden','page can still scroll behind mobile drawer');
   assert(getComputedStyle(dock).display==='none','sticky action dock must not cover mobile menu');
   assert(Number(getComputedStyle(sidebar).zIndex)>Number(getComputedStyle(document.querySelector('#homeToolSearch')).zIndex),'sidebar layers below search');
   assert(Number(getComputedStyle(backdrop).zIndex)>Number(getComputedStyle(document.querySelector('#homeToolSearch')).zIndex),'backdrop layers below search');
   const sidebarRect=sidebar.getBoundingClientRect(),searchRect=document.querySelector('#homeToolSearch').getBoundingClientRect();
   const sampleX=Math.min(sidebarRect.right-20,sidebarRect.left+70);
   const sampleY=Math.max(sidebarRect.top+20,Math.min(sidebarRect.bottom-20,searchRect.top+20));
   assert(sidebar.contains(document.elementFromPoint(sampleX,sampleY)),'home search is painted on top of open mobile navigation');
   const first=sidebar.querySelector('.nav'),last=[...sidebar.querySelectorAll('.nav')].at(-1);
   assert(document.activeElement===first,'keyboard focus did not move into mobile menu');
   window.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,cancelable:true}));
   assert(document.activeElement===toggle,'Shift+Tab must reach menu button');
   window.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,cancelable:true}));
   assert(document.activeElement===last,'Shift+Tab must wrap to last menu entry');
   window.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',cancelable:true}));
   assert(document.activeElement===toggle,'Tab at last item must wrap to toggle');
   window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',cancelable:true}));
   assert(!sidebar.classList.contains('open'),'Escape did not close mobile menu');
   assert(!main.inert&&!document.body.classList.contains('mobile-menu-open'),'menu closing did not restore the assessment');
   assert(document.activeElement===toggle,'Escape should return focus to menu toggle');
   toggle.click();sidebar.querySelector('[data-page=om]').click();
   assert(!document.querySelector('#page-om').hidden,'mobile navigation could not open About page');
   assert(!sidebar.classList.contains('open')&&!main.inert,'navigating must close mobile menu cleanly');
   document.querySelector('[data-page=vurdering]').click();
   toggle.click();
   sidebar.querySelector('[data-page=profil]').click();
   assert(!sidebar.classList.contains('open'),'opening profile should close the mobile navigation');
   assert(!main.inert&&!document.body.classList.contains('mobile-menu-open'),'profile dialog should restore mobile background state');
   assert(document.querySelector('#profileDialog').open,'profile navigation should open profile dialog');
   document.querySelector('#closeProfile').click();
   const actionWidth=dock.getBoundingClientRect().width;
   if(matchMedia('(max-width:620px)').matches){
    assert(Math.abs(actionWidth-document.documentElement.clientWidth)<4,'phone action bar should match viewport width');
   }else{
    assert(actionWidth<document.documentElement.clientWidth,'tablet action bar should remain centered and compact');
   }
   assert([...dock.querySelectorAll('button')].every(b=>b.getBoundingClientRect().height>=44),'mobile action buttons too small');
   assert(document.documentElement.scrollWidth<=document.documentElement.clientWidth+3,'horizontal viewport overflow on mobile');
  }
  // Even on desktop, the search and scoring layout must survive the release cleanup.
  assert(document.querySelectorAll('#vitalsForm .field').length>=9,'NEWS2 field structure changed');
  assert(document.querySelector('#newsNumber')&&document.querySelector('#qNumber'),'NEWS2/qSOFA outputs missing');
  // v1.0 RC2: GCS is optional, collapsible and supports clinical-tool GCS transfer.
  assert(!!window.KartleggFinalPolish,'release polish module not loaded');
  assert(document.querySelector('#scale').closest('.field').textContent.includes('bekreftet hyperkapnisk respirasjonssvikt'),'NEWS2 scale 2 eligibility must be visible');
  const gcsDisclosure=document.querySelector('#optionalGCS');
  assert(gcsDisclosure&&gcsDisclosure.contains(document.querySelector('#gcs')),'GCS progressive disclosure missing');
  assert(gcsDisclosure.textContent.includes('valgfritt'),'GCS must be clearly optional');
  const nowBtn=document.querySelector('#setMeasurementNow');
  assert(!!nowBtn,'timestamp Now action missing');
  put('measureDate','2000-01-01');put('measureTime','03:00');
  nowBtn.click();
  assert(document.querySelector('#measureDate').value!=='2000-01-01','Now action did not set local date');
  assert(/^\d{2}:\d{2}$/.test(document.querySelector('#measureTime').value),'Now action did not set time');
  const form=document.querySelector('#vitalsForm'),fieldIds=['rr','spo2','sbp','hr','temp'];
  fieldIds.forEach(id=>put(id,''));
  put('gcs','');put('conscious','');put('oxygen','');
  form.querySelectorAll('[name=confusion]').forEach(i=>i.checked=false);
  gcsDisclosure.open=false;
  form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  const validation=document.querySelector('#v10ValidationSummary');
  assert(!validation.hidden,'missing required NEWS2 measurements must trigger summary; errors='+JSON.stringify(window.KartleggFinalPolish.listErrors(false))+' html='+validation.outerHTML.slice(0,300)+' notice='+document.querySelector('#formNotice').textContent);
  assert(validation.textContent.includes('Respirasjonsfrekvens')&&validation.textContent.includes('Nyoppstått forvirring'),'summary must name missing fields');
  assert(document.querySelector('#rr').getAttribute('aria-invalid')==='true','missing field must be marked invalid');
  assert(!validation.textContent.includes('GCS'),'optional blank GCS must not be marked missing');
  assert(!gcsDisclosure.open,'validity check must not force optional GCS open');
  const firstIssue=validation.querySelector('a');
  firstIssue.click();
  assert(document.activeElement===document.querySelector('#rr'),'error link should focus invalid field');
  for(const [id,val] of [['rr','8'],['spo2','97'],['sbp','120'],['hr','80'],['temp','37.0']])put(id,val);
  put('conscious','A');put('oxygen','no');put('scale','1');
  const noConf=form.querySelector('[name=confusion][value=no]');noConf.checked=true;noConf.dispatchEvent(new Event('change',{bubbles:true}));
  put('gcs','16');
  form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(validation.textContent.includes('GCS'),'invalid optional GCS must be reported');
  validation.querySelector('a[href="#gcs"]').click();
  assert(gcsDisclosure.open,'clicking GCS error should open hidden disclosure');
  put('gcs','15');
  form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(validation.hidden,'successful NEWS2 calculation must clear validation summary');
  const scoreParts=document.querySelector('#v10ClinicalParts');
  assert(!scoreParts.hidden,'NEWS2 subscore visualization missing');
  assert(scoreParts.querySelectorAll('.v10-part-score').length===7,'NEWS2 must display all 7 subscore dimensions');
  assert(scoreParts.querySelector('.v10-part-score.critical')?.textContent.includes('3 p'),'3-point critical single parameter must stand out');
  assert(scoreParts.textContent.includes('enkeltparameter'),'clinical single-parameter warning must remain explicit');
  assert(document.querySelector('#newsNumber').textContent==='3','NEWS2 clinical score modified by release polish');
  put('gcs','');
  form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(validation.hidden,'NEWS2 must compute successfully without optional GCS');
  assert(document.querySelector('#newsNumber').textContent==='3','NEWS2 scoring cannot depend on optional GCS');
  assert(document.querySelector('#qStatus').textContent==='GCS mangler','qSOFA must remain appropriately incomplete without GCS');
  assert(document.querySelector('#newsClinicalAlert').textContent.includes('Respirasjonsfrekvens'),'existing red NEWS2 single-parameter alert must remain visible');
  // If another GCS is transferred by the standalone calculator, the field must auto-open.
  gcsDisclosure.open=false;
  put('gcs','14');
  assert(gcsDisclosure.open,'transferring/populating GCS must expand the optional field');
  const mobileButton=document.querySelector('#menuButton');
  assert(mobileButton.querySelector('.v10-menu-symbol')&&mobileButton.querySelector('.v10-menu-label')?.textContent==='Meny','mobile menu must have recognizable icon and label');
  // Ensure original SCORE, and all dialogs, still work after new tools.
  assert(!document.querySelector('#homecareDialog').open,'homecare dialog must close cleanly');
  assert(!errors.length,'JS errors: '+errors.join(';'));
  // Independent theme layers tested at all five viewport widths.
  assert(!!window.KartleggThemeLayers&&!!window.KartleggThemeEngine,'theme module missing');
  document.querySelector('#profileTrigger').click();
  const dlg=document.querySelector('#profileDialog');
  assert(dlg.open,'theme drawer inaccessible');
  const setRadio=(name,value)=>{
   const el=dlg.querySelector('input[name="'+name+'"][value="'+value+'"]');
   assert(!!el,'missing '+name+': '+value);el.checked=true;
   el.dispatchEvent(new Event('change',{bubbles:true}));
  };
  const season=dlg.querySelector('#seasonThemeSelect');
  assert(!!season,'season selector missing');
  const beforeScore=document.querySelector('#newsNumber').textContent;
  setRadio('baseTheme','philip');
  assert(document.documentElement.dataset.baseTheme==='philip'&&document.documentElement.dataset.theme==='dark','Philip glass not applied');
  setRadio('serviceTheme','homecare');
  assert(document.documentElement.dataset.serviceTheme==='homecare'&&document.documentElement.dataset.baseTheme==='philip','theme layers not independent');
  for(const value of ['halloween','christmas','breast-cancer','mental-health','pride']){
   season.value=value;season.dispatchEvent(new Event('change',{bubbles:true}));
   assert(document.documentElement.dataset.seasonTheme===value,'season '+value+' not applied');
   assert(!document.querySelector('#seasonNotice').hidden,'season announcement missing');
  }
  season.value='off';season.dispatchEvent(new Event('change',{bubbles:true}));
  assert(document.querySelector('#seasonNotice').hidden,'season off not respected');
  assert(document.querySelector('#newsNumber').textContent===beforeScore,'theme changed NEWS2');
  assert(document.querySelector('#newsClinicalAlert').textContent.includes('Respirasjonsfrekvens'),'theme changed clinical escalation');
  setRadio('baseTheme','standard');
  assert(document.documentElement.dataset.baseTheme==='standard','standard theme not restored');
  document.querySelector('#closeProfile').click();
  assert(!dlg.open,'theme dialog did not close');
  // v1.1: full registry, favorite toggle, direct URLs and NEWS2↔GCS↔ISBAR switching.
  const tools=window.KartleggToolRegistry,nav=window.KartleggToolNavigation;
  assert(!!tools&&!!nav,'navigation registry or controller not initialized');
  assert(tools.all.length===16,'expected 16 canonical tools');
  assert(document.querySelectorAll('#page-verktoy .toolbox[data-tool-id]').length===16,
    'every clinical card needs one canonical tool id');
  const gcsCard=document.querySelector('#page-verktoy .toolbox[data-tool-id="gcs"]');
  const star=gcsCard?.querySelector('.tool-card-favorite');
  assert(!!star,'GCS favorite control missing');
  const wasFavorite=nav.favorites.includes('gcs');
  star.click();
  assert(nav.favorites.includes('gcs')!==wasFavorite,'favorite click not saved to current state');
  assert(document.querySelector('#toolFavorites').textContent.includes('GCS')||wasFavorite,
    'favorites panel not updated');
  star.click();
  assert(nav.favorites.includes('gcs')===wasFavorite,'favorite toggle not reversible');
  assert(tools.all.every(item=>nav.directLink(item.id)?.includes('tool='+item.id)),
    'every tool requires a shareable direct link');
  assert(nav.directLink('isbar').includes('tool=isbar'),'ISBAR workflow requires direct link');
  assert(nav.open('gcs'),'quick GCS launch failed');
  assert(document.querySelector('#clinicalToolDialog').open,'GCS dialog did not open');
  const toIsbar=[...document.querySelectorAll('#clinicalToolDialog .tool-dialog-switch')].find(b=>b.textContent==='ISBAR');
  assert(!!toIsbar,'GCS to ISBAR switch missing');toIsbar.click();
  assert(document.querySelector('#isbarDialog').open&&!document.querySelector('#clinicalToolDialog').open,
    'GCS to ISBAR switch failed to close original dialog');
  const back=[...document.querySelectorAll('#isbarDialog .tool-dialog-switch')].find(b=>b.textContent==='NEWS2');
  assert(!!back,'ISBAR to NEWS2 switch missing');back.click();
  assert(!document.querySelector('#isbarDialog').open&&!document.querySelector('#page-vurdering').hidden,
    'ISBAR to NEWS2 switch failed');
  assert(nav.open('qsofa'),'qSOFA shortcut failed');
  assert(document.querySelector('#optionalGCS').open&&document.activeElement===document.querySelector('#gcs'),
    'qSOFA should reveal and focus the GCS field');
  assert(!nav.open('fake-tool'),'invalid tool ID must not launch');
  assert(!errors.length,'navigation JS errors: '+errors.join(';'));
  // v0.1 educational simulation: independent, memory-only clinical scenario.
  const simulatedBaseline=document.querySelector('#rr').value;
  document.querySelector('[data-page=simulering]').click();
  assert(!document.querySelector('#page-simulering').hidden,'simulation page route missing');
  assert(!!window.KartleggSimulationPilot&&!!window.KartleggSimulationEngine,'simulation modules not loaded');
  const sim=window.KartleggSimulationPilot,engine=window.KartleggSimulationEngine;
  assert(!sim.started,'simulation should not start without consent');
  assert(document.querySelector('#simulationRoot').textContent.includes('fiktiv'),'simulation warning missing');
  sim.begin();
  assert(sim.started&&sim.state.lastVitals===null,'simulation must hide clinical measurements initially');
  sim.choose('symptoms');
  sim.choose('vitals');
  assert(sim.state.lastVitals.spo2===91,'synthetic first SpO2 reading incorrect');
  assert(document.querySelector('#simulationRoot').textContent.includes('91 %'),'measured vitals not shown');
  const scoreForm=document.querySelector('#simulationRoot .sim-inline-form');
  assert(!!scoreForm,'simulation NEWS2 exercise missing');
  scoreForm.querySelector('input').value='11';
  scoreForm.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(sim.state.enteredNews===11,'simulation NEWS2 answer not captured');
  const formIsbar=document.querySelector('#simulationRoot .sim-isbar-form');
  assert(!!formIsbar,'ISBAR practice missing');
  for(const textarea of formIsbar.querySelectorAll('textarea'))textarea.value='Fiktiv øvingsinformasjon '+textarea.name;
  formIsbar.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  assert(!!sim.state.isbar,'ISBAR exercise text not captured');
  const done=[...document.querySelectorAll('#simulationRoot button')].find(b=>b.textContent.includes('Avslutt og se refleksjon'));
  assert(!!done,'simulation end/debrief button missing');done.click();
  assert(sim.state.finished,'simulation did not finish');
  assert(document.querySelector('#simulationRoot').textContent.includes('11'),'calculated NEWS2 debrief missing');
  assert(document.querySelector('#simulationRoot').textContent.includes('Målinger')||document.querySelector('#simulationRoot').textContent.includes('Observerte vitale'),'debrief checklist missing');
  assert(document.querySelector('#rr').value===simulatedBaseline,'training must not change normal patient assessment');
  document.querySelector('[data-page=vurdering]').click();
  assert(document.querySelector('#page-simulering').hidden,'training page not hidden when navigating away');
  assert(!errors.length,'simulation JS errors: '+errors.join(';'));
  // Kartlegg Lær: guided E/V/M/NT lessons, nine exercises and four full-case exam.
  const gcsTutorial=document.querySelector('#page-verktoy .toolbox[data-tool-id="gcs"] .gcs-learn-card-button');
  assert(!!gcsTutorial,'GCS library card must link to its tutorial');
  gcsTutorial.click();
  assert(!document.querySelector('#page-laer').hidden,'GCS library tutorial link failed');
  assert(window.KartleggLearnPilot.mode==='learn','GCS shortcut should open guided learning');
  document.querySelector('[data-page=laer]').click();
  assert(!document.querySelector('#page-laer').hidden,'GCS learning route missing');
  const learn=window.KartleggLearnPilot,model=window.KartleggGcsLearning;
  assert(!!learn&&!!model,'GCS learning module failed to initialize');
  learn.open('home');
  assert(learn.mode==='home','GCS landing should show learning tracks');
  assert(document.querySelectorAll('#gcsLearningRoot .gcs-learn-mode-card').length===3,'expected three learning levels');
  learn.open('learn');
  assert(learn.mode==='learn','guided lessons not opened');
  for(let i=0;i<6;i++){
   assert(learn.lesson===i,'lesson order incorrect '+i);
   const first=document.querySelector('#gcsLearningRoot .gcs-learn-option');
   assert(!!first,'lesson must have a clickable knowledge check');
   first.click();
   assert(document.querySelector('#gcsLearningRoot .gcs-learn-feedback'),'lesson feedback missing');
   const next=[...document.querySelectorAll('#gcsLearningRoot button')].find(b=>b.textContent.includes('Neste tema')||b.textContent.includes('Fortsett til øving'));
   assert(!!next,'next lesson button missing');next.click();
  }
  assert(learn.mode==='practice','guided lessons should flow to practice');
  for(let i=0;i<model.practice.length;i++){
   assert(learn.practiceIndex===i,'practice order incorrect');
   const q=model.practice[i],opts=model.categories[q.part];
   const correctIndex=opts.findIndex(o=>o.value===q.answer);
   const answers=[...document.querySelectorAll('#gcsLearningRoot .gcs-learn-option')];
   assert(answers.length===opts.length,'incorrect practice choices count');
   answers[correctIndex].click();
   assert(document.querySelector('#gcsLearningRoot .gcs-learn-feedback'),'practice feedback missing');
   const next=[...document.querySelectorAll('#gcsLearningRoot button')].find(b=>b.textContent.includes('Neste oppgave'));
   assert(!!next,'practice next missing');next.click();
  }
  assert(document.querySelector('#gcsLearningRoot').textContent.includes('9 av 9'),'practice score must match answer keys');
  learn.open('exam');
  for(let i=0;i<model.exams.length;i++){
   const form=document.querySelector('#gcsLearningRoot .gcs-learn-exam');
   assert(!!form,'full-case test form missing');
   const q=model.exams[i];
   for(const select of form.querySelectorAll('select')){
    select.value=q.answers[select.name];
    select.dispatchEvent(new Event('change',{bubbles:true}));
   }
   if(i!==model.exams.length-1)assert(!document.querySelector('.gcs-learn-exam-report'),'test answers must remain hidden until finish');
   form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  }
  assert(learn.examDone,'exam did not finish');
  assert(document.querySelector('#gcsLearningRoot').textContent.includes('12 / 12'),'full-case test total incorrect');
  assert(document.querySelector('#gcsLearningRoot').textContent.includes('ingen gyldig totalskår'),'NT case missing correct note');
  assert(document.querySelector('#rr').value===simulatedBaseline,'GCS teaching must never modify assessment fields');
  document.querySelector('[data-page=vurdering]').click();
  assert(document.querySelector('#page-laer').hidden,'learning page not hidden on return to assessment');
  assert(!errors.length,'learning JavaScript errors: '+errors.join(';'));
  // 4AT and NEWS2 training share the learning hub, not their scoring logic.
  document.querySelector('[data-page="laer"]').click();
  const hub=window.KartleggLearningHub,materials=window.KartleggLearningContent;
  assert(!!hub&&!!materials,'4AT/NEWS2 learning hub missing');
  assert(document.querySelectorAll('#learningHubChooser [data-learn-tool]').length===4,'learning hub should have four tools including TIMES');
  for(const [tool,definition,engine] of [
   ['four','fourCases','4at'],
   ['news','newsCases','news2']
  ]){
   assert(hub.setTool(tool,'home'),'failed to select '+tool);
   const currentSection=document.querySelector(tool==='four'?'#learn4atModule':'#learnNews2Module');
   assert(!currentSection.hidden&&currentSection.contains(document.querySelector('#learnToolExerciseRoot')),
    'learning content not mounted in visible '+tool+' section');
   assert(hub.setTool(tool,'learn'),'could not open '+tool+' lessons');
   const lessons=tool==='four'?materials.fourLessons:materials.newsLessons;
   for(let i=0;i<lessons.length;i++){
    assert(document.querySelector('#learnToolExerciseRoot').textContent.includes(lessons[i].name),'lesson not shown: '+lessons[i].name);
    const next=[...document.querySelectorAll('#learnToolExerciseRoot button')].find(b=>b.textContent.includes('Neste')||b.textContent.includes('Start øving'));
    assert(!!next,'lesson continuation missing');next.click();
   }
   assert(hub.mode==='practice',tool+' should transition from learn to practice');
   for(const q of materials[definition].filter(x=>x.level==='Øv')){
    const answer=materials.expected(engine,q.id).parts;
    for(const [part,value] of Object.entries(answer)){
     let b;
     if(tool==='news'){
      const index=materials.newsChartRow(part,q.v).answerIndex;
      b=document.querySelector('#learnToolExerciseRoot [data-part="'+part+'"][data-column="'+index+'"]');
     }else b=document.querySelector('#learnToolExerciseRoot [data-part="'+part+'"][data-score="'+value+'"]');
     assert(!!b,tool+' missing clickable cell '+part+'='+value);
     b.click();
    }
    if(tool==='news'){
     const selected=[...document.querySelectorAll('#learnToolExerciseRoot .learn12-news-cell.is-selected')];
     assert(selected.length===7,'exactly one NEWS2 cell per row should be selected');
     assert(document.querySelectorAll('.learn12-vital-tile').length===8,'case vitals should be in eight readable tiles');
    }
    const check=[...document.querySelectorAll('#learnToolExerciseRoot button')].find(b=>b.textContent.includes('Sjekk resultat'));
    assert(!!check&&!check.disabled,tool+' check-result button unavailable');
    check.click();
    assert(document.querySelector('#learnToolExerciseRoot .learn12-feedback'),tool+' per-case feedback missing');
    const next=[...document.querySelectorAll('#learnToolExerciseRoot button')].find(b=>b.textContent.includes('Gå videre')||b.textContent.includes('Se oppsummeringen'));
    assert(!!next&&!next.disabled,tool+' next-case action unavailable');next.click();
   }
   assert(hub.finished,'guided '+tool+' session should finish');
   assert(document.querySelector('#learnToolExerciseRoot .learn12-big-score'),'guided '+tool+' results missing');
   hub.setTool(tool,'test');
   for(const q of materials[definition].filter(x=>x.level==='Test')){
    const answer=materials.expected(engine,q.id).parts;
    for(const [part,value] of Object.entries(answer)){
     let b;
     if(tool==='news'){
      const index=materials.newsChartRow(part,q.v).answerIndex;
      b=document.querySelector('#learnToolExerciseRoot [data-part="'+part+'"][data-column="'+index+'"]');
     }else b=document.querySelector('#learnToolExerciseRoot [data-part="'+part+'"][data-score="'+value+'"]');
     assert(!!b,'test scoring cell missing '+tool+' '+part);b.click();
    }
    assert(!document.querySelector('#learnToolExerciseRoot .learn12-feedback'),'result must not appear before checking');
    const check=[...document.querySelectorAll('#learnToolExerciseRoot button')].find(b=>b.textContent.includes('Sjekk resultat'));
    assert(!!check&&!check.disabled,'cannot check '+tool+' test case');check.click();
    assert(!!document.querySelector('#learnToolExerciseRoot .learn12-feedback'),'test case feedback unavailable');
    const action=[...document.querySelectorAll('#learnToolExerciseRoot button')].find(b=>b.textContent.includes('Gå videre')||b.textContent.includes('Se oppsummeringen'));
    assert(!!action&&!action.disabled,'cannot move to next '+tool+' case');action.click();
   }
   assert(hub.finished,'test '+tool+' must finish');
   assert(document.querySelectorAll('#learnToolExerciseRoot .learn12-report').length===3,'three graded test cases expected');
   assert(document.querySelector('#rr').value===simulatedBaseline,tool+' training must not affect live vitals');
  }
  // Switching back to GCS must restore its existing tutorial, also via library shortcut.
  assert(hub.setTool('gcs','home'),'cannot return to GCS learning');
  assert(!document.querySelector('#learnGcsModule').hidden,'GCS pane is still hidden');
  document.querySelector('[data-page="verktoy"]').click();
  const fourShortcut=document.querySelector('#page-verktoy .toolbox[data-tool-id="4at"] .learn12-card-shortcut');
  const newsShortcut=document.querySelector('#page-verktoy .toolbox[data-tool-id="news2"] .learn12-card-shortcut');
  assert(!!fourShortcut&&!!newsShortcut,'learning shortcuts missing from clinical library cards');
  newsShortcut.click();
  assert(hub.active==='news'&&hub.mode==='learn','NEWS2 tool shortcut did not launch lesson');
  document.querySelector('[data-page="verktoy"]').click();
  const gcsShortcut=document.querySelector('#page-verktoy .toolbox[data-tool-id="gcs"] .gcs-learn-card-button');
  gcsShortcut.click();
  assert(hub.active==='gcs'&&window.KartleggLearnPilot.mode==='learn','GCS tool shortcut not restored after NEWS2');
  assert(!errors.length,'multitool learning JavaScript errors: '+errors.join(';'));
  status='PASS';
 } catch(err) {status='FAIL: '+String(err.message||err)+'; '+errors.join('; ');}
 const el=document.createElement('output');el.id='kartlegg-smoke';el.textContent=status;document.body.append(el);
})();
</script>
"""
temp=root/".kartlegg-smoke.html"
temp.write_text(source.replace("</body>",script+"</body>"),encoding="utf-8")
try:
 for width,height in [(1300,850),(768,1024),(410,850),(375,812),(360,780)]:
  command=[shutil.which(chrome),"--headless","--disable-gpu","--disable-dev-shm-usage","--no-sandbox",f"--window-size={width},{height}","--virtual-time-budget=5000","--dump-dom",temp.as_uri()]
  result=subprocess.run(command,text=True,capture_output=True,timeout=45)
  match=re.search(r'<output id="kartlegg-smoke">(.*?)</output>',result.stdout)
  if not match:
   print("Browser smoke marker missing.",file=sys.stderr)
   print(result.stderr[-1800:],file=sys.stderr)
   raise SystemExit(1)
  status=html.unescape(match.group(1))
  print(f"Browser integration smoke {width}×{height}:",status)
  if status!="PASS":raise SystemExit(1)
 # Independently load bookmarked URL routes after a hard refresh in Chrome.
 # This catches a common bug where generated links look correct but do not launch.
 deep_script=r"""
<script>
setTimeout(()=>{
 const id=new URLSearchParams(location.search).get('tool');
 const byId=x=>document.getElementById(x);
 const opened={
  gcs:()=>Boolean(byId('clinicalToolDialog')?.open&&byId('clinicalToolTitle')?.textContent.includes('GCS')),
  qsofa:()=>Boolean(byId('optionalGCS')?.open&&byId('gcs')?.getClientRects().length>0),
  abcde:()=>Boolean(byId('abcdeDialog')?.open),
  isbar:()=>Boolean(byId('isbarDialog')?.open)
 };
 const output=document.createElement('output');output.id='kartlegg-deep-link';
 output.textContent=opened[id]?.()?'PASS':'FAIL: '+id+' did not open';
 document.body.append(output);
},40);
</script>
"""
 deep=root/".kartlegg-direct-link-smoke.html"
 deep.write_text(source.replace("</body>",deep_script+"</body>"),encoding="utf-8")
 try:
  for tool,route in [("gcs","verktoy"),("qsofa","vurdering"),("abcde","verktoy"),("isbar","vurdering")]:
   target=deep.as_uri()+"?tool="+tool+"#"+route
   command=[shutil.which(chrome),"--headless","--disable-gpu","--disable-dev-shm-usage","--no-sandbox","--window-size=410,850","--virtual-time-budget=1200","--dump-dom",target]
   result=subprocess.run(command,text=True,capture_output=True,timeout=45)
   match=re.search(r'<output id="kartlegg-deep-link">(.*?)</output>',result.stdout)
   status=html.unescape(match.group(1)) if match else "NO OUTPUT"
   print(f"Direct-link smoke {tool}:",status)
   if status!="PASS":raise SystemExit(1)
 finally:
  deep.unlink(missing_ok=True)
finally:
 temp.unlink(missing_ok=True)
