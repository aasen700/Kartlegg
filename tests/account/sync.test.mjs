import test from 'node:test';
import assert from 'node:assert/strict';
import {SyncSession} from '../../assets/account/sync.mjs';
import {settings,documentData} from '../../assets/account/model.mjs';
const s=name=>settings({profile:{name}});
function fixture(remote=null){
 let local=s('local'),cloud=remote,watch,watchError,writeCount=0,fail=null;
 const memory=new Map();const messages=[];
 const backend={read:async()=>cloud,watch(uid,cb,error){watch=cb;watchError=error;return ()=>{watch=null}},async write(uid,v,expected){writeCount++;if(fail)throw fail;if((cloud?.revision||0)!==expected)throw Object.assign(Error(),{code:'conflict'});cloud=documentData(v,expected+1,null);return cloud},async remove(){cloud={state:'deleting'}}};
 const sync=new SyncSession({backend,read:()=>local,apply:v=>{local=v},notify:m=>messages.push(m),storage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)}});
 return {sync,memory,messages,backend,get local(){return local},set local(v){local=v},get cloud(){return cloud},set cloud(v){cloud=v},get writes(){return writeCount},set fail(e){fail=e},push(d){watch?.(d)},pushError(e){watchError?.(e)}};
}
test('first sign-in never uploads until explicit local import',async()=>{const f=fixture();await f.sync.start('a');assert.equal(f.writes,0);assert.ok(f.sync.conflict);await f.sync.choose('local');assert.equal(f.cloud.settings.profile.name,'local');assert.equal(f.cloud.revision,1);f.sync.stop()});
test('new device can choose cloud; local choice is not silently uploaded',async()=>{const f=fixture(documentData(s('cloud'),4,null));await f.sync.start('a');await f.sync.choose('cloud');assert.equal(f.local.profile.name,'cloud');assert.equal(f.writes,0);f.sync.stop()});
test('concurrent writes require a visible conflict choice and preserve local data',async()=>{
 const f=fixture(documentData(s('old'),1,null));await f.sync.start('a');await f.sync.choose('cloud');f.local=s('mine');f.cloud=documentData(s('theirs'),2,null);await f.sync.save();assert.equal(f.local.profile.name,'mine');assert.equal(f.cloud.settings.profile.name,'theirs');assert.ok(f.sync.conflict);await f.sync.choose('local');assert.equal(f.cloud.settings.profile.name,'mine');assert.equal(f.cloud.revision,3);f.sync.stop();
});
test('network failure retains sanitized per-user pending settings for retry',async()=>{
 const f=fixture(documentData(s('cloud'),1,null));await f.sync.start('a');await f.sync.choose('cloud');f.local=s('offline');f.fail={code:'unavailable'};await f.sync.save();assert.equal(JSON.parse(f.memory.get('kartlegg.account.pending.v1.a')).settings.profile.name,'offline');f.fail=null;await f.sync.retry();assert.equal(f.cloud.settings.profile.name,'offline');assert.equal(f.memory.size,0);f.sync.stop();
});
test('remote update applies only when the local version is unchanged',async()=>{const f=fixture(documentData(s('base'),1,null));await f.sync.start('a');await f.sync.choose('cloud');f.push(documentData(s('new'),2,null));assert.equal(f.local.profile.name,'new');f.local=s('myedit');f.push(documentData(s('other'),3,null));assert.equal(f.local.profile.name,'myedit');assert.ok(f.sync.conflict);f.sync.stop()});
test('stale snapshot cannot regress a successful revision',async()=>{const f=fixture(documentData(s('base'),1,null));await f.sync.start('a');await f.sync.choose('local');f.push(documentData(s('base'),1,null));assert.equal(f.sync.revision,2);assert.equal(f.local.profile.name,'local');f.sync.stop()});
test('logout invalidates an in-flight read for another account',async()=>{const f=fixture();let resolve;f.backend.read=()=>new Promise(r=>resolve=r);const pending=f.sync.start('a');f.sync.stop();resolve(documentData(s('A'),1,null));await pending;assert.equal(f.sync.uid,null);assert.equal(f.sync.conflict,null)});
test('unavailable localStorage still keeps settings in memory and warns',async()=>{const f=fixture();f.sync.storage={getItem(){throw Error()},setItem(){throw Error()}};await f.sync.start('a');await f.sync.choose('local');assert.equal(f.cloud.settings.profile.name,'local');assert.ok(f.messages.some(m=>typeof m==='string'&&m.includes('bare i denne fanen')));f.sync.stop()});
test('deletion suspends all background writes',async()=>{const f=fixture(documentData(s('base'),1,null));await f.sync.start('a');await f.sync.choose('cloud');await f.sync.remove();f.local=s('do not recreate');f.sync.changed();await f.sync.save();assert.equal(f.cloud.state,'deleting');assert.equal(f.writes,0);f.sync.stop()});

test('remote deletion suspends background sync in another open session',async()=>{const f=fixture(documentData(s('base'),1,null));await f.sync.start('a');await f.sync.choose('cloud');f.pushError({code:'account-deleting'});f.local=s('stale');f.sync.changed();await f.sync.save();assert.equal(f.writes,0);assert.equal(f.sync.active,false);f.sync.stop()});
test('pending settings are isolated by UID',async()=>{const f=fixture();f.memory.set('kartlegg.account.pending.v1.alice',JSON.stringify({settings:s('Alice')}));await f.sync.start('bob');assert.equal(f.sync.conflict.local.profile.name,'local');f.sync.stop()});
test('missing browser storage gives an explicit memory-only warning',async()=>{const f=fixture();f.sync.storage=undefined;await f.sync.start('a');await f.sync.choose('local');assert.ok(f.messages.some(m=>typeof m==='string'&&m.includes('bare i denne fanen')));f.sync.stop()});
