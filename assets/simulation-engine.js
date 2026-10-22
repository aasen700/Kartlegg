/* Kartlegg Simulering v0.2 — four deterministic fictional cases, no AI or persistence.
 * All observations are fictional, educational and scripted, NOT treatment guidance.
 * NEWS2 is delegated to the exact same scoring module as the rest of Kartlegg.
 */
(function(root,factory){
 const scoring=typeof module==='object'&&module.exports?require('./scoring.js'):root.Scoring;
 const api=factory(scoring);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.KartleggSimulationEngine=api;
})(typeof globalThis==='undefined'?this:globalThis,function(Scoring){
 'use strict';
 if(!Scoring?.news2)throw new Error('NEWS2 calculation unavailable');
 const SOURCES=Object.freeze([
  Object.freeze({name:'RCP – NEWS2 (2017)',url:'https://www.rcp.ac.uk/resources/national-early-warning-score-news-2/'}),
  Object.freeze({name:'Resuscitation Council UK – ABCDE',url:'https://www.resus.org.uk/library/abcde-approach'})
 ]);
 const WARNING='Alle pasientdata og hendelser i denne øvelsen er fiktive. Bruk ikke øvingsresultater i reell pasientbehandling.';
 const actions=Object.freeze([
  Object.freeze({id:'symptoms',category:'Samtale',label:'Spør om symptomforløpet',minutes:2}),
  Object.freeze({id:'history',category:'Samtale',label:'Spør om tidligere sykdom og medisiner',minutes:2}),
  Object.freeze({id:'abcde',category:'Undersøkelser',label:'Utfør en ABCDE-orientert observasjon',minutes:3}),
  Object.freeze({id:'vitals',category:'Undersøkelser',label:'Mål vitale parametere',minutes:3}),
  Object.freeze({id:'mental',category:'Undersøkelser',label:'Vurder bevissthet og forvirring',minutes:2}),
  Object.freeze({id:'contact',category:'Kommunikasjon',label:'Tilkall ansvarlig helsehjelp',minutes:1}),
  Object.freeze({id:'reevaluate',category:'Undersøkelser',label:'Gjenta observasjoner',minutes:3}),
  Object.freeze({id:'wait',category:'Prioritering',label:'Avvent og observer uten nye tiltak',minutes:5})
 ]);
 const map=new Map(actions.map(a=>[a.id,a]));
 const CONTACT='Du varsler ansvarlig helsehjelp og beskriver akutt forverring. Videre respons og tiltak må styres av klinisk vurdering og lokale akuttprosedyrer.';
 const REEVALUATE='Du tar nye målinger. Les oppdaterte verdier i øvingspanelet og vurder endringene.';
 const VITALS='Du registrerer et fullt sett med vitale parametere. Målingene vises i øvingspanelet.';
 // Hver kasus: faste, fiktive målinger før og etter en manusstyrt forverring, og en tekst per handling.
 // [vanlig, etter forverring]. Tekstene beskriver funn, ikke behandling.
 const freezeCase=c=>Object.freeze({...c,vitals:Object.freeze(c.vitals),worse:Object.freeze(c.worse),
  text:Object.freeze(c.text),sources:SOURCES,warning:WARNING,worsenAt:c.worsenAt||12});
 const cases=Object.freeze([
  freezeCase({
   id:'home-acute-001',title:'Akutt forverring i hjemmesykepleien',short:'Akutt forverring hjemme',level:'Middels',
   patient:'Kari, 82 år (fiktiv)',setting:'Planlagt hjemmebesøk',focus:'Tungpust og feber. Når ringer du etter hjelp?',
   opening:'Pasienten sitter i lenestolen, ser medtatt ut og sier: «Det er blitt så tungt å puste i dag.»',
   vitals:{rr:28,spo2:91,sbp:98,hr:118,temp:38.6,scale:1,conscious:'A',confusion:false,oxygen:false},
   worse:{rr:32,spo2:88,sbp:90,hr:136,temp:39.1,scale:1,conscious:'A',confusion:true,oxygen:false},
   text:{
    symptoms:['Pasienten beskriver økende tungpust siden i går, hoste og frostanfall. Ingen nye brystsmerter oppgis.'],
    history:['Pasienten forteller om høyt blodtrykk og at hun vanligvis går korte turer. Ingen kjent kronisk hyperkapnisk respirasjonssvikt og ingen ordinert oksygenbehandling oppgis.'],
    abcde:['A: snakker i korte setninger og har fri luftvei. B: rask, anstrengt pust. C: rask puls og blek hud. D: våken og orientert. E: føles varm.',
     'A: fri luftvei. B: rask, anstrengt pust. C: rask puls og kaldsvette. D: ny desorientering. E: varm og medtatt. Dette er en akutt forverring i det fiktive forløpet.'],
    mental:['Pasienten er våken, kjenner igjen sted og person, og har ingen nyoppstått forvirring.','Pasienten er våken, men virker nå nyoppstått forvirret.'],
    wait:['Du avventer i fem simulerte minutter. Pasienten er fortsatt tungpustet.','Mens du avventer, blir pasienten mer medtatt og nyoppstått forvirret i dette forhåndsdefinerte scenarioet.']
   },
   lesson:'Høy samlet skår og flere avvikende målinger samtidig. Poenget er å se helheten tidlig og ikke vente med å si fra.'
  }),
  freezeCase({
   id:'nursing-home-confusion-002',title:'Ny forvirring på sykehjemmet',short:'Ny forvirring på sykehjem',level:'Middels',
   patient:'Olav, 88 år (fiktiv)',setting:'Kveldsvakt på sykehjem',focus:'Ny forvirring. Hva betyr den for skåren?',
   opening:'En kollega sier: «Olav er ikke seg selv i kveld. Han prøver å gå ut av rommet og vet ikke hvor han er.»',
   vitals:{rr:22,spo2:95,sbp:104,hr:108,temp:38.4,scale:1,conscious:'A',confusion:true,oxygen:false},
   worse:{rr:26,spo2:93,sbp:88,hr:124,temp:39.2,scale:1,conscious:'A',confusion:true,oxygen:false},
   text:{
    symptoms:['Olav svarer usammenhengende. Kollegaen forteller at han har vært mer trett i to dager, har drukket lite og har gått oftere på toalettet.',
     'Olav er urolig og klarer ikke å svare på spørsmål. Kollegaen synes han er mer medtatt enn for litt siden.'],
    history:['Ifølge dokumentasjonen har Olav lett kognitiv svikt, men han er vanligvis orientert for sted og kjenner igjen personalet. Han har hjertesvikt og diabetes type 2.'],
    abcde:['A: fri luftvei. B: litt rask pust. C: rask puls, varm og tørr hud. D: våken, men desorientert og urolig. E: varm, ingen synlige sår.',
     'A: fri luftvei. B: rask pust. C: rask, svak puls og marmorert hud på knærne. D: desorientert og urolig. E: varm. Dette er en forverring i det fiktive forløpet.'],
    mental:['Olav er våken, men vet ikke hvor han er og kjenner ikke igjen kollegaen. Dette er en endring fra slik han vanligvis er, altså ny forvirring.',
     'Olav er fortsatt ny forvirret og nå mer urolig enn tidligere.'],
    wait:['Du avventer i fem simulerte minutter. Olav fortsetter å prøve å gå ut av rommet.','Mens du avventer, blir Olav blekere og mer medtatt i dette forhåndsdefinerte scenarioet.']
   },
   lesson:'Ny forvirring gir alene 3 poeng i NEWS2. Sammenlign alltid med hvordan pasienten pleier å være. Kjent kognitiv svikt er ikke det samme som ny forvirring.'
  }),
  freezeCase({
   id:'postop-ward-003',title:'Svimmel dagen etter operasjon',short:'Svimmel etter operasjon',level:'Krevende',
   patient:'Nora, 67 år (fiktiv)',setting:'Sengepost, dagen etter hofteoperasjon',focus:'Lav skår, men en puls som stiger. Ser du trenden?',
   opening:'Nora ringer på. Hun sitter på sengekanten og sier: «Jeg ble så svimmel da jeg skulle reise meg.»',
   vitals:{rr:20,spo2:96,sbp:102,hr:112,temp:36.4,scale:1,conscious:'A',confusion:false,oxygen:false},
   worse:{rr:24,spo2:94,sbp:88,hr:128,temp:36.2,scale:1,conscious:'A',confusion:false,oxygen:false},
   text:{
    symptoms:['Nora har vært svimmel siden i morges og er tørst. Hun kjenner seg kvalm og har lite matlyst. Smerten i hoften er som i går.',
     'Nora sier at hun kjenner seg mer slapp og at det svartner når hun løfter hodet.'],
    history:['Nora er vanligvis frisk og går turer. I dokumentasjonen står det at pulsen i går kveld var rundt 85. Hun bruker blodtrykksmedisin.'],
    abcde:['A: fri luftvei. B: rolig pust. C: rask puls, blek og litt klam. Bandasjen over operasjonssåret er mer gjennomfuktet enn ved forrige stell. D: våken og orientert. E: kald på hender og føtter.',
     'A: fri luftvei. B: raskere pust. C: rask, svak puls, blek og klam. Bandasjen er tydelig mer gjennomfuktet. D: våken, men slapp. E: kald på hender og føtter. Dette er en forverring i det fiktive forløpet.'],
    mental:['Nora er våken og orientert, og har ingen ny forvirring.','Nora er våken og orientert, men svarer tregere enn før.'],
    wait:['Du avventer i fem simulerte minutter. Nora ligger nå i sengen og sier at det går litt bedre når hun ligger.','Mens du avventer, blir Nora blekere og mer slapp i dette forhåndsdefinerte scenarioet.']
   },
   lesson:'NEWS2 er lav i starten, men pulsen er mye høyere enn i går, og det er nye funn ved bandasjen. En lav skår utelukker ikke at noe er galt. Se på trend og helhet, og si fra om det du ser.'
  }),
  freezeCase({
   id:'copd-scale2-004',title:'Tungpust hos pasient med SpO₂-skala 2',short:'KOLS og SpO₂-skala 2',level:'Krevende',
   patient:'Turid, 74 år (fiktiv)',setting:'Lungeavdeling, morgenrunde',focus:'Øv på SpO₂-skala 2 og oksygentilførsel.',
   opening:'Turid ligger med hevet hodeende og sier: «Jeg får ikke helt puste i dag, og jeg sov dårlig i natt.»',
   vitals:{rr:24,spo2:89,sbp:128,hr:98,temp:37.6,scale:2,conscious:'A',confusion:false,oxygen:true},
   worse:{rr:28,spo2:85,sbp:118,hr:112,temp:37.8,scale:2,conscious:'A',confusion:true,oxygen:true},
   text:{
    symptoms:['Turid har mer hoste og seigt slim enn vanlig, og blir tungpust bare av å snu seg i sengen.',
     'Turid snakker bare i korte setninger og virker trøtt og omtåket.'],
    history:['Turid har alvorlig KOLS med kjent hyperkapnisk respirasjonssvikt. I dokumentasjonen står det at en ansvarlig lege har bestemt at hun skal skåres etter SpO₂-skala 2. Hun får oksygen på nesekateter etter ordinasjon.'],
    abcde:['A: fri luftvei. B: rask pust med bruk av hjelpemuskulatur. C: litt rask puls, varm hud. D: våken og orientert. E: ingen ødemer.',
     'A: fri luftvei. B: rask, anstrengt pust. C: rask puls. D: trøtt, omtåket og ny forvirret. E: varm hud. Dette er en forverring i det fiktive forløpet.'],
    mental:['Turid er våken, orientert og svarer klart.','Turid er trøtt, svarer langsomt og vet ikke helt hvilken dag det er. Dette er ny forvirring.'],
    wait:['Du avventer i fem simulerte minutter. Turid er fortsatt tungpust.','Mens du avventer, blir Turid trøttere og mer omtåket i dette forhåndsdefinerte scenarioet.']
   },
   lesson:'Med SpO₂-skala 2 gir 88–92 % på oksygen 0 poeng for SpO₂, men oksygentilførselen gir alltid 2 poeng. Skala 2 brukes bare når det er bestemt og dokumentert. Ny forvirring hos en pasient med KOLS er viktig å si fra om.'
  })
 ]);
 const byId=new Map(cases.map(c=>[c.id,c]));
 const caseData=cases[0];
 const caseOf=s=>byId.get(s?.caseId)||caseData;
 function start(id){
  const c=byId.get(id)||caseData;
  return Object.freeze({caseId:c.id,minutes:0,worsened:false,finished:false,
   done:Object.freeze([]),timeline:Object.freeze([]),lastVitals:null,enteredNews:null,isbar:null});
 }
 function has(s,id){return s.done.includes(id)}
 function currentVitals(s){const c=caseOf(s);return {...(s.worsened?c.worse:c.vitals)}}
 function can(s,id){
  if(!s||!byId.has(s.caseId)||s.finished||!map.has(id))return false;
  if(id==='reevaluate')return has(s,'vitals')&&!has(s,'reevaluate');
  if(id==='wait')return s.done.filter(x=>x==='wait').length<2&&!has(s,'contact');
  return !has(s,id);
 }
 function narrative(s,id){
  const c=caseOf(s);
  if(id==='vitals')return VITALS;
  if(id==='contact')return CONTACT;
  if(id==='reevaluate')return REEVALUATE;
  const t=c.text[id];
  if(!t)throw new Error('Ukjent handling');
  return (s.worsened&&t[1])||t[0];
 }
 function step(s,id){
  if(!can(s,id))throw new RangeError('Handling er ikke tilgjengelig');
  const c=caseOf(s),action=map.get(id),minutes=s.minutes+action.minutes;
  // Scripted branch: the patient worsens if assessment is delayed without
  // contacting appropriate help. This is narrative logic, not a medical forecast.
  const worsened=s.worsened||(!has(s,'contact')&&id!=='contact'&&minutes>=c.worsenAt);
  const now={...s,minutes,worsened,done:Object.freeze([...s.done,id]),
   lastVitals:(id==='vitals'||id==='reevaluate')?Object.freeze({...(worsened?c.worse:c.vitals)}):s.lastVitals};
  const update={...now,timeline:Object.freeze([...s.timeline,Object.freeze({
   minute:minutes,id,label:action.label,text:narrative(now,id)
  })])};
  return Object.freeze(update);
 }
 function recordNews(s,value){
  if(s.finished||!has(s,'vitals'))throw new RangeError('Mål vitale parametere før NEWS2 registreres');
  if(typeof value!=='number'||!Number.isInteger(value)||value<0||value>30)
   throw new RangeError('Oppgi NEWS2 som heltall fra 0 til 30');
  return Object.freeze({...s,enteredNews:value});
 }
 function recordIsbar(s,fields){
  if(s.finished)throw new RangeError('Øvingen er avsluttet');
  if(!fields||!['s','b','a','r'].every(k=>typeof fields[k]==='string'&&fields[k].trim().length>=3&&fields[k].trim().length<=700))
   throw new RangeError('Skriv noe under S, B, A og R (3–700 tegn hver)');
  return Object.freeze({...s,isbar:Object.freeze(Object.fromEntries(['s','b','a','r'].map(k=>[k,fields[k].trim()])))});
 }
 function debrief(s){
  const c=caseOf(s),objective=Scoring.news2(s.lastVitals||c.vitals),v=s.lastVitals||c.vitals;
  const observed=has(s,'vitals'),contacted=has(s,'contact');
  const items=[
   {id:'vitals',label:'Observerte vitale parametere',done:observed,reason:'Vitale målinger og klinisk observasjon gir grunnlag for en strukturert vurdering.'},
   {id:'abcde',label:'Gjennomførte ABCDE-orientert observasjon',done:has(s,'abcde'),reason:'Vurder truede vitale funksjoner systematisk. Håndter alvorlige funn og søk hjelp tidlig.'},
   {id:'mental',label:'Vurderte bevissthetsnivå/ny forvirring',done:has(s,'mental'),reason:'Mentale endringer må vurderes eksplisitt, ikke antas ut fra de øvrige målingene.'},
   {id:'news',label:'Beregnet NEWS2',done:s.enteredNews!==null&&s.enteredNews===objective.total,reason:'Korrekt totalskår er '+objective.total+' med SpO₂-skala '+v.scale+(v.oxygen?' og oksygentilførsel':' og uten oksygentilførsel')+'. Vurder også enkeltparametere.'},
   {id:'contact',label:'Tilkalt helsehjelp ved alvorlig forverring',done:contacted,reason:'I dette fiktive scenarioet tilsier funnene akutt klinisk oppfølging etter lokale rutiner.'},
   {id:'isbar',label:'Strukturerte overleveringen med ISBAR',done:Boolean(s.isbar),reason:'Sjekk selv at du beskriver situasjon, bakgrunn, observasjoner og hva du ber om. Friteksten er ikke maskinvurdert.'}
  ];
  return Object.freeze({caseId:c.id,lesson:c.lesson,score:objective.total,parts:objective.parts,entered:s.enteredNews,
   deteriorated:s.worsened,minutes:s.minutes,items:Object.freeze(items.map(x=>Object.freeze(x))),
   note:'Dette er refleksjonsstøtte, ikke vurdering av klinisk kompetanse. Hendelsesforløpet er manusstyrt, og hvert trinn representerer ikke fysiologiske prognoser.'});
 }
 function finish(s){if(s.finished)return s;return Object.freeze({...s,finished:true})}
 return Object.freeze({caseData,cases,getCase:id=>byId.get(id)||null,actions,start,has,can,step,recordNews,recordIsbar,finish,debrief,currentVitals,
  referenceNews:s=>Scoring.news2(s.lastVitals||caseOf(s).vitals)});
});
