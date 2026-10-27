/* Kartlegg AI – liten tjeneste på Cloudflare Workers som lar AI-pasienten svare.
 *
 * Hvorfor den finnes: nøkkelen til Claude kan ikke ligge i nettsiden, der alle kan lese den.
 * Tjenesten holder nøkkelen, sjekker at den som spør er innlogget i Kartlegg og har betakoden
 * (eller står i ALLOWED_UIDS), begrenser hvor mye hver bruker kan sende per døgn, og sender bare
 * samtaler for casene og rollene i assets/ai/.
 *
 * /beta      sjekker betakoden (koden ligger som hemmelighet BETA_CODE, ikke i nettsiden)
 * /chat      ett svar fra pasienten eller den du ringer, strømmet
 * /debrief   tilbakemelding på hele casen, som fast JSON
 *
 * Instruksen til Claude (rollen) hentes alltid fra casefilen her, aldri fra nettleseren.
 * Innholdet i samtalene logges ikke. Bare antall tokens skrives til loggen, for å følge med på kostnaden.
 */
import Anthropic from '@anthropic-ai/sdk';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { cases } from '../../assets/ai/randi.mjs';

const FIREBASE_PROJECT = 'kartlegg';
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
const MAX_MESSAGES = 60;
const MAX_USER_TEXT = 600;
const MAX_ASSISTANT_TEXT = 1500;
const MAX_LOG_ENTRIES = 300;
const MAX_LOG_CHARS = 40000;

const enc = new TextEncoder();
const list = value => String(value || '').split(',').map(s => s.trim()).filter(Boolean);
const isLocal = url => ['localhost', '127.0.0.1'].includes(new URL(url).hostname);

function cors(request, env) {
 const origin = request.headers.get('Origin') || '';
 const allowed = list(env.ALLOWED_ORIGINS);
 if (!allowed.includes(origin)) return null;
 return {
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Kartlegg-Beta',
  'Access-Control-Max-Age': '600',
  Vary: 'Origin'
 };
}
const json = (status, body, headers) => new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

// Firebase-innloggingen: tokenet er signert av Google og gjelder i én time.
async function user(request, env) {
 if (env.DEV_NO_AUTH === '1' && isLocal(request.url)) return { uid: 'lokal-test', local: true };
 const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
 if (!token) return null;
 try {
  const { payload } = await jwtVerify(token, JWKS, {
   issuer: 'https://securetoken.google.com/' + FIREBASE_PROJECT,
   audience: FIREBASE_PROJECT
  });
  if (!payload.sub || payload.email_verified !== true) return null;
  return { uid: payload.sub };
 } catch (_) {
  return null;
 }
}

// Hvem slipper inn: kontoene i ALLOWED_UIDS, og alle andre innloggede med riktig betakode.
async function sameText(a, b) {
 const hash = async s => new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(String(s).trim().toLowerCase())));
 const [x, y] = await Promise.all([hash(a), hash(b)]);
 let diff = 0;
 for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
 return diff === 0;
}
async function allowed(request, env, who) {
 if (who.local || list(env.ALLOWED_UIDS).includes(who.uid)) return true;
 const code = request.headers.get('X-Kartlegg-Beta') || '';
 return Boolean(env.BETA_CODE && code && await sameText(code, env.BETA_CODE));
}
async function gate(request, env, headers) {
 const who = await user(request, env);
 if (!who) return { error: json(401, { error: 'login' }, headers) };
 if (!(await allowed(request, env, who))) return { error: json(403, { error: 'beta' }, headers) };
 return { who };
}

// Grense per bruker per døgn (norsk tid er nær nok UTC for dette formålet). Svarer null når det er
// greit, ellers feilkoden. Går telleren ikke å lagre (for eksempel når gratiskvoten i KV er brukt opp),
// stopper tjenesten heller enn å svare uten grense.
async function limit(env, uid, local) {
 if (!env.LIMITS) return local ? null : 'busy';
 const key = uid + ':' + new Date().toISOString().slice(0, 10);
 try {
  const used = Number(await env.LIMITS.get(key)) || 0;
  if (used >= (Number(env.DAILY_LIMIT) || 80)) return 'limit';
  await env.LIMITS.put(key, String(used + 1), { expirationTtl: 60 * 60 * 48 });
  return null;
 } catch (_) {
  return 'busy';
 }
}
const limited = (code, headers) => json(code === 'limit' ? 429 : 503, { error: code }, headers);

