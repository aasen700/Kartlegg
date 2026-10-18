# Arkitektur og ansvar – Kartlegg

**Oppdatert:** 18. oktober 2026. Dette er et statisk studentprosjekt / en demonstrasjonsversjon; ingen server for pasientinformasjon.

## Prinsipper

1. **Ett register for identitet og søk:** `assets/tool-registry.js` definerer nøyaktig 16 verktøy med ID, navn, søkeord, knappselektor og *eier av faglogikken*. Verktøysøk, kategorifilter og favoritter bruker dette i stedet for hver sine konkurrerende tabeller.
2. **Ett søkefilter:** `assets/tool-categories-v099.js` eier fritekst + kategorier og beregner synlige kort i samme funksjon (`sync`). Tidligere lyttere i `assets/ux-v071.js` og `assets/modern-v08-body.js` er fjernet. `assets/news-first-v081.js` søker i registeret, med egne undersøkbare undersymptomer for palliasjon.
3. **Én åpnefunksjon:** `assets/tool-navigation.js` eier `open(id)`, favoritter, delbare lenker og arbeidsflyt NEWS2/GCS/ISBAR. Den **klikker eksisterende verktøys egne åpneknapper**; den kopierer ikke kalkulatorer eller doseringslogikk.
4. **Dataskille:** Bare `kartlegg.tool-favorites.v1` med tillatte slug-strenger lagres som visuell preferanse. Vitale målinger og skåringshistorikk forblir i fanens RAM. Eksisterende, eksplisitt samtykket avsenderprofil og utseendepreferanser lagres etter gamle regler.
5. **Kliniske grenser ligger i rene, deterministiske moduler** som testes uten DOM eller nettverk. Endringer i scoring utløser egne kilde- og grenseverditester. Regulatorisk/faglig kontrollstatus finnes i [KONTROLLMATRISE.md](KONTROLLMATRISE.md).
6. **Styling må ikke eie klinisk tolkning.** Designlag kan ikke endre statusindikatorer, fareskårer eller kliniske varseltekster.

## Kodeeierskap

| Ansvar | Modul(er) | Kan endres uten klinisk revalidering? |
|---|---|---|
| NEWS2/qSOFA-beregning | `assets/scoring.js` | **Nei** ved skåringsendring |
| GCS / 4AT / NRS og varslingsmatrise | `assets/clinical-tools.js` | **Nei** ved klinisk endring |
| MST / TUG / ESAS-r / ortostatisk BT | `assets/homecare-v09-scoring.js` | **Nei** ved klinisk endring |
| BMI / Mosteller BSA / respirasjonsfrekvens | `assets/modern-v08-scoring.js` | **Nei** ved formelendring |
| TIMES-mål / kalibreringsmatematikk | `assets/wound-v091-scoring.js` | **Nei** ved beregningsendring |
| Klinisk UI og dialoger | `assets/clinical-ui.js`, `assets/homecare-v09-ui.js`, `assets/modern-v08-body.js`, `assets/modern-v08-timer.js`, `assets/times-v091.js`, `assets/palliation-v091.js`, `assets/abcde-v099.js` | Bare ved rene layoutendringer uten endring av tekst, fortolkning eller flyt |
| Indeksering, navn, direkte lenker | `assets/tool-registry.js` | Ja, for rent søke-/rutearbeid |
| Favoritter, lenkekopiering, overgang mellom verktøy | `assets/tool-navigation.js` | Ja, men krev navigasjons-/tilgjengelighetstest |
| Bibliotekets søk/kategorier | `assets/tool-categories-v099.js` | Ja, med nettleserregresjon |
| Søk på forsiden og palliative undersymptomer | `assets/news-first-v081.js` | Ja, unntatt endring av palliativt innhold |
| Tema-/sesonglogikk | `assets/theme-engine.js`, `assets/v06.js`, `assets/theme-finalize-v0992.js`, `assets/personal-modes.js` | Ja, hvis ikke scoringfarger/kliniske varsler berøres |

## Lenke- og favorittkontrakt

