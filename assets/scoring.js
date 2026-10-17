/* Kartlegg v0.5 – deterministisk NEWS2/qSOFA. Ingen I/O eller lagring. */
(function(root, factory) {
  const api=factory();
  if (typeof module==='object' && module.exports) module.exports=api;
  else root.Scoring=api;
})(typeof globalThis!=='undefined'?globalThis:this, function(){
  'use strict';
  function news2(v) {
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
    if(v.gcs===null || v.gcs===undefined) return null;
    const parts={rr:v.rr>=22?1:0,sbp:v.sbp<=100?1:0,mentation:v.gcs<15?1:0};
    return {total:Object.values(parts).reduce((a,b)=>a+b,0),parts};
  }
  return Object.freeze({news2,qsofa});
});
