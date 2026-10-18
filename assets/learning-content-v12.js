/* Kartlegg Lær: 4AT and NEWS2 educational content, separated from clinical scoring.
 * Original references: https://www.the4at.com/userguide (4AT v1.2)
 * https://www.rcp.ac.uk/resources/national-early-warning-score-news-2/ (NEWS2 2017).
 * The modules provide original Norwegian educational examples, NOT an official translated form.
 * No personal information, persistence, network calls or AI.
 */
(function(root,factory){
 const four=typeof module==='object'&&module.exports?require('./clinical-tools.js'):root.KartleggTools;
 const news=typeof module==='object'&&module.exports?require('./scoring.js'):root.Scoring;
 const api=factory(four,news);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.KartleggLearningContent=api;
})(typeof globalThis==='undefined'?this:globalThis,function(T,S){
 'use strict';
 if(!T?.fourAT||!S?.news2)throw new Error('Klinisk skåringsmodul mangler');
 const fourParts=Object.freeze([
  {id:'alertness',title:'1 · Årvåkenhet',short:'Observer våkenhet',options:[
   {score:0,label:'0 · Normal / kortvarig søvnighet'},
   {score:4,label:'4 · Tydelig unormal våkenhet'}],
   rule:'Normalt våken, eller lett søvnig i under 10 sekunder etter oppvåkning, gir 0. Tydelig døsig eller agitert gir 4.'},
  {id:'orientation',title:'2 · AMT4',short:'Fire orienteringsspørsmål',options:[
   {score:0,label:'0 · Ingen feil'},
   {score:1,label:'1 · Én feil'},
   {score:2,label:'2 · Minst to feil / ikke testbar'}],
   rule:'Spør etter alder, fødselsdato, sted og årstall. 0 feil = 0, 1 feil = 1, minst 2 feil eller ikke testbar = 2.'},
  {id:'attention',title:'3 · Oppmerksomhet',short:'Måneder baklengs',options:[
   {score:0,label:'0 · Minst sju måneder korrekt'},
   {score:1,label:'1 · Færre enn sju / vil ikke forsøke'},
   {score:2,label:'2 · Kan ikke testes på grunn av tilstand'}],
   rule:'Be pasienten si månedene baklengs fra desember. Minst sju korrekt = 0; under sju eller avslag = 1; kan ikke starte pga. døsighet/sviktende oppmerksomhet = 2.'},
  {id:'acute',title:'4 · Akutt endring',short:'Endring siste to uker',options:[
   {score:0,label:'0 · Ingen kjent akutt endring'},
   {score:4,label:'4 · Akutt endring eller fluktuasjon'}],
   rule:'Betydelig endring i mental funksjon de siste to ukene, fortsatt til stede siste døgn, gir 4. Bruk informasjon fra pårørende, journal eller personale.'}
 ].map(x=>Object.freeze({...x,options:Object.freeze(x.options.map(y=>Object.freeze(y)))})));
 const fourLessons=Object.freeze([
  {id:'basics',name:'Hva er 4AT?',text:'4AT er et kort kartleggingsverktøy ved mistanke om delirium og kognitiv svikt. Fire observasjoner gir samlet 0–12 poeng. Resultatet er ikke i seg selv en diagnose.',focus:['De fire delene har ulike poengalternativer.','Skår ≥4 gir mistanke om delirium og behov for klinisk vurdering.','Skår 0 utelukker ikke delirium.']},
  {id:'alertness',name:'1 · Årvåkenhet',text:fourParts[0].rule,focus:['Observer pasienten før andre oppgaver.','Tydelig unormal våkenhet gir 4 poeng.']},
  {id:'orientation',name:'2 · AMT4',text:fourParts[1].rule,focus:['Et eksempel på ett feil svar gir 1 poeng.','Hvis pasienten ikke kan testes her, gir dette 2 poeng – i motsetning til GCS-NT.']},
  {id:'attention',name:'3 · Oppmerksomhet',text:fourParts[2].rule,focus:['Måneder fra desember tilbake mot juni utgjør sju korrekt oppgitte måneder.','Ikke ville forsøke gir 1. Ikke kunne forsøke på grunn av tilstanden gir 2.']},
  {id:'acute',name:'4 · Akutt endring',text:fourParts[3].rule,focus:['Spør noen som kjenner pasientens vanlige funksjon.','Ny eller varierende forvirring kan være avgjørende selv om pasienten virker våken akkurat nå.']},
  {id:'result',name:'Tolk skåren',text:'0: delirium og moderat/alvorlig kognitiv svikt mindre sannsynlig, men ikke utelukket. 1–3: mulig kognitiv svikt. ≥4: delirium mulig; krever helhetlig klinisk vurdering.',focus:['4AT er ikke en diagnostisk fasit.','Bruk klinisk helhetsvurdering og lokale prosedyrer.']}
 ].map(x=>Object.freeze({...x,focus:Object.freeze(x.focus)})));
 const fourCases=Object.freeze([
  {id:'four-a',name:'Case 1 · Rolig pasient',level:'Øv',summary:'Fiktiv pasient, 76 år. Fullt våken. Svarer korrekt på alder, fødselsdato, sted og årstall. Sier ni måneder korrekt baklengs. Pårørende beskriver ingen akutt endring.',
   observations:{alertness:'Fullt våken og rolig.',orientation:'Alle fire AMT4-svar er korrekte.',attention:'Ni sammenhengende måneder korrekt baklengs.',acute:'Ingen betydelig akutt endring kjent.'},
   parts:{alertness:0,orientation:0,attention:0,acute:0}},
  {id:'four-b',name:'Case 2 · Kognitive vansker',level:'Øv',summary:'Fiktiv pasient, 83 år. Normal våkenhet. Én feil på AMT4. Sier fem måneder korrekt baklengs. Pårørende oppgir at dette ikke er en ny endring siste to uker.',
   observations:{alertness:'Normal våkenhet.',orientation:'Ett feil svar på AMT4.',attention:'Fem korrekt baklengs, pasienten forsøkte selv.',acute:'Ingen ny endring fra vanlig funksjon siste to uker.'},
   parts:{alertness:0,orientation:1,attention:1,acute:0}},
  {id:'four-c',name:'Case 3 · Akutt forandring',level:'Øv',summary:'Fiktiv pasient, 79 år. Tydelig døsig. Kan ikke gjennomføre AMT4 eller måneder baklengs fordi vedkommende er for døsig til å delta. Nær pårørende bekrefter tydelig ny endring siden i går.',
   observations:{alertness:'Markert døsig under vurderingen.',orientation:'Kan ikke testes på grunn av redusert våkenhet.',attention:'Kan ikke starte på grunn av døsighet.',acute:'Akutt endring startet i går og ses fortsatt.'},
   parts:{alertness:4,orientation:2,attention:2,acute:4}},
  {id:'four-d',name:'Case 4 · Vekslande forvirring',level:'Test',summary:'Fiktiv pasient, 70 år. Våken akkurat nå, gjør to feil på AMT4 og avslår å forsøke måneder baklengs. Hjemmesykepleien beskriver ny, varierende desorientering de siste tre dagene.',
   observations:{alertness:'Normal våkenhet nå.',orientation:'To feil av fire på AMT4.',attention:'Pasienten sier nei til å forsøke oppgaven.',acute:'Betydelig ny fluktuasjon i tre dager, også i siste døgn.'},
   parts:{alertness:0,orientation:2,attention:1,acute:4}},
  {id:'four-e',name:'Case 5 · Uten akutt endring',level:'Test',summary:'Fiktiv pasient, 85 år. Våken, gjør tre feil på AMT4, kan ikke starte måneder baklengs på grunn av alvorlig oppmerksomhetssvikt. Journal viser at funksjonsnivået er uendret siste uker.',
   observations:{alertness:'Normalt våken.',orientation:'Tre feil på AMT4.',attention:'Klarer ikke starte på grunn av alvorlig oppmerksomhetssvikt.',acute:'Ingen dokumentert ny eller fluktuerende mental endring.'},
   parts:{alertness:0,orientation:2,attention:2,acute:0}},
  {id:'four-f',name:'Case 6 · Ny desorientering',level:'Test',summary:'Fiktiv pasient, 68 år. Våken og rolig. Korrekt på AMT4 og minst sju måneder korrekt baklengs. Personalet dokumenterte likevel tydelig akutt forvirring i går kveld og igjen i natt.',
   observations:{alertness:'Normal under nåværende observasjon.',orientation:'Null feil på AMT4.',attention:'Sju måneder korrekt baklengs.',acute:'Ny og varierende forvirring i siste døgn.'},
   parts:{alertness:0,orientation:0,attention:0,acute:4}}
 ].map(x=>Object.freeze({...x,observations:Object.freeze(x.observations),parts:Object.freeze(x.parts)})));
 const newsRows=Object.freeze([
  {id:'rr',name:'Respirasjonsfrekvens',unit:'/min',bands:{0:'12–20',1:'9–11',2:'21–24',3:'≤8 / ≥25'}},
  {id:'spo',name:'SpO₂',unit:'%',bands:{0:'Skalaavhengig',1:'Skalaavhengig',2:'Skalaavhengig',3:'Skalaavhengig'}},
  {id:'sbp',name:'Systolisk BT',unit:'mmHg',bands:{0:'111–219',1:'101–110',2:'91–100',3:'≤90 / ≥220'}},
  {id:'hr',name:'Puls',unit:'/min',bands:{0:'51–90',1:'41–50 / 91–110',2:'111–130',3:'≤40 / ≥131'}},
  {id:'temp',name:'Temperatur',unit:'°C',bands:{0:'36,1–38,0',1:'35,1–36,0 / 38,1–39,0',2:'≥39,1',3:'≤35,0'}},
  {id:'consciousness',name:'Bevissthet / ny forvirring',unit:'',bands:{0:'A uten ny forvirring',3:'V/P/U eller ny forvirring'}},
  {id:'oxygen',name:'Tilført oksygen',unit:'',bands:{0:'Nei – romluft',2:'Ja – tilført O₂'}}
 ].map(x=>Object.freeze({...x,bands:Object.freeze(x.bands)})));
 const newsLessons=Object.freeze([
  {id:'basics',name:'Hvorfor NEWS2?',text:'NEWS2 summerer poeng fra respirasjon, SpO₂, systolisk blodtrykk, puls, bevissthet/ny forvirring, temperatur og eventuelt tilført oksygen. Les hele tilstanden, ikke bare totalskåren.',focus:['Hvert felt skåres for seg.','Ett felt med 3 poeng skal vurderes særskilt, også ved lav totalskår.']},
  {id:'vitals',name:'Poenggrenser',text:'Respirasjonsfrekvens, puls, systolisk BT og temperatur har egne grenseområder. I øvingsskjemaet velger du ett poengfelt i hver rad.',focus:['Vær nøye med grenseverdier, særlig 20/21 og 24/25 i RF.','Bruk systolisk BT – ikke diastolisk.']},
  {id:'spo',name:'SpO₂: skala 1 og 2',text:'Skala 1 er standard. Skala 2 brukes bare når dette er bestemt av kvalifisert kliniker på grunnlag av dokumentert hyperkapnisk respirasjonssvikt. Den kan gi poeng ved høye saturasjoner når oksygen tilføres.',focus:['Skala 1: ≥96 = 0; 94–95 = 1; 92–93 = 2; ≤91 = 3.','Skala 2: 88–92 = 0; ved O₂ gir 93–94 = 1, 95–96 = 2, ≥97 = 3.','Tilført oksygen gir i tillegg 2 selvstendige poeng.']},
  {id:'mental',name:'Bevissthet og oksygen',text:'NEWS2 skårer ny forvirring eller V/P/U med 3 poeng. A uten ny forvirring gir 0. Pasient på tilført O₂ får 2 ekstra poeng uansett valgt SpO₂-skala.',focus:['Ny forvirring skåres selv hos pasient som ellers er våken.','Kronisk desorientering er ikke automatisk ny forvirring.']},
  {id:'summary',name:'Tolk hele resultatet',text:'Se totalen, men også 3-poengs enkeltparametere og klinisk bekymring. NEWS2 er observasjonsstøtte, ikke selvstendig diagnose eller lokal behandlingsprosedyre.',focus:['Sammenlign med klinisk tilstand og lokale varslingsrutiner.','Øvingsdelen viser kun fiktive pasientdata.']}
 ].map(x=>Object.freeze({...x,focus:Object.freeze(x.focus)})));
 const n=(rr,spo2,sbp,hr,temp,conscious,confusion,oxygen,scale=1)=>Object.freeze({rr,spo2,sbp,hr,temp,conscious,confusion,oxygen,scale});
 const newsCases=Object.freeze([
  {id:'news-a',name:'Case 1 · Lett avvik',level:'Øv',story:'Fiktiv pasient ved hjemmebesøk. Våken, uten ny forvirring og på romluft. SpO₂-skala 1.',
   v:n(22,95,118,95,37.2,'A',false,false,1)},
  {id:'news-b',name:'Case 2 · Enkeltparameter 3',level:'Øv',story:'Fiktiv pasient med rask respirasjon, men ellers verdier innen 0-poengsområdene. Våken, uten ny forvirring, på romluft. Skala 1.',
   v:n(26,97,122,72,37.0,'A',false,false,1)},
  {id:'news-c',name:'Case 3 · Skala 2 og oksygen',level:'Øv',story:'Fiktiv pasient med dokumentert hyperkapnisk respirasjonssvikt og klinikerbestemt NEWS2 SpO₂-skala 2. Får tilført oksygen. Våken uten ny forvirring.',
   v:n(19,95,114,99,37.0,'A',false,true,2)},
  {id:'news-d',name:'Case 4 · Flere alvorlige avvik',level:'Test',story:'Fiktiv pasient. SpO₂-skala 1. Tilført oksygen og nyoppstått forvirring, selv om pasienten fortsatt er våken.',
   v:n(28,89,94,132,39.3,'A',true,true,1)},
  {id:'news-e',name:'Case 5 · Skala 2 uten O₂',level:'Test',story:'Fiktiv pasient med dokumentert hyperkapnisk respirasjonssvikt og klinikerbestemt NEWS2 SpO₂-skala 2. Puster romluft. Våken og uten ny forvirring.',
   v:n(12,95,123,80,36.8,'A',false,false,2)},
  {id:'news-f',name:'Case 6 · Grenseverdi',level:'Test',story:'Fiktiv pasient, SpO₂-skala 1. Våken uten ny forvirring. Romluft. Se nøye på alle grenseverdier.',
   v:n(25,93,100,111,35.0,'A',false,false,1)}
 ].map(x=>Object.freeze(x)));
 function expected(tool,caseId){
  if(tool==='4at'){
   const q=fourCases.find(x=>x.id===caseId);if(!q)throw new RangeError('Ukjent 4AT-case');
   const r=T.fourAT(q.parts);return {total:r.total,parts:{...r.parts},interpretation:r.interpretation};
  }
  if(tool==='news2'){
   const q=newsCases.find(x=>x.id===caseId);if(!q)throw new RangeError('Ukjent NEWS2-case');
   const r=S.news2(q.v);return {total:r.total,parts:{...r.parts}};
  }
  throw new RangeError('Ukjent læringsmodul');
 }
 function validateAnswer(tool,answer){
  const keys=tool==='4at'?fourParts.map(x=>x.id):tool==='news2'?newsRows.map(x=>x.id):[];
  if(!keys.length||!answer||keys.some(k=>!Number.isInteger(answer[k])))throw new RangeError('Alle felter må skåres');
  if(tool==='4at'){
   for(const row of fourParts)if(!row.options.some(opt=>opt.score===answer[row.id]))throw new RangeError('Ugyldig 4AT-poeng');
  }else{
   for(const row of newsRows)if(!Object.keys(row.bands).some(k=>Number(k)===answer[row.id]))throw new RangeError('Ugyldig NEWS2-poeng');
  }
  return keys;
 }
 function grade(tool,caseId,answer){
  const keys=validateAnswer(tool,answer),truth=expected(tool,caseId);
  const match=Object.fromEntries(keys.map(k=>[k,answer[k]===truth.parts[k]]));
  return Object.freeze({
   score:keys.filter(k=>match[k]).length,max:keys.length,
   exact:keys.every(k=>match[k]),truth:Object.freeze(truth),
   enteredTotal:keys.reduce((sum,k)=>sum+answer[k],0),
   match:Object.freeze(match)
  });
 }

 // Visual teaching grid uses the official NEWS2 score order (3,2,1,0,1,2,3).
 // These positions identify an interval, while the authoritative clinical score
 // is still calculated exclusively by Scoring.news2.
 const newsChartColumns=Object.freeze([3,2,1,0,1,2,3]);
 function newsChartRow(rowId,v){
  if(!v||typeof v!=='object')throw new TypeError('NEWS2-case mangler');
  const labels={
   rr:['≤8','','9–11','12–20','','21–24','≥25'],
   spo:v.scale===1?['≤91','92–93','94–95','≥96','','','']:
    v.oxygen?['≤83','84–85','86–87','88–92','93–94','95–96','≥97']:
    ['≤83','84–85','86–87','≥88 på romluft','','',''],
   sbp:['≤90','91–100','101–110','111–219','','','≥220'],
   hr:['≤40','','41–50','51–90','91–110','111–130','≥131'],
   temp:['≤35,0','','35,1–36,0','36,1–38,0','38,1–39,0','≥39,1',''],
   consciousness:['','','','A uten ny forvirring','','','V/P/U eller ny forvirring'],
   oxygen:['','','','Romluft','','Tilført O₂','']
  }[rowId];
  if(!labels)throw new RangeError('Ukjent NEWS2-rad');
  let answerIndex;
  switch(rowId){
   case 'rr':answerIndex=v.rr<=8?0:v.rr<=11?2:v.rr<=20?3:v.rr<=24?5:6;break;
   case 'spo':
    answerIndex=v.scale===1?(v.spo2<=91?0:v.spo2<=93?1:v.spo2<=95?2:3):
     v.spo2<=83?0:v.spo2<=85?1:v.spo2<=87?2:v.spo2<=92||!v.oxygen?3:v.spo2<=94?4:v.spo2<=96?5:6;
    break;
   case 'sbp':answerIndex=v.sbp<=90?0:v.sbp<=100?1:v.sbp<=110?2:v.sbp<=219?3:6;break;
   case 'hr':answerIndex=v.hr<=40?0:v.hr<=50?2:v.hr<=90?3:v.hr<=110?4:v.hr<=130?5:6;break;
   case 'temp':answerIndex=v.temp<=35?0:v.temp<=36?2:v.temp<=38?3:v.temp<=39?4:5;break;
   case 'consciousness':answerIndex=v.conscious!=='A'||v.confusion?6:3;break;
   case 'oxygen':answerIndex=v.oxygen?5:3;break;
  }
  const clinicalPart=S.news2(v).parts[rowId];
  if(!labels[answerIndex]||newsChartColumns[answerIndex]!==clinicalPart)
   throw new Error('NEWS2-læringsintervallet samsvarer ikke med klinisk skår');
  return Object.freeze({labels:Object.freeze(labels),answerIndex});
 }
 function gradeNewsChart(caseId,answer,cells){
  const q=newsCases.find(x=>x.id===caseId);
  if(!q)throw new RangeError('Ukjent NEWS2-case');
  const scored=grade('news2',caseId,answer);
  if(!cells||typeof cells!=='object')throw new RangeError('Mangler cellevalg');
  const matched={};
  for(const row of newsRows){
   const index=cells[row.id],chart=newsChartRow(row.id,q.v);
   if(!Number.isInteger(index)||index<0||index>=newsChartColumns.length||
      !chart.labels[index]||newsChartColumns[index]!==answer[row.id])
    throw new RangeError('Ugyldig NEWS2-cellevalg');
   matched[row.id]=index===chart.answerIndex;
  }
  return Object.freeze({...scored,score:Object.values(matched).filter(Boolean).length,
   exact:Object.values(matched).every(Boolean),match:Object.freeze(matched)});
 }

 const source=Object.freeze({
  news2:'https://www.rcp.ac.uk/resources/national-early-warning-score-news-2/',
  fourAT:'https://www.the4at.com/userguide',
  license:'https://www.the4at.com/attribution'
 });
 return Object.freeze({fourParts,fourLessons,fourCases,newsRows,newsLessons,newsCases,source,expected,grade,newsChartColumns,newsChartRow,gradeNewsChart});
});
