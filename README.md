# Kartlegg 1.0.2

**Kliniske verktøy samlet på ett sted – norsk demonstrasjonsversjon.**

[Åpne Kartlegg](https://aasen700.github.io/Kartlegg/) · [Versjonshistorikk](CHANGELOG.md) · [Kontrollmatrise for alle 16 verktøy](KONTROLLMATRISE.md) · [Klinisk kvalitet](KLINISK-KVALITET.md) · [Arkitektur](ARKITEKTUR.md)

## Oppdatering 1.0.2
- Rettet overlapp mellom toppbanner og Kartlegg-/profilikon i de personlige temaene; kontrollert med automatiske geometritester på fem visningsbredder.
- Presisert når SpO₂-skala 2 kan brukes i NEWS2.
- Ryddet bort duplisert styring av temabryteren og gammel redundant tema-lagring.
- Endret selvstendige hjemmetjenesteverktøy slik at gamle resultater skjules når målinger endres.
- Utvidet kildedokumentasjon og dokumentert gjenstående klinisk/regulatorisk validering for samtlige 16 verktøy.
- Ingen endringer i kliniske skåringsgrenser, behandlingsalgoritmer eller lagringsregler.

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

**Kartlegg 1.0.2 er en offentlig tilgjengelig demonstrasjonsversjon, ikke en klinisk godkjent eller uavhengig validert løsning.** Verktøyene er ment for læring, utprøving og utvikling med fiktive opplysninger. Beregninger, veiledere og legemiddelinformasjon erstatter ikke faglig skjønn, godkjente lokale prosedyrer, behandlende lege eller ordinær dokumentasjon. Klinisk og regulatorisk vurdering må gjennomføres før eventuell bruk i pasientbehandling.

Faglige referanser og avgrensninger vises i de enkelte verktøyene.

## Kvalitetssikring

Automatiske tester kjøres med GitHub Actions:

```sh
node --test tests/*.test.cjs
python3 tests/browser-smoke.py
```

De automatiske testene er utvidet fra **133** ved den første lanseringen til **139** etter v1.0.2-oppdateringen, samt nettlesertester på desktop, nettbrett og tre mobilbredder. Automatiske tester innebærer **ikke klinisk validering**.

## Utvikling

Utvikler: **Philip Aasen**. Dette er et selvstendig student-/utviklingsprosjekt, ikke et produkt levert eller godkjent av Høgskulen på Vestlandet eller kommunale helsetjenester.

Utviklingshistorikken finnes i [Kartlegg-test](https://github.com/aasen700/Kartlegg-test) og [versjonshistorikken](CHANGELOG.md).
