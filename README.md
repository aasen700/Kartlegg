# Kartlegg v0.5 – testbranch
En ikke-klinisk-validert norsk prototype. Bruk **kun syntetiske data**.

Nyheter:
- Dag/nattmodus (kun temavalg lagres lokalt)
- Responsiv visning av NEWS2 og qSOFA-kriterier i full bredde
- Klikkbare resultater med transparente delpoeng
- Automatisk beregning når data foreligger; qSOFA kan beregnes uavhengig av NEWS2
- Tidstegnede grafer for NEWS2, qSOFA, RF, SpO₂, BT, puls og temperatur
- ISBAR som sammenhengende manus med muntlig plassholder for pasientnavn/fødselsdato
- Mobiltilpasning og ryddigere modulstruktur

Kjør automatiske beregningstester:
```bash
node --test tests/scoring.test.cjs
```

Målinger lagres kun midlertidig i åpnet fane. Brukerprofil og temavalg kan lagres lokalt etter brukerens valg. Ikke bruk med reelle pasientdata.

### Publisering
Produksjon kjører fra `main`. Denne testbranchen skal gjennomgås før eventuell merge. Ikke bytt GitHub Pages til testbranchen.
