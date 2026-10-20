'use strict';
// Contracts for the consolidated stylesheet structure in assets/css/.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const css = require('./css-helper.cjs');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const EXPECTED = ['00-tokens.css', '01-base.css', '02-layout.css', '03-components.css', '04-profile.css', '05-assessment.css',
  '06-tools.css', '07-simulation.css', '08-learning.css', '09-decor.css', '10-themes.css', '11-clinical.css', '12-account.css', '13-public.css'];

test('index.html loads exactly the numbered design-system files, in order', () => {
  const links = [...html.matchAll(/<link rel="stylesheet" href="assets\/([^"?]+)(?:\?[^"]*)?">/g)].map(m => m[1]);
  assert.deepEqual(links, EXPECTED.map(f => 'css/' + f));
  assert.deepEqual(css.files(), EXPECTED);
});

test('the old version-layered stylesheets are gone', () => {
  const leftovers = fs.readdirSync(path.join(root, 'assets')).filter(f => f.endsWith('.css'));
  assert.deepEqual(leftovers, [], 'all styles belong in assets/css/');
  for (const old of ['style.css', 'enhancements.css']) assert.ok(!fs.existsSync(path.join(root, old)), old + ' should be removed from the root');
});

test('tokens define the shared scale for spacing, radius, controls and shadows', () => {
  const tokens = css.group('tokens');
  for (const token of ['--ui-space-1:', '--ui-radius-control:', '--ui-control-height:', '--ui-shadow-card:',
    '--bg:', '--paper:', '--ink:', '--muted:', '--line:', '--accent:'])
    assert.ok(tokens.includes(token), token);
});

test('service themes, glass surfaces and seasonal decoration each have one home', () => {
  const themes = css.group('themes'), decor = css.group('decor');
  for (const theme of ['hospital', 'ambulance', 'urgent', 'homecare']) assert.ok(themes.includes('data-service-theme="' + theme + '"'), theme);
  assert.match(themes, /data-surface-style="glass"/);
  for (const season of ['halloween', 'christmas', 'breast-cancer', 'mental-health', 'pride'])
    assert.ok(decor.includes('data-season-theme="' + season + '"'), season);
  assert.match(decor, /pointer-events:none/);
});

test('clinical status colours have their own last layer and are never set by themes or decoration', () => {
  const clinical = css.group('clinical');
  for (const sel of ['.score.warning', '.score.danger', '.score.ok', '.news-alert', '.point-3']) assert.ok(clinical.includes(sel), sel);
  for (const name of ['themes', 'decor']) {
    const layer = css.group(name);
    for (const clinical of ['.score.warning', '.score.danger', '.score.ok', '.news-alert', '.point-3', '.v10-part-score.critical', '.abcde-v099-emergency'])
      assert.ok(!layer.includes(clinical), name + ' must not restyle clinical state ' + clinical);
  }
});

test('accessibility media queries are kept', () => {
  const all = css.all();
  assert.match(all, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(all, /@media\(forced-colors:active\)/);
  assert.match(all, /prefers-reduced-transparency:reduce/);
  assert.match(all, /\.skip-link:focus/);
  assert.match(all, /min-height:44px/);
});

test('mobile drawer overlays content and locks scrolling', () => {
  const all = css.all();
  assert.match(all, /\.sidebar\{[^}]*z-index:90/);
  assert.match(all, /\.sidebar-backdrop\{[^}]*z-index:80/);
  assert.match(all, /body\.mobile-menu-open\{[^}]*overflow:hidden/);
});

test('tool cards share one layout and one icon per tool', () => {
  const tools = css.group('tools');
  for (const part of ['.tool-card-head', '.tool-card-icon', '.tool-card-footer', '.tool-card-primary', '.tool-card-actions'])
    assert.ok(tools.includes(part), part);
  const icons = fs.readFileSync(path.join(root, 'assets', 'icon-system.js'), 'utf8');
  const map = icons.match(/const toolIcons=Object\.freeze\(\{([^}]*)\}\)/)[1];
  const names = [...map.matchAll(/:'([\w-]+)'/g)].map(m => m[1]);
  assert.equal(names.length, 18, 'one icon per tool');
  assert.equal(new Set(names).size, 18, 'every tool icon is unique');
  for (const name of names) assert.match(icons, new RegExp('\\b' + name + ":'<"), 'icon path missing: ' + name);
  const cards = fs.readFileSync(path.join(root, 'assets', 'tool-cards.js'), 'utf8');
  assert.match(cards, /KartleggToolCards/);
  assert.doesNotMatch(cards, /\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB)\b/);
});
