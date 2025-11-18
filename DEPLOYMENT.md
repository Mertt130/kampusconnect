# 🚀 KampüsConnect - Production Deployment Kılavuzu

## 📋 Deployment Öncesi Kontrol Listesi

- [ ] Tüm environment variable'lar hazır
- [ ] Database migration'ları test edildi
- [ ] SSL sertifikası hazır
- [ ] Domain name alındı
- [ ] Email servisi yapılandırıldı
- [ ] Backup stratejisi belirlendi

## 🏗️ Önerilen Deployment Mimarisi

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│   Cloudflare    │────▶│   Vercel/       │
│   (CDN + DDoS)  │     │   Netlify       │
│                 │     │   (Frontend)    │
└─────────────────┘     └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  DigitalOcean/  │────▶│   PostgreSQL    │
│  AWS EC2        │     │   (Supabase/    │
│  (Backend API)  │     │    Neon)        │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│   Redis Cloud   │     │   AWS S3/       │
│   (Cache)       │     │   Cloudinary    │
│                 │     │   (Storage)     │
└─────────────────┘     └─────────────────┘
```

## 1️⃣ Database Deployment (Supabase)

### Adım 1: Supabase Hesabı
```bash
1. https://supabase.com adresine git
2. "Start your project" tıkla
3. GitHub ile giriş yap
4. "New Project" oluştur
   - Project name: kampusconnect-db
   - Database Password: Güçlü bir şifre
   - Region: Frankfurt (eu-central-1)
```

### Adım 2: Database URL'i Al
```bash
Settings > Database > Connection String > URI
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Adım 3: Migration Çalıştır
```bash
# Local'de
cd backend
DATABASE_URL="your-supabase-url" npx prisma migrate deploy
DATABASE_URL="your-supabase-url" npm run seed
```

## 2️⃣ Backend Deployment (DigitalOcean App Platform)

### Adım 1: DigitalOcean Hesabı
```bash
1. https://digitalocean.com kayıt ol
2. $200 free credit al (yeni hesaplar için)
```

### Adım 2: App Platform'da Yeni App
```bash
1. "Create" > "Apps"
2. "GitHub" seç
3. Repository'yi bağla: kampusconnect/backend
4. Branch: main
```

### Adım 3: App Yapılandırması
```yaml
name: kampusconnect-api
region: fra
services:
  - name: api
    environment_slug: node-js
    github:
      repo: your-github/kampusconnect
      branch: main
      deploy_on_push: true
    source_dir: /backend
    build_command: npm install && npx prisma generate
    run_command: npm start
    http_port: 5000
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
      - key: JWT_ACCESS_SECRET
        value: your-secret-here
      - key: JWT_REFRESH_SECRET
        value: your-secret-here
      - key: CORS_ORIGIN
        value: https://kampusconnect.com
```

### Adım 4: Environment Variables
```bash
Settings > App-Level Environment Variables:

NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=generate-strong-secret
JWT_REFRESH_SECRET=generate-strong-secret
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
FRONTEND_URL=https://kampusconnect.com
REDIS_URL=redis://...
```

## 3️⃣ Frontend Deployment (Vercel)

### Adım 1: Vercel'e Deploy
```bash
# Terminal'de
cd web
npx vercel

# Sorulara cevaplar:
? Set up and deploy "~/kampusconnect/web"? [Y/n] Y
? Which scope do you want to deploy to? Your Account
? Link to existing project? [y/N] N
? What's your project's name? kampusconnect
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

### Adım 2: Environment Variables
```bash
Vercel Dashboard > Settings > Environment Variables:

NEXT_PUBLIC_API_URL=https://kampusconnect-api.ondigitalocean.app/api
NEXT_PUBLIC_SOCKET_URL=https://kampusconnect-api.ondigitalocean.app
```

### Adım 3: Custom Domain
```bash
Settings > Domains:
1. "Add Domain"
2. kampusconnect.com ekle
3. DNS ayarlarını yap:
   A Record: 76.76.21.21
   CNAME: cname.vercel-dns.com
