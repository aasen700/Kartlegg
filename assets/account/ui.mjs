import {errorMessage,settings,same} from './model.mjs';
import {SyncSession} from './sync.mjs';
import {readSettings,applySettings} from './adapter.mjs?v=profile1';
export function mountAccount({enabled,loadBackend}){
 const host=document.createElement('div');host.className='account-panel';host.id='accountPanel';
 host.innerHTML=`<section class="account-card profile-main-only" aria-labelledby="accountCardTitle">
 <div id="accountGuest"><div class="account-card-head"><span class="account-avatar is-empty" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg></span><div class="account-card-text"><h2 id="accountCardTitle">Ikke innlogget</h2><p>Logg inn for å ha samme profil, favoritter og utseende på mobil og PC.</p></div></div>
 <button class="btn btn-primary account-wide" type="button" id="accountOpenLogin">Logg inn</button>
 <p class="account-switch">Ny her? <button class="account-link" type="button" id="accountOpenSignup">Opprett konto</button></p></div>
 <div id="accountMember" hidden><div class="account-card-head"><span class="account-avatar" id="accountAvatar" aria-hidden="true">K</span><div class="account-card-text"><h2 id="accountName">Innlogget</h2><p id="accountIdentity"></p></div></div>
 <div id="accountVerification" class="account-notice" hidden><p>Bekreft e-posten før du kan bruke skylagring. Sjekk også søppelpost.</p><div class="account-actions"><button class="btn btn-secondary" type="button" id="accountVerify">Send bekreftelse</button><button class="btn btn-secondary" type="button" id="accountRefresh">Jeg har bekreftet e-posten</button></div></div>
 <div id="accountConflict" class="account-notice" hidden><h4>Velg innstillinger</h4><p id="accountConflictText"></p><div class="account-compare"><div><strong>Denne enheten / ulagrede endringer</strong><pre id="accountLocalPreview"></pre></div><div><strong>Kontoen</strong><pre id="accountCloudPreview"></pre></div></div><p>Valget erstatter den andre versjonen. Se gjennom begge før du velger. Favoritter og profil fra en delt enhet kan tilhøre noen andre.</p><div class="account-actions"><button class="btn btn-secondary" type="button" id="accountUseCloud">Bruk kontoens innstillinger</button><button class="btn btn-secondary" type="button" id="accountUseLocal">Bruk enhetens innstillinger i kontoen</button></div></div>
 <div class="account-rows"><button class="settings-row" type="button" id="accountSync"><span class="settings-row-label">Synkroniser nå</span></button><button class="settings-row" type="button" data-sheet="accountAdminSheet"><span class="settings-row-label">Kontoadministrasjon</span><svg class="settings-row-chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6"/></svg></button><button class="settings-row account-logout" type="button" id="accountLogout"><span class="settings-row-label">Logg ut</span></button></div>
 <p class="account-footnote">Bruker du en delt PC, logg ut når du er ferdig.</p></div>
 <div class="account-status-slot" data-status-slot="main"><p id="accountStatus" class="account-status" role="status" aria-live="polite"></p></div>
 </section>
 <section class="account-auth-view" data-profile-view-panel="login" id="accountLoginView" aria-labelledby="accountLoginTitle"><button type="button" class="account-back" data-account-back><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m15 6-6 6 6 6"/></svg>Profil</button>
 <h1 id="accountLoginTitle">Logg inn</h1><p class="account-lede">Samme profil, favoritter og utseende på alle enhetene dine.</p>
 <button class="account-google" type="button" id="accountGoogle"><svg class="account-google-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Fortsett med Google</button>
 <label class="account-consent" id="accountGoogleConsent" hidden><input id="accountGoogleNotice" type="checkbox"> Jeg har lest personverninformasjonen og bruker bare mine egne profilopplysninger.</label>
 <p class="account-divider"><span>eller med e-post</span></p>
 <form id="accountForm" class="account-form"><label for="accountEmail">E-post</label><input id="accountEmail" type="email" autocomplete="username" required maxlength="254" placeholder="navn@eksempel.no">
 <label for="accountPassword">Passord</label><div class="account-password"><input id="accountPassword" type="password" autocomplete="current-password" required maxlength="128"><button class="account-reveal" type="button" data-reveal="accountPassword" aria-pressed="false" aria-label="Vis passord">Vis</button></div>
 <div class="account-form-row"><label class="account-remember"><input id="accountRemember" type="checkbox" data-remember> Husk meg på denne enheten</label><button class="account-link account-forgot" type="button" id="accountReset">Glemt passord?</button></div>
 <button class="btn btn-primary account-wide" id="accountLogin" type="submit">Logg inn</button></form>
 <div class="account-status-slot" data-status-slot="login"></div>
 <p class="account-switch">Ny her? <button class="account-link" type="button" id="accountToSignup">Opprett konto</button></p>
 <p class="account-footnote">Målinger og ISBAR-manus lagres aldri i kontoen. <button class="account-link" type="button" data-sheet="privacySheet">Hva lagres hvor</button></p>
 </section>
 <section class="account-auth-view" data-profile-view-panel="signup" id="accountSignupView" aria-labelledby="accountSignupTitle"><button type="button" class="account-back" data-account-back><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m15 6-6 6 6 6"/></svg>Profil</button>
 <h1 id="accountSignupTitle">Opprett konto</h1><p class="account-lede">Valgfritt. Kartlegg virker like godt uten konto.</p>
 <button class="account-google" type="button" id="accountGoogleSignup"><svg class="account-google-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Fortsett med Google</button>
 <p class="account-divider"><span>eller med e-post</span></p>
 <form id="accountSignupForm" class="account-form"><label for="accountSignupEmail">E-post</label><input id="accountSignupEmail" type="email" autocomplete="email" required maxlength="254" placeholder="navn@eksempel.no">
 <label for="accountSignupPassword">Velg passord</label><div class="account-password"><input id="accountSignupPassword" type="password" autocomplete="new-password" required maxlength="128" aria-describedby="accountPasswordHint"><button class="account-reveal" type="button" data-reveal="accountSignupPassword" aria-pressed="false" aria-label="Vis passord">Vis</button></div>
 <p class="account-hint" id="accountPasswordHint">Minst 12 tegn. En setning du husker fungerer fint.</p>
 <label class="account-remember"><input id="accountRememberSignup" type="checkbox" data-remember> Husk meg på denne enheten</label>
 <label class="account-consent"><input id="accountNotice" type="checkbox"> Jeg har lest personverninformasjonen og bruker bare mine egne profilopplysninger.</label>
 <button class="btn btn-primary account-wide" id="accountRegister" type="submit">Opprett konto</button></form>
 <div class="account-status-slot" data-status-slot="signup"></div>
 <p class="account-switch">Har du konto? <button class="account-link" type="button" id="accountToLogin">Logg inn</button></p>
 <p class="account-footnote"><button class="account-link" type="button" data-sheet="privacySheet">Hva lagres hvor</button></p>
 </section>
 <dialog class="settings-sheet" id="privacySheet" aria-labelledby="privacySheetTitle"><div class="settings-sheet-head"><h2 id="privacySheetTitle">Hva lagres hvor</h2><button class="settings-sheet-close" type="button" data-sheet-close aria-label="Lukk">Ferdig</button></div><div class="settings-sheet-body account-privacy" id="accountPrivacy"><p>Konto er valgfritt. Du kan fortsette å bruke alle verktøy uten konto. Skriv aldri pasientopplysninger i profilfeltene.</p><p>Vi lagrer bare navn, stilling, arbeidssted, avdeling, favorittverktøy, utseende, en teknisk versjon og siste lagringstid i Cloud Firestore. Firebase Authentication behandler e-postadresse, innloggingsmetode, bruker-ID og nødvendige sikkerhetsdata. Kartlegg lagrer ikke passord.</p><p>Formålet er innlogging og synkronisering du ber om. Kontoopplysninger beholdes til du sletter kontoen. Ulagrede innstillingsendringer kan ligge lokalt til du synkroniserer eller logger ut. Innloggingen varer til du logger ut eller lukker nettleseren. Krysser du av for «Husk meg på denne enheten», varer den til du logger ut. Ikke bruk kontoen på en enhet du ikke stoler på.</p><p>Ved sletting fjernes profilinnholdet før innloggingen slettes. En minimal teknisk slettemarkør med bruker-ID og tidspunkt beholdes midlertidig for å hindre gjenoppretting fra andre økter, og må ryddes av administrator. Google kan beholde sikkerhetslogger og sikkerhetskopier etter sine vilkår.</p><p>Du kan endre profil, laste ned innstillingene og slette kontoen her. Du har rett til innsyn, retting, sletting og å klage til Datatilsynet. Google/Firebase behandler data for tjenesten; innlogging og driftsdata kan behandles utenfor EØS. Firestore-region alene garanterer ikke at all behandling skjer i EØS.</p><p id="accountPrivacyRelease">Ansvarlig for Kartlegg Konto er Philip Aasen. Personvernspørsmål og forespørsler om innsyn eller sletting kan sendes til <a href="mailto:aasen700@gmail.com">aasen700@gmail.com</a>. Kontotjenesten og synkroniseringen leveres når du ber om det; behandlingsgrunnlaget er personvernforordningen artikkel 6 nr. 1 bokstav b (avtale). Alle profilfeltene er valgfrie. Avkryssingen ovenfor bekrefter at du har lest informasjonen.</p><p>Google/Firebase er tjenesteleverandør etter sine <a href="https://firebase.google.com/terms/data-processing-terms" target="_blank" rel="noopener noreferrer">databehandlingsvilkår</a>. Se også <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Firebase sin personverninformasjon</a> for sikkerhetslogger, underleverandører, overføringer og sletting fra sikkerhetskopier. En slettemarkør fjernes manuelt etter at administrator har kontrollert at Auth-kontoen er slettet og det har gått minst 24 timer, slik at gamle innloggingstokener er utløpt. Kontakt oss hvis du trenger hjelp med dette. Oppdatert 19. oktober 2026.</p></div></dialog>
 <dialog class="settings-sheet" id="accountAdminSheet" aria-labelledby="accountAdminTitle"><div class="settings-sheet-head"><h2 id="accountAdminTitle">Kontoadministrasjon</h2><button class="settings-sheet-close" type="button" data-sheet-close aria-label="Lukk">Ferdig</button></div><div class="settings-sheet-body account-admin"><p>For å koble innloggingsmetoder eller slette kontoen må du bekrefte innloggingen. For Google-konto: la passordfeltet stå tomt og bruk Google-vinduet.</p>
 <label for="accountReauthPassword">Nåværende passord (e-postkonto)</label><input id="accountReauthPassword" type="password" autocomplete="current-password" maxlength="128">
 <button class="btn btn-secondary" type="button" id="accountReauth">Bekreft innlogging</button>
 <div class="account-actions"><button class="btn btn-secondary" type="button" id="accountLinkGoogle">Koble til Google</button></div>
 <p>Vil du bruke passord på Google-kontoen din? Firebase sender en lenke til kontoens e-postadresse. Velg passord der; begge innloggingsmetodene bruker den samme kontoen.</p><button class="btn btn-secondary" type="button" id="accountAddPassword">Send lenke for å velge passord</button>
 <p>Du kan også tilbakestille passord med «Glemt passord». Passord håndteres bare av Firebase Authentication.</p>
 <button class="btn btn-secondary" type="button" id="accountExport">Last ned kontoinnstillinger</button>
 <label class="account-consent"><input id="accountDeleteConfirm" type="checkbox"> Jeg vil slette kontoen og alle profilinnstillinger i skyen permanent. Lokale kontoendringer på denne enheten fjernes også.</label><button class="btn btn-secondary account-danger" type="button" id="accountDelete">Slett kontoen permanent</button></div></dialog>`;
 (document.getElementById('accountMount')||document.getElementById('page-profil')||document.body).append(host);
 const $=id=>host.querySelector('#'+id);
 let backend, sync, user, operating=false, guest=null, guestRemember=false, generation=0;
 // Restore the guest workspace immediately after a previous account session.
 try{if(localStorage.getItem('kartlegg.account.owner.v1')){const saved=JSON.parse(localStorage.getItem('kartlegg.account.guest.v1')||'null');document.getElementById('rememberProfile').checked=!!saved?.remember;applySettings(saved?.settings||saved||settings());guest=readSettings();guestRemember=document.getElementById('rememberProfile').checked;localStorage.removeItem('kartlegg.account.owner.v1')}}catch(_){}
 function status(message){$('accountStatus').textContent=typeof message==='string'?message:errorMessage(message)}
 function preview(s){if(!s)return 'Ingen lagrede kontoinnstillinger.';const p=settings(s);return Object.entries(p.profile).map(([k,v])=>({name:'Navn',role:'Stilling',work:'Arbeidssted',department:'Avdeling'}[k])+': '+(v||'–')).join('\n')+'\nFavoritter: '+(p.favorites.join(', ')||'–')+'\nUtseende: '+Object.values(p.appearance).join(' · ')}
 function render(){
  $('accountGuest').hidden=!!user;$('accountMember').hidden=!user;
  const name=document.getElementById('profileName')?.value.trim()||'';
  $('accountIdentity').textContent=user?(user.email||'Google-bruker'):'';
  $('accountName').textContent=user?(name||'Innlogget'):'Innlogget';
  $('accountAvatar').textContent=user?((name?name.split(/\s+/).slice(0,2).map(w=>w[0]).join(''):(user.email||'K')[0])||'K').toUpperCase():'K';
  $('accountVerification').hidden=!user||user.emailVerified;
  const c=sync?.conflict;$('accountConflict').hidden=!c;
  if(c){$('accountConflictText').textContent=c.first?'Velg kontoens innstillinger, eller importer innstillingene fra denne enheten.':'Begge versjoner er endret. Ingen av dem er overskrevet.';$('accountLocalPreview').textContent=preview(c.local);$('accountCloudPreview').textContent=preview(c.remote);$('accountUseCloud').disabled=!c.remote||operating||sync.busy}
  document.getElementById('profileTrigger').setAttribute('aria-label',user?'Åpne profil og konto – innlogget':'Åpne profil og konto');
  const pageEl=document.getElementById('page-profil');if(pageEl)pageEl.dataset.account=user?'member':'guest';
  const info=document.querySelector('.sender-editor .profile-info');
  if(info)info.textContent=user?'Profilen lagres i kontoen når du trykker «Bruk profil», og følger deg til mobil og PC.':'Uten konto gjelder profilen bare denne fanen, med mindre du krysser av for «Husk profilen».';
 }
 async function run(action){if(operating||!backend)return;operating=true;host.setAttribute('aria-busy','true');const buttons=[...host.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
  try{await action()}catch(e){status(e)}finally{operating=false;host.removeAttribute('aria-busy');buttons.forEach(b=>b.disabled=false);render()}}
 function notice(id){const box=$(id);if(id==='accountGoogleNotice')$('accountGoogleConsent').hidden=false;if(!box.checked){status('Les personverninformasjonen og kryss av før du oppretter konto eller fortsetter med Google.');box.focus();return false}return true}
 const email=()=>$('accountEmail').value.trim();
 const password=()=>$('accountPassword').value;
 function validateEmail(id='accountEmail'){if(!$(id).reportValidity())return false;return true}
 function strong(p){if(p.length<12){status('Velg et passord med minst 12 tegn.');return false}return true}
 $('accountForm').addEventListener('submit',e=>{e.preventDefault();run(async()=>{await backend.login(email(),password());$('accountPassword').value=''})});
 $('accountSignupForm').addEventListener('submit',e=>{e.preventDefault();const p=$('accountSignupPassword').value;if(!validateEmail('accountSignupEmail')||!strong(p)||!notice('accountNotice'))return;run(async()=>{await backend.register($('accountSignupEmail').value.trim(),p);$('accountSignupPassword').value='';status('Kontoen er opprettet. Bekreft e-posten for å aktivere synkronisering.')})});
 $('accountGoogle').onclick=()=>{if(notice('accountGoogleNotice'))run(()=>backend.google())};
 $('accountGoogleSignup').onclick=()=>{if(notice('accountNotice'))run(()=>backend.google())};
 // Views: the guest card opens the login or signup screen; back returns to the profile.
 const page=window.KartleggProfilePage;
 const view=v=>{status('');page?.show(v);};
 $('accountOpenLogin').onclick=()=>view('login');
 $('accountOpenSignup').onclick=()=>view('signup');
 $('accountToSignup').onclick=()=>view('signup');
 $('accountToLogin').onclick=()=>view('login');
 host.querySelectorAll('[data-account-back]').forEach(b=>b.onclick=()=>{status('');page?.back()});
 host.querySelectorAll('[data-reveal]').forEach(b=>b.onclick=()=>{const input=$(b.dataset.reveal),show=input.type==='password';input.type=show?'text':'password';b.textContent=show?'Skjul':'Vis';b.setAttribute('aria-pressed',String(show));b.setAttribute('aria-label',show?'Skjul passord':'Vis passord')});
 // «Husk meg»: lagrer bare valget (ingen personopplysninger). Innloggingen varer da til utlogging.
 const REMEMBER_KEY='kartlegg.account.remember.v1';
 const remembered=()=>{try{return localStorage.getItem(REMEMBER_KEY)==='1'}catch(_){return false}};
 const rememberBoxes=[...host.querySelectorAll('[data-remember]')];
 rememberBoxes.forEach(b=>b.checked=remembered());
 rememberBoxes.forEach(b=>b.addEventListener('change',()=>{rememberBoxes.forEach(x=>x.checked=b.checked);try{b.checked?localStorage.setItem(REMEMBER_KEY,'1'):localStorage.removeItem(REMEMBER_KEY)}catch(_){}backend?.remember?.(b.checked)}));
 function placeStatus(v){host.querySelector('[data-status-slot="'+(v||'main')+'"]')?.append($('accountStatus'))}
 window.addEventListener('kartlegg:profile-view',e=>placeStatus(e.detail?.view));
 placeStatus(page?.view);
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
  if(!next){if(old)wipePending(old.uid);if(guest){sync.applying=true;document.getElementById('rememberProfile').checked=guestRemember;applySettings(guest);sync.applying=false;guest=null}try{localStorage.removeItem('kartlegg.account.guest.v1')}catch(_){}try{localStorage.removeItem('kartlegg.account.owner.v1')}catch(_){}status('');render();return}
  if(old&&old.uid!==next.uid){wipePending(old.uid);sync.applying=true;applySettings(guest||settings());sync.applying=false}
  if(!guest){guest=readSettings();guestRemember=document.getElementById('rememberProfile').checked;}
  try{localStorage.setItem('kartlegg.account.guest.v1',JSON.stringify({settings:settings({...guest,profile:guestRemember?guest.profile:{}}),remember:guestRemember}))}catch(_){}
  // Store only nonclinical settings. The owner marker prevents a different account importing these silently.
  try{const owner=localStorage.getItem('kartlegg.account.owner.v1');if(owner&&owner!==next.uid){sync.applying=true;applySettings(settings());sync.applying=false}localStorage.setItem('kartlegg.account.owner.v1',next.uid)}catch(_){}
  render();
  if(page&&page.view!=='main')page.back();
  if(!next.emailVerified){status('Bekreft e-postadressen før innstillingene kan synkroniseres.');return}
  await sync.start(next.uid);if(token!==generation)return;render();
 }
 window.addEventListener('kartlegg:settings-changed',()=>sync?.changed());
 document.getElementById('saveProfile')?.addEventListener('click',()=>{if(user?.emailVerified)document.getElementById('profileStatus').textContent='Lagret i kontoen.'});
 window.addEventListener('online',()=>{if(sync?.active)sync.retry()});
 if(!enabled){host.querySelectorAll('button').forEach(b=>b.disabled=true);status('Konto er under klargjøring og er ikke aktivert. Profil, favoritter og utseende fungerer fortsatt lokalt.');return {host}}
 status('Kobler til kontotjenesten …');host.querySelectorAll('button').forEach(b=>b.disabled=true);
 loadBackend().then(async b=>{backend=b;try{await b.remember?.(remembered())}catch(_){}let storage;try{storage=localStorage}catch(_){}sync=new SyncSession({backend,read:readSettings,apply:applySettings,storage,notify(message){status(message);render()}});host.querySelectorAll('button').forEach(b=>b.disabled=false);backend.observe(changedUser)}).catch(()=>status('Kontotjenesten kunne ikke lastes. Bruk Kartlegg uten konto, eller last siden på nytt når nettet er tilbake.'));
 return {host,get sync(){return sync}};
}
