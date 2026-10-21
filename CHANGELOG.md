# Changelog

## 3.3.1 — 2026-10-21

English install experience and an opening splash screen.

### Changed

- **PWA install name is now English:** the manifest (name / short_name / description / shortcut) and the Apple web-app title are in English — the install prompt and the installed app's home-screen label now read "Small Steps" (the in-app UI stays in your chosen language)
- Static page title, meta description and `og:locale` (`en_US`) switched to English

### Added

- **Splash screen:** on every launch, a calm opening shows a growing sprout with the app name and "Find your own pace"; it fades out as soon as the first paint is ready (~0.5s), respects `prefers-reduced-motion`, and never blocks interaction beyond that

## 3.3.0 — 2026-10-21

Forest and daily streak.

### Added

- **Forest** — every completed focus session plants a tree; the forest card shows the last 14 days with procedurally drawn trees (deterministic per day, zero assets). Days with more than 4 sessions show a "+n" pill; empty days show a seed dot
- **Daily streak (Duolingo-style)** — consecutive active days (a task completed or a focus session ended), shown as a 🔥 badge on the forest card, with the longest streak on record. Streaks can exceed the 90-day history window via a compact streak tail that is preserved when history is pruned
- **Session counter in history** — `sessions` per day (a focus session is one tree, regardless of duration); legacy data without it is untouched — the forest starts fresh rather than guessing from minutes
- **Stats tile change** — the stats card's streak tile became "Sessions this week" (the streak now lives on the forest card, avoiding two streak displays)

### Fixed

- History pruning now carries a streak tail so long streaks survive the 90-day window, and gaps in pruned days cut the tail correctly

### Docs

- **README:** English is now the primary README (the former Turkish README.md moved to README.tr.md)

## 3.2.0 — 2026-10-21

Tekrarlayan görevler, Todoist'ten içe aktarma ve keşfedilebilirlik.

### Eklendi

- **Tekrarlayan görevler** — üst seviye görevdeki ↻ düğmesi: yok → her gün → hafta içi → her hafta döngüsü. Tamamlanınca yeni occurrence otomatik doğar (geçmiş istatistiğe işlenir) ve görev satırında tekrar rozeti (↻ Her gün tekrar) + tarih rozeti (bugün / yarın / tarih) görünür
  - **Tekrar kuralları:** erken tamamlama zamanlanan günün ötesine atlar; gecikmede birikim yok (geçen günler tek tek doğmaz)
  - **Geri açma koruması:** tamamlanan occurrence yalnızca yeni occurrence'a hiç dokunulmadıysa geri açılabilir (yeni occurrence o zaman silinir ve istatistik geri alınır). Dokunulduysa her iki kayıt da korunur ve toast nedenini açıklar
  - Tekrar yalnızca alt görevi olmayan üst seviye görevlerde kullanılabilir; tamamlanmış occurrence'larda kontrol sunulmaz (yanlışlıkla yeni seri doğmasın)
- **Todoist'ten içe aktarma (CSV)** — Ayarlar → Verilerin → Todoist'ten içe aktar: Todoist'in resmi CSV dışa aktarma dosyasını yükle; TYPE=task satırları görev olarak eklenir (INDENT 2+ alt görev olur, tek seviyeye düzleştirilir), öncelik 1-4 eşlenir, YYYY-MM-DD tarihleri aktarılır. Bölüm/not satırları ve doğal dil tarih/tekrar ifadeleri atlanır — onay penceresi kaç satır atlanacağını gösterir. Ayırıcı virgül ya da noktalı virgül olabilir (otomatik algılanır)
- **Paylaşım önizlemesi** — Open Graph / Twitter kart etiketleri ve 1280×640 sosyal önizleme görseli eklendi; repo açıklaması, konu etiketleri ve ana sayfa bağlantısı ayarlandı

### Değişti

- **CSV dışa aktarma** iki yeni sütun: `repeat` (daily/weekdays/weekly) ve `due_date` (YYYY-MM-DD)

### Davranış kuralları (belgelendi)

