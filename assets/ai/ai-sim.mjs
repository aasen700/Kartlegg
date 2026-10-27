/* Kartlegg – AI-pasient (beta).
 *
 * Gangen i casen: trygghetsalarm → velg å lese journal først eller dra rett ut → hos pasienten:
 * snakk fritt, mål, undersøk, gjør tiltak, les journal og medisinkort, ring → tilbakemelding.
 *
 * Det pasienten og de du ringer sier, kommer fra Claude via Kartleggs egen tjeneste (worker/).
 * Alt annet (målinger, funn, tid, forverring, fasit) kommer fra casefilen og regnes ut her.
 * Samtalen lagres ikke. Bare at casen er fullført og resultatet huskes, som i de andre casene.
 *
 * Synlig bare når beta er slått på (?beta=ai, av med ?beta=av) og tjenesten har en adresse.
 */
import { randi } from './randi.mjs?v=ai6';

const C = randi;
// Adressen til tjenesten på Cloudflare. Tom = AI-pasienten er skjult.
const SERVICE = 'https://kartlegg-ai.kartlegg.workers.dev';
const BETA_KEY = 'kartlegg.ai.beta';
const LOCAL_SERVICE_KEY = 'kartlegg.ai.endpoint';
const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
const MAX_TEXT = 600;

const read = k => { try { return localStorage.getItem(k); } catch (_) { return null; } };
const write = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) {} };
(() => {
 const p = new URLSearchParams(location.search).get('beta');
 if (p === 'ai') write(BETA_KEY, '1');
 if (p === 'av') write(BETA_KEY, null);
})();
const service = () => (LOCAL && read(LOCAL_SERVICE_KEY)) || SERVICE;
const available = () => read(BETA_KEY) === '1' && Boolean(service());
// Betakoden sjekkes av tjenesten, ikke her: den står ikke i nettsiden. Riktig kode lagres i denne
// nettleseren (også i appen på hjemskjermen, som har egen lagring) og sendes med hver forespørsel.
const CODE_KEY = 'kartlegg.ai.code';
const betaHeader = () => { const c = read(CODE_KEY); return c ? { 'X-Kartlegg-Beta': c } : {}; };
async function unlock(code) {
 code = String(code || '').trim().slice(0, 60);
 if (!code) return 'beta';
 const token = await idToken();
 if (!token) return 'login';
 try {
  const res = await fetch(service().replace(/\/$/, '') + '/beta', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'X-Kartlegg-Beta': code } });
  if (!res.ok) return (await res.json().catch(() => ({}))).error || 'http';
 } catch (_) { return 'net'; }
 write(CODE_KEY, code);
 write(BETA_KEY, '1');
 return true;
}

// ——— Hjelpere ———
const h = (tag, cls, text) => {
 const n = document.createElement(tag);
 if (cls) n.className = cls;
 if (text !== undefined) n.textContent = text;
 return n;
};
const btn = (text, cls, fn) => { const b = h('button', cls, text); b.type = 'button'; b.addEventListener('click', fn); return b; };
const ICON = {
 bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
 notes: '<path d="M7 3h8l4 4v14H7Z"/><path d="M10 11h6M10 15h6"/>',
 car: '<path d="M4 15v-3l2-5h12l2 5v3Z"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/>',
 phone: '<path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
 send: '<path d="M12 19V5M6 11l6-6 6 6"/>',
 clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
 pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
 check: '<path d="m5 12 4 4 10-10"/>',
 alert: '<path d="M12 4 3 20h18Z"/><path d="M12 10v4M12 17v.5"/>'
};
const icon = (name, cls = 'ai-icon') => {
 const s = h('span', cls); s.setAttribute('aria-hidden', 'true');
 s.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">' + ICON[name] + '</svg>';
 return s;
};
const clock = minute => {
 const t = C.clock.startMinutes + minute;
 return String(Math.floor(t / 60) % 24).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
};
const decimal = n => String(n).replace('.', ',');

