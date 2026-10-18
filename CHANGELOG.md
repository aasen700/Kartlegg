# Versjonshistorikk – Kartlegg

## Kartlegg Lær – 4AT og NEWS2 (18. oktober 2026)

- GCS, 4AT og NEWS2 samles i ett opplæringspanel. GCS-opplevelsen og den gamle avanserte pasientcasen er beholdt.
- 4AT: seks læringssteg, tre øvingscaser med forklaringer og tre testcaser. Skåring bruker eksisterende `KartleggTools.fourAT`.
- NEWS2: fem læringssteg og et nytegnet, interaktivt poengskjema med trykkbare poengfelt for alle syv komponenter. Tre veiledede og tre uveiledede caser.
- NEWS2 inkluderer dokumentert SpO₂-skala 2, tilført oksygen, nye mentale forandringer, grenseverdier og isolerte 3-poengs parametere. Fasit bruker `Scoring.news2`.
- Nytt valg av læringsverktøy, mobiltilpasset skjema og direkte «Lær 4AT/NEWS2»-knapper i verktøybiblioteket.
- Ingen AI-API, registrering av reelle pasientdata eller ny persistering. Faglig kvalitetssikring er fortsatt nødvendig før enhver klinisk bruk.


## Kartlegg Lær – GCS v0.1 (18. oktober 2026)

- Ny førsteside for verktøyopplæring, med GCS som første komplette læringsmodul. Den gamle pasientsimuleringen er flyttet ned til «Avansert case – pilot».
- «Lær»: seks trinn med illustrasjon, relevante observasjonskriterier og interaktive kontrollspørsmål.
- «Øv»: ni korte caseoppgaver om E, V, M og NT med forklaringer.
- «Test deg selv»: fire fullstendige fiktive kasus. Fasiten holdes tilbake til hele testen er levert; resultatene viser E/V/M og sum bare når alle komponenter er testbare.
- Fem selvstendige SVG-illustrasjoner, ingen eksterne bilde- eller AI-tjenester.
- Bruker samme kliniske GCS-funksjon som Kartleggs ordinære kalkulator, og lar pasientvurderinger og øvingssvar være adskilt.
- Egen knapp på GCS-verktøykortet for å starte opplæringen.
- Støttet av offisiell norsk GCS-veiledning; pedagogisk/faglig ekstern kvalitetssikring gjenstår.


## Simulering v0.1 – pilot (18. oktober 2026)

- Egen «Simulering»-side med én forhåndsdefinert øvingscase i hjemmesykepleien.
- Fritt valg av kartlegginger, symptomhistorie, tidsforløp, ny måling og strukturert kontakt. ISBAR-utkast og NEWS2-oppgave inngår.
- Delt NEWS2-motor; ingen egen duplisert skåring i simuleringen.
- Manusstyrt forverring er *kun pedagogikk*, ikke medisinsk prognose. Skjulte målinger forblir skjult til de tas på nytt.
- Ingen AI-API, ekstern lagring eller nye driftskostnader. Klinisk kontroll og brukertesting er åpne punkter.


## Funksjons- og kvalitetssikringsoppdatering – 18. oktober 2026

- Alle 16 kliniske verktøy har faste delbare ID-lenker og stjernefavoritter, lagret som kun ID-er lokalt.
- NEWS2 ↔ GCS ↔ ISBAR har egen hurtigflyt på forsiden og kontekstuelle bytter i dialoger.
- Sentralisert verktøyregister og filtrering; fjernet konkurrerende søkelyttere.
- [Kontrollmatrise for 16 verktøy](KONTROLLMATRISE.md) med kilder, versjoner, formler, tester og eksplisitt uavklart klinisk kontroll.
- [Arkitekturdokument](ARKITEKTUR.md) med eiermoduler og gjenstående trinnvis CSS-opprydding.
- Ingen endring i NEWS2/qSOFA/andre skåringsformler eller i oppbevaring av pasientmålinger.


## UI 1.1.2 – 18. oktober 2026 (forslag)

- Forsterket Philip cobalt glass med dypere blå reflekser, glassflater og fokusmarkeringer.
- Sesongtemaene fungerer som et separat visuelt lag på Standard, tjenestetemaer og personlige temaer.
- Halloween får spindelvev og varme atmosfæreeffekter på ikke-kliniske flater. Jul får snøkanter, frostdetaljer og redusert bevegelse ved OS-innstilling.
- Kliniske skårer, varsler, beregningsregler og datalagring er uendret.

## 1.0.2 – 18. oktober 2026

Faglig veiledningspresisering og forbedret UI/UX på mobil og desktop. Kun demonstrasjonsversjon med fiktive data.

- Rettet overlapping mellom personlig tema-banner og profil-/Kartlegg-logo.
- Presisert bekreftet hyperkapnisk respirasjonssvikt og dokumentert ordinasjon som forutsetning for NEWS2 SpO₂-skala 2.
- Skjuler tidligere beregningsresultat når inndata endres i selvstendige hjemmeverktøy.
- Fjernet duplisert kode for temabryter, og sikret korrekt nettleser-cacheoppdatering.
- Klinisk kontrollmatrise med kilder, begrensninger og gjenstående krav: [KLINISK-KVALITET.md](KLINISK-KVALITET.md).
- 139 automatiske tester og nettleserkontroller for 1300/768/410/375/360 px. Ingen endringer i skåringsformler eller datalagring.

## 1.0.1 – 18. oktober 2026

Mindre stabilitets- og tilgjengelighetsoppdatering før oppkobling av eget domene.

- qSOFA-søk åpner GCS-seksjonen før fokusering.
- Tilgjengelig HTML-profilknapp og riktig lukking av mobilmeny ved åpning av profilen.
- Tydeligere tekst om NEWS2-felt og valgfri GCS.
- Felles skåringsresultat brukes til visning av NEWS2-delpoeng; unødvendig dobbelberegning fjernet.
- Utvidede nettleser- og kontrakttester. **Ingen endringer i kliniske skåringsgrenser eller datalagring.**


## 1.0 – 17. oktober 2026

Første offentlige **demonstrasjonsversjon** av Kartlegg, godkjent for publisering med fiktive data, **ikke klinisk validert for reell pasientbehandling**.

- NEWS2 på forsiden og separat qSOFA med krav om faktisk GCS.
- Feilmeldinger med lenker til manglende NEWS2-felt og sammenleggbar, valgfri GCS.
- Synlige NEWS2-delpoeng og uendrede eskaleringsindikatorer.
- Bibliotek med 16 kliniske verktøy i tre kategorier, blant annet TIMES, ABCDE og symptomveileder for lindring ved livets slutt.
- Fire tjenestetemaer og et eget «Egendefinert»-valg.
- Mobiltilpasset navigasjon, «Nå»-knapp for dato/klokkeslett og forbedret knappelinje.
- «Om Kartlegg», frivillig lokal avsenderprofil og midlertidig historikk (ingen permanent lagring av pasientmålinger).
- 133 beståtte automatiske tester og browser-smoke på 1300, 768, 410, 375 og 360 px.

Utviklingen fram til v1.0 RC2 finnes i [testrepoet](https://github.com/aasen700/Kartlegg-test).