- Direkte lenke: `https://aasen700.github.io/Kartlegg/?tool=<id>#verktoy` for selvstendige verktøy, og `#vurdering` for `news2`, `qsofa` eller `isbar`. **Ingen måledata eller pasientinformasjon i URL.** Eventuelle eksisterende søkeparametere fjernes når en verktøylenke opprettes, slik at bare `tool` blir med.
- Inngangen er en *eksakt* ID, validert mot registeret; ugyldig ID ignoreres.
- Favoritter er en sanitert liste med unike kjente ID-er. Lokal lagring inneholder **bare** IDs, aldri pasientdata. Fungerer også i minnet hvis localStorage ikke er tilgjengelig.
- Hurtigbytte fra modal lukker eksisterende modal før en ny åpnes.
- Nye verktøy krever én oppføring i registret, ett eget implementeringssted, kontrakttest og oppdatert kontrollmatrise.

## Kodelag og kontrollert opprydding

Det ligger fortsatt historiske versjonsfiler i `assets/`. Vi har **ikke** gjennomført en risikabel totalomskriving av hele nettstedet i ett steg. Følgende duplisering er allerede fjernet fra aktiv kjøring:

- Femverktøy-søkets gamle filtreringslytter i `ux-v071.js`.
- Seksverktøy-søkets `stopImmediatePropagation()`-overstyring i `modern-v08-body.js`.
- Separat, vedlikeholdskrevende liste med 16 navngitte åpnefunksjoner i forsidesøket.
- Kopiering av åpnefunksjoner for direkte lenker/favoritter: alle bruker samme `open(id)`.

**Gjenstående, kontrollert CSS-refaktorering:** `service-themes-v0991.css`, `theme-finalize-v0992.css`, `theme-layers-v11.css`, `personal-modes.css` og `visual-atmospheres-v112.css` overstyrer noen dekorative variabler i en bevisst kaskade. De skal *ikke* blindt slås sammen: profil-, sesong- og tjenestetemaer må testes i kombinasjoner og ved 360/375/410/768/1300 px. Neste trygge steg er å trekke ut felles CSS-tokens og fjerne `!important` kun etter visuell regresjonstest.

I rotmappen finnes historiske kopier (f.eks. `app.js`, `style.css`, `enhancements.js` og `scoring.js`). **Kjøreversjonen** lastes fra `index.html` og `assets/`; rotkopiene skal ikke endres ved funksjonsutvikling og bør på sikt arkiveres etter gjennomgang av eksterne lenker.

## Kartlegg Lær – GCS og videre læringsmoduler

- `#laer` og `assets/gcs-learning-ui.js` eier den nye pedagogiske brukeropplevelsen. `assets/gcs-learning.css` gjelder bare læringsgrensesnittet.
- `assets/gcs-learning-data.js` eier GCS-kriteriealternativer, seks leksjoner, ni praktiske spørsmål, fire testcaser og kildeadresser.
- **Eksakt én faglig GCS-beregningsfunksjon:** `assets/clinical-tools.js` eier `gcs({eyes,verbal,motor})`, som brukes av både eksisterende GCS-kalkulator og ny læringsmodul. Testcasenes fasit sammenlignes med denne; det finnes ingen parallell totalskår.
- Ved NT/IT (ikke testbar) skal aldri totalskår beregnes. Skriptet bruker ingen vedvarende lagring, ingen nettverkskall og ingen identifiserende helseopplysninger.
- SVG-illustrasjonene er egenproduserte og **symbolske**. De kan ikke brukes som dokumentasjon av konkrete nevrologiske responser.
- `tests/gcs-learning.test.cjs` tester samtlige svarnøkler, NT, og tverrbruk av den eksisterende skåringsmotoren; `tests/browser-smoke.py` kontrollerer de tre læringsnivåene på mobil/desktop.
- 4AT og NEWS2 er nå også bygget som separate læringsmoduler gjennom `assets/learning-content-v12.js` (kildehenvisninger, kurs, cases, oppgavefasit) og `assets/learning-tools-v12.js` (felles skjema, læringsflyt og evaluering). `assets/learning-tools-v12.css` eier bare det tilhørende UI-et.
- Nytt valgfelt i `#laer` viser GCS, 4AT og NEWS2 og flytter *ett* øvingspanel mellom de to nye modulene. GCS fortsetter å eie sitt separate pedagogiske grensesnitt.
- **Ingen duplisering av kliniske regnefunksjoner:** 4AT-fasit fra `KartleggTools.fourAT`, NEWS2-fasit fra `Scoring.news2`.
- Testdekning: `tests/learning-tools-v12.test.cjs` + nettlesertest gjennom alle nivåer ved fem skjermbredder, inkludert SpO₂-skala 2.
- Faglig forbehold: interaktive NEWS2-felter er en *egen pedagogisk fremstilling* av poengreglene, ikke en endret utgave av RCPs offisielle skjema; 4AT er tydelig angitt som norsk pedagogisk tilpasning med CC BY 4.0-kreditering.
- Nye læringsmoduler skal ha egen kilde, regeltest, klinisk gjennomgang og mobilregresjon før de aktiveres.

