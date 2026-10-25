# Versjonshistorikk – Kartlegg

## Kartlegg som app – 25. oktober 2026

- Kartlegg kan installeres som app. På iPhone og iPad velger du Del → «Legg til på Hjem-skjerm» i Safari. I Chrome og Edge kommer det et valg om å installere. Appen åpnes i fullskjerm, uten adressefelt, og har eget ikon og egen plass i appveksleren.
- Kartlegg virker uten nett: NEWS2 og qSOFA, Kliniske verktøy og Lær (med bilder) fungerer når siden har vært åpnet én gang på enheten. Innlogging og lagring i kontoen trenger fortsatt nett. Når du er uten nett, vises en melding om det nederst.
- Nye versjoner kommer fram med en gang du er på nett. Siden sjekker alltid med serveren først, og bruker den lagrede versjonen bare hvis nettet ikke svarer innen 4 sekunder.
- Under Om Kartlegg står det hvordan du legger Kartlegg på hjemskjermen.
- Personvernerklæringen forklarer at sidens egne filer lagres i nettleseren for bruk uten nett. Det er de samme filene for alle, uten personopplysninger.

## Raskere lasting – 25. oktober 2026

- Forsiden vises nesten tre ganger så raskt på mobil. Før ble hele siden skjult bak et lastehjul til innloggingstjenesten (Firebase) var lastet ned og hadde svart. Nå vises siden med en gang hvis det ikke finnes noen lagret innlogging på enheten. Målt på simulert 4G med treg telefon kom overskriften etter 1,2 s i stedet for 3,3 s.
- Databasen (Firestore, ca. 180 kB) lastes bare ned når noen er logget inn. Gjester slipper den helt, og innloggingssjekken venter ikke lenger på den.
- Nettleseren kobler seg til Firebase og begynner å hente innloggingsfilene tidlig, så innlogging med «Husk meg» også går raskere.

## Rettet: mindre hopping når du skriver inn målinger på telefon – 22. oktober 2026

- Myk rulling er slått av på telefon. Når iPhone flytter et felt over tastaturet, skjer det nå med én gang, ikke som en animasjon som kunne havne et annet sted.
- Siden har samme høyde når tastaturet er åpent. Før ble luften nederst mindre, og da måtte siden hoppe hvis du var langt nede.
- Den ekstra luften over feltene fra forrige rettelse er fjernet igjen, fordi den kunne få iPhone til å skyve feltet helt opp.

## Rettet: siden ruller ikke lenger når du trykker i et felt – 22. oktober 2026

- Kartlegg ruller ikke lenger selv når du trykker i et felt på telefonen. Telefonen flytter allerede feltet inn i synsfeltet. Da Kartlegg også rullet, kjempet de to mot hverandre, og feltet kunne havne over skjermkanten, særlig AVPU og puls.
- Når telefonen flytter et felt inn i synsfeltet, er det nå plass til ledeteksten over feltet under det faste toppfeltet.

## Rettet: blaing av seg selv, kontrast i Liquid Glass og kutt på telefon – 22. oktober 2026

- Telefon: siden kunne blafre eller rulle nedover av seg selv når man trykket i et felt, for eksempel målingene i NEWS2. Feltet flyttes nå inn i synsfeltet bare én gang når tastaturet åpnes, i stedet for hver gang skjermen beveget seg.
- Liquid Glass: bunnmenyen og toppfeltet er tettere, så tekst og farger som ruller under dem ikke lenger skinner gjennom knappene.
- Nattmodus: tekstknapper som «Åpne i skjemaet» og «Slett» har ikke lenger en mørk boks som så avkuttet ut. Lenkene nederst på siden er lysere og lettere å lese.
- Kliniske verktøy på telefon: kategoriknappene, antallet og overskriftene ligger ikke lenger inntil kanten av boksen, og kategoriraden toner ut mot høyre, så det synes at den kan sveipes.
- Øvingsforløp i Liquid Glass: den fargede kanten som viser NEWS2-nivået på hver måling, synes igjen.

## Bedre på telefon og tydeligere tilbakemelding i simuleringen – 22. oktober 2026

