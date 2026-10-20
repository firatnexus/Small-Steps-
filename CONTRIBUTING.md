# Small Steps'e Katkıda Bulunma

Yardım etmek istediğin için teşekkürler. Bu projeyi küçük ve hızlı tutan birkaç katı kural var:

## Temel kurallar

1. **Sıfır bağımlılık.** Yalnızca vanilla HTML/CSS/JS. Bir özellik framework veya derleme adımı gerektiriyorsa buraya ait değildir.
2. **12 dil eşit kalmalı.** Eklediğin her kullanıcıya dönük metin, `translations.js` içindeki tüm dil bloklarına eklenmeli. `node tools/check-translations.js` geçmeli — CI bunu zorunlu tutuyor.
3. **Çevrimdışı öncelikli.** Uygulama ilk yüklemeden sonra tamamen çevrimdışı çalışabilmeli. Ağ çağrısı ekleme.
4. **Gizlilik.** Analitik yok, hesap yok, izleme yok. Veri `localStorage`'da kalır.
5. **Varlık değişirse önbelleği güncelle.** `app.js` / `style.css` / `translations.js` değişirse `sw.js` içindeki `CACHE` adını yeni sürüme yükselt — yoksa eski önbellek kullanıcıya takılı kalır.

## İş akışı

1. `main`'den çatallan/dal aç
2. Değişikliğini yap — PR'ları odaklı tut
3. Denetimleri çalıştır:

```bash
node --check app.js && node --check sw.js && node --check translations.js
node tools/check-translations.js
```

4. `test.html` dosyasını tarayıcıda aç ve paketin yeşil olduğundan emin ol
5. Mobil genişlikte (390px) ve koyu temada test et — düzen hataları orada saklanır
6. Ne değiştiğini ve nedenini anlatan bir PR aç

## Dil ekleme

`translations.js` içindeki `en:` bloğunu kopyala, her değeri çevir (`{yer tutucular}` aynen kalsın), kodu hem sözlüğe hem `test.html` içindeki beklenen listeye ekle ve README rozet sayısını güncelle.

## Hata bildirme

Şunları ekle: tarayıcı, işletim sistemi, ne yaptın, ne oldu ve Ayarlar → Verilerin → Yedek al çıktısı (gizli bir şey içermez — ama görev metinlerini karartabilirsin).