const MEASURES = Object.freeze([
 ['rr', 'Respirasjon', v => v.rr + ' /min'],
 ['spo2', 'SpO₂', v => v.spo2 + ' % (romluft)'],
 ['hr', 'Puls', v => v.hr + ' /min, ' + v.rhythm],
 ['bp', 'Blodtrykk', v => v.sbp + '/' + v.dbp + ' mmHg'],
 ['temp', 'Temperatur', v => decimal(v.temp.toFixed(1)) + ' °C'],
 ['avpu', 'Bevissthet', v => v.avpu === 'A' ? 'Våken og orientert (A)' : v.avpu],
 ['glucose', 'Blodsukker', v => decimal(v.glucose.toFixed(1)) + ' mmol/L']
]);
const NEWS_KEYS = ['rr', 'spo2', 'hr', 'bp', 'temp', 'avpu'];
const LOOKS = Object.freeze([['skin', 'Hud og sirkulasjon'], ['breathing', 'Pusten'], ['legs', 'Beina'], ['surroundings', 'Rundt henne']]);
const TABS_MOBILE = Object.freeze([['chat', 'Samtale'], ['exam', 'Undersøk'], ['act', 'Tiltak'], ['journal', 'Journal'], ['meds', 'Medisin']]);
const TABS_WIDE = Object.freeze([['exam', 'Undersøk'], ['act', 'Tiltak'], ['journal', 'Journal'], ['meds', 'Medisiner']]);
const ERRORS = {
 login: 'Logg inn for å snakke med AI-pasienten.',
 beta: 'Betakoden din gjelder ikke lenger. Skriv inn ny kode under casene.',
 limit: 'Du har brukt dagens kvote med meldinger. Prøv igjen i morgen.',
 busy: 'Tjenesten har mye å gjøre akkurat nå. Prøv igjen om litt.',
 refusal: 'Svaret ble stoppet. Prøv å si det på en annen måte.',
 messages: 'Samtalen er blitt for lang. Avslutt casen og start på nytt.'
};
const errorText = code => ERRORS[code] || 'Fikk ikke svar. Sjekk nettet og prøv igjen.';
const failure = code => Object.assign(new Error(code), { code });

// ——— Tilstand ———
let S, root, onExit, heading, mobileQuery;
function fresh() {
 const chats = {}, views = {};
 for (const id of ['patient', ...C.contacts.map(c => c.id)]) { chats[id] = []; views[id] = []; }
 return {
  phase: 'alarm', minute: 0, arrivedAt: null, tab: 'chat', side: 'exam', channel: 'patient',
  chats, views, measured: {}, looked: {}, opened: { journal: false, medication: false }, did: {},
  called: {}, ambulanceAt: null, worseShown: false, ambulanceShown: false, newsGuess: null, busy: false,
  readFirst: false, log: [], ai: { state: 'idle', data: null, error: '' }, endedAt: null
 };
}
const worse = () => S.minute >= C.worsensAt;
const vitalsNow = () => (worse() ? C.vitals.after : C.vitals.before);
const isMobile = () => Boolean(mobileQuery?.matches);
// Referatet til AI-tilbakemeldingen: alt som ble sagt og gjort, i rekkefølge.
const note = (who, text) => S.log.push({ minute: S.minute, who, text });
const nameOf = ch => (ch === 'patient' ? 'Randi' : C.contacts.find(c => c.id === ch)?.who || ch);
const event = (text, kind = 'event') => { S.views.patient.push({ kind, minute: S.minute, text }); note('Hendelse', text); };

function tick(n) {
 S.minute += n;
 if (worse() && !S.worseShown) { S.worseShown = true; event(C.events.worse, 'warn'); }
 if (S.ambulanceAt !== null && !S.ambulanceShown && S.minute >= S.ambulanceAt + C.ambulanceAfter) {
  S.ambulanceShown = true; event(C.events.ambulance, 'good');
 }
}

// ——— Kall til tjenesten ———
async function idToken() {
 try { return await window.KartleggAccount?.idToken?.(); } catch (_) { return null; }
}
// Linjen i hakeparentes om tid og tilstand er bare til Claude. Gjentar modellen den, fjernes den
// før svaret vises og før det sendes tilbake i samtalen.
const untag = t => t.replace(/^\s*\[(?:Kl\.|Tid|tilstand)[^\]\n]*\]\s*/i, '').trim();
async function ask(role, messages, onText) {
 const url = service();
 const token = await idToken();
 if (!token && !/^http:\/\/(localhost|127\.0\.0\.1)/.test(url)) throw failure('login');
 const res = await fetch(url.replace(/\/$/, '') + '/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...betaHeader(), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
  body: JSON.stringify({ caseId: C.id, role, messages })
 });
 if (!res.ok) { const e = await res.json().catch(() => ({})); throw failure(e.error || 'http'); }
 const reader = res.body.getReader(), dec = new TextDecoder();
 let buf = '', text = '', ended = false;
 for (;;) {
  const { value, done } = await reader.read();
  if (done) break;
  buf += dec.decode(value, { stream: true });
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
   const line = buf.slice(0, i); buf = buf.slice(i + 1);
   if (!line.trim()) continue;
   let m; try { m = JSON.parse(line); } catch (_) { continue; }
   if (m.t === 'd') { text += m.v; onText(untag(text)); }
   else if (m.t === 'reset') { text = ''; onText(text); }
   else if (m.t === 'refusal') throw failure('refusal');
   else if (m.t === 'err') throw failure(m.msg);
   else if (m.t === 'end') ended = true;
  }
 }
 text = untag(text);
 if (!ended || !text) throw failure('empty');
 return text.slice(0, 1500);
}

