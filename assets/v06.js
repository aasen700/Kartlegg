/* Kartlegg v0.6: brukerinnstillinger og oversiktlige skåringskriterier. */
'use strict';
(()=>{
const $=id=>document.getElementById(id), one=s=>document.querySelector(s);
const html=document.documentElement, key='kartlegg.appearance.v06';
const media=window.matchMedia?.('(prefers-color-scheme: dark)');
const ThemeEngine=window.KartleggThemeEngine;
if(!ThemeEngine)throw new Error('Kartlegg theme engine missing');
const modes=['light','dark','system'], accents=['violet','blue','green'];
const services=ThemeEngine.SERVICES;
const serviceNames={custom:'Egendefinert',hospital:'Sykehus / akuttmottak',ambulance:'Ambulanse / prehospital',urgent:'Legevakt / akuttmedisin',homecare:'Hjemmesykepleie'};
let prefs=ThemeEngine.normalize(null);
try{
 const saved=JSON.parse(localStorage.getItem(key)||'null');
 if(saved&&modes.includes(saved.mode)&&accents.includes(saved.accent)){
  // v2011 made violet the fallback by mistake. Migrate that former default to blue; explicit blue and green choices stay unchanged.
  if(saved.accent==='violet'&&!saved.accentChoiceVersion)saved.accent='blue';
  prefs=ThemeEngine.normalize(saved);
 }
 else {const old=localStorage.getItem('kartlegg.theme.v05');if(modes.includes(old))prefs.mode=old}
}catch(_){}
const avatar=one('#profileTrigger'); // Accessible native button is rendered in index.html.
// The profile is a page (#page-profil); its static markup lives in index.html. Theme choices open as small sheets.
const drawer=$('profileSettings');
const sheetBody=name=>drawer.querySelector('[data-sheet-body="'+name+'"]');
// Visual layers remain independently selectable; existing saved settings migrate safely.
let philipUnlocked=false;
const baseOptions=document.createElement('fieldset');baseOptions.className='base-theme-options';baseOptions.hidden=true;
const baseLegend=document.createElement('legend');baseLegend.textContent='1 · Grunntema';baseOptions.append(baseLegend);
const baseGrid=document.createElement('div');baseGrid.className='base-theme-grid';
for(const [id,title,info] of [
 ['standard','Standard','Lys/mørk og aksentfarger'],
 ['philip','Philip · liquid cobalt','Koboltblått med ekte, halvtransparente glassflater']
]){
 const label=document.createElement('label');label.className='base-theme-option';
 const input=document.createElement('input');input.type='radio';input.name='baseTheme';input.value=id;
 const preview=document.createElement('span');preview.className='base-theme-preview';preview.dataset.themePreview=id;preview.setAttribute('aria-hidden','true');
 const body=document.createElement('span');const heading=document.createElement('strong');heading.textContent=title;
 const detail=document.createElement('small');detail.textContent=info;body.append(heading,detail);
 label.append(input,preview,body);baseGrid.append(label);
}
baseOptions.append(baseGrid);
const baseHint=document.createElement('p');baseHint.className='theme-layer-hint';
baseHint.textContent='Velg glassuttrykket eller gå tilbake til standardtemaet.';
baseOptions.append(baseHint);
drawer.querySelector('.appearance-options')?.before(baseOptions);
// Add the four service presets without removing the original six appearance combinations.
const serviceOptions=document.createElement('fieldset');serviceOptions.className='service-theme-options';
const serviceLegend=document.createElement('legend');serviceLegend.textContent='Tjenestetemaer';serviceOptions.append(serviceLegend);
const serviceIntro=document.createElement('p');serviceIntro.className='service-theme-intro';
serviceIntro.textContent='Velg en fargeprofil for tjenesten. Faglige risiko- og skåringsfarger påvirkes ikke.';
serviceOptions.append(serviceIntro);
const serviceGrid=document.createElement('div');serviceGrid.className='service-theme-grid';
const colorPair={custom:['#173b58','#87b8ff'],hospital:['#002244','#0077ee'],ambulance:['#222222','#ffff00'],urgent:['#005544','#ffcc00'],homecare:['#12675f','#36b5a8']};
for(const id of services){
 const option=document.createElement('label');option.className='service-theme-option';option.dataset.serviceOption=id;
 const radio=document.createElement('input');radio.type='radio';radio.name='serviceTheme';radio.value=id;
 const sample=document.createElement('span');sample.className='service-theme-preview';sample.setAttribute('aria-hidden','true');
 sample.style.setProperty('--preview-base',colorPair[id][0]);sample.style.setProperty('--preview-highlight',colorPair[id][1]);
 const label=document.createElement('span');label.className='service-theme-label';label.textContent=serviceNames[id];
 const detail=document.createElement('small');detail.textContent=({
  custom:'Lys/mørk + egen aksent',hospital:'Klinisk blå og hvit',ambulance:'Mørk med neongul kontrast',urgent:'Dyp grønn med tydelig gul',homecare:'Rolig, moderne grønnblå'
 })[id];
 option.append(radio,sample,label,detail);serviceGrid.append(option);
}
serviceOptions.append(serviceGrid);
sheetBody('service').append(serviceOptions);
const seasonOptions=document.createElement('fieldset');seasonOptions.className='season-theme-options';
const seasonLegend=document.createElement('legend');seasonLegend.textContent='Sesong og markering';seasonOptions.append(seasonLegend);
const seasonControls=document.createElement('div');seasonControls.className='season-theme-controls';
const seasonLabel=document.createElement('label');seasonLabel.htmlFor='seasonThemeSelect';seasonLabel.textContent='Sesonglag';
const seasonSelect=document.createElement('select');seasonSelect.id='seasonThemeSelect';
const seasonNames={
 off:'Av – ingen pynt',auto:'Automatisk etter dato',halloween:'Halloween',
 christmas:'Jul',may17:'17. mai','breast-cancer':'Brystkreftmåned','mental-health':'Verdensdagen for psykisk helse',pride:'Pride',
 'nurses-day':'Sykepleiernes dag','hand-hygiene':'Håndhygienedagen','patient-safety':'Pasientsikkerhetsdagen','heart-day':'Verdens hjertedag',
 'diabetes-day':'Verdens diabetesdag','mens-health':'Menns helse i november','sami-day':'Samefolkets dag',easter:'Påske',
 winter:'Vinter',spring:'Vår',summer:'Sommer',autumn:'Høst'
};
for(const id of ThemeEngine.SEASONS){
 const option=document.createElement('option');option.value=id;option.textContent=seasonNames[id];seasonSelect.append(option);
}
const seasonMessage=document.createElement('p');seasonMessage.className='season-theme-message';seasonMessage.id='seasonThemeMessage';
const seasonPreview=document.createElement('span');seasonPreview.className='season-theme-preview';seasonPreview.id='seasonThemePreview';seasonPreview.setAttribute('aria-hidden','true');
seasonControls.append(seasonLabel,seasonSelect,seasonPreview,seasonMessage);seasonOptions.append(seasonControls);
const seasonHint=document.createElement('p');seasonHint.className='theme-layer-hint';
seasonHint.textContent='Valgfri pynt øverst på siden. Jul, Halloween og 17. mai får farget bakgrunn; de andre er rolige. Automatisk følger merkedagene (blant annet Samefolkets dag, påske, håndhygienedagen 5. mai, Sykepleiernes dag 12. mai, 17. mai, Pride i juni, pasientsikkerhetsdagen 17. september, hjertedagen 29. september, oktober, menns helse og diabetesdagen i november og jul) og ellers årstiden. Ingen offisiell kampanjetilknytning.';
seasonOptions.append(seasonHint);
serviceOptions.querySelector('legend').textContent='Tjenestetema';
sheetBody('season').append(seasonOptions);
const seasonNotice=document.createElement('span');seasonNotice.className='season-notice';seasonNotice.id='seasonNotice';seasonNotice.hidden=true;
one('#page-vurdering .intro > div')?.append(seasonNotice);
const seasonHighlight=document.createElement('div');seasonHighlight.className='season-highlight';seasonHighlight.id='seasonHighlight';seasonHighlight.hidden=true;
seasonHighlight.setAttribute('aria-hidden','true');one('.header')?.append(seasonHighlight);
function initials(){const name=$('profileName')?.value.trim()||'';avatar.textContent=name?name.split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase():'K'}
for(const input of drawer.querySelectorAll('[name=appearanceMode]'))input.closest('label').dataset.previewMode=input.value;
for(const input of drawer.querySelectorAll('[name=accentChoice]'))input.closest('label').dataset.previewAccent=input.value;
const surfaceOptions=document.createElement('fieldset');surfaceOptions.className='surface-style-options';
const surfaceLegend=document.createElement('legend');surfaceLegend.textContent='Kort og bokser';surfaceOptions.append(surfaceLegend);
const surfaceGrid=document.createElement('div');surfaceGrid.className='surface-style-grid';
for(const [id,title,info] of [
 ['solid','Solide bokser','Hvite i dagmodus, mørke i nattmodus'],
 ['glass','Liquid glass','Synlig gjennomsiktighet, lyskant og uskarp bakgrunn']
]){
 const label=document.createElement('label');label.className='surface-style-option';
 const input=document.createElement('input');input.type='radio';input.name='surfaceStyle';input.value=id;
 const preview=document.createElement('span');preview.className='surface-style-preview';preview.dataset.surfacePreview=id;preview.setAttribute('aria-hidden','true');
 const copy=document.createElement('span');const heading=document.createElement('strong');heading.textContent=title;
 const detail=document.createElement('small');detail.textContent=info;copy.append(heading,detail);
 label.append(input,preview,copy);surfaceGrid.append(label);
}
surfaceOptions.append(surfaceGrid);
sheetBody('surface').append(surfaceOptions);
function apply(){
 if(!philipUnlocked)prefs.base='standard';
 baseOptions.hidden=!philipUnlocked;
 const state=ThemeEngine.resolve(prefs,Boolean(media?.matches),new Date());
 const resolved=state.mode;
 html.dataset.theme=resolved;html.dataset.accent=state.accent;html.dataset.serviceTheme=state.service;
 html.dataset.baseTheme=state.base;html.dataset.seasonTheme=state.season;html.dataset.surfaceStyle=state.surface;
 const toggle=$('themeToggle');
 if(toggle){
  toggle.textContent=state.base==='philip'?'☀ Standardmodus':(resolved==='dark'?'☀ Dagmodus':'☾ Nattmodus');
  toggle.setAttribute('aria-label',state.base==='philip'?'Bytt fra Philip-tema til standard dagmodus':(resolved==='dark'?'Bytt til dagmodus':'Bytt til nattmodus'));
  toggle.setAttribute('aria-pressed',String(resolved==='dark'));
 }
 // A service preset overrides day/night and accent, so leave the custom choices unchecked; otherwise clicking the stored choice fires no change and cannot return to custom.
 const custom=prefs.service==='custom';
 drawer.querySelectorAll('[name=appearanceMode]').forEach(x=>x.checked=custom&&x.value===prefs.mode);
 drawer.querySelectorAll('[name=accentChoice]').forEach(x=>x.checked=custom&&x.value===prefs.accent);
 drawer.querySelectorAll('[name=serviceTheme]').forEach(x=>x.checked=x.value===prefs.service);
 drawer.querySelectorAll('[name=baseTheme]').forEach(x=>x.checked=x.value===prefs.base);
 drawer.querySelectorAll('[name=surfaceStyle]').forEach(x=>x.checked=x.value===prefs.surface);
 seasonSelect.value=prefs.season;
 seasonPreview.dataset.seasonPreview=state.season==='none'?'off':state.season;
 seasonNotice.hidden=state.season==='none';
 seasonHighlight.hidden=state.season==='none';
 if(state.season!=='none')seasonNotice.textContent='✦ '+seasonNames[state.season]+' · dekorativt tema';
 const upcoming=prefs.season==='auto'&&ThemeEngine.nextSeason?ThemeEngine.nextSeason(new Date()):null;
 const upcomingText=upcoming?' Neste: '+seasonNames[upcoming.season]+' fra '+upcoming.date.toLocaleDateString('nb-NO',{day:'numeric',month:'long'})+'.':'';
 seasonMessage.textContent=prefs.season==='off'?'Sesonglaget er slått av.':
  (state.season==='none'?'Ingen markering på denne datoen.':
   (prefs.season==='auto'?'Automatisk valgt: ':'Manuelt valgt: ')+seasonNames[state.season]+'.')+upcomingText;
 const baseName=state.base==='philip'?'Philip liquid cobalt':(resolved==='dark'?'Mørkt standardtema':'Lyst standardtema');
 const surfaceName=state.surface==='glass'?'Liquid glass':'Solide bokser';
 $('appearanceSummary').textContent=baseName+' · '+surfaceName+' · '+serviceNames[state.service]+(state.season==='none'?'':' · '+seasonNames[state.season]);
 $('serviceThemeValue').textContent=serviceNames[prefs.service];
 $('surfaceStyleValue').textContent=prefs.surface==='glass'?'Liquid glass':'Solide';
 $('seasonThemeValue').textContent=prefs.season==='off'?'Av':(prefs.season==='auto'?'Automatisk':seasonNames[prefs.season]);
 try{localStorage.setItem(key,JSON.stringify(prefs))}catch(_){}
 window.dispatchEvent(new Event('kartlegg:settings-changed'));
}
window.KartleggThemeLayers={apply(value){prefs=ThemeEngine.normalize(value);if(prefs.accent==='violet')prefs.accentChoiceVersion=1;apply()},get preferences(){return {...prefs}},get effective(){return ThemeEngine.resolve(prefs,Boolean(media?.matches),new Date())}};
function openProfile(){initials();apply();(one('#sidebar [data-page=profil]')||one('[data-page=profil]'))?.click()}
avatar.addEventListener('click',openProfile);
$('profileName')?.addEventListener('input',initials);
$('clearProfile')?.addEventListener('click',initials);
// Sheets: a row with data-sheet opens its dialog; «Ferdig» or a tap outside closes it.
document.addEventListener('click',e=>{
 const opener=e.target.closest?.('[data-sheet]');
 if(opener){const sheet=$(opener.dataset.sheet);if(sheet&&!sheet.open){sheet.showModal();sheet.querySelector('input:checked,select,input')?.focus({preventScroll:true})}return}
 const closer=e.target.closest?.('[data-sheet-close]');if(closer){closer.closest('dialog')?.close();return}
 if(e.target.matches?.('dialog.settings-sheet'))e.target.close();
});
// Sender profile: rows show a summary; tapping one opens the existing form at that field.
const senderSummary=$('senderSummary'),senderEditor=$('senderEditor');
function refreshSender(){
 const value=id=>$(id)?.value.trim()||'Ikke satt';
 $('senderNameValue').textContent=value('profileName');$('senderRoleValue').textContent=value('profileRole');$('senderWorkValue').textContent=value('profileWork');
}
function editSender(open,field){
 senderEditor.hidden=!open;senderSummary.hidden=open;
 if(open)$('profileStatus').textContent='';
 if(open)$(field||'profileName')?.focus();else senderSummary.querySelector('button')?.focus({preventScroll:true});
}
senderSummary.querySelectorAll('[data-sender-field]').forEach(b=>b.addEventListener('click',()=>editSender(true,b.dataset.senderField)));
$('saveProfile')?.addEventListener('click',()=>{refreshSender();initials();editSender(false)});
$('clearProfile')?.addEventListener('click',()=>{refreshSender();editSender(false)});
window.addEventListener('kartlegg:profile-applied',refreshSender);
// Profile page views: main settings, or the login / signup screens. Back (button or browser) returns to main.
const profilePage=$('page-profil');
function showProfileView(view,push){
 view=view==='login'||view==='signup'?view:'main';
 if(profilePage.dataset.profileView===view)return;
 profilePage.dataset.profileView=view;
 if(push&&view!=='main')history.pushState({profileView:view},'',location.href);
 window.dispatchEvent(new CustomEvent('kartlegg:profile-view',{detail:{view}}));
 window.scrollTo({top:0,behavior:'instant'});
 const heading=view==='main'?profilePage.querySelector('.intro h1'):profilePage.querySelector('[data-profile-view-panel="'+view+'"] h1');
 if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}
}
window.KartleggProfilePage={
 show(view){showProfileView(view,true)},
 back(){if(history.state?.profileView)history.back();else showProfileView('main',false)},
 get view(){return profilePage.dataset.profileView}
};
window.addEventListener('popstate',e=>{if(location.hash==='#profil')showProfileView(e.state?.profileView||'main',false)});
// Any navigation (menu, bottom bar, links, hash) returns the profile to its main view with fresh values.
function profileNavigated(){showProfileView('main',false);refreshSender();initials()}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-page]'))profileNavigated()},true);
window.addEventListener('hashchange',profileNavigated);
refreshSender();
drawer.querySelectorAll('[name=baseTheme]').forEach(el=>el.addEventListener('change',()=>{prefs.base=philipUnlocked?el.value:'standard';apply()}));
drawer.querySelectorAll('[name=surfaceStyle]').forEach(el=>el.addEventListener('change',()=>{prefs.surface=el.value;apply()}));
window.addEventListener('kartlegg:personal-mode',e=>{
 const wasUnlocked=philipUnlocked;philipUnlocked=e.detail?.id==='philip';
 if(philipUnlocked&&!wasUnlocked){prefs.base='philip';prefs.surface='glass'}
 apply();
});
drawer.querySelectorAll('[name=appearanceMode]').forEach(el=>el.addEventListener('change',()=>{prefs.mode=el.value;prefs.base='standard';prefs.service='custom';apply()}));
drawer.querySelectorAll('[name=accentChoice]').forEach(el=>el.addEventListener('change',()=>{prefs.accent=el.value;prefs.accentChoiceVersion=el.value==='violet'?1:undefined;prefs.base='standard';prefs.service='custom';apply()}));
drawer.querySelectorAll('[name=serviceTheme]').forEach(el=>el.addEventListener('change',()=>{prefs.service=el.value;apply()}));
seasonSelect.addEventListener('change',()=>{prefs.season=seasonSelect.value;apply()});
// Prevent the previous v0.5 click listener from immediately toggling the theme back.
$('themeToggle')?.addEventListener('click',e=>{e.stopImmediatePropagation();prefs.mode=html.dataset.theme==='dark'?'light':'dark';prefs.base='standard';prefs.service='custom';apply()},true);
media?.addEventListener?.('change',()=>{if(prefs.mode==='system')apply()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&prefs.season==='auto')apply()});
window.addEventListener('pageshow',e=>{if(e.persisted&&prefs.season==='auto')apply()});
initials();apply();

