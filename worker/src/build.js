/* Kartlegg AI – det som bygger forespørslene til Claude. Brukes av tjenesten (index.js) og av
 * testskriptet scripts/live-check.mjs, så testen kjører nøyaktig de samme instruksene og innstillingene.
 *
 * Modellene velges i wrangler.toml:
 *   CHAT_MODEL     samtalene i casen (pasienten og de du ringer), korte svar
 *   DEBRIEF_MODEL  tilbakemeldingen etter casen, fast JSON-format
 * Ingen automatisk reserve-modell: avslår modellen, får brukeren beskjed om å prøve igjen.
 */
export const MAX_MESSAGES = 60;
export const MAX_USER_TEXT = 600;
export const MAX_ASSISTANT_TEXT = 1500;
export const MAX_LOG_ENTRIES = 300;
export const MAX_LOG_CHARS = 40000;
export const DEFAULTS = Object.freeze({ CHAT_MODEL: 'claude-haiku-5-5', CHAT_EFFORT: 'low', DEBRIEF_MODEL: 'claude-sonnet-5-5', DEBRIEF_EFFORT: 'medium' });
const setting = (env, key) => (env && env[key]) || DEFAULTS[key];

export const clock = (start, minute) => {
 const t = start + minute;
 return String(Math.floor(t / 60) % 24).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
};

// Gjør om samtalen fra nettleseren til meldinger til Claude. Hver melding fra studenten får en fast
// linje om tid og tilstand foran, laget av tallene som fulgte med den meldingen. Den samme meldingen
// gir derfor alltid samme tekst, så tidligere deler av samtalen ikke endres fra gang til gang.
export function toMessages(c, raw) {
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

// Samtalene: korte, muntlige svar. Tenkingen holdes lav, og max_tokens gir plass til både den og svaret.
export function chatParams(env, system, messages) {
 return {
  model: setting(env, 'CHAT_MODEL'),
  max_tokens: 1024,
  output_config: { effort: setting(env, 'CHAT_EFFORT') },
  cache_control: { type: 'ephemeral' },
  system,
  messages
 };
}

// ——— Tilbakemelding på hele casen ———
// Nettleseren sender et kronologisk referat: hvem som sa eller gjorde hva, og når, og sjekklisten slik
// ordsøket vurderte den. Instruksen og fasiten kommer fra casefilen. Svaret har alltid samme oppsett.
export function debriefSchema(c) {
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
export function referat(c, body) {
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

const clip = (s, n) => String(s || '').slice(0, n);
export function tidy(r) {
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

// Tilbakemeldingen: hele referatet leses én gang, og svaret må følge debriefSchema.
// max_tokens gir god plass, siden tenkingen også teller med.
export function debriefParams(env, c, text) {
 return {
  model: setting(env, 'DEBRIEF_MODEL'),
  max_tokens: 16000,
  output_config: { effort: setting(env, 'DEBRIEF_EFFORT'), format: { type: 'json_schema', schema: debriefSchema(c) } },
  system: c.debriefGuide,
  messages: [{ role: 'user', content: text }]
 };
}

// Én logglinje per forespørsel: modell og tokens, aldri innholdet.
export function usageLine(route, r) {
 const u = r?.usage || {};
 return JSON.stringify({ route, model: r?.model, in: u.input_tokens, cacheRead: u.cache_read_input_tokens, cacheWrite: u.cache_creation_input_tokens, out: u.output_tokens, stop: r?.stop_reason });
}
