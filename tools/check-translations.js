#!/usr/bin/env node
/* ============================================================
   CI: çeviri bütünlüğü denetimi (tarayıcı gerektirmez).
   Kullanım: node tools/check-translations.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "translations.js"), "utf8");

const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(src + "\n;globalThis.__i18n = window.i18n;", sandbox, { filename: "translations.js" });

const { TRANSLATIONS, SUPPORTED_LANGS } = sandbox.__i18n;
const langs = Object.keys(TRANSLATIONS);
let failures = 0;
const fail = (msg) => { failures++; console.error("✗ " + msg); };

// 1. Dil sayısı ve listesi
if (langs.length !== 12) fail(`Dil sayısı ${langs.length}, beklenen 12`);
const expected = ["en","tr","es","fr","de","pt","it","hi","ar","zh","ja","ru"];
for (const code of expected) if (!langs.includes(code)) fail(`Eksik dil: ${code}`);

// 2. Tüm diller aynı anahtar setine sahip
const ref = Object.keys(TRANSLATIONS.en);
for (const code of langs) {
  const keys = Object.keys(TRANSLATIONS[code]);
  const missing = ref.filter(k => !(k in TRANSLATIONS[code]));
  if (missing.length) fail(`${code}: eksik anahtarlar: ${missing.join(", ")}`);
}

// 3. Boş string yok
for (const code of langs) {
  for (const [k, v] of Object.entries(TRANSLATIONS[code])) {
    if (typeof v === "string" && v.trim() === "") fail(`${code}.${k} boş string`);
  }
}

// 4. Placeholder tutarlılığı
const ph = (s) => (String(s).match(/\{(\w+)\}/g) || []).sort().join(",");
for (const key of ref) {
  const refPh = ph(TRANSLATIONS.en[key]);
  for (const code of langs) {
    if (code === "en") continue;
    if (ph(TRANSLATIONS[code][key]) !== refPh) {
      fail(`${code}.${key} placeholder uyuşmazlığı (en: ${refPh || "yok"})`);
    }
  }
}

// 5. v3 anahtarları
const v3Keys = ["searchPlaceholder","prioNone","prioLow","prioMed","prioHigh",
  "focusBtnAria","focusingOn","clearFocusAria","emptySearch",
  "heatmapHeading","heatmapAria","dataHeading","exportData","importData",
  "importDone","importInvalid","importConfirm","shortcutsTitle",
  "scStartPause","scNew","scHelp","scEdit","scClose"];
for (const code of langs) {
  for (const k of v3Keys) {
    if (!(k in TRANSLATIONS[code])) fail(`${code}.${k} eksik (v3)`);
  }
}

console.log(failures
  ? `\n${failures} hata bulundu.`
  : `✓ ${ref.length} anahtar × ${langs.length} dil — çeviri bütünlüğü tamam.`);
process.exit(failures ? 1 : 0);