const news=[
 ['Respirasjonsfrekvens','/min',[['0','12–20'],['1','9–11'],['2','21–24'],['3','≤8 eller ≥25']]],
 ['SpO₂ – skala 1','%',[['0','≥96'],['1','94–95'],['2','92–93'],['3','≤91']]],
 ['SpO₂ – skala 2','%',[['0','88–92, eller ≥93 uten O₂'],['1','86–87, eller 93–94 med O₂'],['2','84–85, eller 95–96 med O₂'],['3','≤83, eller ≥97 med O₂']],'Skala 2 krever bekreftet hyperkapnisk respirasjonssvikt og en dokumentert klinisk beslutning om SpO₂-mål 88–92 %. Skår over 92 % avhenger av oksygentilførsel.'],
 ['Systolisk blodtrykk','mmHg',[['0','111–219'],['1','101–110'],['2','91–100'],['3','≤90 eller ≥220']]],
 ['Puls','/min',[['0','51–90'],['1','41–50 eller 91–110'],['2','111–130'],['3','≤40 eller ≥131']]],
 ['Temperatur','°C',[['0','36,1–38,0'],['1','35,1–36,0 eller 38,1–39,0'],['2','≥39,1'],['3','≤35,0']]],
 ['Bevissthet / ny forvirring','',[['0','A uten ny forvirring'],['3','V, P, U eller ny forvirring']]],
 ['Tilført oksygen','',[['0','Nei – romluft'],['2','Ja – tilført O₂']]]
];
const qs=[
 ['Respirasjonsfrekvens','/min',[['0','<22'],['1','≥22']]],
 ['Systolisk blodtrykk','mmHg',[['0','>100'],['1','≤100']]],
 ['Mental status – GCS','',[['0','GCS 15'],['1','GCS <15']],'GCS må vurderes separat; AVPU alene er ikke tilstrekkelig.']
];
function renderCriteria(items){
 const wrap=document.createElement('div');wrap.className='criteria-wrap';const title=document.createElement('p');title.className='criteria-title';title.textContent='Trykk på en parameter for å se poenggrensene';wrap.append(title);
 const stack=document.createElement('div');stack.className='criteria-stack';
 for(const [name,unit,rows,note] of items){
  const detail=document.createElement('details');detail.className='criterion';
  const summary=document.createElement('summary');const strong=document.createElement('strong');strong.textContent=name;const small=document.createElement('small');small.textContent=rows.length+' nivåer';summary.append(strong,small);detail.append(summary);
  const content=document.createElement('div');content.className='criterion-content';
  if(note){const p=document.createElement('p');p.className='criterion-note';p.textContent=note;content.append(p)}
  for(const [points,value] of rows){const row=document.createElement('div');row.className='criterion-row';const badge=document.createElement('span');badge.className='point-badge point-'+points;badge.textContent=points+' poeng';const val=document.createElement('span');val.textContent=value+(unit?' '+unit:'');row.append(badge,val);content.append(row)}
  detail.append(content);stack.append(detail);
 }
 wrap.append(stack);return wrap;
}
const boxes=one('#page-verktoy .toolgrid')?.querySelectorAll('.toolbox');
// Poenggrensene hører hjemme i selve vurderingen, ikke i biblioteket: kortene holdes like korte,
// og NEWS2- og qSOFA-kortet får bare kilde og en lenke til grensene.
const criteriaHome=(()=>{const info=$('forklaring');if(!info)return null;const d=document.createElement('details');d.className='read-more criteria-home';d.id='scoreCriteria';
 const s=document.createElement('summary');s.textContent='Poenggrenser for NEWS2 og qSOFA';d.append(s);info.append(d);return d})();
