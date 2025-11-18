# 🚀 KampüsConnect - Hızlı Deployment Rehberi

## ⚡ Railway ile 10 Dakikada Deploy (ÖNERİLEN)

### 1️⃣ GitHub'a Yükle (5 dakika)

```bash
# Terminal'de projenin ana dizininde:
git init
git add .
git commit -m "Initial commit - KampüsConnect"

# GitHub'da yeni repository oluştur: kampusconnect
# Sonra:
git remote add origin https://github.com/KULLANICI_ADIN/kampusconnect.git
git branch -M main
git push -u origin main
```

### 2️⃣ Railway Hesabı Oluştur (2 dakika)

1. https://railway.app adresine git
2. "Login with GitHub" tıkla
3. GitHub hesabınla giriş yap
4. $5 ücretsiz kredi al

### 3️⃣ Backend Deploy (2 dakika)

1. Railway Dashboard'da "New Project" tıkla
2. "Deploy from GitHub repo" seç
3. `kampusconnect` repository'sini seç
4. "Add variables" tıkla ve şunları ekle:

```env
NODE_ENV=production
PORT=5000
JWT_ACCESS_SECRET=kampusconnect_jwt_access_secret_2024_production_key_32chars_CHANGE_THIS
JWT_REFRESH_SECRET=kampusconnect_jwt_refresh_secret_2024_production_key_32chars_CHANGE_THIS
JWT_SECRET=kampusconnect_jwt_main_secret_2024_production_key_32chars_CHANGE_THIS
JWT_EXPIRE=7d
JWT_REMEMBER_EXPIRE=30d
CORS_ORIGIN=*
SOCKET_CORS_ORIGIN=*
```

5. "Add PostgreSQL" tıkla (otomatik database)
6. "Add Redis" tıkla (otomatik cache)
7. "Deploy" tıkla

### 4️⃣ Frontend Deploy (1 dakika)

1. Railway'de "New" > "GitHub Repo" > `kampusconnect` seç
2. Root directory: `/web` olarak ayarla
3. "Add variables":

```env
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.railway.app/api
```

4. "Deploy" tıkla

### 5️⃣ Database Migration

Railway backend terminalinde:

```bash
npx prisma migrate deploy
npm run seed
```

### ✅ TAMAMLANDI!

Artık projeniz 7/24 çalışıyor ve GitHub'a her push yaptığınızda otomatik güncellenecek!

---

## 🔄 Otomatik Güncelleme Nasıl Çalışır?

1. Kodunuzda değişiklik yap
2. Git commit yap:
   ```bash
   git add .
   git commit -m "Yeni özellik eklendi"
   git push
   ```
3. Railway otomatik olarak:
   - Yeni kodu çeker
   - Build yapar
   - Test eder
   - Deploy eder
   - **~2-3 dakikada canlıya alır**

---

## 💰 Maliyet

**Railway Free Tier:**
- $5 ücretsiz kredi/ay
- Küçük projeler için yeterli
- Kredi bitince: $5-10/ay

**Toplam: İlk ay ücretsiz, sonra ~$5-10/ay**

---

## 🌐 Custom Domain Bağlama (Opsiyonel)

1. Railway Dashboard > Settings > Domains
2. "Custom Domain" ekle: `api.kampusconnect.com`
3. DNS ayarlarında CNAME ekle:
   ```
   api.kampusconnect.com -> YOUR-APP.railway.app
   ```

---

## 📊 Monitoring

Railway Dashboard'da:
- ✅ CPU/RAM kullanımı
- ✅ Request sayısı
- ✅ Error logları
- ✅ Deploy geçmişi

---

## 🆘 Sorun Giderme

### Backend çalışmıyor?
```bash
# Railway terminalinde:
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

### Frontend API'ye bağlanamıyor?
- `NEXT_PUBLIC_API_URL` doğru mu kontrol et
- CORS ayarlarını kontrol et

### Database bağlantı hatası?
- Railway'de PostgreSQL servisinin çalıştığından emin ol
- `DATABASE_URL` environment variable'ı otomatik eklendi mi kontrol et

---

## 🎉 Alternatif: Vercel + Supabase (Tamamen Ücretsiz)

### Backend için Vercel Serverless:

1. `backend/vercel.json` oluştur:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

2. Deploy:
```bash
cd backend
npx vercel
```

### Database için Supabase:

1. https://supabase.com - ücretsiz hesap
2. New Project oluştur
3. Connection string'i al
4. Vercel'de environment variable olarak ekle

**Maliyet: $0/ay (Hobby projeler için yeterli)**

---

## 📞 Destek

Sorun yaşarsanız:
- Railway Docs: https://docs.railway.app
- Discord: Railway Community
- Email: support@railway.app
