# Changelog

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
- **Tamamlananları temizle**, tamamlanan üst görevin AÇIK alt görevlerini silmez — onları üst seviyeye terfi ettirir; geri alma hiyerarşiyi aynen geri getirir

### İçe aktarma sağlamlaştırma

- Bozuk yedekler artık otomatik düzeltliyor: yinelenen id'ler atılır, yetim/kendini işaret eden/iki seviye derin `parentId` kayıtları temizlenir; odak görevi listede yoksa sıfırlanır

## 3.0.1 — 2026-10-20

Doğrulama turunda (v3.0 kod incelemesi) yakalanan doğruluk ve sunum düzeltmeleri:

### Düzeltildi

- **Yedek eksiksiz geri gelmiyordu:** içe aktarma artık temayı, günlük odak sayacını ve seçili görevi de geri yüklüyor; zamanlayıcı yeni sürelerle eşitleniyor
- **Gece yarısı muhasebesi:** duraklatıp devam ettirmek oturum gününü artık değiştirmiyor; yeni mod/sıfırlama yeni oturum sayılıyor. Gece yarısını geçen oturumun kredisi yalnızca geçmişe yazılıyor, bugünün sayacı şişirilmiyor (sahte saatle uçtan uca doğrulandı)
- **Alt bilgi tutarsızlığı:** "Bugün: N görev" sayacı da artık geçmişten okunuyor — silinen tamamlanmış görev gün sayacını düşürmüyor
- **Service worker:** kurulum hatalarını gizleyen sessiz `catch` kaldırıldı; önbellek adı sürümle eşitlendi (varlık değişikliklerinde eski önbellek sorunu notu eklendi)
- **README:** mobil ekran görüntüsü mobil düzen düzeltmesinden önce alınmıştı — güncel kodla yeniden üretildi; belgeler Türkçe birincil hale geldi (İngilizce sürüm: README.en.md)

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
