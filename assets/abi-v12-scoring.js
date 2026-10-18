/* Ankel–arm-indeks: pure calculation and reporting rules.
 * No DOM, storage, networking or treatment decisions.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.KartleggABI=api;
})(typeof globalThis==='undefined'?this:globalThis,function(){
 'use strict';
 const numeric=(value,label)=>{
  const n=typeof value==='string'&&value.trim()?Number(value.replace(',','.')):Number(value);
  if(!Number.isFinite(n)||n<20||n>300)throw new RangeError(label+' må være mellom 20 og 300 mmHg.');
  return n;
 };
 const classify=value=>value<=0.90
  ?{key:'abnormal',label:'Unormal indeks (≤0,90)',detail:'Forenlig med perifer arteriesykdom i riktig klinisk sammenheng.'}
  :value<=0.99
   ?{key:'borderline',label:'Grenseområde (0,91–0,99)',detail:'Kan kreve videre fysiologisk testing ved symptomer eller klinisk mistanke.'}
   :value<=1.40
    ?{key:'normal',label:'Normalområde (1,00–1,40)',detail:'Normal indeks utelukker ikke perifer arteriesykdom i alle situasjoner.'}
    :{key:'noncompressible',label:'Høy / mulig ikke-komprimerbar indeks (>1,40)',detail:'Tåtrykk eller annen perfusjonsvurdering kan være nødvendig.'};
 function calculate(input){
  if(!input||typeof input!=='object')throw new TypeError('Måleverdier mangler.');
  const armRight=numeric(input.armRight,'Høyre arm');
  const armLeft=numeric(input.armLeft,'Venstre arm');
  const denominator=Math.max(armRight,armLeft);
  const side=(name,dpValue,ptValue)=>{
   const dorsalisPedis=numeric(dpValue,name+' dorsalis pedis');
   const posteriorTibial=numeric(ptValue,name+' tibialis posterior');
   const anklePressure=Math.max(dorsalisPedis,posteriorTibial);
   const raw=anklePressure/denominator;
   const value=Math.round(raw*100)/100;
   return Object.freeze({dorsalisPedis,posteriorTibial,anklePressure,raw,value,...classify(value)});
  };
  return Object.freeze({
   armRight,armLeft,denominator,
   right:side('Høyre ankel',input.rightDp,input.rightPt),
   left:side('Venstre ankel',input.leftDp,input.leftPt)
  });
 }
 return Object.freeze({calculate,classify});
});
