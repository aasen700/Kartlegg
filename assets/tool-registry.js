/* Kartlegg single source of truth for tool identity, search metadata and launch targets.
 * Clinical calculation/interpretation remains in the separate scoring owners.
 * No patient data, DOM access or persistence in this module.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.KartleggToolRegistry=api;
})(typeof globalThis==='undefined'?this:globalThis,function(){
 'use strict';
 const items=[
  ['news2','NEWS2','Vitale målinger og samlet skår','news score respirasjon oksygen blodtrykk temperatur','.toolbox','assets/scoring.js','assess'],
  ['qsofa','qSOFA','Infeksjon, respirasjon, blodtrykk og GCS','sepsis infeksjon gcs blodtrykk','.toolbox','assets/scoring.js','assess'],
  ['gcs','GCS','Glasgow Coma Scale','glasgow koma bevissthet øyne motor verbal','.tool-launch','assets/clinical-tools.js','assess'],
  ['4at','4AT','Delirium og kognitiv vurdering','delirium kognisjon forvirring','.tool-launch','assets/clinical-tools.js','assess'],
  ['nrs','NRS','Numerisk smerteskala','smerte smerter smerteskala','.tool-launch','assets/clinical-tools.js','assess'],
  ['bmi-bsa','BMI / BSA','Kroppsmasseindeks og kroppsoverflate','bmi bsa høyde vekt kroppsmasseindeks kroppsoverflate','.v08-body-launch','assets/modern-v08-scoring.js','calc'],
  ['resp-timer','Respirasjonstimer','Tell pust i 15, 30 eller 60 sekunder','respirasjonstimer pust pustefrekvens telling timer','#launchRespTimer','assets/modern-v08-scoring.js','calc'],
  ['mst','MST','Ernæringsscreening','ernæring ernæringsrisiko vekttap matlyst malnutrition','[data-homecare="mst"]','assets/homecare-v09-scoring.js','assess'],
  ['tug','TUG','Timed Up and Go','mobilitet gangtest gåtest fall balanse stoppeklokke','[data-homecare="tug"]','assets/homecare-v09-scoring.js','assess'],
  ['esas-r','ESAS-r','Palliativ symptomkartlegging','esas palliasjon smerte kvalme slapphet angst symptom','[data-homecare="esas"]','assets/homecare-v09-scoring.js','assess'],
  ['ortho-bt','Ortostatisk BT','Liggende og stående blodtrykk','ortostatisk hypotensjon blodtrykk svimmelhet sirkulasjon fall','[data-homecare="ortho"]','assets/homecare-v09-scoring.js','calc'],
  ['fast','FAST','Prate, smile, løfte – ring 113 ved mistanke','hjerneslag slag prate smile løfte akutt 113','[data-homecare="fast"]','assets/homecare-v09-ui.js','guide'],
  ['skuv','SKUV','Systematisk klinisk undersøkelse og vurdering','systematisk klinisk undersøkelse vurdering sykepleie','[data-homecare="skuv"]','assets/homecare-v09-ui.js','guide'],
  ['times','TIMES','Sårvurdering og kalibrerbar skjermlinjal','sår sårbehandling sårvurdering linjal sårmål vev sårvæske','#launchTIMES','assets/wound-v091-scoring.js','guide'],
  ['palliasjon','Lindring ved livets slutt','Observasjonstegn, pleietiltak og legemiddelkunnskap','palliasjon terminalpleie medikamentskrin morfin midazolam haloperidol glykopyrronium symptomveileder','#launchPalliation','assets/palliation-v091.js','guide'],
  ['abcde','ABCDE','Interaktiv primærvurdering – A, B, C, D og E','akutt luftvei airway respirasjon breathing sirkulasjon circulation nevrologi disability exposure undersøkelse primærvurdering','#launchABCDE','assets/abcde-v099.js','guide'],
  ['abi','Ankel–arm-indeks','Dopplermålte arm- og ankeltrykk for hvert bein','aai abi ankel arm indeks doppler perifer arteriesykdom sirkulasjon sår','#launchAbi','assets/abi-v12-scoring.js','calc'],
  ['medication-lab','Legemiddelverkstedet','Fiktiv ferdighetstrening i regning, sprøytevalg og opptrekk','legemiddelregning dose styrke volum sprøyte opptrekk ampulle trening','#launchMedicationLab','assets/medication-learning-data-v12.js','learn']
 ];
 const ALL=Object.freeze(items.map(([id,name,detail,terms,launchSelector,owner,category])=>Object.freeze({id,name,detail,terms,launchSelector,owner,category})));
 const BY_ID=new Map(ALL.map(item=>[item.id,item]));
 function get(id){return typeof id==='string' ? BY_ID.get(id)||null : null}
 function search(query){
  const q=String(query||'').trim().toLocaleLowerCase('nb-NO');
  if(!q)return [...ALL];
  const rank=item=>{
   const n=item.name.toLocaleLowerCase('nb-NO');
   return n===q?0:n.startsWith(q)?1:n.includes(q)?2:3;
  };
  return ALL.filter(item=>(item.name+' '+item.detail+' '+item.terms).toLocaleLowerCase('nb-NO').includes(q)).sort((a,b)=>rank(a)-rank(b));
 }
 function sanitizeFavorites(value){
  return [...new Set(Array.isArray(value)?value.filter(id=>typeof id==='string'&&BY_ID.has(id)):[])];
 }
 function linkFor(url,id){
  if(!get(id)&&id!=='isbar')return null;
  const u=new URL(url);
  // Share only the canonical tool ID; never carry arbitrary query parameters.
  u.search='';
  u.searchParams.set('tool',id);
  u.hash=id==='medication-lab'?'laer':(id==='news2'||id==='qsofa'||id==='isbar')?'vurdering':'verktoy';
  return u.href;
 }
 return Object.freeze({all:ALL,get,search,sanitizeFavorites,linkFor});
});
