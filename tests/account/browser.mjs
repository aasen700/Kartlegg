// Real HTML and existing JS owners; only the remote account backend is fake.
import {mountAccount} from '../../assets/account/ui.mjs';
import {settings,documentData,same} from '../../assets/account/model.mjs';
const $=id=>document.getElementById(id), assert=(v,m)=>{if(!v)throw Error(m)};
const pause=(ms=40)=>new Promise(r=>setTimeout(r,ms));
const page=()=>[...document.querySelectorAll('.page')].find(p=>!p.hidden)?.id;
const go=async hash=>{location.hash=hash;await pause()};
let observer, cloud=documentData(settings({profile:{name:'Cloud Nurse'},favorites:['news2'],appearance:{mode:'dark'}}),1,null),writes=0,consentDoc=null,registered=[];
const verified={uid:'synthetic-account',email:'synthetic@example.test',emailVerified:true};
const backend={user:null,remembered:false,async remember(on){this.remembered=on},
 observe(cb){observer=cb;cb(null)},async read(){return cloud},watch(){return ()=>{}},
 async write(uid,value,revision){writes++;if(revision!==cloud.revision)throw {code:'conflict'};cloud=documentData(value,revision+1,null);return cloud},
 async readConsent(){return consentDoc},async writeConsent(){consentDoc={version:'2026-10-20',terms:true,patientData:true,clinicalResponsibility:true}},
 async register(email){if(registered.includes(email))throw {code:'auth/email-already-in-use'};registered.push(email);this.user={uid:'new-'+email,email,emailVerified:false};await observer(this.user)},
 async verify(){},async refresh(){},
 async login(){backend.user=verified;await observer(verified)},async logout(){backend.user=null;await observer(null)},async remove(){backend.user=null;cloud=null;await observer(null)}};
