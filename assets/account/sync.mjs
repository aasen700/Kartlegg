import {settings,same,reconcile} from './model.mjs';
export class SyncSession {
 constructor({backend,read,apply,notify,storage}){Object.assign(this,{backend,read,apply,notify,storage});this.generation=0;this.active=false;this.busy=false;this.applying=false;this.uid=null;this.remote=null;this.base=null;this.conflict=null;this.timer=null;this.unsubscribe=null;this.deleting=false;this.deferred=null}
 emit(message){this.notify(message,this)}
 key(){return 'kartlegg.account.pending.v1.'+this.uid}
 cache(){if(!this.uid)return;try{if(!this.storage)throw Error('storage unavailable');this.storage.setItem(this.key(),JSON.stringify({settings:settings(this.read()),base:this.base,revision:this.revision||0}))}catch(_){this.emit('Endringene finnes bare i denne fanen fordi nettleseren avviser lokal lagring. Hold fanen åpen til synkronisering er bekreftet.')}}
 stop(){this.generation++;clearTimeout(this.timer);this.unsubscribe?.();this.unsubscribe=null;this.active=false;this.uid=null;this.conflict=null;this.base=null;this.remote=null;this.busy=false;this.deleting=false;this.deferred=null}
 async start(uid){
  this.stop();this.uid=uid;const generation=this.generation;this.initial= settings(this.read());
  try{const p=JSON.parse(this.storage?.getItem(this.key())||'null');if(p?.settings){this.initial=settings(p.settings);this.emit('Ulagrede kontoendringer fra denne enheten er funnet. Velg hvordan de skal brukes.')}}catch(_){}
  this.emit('Henter kontoinnstillinger …');
  try{const remote=await this.backend.read(uid);if(generation!==this.generation)return;this.remote=remote;this.revision=remote?.revision||0;this.conflict={local:this.initial,remote:remote?.settings||null,first:true};this.emit('Velg innstillinger for kontoen. Ingen lokale data er lastet opp.');}
  catch(e){if(generation===this.generation)this.emit(e)}
 }
 applyValue(value){this.applying=true;try{this.apply(settings(value))}finally{this.applying=false}}
 async choose(which){
  if(!this.uid||!this.conflict||this.busy||this.deleting)return;
  const c=this.conflict, value=which==='cloud'?c.remote:c.local;
  if(!value)return;
  this.base=this.remote?.settings||null;this.revision=this.remote?.revision||0;
  this.applyValue(value);this.active=true;this.conflict=null;this.cache();
  if(!this.unsubscribe){const generation=this.generation;this.unsubscribe=this.backend.watch(this.uid,d=>{if(generation===this.generation)this.receive(d)},e=>{if(generation===this.generation){if(e.code==='account-deleting'){this.deleting=true;this.active=false;clearTimeout(this.timer)}this.emit(e)}})}
  if(which==='cloud'){
   this.base=settings(value);this.clearPending();this.emit('Kontoinnstillingene er hentet.');
  }else await this.save();
 }
 clearPending(){try{this.storage?.removeItem(this.key())}catch(_){}}
 receive(remote){
  if(!this.active||this.deleting)return;
  if(!remote){this.active=false;this.emit(Object.assign(Error(),{code:'account-deleting'}));return}
  if(remote.revision<(this.revision||0))return;
  if(this.busy){this.deferred=remote;return}
  const local=settings(this.read()), result=reconcile(this.base,local,remote.settings);
  this.remote=remote;
  if(result==='conflict'){
   this.conflict={local,remote:remote.settings,first:false};this.cache();this.emit(Object.assign(Error(),{code:'conflict'}));return;
  }
  this.revision=remote.revision;this.base=settings(remote.settings);
  if(result==='remote'||result==='equal') {this.applyValue(remote.settings);this.clearPending();this.conflict=null;this.emit('Synkronisert med kontoen.');}
  else {this.cache();this.emit('Lokale endringer venter på synkronisering.');}
 }
 changed(){
  if(this.applying||!this.uid||!this.active||this.deleting)return;
  this.cache();clearTimeout(this.timer);
  if(this.conflict){this.conflict.local=settings(this.read());this.emit('Både enheten og kontoen har endringer. Velg versjon før synkronisering.');return}
  this.emit('Lagrer innstillinger …');this.timer=setTimeout(()=>this.save(),900);
 }
 async save(){
  if(!this.active||this.conflict||this.busy||this.deleting)return;
  const generation=this.generation, uid=this.uid, value=settings(this.read());
  if(this.base&&same(value,this.base)){this.clearPending();this.emit('Synkronisert med kontoen.');return}
  this.busy=true;this.cache();this.emit('Synkroniserer …');
  try{
   const saved=await this.backend.write(uid,value,this.revision||0);
   if(generation!==this.generation)return;
   this.remote=saved;this.revision=saved.revision;this.base=value;
   if(same(this.read(),value)){this.clearPending();this.emit('Synkronisert med kontoen.')}else{this.cache();this.emit('Nye endringer venter på synkronisering.');this.timer=setTimeout(()=>this.save(),900)}
  }catch(e){
   if(generation!==this.generation)return;
   if(e.code==='conflict'){
    try{this.remote=await this.backend.read(uid);if(generation!==this.generation)return;this.conflict={local:settings(this.read()),remote:this.remote?.settings||null,first:false};}catch(readError){this.emit(readError)}
   }
   this.emit(e);
  }finally{if(generation===this.generation){this.busy=false;if(this.deferred){const d=this.deferred;this.deferred=null;this.receive(d)}}}
 }
 async retry(){
  if(!this.uid||this.busy||this.deleting)return;
  if(!this.active)return this.start(this.uid);
  const generation=this.generation;
  try{const d=await this.backend.read(this.uid);if(generation!==this.generation)return;this.receive(d);if(!this.conflict)await this.save()}catch(e){if(generation===this.generation)this.emit(e)}
 }
 async remove(){
  if(this.busy)throw Object.assign(Error(),{code:'unavailable'});
  this.deleting=true;this.active=false;clearTimeout(this.timer);this.unsubscribe?.();this.unsubscribe=null;
  try{await this.backend.remove();this.clearPending()}catch(e){this.emit(e);throw e}
 }
}