async function send(text) {
 text = text.trim().slice(0, MAX_TEXT);
 if (!text || S.busy) return;
 const ch = S.channel;
 if (ch === 'amk' && S.ambulanceAt === null) S.ambulanceAt = S.minute;
 const msg = { role: 'user', text, minute: S.minute, worse: worse(), ambulance: S.ambulanceAt !== null };
 S.chats[ch].push(msg);
 S.views[ch].push({ kind: 'msg', role: 'user', text });
 note('Studenten til ' + nameOf(ch), text);
 const reply = { kind: 'msg', role: 'assistant', text: '', pending: true };
 S.views[ch].push(reply);
 S.busy = true;
 refreshChat();
 try {
  reply.text = await ask(ch, S.chats[ch], t => { reply.text = t; paintPending(reply); });
  S.chats[ch].push({ role: 'assistant', text: reply.text });
  note(nameOf(ch), reply.text);
  tick(C.cost.message);
 } catch (e) {
  S.chats[ch].pop();
  S.log.pop();
  reply.error = errorText(e.code);
  reply.retry = text;
 }
 reply.pending = false;
 S.busy = false;
 refreshChat();
}
// Oppdaterer bare samtalen, ikke hele skjermen, så skrivefeltet beholder fokus og tastaturet blir stående.
function refreshChat() {
 const log = view()?.querySelector('.ai-log');
 if (!log || S.ambulanceShown) { render(); return; }
 log.replaceWith(buildLog());
 view().querySelector('.ai-chips')?.replaceWith(buildChips() || h('div', 'ai-chips'));
 const go = view().querySelector('.ai-send'); if (go) go.disabled = S.busy;
 const time = view().querySelector('.ai-clock'); if (time) { time.replaceWith(clockView()); }
 const foot = view().querySelector('.ai-foot-time'); if (foot) foot.textContent = footText();
 scrollChat();
}
function paintPending(reply) {
 const el = view().querySelector('[data-pending="1"] .ai-bubble-text');
 if (el) { el.textContent = reply.text; scrollChat(); }
}
// Samtalen blir stående nederst ved siste melding, også når tastaturet åpnes og samtalen krymper,
// med mindre du selv har rullet opp for å lese.
let stick = true;
function scrollChat() {
 const log = view()?.querySelector('.ai-log');
 if (log) { log.scrollTop = log.scrollHeight; stick = true; }
}
function keepAtBottom() {
 if (stick && S?.phase === 'scene') requestAnimationFrame(scrollChat);
}
window.visualViewport?.addEventListener('resize', keepAtBottom);
window.addEventListener('resize', keepAtBottom);

