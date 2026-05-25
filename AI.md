# 🛡️ AwasLink Back-End — Project Blueprint & Context Specification

AwasLink adalah platform penyedia arsitektur RESTful API terintegrasi yang berfungsi sebagai "Pusat Kendali" dalam mendeteksi indikasi penipuan digital murni teks (*scam NLP*) sekaligus tautan berbahaya (*phishing*). 

Dokumen ini dirancang khusus untuk memastikan pengembang maupun model kecerdasan buatan (AI) dapat memahami perencanaan, struktur data, arsitektur jaringan, alur logika, serta implementasi teknis proyek secara instan tanpa kesalahan konteks.

---

## 1. Arsitektur Sistem & Alur Kerja Data (Data Flow)

AwasLink menerapkan arsitektur decoupled berbasis **Model-View-Controller (MVC)** pada sisi *Back-End* (Node.js/Express.js) yang menjembatani *Front-End* (React/Vue UI) dengan *Inference Machine Learning Server* yang di-*hosting* di Hugging Face Spaces (FastAPI/TensorFlow).

[ FRONT-END (Gilang UI) ]
│
│ (1) POST /api/v1/scans { message_content }
▼
[ BACK-END EXPRESS.JS ] ──(2) Validasi Karakter & Tipe Data
│
│ (3) POST /predict { message: message_content } (Timeout 15s)
▼
[ HUGGING FACE SPACES ] ──(4) Model ANN (TensorFlow) + TF-IDF Vectorizer
│
│ (5) Response JSON { verdict, confidence, message }
▼
[ BACK-END EXPRESS.JS ]
│
│ (6) Sinkronisasi ORM Prisma (Connection Pool / Singleton)
▼
[ DATABASE POSTGRESQL ]
│
│ (7) Write Record ke Tabel scan_logs
▼
[ FRONT-END (Gilang UI) ] ──(8) Render UI Kartu Status & Skor Akurasi


### Mekanisme Fault-Tolerance (Anti-Crash)
Sistem dilengkapi dengan pembatas *Error Boundary* terisolasi menggunakan blok `try-catch` independen pada lapisan *networking call* (Axios). Jika terjadi gangguan konektivitas, kegagalan internal *Inference Server*, atau *Cold Start* pada Hugging Face Spaces, *Back-End* akan menangkap *error* secara anggun dan mengembalikan kode status HTTP **503 Service Unavailable**, mencegah seluruh peladen Node.js mengalami kegagalan fatal (*crash*).

---

## 2. Spesifikasi Tech Stack & Library Dependensi

### Core Runtime & Framework
* **Runtime Environment:** Node.js (v18+ LTS)
* **Web Framework:** Express.js (v5.2.1) — Menangani manajemen *routing*, *middleware*, dan *parsing request body*.

### Database & ORM Layer
* **Object-Relational Mapping (ORM):** Prisma ORM (v7.8.0)
* **Database Engine:** PostgreSQL (v14+)
* **Driver & Adapter:** `@prisma/adapter-pg` (^7.8.0) bersama library `pg` (^8.20.0). Digunakan untuk mengimplementasikan *Native Driver Adapter* murni Node.js guna mereduksi beban *binary engine* bawaan Prisma dan mengoptimalkan performa manajemen memori.

### Security & Authentication
* **Helmet.js (v8.1.0):** Mengamankan HTTP Headers (mencegah XSS, Clickjacking, dan MIME-type sniffing).
* **CORS (v2.8.6):** Mengatur kebijakan pembatasan akses lintas asal domain (*Cross-Origin Resource Sharing*).
* **BcryptJS (v2.4.3):** Mengamankan enkripsi satu arah (*cryptographic hashing*) kata sandi akun Admin sebelum disimpan di database dengan tingkat kompleksitas *Salt Rounds* = 10.
* **JSON Web Token / JWT (v9.0.2):** Menyediakan mekanisme otentikasi berbasis token (*stateless token authentication*) dengan masa kedaluwarsa 24 jam (`1d`).

### Networking & Documentation
* **Axios (v1.16.0):** HTTP Client berbasis *promise* untuk melakukan *networking calls* asinkron ke server AI Hugging Face.
* **Swagger UI Express (v5.0.1) & Swagger JSDoc (v6.2.8):** Generator antarmuka dokumentasi API interaktif berbasis anotasi YAML langsung di dalam file *routing*.

---

## 3. Struktur Direktori Proyek

AwasLink BE mengadopsi standar tata kelola folder industri dengan pemisahan tanggung jawab (*Separation of Concerns*):

