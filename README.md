# Kartlegg v0.2

En mobiltilpasset prototype av Kartlegg med verktøybibliotek, skårer, tidsserie for målinger og en ISBAR-mal. **Kun fiktive data. Ikke validert for klinisk bruk.**

## Kom i gang

Åpne `index.html` i en nettleser. All kode ligger i én fil. Ingen installasjon, database eller kontoregistrering er nødvendig.

## Hva er nytt?

- **Kliniske verktøy:** NEWS2- og qSOFA-kriterier; oversikt over GCS og 4AT (ikke implementert som automatiske skårer).
- **Målinger over tid:** Velg dato og klokkeslett i vurderingsskjemaet og trykk **Lagre måling**. Flere målinger gir tabell, NEWS2-graf og endringer fra første til siste tidspunkt. Velg **Åpne** for å hente gamle målinger inn igjen. **Ny måling** oppretter et tomt skjema.
- **ISBAR:** Trykk **ISBAR** ved siden av Beregn skårer. Malen setter inn vitale målinger, måletidspunkt, NEWS2, eventuell qSOFA og tidligere NEWS2. Fritekstdeler kan redigeres, og du kan kopiere hele manuset.
- **Footer:** «Laget av Philip Aasen» med e-post og telefon.

## Viktig om skåring

- NEWS2 støtter både SpO₂-skala 1 og 2. **Skala 2 skal bare velges etter relevant klinisk beslutning.**
- qSOFA krever oppgitt GCS-totalskår (3–15), som må vurderes separat. GCS beregnes *ikke* fra AVPU.
- qSOFA kan ikke utelukke sepsis.
- ISBAR-teksten er et redigerbart **utkast**; den kan ikke erstatte kliniske vurderinger eller lokale rutiner.
- Oppgitte kilder og poenggrenser må kvalitetssikres før klinisk anvendelse. Regelverket for medisinsk utstyr og personvern må avklares.

## Personvern og historikk

Vitale målinger kan være helseopplysninger dersom de kan knyttes til en identifiserbar person. Prototypen skal derfor bare brukes med **fiktive målinger**. Skårene beregnes lokalt. Ingen målinger sendes fra koden til en server eller lagres i nettleserens permanente lager. Tidsserien beholdes *kun i minnet i den åpne fanen* og går tapt ved oppdatering, navigering bort eller lukking av fanen. Dette er bevisst valgt fremfor å lagre identifiserbare data.

## Legg ut på GitHub Pages

1. Opprett et repository, for eksempel `kartlegg`.
2. Velg **Add file → Upload files** i GitHub og last opp `index.html` og gjerne `README.md` (eller erstatt de eksisterende filene).
3. Trykk **Commit changes**.
4. Åpne **Settings → Pages** → **Deploy from a branch** → `main` og `/(root)`.
5. Publiseringsadressen blir typisk `https://BRUKERNAVN.github.io/kartlegg/`.

## Faglige kilder

- [Royal College of Physicians – NEWS2](https://www.rcp.ac.uk/resources/national-early-warning-score-news-2/)
- [Sepsis-3 – qSOFA](https://pmc.ncbi.nlm.nih.gov/articles/PMC4968574/)
- [Helsebiblioteket – ISBAR](https://www.helsebiblioteket.no/innhold/nasjonal-faglig-retningslinje/somatiske-akuttmottak-nasjonal-faglig-retningslinje)

NEWS2-attribusjon og oversettelsesforbehold fra RCP er oppført på nettsiden.