// ——— Handlinger ———
function measure(key) {
 const v = vitalsNow(), def = MEASURES.find(m => m[0] === key);
 S.measured[key] = { text: def[2](v), minute: S.minute, worse: worse() };
 event('Du måler ' + def[1].toLowerCase() + ': ' + def[2](v), 'measure');
 tick(C.cost.measure);
 render();
}
function look(key) {
 const f = C.findings[key][worse() ? 'after' : 'before'];
 S.looked[key] = { text: f, minute: S.minute };
 event(f, 'measure');
 tick(C.cost.examine);
 render();
}
function act(a) {
 if (S.did[a.id]) return;
 S.did[a.id] = S.minute;
 event(a.text, a.trap ? 'warn' : 'event');
 tick(C.cost.action);
 render();
}
function call(contact) {
 S.channel = contact.id;
 if (!S.called[contact.id]) { S.called[contact.id] = S.minute; event('Du ringer: ' + contact.label.replace(/^Ring /, '') + '.'); tick(C.cost.call); }
 S.tab = 'chat';
 render();
}
function openTab(id) {
 if (id === 'journal' && !S.opened.journal) { S.opened.journal = true; note('Hendelse', 'Studenten åpnet journalen.'); tick(C.cost.firstJournal); }
 if (id === 'meds' && !S.opened.medication) { S.opened.medication = true; note('Hendelse', 'Studenten åpnet medisinkortet.'); tick(C.cost.firstMedication); }
 if (isMobile()) S.tab = id; else if (id !== 'chat') S.side = id;
 render();
}
function arrive(readFirst) {
 S.minute = readFirst ? C.travel.readFirst : C.travel.direct;
 S.arrivedAt = S.minute;
 S.phase = 'scene';
 event(C.events.arrive);
 render();
}
function confirmFinish() {
 if (S.ambulanceShown || window.confirm('Avslutte casen og se tilbakemeldingen?')) finish();
}
function finish() {
 S.phase = 'debrief';
 S.endedAt = S.minute;
 focus(false);
 saveProgress();
 render();
 root.scrollIntoView?.({ block: 'start', behavior: 'auto' });
 askDebrief();
}
function saveProgress() {
 const r = report();
 try { window.KartleggLearningProgress?.record('sim:' + C.id, 'test', { correct: r.items.filter(x => x.done).length, total: r.items.length }); } catch (_) {}
}
// AI-tilbakemeldingen: ett kall når casen er ferdig. Poengene over regnes fortsatt ut av fasiten.
async function askDebrief() {
 const said = S.log.some(e => e.who.startsWith('Studenten til '));
 if (!said) { S.ai = { state: 'skip', data: null, error: '' }; render(); return; }
 S.ai = { state: 'loading', data: null, error: '' };
 render();
 const r = report();
 const body = {
  caseId: C.id,
  log: S.log.slice(-300),
  checks: r.items.map(i => ({ id: i.id, done: i.keyword })),
  facts: { arrivedAt: S.arrivedAt, readFirst: S.readFirst, called113At: S.called.amk ?? null, endedAt: S.endedAt, newsGuess: S.newsGuess, expectedNews: r.expectedNews }
 };
 try {
  const url = service(), token = await idToken();
  if (!token && !/^http:\/\/(localhost|127\.0\.0\.1)/.test(url)) throw failure('login');
  const res = await fetch(url.replace(/\/$/, '') + '/debrief', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json', ...betaHeader(), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
   body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw failure(data.error || 'http');
  if (!root || S.phase !== 'debrief') return;
  S.ai = { state: 'done', data, error: '' };
  saveProgress();
 } catch (e) {
  if (!root || S.phase !== 'debrief') return;
  S.ai = { state: 'error', data: null, error: errorText(e.code) };
 }
 render();
}

// ——— Tilbakemelding ———
function report() {
 const said = S.chats.patient.filter(m => m.role === 'user').map(m => m.text.toLowerCase()).join(' \n ');
 const amk = S.chats.amk.filter(m => m.role === 'user').map(m => m.text.toLowerCase()).join(' \n ');
 const has = (text, words) => words.some(w => text.includes(w));
 const items = C.debrief.map(d => {
  let done = false, guess = false;
  if (d.ask) { done = has(said, d.ask); guess = true; }
  if (d.orOpened === 'medication' && S.opened.medication) done = true;
  if (d.opened === 'journal') done = S.opened.journal;
  if (d.measuredAll) done = NEWS_KEYS.every(k => S.measured[k]);
  if (d.call) done = S.chats[d.call].some(m => m.role === 'user');
  if (d.not) done = !S.did[d.not];
  if (d.amk) { done = d.amk.every(group => has(amk, group)); guess = true; }
  // Ordsøket er grovt. Har AI-en lest samtalen og kommet til noe annet, gjelder dens vurdering.
  const keyword = done;
  const ai = guess ? S.ai?.data?.checks?.find(x => x.id === d.id) : null;
  if (ai && ai.done !== done) done = ai.done;
  return { ...d, done, guess, keyword, byAI: Boolean(ai && ai.done !== keyword) };
 });
 const latest = NEWS_KEYS.map(k => S.measured[k]).filter(Boolean);
 const expectedNews = latest.length ? C.news2[latest.some(m => m.worse) ? 'after' : 'before'] : null;
 return {
  items,
  callAfter: S.called.amk !== undefined ? S.called.amk - S.arrivedAt : null,
  expectedNews,
  newsGuess: S.newsGuess
 };
}

// ——— Visning ———
// I fokusmodus tegnes casen i en egen boks rett i <body>. Inne i siden kan kort med glasseffekt
// låse «position: fixed» til kortet i stedet for skjermen.
let host = null;
const view = () => (host?.isConnected ? host : root);
function render() {
 if (!root) return;
 const keepScroll = view()?.querySelector('.ai-log')?.scrollTop;
 const on = S.phase === 'scene' && isMobile();
 focus(on);
 root.replaceChildren();
 if (on && !host?.isConnected) { host = h('div', 'ai-focus-host'); document.body.append(host); }
 if (!on && host) { host.remove(); host = null; }
 host?.replaceChildren();
 const wrap = h('div', 'ai-sim ai-phase-' + S.phase);
 if (S.phase === 'alarm') wrap.append(alarmView());
 else if (S.phase === 'choice') wrap.append(choiceView());
 else if (S.phase === 'prep') wrap.append(prepView());
 else if (S.phase === 'debrief') wrap.append(debriefView());
 else wrap.append(sceneView());
 (host || root).append(wrap);
 if (S.phase === 'scene') {
  const log = view().querySelector('.ai-log');
  if (log) log.scrollTop = keepScroll !== undefined && !S.busy && S.tab !== 'chat' ? keepScroll : log.scrollHeight;
 }
}

// Fokusmodus på mobil: casen fyller skjermen, og menylinjen og resten av siden er skjult.
// Høyden følger den synlige delen av skjermen (mobile-ux.js), også når tastaturet er oppe.
function focus(on) {
 document.documentElement.classList.toggle('ai-focus', Boolean(on));
}
function alarmView() {
 const box = h('section', 'ai-card ai-alarm');
 box.setAttribute('role', 'alert');
 const head = h('p', 'ai-alarm-head'); head.append(icon('bell'), h('span', '', C.alarm.title + ' · ' + C.clock.alarmAt));
 box.append(head, h('p', 'ai-alarm-name', C.patient.name + ', ' + C.patient.age + ' år'), h('p', 'ai-alarm-text', C.patient.address + '. ' + C.alarm.text));
 const outer = h('div', 'ai-stack');
 outer.append(box, h('p', 'ai-muted', C.alarm.note));
 outer.append(btn('Svar på alarmen', 'btn btn-primary ai-wide', () => { S.phase = 'choice'; render(); }));
 outer.append(btn('Tilbake til casene', 'ai-link', () => exit()));
 try { navigator.vibrate?.([200, 100, 200]); } catch (_) {}
 return outer;
}

function choiceView() {
 const box = h('section', 'ai-card ai-stack');
 box.append(h('h3', 'ai-title', 'Hva gjør du først?'));
 const a = btn('', 'ai-choice', () => { S.phase = 'prep'; S.readFirst = true; S.opened.journal = true; S.opened.medication = true; render(); });
 a.append(icon('notes'), h('span', 'ai-choice-text', 'Les journal og medisinkort'), h('span', 'ai-choice-meta', 'Fremme kl. ' + clock(C.travel.readFirst)));
 const b = btn('', 'ai-choice', () => arrive(false));
 b.append(icon('car'), h('span', 'ai-choice-text', 'Dra rett ut'), h('span', 'ai-choice-meta', 'Fremme kl. ' + clock(C.travel.direct)));
 box.append(a, b, h('p', 'ai-muted', 'Journalen og medisinkortet kan også åpnes hos pasienten.'));
 const notice = h('p', 'ai-notice');
 notice.append(h('strong', '', 'Om AI-pasienten: '), document.createTextNode('Det Randi og de du ringer svarer, lages av Claude, en AI fra Anthropic. Det du skriver, sendes dit for å lage svaret, og lagres ikke i Kartlegg. Ikke skriv ekte pasientopplysninger. '));
 const link = h('a', '', 'Les personvernerklæringen'); link.href = '#personvern';
 notice.append(link, document.createTextNode('.'));
 box.append(notice);
 return box;
}

function prepView() {
 const box = h('div', 'ai-stack');
 box.append(h('p', 'ai-muted', 'Du leser før du drar. Det tar et par minutter.'));
 box.append(journalPanel(), medsPanel());
 box.append(btn('Dra til Randi', 'btn btn-primary ai-wide', () => arrive(true)));
 return box;
}

function headerView() {
 const head = h('header', 'ai-head');
 const av = h('span', 'ai-avatar', C.patient.initials); av.setAttribute('aria-hidden', 'true');
 const who = h('div', 'ai-who');
 who.append(h('strong', '', C.patient.name), h('span', 'ai-muted', C.patient.age + ' år · ' + C.patient.address));
 head.append(av, who, clockView());
 if (isMobile()) {
  const x = btn('', 'ai-exit', confirmFinish); x.setAttribute('aria-label', 'Avslutt casen'); x.textContent = 'Avslutt';
  head.append(x);
 }
 return head;
}
function clockView() {
 const time = h('span', 'ai-clock' + (worse() ? ' is-worse' : ''));
 time.append(icon('clock'), h('span', '', 'Kl. ' + clock(S.minute)));
 return time;
}
const footText = () => 'Fiktiv case · Kun til øving · ' + S.minute + ' min siden alarmen';

function sceneView() {
 const out = h('div', 'ai-scene');
 out.append(headerView());
 const mob = isMobile();
 if (mob) out.append(tabBar(TABS_MOBILE, S.tab));
 const body = h('div', 'ai-body');
 const panels = { exam: examPanel, act: actPanel, journal: journalPanel, meds: medsPanel };
 if (mob) {
  body.append(S.tab === 'chat' ? chatPanel() : panels[S.tab]());
 } else {
  const side = h('div', 'ai-side');
  side.append(tabBar(TABS_WIDE, S.side), panels[S.side]());
  body.append(chatPanel(), side);
 }
 out.append(body);
 const foot = h('footer', 'ai-foot');
 foot.append(h('span', 'ai-muted ai-foot-time', footText()));
 foot.append(btn('Avslutt casen', 'ai-link', confirmFinish));
 out.append(foot);
 return out;
}

function tabBar(tabs, active) {
 const bar = h('div', 'ai-tabs'); bar.setAttribute('role', 'tablist');
 for (const [id, label] of tabs) {
  const b = btn(label, 'ai-tab' + (id === active ? ' is-active' : ''), () => openTab(id));
  b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(id === active));
  if (id === 'chat' && S.channel !== 'patient') b.append(h('span', 'ai-dot', '●'));
  bar.append(b);
 }
 return bar;
}

