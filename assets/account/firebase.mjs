import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import {getAuth,browserSessionPersistence,inMemoryPersistence,setPersistence,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signInWithPopup,GoogleAuthProvider,sendEmailVerification,sendPasswordResetEmail,signOut,deleteUser,reload,getIdToken,EmailAuthProvider,reauthenticateWithCredential,reauthenticateWithPopup,linkWithPopup} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import {initializeFirestore,memoryLocalCache,doc,getDocFromServer,onSnapshot,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
import {firebaseConfig} from './config.mjs';
import {documentData,validDocument} from './model.mjs';
const app=initializeApp(firebaseConfig);
const auth=getAuth(app);auth.languageCode='nb';
const db=initializeFirestore(app,{localCache:memoryLocalCache()});
const google=new GoogleAuthProvider();google.setCustomParameters({prompt:'select_account'});
try{await setPersistence(auth,browserSessionPersistence)}catch(_){await setPersistence(auth,inMemoryPersistence)}
const ref=uid=>doc(db,'users',uid);
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
 observe:cb=>onAuthStateChanged(auth,cb),
 async register(email,password){const {user}=await createUserWithEmailAndPassword(auth,email,password);await sendEmailVerification(user)},
 login:(email,password)=>signInWithEmailAndPassword(auth,email,password),
 google:()=>signInWithPopup(auth,google),
 linkGoogle:()=>linkWithPopup(auth.currentUser,google),
 addPassword:()=>sendPasswordResetEmail(auth,auth.currentUser.email),
 reset:email=>sendPasswordResetEmail(auth,email),
 verify:()=>sendEmailVerification(auth.currentUser),
 async refresh(){await reload(auth.currentUser);await getIdToken(auth.currentUser,true)},
 logout:()=>signOut(auth),
 async reauthenticate(password){
  const u=auth.currentUser;
  if(password)return reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,password));
  return reauthenticateWithPopup(u,google);
 },
 async read(uid){return unpack(await getDocFromServer(ref(uid)))},
 watch(uid,receive,error){return onSnapshot(ref(uid),{includeMetadataChanges:true},snap=>{if(snap.metadata.fromCache||snap.metadata.hasPendingWrites)return;try{receive(unpack(snap))}catch(e){error(e)}},error)},
 async write(uid,value,expected){
  return runTransaction(db,async tx=>{
   if(auth.currentUser?.uid!==uid)throw failure('permission-denied');
   const old=unpack(await tx.get(ref(uid)));
   if((old?.revision||0)!==expected)throw failure('conflict');
   const d=documentData(value,expected+1,serverTimestamp());tx.set(ref(uid),d);return {...d};
  });
 },
 async remove(){
  const user=auth.currentUser;
  // Durable tombstone blocks other sessions from recreating settings mid-deletion.
  await runTransaction(db,async tx=>{
   const snap=await tx.get(ref(user.uid));
   if(snap.data()?.state==='deleting')return;
   tx.set(ref(user.uid),{schemaVersion:1,state:'deleting',updatedAt:serverTimestamp()});
  });
  await deleteUser(user);
  // Minimal tombstone (UID path + deletion time) requires operator cleanup; no profile remains.
 }
};