## Pedagogisk simulering (egen, isolert funksjon)

- `assets/simulation-engine.js` eier den faste fiktive casen, tidssteg, oppdagede opplysninger, registrering av NEWS2-/ISBAR-svar og refleksjon. NEWS2 beregnes **kun** i `assets/scoring.js`.
- `assets/simulation-ui.js` viser scenarioet og kaller motoren, med CSS kun i `assets/simulation-v01.css`.
- Simuleringen kan nås fra `#simulering` i sidemenyen. Ingen innspill fra simuleringen overføres til `#vurdering`, som fortsatt er separat.
- Ingen API, lagring eller gratisserver som senere kan kreve abonnement. Ingen AI-chat: scenario- og brukervalg er fullstendig deterministiske.
- **Kliniske forbehold:** fiksert manuslagt forverring, ikke prediksjon; refleksjonslisten er ikke en klinisk godkjenning; obligatorisk faglig og pedagogisk gjennomgang før bred lansering.
- Regressionstester: `tests/simulation-v01.test.cjs` og nettlesertesten.

## Verifikasjon

```sh
for file in assets/*.js; do node --check "$file"; done
node --test tests/*.test.cjs
python3 tests/browser-smoke.py
```

GitHub Actions kjører dette på `main`. Nye funksjoner må ha både rene tester (identitet, whitelist, URL og datasikkerhet) og nettlesertester (favorittklikk, modalbytte, mobilvisning, ekte direktelenke/refresh). **Grønne tester er ikke klinisk godkjenning.**

## Mobil, læringsflyt og temaer (oktober 2026)

- `assets/interaction-polish.css` eier felles mobilgeometri, berøringsmål, læringsnavigasjon og dialogtilpasning. Den endrer ikke klinisk skåring.
- `assets/mobile-ux.js` følger nettleserens visual viewport og skjuler handlingslinjen mens skjermtastaturet tar plass. Dialogene tilpasses synlig høyde, og fokuserte felt holdes synlige.
- `assets/learning-flow.js` eier navigasjonen Oversikt → Lær → Øv → Test og fremdriftsvisningen for GCS, 4AT, NEWS2 og TIMES. Fagdata og skåring ligger fortsatt i hver modul. Øv viser forklaringer underveis; Test viser fasit etter siste oppgave. Ingen nye lagringsnøkler.
- `assets/theme-philip.css` er eneste eier av positive Philip-temaregler: palett, glassflater, kontroller og komponenttilpasning. Den lastes etter komponentstilene. Gamle Philip-regler er fjernet fra tema-, lærings- og simuleringsfilene.
- `assets/theme-layers-v11.css` eier temavelger og sesongfarger. `assets/visual-atmospheres-v112.css` eier sesongpynt. Dekorasjon skal aldri endre fixed/sticky-plasseringen til menyer eller dialoger.
- De andre personlige modusene eies fortsatt av `assets/personal-modes.css`. Generiske personlige palettregler avgrenses bort fra Philip; navn, opplåsing og profillagring følger eksisterende logikk.

Bruk temavariabler i nye komponenter. Unngå å legge nye Philip-overstyringer i komponentfiler. Behold NEWS2-tabellens poengfarger og kliniske varselfarger hos deres eksisterende eiere.
