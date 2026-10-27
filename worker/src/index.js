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
import { toMessages, chatParams, referat, tidy, debriefParams, usageLine } from './build.js';

const FIREBASE_PROJECT = 'kartlegg';
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

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
  const s = client.messages.stream(chatParams(env, system, messages));
  try {
   for await (const ev of s) {
    if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') await send({ t: 'd', v: ev.delta.text });
   }
   const final = await s.finalMessage();
   console.log(usageLine('chat:' + body.role, final));
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
 try {
  const r = await client.messages.create(debriefParams(env, c, text));
  console.log(usageLine('debrief', r));
  if (r.stop_reason === 'refusal') return json(502, { error: 'refusal' }, headers);
  if (r.stop_reason === 'max_tokens') return json(502, { error: 'api' }, headers);
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