function chatPanel() {
 const panel = h('section', 'ai-chat');
 const contact = C.contacts.find(c => c.id === S.channel);
 if (contact) {
  const bar = h('div', 'ai-call');
  const t = h('span', 'ai-call-text'); t.append(icon('phone'), h('span', '', 'I telefonen: ' + contact.who));
  bar.append(t, btn('Legg på', 'ai-hangup', () => { S.channel = 'patient'; render(); }));
  panel.append(bar);
 }
 panel.append(buildLog());
 if (S.ambulanceShown) {
  panel.append(btn('Se tilbakemelding', 'btn btn-primary ai-wide', finish));
  return panel;
 }
 const chips = buildChips();
 if (chips) panel.append(chips);
 const form = h('form', 'ai-input');
 const ta = h('textarea');
 ta.rows = 1; ta.maxLength = MAX_TEXT; ta.placeholder = contact ? 'Si det du vil si i telefonen …' : 'Skriv det du vil si til Randi …';
 ta.setAttribute('aria-label', contact ? 'Det du sier i telefonen' : 'Det du sier til Randi');
 ta.enterKeyHint = 'send';
 ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
 const go = h('button', 'ai-send'); go.type = 'submit'; go.setAttribute('aria-label', 'Send'); go.append(icon('send'));
 go.disabled = S.busy;
 form.addEventListener('submit', e => { e.preventDefault(); const v = ta.value; if (!v.trim() || S.busy) return; ta.value = ''; send(v); });
 form.append(ta, go);
 panel.append(form);
 return panel;
}

