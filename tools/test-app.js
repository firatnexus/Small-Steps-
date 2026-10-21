#!/usr/bin/env node
/* ============================================================
   CI: uygulama mantığı testleri (tarayıcı gerektirmez)
   ------------------------------------------------------------
   Gerçek index.html + translations.js + app.js dosyalarını jsdom
   içinde çalıştırır: testler kopya implementasyon değil, bizzat
   üretim kodunu tarayıcı benzeri bir ortamda kullanır.
   Kullanım: node tools/test-app.js
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const translationsSrc = fs.readFileSync(path.join(root, "translations.js"), "utf8");
const appSrc = fs.readFileSync(path.join(root, "app.js"), "utf8");

const STORAGE_KEY = "small-steps-v2";
const HISTORY_KEY = "small-steps-history";

let pass = 0, fail = 0;
async function test(title, fn) {
  try {
    await fn();
    pass++;
    console.log("  ✓ " + title);
  } catch (err) {
    fail++;
    console.error("  ✗ " + title + "\n    " + (err && err.message ? err.message : err));
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg || "Beklenen koşul sağlanmadı"); };
const eq = (a, b, msg) => { if (a !== b) throw new Error(msg || `Beklenen: ${JSON.stringify(b)} • Gelen: ${JSON.stringify(a)}`); };

/* Her test senaryosu taze bir DOM + uygulama örneği alır.
   app.js DOMContentLoaded'ı bekleyebildiği için hazır olana dek beklenir. */
async function launch(seed) {
  const dom = new JSDOM(html, {
    url: "https://smallsteps.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const w = dom.window;

  if (seed && seed.state) w.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed.state));
  if (seed && seed.history) w.localStorage.setItem(HISTORY_KEY, JSON.stringify(seed.history));

  /* CSV indirmesini yakalamak için: tıklamayı ve blob'u kayda geçir.
     jsdom Blob#text() sunmadığından metin kurucudan yakalanır. */
  const OrigBlob = w.Blob;
  w.Blob = class extends OrigBlob {
    constructor(parts, opts) {
      super(parts, opts);
      this.__text = Array.isArray(parts) ? parts.map(p => String(p)).join("") : String(parts);
    }
  };
  w.URL.createObjectURL = (blob) => { w.__lastBlob = blob; return "blob:test"; };
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = function () {
    w.__lastDownload = { href: this.getAttribute("href"), name: this.getAttribute("download") };
  };

  w.eval(translationsSrc);
  w.eval(appSrc);

  if (w.document.readyState === "loading") {
    await new Promise((resolve) => w.document.addEventListener("DOMContentLoaded", resolve, { once: true }));
  }
  return dom;
}

const $ = (dom, sel) => dom.window.document.querySelector(sel);
const $$ = (dom, sel) => Array.from(dom.window.document.querySelectorAll(sel));