- Simulering på telefon: delene ligger i faner (Gjør, Målinger, NEWS2, ISBAR, Logg), så du ser én ting om gangen i stedet for å bla gjennom alt. Fanene viser status, for eksempel 3/7 rader skåret i NEWS2. Etter en måling åpnes NEWS2-fanen av seg selv. Siden er omtrent halvparten så lang som før.
- Simulering på telefon: bildet blir et lite miniatyrbilde ved siden av pasientinformasjonen, introteksten skjules når casen er i gang, og handlingene står i to kolonner med kortere tekst.
- Ny oppsummering i simuleringen: resultat øverst (for eksempel 5 av 7 viktige punkter) og når pasienten ble dårligere. Så kommer «Dette gjorde du bra» og «Dette kan du gjøre bedre» med konkrete forklaringer, for eksempel hvilke NEWS2-rader som var feil, og om du ringet før eller etter at pasienten ble verre. «Slik gikk det, steg for steg» viser tidslinjen med merknader.
- Kliniske verktøy på telefon: lavere kort. Beskrivelsen er kortet til to linjer, og kategorien står ved siden av navnet. «Lær» og «Kilde og lisens» står på samme linje.
- NEWS2-skjemaet på telefon: tallfeltene (SpO₂, blodtrykk, puls og temperatur) står i to kolonner.
- Lær på telefon: introteksten til modulen skjules når du er i gang med en oppgave, og pilen i «Til oversikten» står på samme linje som teksten.

## Flere caser i Lær og «Øv på feilene dine» – 22. oktober 2026

- NEWS2: fem nye caser, fra 6 til 11. Fire nye i Øv: lave verdier (lav puls, lav temperatur og lav RF), en pasient som bare reagerer på tiltale (V gir 3), oksygen på skala 1, og én rød verdi alene (systolisk BT ≥220). Én ny i Test: høy SpO₂ på oksygen med skala 2.
- 4AT: fem nye caser, fra 6 til 11. Fire nye i Øv: urolig og agitert pasient, kortvarig søvnig rett etter oppvåkning (gir 0), pasient som ikke vil prøve (gir 1), og forvirring som er verre om natten. Én ny i Test: bare én feil på AMT4.
- «Øv på feilene dine»: etter en øving eller test i NEWS2 og 4AT kan du øve på nytt på bare de casene du hadde feil på, med forklaring etter hvert svar. Når alt er riktig, får du beskjed om det.
- De opprinnelige casene er uendret, og alle fasiter regnes fortsatt ut av de samme skåringsmodulene som i verktøyene.

## Bilder og mer innhold i simuleringen – 22. oktober 2026

- Hver pasientcase har fått en illustrasjon i samme stil som GCS-bildene i Lær. Bildet bytter til en forverret versjon når pasienten blir dårligere i forløpet: blekere, svett og med raskere pust. Casevelgeren viser et lite bilde av hver case.
- Handlingsknappene har fått ikoner, så det er lettere å finne fram, særlig på mobil.
- Tre nye handlinger: «Spør pårørende eller kollega», «Se på hud og sirkulasjon» og «Mål blodsukker». Hver case har egne funn som bare kommer fram hvis du spør eller undersøker. For eksempel bekrefter Olavs datter at forvirringen er ny, og Noras bandasje er mer gjennomfuktet.
- Oppsummeringen sjekker om du fant det viktigste funnet i hver case, og forklarer hvorfor det betyr noe.
- Oppsummeringen viser et eksempel på ISBAR for hver case, side om side med ditt eget utkast.

## NEWS2-skjema rett i simuleringen – 22. oktober 2026

- I simuleringen skårer du NEWS2 direkte i det samme poengskjemaet som i Lær. Du trykker på riktig felt i hver rad, og summen regnes ut mens du skårer. Feltet der man skrev inn totalskåren, og lenken til NEWS2 i en ny fane, er fjernet. Det gjør det mye enklere på mobil, der skjemaet vises som kort.
- Skjemaet dukker opp rett under hendelsen når du har målt vitale parametere, og blir stående der mens du skårer.
- Når du gjentar observasjonene etter en forverring, får du et nytt skjema og ser hva du fikk første gang.
- Oppsummeringen viser hvert skjema rad for rad: målt verdi, feltet du valgte og riktig felt. Den viser også hvordan riktig NEWS2 og din skåring endret seg mellom målingene.

