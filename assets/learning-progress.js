/* Kartlegg – fremgang i Lær og simuleringen.
 * Husker bare hvilke deler av en modul som er fullført (Lær, Øv, Test) og siste og beste testresultat.
 * Ingen tidspunkter, ingen svar og ingen pasientdata. Lagres i nettleseren på denne enheten,
 * knyttet til kontoen som er logget inn (som et anonymt nummer, ikke e-post eller navn).
 */
'use strict';
(root=>{
 const KEY='kartlegg.learnProgress.v1';
 const PHASES=Object.freeze(['learn','practice','test']);
 const MAX_COURSES=40;
 function ownerKey(uid){let h=0x811c9dc5;for(const c of String(uid||''))h=Math.imul(h^c.charCodeAt(0),0x01000193)>>>0;return h.toString(36)}
 const validCourse=c=>typeof c==='string'&&/^[\p{L}\p{N} :._-]{1,60}$/u.test(c);
 const validScore=s=>s&&Number.isInteger(s.correct)&&Number.isInteger(s.total)&&s.total>0&&s.total<=1000&&s.correct>=0&&s.correct<=s.total;

 function createStore({storage,owner}={}){
  const listeners=new Set();
  const who=()=>{const uid=typeof owner==='function'?owner():owner;return uid?ownerKey(uid):'lokal'};
  function readAll(){
   try{const d=JSON.parse(storage?.getItem(KEY)||'null');return d&&d.v===1&&d.users&&typeof d.users==='object'?d:{v:1,users:{}}}
   catch(_){return {v:1,users:{}}}
  }
  function writeAll(d){try{storage?.setItem(KEY,JSON.stringify(d));return true}catch(_){return false}}
  function mine(){const d=readAll(),u=d.users[who()];return u&&typeof u==='object'?u:{}}
  function get(course){const c=mine()[course];return c&&typeof c==='object'?{...c}:null}
  function all(){return {...mine()}}
  function record(course,phase,score){
   if(!validCourse(course)||!PHASES.includes(phase))return false;
   const d=readAll(),id=who(),u={...(d.users[id]||{})};
   if(!u[course]&&Object.keys(u).length>=MAX_COURSES)return false;
   const c={...(u[course]||{})};
   const before=JSON.stringify(c);
   c[phase]=true;
   if(validScore(score)){
    const key=phase==='test'?'':phase;
    c[key+'last']=[score.correct,score.total];
    const best=c[key+'best'];
    if(!Array.isArray(best)||score.correct/score.total>best[0]/best[1])c[key+'best']=[score.correct,score.total];
   }
   if(JSON.stringify(c)===before)return true;
   u[course]=c;d.users[id]=u;
   const ok=writeAll(d);
   if(ok)listeners.forEach(fn=>{try{fn(course)}catch(_){}});
   return ok;
  }
  function reset(){
   const d=readAll();delete d.users[who()];
   const ok=Object.keys(d.users).length?writeAll(d):(()=>{try{storage?.removeItem(KEY);return true}catch(_){return false}})();
   listeners.forEach(fn=>{try{fn(null)}catch(_){}});
   return ok;
  }
  function onChange(fn){listeners.add(fn);return()=>listeners.delete(fn)}
  return Object.freeze({get,all,record,reset,onChange,PHASES});
 }

 if(typeof module==='object'&&module.exports){module.exports={createStore,KEY,ownerKey};return}
 let storage;try{storage=root.localStorage}catch(_){}
 root.KartleggLearningProgress=createStore({storage,owner:()=>root.KartleggGate?.owner});
})(typeof globalThis==='undefined'?this:globalThis);
