# Klinisk og teknisk kvalitetssikring – Kartlegg
**Revisjon:** 18. oktober 2026 · **Status:** kode- og kildegjennomgang for DEMONSTRASJON, ingen uavhengig klinisk validering.

## Formål og grense
Kartlegg er et studentutviklet, offentlig tilgjengelig demonstrasjonsverktøy. **Kun fiktive data. Ikke bruk til reell pasientbehandling.**
Automatiske tester etterprøver deterministisk logikk, grenseverdier og konkrete brukerforløp, men kan ikke bekrefte at kliniske retningslinjer er fullstendige, at norske oversettelser er godkjente, at appen er medisinsk utstyr etter relevant regelverk, eller at et behandlingsråd er egnet for en bestemt pasient. En uavhengig faglig og regulatorisk vurdering gjenstår før eventuell klinisk bruk.

Se også den mer detaljerte [kontrollmatrisen](KONTROLLMATRISE.md) med originalkilder, versjoner, konkrete grenseverditester, begrensninger og kontrollstatus for hvert av de 18 verktøyene.

## Kildestøttet gjennomgang av alle 18 verktøy

| Verktøy | Kontrollpunkt / avgrensning | Kilde / kontrollgrunnlag | Status |
|---|---|---|---|
| **NEWS2** | RF, SpO₂-skala 1/2, systolisk BT, puls, temp, bevissthet/ny forvirring og O₂. Enkeltparameter 3 og totalskår krever separat oppmerksomhet. Skala 2 forutsetter bekreftet hyperkapnisk respirasjonssvikt og dokumentert beslutning om 88–92 %. | [RCP NEWS2](https://www.rcplondon.ac.uk/media/a4ibkkbf/news2-final-report_0_0.pdf) | Terskler og kodegrener gjennomgått; presisert skala 2-veiledning; ekstern klinisk validering gjenstår |
| **qSOFA** | RF ≥22, systolisk BT ≤100, endret mental status (GCS <15). Ingen autokonvertering fra AVPU. Lav skår utelukker ikke sepsis. | [Sepsis-3](https://pmc.ncbi.nlm.nih.gov/articles/PMC4968574/) | Matematikk kontrollert mot definisjon |
| **GCS** | E/V/M rapporteres separat; totalskår bare når alle komponenter kan testes. «NT» får ikke kunstig 0 eller 1. | [Offisiell GCS-veiledning](https://www.glasgowcomascale.org/recording-gcs/) | Grensesaker og NT dekket i enhetstester |
| **4AT** | Fire domener; 0–12; ≥4 tyder på mulig delirium, ikke endelig diagnose. Norsk gjengivelse er en lokal tilpasning. | [4AT brukerhåndbok](https://www.the4at.com/userguide) | Logikk testet; oversettelse/lisensavgrensning krever formell faglig kontroll |
| **NRS** | Pasientrapportert smerte 0–10, ikke observatørens gjetning. | [Helsedirektoratet](https://www.helsedirektoratet.no/) | Inputgrenser testet; kontekst er avgjørende |
| **BMI/BSA** | BMI i kg/m²; Mosteller i m²; voksne måleområder. Skal ikke brukes som selvstendig doseringsråd. | [Mosteller-formelen](https://pubmed.ncbi.nlm.nih.gov/3657876/) | Enheter og grenseverdier automatisk testet |
| **Respirasjonstimer** | 15/30/60 sekunders tellingshjelp; kort telling gir estimat, ikke en klinisk måling i seg selv. | Grunnleggende tids- og frekvensregning | Matematisk logikk testet |
| **MST** | To spørsmål om utilsiktet vekttap og matinntak, risikogrense ≥2. Kjent underernæring og terminal fase må håndteres individuelt. | [Helsedirektoratet – underernæring](https://www.helsedirektoratet.no/retningslinjer/forebygging-og-behandling-av-underernaering/vurdering-av-risiko-for-underernaering) | Skåring testet; begrepsbruk presisert |
| **TUG** | 3 meter og retur; >15 sekunder kan indikere økt fallrisiko hos hjemmeboende eldre, men er ikke en diagnose. | [Helsedirektoratet – fallrisiko](https://www.helsedirektoratet.no/faglige-rad/fallforebygging-hos-eldre/identifisering-av-risiko-for-fall-hjemmeboende-eldre) | Beregning og tolkningsgrense testet |
| **ESAS-r** | Ni symptomer, valgfritt tillegg, pasientens opplevelse *nå*. Ulike dimensjoner skal ikke erstattes av én totalskår. | [Alberta Health Services – ESAS-r](https://www.albertahealthservices.ca/info/page14546.aspx) | Inputlogikk testet; formell norsk oversettelses-/bruksrettsavklaring gjenstår |
| **Ortostatisk BT** | Systolisk fall ≥20 eller diastolisk ≥10 mmHg, normalt innen 3 min stående. Symptom, tidspunkt og kontekst avgjør vurdering. | [AHA 2024](https://professional.heart.org/en/science-news/orthostatic-hypotension-in-adults-with-hypertension/top-things-to-know) | Regning og grenseverdier testet; ikke diagnostisk verktøy |
| **FAST** | Tegn på slag er grunn til å ringe 113 straks; negativ FAST utelukker ikke slag. | [Helsenorge – hjerneslag](https://www.helsenorge.no/sykdom/hjerneslag/) | Varseltekst og navigasjon testet; ingen diagnose |
| **SKUV** | Strukturert observasjonsguide, ikke full opplæring i kliniske undersøkelsesteknikker. | [NTNU SKUV](https://www.ntnu.no/ism/kurs/skuv) | Struktur og navigasjon sjekket; faginnhold krever uavhengig klinisk redaksjon |
| **TIMES** | Det opprinnelige TIME-rammeverket dekker vev, infeksjon/inflammasjon, fukt og sårkant. S er Kartleggs pedagogiske tillegg for omkringliggende hud. Lengde × bredde er rektangelestimat; skjermlinjal er ikke medisinsk måleinstrument. | [Schultz mfl. 2003](https://pubmed.ncbi.nlm.nih.gov/12654015/), [IWII 2022](https://woundsinternational.com/wp-content/uploads/2023/05/IWII-CD-2022-web.pdf), NICE-kilder for leggsår/trykksår/diabetisk fot/kirurgiske sår og ISTAP 2025 | Kasus, svarnøkler og begrunnelser kildekontrollert redaksjonelt; regning testet; uavhengig klinisk signering og målevaliditet gjenstår |
| **Lindring ved livets slutt** | Observasjoner og pleietiltak med omtale av legemiddelgrupper; ingen dose, ordinasjon eller individuell terapianbefaling. | [Helsedirektoratet](https://www.helsedirektoratet.no/faglige-rad/lindrende-behandling-i-livets-sluttfase) og [Helse Bergen](https://www.helse-bergen.no/kompetansesenter-i-lindrande-behandling/palliasjon-verktoy-for-helsepersonell/) | Sikkerhetsavgrensninger gjennomgått; full redaksjonell kontroll av hvert symptomelement gjenstår |
| **ABCDE** | Strukturert primærvurdering; håndter truet A/B/C før neste trinn, tilkall hjelp ved akutt forverring. | Faglige ABCDE-prinsipper/lokale prosedyrer | Navigasjon og akuttvarsler testet; ikke godkjent behandlingsalgoritme |
| **Ankel–arm-indeks (AAI/ABI)** | Høyeste ankeltrykk på hver side deles på høyeste armtrykk. Resultatet rapporteres separat for hvert bein og avgjør aldri kompresjon eller diagnose alene. | [NICE CG147](https://www.nice.org.uk/guidance/cg147/chapter/recommendations), [AHA/ACC 2024](https://www.ahajournals.org/doi/full/10.1161/CIR.0000000000001251), [Helsedirektoratet – diabetisk fot](https://www.helsedirektoratet.no/retningslinjer/diabetes/diabetisk-fot-og-nevropati) | Formel og rapporteringsgrenser testet; praktisk målevaliditet og uavhengig klinisk kontroll gjenstår |
| **Legemiddelverkstedet** | Seks konstruerte oppgaver trener dose/styrke/volum, minste oppgitte treningssprøyte og plassering av et visuelt stempel. Ingen reelle preparater, ordinasjoner eller klarsignal for administrasjon. | [WHO – Medication Without Harm](https://www.who.int/initiatives/medication-without-harm) som sikkerhetsramme | Alle svarnøkler og enhetsomregninger testet; erstatter ikke praktisk opplæring, lokale prosedyrer eller dobbeltkontroll |

## Avvik og rettelser i denne gjennomgangen
1. **Visuell overlapping i header:** personlig banner overlappet Kartlegg-logo og profilknapp. Flyttet banner til bunnen av headeren; lagt til geometriasserts ved desktop, nettbrett og tre mobilbredder.
2. **NEWS2 SpO₂-skala 2:** tidligere tekst kunne leses som om ønsket metningsmål alene var tilstrekkelig. Presisert bekreftet hyperkapnisk respirasjonssvikt og dokumentert beslutning om ordinerte mål.
3. **Gamle skåringsresultater i visning:** endring av inndata i selvstendige hjemmeverktøy skjuler nå tidligere resultat slik at brukeren ikke kan forveksle gammel tolkning med nytt inntastet grunnlag.
4. **Dobbelt eierskap til temabryter:** fjernet gammel klikklytter og redundant tidligere tema-lagring; én kontroller eier nå dag/natt-modus.
5. **Versjon 1.1 – vurderingsflyt:** lagt inn én synlig «Registrer → Resultat → Tiltak»-rekkefølge, tastaturfokus til resultatet etter beregning og eksplisitt kobling fra skår til responsnivå, klinisk helhetsvurdering og lokal prosedyre.
6. **Tilgjengelighetskontroll:** automatisk nettleserkontroll dekker 320–1300 px, landskap, 200 % enhetsskalering, horisontal reflow, tastaturfokus, dialoglukking, fokusmål, tilgjengelige navn og dekorative SVG-ikoner. En manuell test med faktiske skjermlesere og brukere gjenstår.
7. **AAI og Legemiddelverkstedet:** nye moduler er skilt i rene beregnings-/svarmotorer og UI, bruker ingen nettverk eller lagring, og er testet med grenseverdier og komplette nettleserforløp. Begge er fortsatt demonstrasjon med fiktive opplysninger.

## Gjenstående kontroll før klinisk bruk
- Sykepleier/lege med relevant fagkompetanse må kontrollere **hver beregningsgrense, enhver tolkning og hvert pleie-/legemiddelutsagn** mot versjonerte originalkilder.
- Fastslå lisens- og oversettelsesrettigheter (bl.a. NEWS2, 4AT, ESAS-r), og avklar medisinsk-utstyr-regelverk, personvern og behandling av helseopplysninger.
- Gjennomfør dokumenterte formative og summative brukertester, også med skjermleser/kun tastatur.
- Sikkerhetspenetrasjonstest og organisatorisk risikoanalyse trengs før noen endrer «Kun demonstrasjon» til faktisk klinisk anvendelse.
- Inntil dette er gjennomført: **ikke registrer ekte pasientopplysninger og ikke bruk Kartlegg til pasientbehandling**.

## Teknisk teststrategi
- `node --test tests/*.test.cjs` for grenseverdier, kontrakter og aritmetikk.
- `python3 tests/browser-smoke.py` i GitHub Actions med headless Chromium på 1300/768/410/375/360/320 px og mobil landskap, i tillegg til 200 % enhetsskalering, for navigasjon, dialoger, arbeidsflyt, resultater, tema, fokus og horisontal scrolling.
- Ingen tredjeparts analytics/skript; målinger forblir i JavaScript-minnet i aktiv fane. Frivillig avsenderprofil og utseende kan beholdes lokalt.
- Automatisert kontroll kan ikke erstatte manuell prøving med VoiceOver/TalkBack, store systemfonter, ekte skjermtastatur og representative brukere. Dette står fortsatt åpent før bred bruk.