## Mer innhold i Lær – 22. oktober 2026

- Fremgang i Lær: hvert kurs viser hva du har fullført (✓ Lær, ✓ Øv, ✓ Test) og beste testresultat, og Lær viser hvor mange av de fem modulene som er fullført. Lær/Øv/Test-stegene i modulene får også ✓. Fremgangen lagres i nettleseren på denne enheten, knyttet til kontoen med et anonymt nummer. Den inneholder ingen svar og ingen tidspunkter, og kan nullstilles. Den slettes når kontoen slettes. Personvernerklæringen er oppdatert.
- Simulering: tre nye pasientcaser, så det er fire til sammen. «Ny forvirring på sykehjemmet» (ny forvirring gir 3 poeng), «Svimmel dagen etter operasjon» (lav NEWS2, men en puls som stiger) og «Tungpust hos pasient med SpO₂-skala 2» (skala 2 og oksygentilførsel). Du velger case fra en liste, og hver oppsummering har et eget læringspoeng. Fullførte caser får ✓. Den opprinnelige casen er uendret.
- Øvingsforløp: ny knapp «Øv med spørsmål underveis». Eksempelet vises én måling om gangen. Før neste måling svarer du på NEWS2, om skåren har gått opp eller ned, og hvilken måling som ga flest nye poeng. Skåren og grafen for målingen det spørres om skjules til du har svart. Svarene lagres ikke.

## Tydeligere melding ved glemt passord og bekreftelse – 22. oktober 2026

- Etter «Glemt passord?» og «Send ny lenke» vises en tydelig grønn boks som rulles inn i synsfeltet, med adressen e-posten sendes til og avsenderen (noreply@kartlegg.firebaseapp.com). Før kunne meldingen havne nedenfor skjermen på mobil, så det så ut som ingenting skjedde.
- Bekreft e-post-siden sier hvem e-posten kommer fra, og at den ofte havner i søppelpost.

## Gjennomgang for mobil og PC – 21. oktober 2026

- Gått gjennom alle sider og alle 19 verktøy i ti kombinasjoner (320–1440 px, lys og mørk, gjest og innlogget, solide bokser og glass). Ingen JavaScript-feil, ingen ødelagte bilder og ingen sider bredere enn skjermen.
- Kliniske verktøy: NEWS2- og qSOFA-kortene er like store som de andre i stedet for å strekke seg over hele bredden med mye tomrom.
- Lær: de fem kursene står på én rad på PC i stedet for fire og én alene.
- «Kilde og lisens» står til venstre i alle kort, ikke midtstilt i noen og venstrestilt i andre.
- Øvingsforløp: «Ny måling» og «Slett øvingsforløpet» skjules når forløpet er tomt (tomtilstanden har egne knapper).
- Mobil: lenkene nederst og lenkeknappene i kortene har større trykkflate (minst 44 px).

## Rettet: Liquid Glass sammen med andre temaer – 21. oktober 2026

- Sesongtemaene (jul, Halloween, 17. mai og de rolige) beholder sin egen bakgrunn når Liquid Glass er på. Glassets egen gradient brukes bare når det ikke er noe sesongtema.
- På jul, Halloween og 17. mai blir glasset tettere, så tekst og kort er lette å lese over den sterke bakgrunnsfargen. Kontrasten er sjekket på alle sider.
- Knappene i tjenestetemaene (sykehus, ambulanse, legevakt, hjemmesykepleie) får rolige, nøytrale glassknapper.
- «Kilde og lisens» vises som tekstlenke, ikke som mørk boks, i mørk modus.
- Teksten «Jul · dekorativt tema» er lesbar igjen på de store sesongtemaene.

## Nytt Liquid Glass – 21. oktober 2026

