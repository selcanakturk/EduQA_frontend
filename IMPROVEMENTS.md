# EduQA Campus - Geliştirme Notları ve Fikirler

## ✅ Tamamlanan İyileştirmeler

### 1. Çıkış Yapma Sorunu
- **Sorun**: Çıkış yaptıktan sonra profil sayfasında bilgiler hala görünüyordu
- **Çözüm**: Profile sayfasına `authStatus` kontrolü eklendi, logout durumunda otomatik redirect yapılıyor

### 2. Dosya/Fotoğraf Ekleme Özelliği
- **Backend**: 
  - Question ve Answer modellerine `attachments` alanı eklendi
  - Yeni `fileUpload` middleware'i oluşturuldu (5MB limit, jpeg/jpg/png/gif/pdf/doc/docx/txt destekli)
  - Soru ve cevap endpoint'lerine dosya upload desteği eklendi
- **Frontend**: 
  - API'ler FormData desteği için güncellendi
  - UI eklenmesi gerekiyor (AskQuestion ve QuestionDetail sayfalarına)

## 📋 "Haftanın İsimleri" Açıklaması

**Konum**: Keşfet sayfası sağ sidebar'ında

**Amaç**: 
- En çok katkı sağlayan topluluk üyelerini öne çıkarmak
- Repütasyon, soru sayısı ve cevap sayısına göre sıralama
- Topluluk motivasyonunu artırmak
- Yeni kullanıcılara örnek göstermek

**Nasıl Çalışıyor**:
- Home sayfasında sorular analiz edilir
- Her kullanıcının toplam soru, cevap ve repütasyon puanı hesaplanır
- En yüksek repütasyona sahip 5 kullanıcı gösterilir
- Kullanıcı adına tıklayarak profil sayfasına gidilebilir

**Geliştirme Önerileri**:
- Haftalık/aylık sıfırlama
- Kategorilere göre (bölüm, etiket) ayrı listeler
- Rozetler ve ödüller
- "Bu hafta en çok katkı sağlayan" gibi zaman bazlı filtreler

## 🚀 Geliştirme Fikirleri

### Öncelikli Özellikler

#### 1. Dosya/Fotoğraf Upload UI
- [ ] AskQuestion sayfasına dosya seçici ekle
- [ ] QuestionDetail'de cevap formuna dosya seçici ekle
- [ ] Yüklenen dosyaları önizleme göster
- [ ] Soru/cevap detaylarında ekli dosyaları göster ve indirme linki ver

#### 2. Bildirim Sistemi
- [ ] Soruya cevap geldiğinde bildirim
- [ ] Cevabına beğeni geldiğinde bildirim
- [ ] Soru sahibine en iyi cevap seçildiğinde bildirim
- [ ] Real-time bildirimler (WebSocket veya polling)

#### 3. Arama ve Filtreleme Geliştirmeleri
- [ ] Gelişmiş arama (başlık, içerik, etiket, kullanıcı)
- [ ] Tarih aralığı filtreleme
- [ ] Çözülmüş/çözülmemiş soru filtreleme
- [ ] Bölüme göre filtreleme
- [ ] Kaydedilen aramalar

#### 4. Etkileşim Özellikleri
- [ ] Soruları/cevapları kaydetme (bookmark)
- [ ] Soruları takip etme
- [ ] Özel mesajlaşma (DM)
- [ ] @mention ile kullanıcı etiketleme
- [ ] Soru/cevap paylaşma (sosyal medya linkleri)

#### 5. Profil Geliştirmeleri
- [ ] Kullanıcı istatistikleri (toplam soru, cevap, beğeni)
- [ ] Aktivite geçmişi
- [ ] Rozetler ve başarılar
- [ ] Profil özelleştirme (tema, renkler)
- [ ] Kullanıcı blogu/yazıları

#### 6. Moderatör Özellikleri
- [ ] Soru/cevap silme/duzenleme yetkisi
- [ ] Spam/uygunsuz içerik raporlama
- [ ] Kullanıcı yasaklama
- [ ] Topluluk kuralları yönetimi

#### 7. İçerik Kalitesi
- [ ] Markdown desteği (soru/cevap yazarken)
- [ ] Kod syntax highlighting
- [ ] LaTeX matematik formülleri
- [ ] Görsel editör (WYSIWYG)
- [ ] Soru/cevap şablonları

#### 8. Sosyal Özellikler
- [ ] Takipçi/takip sistemi
- [ ] Topluluk oluşturma (bölüm bazlı)
- [ ] Etkinlikler ve buluşmalar
- [ ] Mentorluk sistemi
- [ ] Grup çalışmaları

#### 9. Analitik ve Raporlama
- [ ] Admin dashboard
- [ ] Kullanıcı aktivite raporları
- [ ] Popüler içerik analizi
- [ ] Topluluk büyüme metrikleri
- [ ] Export özellikleri (CSV, PDF)

#### 10. Mobil ve Performans
- [ ] Progressive Web App (PWA)
- [ ] Offline mod desteği
- [ ] Push bildirimleri
- [ ] Görsel optimizasyonu (lazy loading)
- [ ] Infinite scroll

### Teknik İyileştirmeler

1. **Backend**:
   - Rate limiting
   - Caching (Redis)
   - Full-text search (Elasticsearch)
   - File storage (S3/Cloudinary)
   - API versioning

2. **Frontend**:
   - Code splitting
   - Service worker
   - Error boundary'ler
   - Loading states iyileştirme
   - Accessibility (a11y)

3. **Güvenlik**:
   - CSRF koruması
   - XSS koruması
   - Input validation
   - Rate limiting
   - File upload güvenliği

4. **Test**:
   - Unit testler
   - Integration testler
   - E2E testler
   - Performance testler

## 📝 Notlar

- Dosya upload özelliği backend'de hazır, frontend UI eklenmeli
- "Haftanın İsimleri" özelliği çalışıyor, zaman bazlı filtreleme eklenebilir
- Çıkış yapma sorunu çözüldü
- Profil sayfası geliştirildi, daha fazla özellik eklenebilir

