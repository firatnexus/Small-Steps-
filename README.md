# 🌱 Minik Adımlar · Small Steps

<div align="center">

**Görev listesi + Pomodoro zamanlayıcısı.** · **Task list + Pomodoro timer.**
Bağımlılık yok · 12 dil · çevrimdışı çalışır · telefon ve masaüstü için ayrı yerleşim
Zero dependencies · 12 languages · works offline · separate phone and desktop layouts

[

![Version](https://img.shields.io/badge/version-2.4-267354?style=flat-square)

](../../releases)
[

![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?style=flat-square)

](#pwa)
[

![Languages](https://img.shields.io/badge/languages-12-important?style=flat-square)

](#diller--languages)
[

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)

](./LICENSE)

[

![Canlı Demo](https://img.shields.io/badge/🌐%20Canlı%20Demo%20·%20Live%20Demo-267354?style=for-the-badge)

](https://firatnexus.github.io/Small-Steps-/)

**[Türkçe](#türkçe)** · **[English](#english)**

</div>

<!--
Ekran görüntüleri için: docs/screenshots/ klasörüne light.png, dark.png, mobile.png koy
ve aşağıdaki satırların yorumunu kaldır.
| ☀️ Açık | 🌙 Koyu | 📱 Mobil |
|:---:|:---:|:---:|
| 

![Light](./docs/screenshots/light.png)

 | 

![Dark](./docs/screenshots/dark.png)

 | 

![Mobile](./docs/screenshots/mobile.png)

 |
-->

---

# Türkçe

## Özellikler

**Görevler**
- Ekle (`Enter`), tamamla/geri al, çift tıklayarak düzenle, sil ve **geri al**
- Tümü / Aktif / Tamamlanan filtreleri, ilerleme çubuğu, tamamlananları toplu temizleme (o da geri alınabilir)

**Zamanlayıcı**
- Odak, kısa mola, uzun mola; süreler ve tur sayısı ayarlanabilir
- Halka ilerlemesi, tur noktaları, duraklat / sıfırla / atla, molaları otomatik başlatma
- Süre bitiş saatine göre hesaplanır; ekran kapanıp açılınca sayaç şaşmaz
- Bitişte ses, titreşim ve **bildirim** (Android dahil, servis worker üzerinden)
- "Sayaç çalışırken ekranı açık tut" ayarı (tarayıcı destekliyorsa görünür)

**Arayüz**
- 4 tema: açık, koyu, sepya, yüksek kontrast
- 12 dil, Arapça için sağdan sola yazım; ilk açılışta tarayıcı dili algılanır
- **Telefon / tablet:** tek sütun. **Masaüstü (1024 px+):** solda görevler ve haftalık istatistik, sağda sayfa kayarken sabit kalan zamanlayıcı
- Haftalık odak grafiği ve seri sayacı, ARIA etiketleri, "azaltılmış hareket" desteği

**Veri**
- Her şey yalnızca tarayıcında (`localStorage`) tutulur, sunucuya hiçbir şey gönderilmez
- **Yedekle:** Ayarlar → "Yedeği dışa aktar" JSON dosyası indirir, "İçe aktar" geri yükler

## Kullanım

**Çevrimiçi:** [firatnexus.github.io/Small-Steps-](https://firatnexus.github.io/Small-Steps-/)

**Yerelde:** derleme yok.

```bash
git clone https://github.com/firatnexus/Small-Steps-.git
cd Small-Steps-
python3 -m http.server 8000   # sonra http://localhost:8000
```

`index.html`'i doğrudan açmak da çalışır, ama `file://` üzerinde servis worker ve PWA özellikleri (çevrimdışı, bildirim, kurulum) devre dışı kalır.

### PWA

| Platform | Yöntem |
|:---|:---|
| Android (Chrome) | ⋮ → "Ana ekrana ekle" / "Uygulamayı yükle" |
| iOS (Safari) | Paylaş → "Ana Ekrana Ekle" (bildirimler için iOS 16.4+ ve ana ekrana eklenmiş olmalı) |
| Masaüstü (Chrome/Edge) | Adres çubuğundaki yükle simgesi |

**Bildirimler:** ilk kez "Başlat"a bastığında izin istenir. Reddedersen uyarı verilir; tarayıcı site ayarlarından açabilirsin. Bildirim yalnızca sekme arka plandayken gösterilir.

### Klavye kısayolları

| Tuş | İşlev |
|:---:|---|
| `Boşluk` | Sayacı başlat / duraklat |
| `N` | Görev kutusuna odaklan |
| `Enter` | Görevi ekle / düzenlemeyi kaydet |
| `Esc` | Düzenlemeyi iptal et |

## Diller · Languages

`tr` Türkçe · `en` English · `de` Deutsch · `es` Español · `fr` Français · `it` Italiano · `pt` Português · `ru` Русский · `ar` العربية (RTL) · `hi` हिन्दी · `ja` 日本語 · `zh` 中文

**Yeni dil eklemek:** `translations.js` içindeki `TRANSLATIONS` nesnesine yeni bir anahtar ekle (`nl: { name: "Nederlands", ... }`). Eksik anahtarlar İngilizceye düşer. Dil listesi otomatik oluşur. Sağdan sola yazılan bir dil için `applyLanguage` içindeki `lang === "ar"` koşulunu genişlet.

## Proje yapısı

```
Small-Steps-/
├── index.html            # Yapı + ARIA + i18n işaretleri
├── style.css             # Stiller, 4 tema, telefon/tablet/masaüstü yerleşimi
├── app.js                # Görevler · zamanlayıcı · tema · istatistik · yedekleme
├── translations.js       # 12 dil + i18n motoru
├── sw.js                 # Servis worker (çevrimdışı + bildirim tıklaması)
├── manifest.json         # PWA manifesti
├── icon.svg              # Uygulama ikonu
├── icon-maskable.svg     # Maskeli ikon kaynağı
├── icon-192.png · icon-512.png · icon-maskable-512.png · apple-touch-icon.png
├── test.html             # Tarayıcıda i18n testleri
├── LICENSE               # MIT
└── README.md
```

## Özelleştirme

Varsayılan süreler `app.js` içinde:

```js
const DEFAULT_SETTINGS = {
  focus: 25, short: 5, long: 15, longEvery: 4,
  autoStart: false, sound: true, keepAwake: false
};
```

Renkler `style.css` başındaki CSS değişkenlerindedir (`--green`, `--bg`, `--card`, `--ink` …). Her tema (`[data-theme="dark"]`, `sepia`, `contrast`) bu değişkenleri yeniden tanımlar.

## Veri depolama

| Anahtar | İçerik |
|:---|:---|
| `small-steps-v2` | Görevler, ayarlar, günlük istatistik, filtre |
| `small-steps-history` | Günlük geçmiş (en fazla 90 gün) |
| `small-steps-language` | Seçili dil |
| `small-steps-theme` | Seçili tema |

Eski `small-steps-tasks-v1` verisi ilk açılışta otomatik taşınır.

> **Uyarı:** Veri yalnızca o tarayıcıdadır. Gizli sekmede sekme kapanınca silinir, "site verilerini temizle" de görevleri siler. Düzenli yedek al.

Yedek dosyası biçimi:

```json
{
  "app": "small-steps",
  "version": 2,
  "exportedAt": "2026-10-12T20:00:00.000Z",
  "state": { "tasks": [], "settings": {}, "stats": {}, "filter": "all" },
  "history": { "2026-10-12": { "focus": 75, "done": 3 } }
}
```

İçe aktarırken dosya doğrulanır, geçersiz alanlar atılır ve mevcut verinin üzerine yazmadan önce onay istenir. Tema ve dil cihaza özel olduğu için yedeğe girmez.

## Tarayıcı desteği

Chrome / Edge 90+, Firefox 88+, Safari 14+, Samsung Internet 14+. Ekranı açık tutma ve bildirimler tarayıcı desteğine bağlıdır; desteklenmiyorsa uygulama bunlar olmadan çalışmaya devam eder.

## Yol haritası

- ✅ Görevler, Pomodoro, 12 dil, 4 tema, istatistik, PWA, bildirimler, JSON yedekleme, masaüstü yerleşimi
- 🚧 Etiketler / kategoriler, öncelik düzeyleri
- 📋 Takvim görünümü, isteğe bağlı bulut eşitleme
- 💭 Sesle görev ekleme

## Katkı

Hata bildirimleri, yeni diller ve çeviri düzeltmeleri memnuniyetle karşılanır: [Issue aç](../../issues) ya da fork'la ve Pull Request gönder. Çeviri eklerken `translations.js` içindeki tüm anahtarları doldurmaya çalış.

## Lisans

[MIT](./LICENSE). İstediğin gibi kullan, değiştir, paylaş.

---

# English

## Features

**Tasks**
- Add (`Enter`), complete/undo, double-click to edit, delete with **undo**
- All / Active / Done filters, progress bar, reversible bulk clear

**Timer**
- Focus, short break, long break; durations and rounds are adjustable
- Ring progress, round dots, pause / reset / skip, optional auto-start for breaks
- Time is computed from an end timestamp, so the clock stays correct when the screen turns off
- Sound, vibration and **notifications** on completion (works on Android through the service worker)
- "Keep screen on while timer runs" setting (shown only if the browser supports it)

**Interface**
- 4 themes: light, dark, sepia, high contrast
- 12 languages with RTL for Arabic; the browser language is detected on first launch
- **Phone / tablet:** single column. **Desktop (1024 px+):** tasks and weekly stats on the left, a sticky timer on the right
- Weekly focus chart and streak, ARIA labels, reduced-motion support

**Data**
- Everything stays in your browser (`localStorage`); nothing is sent to a server
- **Backup:** Settings → "Export backup" downloads a JSON file, "Import backup" restores it

## Usage

**Online:** [firatnexus.github.io/Small-Steps-](https://firatnexus.github.io/Small-Steps-/)

**Locally:** no build step.

```bash
git clone https://github.com/firatnexus/Small-Steps-.git
cd Small-Steps-
python3 -m http.server 8000   # then open http://localhost:8000
```

Opening `index.html` directly also works, but over `file://` the service worker and PWA features (offline, notifications, install) are disabled.

**Install as an app:** Android Chrome → ⋮ → "Add to Home screen" / "Install app". iOS Safari → Share → "Add to Home Screen" (notifications need iOS 16.4+ and the app added to the home screen). Desktop Chrome/Edge → install icon in the address bar.

**Notifications:** the permission prompt appears the first time you press Start. If you deny it, the app shows a hint; you can re-enable it in the browser's site settings. Notifications appear only while the tab is in the background.

**Keyboard shortcuts:** `Space` start/pause · `N` focus the task input · `Enter` add/save · `Esc` cancel edit.

## Languages

`tr` `en` `de` `es` `fr` `it` `pt` `ru` `ar` (RTL) `hi` `ja` `zh`

**Add a language:** add a new key to the `TRANSLATIONS` object in `translations.js`. Missing keys fall back to English, and the language picker fills itself. For another right-to-left language, widen the `lang === "ar"` check in `applyLanguage`.

## Project structure

See the tree in the Turkish section above. All files live in the repository root; there is no build step and no dependencies.

## Customization

Defaults live in `DEFAULT_SETTINGS` in `app.js` (see above). Colors are CSS variables at the top of `style.css`; each theme redefines them.

## Data storage and backup

Keys: `small-steps-v2` (tasks, settings, daily stats, filter), `small-steps-history` (up to 90 days), `small-steps-language`, `small-steps-theme`. Legacy `small-steps-tasks-v1` data is migrated automatically.

> **Warning:** data lives only in that browser. Private mode and "clear site data" erase it. Export a backup regularly.

Imports are validated, invalid fields are dropped, and you are asked to confirm before current data is replaced. Theme and language are per-device and are not part of the backup.

## Browser support

Chrome / Edge 90+, Firefox 88+, Safari 14+, Samsung Internet 14+. Screen wake lock and notifications depend on browser support; the app keeps working without them.

## Contributing

Bug reports, new languages and translation fixes are welcome: [open an issue](../../issues) or fork and send a pull request. When adding a language, try to fill in every key from `translations.js`.

## License

[MIT](./LICENSE). Use, modify and share freely.