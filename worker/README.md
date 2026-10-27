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
- `CHAT_MODEL`, `CHAT_EFFORT`: modellen for samtalene i casen (pasienten og de du ringer). Standard `claude-haiku-5-5`, `low`.
- `DEBRIEF_MODEL`, `DEBRIEF_EFFORT`: modellen for tilbakemeldingen etter casen. Standard `claude-sonnet-5-5`, `medium`.
- Ingen automatisk reserve-modell. Loggen (`npx wrangler tail`) viser modell og tokens per forespørsel, aldri innholdet.

Sett også et månedstak på kostnaden i platform.claude.com (Billing → Limits).

## Lokalt

Lag `worker/.dev.vars` med `MOCK=1` (ferdigskrevne svar, ingen kostnad) og `DEV_NO_AUTH=1`
(hopper over innlogging, virker bare på localhost). Kjør `npm run dev`, og sett
`localStorage['kartlegg.ai.endpoint']='http://localhost:8787'` på `http://localhost:8771/?beta=ai`.

## Test mot den ekte API-en

```bash
cd worker && node scripts/live-check.mjs
```

Sjekker at modellene finnes for nøkkelen, kjører en samtale med Randi og AMK (også forsøk på å få fram
diagnosen), og en tilbakemelding som må være gyldig JSON med ekte sitater. Koster noen få øre.
