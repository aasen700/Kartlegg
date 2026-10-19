# Versjonshistorikk – Kartlegg

## Ett designsystem og felles verktøykort – 19. oktober 2026

- Slo sammen de 32 versjonslagene med stil (`v06.css` … `human-finish-v13.css`) til tolv filer i `assets/css/`, ordnet etter ansvar: tokens, grunnstil, sideoppsett, komponenter, profil, vurdering, verktøy, simulering, læring, sesongpynt, temaer og kliniske statusfarger. Overstyrte og ubrukte regler er fjernet.
- Kliniske statusfarger (skårkort, NEWS2-varsel, 3-poengsparametere, ABCDE-nødvarsel) ligger i en egen fil som lastes sist, slik at ingen tema eller pynt kan endre dem.
- Sammenslåingen er kontrollert maskinelt: den gamle og den nye versjonen ble sammenlignet piksel for piksel i alle sider, verktøydialoger, læringsmoduler, temaer og skjermbredder før designendringene under ble gjort.
- Alle 18 verktøykort har nå samme oppbygning: eget ikon, tittel og merkelapp øverst, beskrivelse i midten og én hovedknapp med ikonknapper for *Favoritt* og *Kopier lenke* nederst. Knappene står på samme høyde i hver rad. «Lær …» er en lenke i kortet.
- Hvert verktøy har fått et eget, meningsbærende linjeikon (f.eks. øye for GCS, puls for NEWS2, stoppeklokke for respirasjonstimeren, sprøyte for Legemiddelverkstedet). Doble ikoner, emojier og symboltegn i kortene er fjernet.
- NEWS2- og qSOFA-kortene har fått en «Gå til …»-knapp til vurderingen på forsiden.
- Rettet at kildelenken viste «Kilde: Kilde: …».
- Rettet en feil der et verktøyvindu kunne åpnes tomt hvis man byttet direkte fra ett hjemmesykepleieverktøy til et annet (gjaldt også TIMES, palliasjon, ABCDE og ankel–arm-indeks).
- Fjernet historiske kopier i rotmappen (`app.js`, `style.css`, `scoring.js`, `enhancements.*`, `scoring.test.cjs`).
- Ingen beregninger, kliniske grenser, tekster i verktøyene eller lagringsregler er endret.

## Egen identitet og roligere standarduttrykk – 19. oktober 2026

- Erstattet det generiske pulssymbolet med et eget Kartlegg-merke: en K bygget av kartleggingslinjer og et tydelig sentrumspunkt. Merket brukes også som favicon.
- Flyttet hamburgermenyen til høyre i mobilheaderen og lot mobilmenyen åpne fra høyre. Profilen ligger fortsatt i den faste mobilnavigasjonen.
- Endret statusmerket fra «PROTOTYPE» til «DEMO» og strammet inn den mest synlige teksten.
- Gjorde standardtemaet roligere med flat bakgrunn, færre pilleformer, mindre skygge og mindre dekorativ dybde. Liquid Glass, tjenestetemaer og sesongtemaer er fortsatt egne valg.
- Kliniske farger, beregninger, innholdsrekkefølge og funksjoner er uendret.

## Tydeligere sesongbakgrunner – 18. oktober 2026

- Flyttet all sesongpynt bak grensesnittet slik at symboler aldri dekker bokser, tekst, knapper eller dialoger.
- Forsterket fargeatmosfæren og la til repeterende bakgrunnsmotiv for alle fem sesongtemaene: gresskar, flaggermus og spindelvev; snøfnugg og gaver; rosa sløyfer; hjerter og rolige naturformer; regnbuer, stjerner og hjerter.
- Motivene er tydelige i sidens bakgrunn og kan skimtes gjennom Liquid Glass, mens solide bokser beholder maksimal lesbarhet.
- Ingen struktur, kliniske farger, beregninger eller funksjoner er endret.

## Valgbart kortmateriale – 18. oktober 2026

- La til et eget valg mellom solide bokser og Liquid Glass under «Utseende».
- Liquid Glass bruker synlig gjennomsiktighet, bakgrunnsuskarphet, lyskanter og dybde på hovedkort, verktøykort, menyer og dialoger i alle temaer.
- Solide bokser beholder dagens tydelige flater; i dagmodus er hovedkortene hvite. Valget lagres lokalt sammen med øvrige utseendeinnstillinger.
- Kliniske risiko-, feil- og skåringsfarger påvirkes ikke. Redusert gjennomsiktighet i operativsystemet gir automatisk en ugjennomsiktig reservevisning.

## Sesongtema – 18. oktober 2026

