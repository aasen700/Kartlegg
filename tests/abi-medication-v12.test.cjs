const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ABI=require('../assets/abi-v12-scoring.js');
const MED=require('../assets/medication-learning-data-v12.js');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('AAI uses the highest arm pressure and highest ankle pressure on each side',()=>{
 const value=ABI.calculate({armRight:120,armLeft:126,rightDp:100,rightPt:90,leftDp:140,leftPt:130});
 assert.equal(value.denominator,126);
 assert.equal(value.right.anklePressure,100);
 assert.equal(value.right.value,0.79);
 assert.equal(value.right.key,'abnormal');
 assert.equal(value.left.anklePressure,140);
 assert.equal(value.left.value,1.11);
 assert.equal(value.left.key,'normal');
});

test('AAI report classes follow the published resting ABI intervals',()=>{
 assert.equal(ABI.classify(0.90).key,'abnormal');
 assert.equal(ABI.classify(0.91).key,'borderline');
 assert.equal(ABI.classify(0.99).key,'borderline');
 assert.equal(ABI.classify(1.00).key,'normal');
 assert.equal(ABI.classify(1.40).key,'normal');
 assert.equal(ABI.classify(1.41).key,'noncompressible');
 const rounded=ABI.calculate({armRight:200,armLeft:200,rightDp:181,rightPt:180,leftDp:200,leftPt:200});
 assert.equal(rounded.right.value,0.91);
 assert.equal(rounded.right.key,'borderline');
});

test('AAI rejects incomplete and implausible measurements',()=>{
 assert.throws(()=>ABI.calculate({}),/mellom 20 og 300/);
 assert.throws(()=>ABI.calculate({armRight:19,armLeft:120,rightDp:100,rightPt:100,leftDp:100,leftPt:100}),/Høyre arm/);
 assert.throws(()=>ABI.calculate({armRight:120,armLeft:120,rightDp:301,rightPt:100,leftDp:100,leftPt:100}),/dorsalis pedis/);
});

test('all fictional medication cases have deterministic volume and syringe answers',()=>{
 const expected={p1:[0.6,'1'],p2:[0.6,'1'],p3:[2,'3'],t1:[0.5,'1'],t2:[0.5,'1'],t3:[3,'3']};
 for(const [id,[exactMl,syringeId]] of Object.entries(expected)){
  const answer=MED.answer(id);
  assert.equal(answer.exactMl,exactMl,id+' volume');
  assert.equal(answer.syringeId,syringeId,id+' syringe');
 }
});

test('medication grading checks calculation, syringe and draw-up separately',()=>{
 const exact=MED.grade('p2',{calculatedMl:'0,6',syringeId:'1',drawnMl:0.6});
 assert.deepEqual(exact.match,{calculation:true,syringe:true,drawn:true});
 assert.equal(exact.score,3);
 const mixed=MED.grade('p3',{calculatedMl:2,syringeId:'5',drawnMl:2});
 assert.deepEqual(mixed.match,{calculation:true,syringe:false,drawn:true});
 assert.equal(mixed.score,2);
});

test('new modules are registered, local-only and linked from the page',()=>{
 const registry=require('../assets/tool-registry.js');
 assert.equal(registry.all.length,18);
 assert.equal(registry.get('abi').category,'calc');
 assert.equal(registry.get('medication-lab').category,'learn');
 assert.equal(registry.linkFor('https://example.test/Kartlegg/','medication-lab'),'https://example.test/Kartlegg/?tool=medication-lab#laer');
 const html=read('index.html');
 for(const asset of ['assets/abi-v12-scoring.js','assets/abi-v12-ui.js','assets/medication-learning-data-v12.js','assets/medication-learning-v12.js'])assert.match(html,new RegExp(asset.replaceAll('.','\\.')));
 assert.match(html,/id="learnMedicationModule"/);
 for(const file of ['assets/abi-v12-scoring.js','assets/medication-learning-data-v12.js','assets/abi-v12-ui.js','assets/medication-learning-v12.js']){
  const source=read(file);
  assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon/);
 }
});
