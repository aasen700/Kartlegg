/* Kartlegg v0.5 – deterministisk NEWS2/qSOFA. Ingen I/O eller lagring. */
(function(root, factory) {
  const api=factory();
  if (typeof module==='object' && module.exports) module.exports=api;
  else root.Scoring=api;
})(typeof globalThis!=='undefined'?globalThis:this, function(){
  'use strict';
  // Fail closed: scoring may only receive complete, correctly typed clinical observations.
  function numberInRange(value,label,min,max,integer=true){
    if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||(integer&&!Number.isInteger(value)))
      throw new RangeError('Ugyldig '+label);
    return value;
  }
  function newsInput(v){
    if(!v||typeof v!=='object') throw new TypeError('Målinger mangler');
    numberInRange(v.rr,'respirasjonsfrekvens',1,150);
    numberInRange(v.spo2,'SpO2',1,100);
    numberInRange(v.sbp,'systolisk BT',1,350);
    numberInRange(v.hr,'puls',1,300);
    numberInRange(v.temp,'temperatur',25,45,false);
    if(Math.abs(v.temp*10-Math.round(v.temp*10))>1e-7) throw new RangeError('Temperatur krever én desimal');
    if(![1,2].includes(v.scale)) throw new RangeError('Ugyldig SpO2-skala');
    if(!['A','V','P','U'].includes(v.conscious)) throw new RangeError('Ugyldig bevissthetsnivå');
    if(typeof v.confusion!=='boolean'||typeof v.oxygen!=='boolean') throw new RangeError('Mental status og oksygenstatus må være angitt');
  }
  function qInput(v){
    if(!v||typeof v!=='object') throw new TypeError('Målinger mangler');
    numberInRange(v.rr,'respirasjonsfrekvens',1,150);
    numberInRange(v.sbp,'systolisk BT',1,350);
    if(v.gcs!==null&&v.gcs!==undefined)numberInRange(v.gcs,'GCS',3,15);
  }
  function news2(v) {
    newsInput(v);
    const rr = v.rr <= 8 ? 3 : v.rr <= 11 ? 1 : v.rr <= 20 ? 0 : v.rr <= 24 ? 2 : 3;
    let spo;
    if(v.scale === 1) spo = v.spo2 <= 91 ? 3 : v.spo2 <= 93 ? 2 : v.spo2 <= 95 ? 1 : 0;
    else if(v.spo2 <= 83) spo=3;
    else if(v.spo2 <= 85) spo=2;
    else if(v.spo2 <= 87) spo=1;
    else if(v.spo2 <= 92 || !v.oxygen) spo=0;
    else if(v.spo2 <= 94) spo=1;
    else if(v.spo2 <= 96) spo=2;
    else spo=3;
    const sbp=v.sbp<=90?3:v.sbp<=100?2:v.sbp<=110?1:v.sbp<=219?0:3;
    const hr=v.hr<=40?3:v.hr<=50?1:v.hr<=90?0:v.hr<=110?1:v.hr<=130?2:3;
    const temp=v.temp<=35?3:v.temp<=36?1:v.temp<=38?0:v.temp<=39?1:2;
    const consciousness=(v.conscious!=='A'||v.confusion)?3:0;
    const oxygen=v.oxygen?2:0;
    const parts={rr,spo,sbp,hr,temp,consciousness,oxygen};
    return {total:Object.values(parts).reduce((a,b)=>a+b,0),parts};
  }
  function qsofa(v) {
    qInput(v);
    if(v.gcs===null || v.gcs===undefined) return null;
    const parts={rr:v.rr>=22?1:0,sbp:v.sbp<=100?1:0,mentation:v.gcs<15?1:0};
    return {total:Object.values(parts).reduce((a,b)=>a+b,0),parts};
  }
  return Object.freeze({news2,qsofa});
});
