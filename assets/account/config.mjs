// Public web identifiers, NOT administrative credentials. Security lives in Firestore Rules.
// No Analytics, Storage, Messaging, Functions or paid services are initialized.
export const firebaseConfig = Object.freeze({
  apiKey: 'AIzaSyArfOBAy-T_cuirw91FmUCKYl2nIxcbzZw',
  authDomain: 'kartlegg.firebaseapp.com',
  projectId: 'kartlegg',
  appId: '1:762477492294:web:6ac8d17b9984c188e7f247'
});
// Enabled for the first production rollout, authorized by the owner on 2026-10-19.
export const accountEnabled = true;
// Gjeldende versjon av bruksvilkårene. Ny versjon = alle må bekrefte på nytt ved neste innlogging.
export const termsVersion = '2026-10-21';
// Firebase App Check med reCAPTCHA v3 (gratis). Tom streng = av. Fyll inn nettstedsnøkkelen fra
// Firebase-konsollen (App Check → Apps → reCAPTCHA v3) og slå på håndhevelse for Cloud Firestore der.
export const appCheckSiteKey = '';
