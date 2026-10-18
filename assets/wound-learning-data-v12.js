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
          "Blandet granulasjon og fibrin"
        ],
        [
          "epithelial",
          "Overveiende epitelisering"
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
        "Mørkt vev kan ha flere årsaker; vurder perfusjon og hele forløpet."
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
        "Fuktnivå kan ikke fastslås på et fotografi alene."
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
      "subtitle": "Sår på nedre legg",
      "summary": "Fiktiv kvinne, 78 år. Uregelmessig, overflatisk sår medialt på leggen, til stede i åtte uker. Sårbunnen er rød med spredt gulaktig belegg. Bandasjen blir svært fuktig innen neste skift, og sårkant/hud rundt er oppbløtt. Ikke ny smerte, varme eller økende rødhet oppgitt. Sårkanten har liten synlig fremgang siste fire uker.",
      "observations": [
        "Blandet rødt granulasjonsvev og fibrin/slough.",
        "Mye sårvæske og macerasjon.",
        "Ingen ny lokalisert inflammasjon eller systemiske tegn oppgitt."
      ],
      "answer": {
        "tissue": "mixed",
        "infection": "none",
        "moisture": "excess",
        "edge": "stalled",
        "skin": "macerated"
      },
      "why": {
        "tissue": "Teksten beskriver både granulasjon og gulaktig fibrin/slough.",
        "infection": "Ingen nye tegn til infeksjon er oppgitt. Dette utelukker ikke infeksjon ved andre funn.",
        "moisture": "Gjennomtrukket bandasje og oppbløtt hud tyder på for høy fuktbelastning.",
        "edge": "Lite utvikling gjennom fire uker er forenlig med stagnasjon.",
        "skin": "Hud rundt såret er tydelig beskrevet som oppbløtt."
      }
    },
    {
      "id": "arterial",
      "title": "Distalt fotsår ved nedsatt sirkulasjon",
      "level": "Øv",
      "subtitle": "Sår på tå",
      "summary": "Fiktiv mann, 72 år. Lite sår på tåspissen. Mørkt, tørt vev dekker store deler av sårbunnen; lite sårvæske. Rundt såret er huden intakt uten ny rødhet eller varme. Tydelig avgrenset, stagnerende sårkant. Pasienten har kalde føtter, smerter i hvile og tidligere kjent perifer karsykdom.",
      "observations": [
        "Overveiende mørkt nekrotisk vev.",
        "Tørr sårbunn og minimalt med sårvæske.",
        "Kald fot og hvilesmerter gjør vurdering av perfusjon sentral."
      ],
      "answer": {
        "tissue": "necrosis",
        "infection": "none",
        "moisture": "dry",
        "edge": "stalled",
        "skin": "intact"
      },
      "why": {
        "tissue": "Mørkt, tørt vev er her eksplisitt beskrevet som nekrotisk.",
        "infection": "Det er ikke oppgitt nye lokale infeksjonstegn. Perfusjonsproblematikk krever separat vurdering.",
        "moisture": "Sårbunnen er beskrevet som tørr.",
        "edge": "Sårkanten er oppgitt å stå stille.",
        "skin": "Huden omkring er angitt intakt uten lokale hudforandringer."
      }
    },
    {
      "id": "pressure",
      "title": "Trykksår over korsbenet",
      "level": "Øv",
      "subtitle": "Trykkutsatt område",
      "summary": "Fiktiv person, 86 år, med redusert mobilitet. Sår ved korsbenet har granulasjonsvev i bunnen, rikelig væske og underminerte sårkanter. Huden rundt er rød og varm. Pasienten har fått tydelig økende smerte og mer illeluktende sekret siste tre døgn. Ingen temperaturmåling er oppgitt.",
      "observations": [
        "Rød granulerende sårbunn, men underminerte kanter.",
        "Økende smerter, lukt og væskemengde.",
        "Rød og varm omkringliggende hud."
      ],
      "answer": {
        "tissue": "granulation",
        "infection": "suspect",
        "moisture": "excess",
        "edge": "undermined",
        "skin": "erythema"
      },
      "why": {
        "tissue": "Granulasjonsvev er uttrykkelig beskrevet som dominerende.",
        "infection": "Kombinasjonen av ny smerte, lukt, sekresjon og inflammasjon øker mistanken; det er ingen endelig diagnose.",
        "moisture": "Rikelig sårvæske er et dominerende funn.",
        "edge": "Kantene er uttrykkelig beskrevet som underminerte.",
        "skin": "Rød og varm hud er et dominerende funn."
      }
    },
    {
      "id": "postop",
      "title": "Postoperativt sår",
      "level": "Test",
      "subtitle": "Kirurgisk snitt",
      "summary": "Fiktiv kvinne, 64 år, ti dager etter operasjon. Et mindre område i snittlinjen er fuktig og rødt med granulasjonsvev; resten er lukket. Langs sårkanten ses ny, tynn epitelisering. Litt klar sårvæske, ingen lekkasje. Smal rand med rødhet der tape nylig er fjernet. Ikke økende smerte, varme eller puss. Omkringliggende hud er irritert, men ikke oppbløtt.",
      "observations": [
        "Granulasjonsvev på mindre, åpent område.",
        "Liten mengde klar væske.",
        "Rødhet følger tapeområdet uten andre oppgitte infeksjonstegn."
      ],
      "answer": {
        "tissue": "granulation",
        "infection": "inflammation",
        "moisture": "balanced",
        "edge": "advancing",
        "skin": "erythema"
      },
      "why": {
        "tissue": "Det åpne området beskrives som granulerende.",
        "infection": "Tapeirritasjon gir lokal inflammasjon, men det er ikke oppgitt tilstrekkelige tegn til å kalle dette en infeksjon.",
        "moisture": "Lite klar væske uten lekkasje gir her best treff på balansert fukt.",
        "edge": "Ny epitelisering langs kanten tilsier fremgang.",
        "skin": "Omkringliggende hud beskrives som rød og irritert."
      }
    },
    {
      "id": "diabetic",
      "title": "Plantart fotsår",
      "level": "Test",
      "subtitle": "Sår under forfoten",
      "summary": "Fiktiv mann, 59 år, med diabetes og nedsatt følesans. Rundt et sår under forfoten er det tykk, hard hud. I sårbunnen dominerer gult fibrinbelegg, og området er lett fuktig uten lekkasje. Sårkanten er fortykket og har hatt liten fremgang. Ingen tiltagende varme, lukt, hevelse eller smerte oppgitt. Vurder behovet for avlastning og sirkulasjonsundersøkelse separat.",
      "observations": [
        "Dominerende fibrin/slough.",
        "Fortykkede kanter og betydelig kallus.",
        "Moderat fuktighet, uten oppgitt infeksjonsutvikling."
      ],
      "answer": {
        "tissue": "slough",
        "infection": "none",
        "moisture": "balanced",
        "edge": "stalled",
        "skin": "callus"
      },
      "why": {
        "tissue": "Gult fibrinbelegg er uttrykkelig det dominerende vevet.",
        "infection": "Det er ikke beskrevet tiltagende lokale tegn, men diabetes kan gi atypisk symptomuttrykk.",
        "moisture": "Lett fuktig sårbunn uten lekkasje tilsier balansert fukt i denne øvingsbeskrivelsen.",
        "edge": "Fortykket kant uten fremgang samsvarer med stagnerende sårkant.",
        "skin": "Tykk hard hud rundt såret er kallus."
      }
    },
    {
      "id": "skin-tear",
      "title": "Hudrift på underarmen",
      "level": "Test",
      "subtitle": "Sår hos eldre person",
      "summary": "Fiktiv kvinne, 91 år, fikk hudrift på underarmen ved forflytning i går. En tynn hudlapp ligger delvis tilbake over såret. Det åpne området har rød sårbunn med nytt granulasjonslignende vev, er lett fuktig og har ingen lekkasje. Sårkant/hudlapp ligger til og ser ut til å få kontakt med sårflaten. Svært skjør omkringliggende hud. Lett lokal rødhet etter friksjon, uten varme, økende smerte eller illeluktende sekresjon.",
      "observations": [
        "Åpen, rød sårbunn og delvis bevart hudlapp.",
        "Lett fuktig uten lekkasje.",
        "Svært skjør hud rundt skadeområdet."
      ],
      "answer": {
        "tissue": "granulation",
        "infection": "inflammation",
        "moisture": "balanced",
        "edge": "advancing",
        "skin": "fragile"
      },
      "why": {
        "tissue": "Det synlige åpne området beskrives som rødt granulasjonslignende vev. Ved ferske sår må dette tolkes forsiktig.",
        "infection": "Lett rødhet etter friksjon taler for irritasjon; det er ikke nok informasjon til å mistenke infeksjon.",
        "moisture": "Lett fukt uten lekkasje tilsier balansert fukt.",
        "edge": "Hudlappen ligger til og kanten har god kontakt – her det beste alternativet blant øvingsvalgene.",
        "skin": "Svært skjør hud og hudrift er dominerende funn."
      }
    }
  ]
};
 const parts=Object.freeze(raw.parts.map(p=>Object.freeze({...p,options:Object.freeze(p.options.map(o=>Object.freeze(o)))})));
 const lessons=Object.freeze(raw.lessons.map(x=>Object.freeze({...x,tips:Object.freeze(x.tips)})));
 const cases=Object.freeze(raw.cases.map(x=>Object.freeze({...x,observations:Object.freeze(x.observations),answer:Object.freeze(x.answer),why:Object.freeze(x.why)})));
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
 return Object.freeze({parts,lessons,cases,grade,optionLabel});
});