awas-link-be/
├── node_modules/             # Dependensi library npm (terisolasi)
├── prisma/                   # Rumah konfigurasi Prisma ORM
│   ├── migrations/           # Direktori riwayat Save State skema SQL database
│   ├── schema.prisma         # Definisi struktur skema data aplikasi
│   └── seed.js               # Skrip inisialisasi awal (seeding) data Admin default
├── src/                      # Source Code utama aplikasi
│   ├── config/               # Modul konfigurasi global instansiasi server
│   │   ├── database.js       # Setup Pool koneksi PostgreSQL & Singleton PrismaClient
│   │   └── swagger.js        # Dokumen konfigurasi metadata OpenAPI/Swagger
│   ├── controllers/          # Logika Bisnis Utama (Business Logic Layer)
│   │   ├── authController.js # Logika registrasi token JWT & verifikasi admin
│   │   ├── dashboardController.js # Logika pemrosesan data agregat publik & admin
│   │   └── scanController.js # Logika inti validasi teks, Axios call AI, & Prisma write
│   ├── middleware/           # Interceptor request HTTP
│   │   └── authMiddleware.js # Satpam pemeriksa validitas token JWT di header HTTP
│   ├── routes/               # Pemetaan URL Endpoint API (Routing Layer)
│   │   ├── authRoutes.js     # Endpoint login admin (/api/v1/auth)
│   │   ├── dashboardRoutes.js# Endpoint data dashboard (/api/v1/dashboard)
│   │   └── scanRoutes.js     # Endpoint pemindaian teks (/api/v1/scans)
│   └── app.js                # Konfigurasi middleware global Express & registrasi router
├── .env                      # Kunci rahasia & variabel lingkungan (wajib disembunyikan)
├── .gitignore                # Daftar file/folder yang dilarang diunggah ke GitHub
├── index.js                  # Entry Point utama aplikasi (menyalakan port & koneksi DB)
├── package.json              # Manifes proyek, daftar dependensi, dan skrip eksekusi
└── prisma.config.js          # File konfigurasi datasource database mutlak untuk Prisma v7


---

## 4. Struktur Skema Database (`prisma/schema.prisma`)

Sesuai dengan standarisasi Prisma versi 7, berkas skema difokuskan murni pada representasi struktur entitas tabel tanpa menyimpan URL koneksi mentah (URL dipindahkan ke `prisma.config.js`).

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  // Koneksi datasource dialihkan mutlak ke file prisma.config.js
}

// Tabel Riwayat Pemindaian (Log Wall Publik & Dasbor Admin)
model ScanLog {
  id                 String   @id @default(uuid()) @db.Uuid
  messageContent     String   @map("message_content") @db.Text
  messageRiskScore   Float?   @map("message_risk_score") // Menyimpan skor keyakinan persentase dari AI
  finalStatus        String   @map("final_status") @db.VarChar(50) // Menyimpan vonis: "Phishing/Scam" atau "Aman"
  createdAt          DateTime @default(now()) @map("created_at")

  @@map("scan_logs")
}

// Tabel Autentikasi Pengelola Aplikasi
model Admin {
  id           String   @id @default(uuid()) @db.Uuid
  username     String   @unique @db.VarChar(100)
  passwordHash String   @map("password_hash") @db.VarChar(255) // Menyimpan password yang sudah di-hash bcrypt
  createdAt    DateTime @default(now()) @map("created_at")

  @@map("admins")
}
5. Spesifikasi Kontrak API & Endpoint (RESTful API)
Seluruh endpoint API menggunakan prefiks versi global /api/v1.

A. Fitur Inti Pemindaian Teks (Core Detection Feature)
Endpoint: POST /api/v1/scans

Akses: Publik (Tanpa Token)

Aturan Validasi Input:

message_content tidak boleh kosong, wajib bertipe string.

Panjang karakter maksimal 3000 karakter untuk menjaga performa tokenisasi model NLP AI.

Format Request Body (JSON):

JSON
{
  "message_content": "Selamat! Nomor Anda terpilih mendapatkan hadiah Rp 50 Juta dari Bank BCA. Segera klik link: bit.ly/hadiahbca"
}
Format Response Sukses (200 OK):

JSON
{
  "success": true,
  "message": "Pesan berhasil dianalisis oleh AI.",
  "data": {
    "id": "e4ba39d5-4560-449a-bd9b-cba068018df5",
    "messageContent": "Selamat! Nomor Anda terpilih mendapatkan hadiah Rp 50 Juta dari Bank BCA. Segera klik link: bit.ly/hadiahbca",
    "messageRiskScore": 98.5,
    "finalStatus": "Phishing/Scam",
    "createdAt": "2026-05-22T07:15:30.123Z"
  }
}
B. Otentikasi Admin (Authentication Feature)
Endpoint: POST /api/v1/auth/login

Akses: Publik

