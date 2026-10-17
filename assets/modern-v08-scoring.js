/* Kartlegg v0.8: deterministic arithmetic helpers; adult-focused educational prototype.
 * BMI (WHO): kg/m². Mosteller BSA: sqrt(cm*kg/3600).
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.KartleggV08=api;
})(typeof globalThis==='undefined'?this:globalThis,function(){
 'use strict';
 function finitePositive(x,name){
  if(typeof x!=='number'||!Number.isFinite(x)||x<=0)throw new RangeError('Ugyldig '+name);
  return x;
 }
 function bmiBsa({height,weight,heightUnit='cm',weightUnit='kg'}={}){
  finitePositive(height,'høyde');finitePositive(weight,'vekt');
  if(!['cm','in'].includes(heightUnit)||!['kg','lb'].includes(weightUnit))throw new RangeError('Ukjent måleenhet');
  const cm=height*(heightUnit==='in'?2.54:1);
  const kg=weight*(weightUnit==='lb'?0.45359237:1);
  // Explicitly adult-oriented input range to avoid implying pediatric interpretation.
  if(cm<90||cm>250||kg<20||kg>350)throw new RangeError('Verdier utenfor kalkulatorens støttede område for voksne');
  const bmi=kg/Math.pow(cm/100,2);
  const bsa=Math.sqrt(cm*kg/3600);
  return Object.freeze({bmi,bsa,cm,kg,method:'Mosteller'});
 }
 function respiratoryRate(count,duration){
  if(![15,30,60].includes(duration))throw new RangeError('Varighet må være 15, 30 eller 60 sekunder');
  if(!Number.isInteger(count)||count<0||count>180)throw new RangeError('Ugyldig antall pust');
  const rate=count*60/duration;
  return Object.freeze({count,duration,rate,estimated:duration<60,transferable:Number.isInteger(rate)&&rate>=1&&rate<=150});
 }
 return Object.freeze({bmiBsa,respiratoryRate});
});