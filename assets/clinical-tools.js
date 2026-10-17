/* Kartlegg v0.7 – pure scoring and escalation utilities; educational prototype only.
 * GCS: glasgowcomascale.org | 4AT: the4at.com (CC BY 4.0 adaptation)
 * NEWS2: Royal College of Physicians (2017) – thresholds and clinical-response context.
 */
(function(root,factory){
 const out=factory();if(typeof module==='object'&&module.exports)module.exports=out;else root.KartleggTools=out;
})(typeof globalThis==='undefined'?this:globalThis,function(){
'use strict';
function numeric(value, min, max, label){
 if(typeof value!=='number'||!Number.isInteger(value)||value<min||value>max)throw new RangeError('Ugyldig '+label);
 return value;
}
function gcs(components){
 if(!components||typeof components!=='object')throw new TypeError('Manglende GCS');
 const {eyes,verbal,motor}=components;
 for(const [value,min,max,name] of [[eyes,1,4,'øyne'],[verbal,1,5,'verbal respons'],[motor,1,6,'motorisk respons']])
  if(value!=='NT')numeric(value,min,max,name);
 if(eyes==='NT'||verbal==='NT'||motor==='NT')
  return {total:null,report:['E'+eyes,'V'+verbal,'M'+motor].join(' '),components:{eyes,verbal,motor},testable:false};
 return {total:eyes+verbal+motor,report:'E'+eyes+' V'+verbal+' M'+motor,components:{eyes,verbal,motor},testable:true};
}
function fourAT(items){
 if(!items||typeof items!=='object')throw new TypeError('Manglende 4AT');
 const {alertness,orientation,attention,acute}=items;
 if(![0,4].includes(alertness))throw new RangeError('Ugyldig årvåkenhet');
 if(![0,1,2].includes(orientation))throw new RangeError('Ugyldig AMT4');
 if(![0,1,2].includes(attention))throw new RangeError('Ugyldig oppmerksomhet');
 if(![0,4].includes(acute))throw new RangeError('Ugyldig akutt endring');
 const total=alertness+orientation+attention+acute;
 return {total,parts:{alertness,orientation,attention,acute},
 interpretation:total>=4?'Forenlig med mulig delirium – krever klinisk vurdering':total>=1?'Mulig kognitiv svikt, uten at delirium kan utelukkes':'Negativ skår utelukker ikke delirium'};
}
function nrs(value){
 numeric(value,0,10,'NRS');
 return {total:value,description:value===0?'Ingen smerte oppgitt':value===10?'Verst tenkelig smerte oppgitt':'Selvrapportert smerteintensitet'};
}
const newsNames={rr:'Respirasjonsfrekvens',spo:'SpO₂',sbp:'Systolisk blodtrykk',hr:'Puls',temp:'Temperatur',consciousness:'Bevissthet/ny forvirring',oxygen:'Tilført oksygen'};
function newsAlert(news){
 if(!news||typeof news!=='object'||!news.parts)throw new TypeError('NEWS2 mangler');
 const keys=Object.keys(newsNames);
 for(const name of keys){if(!Number.isInteger(news.parts[name])||news.parts[name]<0||news.parts[name]>3)throw new RangeError('Ugyldig NEWS2-delpoeng');}
 const sum=keys.reduce((n,key)=>n+news.parts[key],0);
 if(!Number.isInteger(news.total)||news.total!==sum)throw new RangeError('Uoverensstemmende NEWS2-sum');
 const red=keys.filter(k=>news.parts[k]===3).map(k=>newsNames[k]);
 let level='routine',title='NEWS2 = 0',explanation='Fortsett observasjoner og klinisk vurdering etter lokale prosedyrer.';
 if(news.total>=7){level='emergency';title='NEWS2 ≥7 – høy samlet skår';explanation='Krever akutt klinisk respons etter lokale akuttprosedyrer.'}
 else if(news.total>=5){level='urgent';title='NEWS2 5–6 – forhøyet samlet skår';explanation='Krever rask klinisk vurdering og legekontakt etter lokale prosedyrer.'}
 else if(red.length){level='red';title='3 poeng i enkeltparameter';explanation='Informer ansvarlig sykepleier og sørg for rask medisinsk vurdering/legekontakt etter lokale prosedyrer. Ikke vent på en høyere totalskår.'}
 else if(news.total>=1){level='watch';title='NEWS2 1–4';explanation='Informer ansvarlig sykepleier ved avvik eller bekymring. Vurder observasjonsfrekvens og eskalering etter lokale rutiner.'}
 return {level,title,explanation,redParameters:red,notes:'Klinisk forverring krever vurdering uavhengig av skår. Dette er prototypetekst, ikke lokal prosedyre.'};
}
return Object.freeze({gcs,fourAT,nrs,newsAlert});
});
