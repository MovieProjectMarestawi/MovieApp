# Veritabanını Görüntüleme Rehberi

Bu rehber, pgAdmin kullanarak veritabanını görüntüleme ve öğretmene gösterme adımlarını içerir.

## pgAdmin'e Erişim

1. Tarayıcıda açın: http://localhost:5050
2. Giriş yapın:
   - Email: admin@movieapp.com
   - Password: admin

## Veritabanına Bağlanma

### İlk Kez Bağlanma

1. pgAdmin açıldığında sol panelde "Servers" görünecek
2. "Servers" üzerine sağ tıklayın > "Register" > "Server..."
3. **General Tab:**
   - Name: `MovieApp DB`
4. **Connection Tab:**
   - Host name/address: `postgres` (önemli: localhost değil!)
   - Port: `5432`
   - Maintenance database: `moviehub`
   - Username: `postgres`
   - Password: `.env` dosyasındaki `DB_PASS` değeri (varsayılan: `465546`)
5. "Save" butonuna tıklayın

### Sonraki Kullanımlar

- Sol panelde "MovieApp DB" server'ına tıklayın
- Şifre sorarsa: `.env` dosyasındaki `DB_PASS` değerini girin

## Veritabanı Yapısını Gösterme

### Tabloları Görüntüleme

1. Sol panelde şu yolu takip edin:
   ```
   Servers
   └── MovieApp DB
       └── Databases
           └── moviehub
               └── Schemas
                   └── public
                       └── Tables
   ```

2. Tables klasöründe tüm tablolar görünecek:
   - `users` - Kullanıcılar
   - `reviews` - Film yorumları
   - `favorites` - Favori filmler
   - `groups` - Gruplar
   - `group_members` - Grup üyeleri
   - `join_requests` - Katılım istekleri
   - `group_content` - Grup içeriği (filmler)

### Tablo İçeriğini Görüntüleme

1. İstediğiniz tabloya sağ tıklayın
2. "View/Edit Data" > "All Rows" seçin
3. Tablodaki tüm veriler görünecek

### Tablo Yapısını (Schema) Görüntüleme

1. Tabloya sağ tıklayın
2. "Properties" seçin
3. "Columns" tab'ında tüm kolonlar ve tipleri görünecek

## SQL Sorguları Çalıştırma

### Query Tool Kullanımı

1. Sol panelde "moviehub" veritabanına sağ tıklayın
2. "Query Tool" seçin
3. SQL sorgusu yazın
4. Execute (F5) veya Run (▶️) butonuna tıklayın

### Örnek Sorgular

```sql
-- Tüm kullanıcıları listele
SELECT * FROM users;

-- Toplam kullanıcı sayısı
SELECT COUNT(*) as total_users FROM users;

-- Tüm grupları listele
SELECT * FROM groups;

-- Grup sayısı
SELECT COUNT(*) as total_groups FROM groups;

-- Tüm yorumları listele
SELECT * FROM reviews;

-- En çok yorum yapan kullanıcılar
SELECT u.email, COUNT(r.id) as review_count
FROM users u
LEFT JOIN reviews r ON u.id = r.user_id
GROUP BY u.id, u.email
ORDER BY review_count DESC;

-- Favori film sayısı
SELECT COUNT(*) as total_favorites FROM favorites;

-- Grup üye sayıları
SELECT g.name, COUNT(gm.id) as member_count
FROM groups g
LEFT JOIN group_members gm ON g.id = gm.group_id
GROUP BY g.id, g.name
ORDER BY member_count DESC;

-- Bekleyen katılım istekleri
SELECT * FROM join_requests WHERE status = 'pending';
```

## Veritabanı İlişkilerini Gösterme

1. Sol panelde "moviehub" veritabanına sağ tıklayın
2. "ERD Tool" (Entity Relationship Diagram) seçin
3. Tüm tablolar ve ilişkileri görsel olarak gösterilir

## Öğretmene Gösterme İçin Öneriler

### 1. Tablo Yapısını Gösterin
- Her tablonun kolonlarını ve veri tiplerini gösterin
- İlişkileri (Foreign Keys) açıklayın

### 2. Örnek Verileri Gösterin
- Her tabloda birkaç örnek kayıt gösterin
- Verilerin gerçek kullanımdan geldiğini belirtin

### 3. İlişkileri Açıklayın
- users → reviews (Bir kullanıcı birden fazla yorum yapabilir)
- users → favorites (Bir kullanıcı birden fazla favori ekleyebilir)
- groups → group_members (Bir grup birden fazla üyeye sahip olabilir)
- groups → group_content (Bir grup birden fazla film içerebilir)

### 4. SQL Sorguları Çalıştırın
- Basit SELECT sorguları
- JOIN sorguları (ilişkili tabloları birleştirme)
- COUNT, GROUP BY gibi aggregate fonksiyonlar

### 5. Veritabanı Şemasını Gösterin
- ERD Tool ile görsel şema
- docs/DATABASE_MODEL.md dosyasını referans gösterin

## Hızlı Erişim Bilgileri

- **pgAdmin URL:** http://localhost:5050
- **pgAdmin Email:** admin@movieapp.com
- **pgAdmin Password:** admin
- **Database Host:** postgres (Docker container adı)
- **Database Port:** 5432
- **Database Name:** moviehub
- **Database User:** postgres
- **Database Password:** .env dosyasındaki DB_PASS değeri

## Notlar

- Docker container'ları çalışıyorsa veritabanı erişilebilir
- pgAdmin container'ı çalışmıyorsa: `docker-compose up -d pgadmin`
- Veritabanı container'ı çalışmıyorsa: `docker-compose up -d postgres`
- Tüm servisleri kontrol etmek için: `docker-compose ps`

