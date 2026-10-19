'use strict';
// Shared helper for tests that inspect Kartlegg's stylesheets.
// The design system lives in assets/css/ as numbered files that index.html loads in order.
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'assets', 'css');

function files() {
  return fs.readdirSync(dir).filter(name => /^\d\d-[a-z-]+\.css$/.test(name)).sort();
}

// Remove comments and formatting so assertions can match declarations compactly,
// e.g. ".sidebar{z-index:90".
function compact(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s*!important/g, '!important')
    .replace(/@media \(/g, '@media(')
    .replace(/@supports \(/g, '@supports(')
    .trim();
}

function read(name) {
  return fs.readFileSync(path.join(dir, name), 'utf8');
}

// One file (by group name such as "tokens" or "themes"), compacted.
function group(name) {
  const file = files().find(f => f.slice(3, -4) === name);
  if (!file) throw new Error('Missing stylesheet group: ' + name);
  return compact(read(file));
}

// Every stylesheet in load order, compacted.
function all() {
  return files().map(f => compact(read(f))).join('\n');
}

module.exports = { files, compact, group, all, dir };
