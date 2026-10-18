# Kartlegg 1.0.1

**Kliniske verktøy samlet på ett sted – norsk demonstrasjonsversjon.**

[Åpne Kartlegg](https://aasen700.github.io/Kartlegg/) · [Versjonshistorikk](CHANGELOG.md)

## Oppdatering 1.0.1
- Rettet qSOFA-hurtigsøk: den valgfrie GCS-seksjonen åpnes før fokus flyttes til skåringsfeltet.
- Erstattet profilikonets dynamisk opprettede knapp med en riktig HTML-knapp med tastaturnavigasjon og tydelig fokusmarkering.
- Rettet mobilnavigering når «Min profil» åpnes fra sidemenyen.
- Presisert hvilke NEWS2-felt som er obligatoriske, og at GCS er valgfritt.
- Optimalisert NEWS2-delpoengene: én beregning oppdaterer både hovedresultat og delpoeng, i stedet for dobbelt beregningsarbeid.
- Utvidet tester for disse konkrete funksjonene. **Ingen NEWS2-grenser, behandlingstekster eller lagringsregler er endret.**

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

**Kartlegg 1.0 er en offentlig tilgjengelig demonstrasjonsversjon, ikke en klinisk godkjent eller uavhengig validert løsning.** Verktøyene er ment for læring, utprøving og utvikling med fiktive opplysninger. Beregninger, veiledere og legemiddelinformasjon erstatter ikke faglig skjønn, godkjente lokale prosedyrer, behandlende lege eller ordinær dokumentasjon. Klinisk og regulatorisk vurdering må gjennomføres før eventuell bruk i pasientbehandling.

Faglige referanser og avgrensninger vises i de enkelte verktøyene.

## Kvalitetssikring

Automatiske tester kjøres med GitHub Actions:

```sh
node --test tests/*.test.cjs
python3 tests/browser-smoke.py
```

Ved lansering ble **133 automatiske enhets-/kontraktstester** samt nettlesertester på desktop, nettbrett og tre mobilbredder bestått. Automatiske tester innebærer **ikke klinisk validering**.

## Utvikling

Utvikler: **Philip Aasen**. Dette er et selvstendig student-/utviklingsprosjekt, ikke et produkt levert eller godkjent av Høgskulen på Vestlandet eller kommunale helsetjenester.

Utviklingshistorikken finnes i [Kartlegg-test](https://github.com/aasen700/Kartlegg-test) og [versjonshistorikken](CHANGELOG.md).
