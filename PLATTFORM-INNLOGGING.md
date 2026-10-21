# Innloggingsbeskyttet Kartlegg – status

**Utviklet på:** `feature/innlogget-plattform` i `aasen700/Kartlegg-test`. **Flyttet til produksjon** (`aasen700/Kartlegg`, kartlegg.com) 20. oktober 2026 etter godkjenning fra eier.
**Dato:** 20. oktober 2026.

## Hva som er bygget

| Del | Filer | Status |
|---|---|---|
| Offentlig forside med funksjoner, målgruppe, ansvarsfraskrivelse og «Logg inn» / «Opprett gratis konto» | `index.html` (`#page-start`), `assets/css/13-public.css` | Ferdig |
| Innloggingsvakt: offentlige og beskyttede sider, retur til ønsket side, hengelås i menyen, lasteskjerm mens innloggingen sjekkes | `assets/auth-gate.js`, `assets/app.js` | Ferdig |
| Egen kontoside: innlogging, registrering, e-postbekreftelse, bekreftelse av vilkår | `assets/account/ui.mjs` (`#page-konto`) | Ferdig |
| Tre separate, ikke forhåndsavkryssede bekreftelser (vilkår, pasientopplysninger, klinisk ansvar) ved registrering og for eksisterende kontoer | `assets/account/ui.mjs`, `firestore.rules`, `assets/account/firebase.mjs` | Ferdig i kode. Krever at reglene publiseres (se under) for å lagres på serveren |
| Bruksvilkår og personvernerklæring, åpne før og etter innlogging | `index.html` (`#page-vilkar`, `#page-personvern`) | Ferdigstilt 21. oktober 2026 (ikke gjennomgått av jurist) |
| «Øvingsforløp» (tidligere «Målinger over tid») lagret lokalt i høyst 24 timer, bare tall og faste valg og tid siden forrige måling – ingen dato eller klokkeslett –, knyttet til bruker, slettet ved utlogging | `assets/measurement-store.js`, `assets/app.js` | Ferdig |
| Tiltak mot automatisk registrering: e-postbekreftelse før tilgang, skjult felt og minstetid i skjemaet | `assets/account/ui.mjs` | Ferdig |
| Firebase App Check (reCAPTCHA v3) | `assets/account/config.mjs`, `assets/account/firebase.mjs` | Klar i kode, men **av**. Satt på vent 21. oktober 2026 (se under) |

### Sider

- **Offentlige:** forsiden (`#start`), Om Kartlegg (`#om`), innlogging (`#konto`), bruksvilkår (`#vilkar`), personvernerklæring (`#personvern`).
- **Åpne for alle uten konto (fra 21. oktober 2026):** Ny vurdering (NEWS2, qSOFA, ISBAR) og Kliniske verktøy. De regner lokalt og lagrer ingenting, så konto ga ingen sikkerhetsgevinst. Direktelenker som `?tool=gcs` åpnes rett i verktøyet. Gjester ser ikke «Lagre måling».
- **Krever innlogget konto med bekreftet e-post og godtatte vilkår:** Målinger over tid, Lær (inkludert Legemiddelregning), Simulering, Profil.

## Hva som faktisk beskytter hva

Kartlegg ligger på GitHub Pages. All HTML og JavaScript er offentlig, også koden til de «beskyttede» sidene. Innloggingsvakten styrer bare hva som vises; den hindrer ikke noen i å lese kildekoden eller kjøre kalkulatorene lokalt. Det er greit, fordi verktøyene ikke inneholder hemmelig data.

Det som er beskyttet på serveren, er **brukerdata i Firestore**:

- `users/{uid}`: bare eieren kan lese og skrive, bare med bekreftet e-post, med fast skjema. Ingen kan liste brukere. (Uendret.)
- `consents/{uid}` (ny): bare eieren kan lese og skrive. Alle tre bekreftelsene må være `true`, tidspunktet settes av serveren, ingen ekstra felt, ingen sletting, og versjonen kan bare gå oppover.
- Alt annet er stengt.

Kliniske måleverdier, skårer og ISBAR-tekst sendes **ikke** til Firebase, og har heller ikke gjort det før. Kontosynkroniseringen tar bare med profilfelt, favoritter og utseende (testet: ISBAR-tekst havner ikke i kontoen).

### Delte arbeidsmaskiner

- Innlogging varer til nettleseren lukkes, med mindre brukeren selv krysser av for «Husk meg på denne enheten» (av som standard).
- Målinger slettes ved utlogging, etter 24 timer, og når siden lastes uten innlogget bruker.
- Målingene er ikke kryptert i nettleseren. En annen person på samme maskin og brukerprofil kan i prinsippet lese dem med utviklerverktøy mens de finnes. Derfor: bare fiktive verdier, og logg ut på delte maskiner.

## Manuelle steg i Firebase (gjøres av deg)

Test- og produksjonskoden bruker **samme Firebase-prosjekt** (`kartlegg`). Endringer der påvirker kartlegg.com.

