/* ============================================================
   Minik Adımlar · app.js
   ============================================================ */
(() => {
  "use strict";

  const { t, getLang, detectInitialLang, applyLanguage, setLanguage,
          onLanguageChange, buildLangSelect } = window.i18n;

  /* ---------- Sabitler ---------- */
  const STORAGE_KEY   = "small-steps-v2";
  const TASKS_KEY_V1  = "small-steps-tasks-v1";
  const THEME_KEY     = "small-steps-theme";
  const HISTORY_KEY   = "small-steps-history";

  const RING_R = 100;
  const RING_C = 2 * Math.PI * RING_R;

  const DEFAULT_SETTINGS = {
    focus: 25, short: 5, long: 15, longEvery: 4,
    autoStart: false, sound: true
  };

  const THEMES = ["light", "dark", "sepia", "contrast"];
  const THEME_ICONS = { light: "☀️", dark: "🌙", sepia: "📜", contrast: "◐" };
  const THEME_META_COLORS = {
    light: "#f5f7f2", dark: "#0e1512", sepia: "#f4ecd8", contrast: "#000000"
  };
  const THEME_I18N = {
    light: "themeLight", dark: "themeDark",
    sepia: "themeSepia", contrast: "themeContrast"
  };

  /* ---------- Yardımcılar ---------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const todayKey = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const formatClock = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const clampInt = (v, min, max, fb) => {
    const n = Math.round(Number(v));
    if (!Number.isFinite(n)) return fb;
    return Math.min(max, Math.max(min, n));
  };

  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  /* ---------- DOM ---------- */
  const els = {
    langSelect:  $("#lang-select"),
    themeToggle: $("#theme-toggle"),
    form:        $("#task-form"),
    input:       $("#task-input"),
    list:        $("#task-list"),
    empty:       $("#empty-state"),
    count:       $("#task-count"),
    badge:       $("#count-badge"),
    progress:    $("#progress-fill"),
    filters:     $("#filters"),
    clearDone:   $("#clear-done"),
    clock:       $("#clock"),
    ring:        $("#ring-fill"),
    dots:        $("#cycle-dots"),
    modeChips:   $("#mode-chips"),
    note:        $("#timer-note"),
    startPause:  $("#start-pause"),
    reset:       $("#reset"),
    skip:        $("#skip"),
    toast:       $("#toast"),
    statsLine:   $("#stats-line"),
    setFocus:    $("#set-focus"),
    setShort:    $("#set-short"),
    setLong:     $("#set-long"),
    setEvery:    $("#set-every"),
    setAuto:     $("#set-auto"),
    setSound:    $("#set-sound"),
    // İstatistik
    weekChart:   $("#week-chart"),
    weekBadge:   $("#week-badge"),
    statFocus:   $("#stat-focus-week"),
    statTasks:   $("#stat-tasks-week"),
    statStreak:  $("#stat-streak")
  };

  /* ---------- Durum ---------- */
  function normalizeTask(raw) {
    if (!raw || typeof raw !== "object") return null;
    const text = typeof raw.text === "string" ? raw.text.trim().slice(0, 120) : "";
    if (!text) return null;
    return {
      id: typeof raw.id === "string" && raw.id ? raw.id : uid(),
      text, done: raw.done === true,
      createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now(),
      doneAt: Number.isFinite(raw.doneAt) ? raw.doneAt : (raw.done ? Date.now() : null)
    };
  }

  function loadState() {
    const fallback = {
      tasks: [], settings: { ...DEFAULT_SETTINGS },
      stats: { date: todayKey(), focusMinutes: 0 }, filter: "all"
    };

    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch {}

    if (!raw || typeof raw !== "object") {
      try {
        const legacy = JSON.parse(localStorage.getItem(TASKS_KEY_V1) || "null");
        if (Array.isArray(legacy)) fallback.tasks = legacy.map(normalizeTask).filter(Boolean);
      } catch {}
      return fallback;
    }

    const settings = { ...DEFAULT_SETTINGS };
    if (raw.settings && typeof raw.settings === "object") {
      const s = raw.settings;
      settings.focus     = clampInt(s.focus, 1, 90, DEFAULT_SETTINGS.focus);
      settings.short     = clampInt(s.short, 1, 30, DEFAULT_SETTINGS.short);
      settings.long      = clampInt(s.long, 1, 60, DEFAULT_SETTINGS.long);
      settings.longEvery = clampInt(s.longEvery, 2, 8, DEFAULT_SETTINGS.longEvery);
      settings.autoStart = s.autoStart === true;
      settings.sound     = s.sound !== false;
    }

    return {
      tasks: Array.isArray(raw.tasks) ? raw.tasks.map(normalizeTask).filter(Boolean) : [],
      settings,
      stats: {
        date: typeof raw.stats?.date === "string" ? raw.stats.date : todayKey(),
        focusMinutes: Number.isFinite(raw.stats?.focusMinutes)
          ? Math.max(0, raw.stats.focusMinutes) : 0
      },
      filter: ["all", "active", "done"].includes(raw.filter) ? raw.filter : "all"
    };
  }

  let state = loadState();
  ensureToday();

  function ensureToday() {
    const key = todayKey();
    if (state.stats.date !== key) {
      state.stats.date = key;
      state.stats.focusMinutes = 0;
    }
  }

  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    }, 120);
  }

  /* ---------- Geçmiş ---------- */
  function loadHistory() {
    try {
      const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
      return typeof raw === "object" && raw !== null ? raw : {};
    } catch { return {}; }
  }
  let history = loadHistory();

  function saveHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
  }

  function recordHistory(day, field, amount = 1) {
    if (!history[day]) history[day] = { focus: 0, done: 0 };
    history[day][field] = (history[day][field] || 0) + amount;

    const keys = Object.keys(history).sort();
    if (keys.length > 90) {
      keys.slice(0, keys.length - 90).forEach(k => delete history[k]);
    }
    saveHistory();
  }

  function countTasksOnDay(dayKeyStr) {
    return state.tasks.filter(t =>
      t.done && t.doneAt && todayKey(new Date(t.doneAt)) === dayKeyStr
    ).length;
  }

  /* ---------- Tema ---------- */
  function applyTheme(theme) {
    if (!THEMES.includes(theme)) theme = "light";
    document.documentElement.dataset.theme = theme;

    els.themeToggle.textContent = THEME_ICONS[theme];
    const label = t(THEME_I18N[theme]);
    els.themeToggle.setAttribute("aria-label", label);
    els.themeToggle.setAttribute("title", label);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_META_COLORS[theme]);
  }

  function initTheme() {
    let stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch {}
    if (!stored || !THEMES.includes(stored)) {
      stored = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    applyTheme(stored);

    els.themeToggle.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || "light";
      const idx = THEMES.indexOf(current);
      const next = THEMES[(idx + 1) % THEMES.length];
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch {}
    });
  }

  /* ---------- Toast ---------- */
  let toastTimeout = null;
  function hideToast() { els.toast.classList.remove("show"); }

  function showToast(message, actionLabel, action) {
    els.toast.replaceChildren();
    const span = document.createElement("span");
    span.textContent = message;
    els.toast.append(span);

    if (actionLabel && typeof action === "function") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = actionLabel;
      btn.addEventListener("click", () => { hideToast(); action(); });
      els.toast.append(btn);
    }

    els.toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(hideToast, 5200);
  }

  /* ---------- Görevler ---------- */
  function visibleTasks() {
    if (state.filter === "active") return state.tasks.filter(t => !t.done);
    if (state.filter === "done")   return state.tasks.filter(t => t.done);
    return state.tasks;
  }

  function makeIconButton(label, glyph, extra, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `icon-btn${extra ? " " + extra : ""}`;
    btn.textContent = glyph;
    btn.setAttribute("aria-label", label);
    btn.title = label;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function startEdit(item, task) {
    if (item.querySelector(".edit-input")) return;
    const textEl = item.querySelector(".task-text");
    const editInput = document.createElement("input");
    editInput.className = "edit-input";
    editInput.type = "text";
    editInput.maxLength = 120;
    editInput.value = task.text;
    editInput.setAttribute("aria-label", t("taskAriaEdit"));

    item.replaceChild(editInput, textEl);
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);

    let finished = false;
    const commit = (shouldSave) => {
      if (finished) return;
      finished = true;
      if (shouldSave) {
        const value = editInput.value.trim();
        if (value) task.text = value;
      }
      save(); renderTasks();
    };
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter")  { e.preventDefault(); commit(true); }
      if (e.key === "Escape") { e.preventDefault(); commit(false); }
    });
    editInput.addEventListener("blur", () => commit(true));
  }

  function buildTaskItem(task) {
    const item = document.createElement("li");
    item.className = `task${task.done ? " done" : ""}`;
    item.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label",
      task.done ? t("taskAriaUndo", { text: task.text })
                : t("taskAriaComplete", { text: task.text }));
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      task.doneAt = task.done ? Date.now() : null;
      if (task.done) {
        const total = state.tasks.filter(t => t.done).length;
        if (total === state.tasks.length && state.tasks.length > 1) {
          showToast(t("toastAllDone"));
        }
      }
      save(); renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;
    text.title = t("taskEditTitle");
    text.addEventListener("dblclick", () => startEdit(item, task));

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.append(
      makeIconButton(t("taskAriaEdit"), "✏️", "", () => startEdit(item, task)),
      makeIconButton(t("taskAriaDelete"), "🗑️", "danger", () => removeTask(task))
    );

    item.append(checkbox, text, actions);
    return item;
  }

  function removeTask(task) {
    const index = state.tasks.indexOf(task);
    if (index === -1) return;
    state.tasks.splice(index, 1);
    save(); renderTasks();
    showToast(t("toastDeleted"), t("toastUndo"), () => {
      state.tasks.splice(index, 0, task);
      save(); renderTasks();
    });
  }

  function renderTasks() {
    const tasks = visibleTasks();
    els.list.replaceChildren(...tasks.map(buildTaskItem));

    const total = state.tasks.length;
    const done = state.tasks.filter(t => t.done).length;

    els.empty.textContent = tasks.length === 0
      ? t(state.filter === "active" ? "emptyActive"
        : state.filter === "done" ? "emptyDone" : "emptyAll")
      : "";
    els.empty.hidden = tasks.length > 0;

    els.badge.textContent = `${done} / ${total}`;
    els.count.textContent = t("count", { done, total });
    els.progress.style.width = total ? `${(done / total) * 100}%` : "0%";
    els.clearDone.disabled = done === 0;

    $$(".chip", els.filters).forEach(chip => {
      chip.classList.toggle("is-active", chip.dataset.filter === state.filter);
    });

    renderStats();
    renderStatsCard();
  }

  function renderStats() {
    const key = todayKey();
    const doneToday = state.tasks.filter(t =>
      t.done && t.doneAt && todayKey(new Date(t.doneAt)) === key).length;
    els.statsLine.textContent = t("statsLine", {
      done: doneToday, minutes: state.stats.focusMinutes
    });
  }

  /* ---------- Haftalık istatistik ---------- */
  function lastNDays(n) {
    const days = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  }

  function calculateStreak() {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = todayKey(d);
      const focus = history[k]?.focus || 0;
      const tasks = countTasksOnDay(k);
      const active = focus > 0 || tasks > 0;

      if (active) streak++;
      else if (i === 0) continue;
      else break;
    }
    return streak;
  }

  function renderStatsCard() {
    const days = lastNDays(7);
    const today = todayKey();
    const weekKeys = days.map(d => todayKey(d));

    const focusValues = weekKeys.map(k => history[k]?.focus || 0);
    const maxFocus = Math.max(1, ...focusValues);

    els.weekChart.replaceChildren(...days.map((d) => {
      const k = todayKey(d);
      const focus = history[k]?.focus || 0;
      const isToday = k === today;
      const pct = (focus / maxFocus) * 100;

      const col = document.createElement("div");
      col.className = `day-col${isToday ? " today" : ""}`;
      col.title = `${d.toLocaleDateString(getLang())} — ${focus} ${t("unitMin").trim()}`;

      const value = document.createElement("div");
      value.className = "day-value";
      value.textContent = focus > 0 ? String(focus) : "";

      const wrap = document.createElement("div");
      wrap.className = "day-bar-wrap";
      const bar = document.createElement("div");
      bar.className = "day-bar";
      bar.style.height = `${focus > 0 ? Math.max(6, pct) : 4}%`;
      wrap.appendChild(bar);

      const label = document.createElement("div");
      label.className = "day-label";
      try { label.textContent = d.toLocaleDateString(getLang(), { weekday: "short" }); }
      catch { label.textContent = d.toLocaleDateString(undefined, { weekday: "short" }); }

      col.append(value, wrap, label);
      return col;
    }));

    let totalFocus = 0;
    let totalTasks = 0;
    weekKeys.forEach(k => {
      totalFocus += history[k]?.focus || 0;
      totalTasks += countTasksOnDay(k);
    });

    els.statFocus.textContent = String(totalFocus);
    els.statTasks.textContent = String(totalTasks);
    els.statStreak.textContent = String(calculateStreak());
    els.weekBadge.textContent = `${totalFocus}${t("unitMin")}`;
  }

  /* ---------- Zamanlayıcı ---------- */
  const timer = {
    mode: "focus",
    total: DEFAULT_SETTINGS.focus * 60,
    remaining: DEFAULT_SETTINGS.focus * 60,
    running: false, endAt: 0, cycle: 0, handle: null
  };
  let noteKey = "";
  let audioCtx = null;

  els.ring.style.strokeDasharray = String(RING_C);

  const durationFor = (mode) => {
    const s = state.settings;
    if (mode === "focus") return s.focus * 60;
    if (mode === "short") return s.short * 60;
    return s.long * 60;
  };

  function updateRing() {
    const frac = timer.total > 0 ? timer.remaining / timer.total : 0;
    els.ring.style.strokeDashoffset = String(RING_C * (1 - frac));
  }

  function modeLabel(mode) {
    if (mode === "focus") return t("modeLabelFocus");
    if (mode === "short") return t("modeLabelShort");
    return t("modeLabelLong");
  }

  function updateTitle() {
    document.title = timer.running
      ? t("docTitleRunning", { time: formatClock(timer.remaining), mode: modeLabel(timer.mode) })
      : t("docTitle");
  }

  function renderClock() {
    els.clock.textContent = formatClock(timer.remaining);
    updateRing(); updateTitle();
  }

  function updateDots() {
    const count = state.settings.longEvery;
    const filled = timer.mode === "long" ? count : timer.cycle % count;
    els.dots.replaceChildren(...Array.from({ length: count }, (_, i) => {
      const dot = document.createElement("span");
      dot.className = `dot${i < filled ? " is-filled" : ""}`;
      return dot;
    }));
  }

  function renderTimerUI() {
    document.body.dataset.mode = timer.mode;

    $$(".chip", els.modeChips).forEach(chip => {
      chip.classList.toggle("is-active", chip.dataset.mode === timer.mode);
    });

    const paused = !timer.running && timer.remaining < timer.total;
    els.startPause.textContent = timer.running ? t("pause")
      : (paused ? t("resume") : t("start"));

    if (noteKey) els.note.textContent = t(noteKey);
    else if (paused) els.note.textContent = t("notePaused");
    else if (timer.mode === "focus") els.note.textContent = t("noteFocus");
    else if (timer.mode === "short") els.note.textContent = t("noteShort");
    else els.note.textContent = t("noteLong");

    renderClock(); updateDots();
  }

  function stopTicking() {
    clearInterval(timer.handle);
    timer.handle = null;
    timer.running = false;
  }

  function startTimer() {
    if (timer.running) return;
    if (timer.remaining <= 0) timer.remaining = timer.total;
    noteKey = "";
    timer.running = true;
    timer.endAt = Date.now() + timer.remaining * 1000;
    timer.handle = setInterval(tick, 200);
    requestNotificationPermission();
    renderTimerUI();
  }

  function pauseTimer() {
    if (!timer.running) return;
    timer.remaining = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
    stopTicking(); renderTimerUI();
  }

  function tick() {
    const left = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
    if (left !== timer.remaining) { timer.remaining = left; renderClock(); }
    if (left <= 0) completeTimer();
  }

  function setMode(mode, options = {}) {
    stopTicking();
    timer.mode = mode;
    timer.total = durationFor(mode);
    timer.remaining = timer.total;
    noteKey = options.noteKey || "";
    renderTimerUI();
    if (options.autoStart) startTimer();
  }

  function completeTimer() {
    stopTicking();
    const finished = timer.mode;
    chime();

    if (finished === "focus") {
      state.stats.focusMinutes += state.settings.focus;
      recordHistory(todayKey(), "focus", state.settings.focus);
      timer.cycle += 1;
      ensureToday(); save(); renderStats(); renderStatsCard();

      const longBreak = timer.cycle % state.settings.longEvery === 0;
      notify(t("notifFocusTitle"),
        longBreak ? t("notifFocusBodyLong") : t("notifFocusBodyShort"));
      setMode(longBreak ? "long" : "short", {
        noteKey: longBreak ? "noteLongReady" : "noteShortReady",
        autoStart: state.settings.autoStart
      });
      showToast(t("toastFocusDone"));
    } else {
      notify(t("notifBreakTitle"), t("notifBreakBody"));
      setMode("focus", { noteKey: "noteFocusReady", autoStart: state.settings.autoStart });
      showToast(t("toastBreakDone"));
    }
  }

  function chime() {
    if (!state.settings.sound) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = audioCtx || new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const now = audioCtx.currentTime;
      [659.25, 880, 1174.66].forEach((freq, i) => {
        const start = now + i * 0.18;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(start); osc.stop(start + 0.45);
      });
    } catch {}
  }

  function requestNotificationPermission() {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    try { Notification.requestPermission(); } catch {}
  }

  function notify(title, body) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if (document.visibilityState === "visible") return;
    try { new Notification(title, { body }); } catch {}
  }

  /* ---------- Olaylar ---------- */
  function bindEvents() {
    els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = els.input.value.trim();
      if (!text) return;
      state.tasks.unshift({
        id: uid(), text: text.slice(0, 120), done: false,
        createdAt: Date.now(), doneAt: null
      });
      save(); renderTasks();
      els.form.reset(); els.input.focus();
    });

    els.filters.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      state.filter = chip.dataset.filter;
      save(); renderTasks();
    });

    els.clearDone.addEventListener("click", () => {
      const removed = state.tasks.filter(t => t.done);
      if (!removed.length) return;
      state.tasks = state.tasks.filter(t => !t.done);
      save(); renderTasks();
      showToast(t("toastCleared", { n: removed.length }), t("toastUndo"), () => {
        state.tasks.push(...removed);
        save(); renderTasks();
      });
    });

    els.startPause.addEventListener("click", () => {
      if (timer.running) pauseTimer(); else startTimer();
    });
    els.reset.addEventListener("click", () => {
      stopTicking();
      timer.total = durationFor(timer.mode);
      timer.remaining = timer.total;
      noteKey = ""; renderTimerUI();
    });
    els.skip.addEventListener("click", () => {
      stopTicking();
      if (timer.mode === "focus") setMode("short", { noteKey: "noteSkippedFocus" });
      else setMode("focus", { noteKey: "noteSkippedBreak" });
    });

    els.modeChips.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      setMode(chip.dataset.mode);
    });

    els.setFocus.addEventListener("change", (e) => {
      state.settings.focus = clampInt(e.target.value, 1, 90, DEFAULT_SETTINGS.focus);
      e.target.value = state.settings.focus;
      save(); onDurationsChanged();
    });
    els.setShort.addEventListener("change", (e) => {
      state.settings.short = clampInt(e.target.value, 1, 30, DEFAULT_SETTINGS.short);
      e.target.value = state.settings.short;
      save(); onDurationsChanged();
    });
    els.setLong.addEventListener("change", (e) => {
      state.settings.long = clampInt(e.target.value, 1, 60, DEFAULT_SETTINGS.long);
      e.target.value = state.settings.long;
      save(); onDurationsChanged();
    });
    els.setEvery.addEventListener("change", (e) => {
      state.settings.longEvery = clampInt(e.target.value, 2, 8, DEFAULT_SETTINGS.longEvery);
      e.target.value = state.settings.longEvery;
      save(); updateDots();
    });
    els.setAuto.addEventListener("change", (e) => {
      state.settings.autoStart = e.target.checked; save();
    });
    els.setSound.addEventListener("change", (e) => {
      state.settings.sound = e.target.checked; save();
      if (e.target.checked) chime();
    });

    els.langSelect.addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });

    document.addEventListener("keydown", (e) => {
      const target = e.target;
      const typing = target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" ||
         target.tagName === "SELECT" || target.isContentEditable);

      if (e.key === "Escape" && typing && target === els.input) {
        els.input.blur(); return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (timer.running) pauseTimer(); else startTimer();
        return;
      }
      if (e.key === "n" || e.key === "N") {
        e.preventDefault(); els.input.focus();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && timer.running) tick();
    });

    onLanguageChange(() => {
      renderTasks();
      renderTimerUI();
      renderStatsCard();
      const currentTheme = document.documentElement.dataset.theme || "light";
      applyTheme(currentTheme);
    });
  }

  function onDurationsChanged() {
    if (!timer.running) {
      timer.total = durationFor(timer.mode);
      timer.remaining = timer.total;
      noteKey = "";
    }
    renderTimerUI();
  }

  function syncSettingsInputs() {
    els.setFocus.value = state.settings.focus;
    els.setShort.value = state.settings.short;
    els.setLong.value  = state.settings.long;
    els.setEvery.value = state.settings.longEvery;
    els.setAuto.checked  = state.settings.autoStart;
    els.setSound.checked = state.settings.sound;
  }

  /* ---------- Başlat ---------- */
  function init() {
    buildLangSelect(els.langSelect);
    initTheme();
    syncSettingsInputs();

    timer.mode = "focus";
    timer.total = durationFor("focus");
    timer.remaining = timer.total;

    bindEvents();

    const initialLang = detectInitialLang();
    els.langSelect.value = initialLang;
    applyLanguage(initialLang);

    setInterval(() => {
      const before = state.stats.date;
      ensureToday();
      if (before !== state.stats.date) { save(); renderStats(); renderStatsCard(); }
    }, 60_000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
