# Kartlegg v0.6.1 – kvalitetssikringsrapport

**Status:** Intern teknisk QA av prototype. Ikke klinisk validering.  
**Miljø:** `Kartlegg-test`, GitHub Pages. Hovednettstedet `aasen700/Kartlegg` er uendret.

## Hva ble kontrollert
1. NEWS2 mot den publiserte RCP NEWS2-skåringstabellen (2017): respirasjon, SpO₂-skala 1/2 og oksygentilførsel, systolisk BT, puls, temperatur, bevissthet og ny forvirring.
2. qSOFA mot Sepsis-3: RF ≥22, systolisk BT ≤100, endret mental status (i prototypen en separat vurdert GCS <15); manglende GCS gir ingen fullstendig qSOFA.
3. Ufullstendige og ugyldige målinger, blant annet manglende verdier, NaN, feil datatype, verdier utenfor angitt område og temperatur som ikke er oppgitt med maksimalt én desimal.
4. Statisk kontroll av nødvendige CSS/JS-ressurser og syntakskontroll av JS.
5. Sikkerhetsgjennomgang av datalagring i `app.js`: måleserier lagres i minnet for den åpne fanen. Brukerprofil og tema er særskilte lokale innstillinger.

## Endringer utført
- Den rene skåringsmodulen nekter nå å behandle ufullstendige, ugyldige eller feiltypede observasjoner (feiler lukket, ikke med en tilsynelatende lav skår).
- Registreringsskjemaets NEWS2-lesing kontrollerer nå HTML-feltenes gyldighet og temperaturpresisjon.
- Kliniske poengtabeller og algoritmene er beholdt; ingen endring i skår for gyldige målinger.
- Automatisk GitHub Actions-testkjøring ved endringer, inkludert kontroll av manglende assets.

## Testresultat
- `node --test tests/*.test.cjs`: **71 av 71 tester bestått** ved første grønne GitHub Actions-kjøring etter korrigering av en feil i testoppsettet.
- JavaScript-syntaks: bestått på GitHub Actions.
- HTML-referanser til CSS og JavaScript: bestått på GitHub Actions.
- Lokal gjennomgang med syntetiske data i Chrome på PC- og mobilbredde av profil, fargevalg, NEWS2/qSOFA, ISBAR og målehistorikk: gjennomført. Lokal gjennomgang er **ikke** en formell slutt-til-slutt-test av det publiserte GitHub-miljøet.

Testresultatet kan kontrolleres under **Actions → Kartlegg quality assurance** i GitHub-repositoriet.

## Kvalitetsbegrensninger og krav før klinisk bruk
- Koden er testet teknisk, men **ikke uavhengig klinisk validert** mot et tilstrekkelig sett med forhåndsdefinerte pasientvignetter av kvalifisert fagperson.
- qSOFA er ikke en tilstrekkelig selvstendig test for å utelukke sepsis. NEWS2 må tolkes sammen med klinisk vurdering, ikke som en diagnose.
- Før eventuell klinisk anvendelse må ansvarlig virksomhet vurdere regelverk for medisinsk utstyr, informasjonssikkerhet, personvern, dokumentasjon, risikostyring og arbeidsflyt.
- Bruk **kun fiktive data** i denne offentlige prototypen.
- Det gjenstår formell tilgjengelighetstesting, nettleser-/enhetstesting og gjennomgang av innhold og språk med helsepersonell.

## Primærkilder
- Royal College of Physicians, [National Early Warning Score 2](https://www.rcp.ac.uk/resources/national-early-warning-score-news-2/) og NEWS2 Final Report.
- Singer et al., [Sepsis-3, JAMA 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4968574/).