- Glassmodus (Profil → Utseende → Liquid glass) er laget på nytt: kortene, toppen, menyen og bunnmenyen er tynt, gjennomsiktig glass med lys kant og myk skygge, så innholdet bak synes uskarpt gjennom.
- Bakgrunnen er en svak gradient: lys blå til hvit i dagmodus, mørk blå til nesten svart i nattmodus.
- Knapper, filtervalg og aktivt menyvalg er glasspiller.
- Felt, skårer og resultater er nesten tette, så tall og svar alltid er lette å lese. Kontrasten er sjekket mot den mørkeste og lyseste delen av gradienten.
- Ved «Redusert gjennomsiktighet» i operativsystemet, og i nettlesere uten støtte for uskarphet, blir glasset tett.
- Philip-temaet, tjenestetemaene og sesongtemaene beholder sine egne bakgrunner.

## Sesongtema med effekter på kortene – 21. oktober 2026

- Bakgrunnen er gradienter i stedet for én farge: varmt lys øverst og en farget glød nederst (rødt på jul, oransje på Halloween, rødt på 17. mai). De rolige temaene har en myk tone over hele siden.
- Bannerne glir bedre inn: motivene er løftet og tones ut nederst, så de ikke kuttes av kortene.
- Effekter på kortene: snø oppå kortene på jul (og litt rim om vinteren), spindelvev med edderkopp i hjørnet på Halloween, flaggvimpler over kortene 17. mai og høstblader om høsten.
- Effektene ligger bak teksten og knappene, kan ikke klikkes, vises aldri på skårene og skrives ikke ut.
- Lysslyngen (jul), vimplene (17. mai) og stjernehimmelen (Halloween) går over hele bredden. På jul står en skog langs hele kanten i stedet for en «øy» med trær.
- Effektene varierer: tre ulike spindelvev i ulike hjørner og størrelser (ikke alle med edderkopp), tre snøvarianter (én med istapper), vimpler i ulike posisjoner og tre ulike blader.

## Nye sesongtemaer i to nivåer – 21. oktober 2026

- Sesongpynten er tegnet på nytt: ett banner øverst på siden i stedet for et gjentatt mønster bak alt innhold. Kortene, skårene og resultatene får aldri pynt.
- Stor: jul, Halloween og 17. mai har farget bakgrunn bak hele siden, hvit tittel og et kraftig banner. Jul har rolig snøfall (av for dem som har valgt redusert bevegelse).
- Rolig: alle andre temaer har et lyst banner øverst til høyre som tones ut.
- Nye merkedager: Samefolkets dag (6. februar), påske (palmesøndag til andre påskedag, regnes ut hvert år), håndhygienedagen (5. mai), Sykepleiernes dag (12. mai), 17. mai, pasientsikkerhetsdagen (17. september), Verdens hjertedag (29. september), menns helse (november) og Verdens diabetesdag (14. november).
- Nye årstider for resten av året: vinter (januar–februar), vår (mars–mai), sommer (juli–august) og høst (september).
- På mobil blir banneret en smal stripe over tittelen. Alle temaer er sjekket i lys og mørk modus, og tekst på farget bakgrunn har god nok kontrast.
- Innstillingene viser forhåndsvisning av temaet og hvilket tema som kommer neste gang («Neste: Halloween fra 25. oktober»).

## Øvingsforløp fungerer på mobil – 21. oktober 2026

- Første måling ber ikke lenger om tid siden forrige måling. Tidsvalget vises først fra måling 2 (det var synlig hele tiden på grunn av en stilfeil).
- Målingene vises som kort i stedet for en tabell, med NEWS2 i farge etter nivå (0–4, 5–6, ≥7). Kortene virker på mobil uten sidelengs rulling.
- Grafen tilpasser seg skjermbredden, så tallene kan leses på mobil. Valget «Graf for» klemmer ikke lenger overskriften.
- Fra- og til-valgene i sammenligningen går over hele bredden på mobil.

## Øvingsforløp i stedet for «Målinger over tid» – 21. oktober 2026

