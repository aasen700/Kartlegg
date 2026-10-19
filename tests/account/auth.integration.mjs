// SDK integration against local emulators only, no real Firebase accounts or email.
import test,{before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initializeApp,deleteApp} from 'firebase/app';
import {initializeAuth,inMemoryPersistence,connectAuthEmulator,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendEmailVerification,applyActionCode,reload,getIdToken,sendPasswordResetEmail,confirmPasswordReset,signOut,GoogleAuthProvider,signInWithCredential,linkWithCredential,deleteUser} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,doc,setDoc,getDoc,serverTimestamp,terminate} from 'firebase/firestore';
import {initializeTestEnvironment} from '@firebase/rules-unit-testing';
import {documentData,settings} from '../../assets/account/model.mjs';
const project='demo-kartlegg',url='http://127.0.0.1:9099';
let app,auth,db,env;
before(async()=>{
 env=await initializeTestEnvironment({projectId:project,firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync('firestore.rules','utf8')}});
 app=initializeApp({apiKey:'fake-demo-key',projectId:project},'account-auth-integration');auth=initializeAuth(app,{persistence:inMemoryPersistence});connectAuthEmulator(auth,url,{disableWarnings:true});db=getFirestore(app);connectFirestoreEmulator(db,'127.0.0.1',8080);
});
beforeEach(async()=>{await signOut(auth);await env.clearFirestore();const r=await fetch(`${url}/emulator/v1/projects/${project}/accounts`,{method:'DELETE'});assert.ok(r.ok)});
after(async()=>{await terminate(db);await deleteApp(app);await env.cleanup()});
async function code(email,type){const r=await fetch(`${url}/emulator/v1/projects/${project}/oobCodes`);assert.ok(r.ok);return (await r.json()).oobCodes.find(c=>c.email===email&&c.requestType===type)?.oobCode}
const email='synthetic@example.test',password='Synthetic-only-1234!';
const write=()=>setDoc(doc(db,'users',auth.currentUser.uid),documentData(settings({profile:{name:'Synthetic Clinician'}}),1,serverTimestamp()));
test('email registration, real verification token refresh, cloud access and sign-out',async()=>{
 const {user}=await createUserWithEmailAndPassword(auth,email,password);assert.equal(user.emailVerified,false);
 await assert.rejects(write(),e=>e.code==='permission-denied');
 await sendEmailVerification(user);const oob=await code(email,'VERIFY_EMAIL');assert.ok(oob);await applyActionCode(auth,oob);await reload(user);await getIdToken(user,true);assert.equal(user.emailVerified,true);
 await write();const ref=doc(db,'users',user.uid);assert.equal((await getDoc(ref)).data().settings.profile.name,'Synthetic Clinician');
 await signOut(auth);await assert.rejects(getDoc(ref),e=>e.code==='permission-denied');
});
test('password reset email code actually changes the credential',async()=>{
 await createUserWithEmailAndPassword(auth,email,password);await signOut(auth);await sendPasswordResetEmail(auth,email);
 const oob=await code(email,'PASSWORD_RESET');assert.ok(oob);await confirmPasswordReset(auth,oob,'Reset-synthetic-1234!');
 await assert.rejects(signInWithEmailAndPassword(auth,email,password));await signInWithEmailAndPassword(auth,email,'Reset-synthetic-1234!');assert.equal(auth.currentUser.email,email);
});
test('duplicate email cannot create an independent password account',async()=>{
 const {user}=await createUserWithEmailAndPassword(auth,email,password);const uid=user.uid;await signOut(auth);
 await assert.rejects(createUserWithEmailAndPassword(auth,email,password),e=>e.code==='auth/email-already-in-use');await signInWithEmailAndPassword(auth,email,password);assert.equal(auth.currentUser.uid,uid);
});
test('Google credential and adding a password retain the same UID',async()=>{
 // Auth emulator accepts an unsigned synthetic Google ID token; never used outside localhost.
 const token=[{alg:'none',typ:'JWT'},{iss:'https://accounts.google.com',aud:'synthetic',sub:'synthetic-google-id',email:'google@example.test',email_verified:true},''].map((v,i)=>i<2?Buffer.from(JSON.stringify(v)).toString('base64url'):v).join('.');
 const {user}=await signInWithCredential(auth,GoogleAuthProvider.credential(token));const uid=user.uid;assert.equal(user.email,'google@example.test');assert.equal(user.providerData[0].providerId,'google.com');
 await sendPasswordResetEmail(auth,'google@example.test');await confirmPasswordReset(auth,await code('google@example.test','PASSWORD_RESET'),password);await signOut(auth);
 await signInWithEmailAndPassword(auth,'google@example.test',password);assert.equal(auth.currentUser.uid,uid);await signOut(auth);await signInWithCredential(auth,GoogleAuthProvider.credential(token));assert.equal(auth.currentUser.uid,uid);await signOut(auth);await signInWithEmailAndPassword(auth,'google@example.test',password);assert.equal(auth.currentUser.uid,uid);
});
test('profile is tombstoned before Auth deletion; old session cannot recreate it',async()=>{
 const {user}=await createUserWithEmailAndPassword(auth,email,password);await sendEmailVerification(user);await applyActionCode(auth,await code(email,'VERIFY_EMAIL'));await reload(user);await getIdToken(user,true);await write();
 const uid=user.uid, ref=doc(db,'users',uid);await setDoc(ref,{schemaVersion:1,state:'deleting',updatedAt:serverTimestamp()});assert.equal((await getDoc(ref)).data().settings,undefined);await deleteUser(user);assert.equal(auth.currentUser,null);
 await assert.rejects(signInWithEmailAndPassword(auth,email,password));
 const old=env.authenticatedContext(uid,{email_verified:true,auth_time:Math.floor(Date.now()/1000)}).firestore();await assert.rejects(setDoc(doc(old,'users',uid),documentData(settings(),1,serverTimestamp())),e=>e.code==='permission-denied');
});

test('verified password account links Google and preserves UID for both methods',async()=>{
 const {user}=await createUserWithEmailAndPassword(auth,email,password);await sendEmailVerification(user);await applyActionCode(auth,await code(email,'VERIFY_EMAIL'));await reload(user);await getIdToken(user,true);const uid=user.uid;
 const token=[{alg:'none',typ:'JWT'},{iss:'https://accounts.google.com',aud:'synthetic',sub:'linked-google-id',email,email_verified:true},''].map((v,i)=>i<2?Buffer.from(JSON.stringify(v)).toString('base64url'):v).join('.');
 await linkWithCredential(user,GoogleAuthProvider.credential(token));await signOut(auth);await signInWithCredential(auth,GoogleAuthProvider.credential(token));assert.equal(auth.currentUser.uid,uid);await signOut(auth);await signInWithEmailAndPassword(auth,email,password);assert.equal(auth.currentUser.uid,uid);
});
