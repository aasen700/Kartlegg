/* Legemiddelverkstedet: deterministic fictional teaching cases.
 * The engine teaches unit conversion and volume calculation; it never recommends a medicine or dose.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.KartleggMedicationLearning=api;
})(typeof globalThis==='undefined'?this:globalThis,function(){
 'use strict';
 const syringes=Object.freeze([
  Object.freeze({id:'1',label:'1 ml',capacity:1,increment:0.01}),
  Object.freeze({id:'3',label:'3 ml',capacity:3,increment:0.1}),
  Object.freeze({id:'5',label:'5 ml',capacity:5,increment:0.2}),
  Object.freeze({id:'10',label:'10 ml',capacity:10,increment:0.2})
 ]);
 const lessons=Object.freeze([
  Object.freeze({title:'Dose, styrke og volum',body:'Volumet som skal trekkes opp finnes ved å dele ordinert dose på tilgjengelig styrke.',formula:'volum (ml) = dose ÷ styrke (per ml)'}),
  Object.freeze({title:'Hold orden på enhetene',body:'Dose og styrke må uttrykkes i samme masseenhet før du deler. 1 mg er 1000 mikrogram.',formula:'mikrogram ÷ 1000 = milligram'}),
  Object.freeze({title:'Les hele ampulleetiketten',body:'Kontroller både styrken per ml og totalvolumet. En ampulle kan inneholde mer væske enn volumet du skal bruke.',formula:'total mengde = styrke per ml × ampullens ml'}),
  Object.freeze({title:'Velg egnet sprøyte',body:'I oppgavene velger du den minste tilgjengelige treningssprøyten som rommer volumet. Les alltid de faktiske skalastrekene på utstyret du bruker.',formula:'kapasitet ≥ beregnet volum'}),
  Object.freeze({title:'Kontroller før administrasjon',body:'Riktig regnestykke er bare én del av sikker legemiddelhåndtering. Kontroller ordinasjon, legemiddel, styrke, dose, volum, vei og lokale krav til dobbeltkontroll.',formula:'regn · trekk opp · les tilbake · kontroller'})
 ]);
 const cases=Object.freeze([
  Object.freeze({id:'p1',level:'practice',name:'Grunnleggende opptrekk',medicine:'Øvingspreparat A',dose:{amount:0.6,unit:'mg'},strength:{amount:1,unit:'mg',perMl:1},ampouleMl:2}),
  Object.freeze({id:'p2',level:'practice',name:'Mikrogram til milligram',medicine:'Øvingspreparat B',dose:{amount:600,unit:'mcg'},strength:{amount:1,unit:'mg',perMl:1},ampouleMl:1}),
  Object.freeze({id:'p3',level:'practice',name:'Større opptrekksvolum',medicine:'Øvingspreparat C',dose:{amount:4,unit:'mg'},strength:{amount:2,unit:'mg',perMl:1},ampouleMl:5}),
  Object.freeze({id:'t1',level:'test',name:'Testcase 1',medicine:'Øvingspreparat D',dose:{amount:0.25,unit:'mg'},strength:{amount:0.5,unit:'mg',perMl:1},ampouleMl:2}),
  Object.freeze({id:'t2',level:'test',name:'Testcase 2',medicine:'Øvingspreparat E',dose:{amount:750,unit:'mcg'},strength:{amount:1.5,unit:'mg',perMl:1},ampouleMl:2}),
  Object.freeze({id:'t3',level:'test',name:'Testcase 3',medicine:'Øvingspreparat F',dose:{amount:12,unit:'mg'},strength:{amount:4,unit:'mg',perMl:1},ampouleMl:5})
 ]);
 const factor=unit=>unit==='mg'?1:unit==='mcg'?0.001:NaN;
 const caseFor=id=>cases.find(item=>item.id===id)||null;
 const answer=id=>{
  const item=caseFor(id);if(!item)throw new RangeError('Ukjent øvingscase.');
  const doseMg=item.dose.amount*factor(item.dose.unit);
  const strengthMgPerMl=item.strength.amount*factor(item.strength.unit)/item.strength.perMl;
  if(!Number.isFinite(doseMg)||!Number.isFinite(strengthMgPerMl)||doseMg<=0||strengthMgPerMl<=0)throw new RangeError('Ugyldig oppgavedata.');
  const exactMl=doseMg/strengthMgPerMl;
  if(exactMl>item.ampouleMl)throw new RangeError('Oppgaven krever mer enn én oppgitt ampulle.');
  const syringe=syringes.find(option=>option.capacity+1e-9>=exactMl);
  if(!syringe)throw new RangeError('Ingen treningssprøyte rommer volumet.');
  return Object.freeze({doseMg,strengthMgPerMl,exactMl,syringeId:syringe.id});
 };
 const readNumber=(value,label)=>{
  const number=typeof value==='string'&&value.trim()?Number(value.replace(',','.')):Number(value);
  if(!Number.isFinite(number)||number<0||number>10)throw new RangeError(label+' må være et gyldig volum mellom 0 og 10 ml.');
  return number;
 };
 function grade(id,response){
  if(!response||typeof response!=='object')throw new TypeError('Svar mangler.');
  const truth=answer(id),syringe=syringes.find(x=>x.id===String(response.syringeId));
  if(!syringe)throw new RangeError('Velg en treningssprøyte.');
  const calculatedMl=readNumber(response.calculatedMl,'Beregnet volum');
  const drawnMl=readNumber(response.drawnMl,'Opptrukket volum');
  const tolerance=syringe.increment/2+1e-9;
  const match=Object.freeze({
   calculation:Math.abs(calculatedMl-truth.exactMl)<0.000001,
   syringe:syringe.id===truth.syringeId,
   drawn:Math.abs(drawnMl-truth.exactMl)<=tolerance
  });
  return Object.freeze({truth,match,score:Object.values(match).filter(Boolean).length,max:3,tolerance});
 }
 const formatDose=value=>value.amount.toLocaleString('nb-NO')+' '+(value.unit==='mcg'?'mikrogram':'mg');
 return Object.freeze({syringes,lessons,cases,caseFor,answer,grade,formatDose});
});
