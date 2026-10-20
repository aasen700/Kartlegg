import {errorMessage,settings,same} from './model.mjs';
import {SyncSession} from './sync.mjs?v=forside2';
import {readSettings,applySettings} from './adapter.mjs?v=gate1';
import {termsVersion as TERMS_VERSION} from './config.mjs';

// Kartlegg Konto i grensesnittet.
// host: kontokortet på Profil (bare for innloggede). auth: siden #konto med innlogging, registrering,
// e-postbekreftelse og bekreftelse av vilkår. Innloggingsvakten (auth-gate.js) får status herfra.
const chev='<svg class="settings-row-chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6"/></svg>';
const googleMark='<svg class="account-google-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
const reveal=id=>`<button class="account-reveal" type="button" data-reveal="${id}" aria-pressed="false" aria-label="Vis passord">Vis</button>`;
const err=id=>`<p class="account-field-error" id="${id}" hidden></p>`;
// De tre bekreftelsene: separate, aldri forhåndsavkrysset, alle påkrevd.
const consents=prefix=>`<fieldset class="account-consents" aria-describedby="${prefix}Error"><legend>Før du fortsetter</legend>
 <label class="account-consent"><input type="checkbox" id="${prefix}Terms" data-consent="terms" required> <span>Jeg har lest og godtar Kartleggs <a href="#vilkar" target="_blank" rel="noopener">bruksvilkår</a>.</span></label>
 <label class="account-consent"><input type="checkbox" id="${prefix}Patient" data-consent="patientData" required> <span>Jeg forstår at lagringsfunksjonene i Kartlegg kun er beregnet på fiktive eller reelt anonymiserte opplysninger. Jeg skal ikke lagre opplysninger som direkte eller indirekte kan identifisere en virkelig pasient.</span></label>
 <label class="account-consent"><input type="checkbox" id="${prefix}Clinical" data-consent="clinicalResponsibility" required> <span>Jeg forstår at Kartlegg er et støtteverktøy og ikke erstatter selvstendig klinisk vurdering, faglige retningslinjer, virksomhetens rutiner eller helsepersonellets profesjonelle ansvar.</span></label>
 ${err(prefix+'Error')}</fieldset>
 <p class="account-hint">Les også <a href="#personvern" target="_blank" rel="noopener">personvernerklæringen</a>. Bekreftelsene er avtalevilkår, ikke samtykke etter personvernforordningen.</p>`;

