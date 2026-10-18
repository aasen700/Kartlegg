/* Kartlegg Lær — GCS, one pedagogical source of truth for lessons and answer keys.
 * English/official GCS chart: https://www.glasgowcomascale.org/
 * Norwegian assessment aid: https://www.glasgowcomascale.org/downloads/GCS-Assessment-Aid-Norwegian.pdf
 * No network, persistence, personally identifiable data or medical advice.
 */
(function(root,factory){
 const api=factory(typeof module==='object'&&module.exports?require('./clinical-tools.js'):root.KartleggTools);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.KartleggGcsLearning=api;
})(typeof globalThis==='undefined'?this:globalThis,function(T){
 'use strict';
 if(!T?.gcs)throw new Error('KartleggTools.gcs mangler');
 const source=Object.freeze({
  name:'Glasgow Coma Scale – offisiell norsk vurderingshjelp',
  url:'https://www.glasgowcomascale.org/downloads/GCS-Assessment-Aid-Norwegian.pdf',
  recording:'https://www.glasgowcomascale.org/recording-gcs/'
 });
 const categories=Object.freeze({
  eyes:Object.freeze([
   ['4','E4 · Spontant'],['3','E3 · Ved tiltale/lyd'],['2','E2 · Ved trykkstimulus'],['1','E1 · Ingen øyeåpning'],['NT','E-NT · Ikke testbar']
  ].map(([value,label])=>Object.freeze({value,label}))),
  verbal:Object.freeze([
   ['5','V5 · Orientert'],['4','V4 · Desorientert, men sammenhengende tale'],['3','V3 · Forståelige enkeltord'],['2','V2 · Bare lyder/stønning'],['1','V1 · Ingen verbal respons'],['NT','V-NT · Ikke testbar']
  ].map(([value,label])=>Object.freeze({value,label}))),
  motor:Object.freeze([
   ['6','M6 · Følger oppfordring'],['5','M5 · Lokaliserer trykkstimulus'],['4','M4 · Normal fleksjon / avverging'],['3','M3 · Unormal fleksjon'],['2','M2 · Ekstensjon'],['1','M1 · Ingen motorisk respons'],['NT','M-NT · Ikke testbar']
  ].map(([value,label])=>Object.freeze({value,label})))
 });
 const lessons=Object.freeze([
  Object.freeze({id:'intro',title:'Slik bruker du GCS',scene:'intro',kicker:'Grunnprinsippet',
   body:'GCS beskriver tre selvstendige observasjoner: øyeåpning (E), verbal respons (V) og beste motoriske respons (M). Observer først og vurder faktorer som hindrer testing.',
   tips:Object.freeze(['Kontroller → observer → stimuler ved behov → vurder beste observerte respons.',
    'Dokumenter E, V og M hver for seg, helst med beskrivende ord i tillegg til poengene.',
    'Fysisk stimulering forutsetter relevant opplæring og gjeldende prosedyrer.'])}),
  Object.freeze({id:'eyes',title:'E: Øyeåpning',scene:'eyes',kicker:'E4 til E1, eller NT',
   body:'Se først etter spontan øyeåpning. Dersom øynene er lukket, vurder respons ved tiltale. Ved indikasjon og med korrekt opplæring kan videre vurdering av respons på trykkstimulus være aktuelt.',
   tips:Object.freeze(['Øyne allerede åpne før stimulus → E4.',
    'Øyne åpnes først ved tiltale/lyd → E3.',
    'Øyne åpnes først ved relevant trykkstimulus → E2. Ingen respons uten hindringer → E1.',
    'Lokale forhold som gjør øyeåpning umulig å vurdere, f.eks. uttalt hevelse, → E-NT.'])}),
  Object.freeze({id:'verbal',title:'V: Verbal respons',scene:'verbal',kicker:'V5 til V1, eller NT',
   body:'Vurder innholdet i talen, ikke bare om pasienten lager lyd. Undersøk om vedkommende er orientert for person, sted og tid.',
   tips:Object.freeze(['Korrekt orientert → V5. Sammenhengende, men desorientert tale → V4.',
    'Forståelige enkeltord uten sammenhengende samtale → V3.',
    'Bare uforståelige lyder/stønning → V2. Ingen lyd uten hindringer → V1.',
    'Hvis kommunikasjon ikke kan vurderes på grunn av hindringer, registrer V-NT.'])}),
  Object.freeze({id:'motor',title:'M: Motorisk respons',scene:'motor',kicker:'M6 til M1, eller NT',
   body:'M beskriver den beste observerte motoriske responsen. Sammenlign høyre og venstre side, og bruk den beste responsen som grunnlag for skåring.',
   tips:Object.freeze(['Følger todelt oppfordring → M6.',
    'Beveger hånden opp mot sted for relevant stimulus over kravebenet → M5 (lokaliserer).',
    'Rask normal fleksjon → M4; klart unormal fleksjon → M3.',
    'Ekstensjon → M2; ingen respons uten hindring → M1; ikke testbar → M-NT.'])}),
  Object.freeze({id:'nt',title:'Når noe ikke kan testes',scene:'nt',kicker:'NT er ikke null poeng',
   body:'En komponent som ikke kan vurderes på grunn av en hindring, skal registreres som ikke testbar (NT), ikke som om pasienten manglet respons.',
   tips:Object.freeze(['E-NT kan for eksempel skyldes lokalt hovne eller lukkede øyelokk.',
    'V-NT kan skyldes en faktor som fysisk hindrer normal tale.',
    'Hvis en komponent er NT, kan du ikke beregne en gyldig GCS-totalskår.',
    'Beskriv årsaken til NT, og rapporter de andre komponentene separat.'])}),
  Object.freeze({id:'sum',title:'Slik dokumenterer du',scene:'summary',kicker:'E + V + M når alle er testbare',
   body:'GCS er en beskrivelse av respons, ikke en diagnose. Sum 3–15 kan gis når E, V og M faktisk kan skåres. Ellers rapporteres de enkelte komponentene og NT uten totalskår.',
   tips:Object.freeze(['E3 V4 M6 = 13. Oppgi også hva responsene betyr.',
    'E-NT V5 M6 = ingen totalskår, fordi øyeåpning ikke var testbar.',
    'Endring i bevissthet eller respons krever klinisk vurdering uavhengig av totalskår.',
    'Denne modulen er læringsstøtte med fiktive caser, ikke praktisk kompetansesertifisering.'])})
 ]);
 const practice=Object.freeze([
  {id:'e-sound',part:'eyes',scene:'eyes',prompt:'Pasienten ligger med lukkede øyne. Ved tiltale åpnes øynene. Før tiltalen var de lukket.',answer:'3',why:'Øyeåpning først ved tiltale gir E3, ikke E4.'},
  {id:'v-confused',part:'verbal',scene:'verbal',prompt:'Pasienten svarer i hele, forståelige setninger, men sier feil måned og tror hun er hjemme.',answer:'4',why:'Sammenhengende tale med desorientering gir V4.'},
  {id:'m-obeys',part:'motor',scene:'motor',prompt:'Pasienten utfører en todelt oppfordring om å løfte hånden og deretter legge den på brystet.',answer:'6',why:'Todelt oppfordring blir fulgt: M6.'},
  {id:'e-nt',part:'eyes',scene:'nt',prompt:'Begge øyelokk er så kraftig hovne etter en skade at åpning ikke kan vurderes, men pasienten snakker.',answer:'NT',why:'Lokale hindringer betyr E-NT, ikke E1.'},
  {id:'v-words',part:'verbal',scene:'verbal',prompt:'Pasienten svarer med enkelte forståelige ord, men klarer ikke å forme sammenhengende setninger.',answer:'3',why:'Forståelige enkeltord gir V3.'},
  {id:'m-localises',part:'motor',scene:'motor',prompt:'Under relevant undersøkt respons på stimulus ved skulder/hals løfter pasienten hånden opp over kravebenet mot stimulus. Todelt oppfordring følges ikke.',answer:'5',why:'Lokaliserende bevegelse over kravebenet gir M5.'},
  {id:'e-pressure',part:'eyes',scene:'eyes',prompt:'Pasienten åpner ikke øynene ved tiltale, men åpner dem ved korrekt utført trykkstimulus.',answer:'2',why:'Øyeåpning først ved trykkstimulus gir E2.'},
  {id:'m-normal-flexion',part:'motor',scene:'motor',prompt:'Ved relevant vurdering ses en rask bøying i albuen som beveger armen bort fra stimulus, uten lokaliserende bevegelse.',answer:'4',why:'Rask normal fleksjon/avverging gir M4, ikke M5.'},
  {id:'v-nt',part:'verbal',scene:'nt',prompt:'En mekanisk hindring gjør at pasientens evne til å snakke ikke kan vurderes. Ingen verbal skår kan fastsettes.',answer:'NT',why:'Når kommunikasjon ikke kan vurderes, registreres V-NT i stedet for V1.'}
 ].map(q=>Object.freeze(q)));
 const exams=Object.freeze([
  {id:'test-a',scene:'verbal',name:'Case A – fullstendige funn',
   description:'Øynene er åpne spontant før stimuli. Pasienten svarer sammenhengende, men er desorientert for dato og sted. Han følger en todelt motorisk oppfordring.',
   answers:Object.freeze({eyes:'4',verbal:'4',motor:'6'}),
   feedback:'Spontan E4, desorientert men sammenhengende V4, følger oppfordring M6.'},
  {id:'test-b',scene:'eyes',name:'Case B – redusert respons',
   description:'Øynene åpnes først ved tiltale. Pasienten lager bare uforståelige lyder. Ved klinisk vurdert stimulus bøyer han armen raskt vekk fra stimulus, men lokaliserer ikke og følger ingen oppfordringer.',
   answers:Object.freeze({eyes:'3',verbal:'2',motor:'4'}),
   feedback:'Tiltale E3, lyder V2, normal fleksjon M4.'},
  {id:'test-c',scene:'nt',name:'Case C – en komponent kan ikke vurderes',
   description:'Øyelokkene er så kraftig hovne at øyeåpning ikke kan vurderes. Pasienten oppgir korrekt navn, sted og dato og følger en todelt motorisk oppfordring.',
   answers:Object.freeze({eyes:'NT',verbal:'5',motor:'6'}),
   feedback:'Øyeåpning er NT på grunn av lokal hindring; V5 og M6 er testbare. Ingen gyldig totalskår.'},
  {id:'test-d',scene:'motor',name:'Case D – alvorlig nedsatt respons',
   description:'Ved en korrekt utført klinisk vurdering åpner pasienten ikke øynene, gir ingen lyd og viser ekstensjon i albuene ved relevant stimulus. Ingen hindrende faktor er dokumentert.',
   answers:Object.freeze({eyes:'1',verbal:'1',motor:'2'}),
   feedback:'Ingen øyeåpning E1, ingen verbal respons V1 og ekstensjon M2.'}
 ].map(q=>Object.freeze(q)));
 const VALID=Object.freeze({eyes:new Set(categories.eyes.map(x=>x.value)),verbal:new Set(categories.verbal.map(x=>x.value)),motor:new Set(categories.motor.map(x=>x.value))});
 function scoreValues(input){
  const keys=['eyes','verbal','motor'];
  if(!input||keys.some(key=>!VALID[key].has(input[key])))throw new RangeError('Ufullstendige/ugyldige GCS-valg');
  return T.gcs(Object.fromEntries(keys.map(key=>[key,input[key]==='NT'?'NT':Number(input[key])])));
 }
 function gradePractice(questionId,value){
  const q=practice.find(x=>x.id===questionId);
  if(!q||typeof value!=='string'||!VALID[q.part].has(value))throw new RangeError('Ugyldig øvingssvar');
  return Object.freeze({correct:q.answer===value,expected:q.answer,why:q.why});
 }
 function gradeExam(responses){
  if(!responses||typeof responses!=='object')throw new RangeError('Mangler testsvar');
  return Object.freeze({
   cases:Object.freeze(exams.map(q=>{
    const selected=responses[q.id];
    if(!selected)throw new RangeError('Mangler svar på '+q.id);
    const reference=scoreValues(q.answers),attempt=scoreValues(selected);
    const parts=Object.freeze(Object.fromEntries(['eyes','verbal','motor'].map(k=>[k,selected[k]===q.answers[k]])));
    return Object.freeze({id:q.id,correct:Object.values(parts).filter(Boolean).length,parts,
      expected:reference,entered:attempt,feedback:q.feedback});
   }))
  });
 }
 return Object.freeze({source,categories,lessons,practice,exams,scoreValues,gradePractice,gradeExam});
});
