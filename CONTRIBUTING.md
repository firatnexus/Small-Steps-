# Contributing to Small Steps

Thanks for wanting to help. This project has a few hard rules that keep it small and fast:

## Ground rules

1. **Zero dependencies.** Vanilla HTML/CSS/JS only. If a feature needs a framework or a build step, it doesn't belong here.
2. **All 12 languages stay in sync.** Every user-facing string you add must be added to every language block in `translations.js`. `node tools/check-translations.js` must pass — CI enforces it.
3. **Offline-first.** The app must work fully offline after first load. Don't add network calls.
4. **Privacy.** No analytics, no accounts, no tracking. Data stays in `localStorage`.

## Workflow

1. Fork / branch from `main`
2. Make your change — keep PRs focused
3. Run the checks:

```bash
node --check app.js && node --check sw.js && node --check translations.js
node tools/check-translations.js
```

4. Open `test.html` in a browser and make sure the suite is green
5. Test on mobile width (390px) and in dark theme — layout bugs hide there
6. Open a PR describing what changed and why

## Adding a language

Copy the `en:` block in `translations.js`, translate every value (keep `{placeholders}` exactly as-is), add the code to the expected list in `test.html`, and update the README badge count.

## Reporting bugs

Include: browser, OS, what you did, what happened, and the text from Settings → Your data → Export backup (it contains no secrets — but feel free to redact task text).
