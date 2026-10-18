/* Kartlegg Simulering v0.1 — one deterministic fictional case, no AI or persistence.
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
 const vitals=Object.freeze({rr:28,spo2:91,sbp:98,hr:118,temp:38.6,scale:1,conscious:'A',confusion:false,oxygen:false});
 const worse=Object.freeze({rr:32,spo2:88,sbp:90,hr:136,temp:39.1,scale:1,conscious:'A',confusion:true,oxygen:false});
 const caseData=Object.freeze({
  id:'home-acute-001',title:'Akutt forverring i hjemmesykepleien',level:'Middels',
  patient:'Kari, 82 år (fiktiv)',setting:'Planlagt hjemmebesøk',
  opening:'Pasienten sitter i lenestolen, ser medtatt ut og sier: «Det er blitt så tungt å puste i dag.»',
  warning:'Alle pasientdata og hendelser i denne øvelsen er fiktive. Bruk ikke øvingsresultater i reell pasientbehandling.',
  sources:Object.freeze([
   {name:'RCP – NEWS2 (2017)',url:'https://www.rcp.ac.uk/resources/national-early-warning-score-news-2/'},
   {name:'Resuscitation Council UK – ABCDE',url:'https://www.resus.org.uk/library/abcde-approach'}
  ])
 });
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
 function start(){
  return Object.freeze({caseId:caseData.id,minutes:0,worsened:false,finished:false,
   done:Object.freeze([]),timeline:Object.freeze([]),lastVitals:null,enteredNews:null,isbar:null});
 }
 function has(s,id){return s.done.includes(id)}
 function currentVitals(s){return {...(s.worsened?worse:vitals)}}
 function can(s,id){
  if(!s||s.caseId!==caseData.id||s.finished||!map.has(id))return false;
  if(id==='reevaluate')return has(s,'vitals')&&!has(s,'reevaluate');
  if(id==='wait')return s.done.filter(x=>x==='wait').length<2&&!has(s,'contact');
  return !has(s,id);
 }
 function narrative(s,id){
  const worsened=s.worsened;
  switch(id){
   case 'symptoms':return 'Pasienten beskriver økende tungpust siden i går, hoste og frostanfall. Ingen nye brystsmerter oppgis.';
   case 'history':return 'Pasienten forteller om høyt blodtrykk og at hun vanligvis går korte turer. Ingen kjent kronisk hyperkapnisk respirasjonssvikt og ingen ordinert oksygenbehandling oppgis.';
   case 'abcde':return worsened?
    'A: fri luftvei. B: rask, anstrengt pust. C: rask puls og kaldsvette. D: ny desorientering. E: varm og medtatt. Dette er en akutt forverring i det fiktive forløpet.':
    'A: snakker i korte setninger og har fri luftvei. B: rask, anstrengt pust. C: rask puls og blek hud. D: våken og orientert. E: føles varm.';
   case 'vitals':return 'Du registrerer et fullt sett med vitale parametere. Målingene vises i øvingspanelet.';
   case 'mental':return worsened?'Pasienten er våken, men virker nå nyoppstått forvirret.':'Pasienten er våken, kjenner igjen sted og person, og har ingen nyoppstått forvirring.';
   case 'contact':return 'Du varsler ansvarlig helsehjelp og beskriver akutt forverring. Videre respons og tiltak må styres av klinisk vurdering og lokale akuttprosedyrer.';
   case 'reevaluate':return 'Du tar nye målinger. Les oppdaterte verdier i øvingspanelet og vurder endringene.';
   case 'wait':return worsened?'Mens du avventer, blir pasienten mer medtatt og nyoppstått forvirret i dette forhåndsdefinerte scenarioet.':'Du avventer i fem simulerte minutter. Pasienten er fortsatt tungpustet.';
   default:throw new Error('Ukjent handling');
  }
 }
 function step(s,id){
  if(!can(s,id))throw new RangeError('Handling er ikke tilgjengelig');
  const action=map.get(id),minutes=s.minutes+action.minutes;
  // Scripted branch: the patient worsens if assessment is delayed without
  // contacting appropriate help. This is narrative logic, not a medical forecast.
  const worsened=s.worsened||(!has(s,'contact')&&id!=='contact'&&minutes>=12);
  const now={...s,minutes,worsened,done:Object.freeze([...s.done,id]),
   lastVitals:(id==='vitals'||id==='reevaluate')?Object.freeze({...worsened?worse:vitals}):s.lastVitals};
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
  const objective=Scoring.news2(s.lastVitals||vitals);
  const observed=has(s,'vitals'),contacted=has(s,'contact');
  const items=[
   {id:'vitals',label:'Observerte vitale parametere',done:observed,reason:'Vitale målinger og klinisk observasjon gir grunnlag for en strukturert vurdering.'},
   {id:'abcde',label:'Gjennomførte ABCDE-orientert observasjon',done:has(s,'abcde'),reason:'Vurder truede vitale funksjoner systematisk. Håndter alvorlige funn og søk hjelp tidlig.'},
   {id:'mental',label:'Vurderte bevissthetsnivå/ny forvirring',done:has(s,'mental'),reason:'Mentale endringer må vurderes eksplisitt, ikke antas ut fra de øvrige målingene.'},
   {id:'news',label:'Beregnet NEWS2',done:s.enteredNews!==null&&s.enteredNews===objective.total,reason:'Korrekt totalskår er '+objective.total+' med SpO₂-skala 1 og uten oksygentilførsel. Vurder også enkeltparametere.'},
   {id:'contact',label:'Tilkalt helsehjelp ved alvorlig forverring',done:contacted,reason:'I dette fiktive scenarioet tilsier funnene akutt klinisk oppfølging etter lokale rutiner.'},
   {id:'isbar',label:'Strukturerte overleveringen med ISBAR',done:Boolean(s.isbar),reason:'Sjekk selv at du beskriver situasjon, bakgrunn, observasjoner og hva du ber om. Friteksten er ikke maskinvurdert.'}
  ];
  return Object.freeze({score:objective.total,parts:objective.parts,entered:s.enteredNews,
   deteriorated:s.worsened,minutes:s.minutes,items:Object.freeze(items.map(x=>Object.freeze(x))),
   note:'Dette er refleksjonsstøtte, ikke vurdering av klinisk kompetanse. Hendelsesforløpet er manusstyrt, og hvert trinn representerer ikke fysiologiske prognoser.'});
 }
 function finish(s){if(s.finished)return s;return Object.freeze({...s,finished:true})}
 return Object.freeze({caseData,actions,start,has,can,step,recordNews,recordIsbar,finish,debrief,currentVitals,
  referenceNews:s=>Scoring.news2(s.lastVitals||vitals)});
});
