import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import {getAuth,browserLocalPersistence,browserSessionPersistence,inMemoryPersistence,setPersistence,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signInWithPopup,GoogleAuthProvider,sendEmailVerification,sendPasswordResetEmail,signOut,deleteUser,reload,getIdToken,EmailAuthProvider,reauthenticateWithCredential,reauthenticateWithPopup,linkWithPopup} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import {firebaseConfig,appCheckSiteKey,termsVersion} from './config.mjs';
import {documentData,validDocument} from './model.mjs';
const app=initializeApp(firebaseConfig);
// App Check (valgfritt): beviser overfor Firestore at forespørselen kommer fra Kartlegg, ikke et skript.
if(appCheckSiteKey){
 try{const ac=await import('https://www.gstatic.com/firebasejs/13.0.0/firebase-app-check.js');ac.initializeAppCheck(app,{provider:new ac.ReCaptchaV3Provider(appCheckSiteKey),isTokenAutoRefreshEnabled:true})}catch(_){}
}
const auth=getAuth(app);auth.languageCode='nb';
// Databasen (Firestore, ca. 180 kB) trengs bare etter innlogging. Den lastes derfor først når den brukes,
// så innloggingssjekken og siden ikke må vente på den.
const FIRESTORE='https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
let store=null;
function firestore(){
 store??=import(FIRESTORE).then(f=>({f,db:f.initializeFirestore(app,{localCache:f.memoryLocalCache()})})).catch(e=>{store=null;throw e});
 return store;
}
const google=new GoogleAuthProvider();google.setCustomParameters({prompt:'select_account'});
// «Husk meg» (opt-in, per enhet): innloggingen varer til utlogging. Ellers bare til nettleseren lukkes.
// Valget lagres av ui.mjs; denne modulen lagrer ingenting selv.
async function persist(on){try{await setPersistence(auth,on?browserLocalPersistence:browserSessionPersistence)}catch(_){await setPersistence(auth,inMemoryPersistence)}}
const ref=({f,db},uid)=>f.doc(db,'users',uid);
const consentRef=({f,db},uid)=>f.doc(db,'consents',uid);
const failure=code=>Object.assign(Error(code),{code});
function unpack(snapshot){
 if(!snapshot.exists())return null;
 const d=snapshot.data();
 if(d.state==='deleting')throw failure('account-deleting');
 if(!validDocument(d))throw failure('permission-denied');
 return d;
}
export const backend={
 get user(){return auth.currentUser},
 remember:on=>persist(on),
 // Når noen er logget inn, begynner nedlastingen av databasen med en gang.
 observe:cb=>onAuthStateChanged(auth,u=>{if(u)firestore().catch(()=>{});cb(u)}),
 async register(email,password){const {user}=await createUserWithEmailAndPassword(auth,email,password);await sendEmailVerification(user)},
 login:(email,password)=>signInWithEmailAndPassword(auth,email,password),
 google:()=>signInWithPopup(auth,google),
 linkGoogle:()=>linkWithPopup(auth.currentUser,google),
 addPassword:()=>sendPasswordResetEmail(auth,auth.currentUser.email),
 reset:email=>sendPasswordResetEmail(auth,email),
 verify:()=>sendEmailVerification(auth.currentUser),
 async refresh(){await reload(auth.currentUser);await getIdToken(auth.currentUser,true)},
 // Innloggingsbevis til Kartleggs egen AI-tjeneste (worker/), som sjekker det hos Google.
 idToken:()=>auth.currentUser?getIdToken(auth.currentUser):Promise.resolve(null),
 logout:()=>signOut(auth),
 async reauthenticate(password){
  const u=auth.currentUser;
  if(password)return reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,password));
  return reauthenticateWithPopup(u,google);
 },
 async read(uid){const s=await firestore();return unpack(await s.f.getDocFromServer(ref(s,uid)))},
 // Bekreftelsene ved registrering: versjon av vilkårene og tidspunkt. Bare eieren kan lese og skrive (firestore.rules).
 async readConsent(uid){const s=await firestore(),snap=await s.f.getDocFromServer(consentRef(s,uid));return snap.exists()?snap.data():null},
 async writeConsent(uid){const s=await firestore(),r=consentRef(s,uid);await s.f.runTransaction(s.db,async tx=>{const old=await tx.get(r);const d={version:termsVersion,terms:true,patientData:true,clinicalResponsibility:true,acceptedAt:s.f.serverTimestamp()};old.exists()?tx.update(r,d):tx.set(r,d)})},
 termsVersion,
 // Returnerer avmeldingen med en gang, også mens databasen fortsatt lastes ned.
 watch(uid,receive,error){
  let stop=null,cancelled=false;
  firestore().then(s=>{if(cancelled)return;stop=s.f.onSnapshot(ref(s,uid),{includeMetadataChanges:true},snap=>{if(snap.metadata.fromCache||snap.metadata.hasPendingWrites)return;try{receive(unpack(snap))}catch(e){error(e)}},error)},error);
  return ()=>{cancelled=true;stop?.()};
 },
 async write(uid,value,expected){
  const s=await firestore(),r=ref(s,uid);
  return s.f.runTransaction(s.db,async tx=>{
   if(auth.currentUser?.uid!==uid)throw failure('permission-denied');
   const old=unpack(await tx.get(r));
   if((old?.revision||0)!==expected)throw failure('conflict');
   const d=documentData(value,expected+1,s.f.serverTimestamp());tx.set(r,d);return {...d};
  });
 },
 async remove(){
  const user=auth.currentUser;
  // Durable tombstone blocks other sessions from recreating settings mid-deletion.
  const s=await firestore(),r=ref(s,user.uid);
  await s.f.runTransaction(s.db,async tx=>{
   const snap=await tx.get(r);
   if(snap.data()?.state==='deleting')return;
   tx.set(r,{schemaVersion:1,state:'deleting',updatedAt:s.f.serverTimestamp()});
  });
  await deleteUser(user);
  // Minimal tombstone (UID path + deletion time) requires operator cleanup; no profile remains.
 }
};
