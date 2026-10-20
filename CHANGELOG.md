# Changelog

## 3.0 — 2026-10-20

The biggest release yet: Small Steps grows from a timer + list into a small focus workspace.

### Added

- **Task-linked focus** — select a task (◎ button) and every completed focus session credits its minutes to that task, shown as a pill on the task row and in the timer card
- **Priorities** — none / low / medium / high, with colored accent on the task row
- **Task search** — instant filtering, diacritic-friendly matching (Turkish İ/ı, etc.)
- **90-day focus heatmap** — GitHub-style consistency grid under the weekly chart
- **JSON backup** — export/import everything (tasks, settings, history, language) from Settings → Your data
- **Keyboard shortcut help** — press `?` or the toolbar button
- 25 new translation strings × 12 languages
- CI workflow: syntax checks + translation key/placeholder parity

### Fixed

- **Service worker never installed** — it tried to cache `styles.css` but the file is `style.css`; offline mode silently failed since the first release
- **Stats vanished when tasks were deleted** — completions are now recorded in a daily history log, so weekly stats and streaks survive deletion/clearing
- **Focus credit used the wrong duration** — if you changed the focus-length setting mid-session, the wrong amount was credited; sessions now record the duration and day they started with (also fixes midnight rollover)
- **RTL badge direction** — the "1 / 4" counter no longer renders reversed in Arabic
- Empty focus-task chip no longer renders when no task is selected
- Task text no longer breaks mid-word on narrow phones (actions moved to a second row)
- Turkish search matching ("ikinci" now finds "İkinci")

### Changed

- Service worker: HTML requests are network-first so updates arrive promptly; assets remain cache-first per release (cache name bumped per version)
- Mobile task rows: two-line layout for readable titles
- README rewritten with screenshots and accurate feature list

## 2.1

- Weekly stats, streak counter, 4 themes, 12 languages, PWA offline support
