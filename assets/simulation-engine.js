/* Kartlegg Simulering v0.3 — four deterministic fictional cases, no AI or persistence.
 * All observations are fictional, educational and scripted, NOT treatment guidance.
 * NEWS2 is delegated to the exact same scoring module as the rest of Kartlegg. The NEWS2 chart
 * (which field belongs to which interval) comes from the Lær module, learning-content-v12.js.
 */
(function(root,factory){
 const node=typeof module==='object'&&module.exports;
 const scoring=node?require('./scoring.js'):root.Scoring;
 // Lær-innholdet lastes etter simuleringen i index.html, så det hentes først når skjemaet brukes.
 const chart=node?(()=>{const c=require('./learning-content-v12.js');return()=>c})():()=>root.KartleggLearningContent;
 const api=factory(scoring,chart);
 if(node)module.exports=api;
 else root.KartleggSimulationEngine=api;
})(typeof globalThis==='undefined'?this:globalThis,function(Scoring,Chart){
 'use strict';
 if(!Scoring?.news2)throw new Error('NEWS2 calculation unavailable');
 const ROW_NAMES=Object.freeze({rr:'Respirasjonsfrekvens',spo:'SpO₂',sbp:'Systolisk BT',hr:'Puls',temp:'Temperatur',consciousness:'Bevissthet / ny forvirring',oxygen:'Tilført oksygen'});
 const ROWS=Object.freeze(Object.keys(ROW_NAMES));
 const SOURCES=Object.freeze([
  Object.freeze({name:'RCP – NEWS2 (2017)',url:'https://www.rcp.ac.uk/resources/national-early-warning-score-news-2/'}),
  Object.freeze({name:'Resuscitation Council UK – ABCDE',url:'https://www.resus.org.uk/library/abcde-approach'})
 ]);
 const WARNING='Alle pasientdata og hendelser i denne øvelsen er fiktive. Bruk ikke øvingsresultater i reell pasientbehandling.';
 const actions=Object.freeze([
  Object.freeze({id:'symptoms',category:'Samtale',label:'Spør om symptomforløpet',minutes:2}),
  Object.freeze({id:'history',category:'Samtale',label:'Spør om tidligere sykdom og medisiner',minutes:2}),
  Object.freeze({id:'relative',category:'Samtale',label:'Spør pårørende eller kollega',minutes:2}),
  Object.freeze({id:'abcde',category:'Undersøkelser',label:'Utfør en ABCDE-orientert observasjon',minutes:3}),
  Object.freeze({id:'vitals',category:'Undersøkelser',label:'Mål vitale parametere',minutes:3}),
  Object.freeze({id:'mental',category:'Undersøkelser',label:'Vurder bevissthet og forvirring',minutes:2}),
  Object.freeze({id:'skin',category:'Undersøkelser',label:'Se på hud og sirkulasjon',minutes:2}),
  Object.freeze({id:'glucose',category:'Undersøkelser',label:'Mål blodsukker',minutes:2}),
  Object.freeze({id:'contact',category:'Kommunikasjon',label:'Tilkall ansvarlig helsehjelp',minutes:1}),
  Object.freeze({id:'reevaluate',category:'Undersøkelser',label:'Gjenta observasjoner',minutes:3}),
  Object.freeze({id:'wait',category:'Prioritering',label:'Avvent og observer uten nye tiltak',minutes:5})
 ]);
 const map=new Map(actions.map(a=>[a.id,a]));
 const CONTACT='Du varsler ansvarlig helsehjelp og beskriver akutt forverring. Videre respons og tiltak må styres av klinisk vurdering og lokale akuttprosedyrer.';
 const REEVALUATE='Du tar nye målinger. Les oppdaterte verdier i øvingspanelet og vurder endringene.';
 const VITALS='Du registrerer et fullt sett med vitale parametere. Verdiene står i NEWS2-skjemaet og under «Målinger».';
 // Hver kasus: faste, fiktive målinger før og etter en manusstyrt forverring, og en tekst per handling.
 // [vanlig, etter forverring]. Tekstene beskriver funn, ikke behandling.
 const freezeCase=c=>Object.freeze({...c,vitals:Object.freeze(c.vitals),worse:Object.freeze(c.worse),
  text:Object.freeze(c.text),key:Object.freeze(c.key),isbar:Object.freeze(c.isbar),
  images:Object.freeze({stable:'assets/sim/'+c.id+'-stable.svg',worse:'assets/sim/'+c.id+'-worse.svg'}),sources:SOURCES,warning:WARNING,worsenAt:c.worsenAt||12});
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
    wait:['Du avventer i fem simulerte minutter. Pasienten er fortsatt tungpustet.','Mens du avventer, blir pasienten mer medtatt og nyoppstått forvirret i dette forhåndsdefinerte scenarioet.'],
    relative:['Datteren ringte i går og syntes Kari virket mer slapp enn vanlig. Hun har spist og drukket lite de siste to dagene.'],
    skin:['Huden er varm og litt blek. Kapillær fylningstid er omtrent 2 sekunder.','Hender og føtter er kalde og klamme, og kapillær fylningstid er forlenget, over 3 sekunder.'],
    glucose:['Blodsukkeret er 7,2 mmol/L.']
   },
   lesson:'Høy samlet skår og flere avvikende målinger samtidig. Poenget er å se helheten tidlig og ikke vente med å si fra.',
   key:{action:'abcde',label:'Fikk oversikt med ABCDE tidlig',reason:'Her er det flere avvik samtidig: rask pust, lav SpO₂, lavt blodtrykk, høy puls og feber. En rask ABCDE-gjennomgang gir helheten før du ringer.'},
   isbar:{s:'Jeg ringer om Kari, 82 år, som jeg er hos på hjemmebesøk. Hun er blitt mye tyngre i pusten i dag, og NEWS2 er 11.',b:'Hun har høyt blodtrykk og er vanligvis i stand til å gå korte turer. Siden i går har hun hatt økende tungpust, hoste og frostanfall.',a:'RF 28, SpO₂ 91 % på romluft, BT 98 systolisk, puls 118, temperatur 38,6. Hun er våken og orientert, men snakker i korte setninger. Jeg er bekymret for at hun er alvorlig syk.',r:'Jeg ber deg vurdere henne nå. Hva ønsker du at jeg gjør og observerer til du kommer, og når skal jeg måle på nytt?'}
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
    wait:['Du avventer i fem simulerte minutter. Olav fortsetter å prøve å gå ut av rommet.','Mens du avventer, blir Olav blekere og mer medtatt i dette forhåndsdefinerte scenarioet.'],
    relative:['Datteren forteller på telefon at Olav var klar og spøkte med henne i går formiddag. Hun synes dette er en tydelig endring fra hvordan han pleier å være.'],
    skin:['Huden er varm og tørr, og munnen er tørr. Urinen i bleien er mørk og lukter sterkt.','Huden er marmorert på knærne, og hender og føtter er kalde.'],
    glucose:['Blodsukkeret er 9,8 mmol/L. Ifølge dokumentasjonen ligger det vanligvis litt lavere.']
   },
   lesson:'Ny forvirring gir alene 3 poeng i NEWS2. Sammenlign alltid med hvordan pasienten pleier å være. Kjent kognitiv svikt er ikke det samme som ny forvirring.',
   key:{action:'relative',label:'Fant ut hvordan Olav pleier å være',reason:'Datteren bekrefter at forvirringen er ny. Uten å vite hvordan pasienten pleier å være, er det lett å tro at forvirringen skyldes kjent kognitiv svikt.'},
   isbar:{s:'Jeg ringer fra sykehjemmet om Olav, 88 år. Han er blitt akutt forvirret i kveld, og NEWS2 er 9.',b:'Han har lett kognitiv svikt, men er vanligvis orientert for sted. Datteren bekrefter at han var klar i går. Han har hjertesvikt og diabetes type 2, har drukket lite i to dager og har mørk urin.',a:'RF 22, SpO₂ 95 %, BT 104 systolisk, puls 108, temperatur 38,4. Han er våken, men desorientert og urolig. Ny forvirring gir 3 poeng.',r:'Jeg ber deg vurdere ham i kveld. Hvor ofte vil du at vi observerer ham, og når skal vi ringe igjen?'}
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
    wait:['Du avventer i fem simulerte minutter. Nora ligger nå i sengen og sier at det går litt bedre når hun ligger.','Mens du avventer, blir Nora blekere og mer slapp i dette forhåndsdefinerte scenarioet.'],
    relative:['Nattevakten forteller at Nora hadde lite urin i natt og var tørst. Hun sa at hun følte seg svimmel allerede da.'],
    skin:['Nora er blek og litt klam. Kapillær fylningstid er omtrent 3 sekunder. Bandasjen er mer gjennomfuktet enn ved forrige stell.','Nora er blek, kald og klam. Kapillær fylningstid er over 3 sekunder, og bandasjen er tydelig mer gjennomfuktet.'],
    glucose:['Blodsukkeret er 6,1 mmol/L, innenfor vanlig område.']
   },
   lesson:'NEWS2 er lav i starten, men pulsen er mye høyere enn i går, og det er nye funn ved bandasjen. En lav skår utelukker ikke at noe er galt. Se på trend og helhet, og si fra om det du ser.',
   key:{action:'skin',label:'Så på hud, sirkulasjon og bandasje',reason:'Blek og klam hud, forlenget kapillær fylningstid og en bandasje som er mer gjennomfuktet er viktige funn. Her sier de mer enn den lave NEWS2-skåren.'},
   isbar:{s:'Jeg ringer om Nora, 67 år, dag 1 etter hofteoperasjon. Hun er svimmel og blek, og pulsen har steget fra rundt 85 i går til 112 nå.',b:'Hun er vanligvis frisk og bruker blodtrykksmedisin. I natt hadde hun lite urin og var tørst.',a:'NEWS2 er 3, men puls 112 og BT 102 systolisk. Hun er blek og klam, kapillær fylningstid er omtrent 3 sekunder, og bandasjen er mer gjennomfuktet enn ved forrige stell. Jeg er bekymret selv om skåren er lav.',r:'Jeg ber deg se på henne nå. Hva vil du at jeg skal observere og måle til du kommer?'}
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
    wait:['Du avventer i fem simulerte minutter. Turid er fortsatt tungpust.','Mens du avventer, blir Turid trøttere og mer omtåket i dette forhåndsdefinerte scenarioet.'],
    relative:['Mannen hennes forteller at Turid har vært trøttere de siste dagene og har brukt inhalatoren oftere enn vanlig.'],
    skin:['Huden er varm, og leppene har vanlig farge.','Leppene er blålige, og hun er varm og svett.'],
    glucose:['Blodsukkeret er 8,4 mmol/L.']
   },
   lesson:'Med SpO₂-skala 2 gir 88–92 % på oksygen 0 poeng for SpO₂, men oksygentilførselen gir alltid 2 poeng. Skala 2 brukes bare når det er bestemt og dokumentert. Ny forvirring hos en pasient med KOLS er viktig å si fra om.',
   key:{action:'mental',label:'Vurderte om Turid er blitt trøtt eller forvirret',reason:'Økende trøtthet og ny forvirring hos en pasient med KOLS og kjent hyperkapnisk respirasjonssvikt er viktig å fange opp og si fra om.'},
   isbar:{s:'Jeg ringer om Turid, 74 år, på lungeavdelingen. Hun er mer tungpust i dag, og NEWS2 er 5 med SpO₂-skala 2.',b:'Hun har alvorlig KOLS med kjent hyperkapnisk respirasjonssvikt. Skala 2 er bestemt og dokumentert av lege. Hun får oksygen på nesekateter etter ordinasjon.',a:'RF 24, SpO₂ 89 % på oksygen, BT 128 systolisk, puls 98, temperatur 37,6. Hun bruker hjelpemuskulatur, men er våken og orientert.',r:'Jeg ber deg vurdere henne i løpet av morgenrunden. Skal jeg observere oftere, og hva vil du at jeg skal se særlig etter?'}
  })
 ]);
 const byId=new Map(cases.map(c=>[c.id,c]));
 const caseData=cases[0];
 const caseOf=s=>byId.get(s?.caseId)||caseData;
 function start(id){
  const c=byId.get(id)||caseData;
  return Object.freeze({caseId:c.id,minutes:0,worsened:false,finished:false,
   done:Object.freeze([]),timeline:Object.freeze([]),lastVitals:null,enteredNews:null,isbar:null,charts:Object.freeze([])});
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
  const now={...s,minutes,worsened,worsenedAt:s.worsenedAt??(worsened&&!s.worsened?minutes:null),done:Object.freeze([...s.done,id]),
   lastVitals:(id==='vitals'||id==='reevaluate')?Object.freeze({...(worsened?c.worse:c.vitals)}):s.lastVitals};
  // Hver nye måling får sitt eget NEWS2-skjema. Det forrige beholdes til oppsummeringen.
  if(id==='vitals'||id==='reevaluate'){
   now.charts=Object.freeze([...(s.charts||[]),Object.freeze({minute:minutes,vitals:now.lastVitals,cells:Object.freeze({})})]);
   now.enteredNews=null;
  }
  const update={...now,timeline:Object.freeze([...s.timeline,Object.freeze({
   minute:minutes,id,label:action.label,text:narrative(now,id)
  })])};
  return Object.freeze(update);
 }
 function chartApi(){const c=Chart();if(!c?.newsChartRow||!c?.newsChartColumns)throw new Error('NEWS2-skjemaet er ikke lastet');return c}
 function chartRow(rowId,v){return chartApi().newsChartRow(rowId,v)}
 // Brukeren trykker på ett felt per rad i skjemaet for siste måling. Summen regnes ut når alle rader er valgt.
 function recordNewsCell(s,rowId,index){
  if(s.finished)throw new RangeError('Øvingen er avsluttet');
  const charts=s.charts||[],current=charts.at(-1);
  if(!current)throw new RangeError('Mål vitale parametere før NEWS2 registreres');
  if(!ROWS.includes(rowId))throw new RangeError('Ukjent NEWS2-rad');
  const columns=chartApi().newsChartColumns,row=chartRow(rowId,current.vitals);
  if(!Number.isInteger(index)||index<0||index>=columns.length||!row.labels[index])throw new RangeError('Ugyldig NEWS2-felt');
  const cells=Object.freeze({...current.cells,[rowId]:index});
  const complete=ROWS.every(r=>Number.isInteger(cells[r]));
  const updated=Object.freeze({...current,cells});
  return Object.freeze({...s,charts:Object.freeze([...charts.slice(0,-1),updated]),
   enteredNews:complete?ROWS.reduce((sum,r)=>sum+columns[cells[r]],0):null});
 }
 function chartSum(chart){const columns=chartApi().newsChartColumns;return ROWS.reduce((sum,r)=>sum+(Number.isInteger(chart.cells[r])?columns[chart.cells[r]]:0),0)}
 function gradeChart(chart){
  const truth=Scoring.news2(chart.vitals);
  const rows=ROWS.map(id=>{
   const row=chartRow(id,chart.vitals),chosen=chart.cells[id];
   return Object.freeze({id,name:ROW_NAMES[id],chosen:Number.isInteger(chosen)?row.labels[chosen]:null,
    correct:row.labels[row.answerIndex],points:truth.parts[id],ok:chosen===row.answerIndex});
  });
  const answered=rows.filter(r=>r.chosen!==null).length;
  return Object.freeze({minute:chart.minute,vitals:chart.vitals,total:truth.total,entered:chartSum(chart),answered,
   complete:answered===ROWS.length,correctRows:rows.filter(r=>r.ok).length,rows:Object.freeze(rows)});
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
  const charts=(s.charts||[]).filter(ch=>Object.keys(ch.cells).length).map(gradeChart);
  const lastChart=(s.charts||[]).length?gradeChart(s.charts.at(-1)):null;
  const newsDone=lastChart&&lastChart.answered?lastChart.complete&&lastChart.correctRows===ROWS.length:
   s.enteredNews!==null&&s.enteredNews===objective.total;
  const newsReason=lastChart&&lastChart.answered?
   'Du valgte riktig felt i '+lastChart.correctRows+' av '+ROWS.length+' rader i siste skjema. Riktig totalskår er '+objective.total+' med SpO₂-skala '+v.scale+(v.oxygen?' og oksygentilførsel':' og uten oksygentilførsel')+'.':
   'Korrekt totalskår er '+objective.total+' med SpO₂-skala '+v.scale+(v.oxygen?' og oksygentilførsel':' og uten oksygentilførsel')+'. Vurder også enkeltparametere.';
  const items=[
   {id:'vitals',label:'Observerte vitale parametere',done:observed,reason:'Vitale målinger og klinisk observasjon gir grunnlag for en strukturert vurdering.'},
   {id:'abcde',label:'Gjennomførte ABCDE-orientert observasjon',done:has(s,'abcde'),reason:'Vurder truede vitale funksjoner systematisk. Håndter alvorlige funn og søk hjelp tidlig.'},
   {id:'mental',label:'Vurderte bevissthetsnivå/ny forvirring',done:has(s,'mental'),reason:'Mentale endringer må vurderes eksplisitt, ikke antas ut fra de øvrige målingene.'},
   {id:'news',label:'Skåret NEWS2 riktig',done:Boolean(newsDone),reason:newsReason},
   {id:'contact',label:'Tilkalt helsehjelp ved alvorlig forverring',done:contacted,reason:'I dette fiktive scenarioet tilsier funnene akutt klinisk oppfølging etter lokale rutiner.'},
   {id:'key',label:c.key.label,done:has(s,c.key.action),reason:c.key.reason},
   {id:'isbar',label:'Strukturerte overleveringen med ISBAR',done:Boolean(s.isbar),reason:'Sjekk selv at du beskriver situasjon, bakgrunn, observasjoner og hva du ber om. Friteksten er ikke maskinvurdert.'}
  ];
  const fb=feedback(s,c,{charts,lastChart,objective});
  return Object.freeze({caseId:c.id,lesson:c.lesson,isbarExample:c.isbar,charts:Object.freeze(charts),
   good:fb.good,improve:fb.improve,timeline:fb.timeline,worsenedAt:s.worsenedAt??null,
   achieved:items.filter(x=>x.done).length,score:objective.total,parts:objective.parts,entered:s.enteredNews,
   deteriorated:s.worsened,minutes:s.minutes,items:Object.freeze(items.map(x=>Object.freeze(x))),
   note:'Dette er refleksjonsstøtte, ikke vurdering av klinisk kompetanse. Hendelsesforløpet er manusstyrt, og hvert trinn representerer ikke fysiologiske prognoser.'});
 }
 // Konkret tilbakemelding: hva som gikk bra, hva som kan bli bedre, og en tidslinje med merknader.
 // Reglene er de samme for alle casene. Tekstene beskriver øvingen, ikke klinisk kompetanse.
 function feedback(s,c,{charts,lastChart,objective}){
  const good=[],improve=[];
  const at=id=>s.timeline.find(e=>e.id===id)?.minute??null;
  const add=(list,id,title,text)=>list.push(Object.freeze({id,title,text}));
  const worseAt=s.worsenedAt??null;
  const vitalsAt=at('vitals'),contactAt=at('contact');
  if(vitalsAt!==null)add(good,'vitals','Du målte vitale parametere'+(vitalsAt<=6?' tidlig':''),'Etter '+vitalsAt+' min. Målingene ga grunnlaget for NEWS2.');
  else add(improve,'vitals','Mål vitale parametere','Du tok ingen målinger. Uten dem kan du ikke regne ut NEWS2 eller se hvordan pasienten utvikler seg.');
  // Det viktigste funnet i casen får egen tekst, så det ikke står to ganger.
  if(c.key.action==='abcde');
  else if(has(s,'abcde'))add(good,'abcde','Du gikk systematisk gjennom ABCDE','Det gir oversikt over truede funksjoner før du bestemmer deg.');
  else add(improve,'abcde','Gå gjennom ABCDE','En rask ABCDE-gjennomgang gir helheten og avslører funn som ikke vises i tallene.');
  if(c.key.action==='mental');
  else if(has(s,'mental'))add(good,'mental','Du vurderte bevissthet og forvirring','Ny forvirring gir 3 poeng i NEWS2 og må vurderes direkte.');
  else add(improve,'mental','Vurder bevissthet og forvirring','Du sjekket ikke dette. Ny forvirring gir 3 poeng og er lett å overse hvis du ikke spør og observerer.');
  if(has(s,c.key.action))add(good,'key',c.key.label,c.key.reason);
  else add(improve,'key',c.key.label.replace(/^Fikk|^Fant|^Så|^Vurderte/,m=>({Fikk:'Få',Fant:'Finn',Så:'Se',Vurderte:'Vurder'})[m]),c.key.reason);
  // NEWS2: rad for rad.
  if(lastChart&&lastChart.complete&&lastChart.correctRows===ROWS.length)add(good,'news','Du skåret NEWS2 riktig','Alle sju radene var riktige. NEWS2 var '+lastChart.total+' poeng.');
  else if(charts.length){
   const last=charts.at(-1),wrong=last.rows.filter(r=>!r.ok);
   add(improve,'news','Se over NEWS2-skåringen',(last.complete?'Din sum var '+last.entered+', riktig er '+last.total+'. ':'Skjemaet ble ikke fullført. ')+
    (wrong.length?'Sjekk '+wrong.map(r=>r.name.toLowerCase()+(r.chosen?' (du valgte '+r.chosen+', riktig er '+r.correct+')':' (ikke valgt, riktig er '+r.correct+')')).join(', ')+'.':''));
  }else if(vitalsAt!==null)add(improve,'news','Skår NEWS2','Du målte, men skåret ikke NEWS2 i skjemaet. Riktig skår var '+objective.total+'.');
  // Når ringte du?
  if(contactAt!==null&&(worseAt===null||contactAt<worseAt))add(good,'contact','Du tilkalte hjelp i tide','Etter '+contactAt+' min, før pasienten ble dårligere.');
  else if(contactAt!==null)add(improve,'contact','Si fra tidligere','Du tilkalte hjelp etter '+contactAt+' min, men pasienten ble dårligere etter '+worseAt+' min. Funnene var tydelige tidligere.');
  else add(improve,'contact','Tilkall hjelp','Du ringet ikke etter hjelp. I denne casen tilsier funnene at noen med mer kompetanse vurderer pasienten raskt.');
  const waits=s.done.filter(x=>x==='wait').length;
  if(waits)add(improve,'wait','Vær forsiktig med å avvente','Du valgte å avvente '+(waits===1?'én gang':waits+' ganger')+' uten nye tiltak mens pasienten var tydelig syk'+(worseAt!==null?', og pasienten ble dårligere':'')+'.');
  if(worseAt!==null&&has(s,'reevaluate')&&at('reevaluate')>=worseAt)add(good,'reevaluate','Du målte på nytt etter forverringen','Nye målinger viste hvor mye pasienten hadde endret seg.');
  else if(worseAt!==null)add(improve,'reevaluate','Mål på nytt når pasienten endrer seg','Pasienten ble dårligere etter '+worseAt+' min, men du tok ikke nye målinger etterpå.');
  if(s.isbar)add(good,'isbar','Du skrev en ISBAR','Sammenlign med eksempelet nedenfor. Fikk du med det mottakeren trenger?');
  else add(improve,'isbar','Øv på ISBAR','Du skrev ikke ISBAR. Prøv neste gang, og sammenlign med eksempelet nedenfor.');
  // Tidslinje med merknader.
  const note={vitals:'good',abcde:'good',mental:'good',contact:worseAt===null||contactAt<worseAt?'good':'late',wait:'warn',reevaluate:'good',[c.key.action]:'good'};
  const timeline=[];
  for(const e of s.timeline){
   if(worseAt!==null&&e.minute>=worseAt&&!timeline.some(x=>x.id==='worse'))timeline.push(Object.freeze({minute:worseAt,id:'worse',label:'Pasienten ble dårligere',tag:'event'}));
   timeline.push(Object.freeze({minute:e.minute,id:e.id,label:e.label,tag:note[e.id]||'neutral'}));
  }
  return {good:Object.freeze(good),improve:Object.freeze(improve),timeline:Object.freeze(timeline)};
 }
 function finish(s){if(s.finished)return s;return Object.freeze({...s,finished:true})}
 return Object.freeze({caseData,cases,getCase:id=>byId.get(id)||null,actions,start,has,can,step,recordNews,recordNewsCell,chartRow,chartSum,gradeChart,rowNames:ROW_NAMES,rows:ROWS,recordIsbar,finish,debrief,currentVitals,
  referenceNews:s=>Scoring.news2(s.lastVitals||caseOf(s).vitals)});
});
