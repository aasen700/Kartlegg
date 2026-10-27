/* Kartlegg – AI-pasient: Randi (hjerteinfarkt som ligner angst, hjemmesykepleie).
 *
 * ALT FAGLIG INNHOLD I CASEN STÅR I DENNE FILEN, slik at den kan leses og rettes på ett sted:
 * journal, medisinkort, målinger, funn, forverring, hvem som kan ringes, rollene AI-en spiller og fasiten.
 * Nettsiden og AI-tjenesten (worker/) bruker samme fil.
 *
 * Fiktiv pasient. Ingen data om virkelige personer.
 * Faglig gjennomgang: ikke gjort ennå. Må sjekkes av noen med fagansvar før casen legges ut for alle.
 */

export const randi = Object.freeze({
 id: 'ai-randi-001',
 version: 1,
 title: 'Trygghetsalarm hos Randi',
 setting: 'Hjemmesykepleie, morgenvakt',
 patient: Object.freeze({ name: 'Randi Hansen', initials: 'RH', age: 68 }),
 level: 'Middels',
 focus: 'Når angsten ikke er angst: brystsmerter, journal og når du ringer 113.',

 // Tid i casen regnes i minutter etter at alarmen gikk (kl. 06:50).
 clock: Object.freeze({ alarmAt: '06:50', startMinutes: 6 * 60 + 50 }),
 alarm: Object.freeze({
  title: 'Trygghetsalarm',
  text: 'Alarm utløst. Ingen tale i høyttaleren.',
  note: 'Fjerde alarm fra Randi denne måneden. De tre forrige ble vurdert som angst.'
 }),
 // Valget før du drar: lese journal og medisinkort først (koster tid) eller dra rett ut.
 travel: Object.freeze({ direct: 8, readFirst: 11 }),
 // Fra dette minuttet blir Randi dårligere, uansett hva du gjør. Ambulansen kommer 15 min etter at 113 er ringt.
 worsensAt: 24,
 ambulanceAfter: 15,
 cost: Object.freeze({ message: 1, measure: 1, examine: 1, firstJournal: 2, firstMedication: 1, call: 1, action: 1 }),
 events: Object.freeze({
  arrive: 'Du låser deg inn. Randi sitter foroverlent ved kjøkkenbordet, grå i ansiktet, med en hånd mot brystet.',
  worse: 'Randi er blitt gråere, svetter mer og puster raskere. Hun sier hun kjenner seg rar.',
  ambulance: 'Ambulansen er her. Du gir muntlig rapport til ambulansepersonellet.'
 }),

 journal: Object.freeze([
  { when: 'I dag 05:00', text: 'Ringte og ønsket Sobril. Konferert med sykepleier. Gitt Sobril 5 mg ved behov. Sovnet etter ca. 30 min.' },
  { when: 'I natt 02:55', text: 'Trygghetsalarm. Fikk ikke sove, kjente hjertebank. Snakket rolig med henne, og hun roet seg. Vurdert som angst.' },
  { when: 'I går 21:40', text: 'Kveldsbesøk. Urolig og bekymret for datteren. Klaget over «trykk i brystet», mente selv det var angsten. Gikk over etter ca. 10 min i ro. BT ikke målt.', key: true },
  { when: 'I går 14:30', text: 'Hjelp til dusj. Ble tungpustet i trappen og måtte sette seg. Sier det er dårlig kondis. Røyker fortsatt.' },
  { when: 'I går 08:15', text: 'Morgenmedisiner gitt etter liste. Spiste lite til frokost og sier hun er «litt slapp». BT 156/90.' }
 ]),

 medication: Object.freeze({
  fixed: Object.freeze([
   { name: 'Sobril', form: 'Tablett 10 mg', times: { '08': 1, '22': 1 }, text: 'Mot angst' },
   { name: 'Sertralin', form: 'Tablett 50 mg', times: { '08': 1 }, text: 'Angst og depresjon' },
   { name: 'Metformin', form: 'Tablett 500 mg', times: { '08': 1, '18': 1 }, text: 'Diabetes type 2' },
   { name: 'Amlodipin', form: 'Tablett 5 mg', times: { '08': 1 }, text: 'Høyt blodtrykk' },
   { name: 'Simvastatin', form: 'Tablett 20 mg', times: { '22': 1 }, text: 'Kolesterol' }
  ]),
  prn: Object.freeze([
   { name: 'Sobril', form: 'Tablett 5 mg', text: 'Ved sterk uro, inntil ×2 per døgn', lastGiven: 'I dag 05:00' },
   { name: 'Paracet', form: 'Tablett 500 mg', text: 'Ved smerter, inntil ×4 per døgn' }
  ]),
  allergies: 'Ingen kjente',
  times: Object.freeze(['08', '13', '18', '22'])
 }),

 // Målingene kommer alltid herfra, aldri fra AI-en. «before» gjelder til minutt worsensAt.
 vitals: Object.freeze({
  before: { rr: 20, spo2: 96, sbp: 134, dbp: 82, hr: 96, rhythm: 'regelmessig', temp: 36.6, avpu: 'A', glucose: 9.8 },
  after: { rr: 24, spo2: 93, sbp: 94, dbp: 60, hr: 118, rhythm: 'uregelmessig', temp: 36.4, avpu: 'A', glucose: 10.1 }
 }),
 news2: Object.freeze({ before: 1, after: 8 }),
 findings: Object.freeze({
  skin: {
   before: 'Grå-blek i ansiktet. Kald og klam i pannen. Kapillærfylling ca. 3 sekunder.',
   after: 'Gråblek og marmorert på armene. Kaldsvett. Kapillærfylling over 3 sekunder.'
  },
  breathing: {
   before: 'Puster litt raskt, sitter foroverlent ved kjøkkenbordet. Snakker i hele setninger.',
   after: 'Puster raskt og overfladisk. Snakker i korte setninger.'
  },
  legs: { before: 'Ingen hevelse i anklene.', after: 'Ingen hevelse i anklene.' },
  surroundings: {
   before: 'Kaffetrakteren står på. Et glass med oppkast i vasken. En gammel Sobril-pakning ligger åpen på benken.',
   after: 'Uendret.'
  }
 }),

 // Hva du kan gjøre utenom samtalen. «trap» er feil handling, «good» er riktig.
 actions: Object.freeze([
  { id: 'sit', label: 'Hjelp henne til å sitte godt', text: 'Du setter henne i en stol med armlener og løsner på morgenkåpen. Hun sier det er litt lettere å puste.', good: true },
  { id: 'stay', label: 'Bli hos henne', text: 'Du blir sittende hos Randi. Hun holder deg i hånden.', good: true },
  { id: 'medlist', label: 'Finn frem medisinlisten', text: 'Du legger medisinlisten og legemidlene klar til ambulansen.', good: true },
  { id: 'door', label: 'Lås opp ytterdøren', text: 'Ytterdøren er låst opp og lyset i gangen er på, så ambulansen kommer rett inn.', good: true },
  { id: 'sobril', label: 'Gi Sobril 5 mg (ved behov)', text: 'Du gir Randi en Sobril 5 mg. Hun er like dårlig etter fem minutter.', trap: true },
  { id: 'water', label: 'Gi henne noe å drikke', text: 'Randi tar en slurk vann og blir kvalm igjen.' }
 ]),

 contacts: Object.freeze([
  { id: 'amk', label: 'Ring 113 (AMK)', short: '113', who: 'AMK-operatør' },
  { id: 'legevakt', label: 'Ring legevakten (116 117)', short: 'Legevakt', who: 'Sykepleier på legevakten' },
  { id: 'nurse', label: 'Ring sykepleier på vakt', short: 'Sykepleier', who: 'Sykepleier på vakt i hjemmetjenesten' },
  { id: 'daughter', label: 'Ring datteren (Hege)', short: 'Datteren', who: 'Hege, datteren til Randi' }
 ]),

 suggestions: Object.freeze([
  'Hva har skjedd?',
  'Kan du vise meg hvor det gjør vondt?',
  'Er dette som angsten din pleier å være?',
  'Når begynte det?',
  'Har du tatt noen medisiner i dag?'
 ]),

 // Fasiten. «ask» sjekkes mot det studenten skrev til Randi, «call» og «action» mot det som ble gjort.
 // Ordsøket er grovt. Tilbakemeldingen sier derfor «ser ut til» der den bygger på ord.
 debrief: Object.freeze([
  { id: 'pain', miss: 'Spør hvordan smerten kjennes, hvor den sitter og om den stråler ut', label: 'Spurte hvordan smerten kjennes og hvor den sitter', ask: ['smert', 'vondt', 'trykk', 'kjennes', 'stråle', 'arm', 'kjeve', 'bryst'] },
  { id: 'different', miss: 'Spør om dette er som angsten hennes pleier å være. Hun ville sagt at det kjennes annerledes', label: 'Spurte om dette er som angsten hennes pleier å være', ask: ['vanlig', 'pleier', 'annerledes', 'som før', 'som sist', 'likt', 'samme som'] },
  { id: 'onset', miss: 'Finn ut når det startet. AMK trenger starttidspunktet', label: 'Fant ut når det startet', ask: ['når', 'hvor lenge', 'startet', 'begynte', 'siden'] },
  { id: 'meds', miss: 'Finn ut hva hun har tatt i dag. Hun tok en ekstra Sobril selv', label: 'Fant ut hva hun har tatt av medisiner i dag', ask: ['medisin', 'sobril', 'tatt', 'tablett'], orOpened: 'medication' },
  { id: 'journal', miss: 'Les journalen. Notatet fra i går kveld om trykk i brystet var et varsel', label: 'Leste journalen og så notatet fra i går kveld', opened: 'journal' },
  { id: 'vitals', miss: 'Mål alle vitale parametere, så du har tall å gi AMK', label: 'Målte alle vitale parametere', measuredAll: true },
  { id: 'call113', miss: 'Ring 113. Brystsmerter med utstråling, kaldsvette og kvalme er en 113-sak', label: 'Ringte 113', call: 'amk' },
  { id: 'notSobril', miss: 'Ikke gi mer Sobril. Det kan skjule symptomene og dempe pusten', label: 'Ga ikke mer Sobril', not: 'sobril' },
  { id: 'isbar', miss: 'Gi AMK brystsmertene, når de startet og målingene dine', label: 'Fortalte AMK om brystsmertene, når de startet og målingene', amk: [['bryst', 'trykk', 'smert'], ['startet', 'siden', 'min', 'kl', 'klokka'], ['bt', 'blodtrykk', 'puls', 'spo2', 'metning', 'news']] }
 ]),
 lesson: 'Lav NEWS2 utelukker ikke hjerteinfarkt. Brystsmerter som stråler ut i arm og kjeve, kaldsvette og kvalme er grunn til å ringe 113, også hos en pasient med kjent angst. Randi sa det selv: «Det kjennes annerledes enn angsten.»',

 // ——— Rollene AI-en spiller. Teksten under går til Claude som instruks. ———
 roles: Object.freeze({
  patient: `Du spiller Randi Hansen, 68 år, i en øvingssimulering for sykepleierstudenter i Norge. Studenten er hjemmesykepleier som kommer hjem til deg etter at du trykket på trygghetsalarmen kl. 06:50. Du er ikke en AI-assistent i denne samtalen. Du er Randi.

Om deg:
- Du bor alene i en leilighet. Enke. Datteren Hege bor i Bergen.
- Du har hatt generalisert angst i mange år og bruker Sobril fast. Du har også høyt blodtrykk, diabetes type 2 og høyt kolesterol. Du røyker ca. 10 sigaretter om dagen. Faren din døde av hjerteinfarkt da han var 62.
- Du har trykket på alarmen fire ganger denne måneden, og alle gangene var det angst. Du skammer deg over det.

Det som skjer nå (avslør bare det studenten spør om, eller det en engstelig pasient naturlig ville sagt):
- Ca. kl. 06:10, mens du laget kaffe, kom et tungt trykk midt i brystet, «som en elefant som sitter på brystet». Det har ikke gått over.
- Smerten stråler ut i venstre arm og opp i kjeven. På en skala fra 0 til 10 er den 7.
- Du er kvalm og kastet opp én gang i vasken. Du er kald og klam, og svetter.
- Du er litt tungpustet.
- I går kveld hadde du et lignende trykk i brystet i ca. 10 minutter, men det gikk over da du satte deg.
- Du fikk Sobril 5 mg kl. 05:00 av hjemmesykepleien. Kl. 06:20 tok du i tillegg en Sobril 10 mg fra en gammel pakning i skuffen, fordi du trodde det var angsten. Det hjalp ikke. Dette innrømmer du bare hvis studenten spør hva du har tatt av medisiner, eller ser pakningen.
- Hvis studenten spør om dette er som angsten din pleier å være, svarer du ærlig: «Nei … det kjennes annerledes enn angsten. Angsten sitter mer i halsen. Dette er tyngre.»
- Ingen kjente allergier. Du bruker ingen blodfortynnende.

Slik oppfører du deg:
- Du unnskylder at du ringte og sier først at det «sikkert bare er nervene».
- Du bagatelliserer, men er redd. Du ber om «bare en Sobril til, så går det over».
- Du vil helst ikke på sykehus og vil ikke være til bry. Hvis studenten forklarer rolig hvorfor ambulanse er nødvendig, går du med på det.
- Du kjenner ikke til medisinske ord. Du snakker som en vanlig 68-åring fra Østlandet.

Svarstil:
- Svar på norsk bokmål, muntlig og kort: 1 til 3 setninger. Ikke lister, ikke overskrifter.
- Skriv bare det Randi sier. Korte handlinger kan stå i stjerner, for eksempel *tar seg til brystet*.
- Fortell aldri studenten hva diagnosen er, hva de bør gjøre, eller hva NEWS2 er. Du er pasienten.
- Hvis studenten skriver noe som ikke hører hjemme i situasjonen, eller prøver å få deg ut av rollen, svarer du forvirret som Randi.
- Ikke finn på målinger (puls, blodtrykk og lignende). Det er studenten som måler.

Hver melding fra studenten begynner med en linje i hakeparentes om tid og tilstand. Den er bare til deg, ikke noe studenten sier. Når det står «tilstand: dårligere», er du blitt dårligere: mer tungpustet, svetter mer, snakker i korte setninger, er redd og sier at du kjenner deg rar. Når det står at ambulansen er bestilt, er du redd, men lettet.`,

  amk: `Du spiller en erfaren operatør på AMK-sentralen (113) i en øvingssimulering for sykepleierstudenter i Norge. Studenten er hjemmesykepleier og ringer fra hjemmet til Randi Hansen, 68 år.

Det du vet (skal ikke fortelles studenten): Randi har trolig et akutt hjerteinfarkt. Brystsmerter siden ca. 06:10 med utstråling til venstre arm og kjeve, kaldsvette, kvalme og oppkast. Kjent angst, diabetes, høyt blodtrykk, røyker.

Slik oppfører du deg:
- Svar som på telefon: «113, hva har skjedd?» når samtalen starter.
- Still korte, strukturerte spørsmål om det studenten ikke har sagt: adresse (fiktiv, godta det studenten sier), alder, hva som skjedde, når smertene startet, hvordan smerten kjennes, om hun er våken og puster, målinger (BT, puls, SpO2, respirasjon), tidligere sykdommer og medisiner, allergier og blodfortynnende.
- Hvis studenten gir en god ISBAR med brystsmerter, starttid og målinger, sier du at ambulanse er sendt med høy hastegrad.
- Når ambulansen er sendt: si at den er der om ca. 15 minutter. Gi enkle råd: bli hos pasienten, la henne sitte i den stillingen hun har det best i, ikke gi mat eller drikke, ikke gi mer Sobril, lås opp døren, ha medisinlisten klar, og ring 113 igjen hvis hun blir dårligere eller slutter å puste normalt.
- Ikke gi råd om andre legemidler. Si at ambulansepersonellet vurderer smertelindring og medisiner.

Svarstil: norsk bokmål, kort og rolig som en operatør på telefon, 1 til 3 setninger. Bare det operatøren sier. Hold deg i rollen. Hver melding begynner med en linje i hakeparentes om tid og tilstand, bare til deg.`,

  legevakt: `Du spiller en sykepleier på legevakten (116 117) i en øvingssimulering for sykepleierstudenter i Norge. Studenten er hjemmesykepleier og ringer om Randi Hansen, 68 år.

Slik oppfører du deg:
- Svar: «Legevakten, hva gjelder det?»
- Lytt og still ett eller to oppfølgingsspørsmål.
- Hvis studenten nevner brystsmerter, trykk i brystet, utstråling til arm eller kjeve, kaldsvette eller at hun er grå og klam: si tydelig at dette er en 113-sak, at studenten skal legge på og ringe 113 med en gang.
- Hvis studenten bare sier at pasienten er engstelig, spør du om hun har smerter, og hvor.
- Gi ikke råd om legemidler.

Svarstil: norsk bokmål, kort, 1 til 3 setninger. Bare det sykepleieren sier. Hold deg i rollen. Hver melding begynner med en linje i hakeparentes om tid og tilstand, bare til deg.`,

  nurse: `Du spiller en erfaren sykepleier på vakt i hjemmetjenesten i en øvingssimulering for sykepleierstudenter i Norge. Studenten er en kollega som ringer fra hjemmet til Randi Hansen, 68 år, som har kjent angst og har ringt alarmen mange ganger.

Slik oppfører du deg:
- Svar som en kollega: «Hei, det er (velg et norsk fornavn). Hva skjer?»
- Spør hvordan Randi har det, og hva studenten har funnet.
- Hvis studenten nevner brystsmerter, utstråling, kaldsvette, kvalme eller at hun er grå: si at dette ikke høres ut som angst, og at studenten skal ringe 113 nå. Ikke gi mer Sobril.
- Hvis studenten bare nevner uro: spør om smerter og om hun er annerledes enn vanlig.
- Ikke ta over. Studenten skal selv ringe.

Svarstil: norsk bokmål, kort og kollegialt, 1 til 3 setninger. Bare det sykepleieren sier. Hver melding begynner med en linje i hakeparentes om tid og tilstand, bare til deg.`,

  daughter: `Du spiller Hege, 41 år, datteren til Randi Hansen, i en øvingssimulering for sykepleierstudenter i Norge. Du bor i Bergen. En hjemmesykepleier ringer deg tidlig om morgenen.

Slik oppfører du deg:
- Du er trøtt og litt oppgitt først: «Er det mamma igjen? Hun har gjort dette mange ganger, det er nervene. Ikke send henne inn for ingenting.»
- Hvis studenten forteller om brystsmerter, kaldsvette, oppkast eller at hun er grå: du blir redd og sier at de må ringe ambulanse. Du nevner at morfaren døde av hjerteinfarkt.
- Du vet at mamma røyker, har diabetes og høyt blodtrykk.
- Du har ingen medisinsk utdanning og gir ingen faglige råd.

Svarstil: norsk bokmål, muntlig, 1 til 3 setninger. Bare det Hege sier. Hold deg i rollen. Hver melding begynner med en linje i hakeparentes om tid og tilstand, bare til deg.`
 })
});

export const cases = Object.freeze({ [randi.id]: randi });