```

## 4️⃣ Redis Setup (Redis Cloud)

```bash
1. https://redis.com/try-free/
2. "New Database" oluştur
3. Free tier seç (30MB)
4. Connection string'i al:
   redis://default:password@redis-12345.c1.eu-central-1-1.ec2.cloud.redislabs.com:12345
```

## 5️⃣ Email Service (SendGrid)

```bash
1. https://sendgrid.com kayıt
2. Email API > Integration Guide > SMTP Relay
3. API Key oluştur
4. Backend .env'ye ekle:
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=your-api-key
```

## 6️⃣ File Storage (Cloudinary)

```bash
1. https://cloudinary.com kayıt
2. Dashboard'dan credentials al:
   Cloud Name: kampusconnect
   API Key: ...
   API Secret: ...
3. Backend'e entegre et
```

## 7️⃣ SSL & Security

### Cloudflare Setup
```bash
1. https://cloudflare.com
2. "Add Site" > kampusconnect.com
3. DNS kayıtlarını Cloudflare'e taşı
4. SSL/TLS > Full (strict)
5. Security > WAF > Enable
6. Speed > Optimization > Enable all
```

### Security Headers (Backend)
```javascript
// Zaten helmet ile yapılandırıldı
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 8️⃣ Monitoring & Analytics

### Sentry (Error Tracking)
```bash
npm install @sentry/node

# Backend'e ekle:
const Sentry = require("@sentry/node");
Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### Google Analytics
```html
<!-- Frontend'e ekle -->
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
```

### Uptime Monitoring
```bash
1. https://uptimerobot.com
2. New Monitor > HTTP(s)
3. URL: https://kampusconnect-api.ondigitalocean.app/health
4. Check Interval: 5 minutes
```

## 9️⃣ Backup Strategy

### Database Backup
```bash
# DigitalOcean Managed Database kullanıyorsanız:
- Otomatik daily backup
- Point-in-time recovery (7 gün)

# Manuel backup script:
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://kampusconnect-backups/
```

### Backup Schedule
- Database: Daily at 03:00 UTC
- User uploads: Real-time to S3
- Logs: Weekly rotation

## 🔟 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - run: doctl apps create-deployment ${{ secrets.APP_ID }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

## 📊 Maliyet Tahmini (Aylık)

| Servis | Plan | Maliyet |
|--------|------|---------|
| DigitalOcean App Platform | Basic | $5-10 |
| Supabase (Database) | Free/Pro | $0-25 |
| Vercel (Frontend) | Pro | $20 |
| SendGrid (Email) | Free/Essentials | $0-15 |
| Cloudinary (Storage) | Free/Plus | $0-89 |
| Domain (.com) | Yearly | $12/yıl |
| **TOPLAM** | | **$37-151/ay** |

## 🚨 Production Checklist

### Launch Öncesi
- [ ] Tüm API endpoint'leri test edildi
- [ ] Rate limiting aktif
- [ ] CORS production domain'e ayarlı
- [ ] Environment variable'lar doğru
- [ ] SSL sertifikası aktif
- [ ] Backup sistemi çalışıyor
- [ ] Error tracking kurulu
- [ ] Analytics kurulu
- [ ] Admin hesapları oluşturuldu
- [ ] Terms of Service hazır
- [ ] Privacy Policy hazır

### Launch Sonrası
- [ ] Monitoring aktif
- [ ] İlk kullanıcı kayıtları
- [ ] Performance metrikleri
- [ ] Error rate takibi
- [ ] User feedback toplama
- [ ] A/B testing hazırlığı

## 📞 Destek

Deployment sırasında sorun yaşarsanız:
- Email: devops@kampusconnect.com
- Discord: discord.gg/kampusconnect
- Docs: docs.kampusconnect.com

---

**🎉 Tebrikler! KampüsConnect artık production'da!**