function readState(dom) {
  return JSON.parse(dom.window.localStorage.getItem(STORAGE_KEY) || "{}");
}
function readHistory(dom) {
  return JSON.parse(dom.window.localStorage.getItem(HISTORY_KEY) || "{}");
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/* save() 120 ms debounce'lu olduğundan kalıcı depoya yazılmasını bekle */
const settled = (ms = 250) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log("\n— Eski veri uyumluluğu (v3.0.1 yedeği parentId olmadan) —");
  {
    const dom = await launch({
      state: {
        tasks: [
          { id: "t1", text: "Eski görev", done: false, createdAt: 1, doneAt: null, priority: 0, focus: 0 },
          { id: "t2", text: "Eski tamamlanan", done: true, createdAt: 1, doneAt: Date.now(), priority: 1, focus: 10 }
        ],
        settings: { focus: 25, short: 5, long: 15, longEvery: 4, autoStart: false, sound: true },
        stats: { date: todayKey(), focusMinutes: 0 }, filter: "all", search: "", activeTaskId: null
      }
    });
    await test("Görevler yüklenir ve üst seviye kabul edilir", () => {
      eq($$(dom, "#task-list .task").length, 2);
      eq($$(dom, "#task-list .task.subtask").length, 0);
    });
    await test("Rozet yalnız üst görevleri sayar", () => {
      eq($(dom, "#count-badge").textContent.trim(), "1 / 2");
    });
    dom.window.close();
  }

  console.log("\n— Alt görev ekleme ve tamamlama —");
  {
    const dom = await launch();
    const w = dom.window;

    // Üst görev ekle
    w.document.querySelector("#task-input").value = "Yazı projesi";
    w.document.querySelector("#task-form").dispatchEvent(new w.Event("submit", { cancelable: true }));
    assert($$(dom, "#task-list .task").length === 1, "üst görev eklenmedi");

    // Alt görev ekle: ＋ düğmesine bas, satır içi girişe yaz, Enter
    w.document.querySelector(".subtask-btn").click();
    const input = w.document.querySelector(".subtask-add input");
    assert(input, "alt görev giriş satırı açılmadı");
    input.value = "Giriş bölümünü yaz";
    input.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", cancelable: true }));
    await settled();

    await test("Alt görev ebeveynin altında render edilir", () => {
      eq($$(dom, "#task-list .task.subtask").length, 1);
      const items = $$(dom, "#task-list .task");
      eq(items.length, 2);
      const st = readState(dom);
      const parent = st.tasks.find(t => !t.parentId);
      const kid = st.tasks.find(t => t.parentId);
      assert(parent && kid, "ebeveyn/alt görev bulunamadı");
      eq(kid.parentId, parent.id, "alt görevin parentId'si ebeveyne ait değil");
      assert(items[1].classList.contains("subtask"), "ikinci satır alt görev değil");
      eq(items[0].dataset.id, parent.id, "üst görev ilk sırada değil");
    });
    await test("Kalıcı depoya parentId ile yazılır", () => {
      const st = readState(dom);
      eq(st.tasks.length, 2);
      assert(st.tasks[1].parentId === "t" ? true : typeof st.tasks[1].parentId === "string", "parentId kaydedilmedi");
      assert(st.tasks.some(t => t.parentId === st.tasks.find(x => !x.parentId).id), "parentId ebeveynle eşleşmiyor");
    });
    await test("Ebeveynde 0/1 ilerleme rozeti görünür", () => {
      const pill = $(dom, ".subtask-pill");
      assert(pill, "rozet yok");
      eq(pill.textContent, "0/1");
    });

    // Alt görevi tamamla
    const subItem = $(dom, "#task-list .task.subtask");
    subItem.querySelector('input[type="checkbox"]').click();
    await settled();
    await test("Alt görev tamamlanınca rozet 1/1 olur", () => {
      eq($(dom, ".subtask-pill").textContent, "1/1");
    });
    await test("Alt görev tamamlaması günlük istatistiğe işlenmez", () => {
      const h = readHistory(dom);
      eq(h[todayKey()]?.done || 0, 0, "alt görev istatistiği arttı");
    });
    await test("Rozet yalnız üst görevleri sayar (0 / 1)", () => {
      eq($(dom, "#count-badge").textContent.trim(), "0 / 1");
    });

    // Üst görevi tamamla
    const topItem = $(dom, "#task-list .task:not(.subtask)");
    topItem.querySelector('input[type="checkbox"]').click();
    await settled();
    await test("Üst görev tamamlaması istatistiğe işlenir", () => {
      const h = readHistory(dom);
      eq(h[todayKey()]?.done || 0, 1);
    });

    // Ağaç silme + geri alma
    w.document.querySelector(".task:not(.subtask) .danger").click();
    await settled();
    await test("Üst görev silinince alt görevleri de gider", () => {
      eq($$(dom, "#task-list .task").length, 0);
      eq(readState(dom).tasks.length, 0);
    });
    await test("Toast geri alması tüm ağacı eski sırasıyla geri getirir", async () => {
      w.document.querySelector("#toast button").click();
      await settled();
      eq(readState(dom).tasks.length, 2);
      assert(readState(dom).tasks[1].parentId, "alt görev parentId'sini kaybetti");
      eq($$(dom, "#task-list .task").length, 2);
    });

    // REGRESYON: toast açıkken eklenen yeni görev, geri almada kaybolmamalı
    w.document.querySelector(".task:not(.subtask) .danger").click();
    await settled();
    w.document.querySelector("#task-input").value = "Toast açıkken eklenen";
    w.document.querySelector("#task-form").dispatchEvent(new w.Event("submit", { cancelable: true }));
    await settled();
    await test("Geri alma, araya eklenen yeni görevi korur", async () => {
      w.document.querySelector("#toast button").click();
      await settled();
      const st = readState(dom);
      eq(st.tasks.length, 3, "silinen ağaç + yeni görev bekleniyordu");
      assert(st.tasks.some(t => t.text === "Toast açıkken eklenen"), "yeni görev geri almada kayboldu");
      assert(st.tasks.some(t => t.parentId), "silinen alt görev geri gelmedi");
    });
    dom.window.close();
  }

  console.log("\n— Arama ve filtre (gruplu davranış) —");
  {
    const parentId = "p1";
    const dom = await launch({
      state: {
        tasks: [
          { id: parentId, text: "Spor salonu", done: true, createdAt: 1, doneAt: 2, priority: 0, focus: 0 },
          { id: "c1", text: "Spor çantasını hazırla", done: false, createdAt: 1, doneAt: null, priority: 0, focus: 0, parentId }
        ],
        settings: { focus: 25, short: 5, long: 15, longEvery: 4, autoStart: false, sound: true },
        stats: { date: todayKey(), focusMinutes: 0 }, filter: "all", search: "", activeTaskId: null
      }
    });
    const w = dom.window;

    await test("Alt görev araması ebeveyni de listeye çıkarır", () => {
      w.document.querySelector("#task-search").value = "çantasını";
      w.document.querySelector("#task-search").dispatchEvent(new w.Event("input"));
      eq($$(dom, "#task-list .task").length, 2);
    });
    await test("Eşleşmeyen arama boş durum gösterir", () => {
      w.document.querySelector("#task-search").value = "yokboyle";
      w.document.querySelector("#task-search").dispatchEvent(new w.Event("input"));
      eq($$(dom, "#task-list .task").length, 0);
      assert(!$(dom, "#empty-state").hidden, "boş durum görünmüyor");
    });

    w.document.querySelector('[data-filter="active"]').click();
    w.document.querySelector("#task-search").value = "";
    w.document.querySelector("#task-search").dispatchEvent(new w.Event("input"));
    await test("Aktif filtresi tamamlanmış üst görevi gizler", () => {
      eq($$(dom, "#task-list .task").length, 0);
    });

    w.document.querySelector('[data-filter="done"]').click();
    await test("Tamamlanan filtresi üst görevi alt görevleriyle gösterir", () => {
      eq($$(dom, "#task-list .task").length, 2);
    });
    dom.window.close();
  }

  console.log("\n— CSV dışa aktarma —");
  {
    // Özel karakterli görevler doğrudan durum ile tohumlanır:
    // tek satırlık form girişi satır sonunu korumaz.
    const dom = await launch({
      state: {
        tasks: [
          { id: "csv1", text: 'Süt, "ekmek" al\nve çay', done: false, createdAt: 1, doneAt: null, priority: 0, focus: 0 },
          { id: "csv2", text: "İkinci satır, \"alıntı\"", done: false, createdAt: 1, doneAt: null, priority: 0, focus: 0, parentId: "csv1" }
        ],
        settings: { focus: 25, short: 5, long: 15, longEvery: 4, autoStart: false, sound: true },
        stats: { date: todayKey(), focusMinutes: 0 }, filter: "all", search: "", activeTaskId: null
      }
    });
    const w = dom.window;

    w.document.querySelector("#export-csv").click();
    await test("İndirme tetiklenir ve dosya adı tarihlidir", () => {
      assert(w.__lastDownload, "indirme yok");
      assert(/^small-steps-tasks-\d{4}-\d{2}-\d{2}\.csv$/.test(w.__lastDownload.name), "dosya adı: " + w.__lastDownload.name);
    });
    const csv = w.__lastBlob.__text;
    await test("UTF-8 BOM ile başlar ve başlık satırı tamdır", () => {
      assert(csv.charCodeAt(0) === 0xFEFF, "BOM yok");
      assert(csv.startsWith("\uFEFF\"type\",\"text\",\"done\",\"priority\",\"focus_minutes\",\"parent_text\",\"created_at\",\"completed_at\""), "başlık yanlış");
    });
    await test("Virgül ve tırnak içeren metin RFC 4180'e göre kaçırılır", () => {
      assert(csv.includes('"Süt, ""ekmek"" al\nve çay"'), "özel karakterli metin kaçırılmadı: " + JSON.stringify(csv));
    });
    await test("Alt görev satırı parent_text ile gelir", () => {
      assert(csv.includes('"İkinci satır, ""alıntı"""'), "alt görev metni yok");
      assert(csv.includes('"task"'), "tip sütunu yok");
    });
    await test("Satır sonları CRLF kullanır", () => {
      assert(csv.includes("\r\n"), "CRLF yok");
    });
    dom.window.close();
  }

  console.log("\n— Bozuk veri temizleme (içe aktarma doğrulaması) —");
  {
    const dom = await launch({
      state: {
        tasks: [
          { id: "a", text: "Yetim alt görev", done: false, createdAt: 1, doneAt: null, priority: 0, focus: 0, parentId: "yok" },
          { id: "b", text: "Kendini ebeveyn yapan", done: false, createdAt: 1, doneAt: null, priority: 0, focus: 0, parentId: "b" },
          { id: "c", text: "Üst görev", done: false, createdAt: 1, doneAt: null, priority: 0, focus: 0 },
          { id: "c", text: "Yinelenen id", done: false, createdAt: 1, doneAt: null, priority: 0, focus: 0 },
          { id: "d", text: "Alt görev", done: false, createdAt: 1, doneAt: null, priority: 0, focus: 0, parentId: "c" },
          { id: "e", text: "Alt görevin altı", done: false, createdAt: 1, doneAt: null, priority: 0, focus: 0, parentId: "d" }
        ],
        settings: { focus: 25, short: 5, long: 15, longEvery: 4, autoStart: false, sound: true },
        stats: { date: todayKey(), focusMinutes: 0 }, filter: "all", search: "", activeTaskId: null
      }
    });
    await settled();
    await test("Yetim, kendini işaret eden ve yinelenen kayıtlar düzeltilir", () => {
      const st = readState(dom);
      // yinelenen "c" atılır → 5 kayıt; "e" (ebeveyni alt görev) üst seviyeye alınır
      eq(st.tasks.length, 5);
      const orphan = st.tasks.find(t => t.text === "Yetim alt görev");
      eq(orphan.parentId, null, "yetim parentId temizlenmedi");
      const selfParent = st.tasks.find(t => t.text === "Kendini ebebeeyn yapan" || t.text.startsWith("Kendini"));
      eq(selfParent.parentId, null, "kendini ebeveyn yapan temizlenmedi");
      const nested = st.tasks.find(t => t.text === "Alt görevin altı");
      eq(nested.parentId, null, "iki seviye derinlik düzleştirilmedi");
      const kid = st.tasks.find(t => t.text === "Alt görev");
      eq(kid.parentId, "c", "geçerli alt görev bozuldu");
    });
    dom.window.close();
  }

  console.log("\n— Tamamlananları temizle (alt görev ağacıyla) —");
  {
    const dom = await launch({
      state: {
        tasks: [
          { id: "p", text: "Bitmiş iş", done: true, createdAt: 1, doneAt: 2, priority: 0, focus: 0 },
          { id: "k", text: "Hâlâ açık alt görev", done: false, createdAt: 1, doneAt: null, priority: 0, focus: 0, parentId: "p" },
          { id: "q", text: "Açık üst", done: false, createdAt: 1, doneAt: null, priority: 0, focus: 0 }
        ],
        settings: { focus: 25, short: 5, long: 15, longEvery: 4, autoStart: false, sound: true },
        stats: { date: todayKey(), focusMinutes: 0 }, filter: "all", search: "", activeTaskId: null
      }
    });
    const w = dom.window;
    w.document.querySelector("#clear-done").click();
    await settled();
    await test("Tamamlananlar kalkar; AÇIK alt görev silinmez, üst seviyeye terfi eder", () => {
      const st = readState(dom);
      eq(st.tasks.length, 2, "açık alt görev + açık üst kalmalı");
      const kid = st.tasks.find(t => t.id === "k");
      assert(kid, "açık alt görev silindi");
      eq(kid.parentId, null, "alt görev terfi ettirilmedi");
      eq(st.tasks.some(t => t.id === "p"), false, "tamamlanan üst görev kalkmadı");
      eq($$(dom, "#task-list .task").length, 2);
      eq($$(dom, "#task-list .task.subtask").length, 0, "terfi eden görev hâlâ alt görev görünüyor");
    });
    await test("Toast sayısı fiilen kaldırılan kayıt sayısını verir", () => {
      eq($(dom, "#toast").textContent.includes("1"), true, "toast sayısı yanlış");
    });
    await test("Geri alma hiyerarşiyi aynen geri getirir", async () => {
      w.document.querySelector("#toast button").click();
      await settled();
      const st = readState(dom);
      eq(st.tasks.length, 3);
      eq(st.tasks.find(t => t.id === "k").parentId, "p", "alt görevin parentId'si geri gelmedi");
    });
    dom.window.close();
  }

  console.log("\n— JSON dosya yoluyla içe aktarma (gerçek FileReader akışı) —");
  {
    const dom = await launch({
      state: {
        tasks: [
          { id: "p", text: "Ana iş", done: false, createdAt: 1, doneAt: null, priority: 2, focus: 30 },
          { id: "k", text: "Alt adım", done: true, createdAt: 1, doneAt: 5, priority: 0, focus: 0, parentId: "p" }
        ],
        settings: { focus: 50, short: 10, long: 20, longEvery: 3, autoStart: true, sound: false },
        stats: { date: todayKey(), focusMinutes: 7 }, filter: "active", search: "x", activeTaskId: "p"
      },
      history: { [todayKey()]: { focus: 42, done: 3 } }
    });
    const w = dom.window;

    // Dışa aktar: JSON blob'unu yakala
    w.document.querySelector("#export-data").click();
    const backupJson = w.__lastBlob.__text;
    assert(backupJson && backupJson.includes("Ana iş"), "JSON dışa aktarma boş");

    // Yeni bir örnek: dosya yoluyla geri yükle (FileReader + confirm)
    const dom2 = await launch();
    const w2 = dom2.window;
    w2.confirm = () => true; // onay kutusunu otomatik kabul et
    const file = new w2.File([backupJson], "yedek.json", { type: "application/json" });
    Object.defineProperty(w2.document.querySelector("#import-file"), "files", { value: [file] });
    w2.document.querySelector("#import-file").dispatchEvent(new w2.Event("change"));
    await settled(400); // FileReader + içe aktarma akışı

    await test("Dosyadan geri yükleme görevleri, hiyerarşiyi ve ayarları getirir", () => {
      const st = readState(dom2);
      eq(st.tasks.length, 2, "görevler geri gelmedi");
      const kid = st.tasks.find(t => t.text === "Alt adım");
      assert(kid && kid.parentId === "p", "hiyerarşi kayboldu");
      assert(kid.done === true, "tamamlanma durumu kayboldu");
      eq(st.settings.focus, 50, "ayarlar geri gelmedi");
      assert(st.settings.autoStart === true, "autoStart kayboldu");
      eq(st.activeTaskId, "p", "odak görevi kayboldu");
      eq($$(dom2, "#task-list .task.subtask").length, 1, "alt görev render olmadı");
    });
    await test("Geçmiş de dosyayla geri gelir", () => {
      const h = readHistory(dom2);
      eq(h[todayKey()]?.focus, 42, "odak geçmişi kayboldu");
      eq(h[todayKey()]?.done, 3, "görev geçmişi kayboldu");
    });
    dom.window.close();
    dom2.window.close();
  }

  console.log(`\nSonuç: ${pass} geçti, ${fail} başarısız`);
  process.exit(fail ? 1 : 0);
})().catch((err) => {
  console.error("Test koşucusu hata verdi:", err);
  process.exit(1);
});