function showCriteria(){window.KartleggShowPage?.('vurdering');if(criteriaHome){criteriaHome.open=true;setTimeout(()=>{criteriaHome.scrollIntoView({block:'start'});criteriaHome.querySelector('summary')?.focus({preventScroll:true})},300)}}
if(boxes?.length>=2)for(const [i,items,label] of [[0,news,'NEWS2'],[1,qs,'qSOFA']]){const old=boxes[i].querySelector('details');if(!old)continue;const link=old.querySelector('a[href]')?.cloneNode(true);const replacement=renderCriteria(items);let source=null;if(link){link.textContent=link.textContent.replace(/^\s*Kilde:\s*/,'');source=document.createElement('p');source.className='criteria-source';source.append('Kilde: ',link);replacement.append(source.cloneNode(true))}
 if(!criteriaHome){old.replaceWith(replacement);continue}
 const h=document.createElement('h3');h.className='criteria-home-title';h.textContent=label;criteriaHome.append(h,replacement);
 const go=document.createElement('button');go.type='button';go.className='btn-inline criteria-link';go.textContent='Poenggrenser';go.setAttribute('aria-label','Se poenggrensene for '+label);go.addEventListener('click',showCriteria);
 const box=document.createElement('div');box.className='criteria-card-foot';box.append(go);if(source)box.append(source);old.replaceWith(box)}