const gate=window.KartleggGate;
const disabled=mountAccount({enabled:false,loadBackend:async()=>{throw Error('SDK must not be loaded before activation')}});
assert(disabled.auth.querySelector('#accountLogin').disabled,'account gate disables login before SDK loading');disabled.host.remove();disabled.auth.remove();
const app=mountAccount({enabled:true,loadBackend:async()=>backend});
try{
 await pause();
 // Guest: public pages open, protected pages lead to login with a reason.
 assert(gate.state==='guest','no session means guest');
 await go('#start');assert(page()==='page-start','guest sees the public front page');
 await go('#om');assert(page()==='page-om','About is public');
 await go('#vilkar');assert(page()==='page-vilkar','terms are public');
 await go('#personvern');assert(page()==='page-personvern','privacy notice is public');
 await go('#vurdering');assert(page()==='page-vurdering','NEWS2 is open without an account');
 await go('#verktoy');assert(page()==='page-verktoy','clinical tools are open without an account');
 await go('#laer');assert(page()==='page-konto','a protected page leads to login');
 assert($('kontoReason').textContent.includes('Lær'),'login explains why sign-in is needed');
 assert(!$('accountGuest').closest('.page')||$('page-profil').hidden,'profile is not shown to guests');
 // Signup validation: three separate, unchecked confirmations are required; passwords must match.
 $('accountToSignup').click();await pause(2600);
 assert($('page-konto').dataset.kontoView==='signup','signup screen');
 for(const id of ['signupConsentTerms','signupConsentPatient','signupConsentClinical'])assert(!$(id).checked,'confirmations start unchecked: '+id);
 $('accountSignupEmail').value='new@example.test';$('accountSignupPassword').value='a long enough password';$('accountSignupConfirm').value='a different password';
 $('accountSignupForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await pause();
 assert(!$('accountSignupConfirmError').hidden,'mismatching passwords are reported');assert(!registered.length,'no account with mismatching passwords');
 $('accountSignupConfirm').value='a long enough password';$('signupConsentTerms').checked=true;$('signupConsentPatient').checked=true;
 $('accountSignupForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await pause();
 assert(!$('signupConsentError').hidden&&!registered.length,'all three confirmations are required');
 $('signupConsentClinical').checked=true;
 $('accountSignupForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await pause();
 assert(registered.includes('new@example.test'),'account is created when everything is in order');
 assert(consentDoc?.terms&&consentDoc?.patientData&&consentDoc?.clinicalResponsibility,'confirmations are stored for the new account');
 assert(gate.state==='verify'&&$('page-konto').dataset.kontoView==='verify','unverified e-mail is asked to confirm first');
 assert($('accountStatus').textContent.includes('Kontoen er opprettet'),'the confirmation message survives the screen change');
 await go('#laer');assert(page()==='page-konto','unverified accounts cannot open protected pages');
 await backend.logout();await pause();
 assert(gate.state==='guest','logout returns to guest');
 // Existing address: signup sends the user to login instead.
 await go('#konto');$('accountToSignup').click();await pause(2600);
 $('accountSignupEmail').value='new@example.test';$('accountSignupPassword').value='another long password';$('accountSignupConfirm').value='another long password';
 for(const id of ['signupConsentTerms','signupConsentPatient','signupConsentClinical'])$(id).checked=true;
 $('accountSignupForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await pause();
 assert($('page-konto').dataset.kontoView==='login'&&$('accountStatus').textContent.includes('finnes allerede'),'existing account is handled');
 // «Husk meg» is opt-in and stored only as a choice.
 assert(!$('accountRemember').checked,'«Husk meg» is opt-in');$('accountRemember').click();await pause();assert(backend.remembered&&$('accountRememberSignup').checked,'«Husk meg» is stored and mirrored');$('accountRemember').click();await pause();assert(!backend.remembered,'«Husk meg» can be turned off');
 // Existing behaviour: guest profile, import from the account, adapters and clinical exclusion.
 consentDoc=null;
 await go('#profil');assert(page()==='page-konto','profile requires login');
 $('profileName').value='Guest Nurse';$('profileRole').value='Sykepleier';$('saveProfile').click();
 $('accountEmail').value='synthetic@example.test';$('accountPassword').value='synthetic-test-password';
 $('accountForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await pause();
 assert(gate.state==='consent'&&$('page-konto').dataset.kontoView==='consent','an account without confirmations must confirm before entering');
 $('accountConsentForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await pause();
 assert(gate.state==='consent','confirming requires all three boxes');
 for(const id of ['gateConsentTerms','gateConsentPatient','gateConsentClinical'])$(id).checked=true;
 $('accountConsentForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await pause(120);
 assert(gate.state==='member','confirmed account enters the app');
 assert(page()==='page-profil','a real import choice takes the user to Profil, where the choice is');
 assert(!$('accountMember').hidden,'member status visible');assert($('page-profil').dataset.account==='member','logged-in profile hides «Husk profilen»');assert(!$('accountConflict').hidden,'first import requires explicit choice');assert(writes===0,'no initial silent upload');assert(JSON.parse(localStorage.getItem('kartlegg.account.guest.v1')).settings.profile.name==='','memory-only guest profile not persisted');
 $('accountUseCloud').click();await pause();
 assert($('profileName').value==='Cloud Nurse','cloud profile populates existing fields');
 assert(window.KartleggToolNavigation.favorites.includes('news2'),'cloud favorites populate existing owner');
 assert(document.documentElement.dataset.theme==='dark','cloud appearance applies immediately');
 $('rememberProfile').checked=true;
 $('profileName').value='Updated Nurse';$('saveProfile').click();await app.sync.save();
 assert(cloud.settings.profile.name==='Updated Nurse','existing save button syncs profile');
 assert(/^Synkronisert med kontoen kl\. \d{2}:\d{2}\.$/.test($('accountSyncState').textContent),'profile shows when the account was last synchronised');
 assert($('accountMethods').hidden&&!$('accountLinkGoogleBlock').hidden,'unknown sign-in methods keep every account action available');
 window.KartleggSenderProfile.apply({name:'Philip Aasen'});window.KartleggPersonalModes.applyProfile();window.KartleggThemeLayers.apply({...settings().appearance,base:'philip',surface:'glass'});
 assert(document.documentElement.dataset.baseTheme==='philip','personal theme applies through existing owner');
 await app.sync.save();
 const before=JSON.stringify(cloud);$('isbarSituation').value='SYNTHETIC CLINICAL TEXT MUST NOT SYNC';$('isbarSituation').dispatchEvent(new Event('input',{bubbles:true}));await app.sync.save();
 assert(JSON.stringify(cloud)===before,'clinical ISBAR input never enters account payload');
 // Measurements: stored on this device for the signed-in user only, and wiped at logout.
 await go('#vurdering');assert(page()==='page-vurdering','member sees the assessment');
 window.KartleggMeasurementStore.save(gate.owner,[{savedAt:Date.now(),date:'2026-10-20',time:'08:00',v:{rr:22,spo2:95,sbp:110,hr:95,temp:37.2,gcs:null,conscious:'A',oxygen:false,scale:1,confusion:false}}]);
 assert(localStorage.getItem('kartlegg.vitals-24h.v1'),'measurement stored on device');
 $('accountLogout').click();await pause(120);
 assert(!localStorage.getItem('kartlegg.vitals-24h.v1'),'measurements are wiped at logout');
 assert(!$('accountGuest').hidden,'guest UI restored after logout');assert($('page-profil').dataset.account==='guest','«Husk profilen» returns after logout');assert($('profileName').value==='Guest Nurse','guest profile restored');assert(!$('rememberProfile').checked,'guest persistence opt-in restored');
 assert(!localStorage.getItem('kartlegg.account.owner.v1'),'account owner marker cleared');
 assert(page()==='page-start','logout returns to the public front page');
 assert(!$('rr').disabled,'clinical assessment code remains intact');
 $('profileTrigger').click();await pause();assert(page()==='page-konto','profile shortcut leads to login when signed out');
 const output=document.createElement('pre');output.id='account-test-result';output.textContent='PASS: public pages, protected routes, signup confirmations, verification, consent screen, return to page, account import, adapters, clinical exclusion, measurement wipe, logout and guest restore';document.body.append(output);
}catch(e){const output=document.createElement('pre');output.id='account-test-result';output.textContent='FAIL: '+e.stack;document.body.append(output)}
