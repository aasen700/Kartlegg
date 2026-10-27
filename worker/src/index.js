/* Kartlegg AI – liten tjeneste på Cloudflare Workers som lar AI-pasienten svare.
 *
 * Hvorfor den finnes: nøkkelen til Claude kan ikke ligge i nettsiden, der alle kan lese den.
 * Tjenesten holder nøkkelen, sjekker at den som spør er innlogget i Kartlegg, begrenser hvor mye
 * hver bruker kan sende per døgn, og sender bare samtaler for casene og rollene i assets/ai/.
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
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '600',
  Vary: 'Origin'
 };
}
const json = (status, body, headers) => new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

// Firebase-innloggingen: tokenet er signert av Google og gjelder i én time.
async function user(request, env) {
 if (env.DEV_NO_AUTH === '1' && isLocal(request.url)) return { uid: 'lokal-test' };
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

// Grense per bruker per døgn (norsk tid er nær nok UTC for dette formålet).
async function withinLimit(env, uid, local) {
 if (!env.LIMITS) return local;
 const key = uid + ':' + new Date().toISOString().slice(0, 10);
 const used = Number(await env.LIMITS.get(key)) || 0;
 if (used >= (Number(env.DAILY_LIMIT) || 200)) return false;
 await env.LIMITS.put(key, String(used + 1), { expirationTtl: 60 * 60 * 48 });
 return true;
}

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

function stream(run) {
 const { readable, writable } = new TransformStream();
 const writer = writable.getWriter();
 const send = obj => writer.write(enc.encode(JSON.stringify(obj) + '\n'));
 const done = run(send).catch(e => send({ t: 'err', msg: e.message || 'feil' })).finally(() => writer.close());
 return { readable, done };
}

async function chat(request, env, ctx, headers) {
 const who = await user(request, env);
 if (!who) return json(401, { error: 'login' }, headers);
 const allow = list(env.ALLOWED_UIDS);
 if (allow.length && !allow.includes(who.uid)) return json(403, { error: 'beta' }, headers);

 let body;
 try { body = await request.json(); } catch (_) { return json(400, { error: 'bad' }, headers); }
 const c = cases[body?.caseId];
 const system = c?.roles?.[body?.role];
 if (!system) return json(400, { error: 'case' }, headers);
 const messages = toMessages(c, body.messages);
 if (!messages) return json(400, { error: 'messages' }, headers);
 if (!(await withinLimit(env, who.uid, isLocal(request.url)))) return json(429, { error: 'limit' }, headers);

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
  // Ved et sikkerhetsavslag kjøres svaret på nytt på en annen modell (gjelder ikke Haiku).
  const fallback = /^claude-(opus-5|fable-5|sonnet-5-5)/.test(model);
  const params = {
   model,
   max_tokens: 2048,
   output_config: { effort: env.EFFORT || 'low' },
   cache_control: { type: 'ephemeral' },
   system,
   messages
  };
  const s = fallback
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

export default {
 async fetch(request, env, ctx) {
  const headers = cors(request, env);
  if (!headers) return new Response('Forbidden', { status: 403 });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  const path = new URL(request.url).pathname;
  if (request.method === 'POST' && path === '/chat') return chat(request, env, ctx, headers);
  return json(404, { error: 'not-found' }, headers);
 }
};