// Validation with explicit field names, preserving the existing submit/save logic.
const form=$('vitalsForm');const fieldnames={rr:'Respirasjonsfrekvens',spo2:'Oksygenmetning',sbp:'Systolisk blodtrykk',hr:'Puls',temp:'Temperatur',conscious:'Bevissthet',oxygen:'Tilført oksygen',scale:'SpO₂-skala',gcs:'GCS'};
function validate(){
 const invalid=[];for(const [id,name] of Object.entries(fieldnames)){const input=$(id);if(!input)continue;const bad=!(id==='gcs'&&!input.value.trim())&&!input.checkValidity();input.closest('.field')?.classList.toggle('field-invalid',bad);input.setAttribute('aria-invalid',String(bad));if(bad)invalid.push({el:input,name})}
 if(!form.querySelector('[name=confusion]:checked'))invalid.push({el:form.querySelector('[name=confusion]'),name:'Nyoppstått forvirring'});
 if(invalid.length){$('formNotice').textContent='Kontroller: '+invalid.map(x=>x.name).join(', ')+'.';$('formNotice').classList.add('visible');if(window.KartleggFinalPolish)window.KartleggFinalPolish.report(false);else invalid[0].el?.focus()}
 return !invalid.length;
}
form?.addEventListener('submit',e=>{if(!validate()){e.preventDefault();e.stopImmediatePropagation()}},true);
$('saveMeasurement')?.addEventListener('click',e=>{if(!validate()){e.preventDefault();e.stopImmediatePropagation()}},true);
form?.addEventListener('reset',()=>{form.querySelectorAll('.field-invalid').forEach(el=>el.classList.remove('field-invalid'))});
// Sletting i øvingsforløpet kan angres (app.js), så den spør ikke først.
form?.querySelector('button[type=reset]')?.addEventListener('click',e=>{if(Object.keys(fieldnames).some(id=>$(id)?.value.trim())&&!confirm('Nullstille registreringsskjemaet?')){e.preventDefault();e.stopImmediatePropagation()}},true);

})();
