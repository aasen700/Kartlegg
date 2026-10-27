# Kartlegg AI-tjeneste (Cloudflare Worker)

Lar AI-pasienten i Simulering svare. Tjenesten holder Claude-nøkkelen, sjekker at brukeren er innlogget
i Kartlegg (Firebase), teller meldinger per bruker per døgn (Workers KV), og sender bare samtaler for
casene og rollene i `assets/ai/`. Innholdet i samtalene logges ikke.

## Første gang

```bash
cd worker
npm install
npx wrangler login
# (telleren LIMITS finnes allerede, se wrangler.toml)
npx wrangler deploy
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put BETA_CODE
```

`deploy` skriver ut adressen (`https://kartlegg-ai.<navn>.workers.dev`). Den settes som `SERVICE` i
`assets/ai/ai-sim.mjs`.

## Innstillinger (wrangler.toml)

- `ALLOWED_UIDS`: kontoer som slipper inn uten betakode. Alle andre innloggede med bekreftet e-post trenger betakoden (hemmeligheten `BETA_CODE`). Bytt kode med `npx wrangler secret put BETA_CODE`.
- `DAILY_LIMIT`: meldinger per bruker per døgn (en tilbakemelding teller som én). Gratiskvoten i Workers KV er 1000 skrivinger per døgn, så tjenesten stopper ved ca. 1000 meldinger totalt per døgn.
- `DEBRIEF_EFFORT` (valgfri): hvor grundig AI-tilbakemeldingen tenker. Standard `medium`.
- `MODEL`, `EFFORT`: hvilken Claude-modell og hvor grundig den tenker.

Sett også et månedstak på kostnaden i platform.claude.com (Billing → Limits).

## Lokalt

Lag `worker/.dev.vars` med `MOCK=1` (ferdigskrevne svar, ingen kostnad) og `DEV_NO_AUTH=1`
(hopper over innlogging, virker bare på localhost). Kjør `npm run dev`, og sett
`localStorage['kartlegg.ai.endpoint']='http://localhost:8787'` på `http://localhost:8771/?beta=ai`.
