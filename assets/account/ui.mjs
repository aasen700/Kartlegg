import {errorMessage,settings,same} from './model.mjs';
import {SyncSession} from './sync.mjs';
import {readSettings,applySettings} from './adapter.mjs';
export function mountAccount({enabled,loadBackend}){
 const host=document.createElement('section');host.className='profile-dialog-section account-panel';host.id='accountPanel';
 host.innerHTML=`<h3>Kartlegg Konto <span class="account-tag">Valgfritt</span></h3>
 <p>Ta med avsenderprofil, favoritter og utseende mellom mobil og PC. Målinger, historikk og ISBAR-manus inngår aldri.</p>
 <p id="accountStatus" role="status" aria-live="polite">Du bruker Kartlegg uten konto.</p>
 <div id="accountGuest">
 <form id="accountForm"><label for="accountEmail">E-post</label><input id="accountEmail" type="email" autocomplete="username" required maxlength="254">
 <label for="accountPassword">Passord (minst 12 tegn ved registrering)</label><input id="accountPassword" type="password" autocomplete="current-password" required maxlength="128">
 <label class="account-consent"><input id="accountNotice" type="checkbox"> Jeg har lest personverninformasjonen nedenfor. Bruk bare egne profilopplysninger.</label>
 <div class="account-actions"><button class="btn btn-primary" id="accountLogin" type="submit">Logg inn</button><button class="btn btn-secondary" type="button" id="accountRegister">Opprett konto</button><button class="btn btn-secondary" type="button" id="accountGoogle">Fortsett med Google</button><button class="btn btn-secondary" type="button" id="accountReset">Glemt passord</button></div></form></div>
 <div id="accountMember" hidden><p id="accountIdentity"></p><p>På delt utstyr: logg ut når du er ferdig. Innloggingen beholdes i denne nettleserøkten.</p>
 <div id="accountVerification" hidden><p>Bekreft e-posten før du kan bruke skylagring. Sjekk også søppelpost.</p><div class="account-actions"><button class="btn btn-secondary" type="button" id="accountVerify">Send bekreftelse</button><button class="btn btn-secondary" type="button" id="accountRefresh">Jeg har bekreftet e-posten</button></div></div>
 <div id="accountConflict" hidden><h4>Velg innstillinger</h4><p id="accountConflictText"></p><div class="account-compare"><div><strong>Denne enheten / ulagrede endringer</strong><pre id="accountLocalPreview"></pre></div><div><strong>Kontoen</strong><pre id="accountCloudPreview"></pre></div></div><p>Valget erstatter den andre versjonen. Se gjennom begge før du velger. Favoritter og profil fra en delt enhet kan tilhøre noen andre.</p><div class="account-actions"><button class="btn btn-secondary" type="button" id="accountUseCloud">Bruk kontoens innstillinger</button><button class="btn btn-secondary" type="button" id="accountUseLocal">Bruk enhetens innstillinger i kontoen</button></div></div>
 <div class="account-actions"><button class="btn btn-secondary" type="button" id="accountSync">Prøv synkronisering igjen</button><button class="btn btn-secondary" type="button" id="accountLogout">Logg ut</button></div>
 <details><summary>Kontoadministrasjon</summary><p>For å koble innloggingsmetoder eller slette kontoen må du bekrefte innloggingen. For Google-konto: la passordfeltet stå tomt og bruk Google-vinduet.</p>
 <label for="accountReauthPassword">Nåværende passord (e-postkonto)</label><input id="accountReauthPassword" type="password" autocomplete="current-password" maxlength="128">
 <button class="btn btn-secondary" type="button" id="accountReauth">Bekreft innlogging</button>
 <div class="account-actions"><button class="btn btn-secondary" type="button" id="accountLinkGoogle">Koble til Google</button></div>
 <p>Vil du bruke passord på Google-kontoen din? Firebase sender en lenke til kontoens e-postadresse. Velg passord der; begge innloggingsmetodene bruker den samme kontoen.</p><button class="btn btn-secondary" type="button" id="accountAddPassword">Send lenke for å velge passord</button>
 <p>Du kan også tilbakestille passord med «Glemt passord». Passord håndteres bare av Firebase Authentication.</p>
 <button class="btn btn-secondary" type="button" id="accountExport">Last ned kontoinnstillinger</button>
 <label class="account-consent"><input id="accountDeleteConfirm" type="checkbox"> Jeg vil slette kontoen og alle profilinnstillinger i skyen permanent. Lokale kontoendringer på denne enheten fjernes også.</label><button class="btn btn-secondary account-danger" type="button" id="accountDelete">Slett kontoen permanent</button></details></div>
 <details id="accountPrivacy"><summary>Personvern for Kartlegg Konto</summary><p>Konto er valgfritt. Du kan fortsette å bruke alle verktøy uten konto. Skriv aldri pasientopplysninger i profilfeltene.</p><p>Vi lagrer bare navn, stilling, arbeidssted, avdeling, favorittverktøy, utseende, en teknisk versjon og siste lagringstid i Cloud Firestore. Firebase Authentication behandler e-postadresse, innloggingsmetode, bruker-ID og nødvendige sikkerhetsdata. Kartlegg lagrer ikke passord.</p><p>Formålet er innlogging og synkronisering du ber om. Kontoopplysninger beholdes til du sletter kontoen. Ulagrede innstillingsendringer kan ligge lokalt til du synkroniserer eller logger ut. Firebase-økten varer til utlogging eller til nettleserøkten avsluttes. Ikke bruk kontoen på en enhet du ikke stoler på.</p><p>Ved sletting fjernes profilinnholdet før innloggingen slettes. En minimal teknisk slettemarkør med bruker-ID og tidspunkt beholdes midlertidig for å hindre gjenoppretting fra andre økter, og må ryddes av administrator. Google kan beholde sikkerhetslogger og sikkerhetskopier etter sine vilkår.</p><p>Du kan endre profil, laste ned innstillingene og slette kontoen her. Du har rett til innsyn, retting, sletting og å klage til Datatilsynet. Google/Firebase behandler data for tjenesten; innlogging og driftsdata kan behandles utenfor EØS. Firestore-region alene garanterer ikke at all behandling skjer i EØS.</p><p id="accountPrivacyRelease">Ansvarlig for Kartlegg Konto er Philip Aasen. Personvernspørsmål og forespørsler om innsyn eller sletting kan sendes til <a href="mailto:aasen700@gmail.com">aasen700@gmail.com</a>. Kontotjenesten og synkroniseringen leveres når du ber om det; behandlingsgrunnlaget er personvernforordningen artikkel 6 nr. 1 bokstav b (avtale). Alle profilfeltene er valgfrie. Avkryssingen ovenfor bekrefter at du har lest informasjonen.</p><p>Google/Firebase er tjenesteleverandør etter sine <a href="https://firebase.google.com/terms/data-processing-terms" target="_blank" rel="noopener noreferrer">databehandlingsvilkår</a>. Se også <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Firebase sin personverninformasjon</a> for sikkerhetslogger, underleverandører, overføringer og sletting fra sikkerhetskopier. En slettemarkør fjernes manuelt etter at administrator har kontrollert at Auth-kontoen er slettet og det har gått minst 24 timer, slik at gamle innloggingstokener er utløpt. Kontakt oss hvis du trenger hjelp med dette. Oppdatert 19. oktober 2026.</p></details>`;
 document.querySelector('#profileDialog .profile-dialog-scroll').prepend(host);
 const $=id=>host.querySelector('#'+id);
 let backend, sync, user, operating=false, guest=null, guestRemember=false, generation=0;
 // Restore the guest workspace immediately after a previous account session.
 try{if(localStorage.getItem('kartlegg.account.owner.v1')){const saved=JSON.parse(localStorage.getItem('kartlegg.account.guest.v1')||'null');document.getElementById('rememberProfile').checked=!!saved?.remember;applySettings(saved?.settings||saved||settings());guest=readSettings();guestRemember=document.getElementById('rememberProfile').checked;localStorage.removeItem('kartlegg.account.owner.v1')}}catch(_){}
 function status(message){$('accountStatus').textContent=typeof message==='string'?message:errorMessage(message)}
 function preview(s){if(!s)return 'Ingen lagrede kontoinnstillinger.';const p=settings(s);return Object.entries(p.profile).map(([k,v])=>({name:'Navn',role:'Stilling',work:'Arbeidssted',department:'Avdeling'}[k])+': '+(v||'–')).join('\n')+'\nFavoritter: '+(p.favorites.join(', ')||'–')+'\nUtseende: '+Object.values(p.appearance).join(' · ')}
 function render(){
  $('accountGuest').hidden=!!user;$('accountMember').hidden=!user;
  $('accountIdentity').textContent=user?'Innlogget som '+(user.email||'Google-bruker'):'';
  $('accountVerification').hidden=!user||user.emailVerified;
  const c=sync?.conflict;$('accountConflict').hidden=!c;
  if(c){$('accountConflictText').textContent=c.first?'Velg kontoens innstillinger, eller importer innstillingene fra denne enheten.':'Begge versjoner er endret. Ingen av dem er overskrevet.';$('accountLocalPreview').textContent=preview(c.local);$('accountCloudPreview').textContent=preview(c.remote);$('accountUseCloud').disabled=!c.remote||operating||sync.busy}
  document.getElementById('profileTrigger').setAttribute('aria-label',user?'Åpne profil og konto – innlogget':'Åpne profil og konto');
 }
 async function run(action){if(operating||!backend)return;operating=true;host.setAttribute('aria-busy','true');const buttons=[...host.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
  try{await action()}catch(e){status(e)}finally{operating=false;host.removeAttribute('aria-busy');buttons.forEach(b=>b.disabled=false);render()}}
 function notice(){if(!$('accountNotice').checked){status('Les personverninformasjonen og kryss av før du oppretter konto eller fortsetter med Google.');$('accountNotice').focus();return false}return true}
 const email=()=>$('accountEmail').value.trim();
 const password=()=>$('accountPassword').value;
 function validateEmail(){if(!$('accountEmail').reportValidity())return false;return true}
 function strong(p){if(p.length<12){status('Velg et passord med minst 12 tegn.');return false}return true}
 $('accountForm').addEventListener('submit',e=>{e.preventDefault();run(async()=>{await backend.login(email(),password());$('accountPassword').value=''})});
 $('accountRegister').onclick=()=>{if(!validateEmail()||!notice()||!strong(password()))return;run(async()=>{await backend.register(email(),password());$('accountPassword').value='';status('Kontoen er opprettet. Bekreft e-posten for å aktivere synkronisering.')})};
 $('accountGoogle').onclick=()=>{if(notice())run(()=>backend.google())};
 $('accountReset').onclick=()=>{if(validateEmail())run(async()=>{try{await backend.reset(email())}catch(e){if(!['auth/user-not-found','auth/invalid-credential'].includes(e.code))throw e}status('Hvis adressen har en konto, får du en e-post med videre hjelp. Sjekk også søppelpost.')})};
 $('accountVerify').onclick=()=>run(async()=>{await backend.verify();status('Bekreftelseslenke sendt. Sjekk også søppelpost.')});
 $('accountRefresh').onclick=()=>run(async()=>{await backend.refresh();await changedUser(backend.user)});
 $('accountSync').onclick=()=>run(()=>sync.retry());
 $('accountUseLocal').onclick=()=>run(()=>sync.choose('local'));
 $('accountUseCloud').onclick=()=>run(()=>sync.choose('cloud'));
 $('accountLogout').onclick=()=>run(async()=>{if(sync?.active&&!same(readSettings(),sync.base)&&!confirm('Du har ulagrede kontoendringer. Logge ut og fjerne dem fra denne enheten?'))return;await backend.logout();status('Du er logget ut. Kontoens lokale profil er fjernet; gjesteinnstillingene er gjenopprettet.')});
 $('accountReauth').onclick=()=>run(async()=>{const p=$('accountReauthPassword').value;$('accountReauthPassword').value='';await backend.reauthenticate(p);status('Innloggingen er bekreftet.')});
 $('accountLinkGoogle').onclick=()=>run(async()=>{await backend.linkGoogle();status('Google er koblet til den samme kontoen.')});
 $('accountAddPassword').onclick=()=>run(async()=>{await backend.addPassword();status('Lenke for å velge passord er sendt til kontoens e-postadresse. Sjekk også søppelpost.')});
 $('accountExport').onclick=()=>run(async()=>{const cloud=await backend.read(user.uid);const blob=new Blob([JSON.stringify({email:user.email,settings:cloud?.settings||null},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='kartlegg-kontoinnstillinger.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Kontoinnstillingene er lastet ned.')});
 $('accountDelete').onclick=()=>run(async()=>{if(!$('accountDeleteConfirm').checked){status('Kryss av for permanent sletting først.');return}await sync.remove();status('Kontoen og profilinnholdet i skyen er slettet.')});
 function wipePending(uid){try{localStorage.removeItem('kartlegg.account.pending.v1.'+uid)}catch(_){}}
 async function changedUser(next){
  const token=++generation;
  const old=user;sync?.stop();user=next;
  if(!next){if(old)wipePending(old.uid);if(guest){sync.applying=true;document.getElementById('rememberProfile').checked=guestRemember;applySettings(guest);sync.applying=false;guest=null}try{localStorage.removeItem('kartlegg.account.guest.v1')}catch(_){}try{localStorage.removeItem('kartlegg.account.owner.v1')}catch(_){}status('Du bruker Kartlegg uten konto.');render();return}
  if(old&&old.uid!==next.uid){wipePending(old.uid);sync.applying=true;applySettings(guest||settings());sync.applying=false}
  if(!guest){guest=readSettings();guestRemember=document.getElementById('rememberProfile').checked;}
  try{localStorage.setItem('kartlegg.account.guest.v1',JSON.stringify({settings:settings({...guest,profile:guestRemember?guest.profile:{}}),remember:guestRemember}))}catch(_){}
  // Store only nonclinical settings. The owner marker prevents a different account importing these silently.
  try{const owner=localStorage.getItem('kartlegg.account.owner.v1');if(owner&&owner!==next.uid){sync.applying=true;applySettings(settings());sync.applying=false}localStorage.setItem('kartlegg.account.owner.v1',next.uid)}catch(_){}
  render();
  if(!next.emailVerified){status('Bekreft e-postadressen før innstillingene kan synkroniseres.');return}
  await sync.start(next.uid);if(token!==generation)return;render();
 }
 window.addEventListener('kartlegg:settings-changed',()=>sync?.changed());
 window.addEventListener('online',()=>{if(sync?.active)sync.retry()});
 if(!enabled){host.querySelectorAll('button').forEach(b=>b.disabled=true);status('Konto er under klargjøring og er ikke aktivert. Profil, favoritter og utseende fungerer fortsatt lokalt.');return {host}}
 status('Kobler til kontotjenesten …');host.querySelectorAll('button').forEach(b=>b.disabled=true);
 loadBackend().then(b=>{backend=b;let storage;try{storage=localStorage}catch(_){}sync=new SyncSession({backend,read:readSettings,apply:applySettings,storage,notify(message){status(message);render()}});host.querySelectorAll('button').forEach(b=>b.disabled=false);backend.observe(changedUser)}).catch(()=>status('Kontotjenesten kunne ikke lastes. Bruk Kartlegg uten konto, eller last siden på nytt når nettet er tilbake.'));
 return {host,get sync(){return sync}};
}