- «Målinger over tid» heter nå «Øvingsforløp» og er laget for tenkte pasienter. Det lagres ingen ekte dato eller klokkeslett, bare hvor lang tid som har gått siden forrige måling. Da kan funksjonen ikke brukes som journal eller til å overvåke en virkelig pasient.
- NEWS2-skjemaet har ikke lenger dato, klokkeslett og «Nå». Første lagring blir «Måling 1 (start)». Ved neste måling velger du tiden siden forrige (15 min til 24 t).
- Målingene vises som «Måling 2 (etter 2 t)» og så videre, og grafen viser tid fra start.
- Nytt: sammenlign to valgte målinger og se hvilke NEWS2-parametere som endret skåren, med poeng før og etter.
- Tomtilstand med et ferdig eksempel (tenkt kvinne, 78 år, lungebetennelse, NEWS2 1 → 5 → 6 → 9) og en knapp for å lage eget forløp.
- Gamle lagrede målinger med ekte tidspunkt slettes automatisk. GCS- og NRS-øvinger viser heller ikke klokkeslett lenger.
- ISBAR-manuset bruker «[klokkeslett]» som du fyller inn muntlig.

## Egen kontaktadresse – 21. oktober 2026

- All kontakt på nettsiden går nå til kontaktkartlegg@gmail.com: bunnteksten, «Meld feil», bruksvilkårene, personvernerklæringen og «Kilder og lisenser».

## Tiltenkt formål og lisenser – 21. oktober 2026

