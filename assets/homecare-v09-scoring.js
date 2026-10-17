/* Kartlegg v0.9 – pure, intentionally patient-agnostic arithmetic.
   MST: Helsedirektoratet / Ferguson et al. 1999.
   TUG: Helsedirektoratet (>15 seconds is a fall-risk indicator in home-dwelling older adults).
   Orthostatic measurements: standing minus supine differences; NOT a diagnosis.
   ESAS-r: nine standardized dimensions plus optional named symptom. No total score.
*/
(function(root,factory){
 const v=factory();
 if(typeof module==='object'&&module.exports)module.exports=v;else root.KartleggHomeCare=v;
})(typeof globalThis==='undefined'?this:globalThis,()=>{
 'use strict';
 const mstWeights=Object.freeze({no:0,unknown:2,kg1to5:1,kg6to10:2,kg11to15:3,kgOver15:4,kgUnknown:2});
 function mst(weightLoss,reducedIntake){
  if(!Object.prototype.hasOwnProperty.call(mstWeights,weightLoss))throw new RangeError('Velg vektendring');
  if(typeof reducedIntake!=='boolean')throw new RangeError('Velg endring i matinntak');
  const weightPoints=mstWeights[weightLoss];
  const intakePoints=reducedIntake?1:0;
  const total=weightPoints+intakePoints;
  return Object.freeze({weightPoints,intakePoints,total,atRisk:total>=2});
 }
 function integerBP(v,field){
  if(typeof v!=='number'||!Number.isInteger(v)||v<20||v>320)throw new RangeError('Ugyldig '+field);
  return v;
 }
 function pair(p,label){
  if(!p||typeof p!=='object')throw new RangeError('Mangler '+label);
  const sys=integerBP(p.sys,label+' systolisk'),dia=integerBP(p.dia,label+' diastolisk');
  if(sys<=dia)throw new RangeError('Systolisk må overstige diastolisk');
  return {sys,dia};
 }
 function orthostatic({supine,standing1=null,standing3=null}={}){
  const baseline=pair(supine,'liggende blodtrykk');
  if(!standing1&&!standing3)throw new RangeError('Oppgi minst én stående måling');
  const checked={};
  for(const [key,v] of [['minute1',standing1],['minute3',standing3]]){
   if(!v)continue;
   const pressure=pair(v,key);
   const systolicDrop=baseline.sys-pressure.sys;
   const diastolicDrop=baseline.dia-pressure.dia;
   checked[key]=Object.freeze({systolicDrop,diastolicDrop,thresholdMet:systolicDrop>=20||diastolicDrop>=10});
  }
  return Object.freeze({readings:Object.freeze(checked),anyThreshold:Object.values(checked).some(v=>v.thresholdMet)});
 }
 function tug(seconds){
  if(typeof seconds!=='number'||!Number.isFinite(seconds)||seconds<=0||seconds>600)throw new RangeError('Ugyldig tidsmåling');
  return Object.freeze({seconds,over15:seconds>15,referenceSeconds:15});
 }
 const standardSymptoms=Object.freeze(['smerte','slapphet','dosighet','kvalme','matlyst','tungpust','depresjon','angst','velvaere']);
 function esas(values){
  if(!values||typeof values!=='object')throw new RangeError('Mangler ESAS-r-vurdering');
  const out={};
  for(const key of standardSymptoms){
   const n=values[key];
   if(!Number.isInteger(n)||n<0||n>10)throw new RangeError('Ugyldig eller manglende ESAS-r-verdi: '+key);
   out[key]=n;
  }
  const other=values.other;
  if(other!==undefined&&other!==null){
   if(!Number.isInteger(other)||other<0||other>10)throw new RangeError('Ugyldig valgfritt symptom');
   if(typeof values.otherName!=='string'||!values.otherName.trim()||values.otherName.trim().length>80)throw new RangeError('Oppgi navn på annet symptom');
   out.other=other;out.otherName=values.otherName.trim();
  }
  return Object.freeze(out);
 }
 return Object.freeze({mst,orthostatic,tug,esas,standardSymptoms});
});