- Yeni occurrence yalnızca "tamamlanmamış → tamamlandı" geçişinde doğar — yeniden yükleme/içe aktarma çoğaltmaz
- Tamamlananları temizle, tekrarlayan görevin yeni occurrence'ına dokunmaz
- **Tekrar ve alt görev birbirini dışlar:** tekrarlayan görevde ＋ görünmez, alt görevlisi görevde ↻ görünmez; içe aktarılan uyumsuz veride alt görevlisi görevin tekrarı temizlenir
- **Geri açma muhasebesi gün aşırı doğrudur:** sayaç, tamamlanınca yazılan güne geri alınır — dün tamamlanıp bugün geri açılan görev dünün sayacını düşürür, bugünkü sayaca dokunmaz
- **Tekrarı değişen successor da "dokunulmuş" sayılır:** yeni occurrence'ın metni, önceliği, tekrarı veya odak toplamı değiştiyse geri açma engellenir
- Successor kullanıcı tarafından silindiyse geri açma serbesttir (kullanıcının açık tercihi)
- **Bozuk CSV reddedilir:** kapanmamış tırnak içeren dosya onaya hiç gelmez; imkânsız takvim tarihleri (2026-13-45) aktarılmaz ve atlanan tarih sayısı onay penceresinde ayrıca belirtilir
- Bölüm (section) satırı, girintili görevlerin ebeveyn bağlamını sıfırlar — bölüm sonrası INDENT 2 görev üst seviyeye düşer

## 3.1.0 — 2026-10-21

Alt görevler ve CSV dışa aktarma: büyük işleri gerçekten küçük adımlara bölme.

### Eklendi

- **Alt görevler (tek seviye)** — herhangi bir görevin ＋ düğmesiyle alt görev ekle (Enter ile satır içi, Esc iptal). Ebeveyn satırında ilerleme rozeti (ör. 2/5) görünür
- **Ağaç silme ve geri alma** — üst görev silinince alt görevleri de gider; toast'taki geri alma yalnızca silinen kayıtları eski konumlarına geri koyar (toast açıkken eklenen yeni görevler korunur)
- **CSV dışa aktarma** — Ayarlar → Verilerin → Görevleri indir (CSV): tip, metin, durum, öncelik, odak dakikası, ebeveyn metni ve tarihler; UTF-8 BOM + RFC 4180 kaçış (Excel uyumlu)
- **Otomatik uygulama testleri** — `tools/test-app.js` gerçek app.js'yi jsdom'da çalıştırıyor: eski veri uyumluluğu, alt görev akışları, ağaç silme/geri alma, gruplu arama/filtre, CSV kaçış kuralları, bozuk veri temizleme, tamamlananları temizleme. CI'a eklendi

### Davranış kuralları (belgelendi)

- Durum ve arama filtreleri üst seviye görevlere uygulanır; alt görevler bağlam olarak ebeveynin altında görünür. Aramada alt görev eşleşmesi ebeveyni de listeye çıkarır
- Sayaç ve günlük istatistik yalnızca üst seviye görevleri sayar; alt görev ilerlemesi ebeveyndeki rozettedir
- Bir üst görevi tamamlamak alt görevleri otomatik tamamlamaz (ve tersi) — tamamlama her zaman açık seçimdir
- **Tamamlananları temizle**, tamamlanan üst görevin AÇIK alt görevlerini silmez — onları üst seviyeye terfi ettirir; geri alma hiyerarşiyi geri getirir (terfi eden görev arada kendi alt görevini edinmişse tek seviye kuralı için üst seviyede kalır)

### İçe aktarma sağlamlaştırma

- Bozuk yedekler artık otomatik düzeltliyor: yinelenen id'ler atılır, yetim/kendini işaret eden/iki seviye derin `parentId` kayıtları temizlenir; odak görevi listede yoksa sıfırlanır

## 3.0.1 — 2026-10-20

Doğrulama turunda (v3.0 kod incelemesi) yakalanan doğruluk ve sunum düzeltmeleri:

### Düzeltildi