- Ny side «Kilder og lisenser» (#lisenser) med kilde, rettighetshaver, vilkår og status for hvert verktøy. Hvert verktøykort har en lenke dit. MST, ESAS-r, GCS (undervisning) og SKUV er merket «Tillatelse etterspurt».
- Én formålserklæring brukes overalt: Kartlegg er for opplæring og øving, er ikke medisinsk utstyr og skal ikke brukes til å vurdere eller behandle virkelige pasienter. Den står i bruksvilkårene (punkt 1), på Om-siden og nederst på hver side.
- Kort påminnelse om formålet under skårene og nederst i hvert verktøy.
- Tekst som lovet klinisk bruk er endret: «Ny vurdering» heter nå «NEWS2 og qSOFA», «Tiltak, tolkning og forbehold» heter «Slik tolkes skåren», og «Se tiltak» heter «Se tolkning». «Støtteverktøy» er byttet ut med «opplærings- og øvingsverktøy».
- Bruksvilkårene har ny versjon (2026-10-21). Bekreftelsen om klinisk ansvar sier nå at Kartlegg ikke er medisinsk utstyr. Innloggede brukere må bekrefte på nytt ved neste innlogging.

## Små forbedringer i alle deler – 21. oktober 2026

- Ny vurdering: dato og klokkeslett vises som én linje («Målt i dag kl. 10:46») med «Endre tidspunkt». Feltene åpnes av seg selv hvis tidspunktet mangler eller er feil.
- Ny vurdering: tydeligere knapper. «Beregn skårer» er hovedknappen, «Lagre måling» og «Lag ISBAR-manus» er likeverdige under, og «Nullstill» er en diskret lenke nederst.
- Målinger over tid: viser når den eldste målingen slettes automatisk. Sletting kan angres i 15 sekunder, og «Slett alle» spør ikke lenger først fordi den kan angres.
- Kliniske verktøy: poenggrensene for NEWS2 og qSOFA er flyttet fra biblioteket til «Tiltak, tolkning og forbehold» i Ny vurdering. Kortene har en lenke dit, så de er like korte som de andre. Favoritter vises øverst.
- Om Kartlegg: konkret utviklingsstatus (tilgjengelig, kontrollert, under arbeid) og en egen «Meld feil»-knapp med ferdig e-postmal.
- Profil: viser «Synkronisert med kontoen kl. …», hvilke innloggingsmetoder kontoen har, og bare handlingene som passer (for eksempel ikke «Koble til Google» når Google allerede er koblet til).

## Verktøyene åpne for alle – 21. oktober 2026

- Ny vurdering (NEWS2, qSOFA og ISBAR) og Kliniske verktøy kan brukes uten konto. Beregningene skjer i nettleseren og lagres ikke, så kontoen ga ingen sikkerhet her. Delte lenker som `?tool=gcs` åpner verktøyet direkte.
- Konto trengs fortsatt for Lær, simulering, målinger over tid og profil. Uten konto vises ikke «Lagre måling».
- Forsiden for gjester har knappene «Regn ut NEWS2» og «Se alle verktøy», og bunnmenyen på mobil har Start, NEWS2, Verktøy og Logg inn.
- På mobil kommer skjemaet først: overskriften er skjult (men leses av skjermleser), snarveiene er fjernet fordi bunnmenyen har de samme, og klokkeslett og «Nå» står på samme rad. Første målefelt ligger nå rundt 550 px ned i stedet for rundt 1190 px.
- Snarveien «Start vurdering» er fjernet, siden den pekte til siden du allerede står på.
- Like navn: «Kliniske verktøy» både i menyen og som overskrift, «Legemiddelregning» overalt, «qSOFA» med riktig skrivemåte på skårkortet, og Legemiddelregning står sist under Lær, slik teksten over sier.
- Bruksvilkår og personvernerklæring er ferdigstilt. «Utkast» er fjernet. Personvernerklæringen sier nå at Firestore ligger i EU (Stockholm), at GitHub og Google får IP-adresse ved sidevisning, hvordan overføring utenfor EØS er sikret, og at en DPIA er vurdert som ikke påkrevd.

## Bedre tilgjengelighet – 21. oktober 2026

- All tekst har nå god nok kontrast (WCAG AA, minst 4,5:1) i både lys og mørk modus. Hjelpetekster, merkelapper, «Ikke beregnet» og grå småtekst er gjort mørkere i lys modus. I mørk modus er etiketter, «Start læringen»-knapper og den tomme tidslinjen rettet.
- Dato- og klokkeslettfeltet viser fokusring når du bruker tastaturet.
- Hjelpeteksten under hvert målefelt leses opp av skjermleseren sammen med feltet.
- Kontrollert med bare tastatur i alle sider og verktøy: alt kan nås med Tab, alle dialoger lukkes med Escape og fokus går tilbake dit du var.

## Velkomst og tydeligere feilmeldinger – 20. oktober 2026

- Første gang du er innlogget, viser forsiden en kort velkomst med hvor du finner verktøyene. Den forsvinner når du trykker «Skjønner».
- Feilmeldingene ved innlogging er skrevet om, så de sier hva som skjedde og hva du kan gjøre. Flere feil har fått egen melding: manglende passord, utløpt innlogging, for mange forsøk og feil hos innloggingstjenesten.
- Tallfeltene i ESAS-r er litt bredere, så «10» får plass på mobil.

## Innlogging til forsiden og ISBAR ved Beregn – 20. oktober 2026

- Etter innlogging kommer du til forsiden med NEWS2, ikke til Profil.
- Spørsmålet om å bruke innstillingene fra enheten eller kontoen vises bare når begge faktisk har noe å velge mellom. Ellers brukes kontoen uten å spørre.
- «Lag ISBAR-manus» ligger nå sammen med «Beregn skårer», «Lagre måling» og «Nullstill» under skjemaet.

## Kartlegg-blå, Schibsted Grotesk og ryddigere logo – 20. oktober 2026

- Kartlegg-blå (#173B58) er hovedfargen i lys modus. Mørk modus beholder lys blå, så knappene synes mot den mørke bakgrunnen.
- Overskrifter i Schibsted Grotesk, samme skrift som ordmerket. Skriften ligger på kartlegg.com selv, så besøket ikke kontakter Google.
- «DEMO»-merket ved logoen er fjernet, slik logoarket krever. Demo-statusen står fortsatt i bunnteksten og i ansvarsfraskrivelsen.
- Lyse knapper har tydeligere kant, og valgt side i menyene har tydeligere markering. Kontrasten er kontrollert maskinelt i lys og mørk modus, alle aksentfarger, alle tjenestetemaer, glass og Philip-tema, på mobil og PC.

## Bunnmeny for besøkende og delingsbilde – 20. oktober 2026

- På mobil får besøkende som ikke er innlogget en egen bunnmeny med Start, Om og Logg inn, i stedet for fire låste valg. Innloggede har samme meny som før.
- Når kartlegg.com deles i Messenger, Teams, SMS, Slack eller LinkedIn, vises et forhåndsbilde med den nye logoen og en kort beskrivelse.

## Ny logo – 20. oktober 2026

- Ny logo fra logoarket (Designpartner, versjon 1.0): symbol med pulskurve og ordmerket «Kartlegg» i Schibsted Grotesk, i Kartlegg-blå #173B58. Mørk modus bruker den negative varianten.
- Ny favicon og eget ikon for hjemskjermen på iPhone. Logofilene ligger i `assets/` (`kartlegg-logo.svg`, `kartlegg-logo-negativ.svg`, `kartlegg-mark.svg`).
- Temaene legger ikke lenger farger, gradienter eller skygge på logoen, i tråd med logoarket.
- Fjernet punkt 12 («Bør avklares …») fra bruksvilkårene.

## Innloggingsbeskyttet plattform – 20. oktober 2026

- Offentlig forside med presentasjon av verktøy, læring, simulering og målinger, og knappene «Logg inn» og «Opprett gratis konto».
- Ny vurdering, Målinger over tid, Kliniske verktøy, Lær, Simulering og Profil krever innlogget konto med bekreftet e-post. Låste menyvalg har hengelås og sender til innlogging med forklaring, og tilbake til ønsket side etterpå.
- Registrering med gjentatt passord, tydelige feilmeldinger og tre separate bekreftelser (bruksvilkår, pasientopplysninger, klinisk ansvar). Eksisterende kontoer bekrefter én gang ved neste innlogging.
- Utkast til bruksvilkår og personvernerklæring.
- «Målinger over tid» lagres på enheten i høyst 24 timer for innlogget bruker, og slettes ved utlogging.
- Se PLATTFORM-INNLOGGING.md for sikkerhetsmodell, manuelle Firebase-steg og tester.

## Ny førsteside og «Husk meg» – 20. oktober 2026

- Førsteside: tre innganger øverst – «Start vurdering» (går rett til NEWS2-skjemaet), «Finn verktøy» og «Lær og øv» – så nye besøkende ser hva Kartlegg tilbyr.
- Mindre tyngde på vurderingen: kortere overskrifter og hjelpetekster, én forklaring av skårene i stedet for to, og dato/klokkeslett uten egen boks på mobil. De tre stegene om tiltak og tolkning ligger bak «Les mer» og åpnes av «Se tiltak». Forbeholdet om demoversjon står fortsatt synlig.
- Innlogging: «Husk meg på denne enheten». Krysser du av, varer innloggingen til du logger ut. Uten avkrysning varer den til nettleseren lukkes, som før. Bare valget lagres, ingen personopplysninger.
- Ingen beregninger, kliniske grenser eller fagtekster er endret.

## Ryddigere verktøykort og stilark – 20. oktober 2026

- Hvert verktøykort har én merkelapp som viser fagområdet (for eksempel Bevissthet, Delirium, Smerte, Sirkulasjon, Sår) i stedet for en blanding av «Separat kalkulator», «Selvstendig kalkulator» og «Kan beregnes automatisk».
- Knappene sier hva de åpner, uten pil: «Åpne GCS», «Åpne AAI», «Åpne timeren», «Gå til NEWS2». Ingen generiske «Åpne verktøy →» lenger.
- Fjernet rundt 100 linjer stil for det gamle profilvinduet. Reglene som ga vinduet riktig tema (tjenestetema, glass, Philip-modus, sesongpynt), gjelder nå profilsidens kort og ark.

## Småpuss på profil, meny og tekster – 20. oktober 2026

- «Husk profilen i denne nettleseren» vises ikke når du er innlogget. Da tar kontoen vare på profilen.
- Etter «Bruk profil» lukkes skjemaet, og bekreftelsen står under radene: «Lagret for denne fanen», «Lagret. Nettleseren husker profilen» eller «Lagret i kontoen».
- Meny-knappen i toppen vises bare på mobil. På PC og nettbrett står sidemenyen alltid fremme.
- Kortere og mer direkte tekster flere steder: «Profil» i menyen, «Verktøy» som sidetittel, hjelpeteksten under tidspunkt, sidene Lær, Simulering og Om Kartlegg og bunnteksten. Kliniske tekster og grenser er ikke endret.

## Ny profilside med innlogging – 20. oktober 2026

- «Min profil» er nå en egen side i stedet for et vindu. Øverst står kontoen: «Ikke innlogget» med én knapp for å logge inn, eller navn, e-post og synkstatus når du er innlogget.
- Avsenderprofilen for ISBAR vises som rader (navn, stilling, arbeidssted). Trykk på en rad for å redigere.
- Utseende: dag/natt/system som ett valg, aksentfarge som fargeprøver, og tjenestetema, kort og sesongpynt som rader som åpner et ark nederst på skjermen.
- Innlogging og ny konto har fått egne skjermer med tilbakeknapp: Google øverst, e-post og passord under, «Vis» for passordet og «Glemt passord?» som lenke. Samtykket vises bare når du oppretter konto eller velger Google.
- Personverninformasjonen og kontoadministrasjonen (koble Google, laste ned, slette konto) ligger i egne ark. Innholdet og reglene for samtykke, synkronisering og sletting er uendret.
- Testet i Chrome ved 320 og 375 px i lys og mørk modus. Ingen beregninger, kliniske grenser eller fagtekster er endret.

## Rettet valg av aksentfarge etter tjenestetema – 19. oktober 2026

- Når et tjenestetema (sykehus, ambulanse, legevakt, hjemmesykepleie) er valgt i «Min profil», vises ikke lenger dag/natt- og aksentvalget for «Egendefinert» som avkrysset. Før kunne et klikk på den allerede avkryssede fargen (nå blå som standard) ikke føre tilbake til egendefinert utseende.
- Ingen beregninger, kliniske grenser eller fagtekster er endret.

## Bedre mobilvisning – 19. oktober 2026

- NEWS2-øvingen i Kartlegg Lær viser hver observasjon som et eget kort med poengfeltene i tre kolonner på mobil, i stedet for et 820 px bredt skjema som ble kuttet og måtte sveipes sidelengs.
- Kategoriene i verktøybiblioteket er én sveipbar rad på mobil, så lange navn som «Kartleggingsverktøy og skårer» ikke lenger brytes midt i ordet.
- Rettet at knappen i «Min profil» stakk utenfor kortet og dro innholdet sidelengs.
- Rettet at «Pause» og «Nullstill» i respirasjonstimeren ble klemt til «Pa/use» og «N/ull». Primærknapper har ikke lenger en fast minstebredde på 245 px på mobil.
- Legemiddelverkstedet har fått samme indre marg som de andre læringsmodulene; formelen og ampulleetiketten brytes ikke lenger midt i ordet.
- Verktøykortene har mindre dobbelt innrykk på smale telefoner, og lange titler deles med bindestrek.
- «Lagre måling» er fullbredde som de andre knappene på forsiden.
- Dato- og klokkeslettfeltene holder seg innenfor kortet i Safari på iPhone.
- Kortere plassholdertekst i søkefelt og profilskjema, så den ikke kuttes.
- Kontrollert automatisk for overflyt og ord som brytes ved 320, 375 og 414 px på alle sider og i alle 18 verktøyvinduer. Ingen beregninger, kliniske grenser eller fagtekster er endret.

## Mindre pynt, roligere språk og en enklere forside – 19. oktober 2026

- Fjernet merkelapper som «Gratis · Ingen AI», «0 kr · Ingen AI», «Kjører lokalt», «Tilgjengelig nå», «NY» og «PILOT».
- Fjernet de små overskriftene med store bokstaver over sidetitler og i verktøyvinduene.
- Skrev om Om Kartlegg: kortere tekst uten slagord og punktlister med uthevet stikkord. «Nytt i 1.1» er erstattet med en lenke til versjonshistorikken.
- Samlet forbeholdene om fiktive data og klinisk bruk på forsiden (ett felt) og Om Kartlegg, i stedet for i hvert verktøy og hver læringsmodul.
- Forsiden: fjernet den flytende knappelinjen, snarveiene NEWS2/GCS/ISBAR og det tomme favorittfeltet (vises igjen når noe er stjernemerket). ISBAR-knappen står nå ett sted, ved resultatene.
- Feltene i skjemaet viser ikke lenger grå eksempelverdier (18, 97, 120 …) som kunne forveksles med utfylte verdier.
- Læringsflisene bruker de samme ikonene som verktøykortene.
- Ingen beregninger, kliniske grenser eller fagtekster i verktøyene er endret.

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
