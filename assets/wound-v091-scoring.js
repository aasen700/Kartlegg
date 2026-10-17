/* Kartlegg v0.9.1: pure wound measurement helpers for SYNTHETIC educational input.
 * Length × width = bounding rectangle estimate, NOT precise wound area.
 * User-calibrated on-screen ruler: CSS pixels / physical reference length.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KartleggWound=api})(typeof globalThis==='undefined'?this:globalThis,()=>{
 'use strict';
 function dimension(n,label){if(typeof n!=='number'||!Number.isFinite(n)||n<=0||n>1000)throw new RangeError('Ugyldig '+label+' (0–1000 mm)');return n}
 function estimate({lengthMm,widthMm,depthMm=null}={}){
  const l=dimension(lengthMm,'lengde'),w=dimension(widthMm,'bredde');
  if(depthMm!==null){if(typeof depthMm!=='number'||!Number.isFinite(depthMm)||depthMm<0||depthMm>1000)throw new RangeError('Ugyldig dybde')}
  return Object.freeze({lengthMm:l,widthMm:w,depthMm,rectangleCm2:l*w/100});
 }
 function ruler({referencePixels,referenceMm=85.60}={}){
  if(typeof referencePixels!=='number'||!Number.isFinite(referencePixels)||referencePixels<80||referencePixels>1000)throw new RangeError('Ugyldig kalibrert lengde');
  if(referenceMm!==85.60)throw new RangeError('Støtter bare bankkortreferansen 85,60 mm');
  const pxPerMm=referencePixels/referenceMm;
  return Object.freeze({referencePixels,referenceMm,pxPerMm,pxPerCm:pxPerMm*10,portraitWidthPixels:Math.round(referencePixels*53.98/85.60),portraitHeightPixels:referencePixels,orientation:'portrait'});
 }
 return Object.freeze({estimate,ruler});
});