const clock = (start, minute) => {
 const t = start + minute;
 return String(Math.floor(t / 60) % 24).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
};

// Gjør om samtalen fra nettleseren til meldinger til Claude. Hver melding fra studenten får en fast
// linje om tid og tilstand foran, laget av tallene som fulgte med den meldingen. Den samme meldingen
// gir derfor alltid samme tekst, så tidligere deler av samtalen ikke endres fra gang til gang.
function toMessages(c, raw) {
 if (!Array.isArray(raw) || raw.length < 1 || raw.length > MAX_MESSAGES) return null;
 const out = [];
 for (let i = 0; i < raw.length; i++) {
  const m = raw[i];
  const role = i % 2 === 0 ? 'user' : 'assistant';
  if (!m || m.role !== role || typeof m.text !== 'string') return null;
  const text = m.text.trim();
  if (!text || text.length > (role === 'user' ? MAX_USER_TEXT : MAX_ASSISTANT_TEXT)) return null;
  if (role === 'assistant') { out.push({ role, content: text }); continue; }
  const minute = Number(m.minute);
  if (!Number.isInteger(minute) || minute < 0 || minute > 240) return null;
  const tag = '[Kl. ' + clock(c.clock.startMinutes, minute) + ' · tilstand: ' + (m.worse ? 'dårligere' : 'som da du kom') + ' · ambulanse: ' + (m.ambulance ? 'bestilt' : 'ikke bestilt') + ']';
  out.push({ role, content: tag + '\n' + text });
 }
 return out.length % 2 === 1 ? out : null;
}

const MOCK = {
 patient: 'Unnskyld at jeg ringte igjen … *tar seg til brystet* Det er sikkert bare nervene.',
 amk: '113, hva har skjedd?',
 legevakt: 'Legevakten, hva gjelder det?',
 nurse: 'Hei, det er Kari. Hva skjer?',
 daughter: 'Er det mamma igjen? Hun har gjort dette mange ganger.'
};

// Ved et sikkerhetsavslag kjøres svaret på nytt på en annen modell (gjelder ikke Haiku).
const withFallback = model => /^claude-(opus-5|fable-5|sonnet-5-5)/.test(model);

function stream(run) {
 const { readable, writable } = new TransformStream();
 const writer = writable.getWriter();
 const send = obj => writer.write(enc.encode(JSON.stringify(obj) + '\n'));
 const done = run(send).catch(e => send({ t: 'err', msg: e.message || 'feil' })).finally(() => writer.close());
 return { readable, done };
}