// I telefonen: legg inn adresse, målinger og medisiner i skrivefeltet uten å sende, så du kan rette først.
function inserts() {
 const out = [['Adresse', C.patient.name + ', ' + C.patient.age + ' år, ' + C.patient.address + '.']];
 const measured = MEASURES.filter(([k]) => S.measured[k]).map(([k, label]) => label + ' ' + S.measured[k].text);
 if (measured.length) out.push(['Målinger', 'Målt kl. ' + clock(Math.max(...MEASURES.filter(([k]) => S.measured[k]).map(([k]) => S.measured[k].minute))) + ': ' + measured.join(', ') + '.' + (S.newsGuess !== null ? ' NEWS2 ' + S.newsGuess + '.' : '')]);
 const m = C.medication;
 out.push(['Medisiner', 'Faste medisiner: ' + m.fixed.map(x => x.name + ' ' + x.form.replace(/^\S+ /, '') + ' ×' + Object.values(x.times).reduce((a, b) => a + b, 0)).join(', ') + '. ' + m.prn.filter(x => x.lastGiven).map(x => x.name + ' ' + x.form.replace(/^\S+ /, '') + ' gitt ' + x.lastGiven.toLowerCase()).join('. ') + '. Allergier: ' + m.allergies.toLowerCase() + '.']);
 return out;
}
function insert(text) {
 const ta = view().querySelector('.ai-input textarea');
 if (!ta) return;
 const now = ta.value.trimEnd();
 ta.value = (now ? now + ' ' : '') + text;
 ta.focus({ preventScroll: true });
 ta.setSelectionRange(ta.value.length, ta.value.length);
 ta.scrollTop = ta.scrollHeight;
}
function buildChips() {
 if (S.channel !== 'patient') {
  const chips = h('div', 'ai-chips');
  chips.append(h('span', 'ai-chips-label', 'Sett inn:'));
  for (const [label, text] of inserts()) chips.append(btn(label, 'ai-chip ai-insert', () => insert(text)));
  return chips;
 }
 const used = new Set(S.chats.patient.filter(m => m.role === 'user').map(m => m.text));
 const chips = h('div', 'ai-chips');
 for (const q of C.suggestions.filter(q => !used.has(q)).slice(0, 3)) chips.append(btn(q, 'ai-chip', () => send(q)));
 return chips.childElementCount ? chips : null;
}

function buildLog() {
 const contact = C.contacts.find(c => c.id === S.channel);
 const log = h('div', 'ai-log'); log.setAttribute('aria-live', 'polite');
 log.addEventListener('scroll', () => { stick = log.scrollHeight - log.scrollTop - log.clientHeight < 48; }, { passive: true });
 const items = S.views[S.channel];
 if (!items.length) log.append(h('p', 'ai-muted ai-empty', contact ? 'Det ringer … Si hvem du er og hvorfor du ringer.' : 'Snakk med Randi med dine egne ord.'));
 const name = contact ? contact.short : 'Randi';
 for (const it of items) {
  if (it.kind !== 'msg') {
   const ev = h('div', 'ai-event ai-event-' + it.kind);
   ev.append(h('span', 'ai-event-time', clock(it.minute)), h('span', '', it.text));
   log.append(ev); continue;
  }
  const row = h('div', 'ai-msg ' + (it.role === 'user' ? 'is-user' : 'is-them'));
  if (it.pending) row.dataset.pending = '1';
  row.append(h('span', 'ai-msg-who', it.role === 'user' ? 'Du' : name));
  const bubble = h('div', 'ai-bubble');
  const text = h('p', 'ai-bubble-text', it.text);
  if (it.pending && !it.text) { text.classList.add('is-typing'); text.textContent = '…'; }
  bubble.append(text);
  if (it.error) {
   bubble.classList.add('is-error'); text.textContent = it.error;
   if (it.retry) bubble.append(btn('Prøv igjen', 'ai-link', () => { items.splice(items.indexOf(it) - 1, 2); send(it.retry); }));
  }
  row.append(bubble); log.append(row);
 }
 return log;
}

function row(label, value, action) {
 const r = h('div', 'ai-row');
 const l = h('div', 'ai-row-main'); l.append(h('span', 'ai-row-label', label));
 if (value) l.append(h('span', 'ai-row-value', value));
 r.append(l, action);
 return r;
}