- Fornyet alle fem sesongtemaene som rene visuelle lag, uten endringer i navigasjon, innholdsrekkefølge, skjemaer eller funksjoner.
- Halloween bruker nå et roligere midnattsblått/plommefarget uttrykk med varme kobbertoner og diskret høsttekstur.
- Jul har fått nordisk kobolt, furu, isblå glasskanter, auroragløtt og dempet bakgrunnssnø.
- Brystkreftmåned, psykisk helse og Pride har fått egne, mer gjennomarbeidede uttrykk med rosekvarts, rolig salvie/teal og raffinert spektrumglød.
- Temaforhåndsvisningene i profilen gjengir nå det faktiske uttrykket tydeligere. Kliniske risikofarger, varsler og skåringsflater er uendret.
- Gjorde sesongene tydeligere: jul bruker tradisjonell rød med snøkanter og snøfnugg, Halloween viser spindelvev, gresskar og flaggermus, og Pride har en sterkere regnbue med synlige regnbuesymboler.

## Mobilretting – 18. oktober 2026

- Fjernet den synlige «Registrer → Resultat → Tiltak»-linjen. Gyldig beregning flytter fortsatt fokus til resultatet, og knappen for neste steg går fortsatt til klinisk respons.
- Fjernet den faste handlingslinjen på mobil. Beregn, ISBAR og lagring ligger samlet i skjemaet og dekker ikke lenger valideringsmeldinger eller innhold.
- Rettet mobilheaderen slik at menyen viser ett ikon, prototypemerket skjules på liten skjerm og merkevare- og profilkontroller beholder lesbar bredde.
- NEWS2-, GCS- og ISBAR-snarveiene og favorittpanelet fyller nå hele søkekortet og brytes ikke til smale, loddrette knapper.
- Mobilregresjonen kontrolleres ved 320, 360, 375, 410 og 768 px, liggende visning og 200 % skalering.

## Nye verktøy – 18. oktober 2026

- La til ankel–arm-indeks med separat beregning for hvert bein, måletrinn, validering, kildehenvisninger og tydelige kliniske forbehold.
- La til Legemiddelverkstedet med fiktive Lær–Øv–Test-oppgaver, enhetsomregning, sprøytevalg og et tilgjengelig, flyttbart sprøytestempel.
- Utvidet verktøyregisteret fra 16 til 18 elementer og la til kategorien «Læring og ferdighetstrening».
- La til automatiske grense-, beregnings- og nettlesertester på desktop, mobil, landskap og 200 % skalering.

## 1.1 – 18. oktober 2026

- Visuelt system v4 samler tydelig sidehierarki, tre faste kortroller, ferdig-/feiltilstander i skjemaer og en bred førsteside med registrering og resultater i samme arbeidsflate.
- Mobil har en fast hovedmeny for Vurdering, Verktøy, Lær og Profil, mens sidemenyen fortsatt gir tilgang til historikk, avansert case og prosjektinformasjon.
- Dag- og nattmodus deler nå samme geometri og semantiske farger. Dagmodus har en roligere blågrå flate, nattmodus bruker marineblå flater, og læringsinnhold har en avgrenset lilla identitetsfarge.
- Philip-temaet har fått tydeligere lagdeling, mer transparente koboltglassflater, sterkere lyskanter og egne glassvarianter for registrering, resultat og informasjon.
- Gyldig innsending flytter tastaturfokus til resultatene og åpner et tydelig neste steg til klinisk respons.
- Resultatkortene har sterkere visuell prioritet etter beregning, med direkte tilgang til tiltak/forbehold og ISBAR.
- Ett lokalt SVG-ikonsystem dekker navigasjon, seksjoner, skårkort, verktøykort, handlingsknapper og dialoglukking; eldre tegnikoner ryddes også i dynamisk innhold.
- Tilgjengelighetsforbedringer for hopp-lenke, fokus, tilgjengelige navn, 44 px berøringsmål, små skjermer, landskap, 200 % skalering, redusert bevegelse og tvungne systemfarger.
- TIMES er redaksjonelt gjennomgått mot det opprinnelige TIME-rammeverket, IWII 2022 og sårtypespesifikke NICE-/ISTAP-kilder. S beskrives uttrykkelig som Kartleggs pedagogiske tillegg for omkringliggende hud.
- «Om Kartlegg», README, kontrollmatrise og kvalitetsdokumentasjon viser versjon og kontrollstatus. Uavhengig klinisk signering og manuell skjermleser-/brukertest står fortsatt åpne.
- Ingen endring i NEWS2-, qSOFA- eller andre skåringsformler, kliniske risikofarger eller lagringsregler.

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
- [Kontrollmatrise for 18 verktøy](KONTROLLMATRISE.md) med kilder, versjoner, formler, tester og eksplisitt uavklart klinisk kontroll.
- [Arkitekturdokument](ARKITEKTUR.md) med eiermoduler og gjenstående trinnvis CSS-opprydding.
- Ingen endring i NEWS2/qSOFA/andre skåringsformler eller i oppbevaring av pasientmålinger.


## Tema- og UI-forarbeid – 18. oktober 2026

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
