#!/usr/bin/env node
// scripts/check-content.js — keeps content.config.js and the pages in sync.
//
//   node scripts/check-content.js                  drift check (run before every commit)
//   node scripts/check-content.js --list           print every slot with where it is used
//   node scripts/check-content.js --baseline REF   also prove the pages are byte-identical
//                                                  to git REF once the overlay markers are
//                                                  stripped (phase-1 acceptance test)
//
// Drift check rules:
//   - every id in content.config.js is used by at least one page
//   - every data-content="<id>" on a page names an id in the config
//   - image slots sit only on <picture> or <img>; no other type does
//   - richtext slots carry data-content-html; no other type does
//   - config entries are well-formed (unique ids, known type, money => confirm,
//     text-like => maxLength)
//
// No dependencies. Exit code is non-zero on any failure.

'use strict';

var fs = require('fs');
var path = require('path');
var execFileSync = require('child_process').execFileSync;

var ROOT = path.resolve(__dirname, '..');
var CONFIG = require(path.join(ROOT, 'content.config.js')).CONTENT_SLOTS;
var TYPES = { text: 1, richtext: 1, image: 1, money: 1, number: 1 };
var ID_RE = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/;

var args = process.argv.slice(2);
var listMode = args.indexOf('--list') !== -1;
var baselineIdx = args.indexOf('--baseline');
var baseline = baselineIdx !== -1 ? args[baselineIdx + 1] : null;

var errors = [];
function fail(msg) { errors.push(msg); }

// ---- 1. config shape --------------------------------------------------------

var byId = {};
CONFIG.forEach(function (s, i) {
  var where = 'content.config.js entry ' + i + ' (' + (s && s.id) + ')';
  if (!s || typeof s.id !== 'string' || !ID_RE.test(s.id)) return fail(where + ': id must be dotted group.name form');
  if (byId[s.id]) fail(where + ': duplicate id');
  byId[s.id] = s;
  if (!s.label) fail(where + ': missing label');
  if (!s.group) fail(where + ': missing group');
  if (!TYPES[s.type]) fail(where + ': unknown type "' + s.type + '"');
  if (s.type === 'money' && s.confirm !== true) fail(where + ': money slots must set confirm: true');
  if (s.type !== 'image' && !(typeof s.maxLength === 'number' && s.maxLength > 0)) fail(where + ': maxLength required for ' + s.type);
  if (s.type === 'image' && s.maxLength != null) fail(where + ': image slots have no maxLength');
});

// ---- 2. page usage ----------------------------------------------------------

var pages = fs.readdirSync(ROOT).filter(function (f) { return /\.html$/.test(f); }).sort();
var uses = {}; // id -> [file:line]
var TAG_RE = /<([a-zA-Z0-9]+)\b([^>]*?)>/g;

pages.forEach(function (file) {
  var html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  var m;
  while ((m = TAG_RE.exec(html))) {
    var tag = m[1].toLowerCase();
    var attrs = m[2];
    var idMatch = /\sdata-content="([^"]*)"/.exec(attrs);
    var hasHtml = /\sdata-content-html(?=[\s>]|$)/.test(attrs);
    if (!idMatch && !hasHtml) continue;
    var line = html.slice(0, m.index).split('\n').length;
    var loc = file + ':' + line;
    if (!idMatch) { fail(loc + ': data-content-html without data-content'); continue; }
    var id = idMatch[1];
    var def = byId[id];
    if (!def) { fail(loc + ': data-content="' + id + '" is not in content.config.js'); continue; }
    (uses[id] = uses[id] || []).push(loc);
    var isImgTag = tag === 'picture' || tag === 'img';
    if (def.type === 'image' && !isImgTag) fail(loc + ': image slot "' + id + '" must be on <picture> or <img>, found <' + tag + '>');
    if (def.type !== 'image' && isImgTag) fail(loc + ': "' + id + '" is type ' + def.type + ' but sits on <' + tag + '>');
    if (def.type === 'richtext' && !hasHtml) fail(loc + ': richtext slot "' + id + '" needs data-content-html');
    if (def.type !== 'richtext' && hasHtml) fail(loc + ': "' + id + '" is type ' + def.type + ' but has data-content-html');
  }
});

CONFIG.forEach(function (s) {
  if (s && s.id && byId[s.id] === s && !uses[s.id]) fail('content.config.js: "' + s.id + '" is never used by any page');
});

// ---- 3. optional: byte-identical to a baseline once markers are stripped ------

function stripMarkers(html) {
  return html
    .replace(/<script src="js\/content\.js" defer><\/script>\n/g, '')
    .replace(/ data-content="[^"]*"/g, '')
    .replace(/ data-content-html(?=[\s>])/g, '')
    // wrapper <span>s added around a price or number inside running text; the
    // same strip is applied to the baseline so pre-existing bare spans cancel out
    .replace(/<span>/g, '')
    .replace(/<\/span>/g, '');
}

var identical = null;
if (baseline) {
  identical = true;
  pages.forEach(function (file) {
    var before;
    try {
      before = execFileSync('git', ['show', baseline + ':' + file], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 24 });
    } catch (e) {
      fail(file + ': cannot read ' + baseline + ':' + file + ' from git');
      identical = false;
      return;
    }
    var after = fs.readFileSync(path.join(ROOT, file), 'utf8');
    var a = stripMarkers(before), b = stripMarkers(after);
    if (a !== b) {
      identical = false;
      var i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      var line = a.slice(0, i).split('\n').length;
      fail(file + ': differs from ' + baseline + ' beyond the overlay markers, first at line ' + line +
        '\n    baseline: ' + JSON.stringify(a.slice(Math.max(0, i - 40), i + 60)) +
        '\n    current:  ' + JSON.stringify(b.slice(Math.max(0, i - 40), i + 60)));
    }
  });
}

// ---- 4. report ----------------------------------------------------------------

if (listMode) {
  var groups = {};
  CONFIG.forEach(function (s) { (groups[s.group] = groups[s.group] || []).push(s); });
  Object.keys(groups).forEach(function (g) {
    console.log('\n## ' + g + ' (' + groups[g].length + ')');
    groups[g].forEach(function (s) {
      var extra = [s.type];
      if (s.maxLength) extra.push('max ' + s.maxLength);
      if (s.confirm) extra.push('confirm');
      console.log('  ' + s.id + '  [' + extra.join(', ') + ']  ' + s.label);
      console.log('      ' + (uses[s.id] || ['UNUSED']).join(', '));
      if (s.help) console.log('      ' + s.help);
    });
  });
  console.log('');
}

var slotCount = CONFIG.length;
var useCount = Object.keys(uses).reduce(function (n, k) { return n + uses[k].length; }, 0);
console.log(slotCount + ' slots in content.config.js, ' + useCount + ' data-content markers across ' + pages.length + ' pages');
if (baseline) console.log(identical ? 'Pages are byte-identical to ' + baseline + ' once overlay markers are stripped' : 'Pages DIFFER from ' + baseline);

if (errors.length) {
  console.error('\n' + errors.length + ' problem(s):');
  errors.forEach(function (e) { console.error('  - ' + e); });
  process.exit(1);
}
console.log('OK');