function examPanel() {
 const p = h('section', 'ai-panel');
 p.append(h('h3', 'ai-panel-title', 'Vitale målinger'), h('p', 'ai-muted', 'Hver måling tar ett minutt.'));
 for (const [key, label] of MEASURES) {
  const m = S.measured[key];
  p.append(row(label, m ? m.text + ' · kl. ' + clock(m.minute) : '', btn(m ? 'Mål igjen' : 'Mål', 'ai-mini', () => measure(key))));
 }
 const news = h('div', 'ai-news');
 const lab = h('label', '', 'Din NEWS2-skår');
 const inp = h('input'); inp.type = 'number'; inp.inputMode = 'numeric'; inp.min = '0'; inp.max = '20'; inp.id = 'aiNewsGuess';
 lab.htmlFor = inp.id;
 if (S.newsGuess !== null) inp.value = String(S.newsGuess);
 inp.addEventListener('change', () => { const n = parseInt(inp.value, 10); S.newsGuess = Number.isInteger(n) && n >= 0 && n <= 20 ? n : null; if (S.newsGuess !== null) note('Hendelse', 'Studenten skrev inn NEWS2 ' + S.newsGuess + '.'); });
 news.append(lab, inp, h('span', 'ai-muted', 'Rettes i tilbakemeldingen.'));
 p.append(news);
 p.append(h('h3', 'ai-panel-title', 'Se etter'));
 for (const [key, label] of LOOKS) {
  const l = S.looked[key];
  p.append(row(label, l ? l.text : '', btn(l ? 'Se igjen' : 'Se', 'ai-mini', () => look(key))));
 }
 return p;
}

function actPanel() {
 const p = h('section', 'ai-panel');
 p.append(h('h3', 'ai-panel-title', 'Ring'));
 for (const c of C.contacts) {
  const b = btn('', 'ai-call-btn' + (S.channel === c.id ? ' is-active' : ''), () => call(c));
  b.append(icon('phone'), h('span', '', c.label));
  p.append(b);
 }
 p.append(h('h3', 'ai-panel-title', 'Tiltak'));
 for (const a of C.actions) {
  const done = S.did[a.id] !== undefined;
  p.append(row(a.label, done ? 'Gjort kl. ' + clock(S.did[a.id]) : '', done ? h('span', 'ai-done', '✓') : btn('Gjør', 'ai-mini', () => act(a))));
 }
 return p;
}

function journalPanel() {
 const p = h('section', 'ai-panel');
 p.append(h('h3', 'ai-panel-title', 'Tenkt journal · siste 5 notater'));
 const ol = h('ol', 'ai-journal');
 for (const j of C.journal) {
  const li = h('li');
  li.append(h('span', 'ai-journal-when', j.when), h('p', '', j.text));
  ol.append(li);
 }
 p.append(ol);
 return p;
}

function medsPanel() {
 const p = h('section', 'ai-panel');
 p.append(h('h3', 'ai-panel-title', 'Medisinkort · tenkt'));
 const m = C.medication;
 const table = (title, rows, prn) => {
  const sec = h('div', 'ai-meds');
  sec.append(h('h4', '', title));
  const t = h('table', 'ai-meds-table');
  const head = h('tr');
  for (const c of ['Legemiddel', 'Form/styrke', ...(prn ? [] : m.times), 'Dos. tekst']) head.append(h('th', '', c));
  const thead = h('thead'); thead.append(head); t.append(thead);
  const tb = h('tbody');
  for (const r of rows) {
   const tr = h('tr');
   const name = h('td', 'ai-med-name', r.name);
   tr.append(name, h('td', 'ai-med-form', r.form));
   if (!prn) {
    for (const k of m.times) tr.append(h('td', 'ai-med-time', r.times[k] ? String(r.times[k]) : ''));
    tr.append(h('td', 'ai-med-when', 'kl. ' + m.times.filter(k => r.times[k]).join(' · ')));
   }
   const txt = h('td', 'ai-med-text', r.text);
   if (r.lastGiven) txt.append(h('strong', 'ai-med-last', 'Sist gitt: ' + r.lastGiven));
   tr.append(txt); tb.append(tr);
  }
  t.append(tb); sec.append(t);
  return sec;
 };
 p.append(table('Faste legemidler, multidosepakket', m.fixed, false), table('Eventuelle legemidler', m.prn, true));
 p.append(h('p', 'ai-muted', 'Allergier: ' + m.allergies));
 return p;
}