1. ~~Publiser Firestore-reglene~~ **Gjort 20. oktober 2026** etter godkjenning. Bare `consents/{uid}` ble lagt til; reglene for `users` er uendret. Kontrollert etterpå: uinnlogget lesing av `users` og `consents` gir 403.
2. **Aktiver beskyttelse mot opplisting av e-post** (Authentication → Settings → User actions → Email enumeration protection). Gratis.
3. **App Check: satt på vent 21. oktober 2026.** Firebase tar ikke lenger imot den gamle reCAPTCHA v3-typen («reCAPTCHA Classic is deprecated»). Den nye typen, Google Cloud Fraud Defense (tidligere reCAPTCHA Enterprise), ser ut til å kreve en betalingskonto, også innenfor gratiskvoten på 10 000 sjekker i måneden. Eieren valgte å holde prosjektet gratis. Koden står klar: for å slå det på senere, bytt til `ReCaptchaEnterpriseProvider` i `firebase.mjs`, legg nøkkelen i `appCheckSiteKey`, og test før håndheving slås på.
4. **Godkjente domener** (Authentication → Settings → Authorized domains): legg til testdomenet hvis du lager en testpublisering (se under).
5. **E-postmaler** (Authentication → Templates): sett språk til norsk og sjekk avsendernavn for bekreftelse og tilbakestilling av passord.

Kontoopprettelse begrenses allerede av Firebase sine innebygde grenser per IP. Egne kvoter for registrering krever oppgradering til Identity Platform, som kan kreve betalingsaktivert prosjekt. Det er ikke gjort.

## Testpublisering

**Forhåndsvisning:** https://kartlegg--innlogging-vrzyt9jo.web.app (Firebase Hosting-kanal `innlogging`, utløper 27. oktober 2026). Publisert fra denne grenen. kartlegg.com og kartlegg.web.app er ikke endret. Ny publisering etter endringer:

```
npx firebase hosting:channel:deploy innlogging --project kartlegg --expires 7d
```

For at Google-innlogging skal virke der, må domenet `kartlegg--innlogging-vrzyt9jo.web.app` legges til under Authentication → Settings → Authorized domains. Innlogging med e-post og passord virker uten.

`Kartlegg-test` er privat, og GitHub Pages for private repoer krever betalt plan. Andre alternativer:

- **Firebase Hosting forhåndsvisning (anbefalt):** gratis, egen URL som utløper av seg selv, rører ikke kartlegg.com. Krever at du logger inn med `npx firebase login` og kjører `npx firebase hosting:channel:deploy innlogging --project kartlegg` fra grenen (krever en `hosting`-oppføring i `firebase.json`).
- **Gjør `Kartlegg-test` offentlig og slå på Pages:** koden er uansett offentlig i produksjon. Fjern da `CNAME` på grenen først, ellers kolliderer den med kartlegg.com.
- **Lokalt:** `npx serve .` eller tilsvarende, og åpne `http://localhost:…`. `localhost` er godkjent for innlogging i Firebase.

Anbefaling på sikt: et eget Firebase-prosjekt for test, så regelendringer og testkontoer ikke berører produksjon.

## Tester

| Område | Hvordan | Resultat |
|---|---|---|
| Kliniske beregninger og eksisterende kontrakter | `node --test tests/*.test.cjs tests/account/*.test.mjs` | 250 bestått |
| Innloggingsvakt (offentlige/beskyttede sider, retur, ventetilstand) | `tests/auth-gate.test.cjs` | Bestått |
| Lokal målelagring (24 t, bare kjente felt, per bruker, sletting, ingen nettverk) | `tests/measurement-store.test.cjs` | Bestått |
| Hele appen i Chrome ved 320–1300 px, inkl. mørk modus, temaer og direktelenker | `python3 tests/browser-smoke.py` (kjører som innlogget testbruker) | Bestått |
| Kontoflyt i Chrome med falsk Firebase: gjest, låste sider, begrunnelse, registrering uten bekreftelser, ulike passord, eksisterende e-post, e-postbekreftelse, vilkårsskjerm, retur til ønsket side, import fra konto, ingen kliniske data i konto, sletting av målinger ved utlogging | `tests/account/browser-smoke.py` | Bestått |
| Firestore-regler og innlogging i emulator, inkl. fire nye regler for bekreftelser | `npm run test:rules` | 24 bestått |

**Ikke testet mot ekte Firebase:** opprettelse av konto, ekte e-postbekreftelse og tilbakestilling av passord, Google-innlogging og «Husk meg» etter at nettleseren lukkes. Dette må gjøres manuelt på en testpublisering, med en egen testkonto.

## Endrede eksisterende tester

Ingen tester er fjernet. Tre er endret fordi kravene endret seg:

- `release-contract.test.cjs`: «målinger lagres aldri» er erstattet av «målinger lagres bare via 24-timerslageret, aldri i verktøymodulene, aldri over nettet».
- `browser-smoke.py`: kjører som innlogget testbruker, og sjekker ny tekst om 24 timers lagring.
- `tests/account/browser.mjs`: skrevet om for ny flyt; alle tidligere kontroller er beholdt.
