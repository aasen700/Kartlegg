// This is the sole cloud payload builder. Never serialize a form, DOM tree or localStorage.
export const TOOL_IDS = Object.freeze(['news2','qsofa','gcs','4at','nrs','bmi-bsa','resp-timer','mst','tug','esas-r','ortho-bt','fast','skuv','times','palliasjon','abcde','abi','medication-lab']);
export const OPTIONS = Object.freeze({
  mode:['light','dark','system'], accent:['violet','blue','green'],
  service:['custom','hospital','ambulance','urgent','homecare'],
  base:['standard','philip'], season:['off','auto','halloween','christmas','breast-cancer','mental-health','pride'], surface:['solid','glass']
});
const defaults={mode:'system',accent:'blue',service:'custom',base:'standard',season:'off',surface:'solid'};
export function settings(raw={}) {
  const profile={};
  for(const key of ['name','role','work','department']) profile[key]=typeof raw?.profile?.[key]==='string'?raw.profile[key].trim().slice(0,120):'';
  const appearance={};
  for(const key of Object.keys(OPTIONS)) appearance[key]=OPTIONS[key].includes(raw?.appearance?.[key])?raw.appearance[key]:defaults[key];
  return {profile, favorites:[...new Set(Array.isArray(raw?.favorites)?raw.favorites.filter(id=>TOOL_IDS.includes(id)):[])],appearance};
}
export const same=(a,b)=>JSON.stringify(settings(a))===JSON.stringify(settings(b));
export function documentData(value,revision,serverTime) {
  if(!Number.isSafeInteger(revision)||revision<1)throw Error('Invalid revision');
  return {schemaVersion:1,state:'active',revision,settings:settings(value),updatedAt:serverTime};
}
export function canonical(value){return JSON.stringify(value, function(key,v){return v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v})}
export function validDocument(d){
  return !!d&&d.schemaVersion===1&&d.state==='active'&&Number.isSafeInteger(d.revision)&&d.revision>0&&
    canonical(d.settings)===canonical(settings(d.settings));
}
export function reconcile(base,local,remote) {
  if(same(local,remote))return 'equal';
  if(base&&same(local,base))return 'remote';
  if(base&&same(remote,base))return 'local';
  return 'conflict';
}
export function errorMessage(error) {
 const code=error?.code||'';
 return ({
  'auth/invalid-email':'Skriv inn en gyldig e-postadresse.',
  'auth/invalid-credential':'Innloggingen mislyktes. Kontroller e-post og passord, eller bruk Google hvis kontoen ble opprettet der.',
  'auth/wrong-password':'Innloggingen mislyktes. Kontroller e-post og passord.',
  'auth/user-not-found':'Innloggingen mislyktes. Kontroller e-post og passord.',
  'auth/email-already-in-use':'Denne e-postadressen kan allerede ha en konto. Logg inn med Google eller tilbakestill passordet.',
  'auth/account-exists-with-different-credential':'Logg inn med den opprinnelige innloggingsmetoden først. Koble deretter til Google under kontoadministrasjon.',
  'auth/credential-already-in-use':'Denne Google-kontoen er allerede knyttet til en annen konto. Logg inn med den eksisterende kontoen.',
  'auth/provider-already-linked':'Google er allerede koblet til kontoen.',
  'auth/weak-password':'Velg et sterkere passord med minst 12 tegn.',
  'auth/password-does-not-meet-requirements':'Passordet er for svakt. Bruk minst 12 tegn, gjerne noen ord etter hverandre.',
  'auth/missing-password':'Skriv inn passordet ditt.',
  'auth/missing-email':'Skriv inn e-postadressen din.',
  'auth/user-token-expired':'Du er blitt logget ut. Logg inn igjen.',
  'auth/invalid-user-token':'Du er blitt logget ut. Logg inn igjen.',
  'auth/internal-error':'Innloggingstjenesten svarte ikke som den skulle. Vent litt og prøv igjen.',
  'auth/quota-exceeded':'Innloggingstjenesten har nådd dagens grense. Prøv igjen senere.',
  'auth/popup-blocked':'Nettleseren blokkerte Google-vinduet. Tillat popupvinduer og trykk Google igjen, eller bruk e-post.',
  'auth/popup-closed-by-user':'Google-innloggingen ble avbrutt. Prøv igjen når du er klar.',
  'auth/cancelled-popup-request':'Et Google-vindu er allerede åpent.',
  'auth/unauthorized-domain':'Innlogging er ikke slått på for denne adressen ennå. Bruk kartlegg.com.',
  'auth/network-request-failed':'Fikk ikke kontakt med innloggingen. Sjekk at du er på nett, og prøv igjen.',
  'auth/too-many-requests':'For mange forsøk på kort tid. Vent noen minutter, eller trykk «Glemt passord?».',
  'auth/requires-recent-login':'Bekreft innloggingen på nytt før du fortsetter.',
  'auth/user-disabled':'Kontoen er deaktivert. Kontakt den som drifter Kartlegg.',
  'auth/operation-not-allowed':'Denne innloggingsmetoden er ikke aktivert ennå.',
  'permission-denied':'Skylagring ble avvist. Bekreft e-posten, eller kontakt den som drifter Kartlegg. Lokale endringer er beholdt.',
  'unavailable':'Skylagring er utilgjengelig. Endringene er beholdt på denne enheten. Prøv synkronisering igjen.',
  'resource-exhausted':'Gratisgrensen for skylagring er nådd. Bruk Kartlegg lokalt og prøv senere.',
  'account-deleting':'Sletting av kontoen er påbegynt. Fullfør sletting under kontoadministrasjon.',
  'conflict':'Innstillingene er også endret på en annen enhet. Velg hvilken versjon du vil bruke.'
 })[code]||'Noe gikk galt, og det ble ikke lagret noe nytt. Prøv igjen om litt.';
}
