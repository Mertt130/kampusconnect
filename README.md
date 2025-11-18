# KampüsConnect - Üniversite Öğrencileri ve Yeni Mezunlar İçin İş Platformu

## 🎯 Proje Hakkında

KampüsConnect, üniversite öğrencileri ve yeni mezunları (mezuniyet sonrası 2 yıl) işverenlerle buluşturan yenilikçi bir kariyer platformudur.

## 🚀 Özellikler

### Kullanıcı Rolleri
- **Öğrenci/Yeni Mezun**: Profil oluşturma, iş arama, başvuru yapma, mesajlaşma
- **İşveren**: İlan oluşturma, başvuru yönetimi, aday arama, mesajlaşma
- **Yönetici**: Platform yönetimi, onay süreçleri, analitik, moderasyon

### Temel Özellikler
- ✅ Email ile kayıt/giriş + Face ID/Touch ID
- ✅ Detaylı profil sistemi (CV, sertifika, portfolio, projeler)
- ✅ İlan oluşturma ve yönetimi
- ✅ Gelişmiş arama ve filtreleme
- ✅ Tek tık başvuru sistemi
- ✅ Real-time mesajlaşma (dosya paylaşımı dahil)
- ✅ Akıllı iş eşleştirme algoritması
- ✅ Email + Push + WhatsApp bildirimleri
- ✅ Yönetici onay ve moderasyon paneli
- ✅ Şirket takip sistemi
- ✅ Etkinlik/Webinar duyuruları
- ✅ Blog ve kariyer tavsiyeleri
- ✅ Offline mod desteği
- ✅ Kamera ile CV tarama

### Güvenlik ve Doğrulama
- Öğrenci belgesi yükleme ve yönetici onayı
- İşveren başvuru sistemi (şirket bilgileri, vizyon, hedefler)
- Şikayet ve moderasyon sistemi
- Kullanıcı banlama yetkisi

## 🛠️ Teknoloji Stack

### Frontend
- React Native + Expo (iOS, Android, Web)
- NativeWind (TailwindCSS for React Native)
- React Navigation
- Expo Camera (CV tarama)
- Expo Local Authentication (Face ID/Touch ID)

### Backend
- Node.js + Express
- Socket.io (Real-time messaging)
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Passport.js

### Storage & Services
- AWS S3 / Cloudinary (Dosya depolama)
- NodeMailer (Email)
- Expo Notifications (Push)
- Twilio (WhatsApp - opsiyonel)

### Deployment
- Backend: Vercel / Railway
- Database: Railway / Supabase
- Mobile: Expo EAS Build

## 📁 Proje Yapısı

```
kampus-connect/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Konfigürasyon
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, validation vb.
│   │   ├── models/         # Prisma models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Yardımcı fonksiyonlar
│   │   └── socket/         # Socket.io handlers
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── package.json
│   └── .env
│
├── mobile/                  # React Native + Expo
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── screens/        # App screens
│   │   ├── navigation/     # Navigation setup
│   │   ├── services/       # API calls
│   │   ├── store/          # State management
│   │   ├── utils/          # Helpers
│   │   └── assets/         # Images, fonts
│   ├── app.json
│   ├── package.json
│   └── tailwind.config.js
│
└── docs/                    # Dokümantasyon
    ├── API.md
    ├── DATABASE.md

#### Moderatör
- ✅ Şirket doğrulama
- ✅ Şikayet yönetimi
- ✅ İçerik moderasyonu
- ✅ Kullanıcı uyarma

### 🔒 Güvenlik
- ✅ JWT tabanlı authentication
- ✅ Refresh token mekanizması
- ✅ Session persistence
- ✅ Rate limiting
- ✅ SQL injection koruması
- ✅ XSS koruması
- ✅ CORS yapılandırması
- ✅ Input validation
- ✅ Secure password hashing

## 🚀 Kurulum

### Gereksinimler
- Node.js 20+
- PostgreSQL 15+
- Redis (opsiyonel)
- Docker (önerilen)

### 1. Repository'yi Klonla

```bash
git clone https://github.com/your-repo/kampusconnect.git
cd kampusconnect
```

### 2. Backend Kurulumu

```bash
cd backend

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env
# .env dosyasını düzenle

# Docker ile veritabanını başlat
docker-compose up -d

### Faz 6: Optimizasyon
- [ ] Performance tuning
- [ ] Security hardening
- [ ] Testing
- [ ] Deployment

## 📄 Lisans

Tüm hakları saklıdır © 2024 KampüsConnect

## 👥 İletişim

Proje sahibi: [İsim]
Email: [Email]
