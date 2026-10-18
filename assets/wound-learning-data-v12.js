/* Kartlegg Lær – TIMES casebook. Fully fictional observations; educational only.
 * No diagnoses, images of patients, data persistence or clinical treatment advice.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.KartleggWoundLearning=api;
})(typeof globalThis==='undefined'?this:globalThis,function(){
 'use strict';
 const raw={
  "parts": [
    {
      "id": "tissue",
      "letter": "T",
      "title": "Tissue – vev i sårbunnen",
      "prompt": "Hva beskriver sårbunnen best?",
      "options": [
        [
          "granulation",
          "Overveiende granulasjonsvev"
        ],
        [
          "slough",
          "Overveiende fibrin/slough"
        ],
        [
          "necrosis",
          "Overveiende nekrose"
        ],
        [
          "mixed",
          "Blandet rødt vev og gult fibrin/slough"
        ],
        [
          "epithelial",
          "Overveiende epitelisering"
        ],
        [
          "red",
          "Rød åpen sårbunn – vevstype ikke sikkert bestemt"
        ],
        [
          "closed",
          "Lukket snitt – ingen synlig sårbunn"
        ]
      ]
    },
    {
      "id": "infection",
      "letter": "I",
      "title": "Infection / inflammation",
      "prompt": "Hvordan tolker du de oppgitte tegnene?",
      "options": [
        [
          "none",
          "Ingen tydelige lokale infeksjonstegn oppgitt"
        ],
        [
          "inflammation",
          "Lokal inflammasjon/irritasjon, uten sikre infeksjonstegn"
        ],
        [
          "suspect",
          "Flere tegn som gir mistanke om lokal infeksjon"
        ]
      ]
    },
    {
      "id": "moisture",
      "letter": "M",
      "title": "Moisture – fuktbalanse",
      "prompt": "Hva er den dominerende fuktsituasjonen?",
      "options": [
        [
          "dry",
          "For tørr sårbunn"
        ],
        [
          "balanced",
          "Fuktig sårbunn uten betydelig overskudd"
        ],
        [
          "excess",
          "For mye sårvæske / lekkasje"
        ],
        [
          "closed-dry",
          "Tørr, lukket snittlinje uten sekresjon"
        ]
      ]
    },
    {
      "id": "edge",
      "letter": "E",
      "title": "Edge – sårkant",
      "prompt": "Hva kjennetegner sårkanten?",
      "options": [
        [
          "advancing",
          "Tegn til epitelisering / tilheling"
        ],
        [
          "stalled",
          "Stagnerende / fortykket sårkant"
        ],
        [
          "undermined",
          "Underminert / løsnet sårkant"
        ],
        [
          "approximated",
          "Sammenførte sårkanter med suturer"
        ],
        [
          "separated",
          "Åpne / adskilte kanter etter fersk skade"
        ]
      ]
    },
    {
      "id": "skin",
      "letter": "S",
      "title": "Surrounding skin – omkringliggende hud",
      "prompt": "Hva er hovedfunnet omkring såret?",
      "options": [
        [
          "intact",
          "Intakt, uten markerte forandringer"
        ],
        [
          "erythema",
          "Rød og irritert hud"
        ],
        [
          "macerated",
          "Macerert / oppbløtt hud"
        ],
        [
          "fragile",
          "Skjør hud / hudrift"
        ],
        [
          "callus",
          "Hard hud / kallus"
        ],
        [
          "pigmented",
          "Pigmentforandringer rundt såret"
        ],
        [
          "bruised",
          "Blodutredelser / blåmerker rundt såret"
        ]
      ]
    }
  ],
  "lessons": [
    {
      "title": "TIMES – strukturer funnene",
      "body": "TIMES er en huskeregel for observasjon av vev, inflammasjon/infeksjon, fuktbalanse, sårkanter og huden rundt. Først må du også vurdere sårårsak, sirkulasjon, smerter, allmenntilstand og endring over tid.",
      "tips": [
        "Samme sår kan inneholde flere vevstyper.",
        "Sårtype kan ikke avgjøres fra et bilde alene.",
        "Modulen trener observasjonsbegreper – ikke ordinasjon eller valg av bandasje."
      ]
    },
    {
      "title": "T – Tissue",
      "body": "Se etter granulasjon, fibrin/slough, epitelisering og nekrotisk vev. Beskriv gjerne andeler dersom flere vevstyper finnes i samme sår.",
      "tips": [
        "Rødt, kornet vev kan være granulasjon.",
        "Gult belegg kan være fibrin/slough, men farge alene er ikke fasit.",
        "Mørkt vev kan ha flere årsaker; vurder perfusjon og hele forløpet.",
        "Et suturert, lukket snitt har ingen synlig sårbunn. Ferskt rødt vev er ikke automatisk granulasjon."
      ]
    },
    {
      "title": "I – Infection / inflammation",
      "body": "Vurder utvikling i smerter, lukt, sårvæske, rødhet, varme, hevelse, tilheling og eventuelle allmennsymptomer. Normal sårinflammasjon og lokal hudirritasjon må skilles fra mistanke om infeksjon.",
      "tips": [
        "Ingen enkeltindikator bekrefter infeksjon.",
        "Forverring eller systemiske symptomer krever raskere klinisk vurdering.",
        "Ved mistanke dokumenteres funn og videreformidles etter lokale rutiner."
      ]
    },
    {
      "title": "M – Moisture",
      "body": "Kartlegg fukt i sårbunn, sårvæskemengde og om omkringliggende hud blir oppbløtt. Både uttørking og for mye væske kan være uheldig.",
      "tips": [
        "Vurder bandasjens gjennomtrukking og lekkasje.",
        "Macerasjon er en observasjon – ikke en diagnose.",
        "Fuktnivå kan ikke fastslås på et fotografi alene.",
        "Skill tørr lukket snittlinje fra uttørking i et åpent sår."
      ]
    },
    {
      "title": "E – Edge",
      "body": "Undersøk om sårkanten går fremover med epitelisering, står stille, er fortykket eller er underminert. Sårkanten sier noe om forløpet, men må sees sammen med målinger over tid.",
      "tips": [
        "Epitel fra kanten kan tyde på tilheling.",
        "Fortykkede kanter kan følge kronisk belastning.",
        "Underminering må undersøkes faglig forsvarlig, ikke utledes fra bilde."
      ]
    },
    {
      "title": "S – Surrounding skin",
      "body": "Se systematisk etter macerasjon, rødhet, ødem, skjør hud, hudrifter, pigmentforandringer og hard hud. Beskriv huden omkring såret separat fra sårbunnen.",
      "tips": [
        "Fukt og tape kan irritere frisk hud.",
        "Kallus kan være tegn på trykkbelastning, men sier ikke alt om årsaken.",
        "Undersøk hud som ikke er synlig på illustrasjonen."
      ]
    }
  ],
  "cases": [
    {
      "id": "venous",
      "title": "Venøst leggsår",
      "level": "Øv",
      "subtitle": "Uregelmessig sår ved ankelen",
      "summary": "Fiktiv kvinne, 78 år, med kjent venøs insuffisiens. Et uregelmessig sår ved innsiden av ankelen har vært til stede i åtte uker. Ved undersøkelse beskrives rødt vev og gult belegg, brunpigmentert hud og lett hevelse. Bandasjen er gjennomtrukket før planlagt skift. Ingen ny smerte, spredende rødhet, varmeøkning eller feber er oppgitt. Målinger viser liten endring i sårkanten siste fire uker.",
      "observations": [
        "Mye væske er oppgitt fra bandasjeskift – mengden kan ikke leses av bildet.",
        "Venøs årsak er gitt i den fiktive sykehistorien.",
        "Manglende fremgang er dokumentert over fire uker."
      ],
      "answer": {
        "tissue": "mixed",
        "infection": "none",
        "moisture": "excess",
        "edge": "stalled",
        "skin": "pigmented"
      },
      "why": {
        "tissue": "Illustrasjonen og undersøkelsen viser både rødt vev og gult belegg. Farge alene bestemmer ikke vevstype.",
        "infection": "Ingen nye infeksjonstegn er oppgitt. Dette er ikke det samme som at infeksjon er utelukket.",
        "moisture": "Gjennomtrukket bandasje før planlagt skift er grunnlaget for svaret, ikke glansen i illustrasjonen.",
        "edge": "Stagnasjon bygger på målingene over fire uker, ikke et enkelt bilde.",
        "skin": "Pigmentforandringene er synlige og beskrevet. Det er ikke oppgitt oppbløtt hud som begrunner macerasjon."
      },
      "imageFindings": [
        "Uregelmessig åpent sår med røde og gulaktige områder.",
        "Brunlige og fiolette hudforandringer rundt ankelen."
      ]
    },
    {
      "id": "arterial",
      "title": "Tåsår ved nedsatt sirkulasjon",
      "level": "Øv",
      "subtitle": "Åpent sår på oversiden av stortåen",
      "summary": "Fiktiv mann, 72 år, med kjent perifer karsykdom. Et avgrenset sår på oversiden av stortåen har åpen rød sårbunn, uten oppgitt svart eskar. Såret er lett fuktig med sparsom klar væske, uten gjennomtrukket bandasje. En smal rød rand er uendret. Ingen økende varme, hevelse, smerte fra selve såret eller feber er oppgitt. Såret har ikke minket på tre uker. Kald fot og hvilesmerter er oppgitt og krever egen vurdering av sirkulasjonen.",
      "observations": [
        "Karsykdom, kald fot og hvilesmerter er tilleggsopplysninger.",
        "Sparsom klar væske og uendret rød rand er beskrevet ved undersøkelse.",
        "Ingen målbar reduksjon av såret på tre uker."
      ],
      "answer": {
        "tissue": "red",
        "infection": "inflammation",
        "moisture": "balanced",
        "edge": "stalled",
        "skin": "erythema"
      },
      "why": {
        "tissue": "Rødt vev ses, men illustrasjonen alene bekrefter ikke granulasjon. Arteriell årsak betyr ikke at alle sår må ha svart nekrose.",
        "infection": "En smal, stabil rød rand kan passe med lokal irritasjon. Sykehistorien oppgir ikke en utvikling som i seg selv begrunner infeksjonsmistanke.",
        "moisture": "Sparsom væske uten lekkasje passer best med lett fuktig sårbunn i dette kasuset. Dette er ingen anbefaling om å tilføre fukt.",
        "edge": "Manglende størrelsesendring over tre uker støtter stagnasjon.",
        "skin": "Den røde randen er synlig og oppgitt. Fotens perfusjon må vurderes separat og kan ikke fastslås fra hudfarge i bildet."
      },
      "imageFindings": [
        "Lite, tydelig avgrenset sår på oversiden av stortåen.",
        "Rød åpen sårbunn med en smal rød rand; ingen tydelig svart, tørr skorpe."
      ]
    },
    {
      "id": "pressure",
      "title": "Dypt sår i seteområdet",
      "level": "Øv",
      "subtitle": "Sårhule ved langvarig trykkbelastning",
      "summary": "Fiktiv person, 86 år, med redusert mobilitet og langvarig trykk mot seteområdet. Undersøkelsen beskriver en dyp sårhule med rødt vev og gult belegg. Underminering er påvist ved faglig undersøkelse. De siste tre døgnene har smerte, væskemengde og lukt økt, og huden rundt er blitt rødere og varmere. Bandasjen lekker. Allmenntilstand og temperatur er ikke oppgitt og må etterspørres.",
      "observations": [
        "Trykkbelastning og påvist underminering er oppgitt i teksten.",
        "Ny smerte, økende lukt, væske, rødhet og varme.",
        "Dybde, trykksårkategori og eventuelt eksponerte strukturer kan ikke bestemmes sikkert fra illustrasjonen."
      ],
      "answer": {
        "tissue": "mixed",
        "infection": "suspect",
        "moisture": "excess",
        "edge": "undermined",
        "skin": "erythema"
      },
      "why": {
        "tissue": "Både rødt vev og gult belegg er beskrevet. Mørke partier kan ikke automatisk kalles nekrose eller eksponert ben.",
        "infection": "Flere nye og tiltagende tegn gir mistanke og behov for klinisk vurdering; bildet stiller ingen infeksjonsdiagnose.",
        "moisture": "Lekkasje og økende væskemengde begrunner væskeoverskudd.",
        "edge": "Undermineringen er påvist i den fiktive undersøkelsen. Et bilde av en hule er ikke nok til å fastslå dette.",
        "skin": "Økende rødhet og varme er oppgitt som hovedfunn rundt såret."
      },
      "imageFindings": [
        "Åpen sårhule i seteområdet med røde, gule og mørkere partier.",
        "Uregelmessig sårkant og rødlig hud nær åpningen."
      ]
    },
    {
      "id": "postop",
      "title": "Lukket postoperativt sår",
      "level": "Test",
      "subtitle": "Suturert snitt",
      "summary": "Fiktiv kvinne, 64 år, fem dager etter operasjon. Snittet er lukket med suturer; sårkantene ligger inntil hverandre uten sprik. Det ses ingen åpen sårbunn. Snittlinjen og bandasjen er tørre uten sekresjon. Huden rundt er intakt. Ingen tiltagende rødhet, varme, hevelse, smerte eller feber er oppgitt.",
      "observations": [
        "Tørr bandasje og fravær av sekresjon er gitt i teksten.",
        "Ingen tiltagende lokale tegn eller feber er oppgitt.",
        "TIMES må tilpasses et lukket snitt; vev i en åpen sårbunn kan ikke graderes her."
      ],
      "answer": {
        "tissue": "closed",
        "infection": "none",
        "moisture": "closed-dry",
        "edge": "approximated",
        "skin": "intact"
      },
      "why": {
        "tissue": "Et lukket snitt har ingen synlig åpen sårbunn. Det ville være feil å kalle dette granulasjonsvev ut fra illustrasjonen.",
        "infection": "Det er ikke oppgitt tiltagende tegn som gir mistanke om infeksjon. Observer utviklingen over tid.",
        "moisture": "Tørr, lukket snittlinje uten sekresjon er ikke det samme som en for tørr åpen sårbunn.",
        "edge": "Suturene holder kantene sammen. Dette beskriver lukning; fremgang i tilhelingen krever oppfølging over tid.",
        "skin": "Huden er intakt uten markerte forandringer i kasusbeskrivelsen. Tape på bildet dokumenterer ikke tapeirritasjon."
      },
      "imageFindings": [
        "Lineært snitt lukket med synlige suturer.",
        "Sårkantene ligger sammen; ingen tydelig åpen sårbunn."
      ]
    },
    {
      "id": "diabetic",
      "title": "Plantart fotsår ved diabetes",
      "level": "Test",
      "subtitle": "Sår under forfoten med kallus",
      "summary": "Fiktiv mann, 59 år, med diabetes og nedsatt følesans. Et sår under forfoten har overveiende gult belegg og mindre røde områder. Det er en fortykket rand med hard hud. Undersøkelsen beskriver lett fuktig sårbunn, moderat væske uten lekkasje og liten fremgang de siste ukene. Ingen ny varmeøkning, spredende rødhet eller allmennsymptomer er oppgitt. Smertefravær er ikke et betryggende tegn ved nedsatt følesans. Fotstatus, sirkulasjon og belastning må vurderes separat.",
      "observations": [
        "Nedsatt følesans og diabetes er oppgitt i sykehistorien.",
        "Moderat væske uten lekkasje og manglende fremgang er oppgitt.",
        "Infeksjon og iskemi kan ikke utelukkes fra illustrasjonen eller fravær av smerte."
      ],
      "answer": {
        "tissue": "slough",
        "infection": "none",
        "moisture": "balanced",
        "edge": "stalled",
        "skin": "callus"
      },
      "why": {
        "tissue": "Gult belegg er beskrevet som dominerende, med mindre røde områder. Den fiktive undersøkelsen støtter fibrin/slough.",
        "infection": "Ingen nye infeksjonstegn er oppgitt; svaret betyr ikke at infeksjon er utelukket. Tegn kan være svake ved diabetes.",
        "moisture": "Moderat væske uten lekkasje er grunnlaget for dette øvingssvaret.",
        "edge": "Fortykket kant og liten fremgang over tid passer med stagnerende sårkant.",
        "skin": "Den fortykkede, harde huden rundt åpningen beskrives som kallus."
      },
      "imageFindings": [
        "Rundt sår under forfoten med gult belegg og røde områder.",
        "Fortykket gulaktig hud rundt åpningen."
      ]
    },
    {
      "id": "skin-tear",
      "title": "Traumatisk hudskade på underarmen",
      "level": "Test",
      "subtitle": "Åpent sår med blodutredelser",
      "summary": "Fiktiv kvinne, 91 år, fikk en traumatisk hudskade på underarmen ved forflytning tidligere i dag. Såret har åpen rød sårflate med blodtilblanding og adskilte kanter. Det er omfattende blåmerker i huden rundt. Undersøkelsen oppgir sparsom blodtilblandet væske uten vedvarende blødning eller gjennomtrukket bandasje. Lett lokal irritasjon, men ingen tiltagende varme, spredende rødhet eller feber. Dybde og eventuell levedyktig hudlapp er ennå ikke avklart.",
      "observations": [
        "Skaden er fersk; rødt vev betyr ikke at nytt granulasjonsvev allerede er dannet.",
        "Blødningen er oppgitt å ha stanset.",
        "Illustrasjonen ligner en dypere flenge. Den skal ikke alene brukes til å klassifisere en overflatisk hudrift etter ISTAP."
      ],
      "answer": {
        "tissue": "red",
        "infection": "inflammation",
        "moisture": "balanced",
        "edge": "separated",
        "skin": "bruised"
      },
      "why": {
        "tissue": "En fersk rød sårflate kan inneholde blod og eksponert vev. Det er ikke grunnlag for å kalle dette etablert granulasjon.",
        "infection": "Lokal reaksjon etter skade kan være inflammasjon. Ingen tiltagende infeksjonstegn er oppgitt.",
        "moisture": "Sparsom væske uten gjennomtrukking gir best treff på fuktig uten overskudd. Vedvarende blødning ville krevd en annen vurdering.",
        "edge": "Kantene er adskilt. Ingen tilheling eller god kontakt fra en hudlapp er dokumentert.",
        "skin": "Blodutredelsene er det dominerende synlige funnet. Alder alene avgjør ikke graden av hudskjørhet."
      },
      "imageFindings": [
        "Avlang åpen skade med rødt vev, blodtilblanding og adskilte kanter.",
        "Tydelige fiolette blodutredelser i omkringliggende hud."
      ]
    }
  ],
  "sources": [
    {
      "label": "NICE – infeksjon i leggsår",
      "url": "https://www.nice.org.uk/guidance/ng152/chapter/recommendations"
    },
    {
      "label": "NICE – trykksår",
      "url": "https://www.nice.org.uk/guidance/cg179/chapter/recommendations"
    },
    {
      "label": "NICE – diabetiske fotproblemer",
      "url": "https://www.nice.org.uk/guidance/ng19/chapter/Recommendations"
    },
    {
      "label": "NICE – kirurgiske sår",
      "url": "https://www.nice.org.uk/guidance/ng125/chapter/recommendations"
    },
    {
      "label": "ISTAP – hudrifter, anbefalinger 2025",
      "url": "https://www.skintears.org/post/bpr-for-the-prevention-and-management-of-skin-tears-in-aged-skin"
    }
  ]
};
 const parts=Object.freeze(raw.parts.map(p=>Object.freeze({...p,options:Object.freeze(p.options.map(o=>Object.freeze(o)))})));
 const lessons=Object.freeze(raw.lessons.map(x=>Object.freeze({...x,tips:Object.freeze(x.tips)})));
 const cases=Object.freeze(raw.cases.map(x=>Object.freeze({...x,observations:Object.freeze(x.observations),imageFindings:Object.freeze(x.imageFindings),answer:Object.freeze(x.answer),why:Object.freeze(x.why)})));
 const ids=new Map(cases.map(q=>[q.id,q]));
 const allowed=new Map(parts.map(p=>[p.id,new Set(p.options.map(o=>o[0]))]));
 function grade(id,answers){
  const q=ids.get(id);
  if(!q)throw new RangeError('Ukjent TIMES-case');
  if(!answers||typeof answers!=='object')throw new TypeError('Svar mangler');
  for(const p of parts)if(!allowed.get(p.id).has(answers[p.id]))throw new RangeError('Ugyldig eller ufullstendig '+p.id);
  const match=Object.fromEntries(parts.map(p=>[p.id,answers[p.id]===q.answer[p.id]]));
  return {id,score:Object.values(match).filter(Boolean).length,max:parts.length,match,truth:{...q.answer}};
 }
 function optionLabel(partId,value){
  const p=parts.find(p=>p.id===partId);
  return p?.options.find(o=>o[0]===value)?.[1]||'Ikke vurdert';
 }
 return Object.freeze({parts,lessons,cases,grade,optionLabel,sources:Object.freeze(raw.sources.map(Object.freeze))});
});