async function chat(request, env, ctx, headers) {
 const { who, error } = await gate(request, env, headers);
 if (error) return error;

 let body;
 try { body = await request.json(); } catch (_) { return json(400, { error: 'bad' }, headers); }
 const c = cases[body?.caseId];
 const system = c?.roles?.[body?.role];
 if (!system) return json(400, { error: 'case' }, headers);
 const messages = toMessages(c, body.messages);
 if (!messages) return json(400, { error: 'messages' }, headers);
 const over = await limit(env, who.uid, isLocal(request.url));
 if (over) return limited(over, headers);

 const out = stream(async send => {
  if (env.MOCK === '1') {
   for (const word of (MOCK[body.role] || '…').split(' ')) {
    await send({ t: 'd', v: word + ' ' });
    await new Promise(r => setTimeout(r, 40));
   }
   await send({ t: 'end' });
   return;
  }
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const model = env.MODEL || 'claude-opus-5-5';
  const params = {
   model,
   max_tokens: 2048,
   output_config: { effort: env.EFFORT || 'low' },
   cache_control: { type: 'ephemeral' },
   system,
   messages
  };
  const s = withFallback(model)
   ? client.beta.messages.stream({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
   : client.messages.stream(params);
  try {
   for await (const ev of s) {
    // En annen modell tar over midt i svaret: teksten så langt forkastes.
    if (ev.type === 'content_block_start' && ev.content_block?.type === 'fallback') await send({ t: 'reset' });
    if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') await send({ t: 'd', v: ev.delta.text });
   }
   const final = await s.finalMessage();
   const u = final.usage || {};
   console.log(JSON.stringify({ model: final.model, role: body.role, in: u.input_tokens, cacheRead: u.cache_read_input_tokens, cacheWrite: u.cache_creation_input_tokens, out: u.output_tokens, stop: final.stop_reason }));
   await send(final.stop_reason === 'refusal' ? { t: 'refusal' } : { t: 'end', stop: final.stop_reason });
  } catch (e) {
   if (e instanceof Anthropic.RateLimitError) await send({ t: 'err', msg: 'busy' });
   else if (e instanceof Anthropic.AuthenticationError) await send({ t: 'err', msg: 'config' });
   else if (e instanceof Anthropic.APIError) await send({ t: 'err', msg: 'api' });
   else throw e;
  }
 });
 ctx.waitUntil(out.done);
 return new Response(out.readable, { headers: { ...headers, 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' } });
}

// ——— Betakoden ———
async function beta(request, env, headers) {
 const { error } = await gate(request, env, headers);
 return error || json(200, { ok: true }, headers);
}

// ——— Tilbakemelding på hele casen ———
// Nettleseren sender et kronologisk referat: hvem som sa eller gjorde hva, og når, og sjekklisten slik
// ordsøket vurderte den. Instruksen og fasiten kommer fra casefilen. Svaret har alltid samme oppsett.
function debriefSchema(c) {
 const str = { type: 'string' };
 const guessIds = c.debrief.filter(d => d.ask || d.amk).map(d => d.id);
 return {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'strengths', 'improvements', 'missedQuestions', 'timing', 'isbar', 'communication', 'checks'],
  properties: {
   summary: str,
   strengths: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['point', 'quote'], properties: { point: str, quote: str } } },
   improvements: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['point', 'why'], properties: { point: str, why: str } } },
   missedQuestions: { type: 'array', items: str },
   timing: str,
   isbar: str,
   communication: str,
   checks: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'done'], properties: { id: { type: 'string', enum: guessIds }, done: { type: 'boolean' } } } }
  }
 };
}
function referat(c, body) {
 const log = body?.log;
 if (!Array.isArray(log) || log.length < 1 || log.length > MAX_LOG_ENTRIES) return null;
 let chars = 0;
 const lines = [];
 for (const e of log) {
  const minute = Number(e?.minute);
  if (!Number.isInteger(minute) || minute < 0 || minute > 240) return null;
  if (typeof e.who !== 'string' || typeof e.text !== 'string' || e.who.length > 60) return null;
  const text = e.text.trim().slice(0, MAX_ASSISTANT_TEXT);
  chars += text.length;
  if (chars > MAX_LOG_CHARS) return null;
  lines.push('[' + clock(c.clock.startMinutes, minute) + '] ' + e.who.trim() + ': ' + text);
 }
 const checks = Array.isArray(body.checks) ? body.checks.filter(x => c.debrief.some(d => d.id === x?.id)).map(x => {
  const d = c.debrief.find(y => y.id === x.id);
  return '- ' + d.id + ': ' + d.label + ' → ' + (x.done ? 'ja' : 'nei') + (d.ask || d.amk ? ' (ordsøk, kan ta feil)' : '');
 }) : [];
 const f = body.facts || {};
 const num = v => (Number.isInteger(v) ? v : null);
 const facts = [
  'Alarmen gikk kl. ' + c.clock.alarmAt + '.',
  num(f.arrivedAt) !== null ? 'Studenten kom fram kl. ' + clock(c.clock.startMinutes, f.arrivedAt) + (f.readFirst ? ' (leste journal og medisinkort før de dro).' : ' (dro rett ut uten å lese journalen først).') : '',
  num(f.called113At) !== null ? 'Studenten ringte 113 kl. ' + clock(c.clock.startMinutes, f.called113At) + '.' : 'Studenten ringte ikke 113.',
  'Randi ble dårligere kl. ' + clock(c.clock.startMinutes, c.worsensAt) + (num(f.endedAt) !== null && f.endedAt >= c.worsensAt ? ', og dette skjedde før casen ble avsluttet.' : ', men casen ble avsluttet før det.'),
  num(f.endedAt) !== null ? 'Casen ble avsluttet kl. ' + clock(c.clock.startMinutes, f.endedAt) + '.' : '',
  num(f.newsGuess) !== null ? 'Studenten skrev NEWS2 ' + f.newsGuess + (num(f.expectedNews) !== null ? ', riktig var ' + f.expectedNews : '') + '.' : 'Studenten skrev ikke inn NEWS2.'
 ].filter(Boolean);
 return 'FAKTA\n' + facts.join('\n') + '\n\nSJEKKLISTE (automatisk)\n' + checks.join('\n') + '\n\nREFERAT AV CASEN, I REKKEFØLGE\n' + lines.join('\n');
}
const MOCK_DEBRIEF = {
 summary: 'Testsvar: Du møtte Randi rolig og fant ut at dette ikke var som angsten hennes.',
 strengths: [{ point: 'Du spurte om dette var som angsten hennes pleier å være.', quote: 'Er dette som angsten din pleier å være?' }],
 improvements: [{ point: 'Spør tidlig om hvor smerten sitter og om den stråler ut.', why: 'Utstråling til arm og kjeve er et typisk tegn på hjerteinfarkt.' }],
 missedQuestions: ['Når begynte smertene?'],
 timing: 'Testsvar om tid.',
 isbar: 'Testsvar om ISBAR.',
 communication: 'Testsvar om kommunikasjon.',
 checks: []
};
const clip = (s, n) => String(s || '').slice(0, n);
function tidy(r) {
 return {
  summary: clip(r.summary, 800),
  strengths: (r.strengths || []).slice(0, 5).map(x => ({ point: clip(x.point, 400), quote: clip(x.quote, 300) })),
  improvements: (r.improvements || []).slice(0, 5).map(x => ({ point: clip(x.point, 400), why: clip(x.why, 400) })),
  missedQuestions: (r.missedQuestions || []).slice(0, 6).map(x => clip(x, 200)),
  timing: clip(r.timing, 600),
  isbar: clip(r.isbar, 600),
  communication: clip(r.communication, 600),
  checks: (r.checks || []).slice(0, 20).map(x => ({ id: clip(x.id, 40), done: x.done === true }))
 };
}
async function debrief(request, env, headers) {
 const { who, error } = await gate(request, env, headers);
 if (error) return error;
 let body;
 try { body = await request.json(); } catch (_) { return json(400, { error: 'bad' }, headers); }
 const c = cases[body?.caseId];
 if (!c?.debriefGuide) return json(400, { error: 'case' }, headers);
 const text = referat(c, body);
 if (!text) return json(400, { error: 'messages' }, headers);
 const over = await limit(env, who.uid, isLocal(request.url));
 if (over) return limited(over, headers);
 if (env.MOCK === '1') return json(200, MOCK_DEBRIEF, headers);
 const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
 const model = env.MODEL || 'claude-opus-5-5';
 const params = {
  model,
  max_tokens: 8000,
  output_config: { effort: env.DEBRIEF_EFFORT || 'medium', format: { type: 'json_schema', schema: debriefSchema(c) } },
  system: c.debriefGuide,
  messages: [{ role: 'user', content: text }]
 };
 try {
  const r = withFallback(model)
   ? await client.beta.messages.create({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
   : await client.messages.create(params);
  const u = r.usage || {};
  console.log(JSON.stringify({ model: r.model, role: 'debrief', in: u.input_tokens, out: u.output_tokens, stop: r.stop_reason }));
  if (r.stop_reason === 'refusal') return json(502, { error: 'refusal' }, headers);
  const out = r.content.filter(b => b.type === 'text').map(b => b.text).join('');
  let parsed;
  try { parsed = JSON.parse(out); } catch (_) { return json(502, { error: 'api' }, headers); }
  return json(200, tidy(parsed), headers);
 } catch (e) {
  if (e instanceof Anthropic.RateLimitError) return json(503, { error: 'busy' }, headers);
  if (e instanceof Anthropic.APIError) return json(502, { error: 'api' }, headers);
  throw e;
 }
}

export default {
 async fetch(request, env, ctx) {
  const headers = cors(request, env);
  if (!headers) return new Response('Forbidden', { status: 403 });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  const path = new URL(request.url).pathname;
  if (request.method === 'POST' && path === '/chat') return chat(request, env, ctx, headers);
  if (request.method === 'POST' && path === '/debrief') return debrief(request, env, headers);
  if (request.method === 'POST' && path === '/beta') return beta(request, env, headers);
  return json(404, { error: 'not-found' }, headers);
 }
};