- **Yedek eksiksiz geri gelmiyordu:** içe aktarma artık temayı, günlük odak sayacını ve seçili görevi de geri yüklüyor; zamanlayıcı yeni sürelerle eşitleniyor
- **Gece yarısı muhasebesi:** duraklatıp devam ettirmek oturum gününü artık değiştirmiyor; yeni mod/sıfırlama yeni oturum sayılıyor. Gece yarısını geçen oturumun kredisi yalnızca geçmişe yazılıyor, bugünün sayacı şişirilmiyor (sahte saatle uçtan uca doğrulandı)
- **Alt bilgi tutarsızlığı:** "Bugün: N görev" sayacı da artık geçmişten okunuyor — silinen tamamlanmış görev gün sayacını düşürmüyor
- **Service worker:** kurulum hatalarını gizleyen sessiz `catch` kaldırıldı; önbellek adı sürümle eşitlendi (varlık değişikliklerinde eski önbellek sorunu notu eklendi)
- **README:** mobil ekran görüntüsü mobil düzen düzeltmesinden önce alınmıştı — güncel kodla yeniden üretildi; belgeler Türkçe birincil hale geldi (İngilizce sürüm: README.en.md — v3.2 sonrası ana README oldu, bkz. Unreleased)

### Doğrulandı

- Gerçek çevrimdışı mod: SW kurulumu + çevrimdışı yeniden yükleme + görev ekleme + zamanlayıcı (ağ kesikken uçtan uca test edildi)
- Yedek gidiş-dönüşü: dışa aktar → tüm veriyi sil → içe aktar → görevler, tema, günlük sayaç, dil geri geldi

## 3.0 — 2026-10-20

Şimdiye kadarki en büyük sürüm: Small Steps bir zamanlayıcı + liste ikilisinden küçük bir odak çalışma alanına dönüştü.

### Eklendi

- **Göreve bağlı odak** — görev seç (◎), tamamlanan her odak oturumu dakikalarını o göreve işliyor; görev satırında ve zamanlayıcı kartında görünür
- **Öncelikler** — yok / düşük / orta / yüksek, renkli şeritle
- **Görev araması** — anlık filtreleme, aksan dostu eşleştirme (Türkçe İ/ı dahil)
- **90 günlük odak ısı haritası** — haftalık grafiğin altında GitHub tarzı tutarlılık ızgarası
- **JSON yedekleme** — Ayarlar → Verilerin: görevler, ayarlar, geçmiş, tema ve dilin tam yedeği
- **Klavye kısayolu yardımı** — `?` tuşu veya araç çubuğu düğmesi
- 25 yeni çeviri dizgisi × 12 dil
- CI iş akışı: sözdizimi denetimleri + çeviri anahtar/yer tutucu paritesi

### Düzeltildi

- **Service worker hiç kurulamıyordu** — `styles.css` dosyasını önbelleğe almaya çalışıyordu ama dosyanın adı `style.css`; çevrimdışı mod sessizce çalışmıyordu
- **Görev silinince istatistikler kayboluyordu** — tamamlamalar artık günlük geçmiş günlüğüne kaydediliyor; haftalık istatistikler ve seriler silme/temizlemeden etkilenmiyor
- **Odak kredisi yanlış süreyi kullanıyordu** — odak süresi ayarını oturum ortasında değiştirirsen yanlış miktar yazılıyordu; oturumlar artık başladıkları süre ve günle kaydediliyor (gece yarısı geçişi düzeltmesi dahil)
- **RTL rozet yönü** — "1 / 4" sayacı Arapça'da tersten dizilmiyor
- Görev seçili değilken boş odak çipi görünmüyor
- Dar telefonlarda görev metni kelime ortasından bölünmüyor (düğmeler alt satıra taşınıyor)
- Türkçe arama eşleştirmesi ("ikinci" artık "İkinci"yi buluyor)

### Değiştirildi

- Service worker: HTML istekleri ağ-öncelikli (güncellemeler anında ulaşır), varlıklar sürüm başına önbellek-öncelikli
- Mobil görev satırları: okunabilir metin için iki satır düzen
- README ekran görüntüleri ve doğru özellik listesiyle yeniden yazıldı

## 2.1

- Haftalık istatistikler, seri sayacı, 4 tema, 12 dil, PWA çevrimdışı desteği
