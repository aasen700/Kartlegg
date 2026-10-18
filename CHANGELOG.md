# Versjonshistorikk – Kartlegg

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
