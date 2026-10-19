// Real HTML and existing JS owners; only the remote account backend is fake.
import {mountAccount} from '../../assets/account/ui.mjs';
import {settings,documentData,same} from '../../assets/account/model.mjs';
const $=id=>document.getElementById(id), assert=(v,m)=>{if(!v)throw Error(m)};
const pause=()=>new Promise(r=>setTimeout(r,30));
let observer, cloud=documentData(settings({profile:{name:'Cloud Nurse'},favorites:['news2'],appearance:{mode:'dark'}}),1,null),writes=0;
const user={uid:'synthetic-account',email:'synthetic@example.test',emailVerified:true};
const backend={user:null,observe(cb){observer=cb;cb(null)},async read(){return cloud},watch(){return ()=>{}},async write(uid,value,revision){writes++;if(revision!==cloud.revision)throw {code:'conflict'};cloud=documentData(value,revision+1,null);return cloud},async login(){backend.user=user;await observer(user)},async logout(){backend.user=null;await observer(null)},async remove(){backend.user=null;cloud=null;await observer(null)}};
const disabled=mountAccount({enabled:false,loadBackend:async()=>{throw Error('SDK must not be loaded before activation')}});
assert(disabled.host.querySelector('#accountLogin').disabled,'account gate disables login before SDK loading');disabled.host.remove();
const app=mountAccount({enabled:true,loadBackend:async()=>backend});
try{
 await pause();
 $('profileTrigger').click();assert($('profileDialog').open,'profile dialog opens with account');
 $('profileName').value='Guest Nurse';$('profileRole').value='Sykepleier';$('saveProfile').click();
 $('accountEmail').value='synthetic@example.test';$('accountPassword').value='synthetic-test-password';
 $('accountForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await pause();
 assert(!$('accountMember').hidden,'member status visible');assert(!$('accountConflict').hidden,'first import requires explicit choice');assert(writes===0,'no initial silent upload');assert(JSON.parse(localStorage.getItem('kartlegg.account.guest.v1')).settings.profile.name==='','memory-only guest profile not persisted');
 $('accountUseCloud').click();await pause();
 assert($('profileName').value==='Cloud Nurse','cloud profile populates existing fields');
 assert(window.KartleggToolNavigation.favorites.includes('news2'),'cloud favorites populate existing owner');
 assert(document.documentElement.dataset.theme==='dark','cloud appearance applies immediately');
 $('rememberProfile').checked=true;
 $('profileName').value='Updated Nurse';$('saveProfile').click();await app.sync.save();
 assert(cloud.settings.profile.name==='Updated Nurse','existing save button syncs profile');
 window.KartleggSenderProfile.apply({name:'Philip Aasen'});window.KartleggPersonalModes.applyProfile();window.KartleggThemeLayers.apply({...settings().appearance,base:'philip',surface:'glass'});
 assert(document.documentElement.dataset.baseTheme==='philip','personal theme applies through existing owner');
 await app.sync.save();
 const before=JSON.stringify(cloud);$('isbarSituation').value='SYNTHETIC CLINICAL TEXT MUST NOT SYNC';$('isbarSituation').dispatchEvent(new Event('input',{bubbles:true}));await app.sync.save();
 assert(JSON.stringify(cloud)===before,'clinical ISBAR input never enters account payload');
 $('accountLogout').click();await pause();
 assert(!$('accountGuest').hidden,'guest UI restored after logout');assert($('profileName').value==='Guest Nurse','guest profile restored');assert(!$('rememberProfile').checked,'guest persistence opt-in restored');
 assert(!localStorage.getItem('kartlegg.account.owner.v1'),'account owner marker cleared');
 assert(!$('rr').disabled,'clinical assessment remains available');
 $('closeProfile').click();$('profileTrigger').focus();$('profileTrigger').click();assert($('profileDialog').open,'profile remains reachable');
 const output=document.createElement('pre');output.id='account-test-result';output.textContent='PASS: account UI, import, profile/favorites/theme adapters, clinical exclusion, logout and guest restore';document.body.append(output);
}catch(e){const output=document.createElement('pre');output.id='account-test-result';output.textContent='FAIL: '+e.stack;document.body.append(output)}
