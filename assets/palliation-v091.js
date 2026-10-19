/* Kartlegg v0.9.1 — Lindring ved livets slutt
 * Educational, NON patient-specific symptom observation guide.
 * Grounding: Helsedirektoratet national advice (2018); KLB Helse Bergen 2025.
 * No case-by-case medication choices, dosage, patient profiles or persistence.
*/
'use strict';
(()=>{
 const library=document.querySelector('#page-verktoy .toolgrid');if(!library)return;
 const urls={
  national:'https://www.helsedirektoratet.no/faglige-rad/lindrende-behandling-i-livets-sluttfase',
  bergen:'https://www.helse-bergen.no/kompetansesenter-i-lindrande-behandling/palliasjon-verktoy-for-helsepersonell/behandlingsalgoritmar-for-vanlege-symptom-hos-doyande-vaksne-dei-fire-viktigaste-medikamenta',
  four:'https://www.helse-bergen.no/49b62b/siteassets/seksjon/klb/-/medikamentskrin/de_fire_viktigste_medikamentene.pdf',
  pain:'https://www.helsedirektoratet.no/faglige-rad/lindrende-behandling-i-livets-sluttfase/legemiddelbehandling-av-smerte',
  dyspnea:'https://www.helsedirektoratet.no/faglige-rad/lindrende-behandling-i-livets-sluttfase/legemiddelbehandling-av-dyspne',
  nausea:'https://www.helsedirektoratet.no/faglige-rad/lindrende-behandling-i-livets-sluttfase/legemiddelbehandling-av-kvalme',
  unrest:'https://www.helsedirektoratet.no/faglige-rad/lindrende-behandling-i-livets-sluttfase/legemiddelbehandling-av-angst-uro-og-delirium',
  secretions:'https://www.helsedirektoratet.no/faglige-rad/lindrende-behandling-i-livets-sluttfase/legemiddelbehandling-av-surkling-i-sentrale-luftveier',
  dementia:'https://www.helsedirektoratet.no/retningslinjer/demens/lindrende-behandling-til-personer-med-demens'
 };
 const topics=[
  {id:'pain',name:'Smerter',symbol:'♡',search:'grimaser stønning avverging smerte',
   signs:['Oppgitt smerte, ansiktsgrimaser eller anspent ansiktsuttrykk','Stønning, roping eller økende reaksjon ved berøring og stell','Avvergingsbevegelser, beskyttelse av kroppsdel, rastløshet eller endret stilling','Ny uro kan være tegn på smerte hos personer som ikke kan fortelle om det'],
   assess:['Spør pasienten dersom kommunikasjon er mulig; vurder lokalisasjon, intensitet og utvikling.','Vurder stillingsrelatert smerte, obstipasjon, urinretensjon, sår og andre sannsynlige årsaker.','Observer både i hvile og ved bevegelse; endret atferd alene er ikke diagnostisk.'],
   care:['Tilpass leie og forflytning skånsomt; gi ro, trygghet og godt munnstell ved behov.','Videreformidle ny, vedvarende eller utilstrekkelig lindret smerte til ansvarlig behandler.'],
   meds:'Opioid som morfin eller oksykodon omtales i Helse Bergens oversikt ved smerte. Eventuell behandling forutsetter individuell ordinasjon og klinisk oppfølging.',
   review:'Vurder opplevd lindring, ansiktsuttrykk, ro og eventuelle bivirkninger som uønsket sedasjon.',refs:['pain','four','dementia']},
  {id:'dyspnea',name:'Tungpust / dyspné',symbol:'≈',search:'dyspne åndenød tungpust rask pust angst pustearbeid',
   signs:['Pasienten forteller om luftmangel eller opplevd åndenød','Økt pustearbeid, hjelpemuskler eller raske / uregelmessige åndedrag','Vansker med å snakke og synlig engstelse kan forekomme','Respirasjonsfrekvens eller SpO₂ alene viser ikke hvor plagsom tungpusten oppleves'],
   assess:['Spør om subjektiv dyspné når pasienten kan svare.','Vurder mulig lindrbare årsaker, angst og pasientens mål for behandlingen.','Ved akutt eller uventet åndenød må situasjonen vurderes uten å vente på en kartlegging.'],
   care:['Tilrettelegg for behagelig leie og rolig tilstedeværelse.','Vurder trygging, frisk luft/luftstrøm etter lokale prosedyrer og pasientpreferanse.'],
   meds:'Helsedirektoratet omtaler opioider som førstelinje ved plagsom dyspné i livets sluttfase; benzodiazepiner kan være aktuelle ved samtidig angst etter individuell vurdering.',
   review:'Følg pasientens opplevelse av luftmangel, komfort, våkenhet og bivirkninger.',refs:['dyspnea','four']},
  {id:'nausea',name:'Kvalme / oppkast',symbol:'◌',search:'brekninger kvalme oppkast mage',
   signs:['Pasienten beskriver kvalme, brekninger eller oppkast','Matvegring, ubehag ved lukt eller måltider','Blekhet eller klamhet kan ledsage kvalme','Endring i avføring eller magesmerter kan gi ledetråder'],
   assess:['Vurder obstipasjon, tarmobstruksjon, legemiddelbivirkninger og andre årsaker.','Avklar om kvalmen er vedvarende, episodisk eller knyttet til bevegelse/mat.','Hyppig oppkast eller nye magesymptomer krever individuell vurdering.'],
   care:['Tilrettelegg for rolig leie, munnstell og pasientens ønsker.','Vurder årsaksrettede tiltak sammen med ansvarlig behandler.'],
   meds:'Haloperidol er ett av legemidlene som omtales ved kvalme i Helse Bergens oversikt. Valg av antiemetikum avhenger av sannsynlig årsak og annen behandling.',
   review:'Vurder kvalmens intensitet, brekningsepisoder, komfort og eventuelle uønskede legemiddeleffekter.',refs:['nausea','four']},
  {id:'anxiety',name:'Angst / panikk',symbol:'✧',search:'angst panikk redsel uro engstelig',
   signs:['Uttrykt redsel, engstelig ansiktsuttrykk eller behov for hyppig trygging','Rastløshet, uro eller anspenthet','Opplevd kvelningsfølelse eller åndenød kan ledsages av angst','Uro kan skyldes annet enn angst og må vurderes bredt'],
   assess:['Undersøk om symptomene kan skyldes smerte, urinretensjon, obstipasjon, dyspné eller delirium.','Vurder psykososiale forhold, endringer i omgivelser og legemiddelbivirkninger.'],
   care:['Skap ro, kontinuitet og kjent tilstedeværelse; involver pårørende dersom pasienten ønsker det.','Vurder og lindr mulige utløsende plager først.'],
   meds:'Midazolam (benzodiazepin) omtales ved angst, panikk og uro hos døende. Valg og administrering krever forskrivning, kompetanse og effekt-/bivirkningskontroll.',
   review:'Vurder trygghet, pasientens komfort, våkenhet, uønsket sedasjon og vedvarende utløsende årsaker.',refs:['unrest','four']},
  {id:'delirium',name:'Delirium / agitasjon',symbol:'◎',search:'delirium agitasjon forvirring hallusinasjoner plukking sengetøy uro',
   signs:['Ny eller svingende forvirring, oppmerksomhetssvikt eller desorientering','Plukking på sengetøy, forsøk på å reise seg eller uttalt motorisk uro','Hallusinasjoner, endret døgnrytme eller tydelig endret atferd','Delirium kan også være hypoaktivt med tilbaketrekning og nedsatt kontakt'],
   assess:['Vurder smerte, urinretensjon, obstipasjon, infeksjon, legemiddelbivirkninger og metabolske forhold.','Avklar pasientens vanlige funksjon og om endringen er ny eller fluktuerende.','Uro betyr ikke nødvendigvis angst eller behov for sedasjon.'],
   care:['Skap ro, orienter skånsomt, legg til rette for kjent personale og ivareta tryggheten.','Vurder forsvarlige årsaksrettede tiltak i lys av mål for lindringen.'],
   meds:'Helsedirektoratet omtaler haloperidol eller andre antipsykotika som mulig behandling ved delirium/agitasjon. Ved uttalt angst/uro kan midazolam være aktuelt. Dette er ikke et automatisk valg.',
   review:'Observer endring i uro, kontakt, hallusinasjoner, bevissthetsnivå og mulige legemiddelbivirkninger.',refs:['unrest','four']},
  {id:'myoclonus',name:'Muskelrykninger / myoklonier',symbol:'ϟ',search:'myoklonier muskelrykninger kramper spasmer opioid',
   signs:['Korte, ufrivillige muskelsammentrekninger i arm, bein, ansikt eller kropp','Rykk som opptrer i hvile eller utløses ved berøring','Økende hyppighet, rykninger over flere områder eller endret bevissthet'],
   assess:['Vurder medikamentbivirkninger og eventuelt opioidrelaterte myoklonier, særlig ved doseendring eller nedsatt nyrefunksjon.','Skille mellom korte myoklonier og vedvarende kramper; ny krampeaktivitet eller endret bevissthet krever rask vurdering.'],
   care:['Sørg for trygg stilling og forebygg skade.','Observer varighet, utbredelse og eventuell sammenheng med legemidler; varsle ansvarlig behandler.'],
   meds:'Helse Bergens oversikt nevner midazolam ved muskelrykninger og kramper. Dette er ikke en generell anbefaling om å gi midazolam ved alle rykninger; årsak og opioidbehandling må revurderes av behandler.',
   review:'Følg frekvens og intensitet av rykninger, pasientens komfort og eventuell sedasjon.',refs:['four','national']},
  {id:'secretions',name:'Surkling / sekret',symbol:'≋',search:'surkling sekret dødsralling slim luftveier',
   signs:['Hørbar gurglende eller surklende lyd i øvre luftveier','Redusert evne til å svelge eller hoste opp sekret','Kan forekomme uten tydelige tegn på plager hos pasienten'],
   assess:['Forsøk å avklare om pasienten viser tegn til ubehag og hvordan pårørende opplever situasjonen.','Vurder leie og sannsynlige årsaker; ikke anta at lyden alene betyr åndenød.'],
   care:['Hevet hodeleie og varsom leieendring kan redusere lyden.','Godt munnstell og tydelig informasjon til pårørende.'],
   meds:'Helsedirektoratet omtaler antikolinergikum som glykopyrronium ved plagsom surkling når tiltak er vurdert; følg effekt og bivirkninger.',
   review:'Observer komfort, sekretlyd, munntørrhet, våkenhet og mulige bivirkninger.',refs:['secretions','four']},
  {id:'mouth',name:'Munntørrhet / redusert svelging',symbol:'○',search:'munntørrhet tørste munnstell svelging redusert væske matinntak',
   signs:['Tørre lepper eller synlig tørre slimhinner','Belegg, sprekker eller sårhet i munnhulen','Vansker med å svelge tabletter, mat eller drikke'],
   assess:['Vurder symptomer og pasientens ønsker; redusert matinntak er vanlig sent i dødsprosessen.','Se etter munnsopp, legemiddelbivirkninger og mulige lindrbare årsaker.'],
   care:['Tilby hyppig individuelt tilpasset munnstell og fukting av munn og lepper.','Ikke press mat eller drikke; følg trygg svelgefunksjon og mål for omsorgen.'],
   meds:'Dette er i utgangspunktet et pleie- og symptomvurderingstema, ikke en indikasjon for ett av de fire legemidlene. Enkelte legemidler kan øke munntørrhet.',
   review:'Spør om lindring når mulig; vurder slimhinner, komfort og toleranse for munnstell.',refs:['national','secretions']}
 ];
 const card=document.createElement('article');card.className='toolbox hc-tool-card pall-v091-card';card.dataset.homecareCard='pall';
 const icon=document.createElement('div');icon.className='hc-card-icon';icon.textContent='♡';icon.setAttribute('aria-hidden','true');
 const title=document.createElement('h3');title.textContent='Lindring ved livets slutt';
 const tag=document.createElement('span');tag.className='tool-tag';tag.textContent='Palliasjon';
 const desc=document.createElement('p');desc.textContent='Tegn du kan observere, vurderingspunkter, pleietiltak og kildebasert legemiddelkunnskap.';
 const launch=document.createElement('button');launch.type='button';launch.className='btn btn-primary hc-launch';launch.id='launchPalliation';launch.textContent='Åpne symptomveileder →';
 card.append(icon,title,tag,desc,launch);
 const anchor=library.querySelector('.toolbox');library.insertBefore(card,anchor);
 const dialog=document.createElement('dialog');dialog.id='palliationDialog';dialog.className='v08-dialog hc-dialog clinical-v091-dialog';dialog.setAttribute('aria-labelledby','pallDialogTitle');document.body.append(dialog);
 const h=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
 function link(url,title){const a=h('a','hc-source',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
 let selected='pain';
 function open(topicId){
  dialog.replaceChildren();
  const header=h('div','v08-dialog-head');
  const copy=h('div');copy.append(h('p','eyebrow','Faglig oppslagsverktøy · kun fiktive data'));
  const hd=h('h2','','Lindring ved livets slutt');hd.id='pallDialogTitle';copy.append(hd);
  const close=h('button','dialog-close','×');close.type='button';close.setAttribute('aria-label','Lukk symptomveileder');close.addEventListener('click',()=>dialog.close());
  header.append(copy,close);
  const body=h('div','v08-dialog-content pall-body');
  const intro=h('p','hc-hint','Velg et symptom for å lære hva du kan observere, mulige forklaringer, pleietiltak, legemiddelkunnskap og hva som bør evalueres. Ingen automatisk behandlingsbeslutning.');
  const safety=h('div','pall-safety');
  safety.append(h('strong','','Ikke et ordinasjonsverktøy'));
  safety.append(h('p','','Ved akutt/uventet forverring må pasienten vurderes straks etter lokale prosedyrer. Bruk legemidler bare etter gyldig individuell ordinasjon. Ingen doser eller pasientdata lagres.'));
  const search=h('input','pall-search');search.type='search';search.id='pallSymptomSearch';search.placeholder='Søk smerter, myoklonier, uro, surkling …';search.setAttribute('aria-label','Filtrer symptomer');
  const list=h('div','pall-topic-grid');list.id='pallTopicList';
  const article=h('section','pall-article');article.id='pallArticle';article.setAttribute('aria-live','polite');
  function choose(id){selected=id;renderTopics();renderArticle();}
  function renderTopics(){
   list.replaceChildren();const q=search.value.trim().toLocaleLowerCase('nb-NO');let count=0;
   for(const topic of topics){
    if(q&&!(topic.name+' '+topic.search).toLocaleLowerCase('nb-NO').includes(q))continue;
    count++;
    const b=h('button','pall-topic');b.type='button';b.dataset.topic=topic.id;
    b.setAttribute('aria-pressed',String(selected===topic.id));
    const sym=h('span','pall-topic-symbol',topic.symbol);sym.setAttribute('aria-hidden','true');
    b.append(sym,h('span','',topic.name));b.addEventListener('click',()=>choose(topic.id));list.append(b);
   }
   if(!count)list.append(h('p','hc-hint','Ingen symptomer samsvarer med søket. Prøv et annet ord.'));
  }
  function section(parent,title,items){
   const region=h('section','pall-section');region.append(h('h4','',title));
   if(Array.isArray(items)){const ul=h('ul');for(const item of items)ul.append(h('li','',item));region.append(ul)}
   else region.append(h('p','',items));
   parent.append(region);
  }
  function renderArticle(){
   article.replaceChildren();const topic=topics.find(t=>t.id===selected);
   article.append(h('h3','',topic.name));
   section(article,'Tegn og symptomer du kan se etter',topic.signs);
   section(article,'Hva bør du vurdere?',topic.assess);
   section(article,'Aktuelle pleietiltak',topic.care);
   section(article,'Legemiddelkunnskap – ingen automatisk ordinasjon',topic.meds);
   section(article,'Evaluering og videreformidling',topic.review);
   const refs=h('div','pall-references');refs.append(h('strong','','Faglige kilder: '));
   for(const key of topic.refs){refs.append(link(urls[key],key==='four'?'Helse Bergen: fire legemidler':key==='dementia'?'Helsedirektoratet: demens og palliasjon':'Helsedirektoratet: nasjonale råd'));refs.append(document.createTextNode(' · '))}
   article.append(refs);
  }
  search.addEventListener('input',renderTopics);
  body.append(intro,safety,search,list,article);dialog.append(header,body);
  selected=topics.some(x=>x.id===topicId)?topicId:'pain';renderTopics();renderArticle();dialog.showModal();
 }
 launch.addEventListener('click',open);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 // No symptom selections represent a patient record; closing drops the DOM content.
 dialog.addEventListener('close',()=>{if(!dialog.open)dialog.replaceChildren()});
 window.KartleggPalliation={open,symptoms:topics.map(x=>({id:x.id,name:x.name}))};
})();