function debriefView() {
 const r = report();
 const done = r.items.filter(x => x.done).length;
 const box = h('section', 'ai-card ai-stack ai-debrief');
 box.append(h('h3', 'ai-title', 'Tilbakemelding'));
 const score = h('div', 'ai-score');
 score.append(h('strong', '', done + ' av ' + r.items.length), h('span', 'ai-muted', 'viktige punkter'));
 const meter = h('div', 'ai-meter'); const fill = h('span'); fill.style.width = Math.round(done / r.items.length * 100) + '%'; meter.append(fill);
 box.append(score, meter);
 const good = h('ul', 'ai-list is-good'), improve = h('ul', 'ai-list is-improve');
 for (const it of r.items) {
  const li = h('li');
  li.append(icon(it.done ? 'check' : 'alert'), h('span', '', (it.done ? it.label : it.miss + '.') + (it.byAI ? ' (vurdert av AI)' : it.done && it.guess && S.ai.state !== 'done' ? ' (ser ut til det)' : '')));
  (it.done ? good : improve).append(li);
 }
 if (good.childElementCount) box.append(h('h4', '', 'Dette gjorde du'), good);
 if (improve.childElementCount) box.append(h('h4', '', 'Dette kan bli bedre'), improve);
 const facts = h('div', 'ai-facts');
 facts.append(h('p', '', r.callAfter === null ? 'Du ringte ikke 113.' : 'Du ringte 113 ' + r.callAfter + ' min etter at du kom.'));
 if (r.expectedNews !== null) {
  const ok = r.newsGuess === r.expectedNews;
  facts.append(h('p', '', 'NEWS2 for målingene dine: ' + r.expectedNews + '. ' + (r.newsGuess === null ? 'Du skrev ikke inn en skår.' : ok ? 'Du hadde riktig skår.' : 'Du skrev ' + r.newsGuess + '.')));
 }
 box.append(facts);
 box.append(aiView());
 const lesson = h('div', 'ai-lesson'); lesson.append(h('strong', '', 'Det viktigste fra casen'), h('p', '', C.lesson));
 box.append(lesson);
 const actions = h('div', 'ai-row-actions');
 actions.append(btn('Prøv casen igjen', 'btn btn-primary', () => { S = fresh(); render(); }), btn('Tilbake til casene', 'btn btn-secondary', () => exit()));
 box.append(actions);
 return box;
}

function aiView() {
 const box = h('section', 'ai-feedback');
 const head = h('div', 'ai-feedback-head');
 head.append(h('h4', '', 'Kommentar fra AI'), h('span', 'ai-muted', 'Kan ta feil'));
 box.append(head);
 const a = S.ai;
 if (a.state === 'loading') { box.classList.add('is-loading'); box.append(h('p', 'ai-muted', 'Leser gjennom samtalen din …')); return box; }
 if (a.state === 'skip') { box.append(h('p', 'ai-muted', 'Du snakket ikke med noen i casen, så det er ingen samtale å kommentere.')); return box; }
 if (a.state === 'error') { box.append(h('p', 'ai-muted', a.error), btn('Prøv igjen', 'ai-link', askDebrief)); return box; }
 if (a.state !== 'done') return box;
 const d = a.data;
 if (d.summary) box.append(h('p', 'ai-feedback-summary', d.summary));
 const part = (title, nodes) => { if (!nodes.length) return; box.append(h('h5', '', title)); const ul = h('ul', 'ai-feedback-list'); nodes.forEach(n => ul.append(n)); box.append(ul); };
 part('Bra', (d.strengths || []).map(s => { const li = h('li'); li.append(h('span', '', s.point)); if (s.quote) li.append(h('q', 'ai-quote', s.quote)); return li; }));
 part('Kan bli bedre', (d.improvements || []).map(s => { const li = h('li'); li.append(h('strong', '', s.point)); if (s.why) li.append(h('span', 'ai-why', s.why)); return li; }));
 part('Spørsmål du kunne stilt', (d.missedQuestions || []).map(q => h('li', 'ai-question', q)));
 for (const [title, text] of [['Tid', d.timing], ['ISBAR til AMK', d.isbar], ['Kommunikasjon', d.communication]]) {
  if (!text) continue;
  box.append(h('h5', '', title), h('p', '', text));
 }
 return box;
}

function exit() {
 focus(false);
 host?.remove(); host = null;
 root = null;
 document.getElementById('page-simulering')?.classList.remove('sim-running', 'ai-running');
 onExit?.();
}

function mount(target, options = {}) {
 root = target; onExit = options.onExit; S = fresh();
 heading = document.getElementById('simHeading');
 if (heading) heading.textContent = C.title;
 document.getElementById('page-simulering')?.classList.add('sim-running', 'ai-running');
 mobileQuery = window.matchMedia?.('(max-width: 760px)');
 mobileQuery?.addEventListener?.('change', () => { if (root && S.tab !== 'chat' && !isMobile()) S.side = S.tab; render(); });
 render();
 root.scrollIntoView?.({ block: 'start', behavior: 'auto' });
}

window.KartleggAISim = Object.freeze({
 available,
 unlock,
 get offered() { return Boolean(service()) && !available(); },
 mount,
 card: Object.freeze({ id: C.id, title: C.title, level: C.level, setting: C.setting, patient: C.patient.name + ', ' + C.patient.age + ' år', focus: C.focus }),
 get state() { return S; }
});
window.dispatchEvent(new CustomEvent('kartlegg:ai-sim-ready'));