export function mountAccount({enabled,loadBackend}){
 const gate=window.KartleggGate;
 const host=document.createElement('div');host.className='account-panel';host.id='accountPanel';
 host.innerHTML=`<section class="account-card profile-main-only" aria-labelledby="accountName">
 <div id="accountGuest" hidden><div class="account-card-head"><div class="account-card-text"><h2>Ikke innlogget</h2><p>Logg inn for å se profilen din.</p></div></div><a class="btn btn-primary account-wide" href="#konto" data-auth-view="login">Logg inn</a></div>
 <div id="accountMember" hidden><div class="account-card-head"><span class="account-avatar" id="accountAvatar" aria-hidden="true">K</span><div class="account-card-text"><h2 id="accountName">Innlogget</h2><p id="accountIdentity"></p></div></div>
 <div id="accountConflict" class="account-notice" hidden><h4>Velg innstillinger</h4><p id="accountConflictText"></p><div class="account-compare"><div><strong>Denne enheten / ulagrede endringer</strong><pre id="accountLocalPreview"></pre></div><div><strong>Kontoen</strong><pre id="accountCloudPreview"></pre></div></div><p>Valget erstatter den andre versjonen. Se gjennom begge før du velger. Favoritter og profil fra en delt enhet kan tilhøre noen andre.</p><div class="account-actions"><button class="btn btn-secondary" type="button" id="accountUseCloud">Bruk kontoens innstillinger</button><button class="btn btn-secondary" type="button" id="accountUseLocal">Bruk enhetens innstillinger i kontoen</button></div></div>
 <div class="account-rows"><button class="settings-row" type="button" id="accountSync"><span class="settings-row-label">Synkroniser nå</span></button><button class="settings-row" type="button" data-sheet="accountAdminSheet"><span class="settings-row-label">Kontoadministrasjon</span>${chev}</button><button class="settings-row account-logout" type="button" id="accountLogout"><span class="settings-row-label">Logg ut</span></button></div>
 <p class="account-footnote">Bruker du en delt PC, logg ut når du er ferdig.</p></div>
 <div class="account-status-slot" data-status-slot="main"><p id="accountStatus" class="account-status" role="status" aria-live="polite"></p></div>
 </section>
 <dialog class="settings-sheet" id="accountAdminSheet" aria-labelledby="accountAdminTitle"><div class="settings-sheet-head"><h2 id="accountAdminTitle">Kontoadministrasjon</h2><button class="settings-sheet-close" type="button" data-sheet-close aria-label="Lukk">Ferdig</button></div><div class="settings-sheet-body account-admin"><p>For å koble innloggingsmetoder eller slette kontoen må du bekrefte innloggingen. For Google-konto: la passordfeltet stå tomt og bruk Google-vinduet.</p>
 <label for="accountReauthPassword">Nåværende passord (e-postkonto)</label><input id="accountReauthPassword" type="password" autocomplete="current-password" maxlength="128">
 <button class="btn btn-secondary" type="button" id="accountReauth">Bekreft innlogging</button>
 <div class="account-actions"><button class="btn btn-secondary" type="button" id="accountLinkGoogle">Koble til Google</button></div>
 <p>Vil du bruke passord på Google-kontoen din? Firebase sender en lenke til kontoens e-postadresse. Velg passord der; begge innloggingsmetodene bruker den samme kontoen.</p><button class="btn btn-secondary" type="button" id="accountAddPassword">Send lenke for å velge passord</button>
 <p>Du kan også tilbakestille passord med «Glemt passord». Passord håndteres bare av Firebase Authentication.</p>
 <button class="btn btn-secondary" type="button" id="accountExport">Last ned kontoinnstillinger</button>
 <label class="account-consent"><input id="accountDeleteConfirm" type="checkbox"> Jeg vil slette kontoen og alle profilinnstillinger i skyen permanent. Lokale kontoendringer på denne enheten fjernes også.</label><button class="btn btn-secondary account-danger" type="button" id="accountDelete">Slett kontoen permanent</button></div></dialog>`;
 const auth=document.createElement('div');auth.className='account-panel account-auth';auth.id='accountAuth';
 auth.innerHTML=`<section class="account-auth-view" data-konto-view="login" id="accountLoginView" aria-labelledby="accountLoginTitle">
 <h1 id="accountLoginTitle">Logg inn</h1><p class="account-lede">Velkommen tilbake. Logg inn for å bruke verktøyene, læringsmodulene og simuleringen.</p>
 <button class="account-google" type="button" id="accountGoogle">${googleMark}Fortsett med Google</button>
 <p class="account-divider"><span>eller med e-post</span></p>
 <form id="accountForm" class="account-form" novalidate><label for="accountEmail">E-post</label><input id="accountEmail" type="email" autocomplete="username" required maxlength="254" placeholder="navn@eksempel.no" aria-describedby="accountEmailError">${err('accountEmailError')}
 <label for="accountPassword">Passord</label><div class="account-password"><input id="accountPassword" type="password" autocomplete="current-password" required maxlength="128" aria-describedby="accountPasswordError">${reveal('accountPassword')}</div>${err('accountPasswordError')}
 <div class="account-form-row"><label class="account-remember"><input id="accountRemember" type="checkbox" data-remember> Husk meg på denne enheten</label><button class="account-link account-forgot" type="button" id="accountReset">Glemt passord?</button></div>
 <button class="btn btn-primary account-wide" id="accountLogin" type="submit">Logg inn</button></form>
 <div class="account-status-slot" data-status-slot="login"></div>
 <p class="account-switch">Ny her? <button class="account-link" type="button" id="accountToSignup">Opprett gratis konto</button></p>
 <p class="account-footnote"><a href="#vilkar">Bruksvilkår</a> · <a href="#personvern">Personvern</a></p>
 </section>
 <section class="account-auth-view" data-konto-view="signup" id="accountSignupView" aria-labelledby="accountSignupTitle">
 <h1 id="accountSignupTitle">Opprett gratis konto</h1><p class="account-lede">Det tar under ett minutt. Du må bekrefte e-postadressen før du kan bruke verktøyene.</p>
 <form id="accountSignupForm" class="account-form" novalidate>
 <div class="account-trap" aria-hidden="true"><label for="accountWebsite">Nettsted</label><input id="accountWebsite" name="website" type="text" tabindex="-1" autocomplete="off"></div>
 <label for="accountSignupEmail">E-post</label><input id="accountSignupEmail" type="email" autocomplete="email" required maxlength="254" placeholder="navn@eksempel.no" aria-describedby="accountSignupEmailError">${err('accountSignupEmailError')}
 <label for="accountSignupPassword">Velg passord</label><div class="account-password"><input id="accountSignupPassword" type="password" autocomplete="new-password" required minlength="12" maxlength="128" aria-describedby="accountPasswordHint accountSignupPasswordError">${reveal('accountSignupPassword')}</div>
 <p class="account-hint" id="accountPasswordHint">Minst 12 tegn. En setning du husker fungerer fint.</p>${err('accountSignupPasswordError')}
 <label for="accountSignupConfirm">Gjenta passordet</label><div class="account-password"><input id="accountSignupConfirm" type="password" autocomplete="new-password" required maxlength="128" aria-describedby="accountSignupConfirmError">${reveal('accountSignupConfirm')}</div>${err('accountSignupConfirmError')}
 <label class="account-remember"><input id="accountRememberSignup" type="checkbox" data-remember> Husk meg på denne enheten</label>
 ${consents('signupConsent')}
 <button class="btn btn-primary account-wide" id="accountRegister" type="submit">Opprett konto</button>
 <p class="account-divider"><span>eller</span></p>
 <button class="account-google" type="button" id="accountGoogleSignup">${googleMark}Opprett konto med Google</button></form>
 <div class="account-status-slot" data-status-slot="signup"></div>
 <p class="account-switch">Har du konto? <button class="account-link" type="button" id="accountToLogin">Logg inn</button></p>
 </section>
 <section class="account-auth-view" data-konto-view="verify" id="accountVerifyView" aria-labelledby="accountVerifyTitle">
 <h1 id="accountVerifyTitle">Bekreft e-postadressen</h1><p class="account-lede">Vi har sendt en lenke til <strong id="accountVerifyEmail"></strong>. Åpne lenken, og kom tilbake hit. Sjekk også søppelpost.</p>
 <div id="accountVerification" class="account-verify-actions"><button class="btn btn-primary account-wide" type="button" id="accountRefresh">Jeg har bekreftet e-posten</button><button class="btn btn-secondary account-wide" type="button" id="accountVerify">Send ny lenke</button></div>
 <div class="account-status-slot" data-status-slot="verify"></div>
 <p class="account-switch">Feil e-postadresse? <button class="account-link" type="button" data-account-logout>Logg ut</button></p>
 </section>
 <section class="account-auth-view" data-konto-view="consent" id="accountConsentView" aria-labelledby="accountConsentTitle">
 <h1 id="accountConsentTitle">Før du starter</h1><p class="account-lede">Bekreft de tre punktene for å bruke Kartlegg. Du gjør dette én gang, og på nytt hvis vilkårene endres.</p>
 <form id="accountConsentForm" class="account-form" novalidate>${consents('gateConsent')}<button class="btn btn-primary account-wide" type="submit" id="accountConsentAccept">Fortsett til Kartlegg</button></form>
 <div class="account-status-slot" data-status-slot="consent"></div>
 <p class="account-switch"><button class="account-link" type="button" data-account-logout>Logg ut</button></p>
 </section>`;
 (document.getElementById('accountMount')||document.getElementById('page-profil')||document.body).append(host);
 (document.getElementById('authMount')||document.getElementById('page-konto')||document.body).append(auth);
 const $=id=>host.querySelector('#'+id)||auth.querySelector('#'+id);
 const kontoPage=document.getElementById('page-konto');
 let backend, sync, user, operating=false, guest=null, guestRemember=false, generation=0, signupShownAt=Date.now(), pendingView='login', pendingConsent=false;
 // Restore the guest workspace immediately after a previous account session.
 try{if(localStorage.getItem('kartlegg.account.owner.v1')){const saved=JSON.parse(localStorage.getItem('kartlegg.account.guest.v1')||'null');document.getElementById('rememberProfile').checked=!!saved?.remember;applySettings(saved?.settings||saved||settings());guest=readSettings();guestRemember=document.getElementById('rememberProfile').checked;localStorage.removeItem('kartlegg.account.owner.v1')}}catch(_){}
 function status(message){$('accountStatus').textContent=typeof message==='string'?message:errorMessage(message)}
 function preview(s){if(!s)return 'Ingen lagrede kontoinnstillinger.';const p=settings(s);return Object.entries(p.profile).map(([k,v])=>({name:'Navn',role:'Stilling',work:'Arbeidssted',department:'Avdeling'}[k])+': '+(v||'–')).join('\n')+'\nFavoritter: '+(p.favorites.join(', ')||'–')+'\nUtseende: '+Object.values(p.appearance).join(' · ')}

 // Skjermene på #konto. Vakten bestemmer hvilken som gjelder for innloggede som mangler noe.
 function showView(view){
  const forced=gate?.state==='verify'?'verify':gate?.state==='consent'?'consent':null;
  view=forced||(['login','signup'].includes(view)?view:'login');
  if(kontoPage)kontoPage.dataset.kontoView=view;
  auth.querySelector('[data-status-slot="'+view+'"]')?.append($('accountStatus'));
  const reason=document.getElementById('kontoReason');
  if(reason)reason.textContent=view==='login'&&gate?.reason?'Logg inn for å bruke '+gate.reason+'.':'';
  if(view==='signup')signupShownAt=Date.now();
 }
 function focusView(){const h=auth.querySelector('[data-konto-view="'+kontoPage?.dataset.kontoView+'"] h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}}
 document.addEventListener('click',e=>{const a=e.target.closest?.('[data-auth-view]');if(!a)return;pendingView=a.dataset.authView;if(location.hash==='#konto'){e.preventDefault();showView(pendingView);focusView()}});
 let lastPage='';
 window.addEventListener('kartlegg:page',e=>{const p=e.detail?.page;if(p==='konto'){if(lastPage!=='konto'){status('');showView(pendingView);pendingView='login'}else showView(kontoPage?.dataset.kontoView)}lastPage=p});
 $('accountToSignup').onclick=()=>{status('');showView('signup');focusView()};
 $('accountToLogin').onclick=()=>{status('');showView('login');focusView()};

 function render(){
  $('accountGuest').hidden=!!user;$('accountMember').hidden=!user;
  const name=document.getElementById('profileName')?.value.trim()||'';
  $('accountIdentity').textContent=user?(user.email||'Google-bruker'):'';
  $('accountName').textContent=user?(name||'Innlogget'):'Innlogget';
  $('accountAvatar').textContent=user?((name?name.split(/\s+/).slice(0,2).map(w=>w[0]).join(''):(user.email||'K')[0])||'K').toUpperCase():'K';
  $('accountVerifyEmail').textContent=user?.email||'e-postadressen din';
  const c=sync?.conflict;$('accountConflict').hidden=!c;
  if(c){$('accountConflictText').textContent=c.first?'Velg kontoens innstillinger, eller importer innstillingene fra denne enheten.':'Begge versjoner er endret. Ingen av dem er overskrevet.';$('accountLocalPreview').textContent=preview(c.local);$('accountCloudPreview').textContent=preview(c.remote);$('accountUseCloud').disabled=!c.remote||operating||sync.busy}
  document.getElementById('profileTrigger')?.setAttribute('aria-label',user?'Åpne profil og konto – innlogget':'Åpne profil og konto');
  const pageEl=document.getElementById('page-profil');if(pageEl)pageEl.dataset.account=user?'member':'guest';
  const info=document.querySelector('.sender-editor .profile-info');
  if(info)info.textContent=user?'Profilen lagres i kontoen når du trykker «Bruk profil», og følger deg til mobil og PC.':'Uten konto gjelder profilen bare denne fanen, med mindre du krysser av for «Husk profilen».';
 }
 const buttons=()=>[...host.querySelectorAll('button'),...auth.querySelectorAll('button')];
 async function run(action){if(operating||!backend)return;operating=true;host.setAttribute('aria-busy','true');auth.setAttribute('aria-busy','true');const list=buttons();list.forEach(b=>b.disabled=true);
  try{await action()}catch(e){status(e)}finally{operating=false;host.removeAttribute('aria-busy');auth.removeAttribute('aria-busy');list.forEach(b=>b.disabled=false);render()}}

 // Validering med tydelige meldinger ved feltet. Første feil får fokus.
 function fieldError(input,errorId,message){const box=$(errorId);if(box){box.textContent=message||'';box.hidden=!message}input?.setAttribute('aria-invalid',message?'true':'false');return !message}
 const emailOk=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
 function consentsOk(prefix){
  const boxes=[...auth.querySelectorAll('#'+prefix+'Terms,#'+prefix+'Patient,#'+prefix+'Clinical')];
  const missing=boxes.filter(b=>!b.checked);
  fieldError(missing[0],prefix+'Error',missing.length?'Kryss av for alle tre punktene for å fortsette.':'');
  boxes.forEach(b=>b.setAttribute('aria-invalid',b.checked?'false':'true'));
  if(missing.length)missing[0].focus();
  return !missing.length;
 }
 const email=()=>$('accountEmail').value.trim();
 const password=()=>$('accountPassword').value;

 $('accountForm').addEventListener('submit',e=>{e.preventDefault();
  const a=fieldError($('accountEmail'),'accountEmailError',emailOk(email())?'':'Skriv inn e-postadressen din, for eksempel navn@eksempel.no.');
  const b=fieldError($('accountPassword'),'accountPasswordError',password()?'':'Skriv inn passordet ditt.');
  if(!a){$('accountEmail').focus();return}if(!b){$('accountPassword').focus();return}
  run(async()=>{await backend.login(email(),password());$('accountPassword').value=''});
 });
 $('accountSignupForm').addEventListener('submit',e=>{e.preventDefault();
  // Enkle tiltak mot automatisk registrering: et skjult felt som mennesker ikke fyller ut, og en minstetid.
  if($('accountWebsite').value||Date.now()-signupShownAt<2500){status('Noe gikk galt. Vent et øyeblikk og prøv igjen.');return}
  const mail=$('accountSignupEmail').value.trim(),p=$('accountSignupPassword').value,c=$('accountSignupConfirm').value;
  const checks=[
   [$('accountSignupEmail'),fieldError($('accountSignupEmail'),'accountSignupEmailError',emailOk(mail)?'':'Skriv inn en gyldig e-postadresse, for eksempel navn@eksempel.no.')],
   [$('accountSignupPassword'),fieldError($('accountSignupPassword'),'accountSignupPasswordError',p.length>=12?'':'Passordet må ha minst 12 tegn.')],
   [$('accountSignupConfirm'),fieldError($('accountSignupConfirm'),'accountSignupConfirmError',c&&c===p?'':'Passordene er ikke like.')]];
  const first=checks.find(([,ok])=>!ok);if(first){first[0].focus();return}
  if(!consentsOk('signupConsent'))return;
  run(async()=>{
   pendingConsent=true;
   try{await backend.register(mail,p)}
   catch(error){pendingConsent=false;if(error?.code==='auth/email-already-in-use'){$('accountEmail').value=mail;showView('login');status('Det finnes allerede en konto med denne e-postadressen. Logg inn, eller trykk «Glemt passord?».');return}throw error}
   $('accountSignupPassword').value='';$('accountSignupConfirm').value='';
   status('Kontoen er opprettet. Vi har sendt deg en lenke for å bekrefte e-postadressen.');
  });
 });
 $('accountGoogle').onclick=()=>run(()=>backend.google());
 $('accountGoogleSignup').onclick=()=>{if(!consentsOk('signupConsent'))return;pendingConsent=true;run(async()=>{try{await backend.google()}catch(e){pendingConsent=false;throw e}})};
 $('accountConsentForm').addEventListener('submit',e=>{e.preventDefault();if(!consentsOk('gateConsent'))return;run(async()=>{await saveConsent();await changedUser(backend.user)})});
 auth.querySelectorAll('[data-reveal]').forEach(b=>b.onclick=()=>{const input=$(b.dataset.reveal),show=input.type==='password';input.type=show?'text':'password';b.textContent=show?'Skjul':'Vis';b.setAttribute('aria-pressed',String(show));b.setAttribute('aria-label',show?'Skjul passord':'Vis passord')});

 // Bekreftelsen lagres i Firestore (consents/{uid}). Er reglene ikke publisert ennå, huskes den på enheten.
 const localConsentKey=uid=>'kartlegg.consent.v1.'+uid;
 async function saveConsent(){
  const uid=backend?.user?.uid;if(!uid)return;
  try{localStorage.setItem(localConsentKey(uid),TERMS_VERSION)}catch(_){}
  try{await backend.writeConsent?.(uid)}catch(_){}
 }
 async function hasConsent(uid){
  try{const d=await backend.readConsent?.(uid);if(d&&d.version>=TERMS_VERSION)return true}catch(_){}
  try{return (localStorage.getItem(localConsentKey(uid))||'')>=TERMS_VERSION}catch(_){return false}
 }

 // «Husk meg»: lagrer bare valget (ingen personopplysninger). Innloggingen varer da til utlogging.
 const REMEMBER_KEY='kartlegg.account.remember.v1';
 const remembered=()=>{try{return localStorage.getItem(REMEMBER_KEY)==='1'}catch(_){return false}};
 const rememberBoxes=[...auth.querySelectorAll('[data-remember]')];
 rememberBoxes.forEach(b=>b.checked=remembered());
 rememberBoxes.forEach(b=>b.addEventListener('change',()=>{rememberBoxes.forEach(x=>x.checked=b.checked);try{b.checked?localStorage.setItem(REMEMBER_KEY,'1'):localStorage.removeItem(REMEMBER_KEY)}catch(_){}backend?.remember?.(b.checked)}));

 $('accountReset').onclick=()=>{if(!fieldError($('accountEmail'),'accountEmailError',emailOk(email())?'':'Skriv inn e-postadressen din først, så sender vi en lenke.')){$('accountEmail').focus();return}run(async()=>{try{await backend.reset(email())}catch(e){if(!['auth/user-not-found','auth/invalid-credential'].includes(e.code))throw e}status('Hvis adressen har en konto, får du en e-post med lenke for å velge nytt passord. Sjekk også søppelpost.')})};
 $('accountVerify').onclick=()=>run(async()=>{await backend.verify();status('Ny lenke er sendt. Sjekk også søppelpost.')});
 $('accountRefresh').onclick=()=>run(async()=>{await backend.refresh();await changedUser(backend.user);if(gate?.state==='verify')status('E-postadressen er ikke bekreftet ennå. Åpne lenken i e-posten, og prøv igjen.')});
 $('accountSync').onclick=()=>run(()=>sync.retry());
 $('accountUseLocal').onclick=()=>run(()=>sync.choose('local'));
 $('accountUseCloud').onclick=()=>run(()=>sync.choose('cloud'));
 async function logout(){if(sync?.active&&!same(readSettings(),sync.base)&&!confirm('Du har ulagrede kontoendringer. Logge ut og fjerne dem fra denne enheten?'))return;await backend.logout();status('Du er logget ut. Målinger og kontoens profil er fjernet fra denne enheten.');location.hash='start'}
 $('accountLogout').onclick=()=>run(logout);
 auth.querySelectorAll('[data-account-logout]').forEach(b=>b.onclick=()=>run(logout));
 $('accountReauth').onclick=()=>run(async()=>{const p=$('accountReauthPassword').value;$('accountReauthPassword').value='';await backend.reauthenticate(p);status('Innloggingen er bekreftet.')});
 $('accountLinkGoogle').onclick=()=>run(async()=>{await backend.linkGoogle();status('Google er koblet til den samme kontoen.')});
 $('accountAddPassword').onclick=()=>run(async()=>{await backend.addPassword();status('Lenke for å velge passord er sendt til kontoens e-postadresse. Sjekk også søppelpost.')});
 $('accountExport').onclick=()=>run(async()=>{const cloud=await backend.read(user.uid);const blob=new Blob([JSON.stringify({email:user.email,settings:cloud?.settings||null},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='kartlegg-kontoinnstillinger.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Kontoinnstillingene er lastet ned.')});
 $('accountDelete').onclick=()=>run(async()=>{if(!$('accountDeleteConfirm').checked){status('Kryss av for permanent sletting først.');return}await sync.remove();status('Kontoen og profilinnholdet i skyen er slettet.');location.hash='start'});
 function wipePending(uid){try{localStorage.removeItem('kartlegg.account.pending.v1.'+uid)}catch(_){}}
 async function changedUser(next){
  const token=++generation;
  const old=user;sync?.stop();user=next;
  if(!next){if(old)wipePending(old.uid);if(guest){sync.applying=true;document.getElementById('rememberProfile').checked=guestRemember;applySettings(guest);sync.applying=false;guest=null}try{localStorage.removeItem('kartlegg.account.guest.v1')}catch(_){}try{localStorage.removeItem('kartlegg.account.owner.v1')}catch(_){}render();gate?.setState('guest');showView('login');return}
  if(old&&old.uid!==next.uid){wipePending(old.uid);sync.applying=true;applySettings(guest||settings());sync.applying=false}
  if(!guest){guest=readSettings();guestRemember=document.getElementById('rememberProfile').checked;}
  try{localStorage.setItem('kartlegg.account.guest.v1',JSON.stringify({settings:settings({...guest,profile:guestRemember?guest.profile:{}}),remember:guestRemember}))}catch(_){}
  // Store only nonclinical settings. The owner marker prevents a different account importing these silently.
  try{const owner=localStorage.getItem('kartlegg.account.owner.v1');if(owner&&owner!==next.uid){sync.applying=true;applySettings(settings());sync.applying=false}localStorage.setItem('kartlegg.account.owner.v1',next.uid)}catch(_){}
  render();
  // Bekreftelsene fra registreringsskjemaet lagres med en gang den nye brukeren finnes.
  if(pendingConsent){pendingConsent=false;await saveConsent();if(token!==generation)return}
  if(!next.emailVerified){gate?.setState('verify');showView('verify');return}
  if(!await hasConsent(next.uid)){if(token!==generation)return;gate?.setState('consent');showView('consent');return}
  if(token!==generation)return;
  status('');gate?.setState('member',next.uid);
  await sync.start(next.uid);if(token!==generation)return;render();
  // Både enheten og kontoen har innhold: valget står på Profil, så brukeren tas dit.
  if(sync.conflict)location.hash='profil';
 }
 window.addEventListener('kartlegg:settings-changed',()=>sync?.changed());
 document.getElementById('saveProfile')?.addEventListener('click',()=>{if(user?.emailVerified)document.getElementById('profileStatus').textContent='Lagret i kontoen.'});
 window.addEventListener('online',()=>{if(sync?.active)sync.retry()});
 showView(pendingView);
 if(!enabled){buttons().forEach(b=>b.disabled=true);status('Konto er ikke aktivert. Verktøyene er åpne inntil videre.');gate?.setState('open');return {host,auth}}
 status('Kobler til kontotjenesten …');buttons().forEach(b=>b.disabled=true);
 loadBackend().then(async b=>{backend=b;try{await b.remember?.(remembered())}catch(_){}let storage;try{storage=localStorage}catch(_){}sync=new SyncSession({backend,read:readSettings,apply:applySettings,storage,notify(message){status(message);render()}});buttons().forEach(x=>x.disabled=false);status('');backend.observe(changedUser)}).catch(()=>{status('Innloggingstjenesten kunne ikke lastes. Kontroller nettet og last siden på nytt.');gate?.setState('guest')});
 return {host,auth,get sync(){return sync}};
}
