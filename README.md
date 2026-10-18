# Kartlegg 1.1

**Kliniske verktøy samlet på ett sted – norsk demonstrasjonsversjon.**

[Åpne Kartlegg](https://aasen700.github.io/Kartlegg/) · [Versjonshistorikk](CHANGELOG.md) · [Kontrollmatrise for alle 16 verktøy](KONTROLLMATRISE.md) · [Klinisk kvalitet](KLINISK-KVALITET.md) · [Arkitektur](ARKITEKTUR.md)

## Oppdatering 1.1
- Designspråket bruker tre faste kortroller for handling, resultat og forklaring, tydeligere skjema­tilstander og en samlet arbeidsflate på brede skjermer.
- Mobilnavigasjonen har fire faste hovedvalg. Dag-, natt-, tjeneste- og Philip-temaene deler struktur, avstander og semantiske farger, mens Philip beholder et mer uttrykksfullt koboltglass.
- Førstesiden viser én tydelig arbeidsflyt: **Registrer → Resultat → Tiltak**. Etter gyldig beregning flyttes fokus til skårkortene og neste steg blir tilgjengelig.
- Handlingsknapper, dialoger, navigasjon og verktøykort bruker ett lokalt SVG-ikonsystem med tilgjengelige tekstetiketter.
- Mobil og tilgjengelighet er kontrollert automatisk ved 320–1300 px, mobil landskap og 200 % enhetsskalering. Tastaturfokus, reflow, tilgjengelige navn og minimum 44 px kontroller inngår. Manuell skjermleser-/brukertest gjenstår.
- TIMES forklarer nå skillet mellom det opprinnelige TIME-rammeverket og Kartleggs pedagogiske S for omkringliggende hud. Kasus, fasiter og begrunnelser er kontrollert mot original TIME, IWII og relevante NICE-/ISTAP-kilder.
- Versjonstekst, «Om Kartlegg», kvalitetsdokumentasjon og versjonshistorikk er oppdatert. Ingen kliniske skåringsgrenser eller lagringsregler er endret.

## Oppdatering 1.0.1
- Rettet qSOFA-hurtigsøk: den valgfrie GCS-seksjonen åpnes før fokus flyttes til skåringsfeltet.
- Erstattet profilikonets dynamisk opprettede knapp med en riktig HTML-knapp med tastaturnavigasjon og tydelig fokusmarkering.
- Rettet mobilnavigering når «Min profil» åpnes fra sidemenyen.
- Presisert hvilke NEWS2-felt som er obligatoriske, og at GCS er valgfritt.
- Optimalisert NEWS2-delpoengene: én beregning oppdaterer både hovedresultat og delpoeng, i stedet for dobbelt beregningsarbeid.
- Utvidet tester for disse konkrete funksjonene. **Ingen NEWS2-grenser, behandlingstekster eller lagringsregler er endret.**

## Oppdatering av arbeidsflyt – oktober 2026
- Stjernemerk alle 16 verktøy og åpne favoritter fra forsiden. Bare verktøy-ID-er lagres lokalt; kliniske målinger lagres fortsatt ikke permanent.
- Hvert verktøy kan deles med en direkte lenke, for eksempel [GCS](https://aasen700.github.io/Kartlegg/?tool=gcs#verktoy), [NEWS2](https://aasen700.github.io/Kartlegg/?tool=news2#vurdering) og [ABCDE](https://aasen700.github.io/Kartlegg/?tool=abcde#verktoy).
- Bytt direkte mellom NEWS2, GCS og ISBAR fra forsiden og relevante dialoger.
- Ett register eier navn/ID-er/søkeord; ett bibliotekfilter eier søk og kategorier. Kliniske beregningsmoduler er uendret.
- Se [Kontrollmatrisen](KONTROLLMATRISE.md) for kilder, grenser, testdekning, uavklarte spørsmål og klinisk kontrollstatus. Ingen klinisk godkjenning er utført.

## Kartlegg Lær – interaktive læringsmoduler (pilot)

[Åpne Kartlegg Lær](https://aasen700.github.io/Kartlegg/#laer) i sidemenyen. Velg mellom **GCS, 4AT og NEWS2**. Alle kan også åpnes fra egne «Lær»-knapper på kortene i verktøybiblioteket.

- **Lær:** seks illustrerte, stegvis oppbygde temaer med små kunnskapssjekker (E, V, M, ikke-testbar komponent, dokumentasjon).
- **Øv:** ni fiktive pasientsituasjoner med umiddelbar forklaring på hvert skåringsvalg.
- **Test deg selv:** fire komplette pasientcaser hvor du velger E, V og M. Fasiten vises samlet først etter alle fire. Hvis en komponent er NT, vises **ingen gyldig totalskår**.
- **Originalillustrasjoner:** fem små SVG-tegninger opprettet for nettstedet. Illustrasjoner er symbolske; alle vurderinger skal baseres på tekstobservasjonene, ikke detaljer i tegningene.
- **Faglig referanse:** [offisiell norsk Glasgow Coma Scale-vurderingshjelp](https://www.glasgowcomascale.org/downloads/GCS-Assessment-Aid-Norwegian.pdf) og [offisiell GCS-dokumentasjon](https://www.glasgowcomascale.org/recording-gcs/). Den norske originaloversikten bruker «IT», mens Kartlegg bruker «NT» for ikke-testbar komponent.
- **Beregning:** fasiter og totalskår bruker `assets/clinical-tools.js`, som er samme deterministiske GCS-funksjon som den ordinære kalkulatoren. Ingen parallell klinisk regnemotor.
- **Kostnader og data:** Ingen AI-API, backend, konto, telemetri eller lagring av svar/fremdrift. Alt er i fane-minnet og nullstilles ved oppdatering.
- **Status:** pedagogisk demonstrasjon – ikke klinisk godkjent, og ikke en praktisk kompetansetest. Fysisk stimulus må utføres av opplært helsepersonell i henhold til lokale prosedyrer.

### 4AT – interaktiv kartlegging

- **Lær:** Seks korte leksjoner om årvåkenhet, AMT4, måneder baklengs, akutt endring og fortolkning.
- **Øv:** Tre fiktive pasientcaser. Velg 0/1/2/4 der det er tillatt på hvert av de fire områdene, og se forklaringer etter innlevering.
- **Test deg selv:** Tre caser uten synlig fasit før alle casene er levert.
- **Fasit:** Eksisterende `KartleggTools.fourAT`; 4AT-score er ikke en diagnose.
- **Kilde/lisens:** [4AT v1.2](https://www.the4at.com/userguide). Tilpasset fra 4AT © 2011–2014 Alasdair MacLullich, Tracy Ryan og Helen Cash; CC BY 4.0. Norsk pedagogisk gjengivelse, egne øvingscaser og nytt interaktivt grensesnitt. Ikke uavhengig validert som originalversjonen.

### NEWS2 – klikkbart poengskjema

- **Lær:** Fem korte temaer om parametere, skala 1/2, oksygentilførsel og vurdering av enkeltparametere.
- **Øv:** Tre fiktive målesett. Klikk i poengfeltet for hver av de syv skåringskomponentene og sammenlign med fasit.
- **Test deg selv:** Tre tilfeller uten fasit før hele testen er levert.
- **Fasit:** Eksisterende `Scoring.news2`; dekker ny forvirring, ekstra O₂-poeng og separat SpO₂-skala 2 ved dokumentert klinikerbeslutning.
- **Kilde:** [Royal College of Physicians NEWS2 (2017)](https://www.rcp.ac.uk/resources/national-early-warning-score-news-2/). Dette er et selvlaget pedagogisk poengskjema, **ikke** RCPs offisielle observasjonsskjema eller en autorisert oversettelse. NEWS2-kartet og originale tabeller skal ikke omtales som godkjent klinisk original.

Den tidligere større pasientsimuleringen er fortsatt tilgjengelig som **«Avansert case – pilot»**. Alle de tre læringsmodulene fungerer uten AI-API, backend eller lagring av øvingssvar. Ingen modul er godkjent for klinisk beslutningsstøtte.

## Øvingsmodus – første pilotcase

[Kartlegg Simulering](https://aasen700.github.io/Kartlegg/#simulering) inneholder foreløpig **én regelstyrt pasientcase** med fiktive opplysninger: akutt forverring under hjemmebesøk. Brukeren velger selv samtalespørsmål, ABCDE-observasjon, målinger, eventuell ny måling og når hjelp kontaktes. NEWS2-svaret registreres i øvingen og sammenholdes med den **eksisterende NEWS2-beregningsmotoren** i oppsummeringen. Det finnes også en egen ISBAR-øvelse med fritekst, uten automatisk KI-vurdering.

Scenarioutviklingen er **forhåndsskrevet**, ikke en simulering av virkelig fysiologisk prognose. En av grenene lar pasienten forverres hvis man bruker mye simulert tid uten å varsle. Nye målinger vises bare hvis brukeren faktisk velger å måle på nytt. Fritekstsvar vurderes ikke automatisk for medisinsk korrekthet. En pedagogisk refleksjonssjekkliste erstatter ikke faglig vurdering.

- **Ingen AI-API, backend eller løpende AI-kostnader** i øvingsmodusen.
- **Ingen lagring** av øvingsdata etter oppdatering/lukking av fanen.
- **Ingen overføring** fra øvingen til Kartleggs ordinære vurderings- eller målehistorikk.
- **Kun pilot, ikke faglig validert.** Bruk bare syntetiske opplysninger; ikke bruk øvingens tekst eller hendelsesforløp som behandlingsinstruks.

Beregningslogikk og testspecifikasjon: `assets/simulation-engine.js` og `tests/simulation-v01.test.cjs`. Visningen eies av `assets/simulation-ui.js`, med isolert `assets/simulation-v01.css`.

## Funksjoner

- **NEWS2 og qSOFA**, med delpoeng, forklaringer, tydelig skåringsfeedback og særskilte varsler for NEWS2-enkeltparametere med 3 poeng. qSOFA krever separat vurdert GCS.
- **16 kliniske verktøy**, blant annet GCS, 4AT, NRS, MST, TUG, ESAS, FAST, ortostatisk blodtrykk, SKUV, TIMES, ABCDE, BMI/BSA og respirasjonstimer.
- **Fire tjenestetemaer** for sykehus/akuttmottak, ambulanse/prehospital, legevakt/akuttmedisin og hjemmesykepleie, i tillegg til egendefinerte lys-/mørktemaer.
- Mobiltilpasset søk, kategorier og tilgjengelig navigasjon.
- «Om Kartlegg»-side med prosjektbakgrunn og informasjon om lagring.

## Slik bruker du Kartlegg

Åpne [Kartlegg](https://aasen700.github.io/Kartlegg/) i nettleseren. NEWS2 ligger på startsiden; øvrige verktøy finnes via søk eller «Kliniske verktøy». Alle demonstrasjoner skal bruke **fiktive data**.

### Profil og midlertidig historikk

- Du kan velge å **huske en avsenderprofil lokalt i nettleseren**. Profilen er ikke en pasientprofil.
- Vitale målinger og enkelte kalkulatorresultater kan legges i en **midlertidig historikk i fanen**. De lagres **ikke permanent** og forsvinner ved omlasting eller lukking.
- **Ikke registrer ekte pasientopplysninger.** Kartlegg er ikke et journalsystem eller en sikker tjeneste for behandling/lagring av helseopplysninger.

## Viktig om klinisk bruk

**Kartlegg 1.1 er en offentlig tilgjengelig demonstrasjonsversjon, ikke en klinisk godkjent eller uavhengig validert løsning.** Verktøyene er ment for læring, utprøving og utvikling med fiktive opplysninger. Beregninger, veiledere og legemiddelinformasjon erstatter ikke faglig skjønn, godkjente lokale prosedyrer, behandlende lege eller ordinær dokumentasjon. Klinisk og regulatorisk vurdering må gjennomføres før eventuell bruk i pasientbehandling.

Faglige referanser og avgrensninger vises i de enkelte verktøyene.

## Kvalitetssikring

Automatiske tester kjøres med GitHub Actions:

```sh
node --test tests/*.test.cjs
python3 tests/browser-smoke.py
```

Testantallet og kontrollerte visningsstørrelser rapporteres i den aktuelle GitHub Actions-kjøringen. Testpakken dekker rene beregningsfunksjoner, kontrakter og nettleserflyt på desktop, nettbrett, små mobiler, landskap og 200 % enhetsskalering. Automatiske tester innebærer **ikke klinisk validering**.

## Utvikling

Utvikler: **Philip Aasen**. Dette er et selvstendig student-/utviklingsprosjekt, ikke et produkt levert eller godkjent av Høgskulen på Vestlandet eller kommunale helsetjenester.

Utviklingshistorikken finnes i [Kartlegg-test](https://github.com/aasen700/Kartlegg-test) og [versjonshistorikken](CHANGELOG.md).


## TIMES – kliniske undervisningsillustrasjoner (oktober 2026)
- Seks fiktive anatomisk tilpassede SVG-illustrasjoner ligger i `assets/wounds/*-clinical.svg`. De er digitalt genererte undervisningsillustrasjoner, ikke pasientfotografier eller diagnostiske bilder. Ved bildeinnlastingsfeil vises kasusbeskrivelsen med en melding. TIME er originalrammeverket; Kartleggs S er et pedagogisk tillegg for omkringliggende hud. Se `TIMES-KASUS.md` for bildesamsvar og fagkilder.
- TIMES Lær har et responsivt todelt kasusoppsett med zoom til sårbunn/sårkant, analyse, systematisk T-I-M-E-S-vurdering, videre vurderingsmomenter og fasit.
- Ingen kunstige tidspunkter eller sårprogresjonsdata vises. Fasit er sperret frem til innlevering (og samlet til slutt i testmodus).
- Ingen endring i vurderingsalgoritme, pasientdatalagring eller øvrige kliniske verktøy. Illustrasjonenes medisinske detaljer krever faglig gjennomgang før annet enn pedagogisk demonstrasjon.