Format Request Body (JSON):

JSON
{
  "username": "admin",
  "password": "adminpassword123"
}
Format Response Sukses (200 OK):

JSON
{
  "success": true,
  "message": "Login berhasil.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFhMm..."
}
C. Dinding Riwayat Publik (Public History Wall)
Endpoint: GET /api/v1/dashboard/public/history

Akses: Publik

Logika Bisnis: Mengambil maksimal 20 data pemindaian terbaru (take: 20, orderBy: { createdAt: 'desc' }) untuk di-mapping oleh Front-End ke dalam komponen feed UI riwayat publik secara utuh.

Format Response Sukses (200 OK):

JSON
{
  "success": true,
  "message": "Berhasil mengambil riwayat pemindaian publik.",
  "data": {
    "total_scanned": 1420,
    "history": [
      {
        "id": "e4ba39d5-4560-449a-bd9b-cba068018df5",
        "messageContent": "Selamat! Nomor Anda terpilih mendapatkan hadiah...",
        "finalStatus": "Phishing/Scam",
        "messageRiskScore": 98.5,
        "createdAt": "2026-05-22T07:15:30.123Z"
      }
    ]
  }
}
D. Log Dasbor Lengkap Admin (Admin Private Dashboard)
Endpoint: GET /api/v1/dashboard/admin/logs

Akses: Privat (Wajib menyertakan token JWT pada header HTTP Authorization: Bearer <TOKEN>)

Logika Bisnis: Mengembalikan seluruh riwayat log tanpa batasan limit untuk dianalisis oleh Admin atau diekspor sebagai dataset pembelajaran model AI selanjutnya.

6. Sinkronisasi Integrasi Endpoint Machine Learning (FastAPI)
Back-End terhubung ke server inferensi AI eksternal yang berjalan di Hugging Face Spaces dengan alamat:
https://lyalythia-awaslink-api.hf.space

Struktur Integrasi Axios:
Endpoint Tujuan: ${process.env.AI_SERVICE_URL}/predict

Metode HTTP: POST

Kontrak Request Payload (Wajib Sesuai Skema Pydantic MessageInput Python):

Key parameter yang dikirim harus bernama message (bukan text atau message_content).

JSON
{
  "message": "Teks mentah dari input pengguna"
}
Kontrak Response dari FastAPI:

AI memproses teks melalui kombinasi 22 fitur ekstraksi manual (Regex) dan 1.000 fitur berbasis pembobotan TF-IDF untuk dimasukkan ke model klasifikasi ANN (Artificial Neural Network).

Output yang dikembalikan berupa JSON murni dengan format:

JSON
{
  "verdict": "Phishing/Scam", 
  "confidence": 95.50, 
  "message": "..."
}
7. Cetak Biru Konfigurasi Variabel Lingkungan (.env)
Konfigurasi file .env di lingkungan lokal wajib memiliki variabel kontrol berikut agar sistem berjalan normal:

Code snippet
# Port Peladen Node.js/Express
PORT=3000

# Konfigurasi Database Utama PostgreSQL (Prisma)
DATABASE_URL="postgresql://<db_username>:<db_password>@<db_host>:<db_port>/<db_name>?schema=public"

# Konfigurasi Alamat Kluster Jaringan Kecerdasan Buatan (AI)
AI_SERVICE_URL="[https://lyalythia-awaslink-api.hf.space](https://lyalythia-awaslink-api.hf.space)"

# Kunci Enkripsi Kriptografi untuk Tanda Tangan Digital Token JWT Admin
JWT_SECRET="rahasia_awaslink_super_aman_123"

# Environment Mode Kontrol
NODE_ENV="development"
8. Panduan Mengaktifkan Sistem dari Nol
Langkah 1: Instalasi Paket Dependensi
Bash
npm install
Langkah 2: Pemetaan Paksa Sinkronisasi Database
Untuk menyelaraskan struktur PostgreSQL tanpa merusak tabel relasional internal dalam fase pengembangan, gunakan perintah force push Prisma:

Bash
npx prisma db push
npx prisma generate
Langkah 3: Suntik Akun Akses Admin Awal (Database Seeding)
Jalankan skrip penyemaian data bawaan untuk membuat akun admin pertama secara otomatis:

Bash
node prisma/seed.js
Kredensial Default:

Username: admin

Password: adminpassword123

Langkah 4: Jalankan Mesin Utama
Bash
npm run dev
Langkah 5: Buka Sandbox Pengujian Dokumentasi API
Buka peramban (browser) Anda dan akses halaman Swagger untuk uji coba tembak endpoint nyata:
👉 http://localhost:3000/api-docs

Dibuat dengan ❤️ oleh Tim Back-End AwasLink