# AwasLink Back-End — Project Context for AI

> File ini adalah sumber kebenaran (source of truth) untuk AI assistant.
> Baca file ini terlebih dahulu sebelum melakukan perubahan apapun agar tidak menebak-nebak.

---

## 1. Ringkasan Proyek

**AwasLink** adalah RESTful API server untuk mendeteksi pesan scam/phishing.
Pengguna mengirim teks pesan → Back-End meneruskan ke AI service → AI menganalisis → Hasil disimpan ke database → Dikembalikan ke Front-End.

| Aspek          | Detail                                                    |
| -------------- | --------------------------------------------------------- |
| Runtime        | Node.js (v18+ LTS)                                       |
| Framework      | Express.js v5.2.1                                        |
| ORM            | Prisma v7.8.0 dengan `@prisma/adapter-pg` (native driver)|
| Database       | PostgreSQL (Supabase, via PgBouncer connection pooling)   |
| AI Service     | FastAPI di Hugging Face Spaces (model ANN + TF-IDF)       |
| Auth           | JWT (jsonwebtoken) + bcryptjs                             |
| Docs           | Swagger UI di `/api-docs`                                 |

---

## 2. Arsitektur & Alur Data

[PUBLIC — tanpa auth]

Front-End ──POST /api/v1/scans──► scanController.scanMessage
                                      │
                                      ▼
                                 scanService.analyzeAndSaveMessage
                                      │
                          ┌───────────┴───────────┐
                          │ axios.post → AI       │
                          │ (HuggingFace /predict) │
                          └───────────┬───────────┘
                                      │
                                      ▼
                               prisma.scanLog.create → Response ke FE

Front-End ──GET /api/v1/scans/history──► scanController.getPublicHistory
                                              │
                                              ▼
                                        scanService.getPublicHistory
                                              │
                                              ▼
                                        prisma.scanLog (count + findMany 20 terbaru)

Front-End ──POST /api/v1/auth/login──► authController → authService → JWT token

[PRIVATE — wajib JWT Bearer token]

Admin FE  ──GET /api/v1/admin/logs?page=1&limit=20&status=Aman
              │
              ▼
         (authMiddleware) → adminController.getAdminLogs
                                  │ parsing query params
                                  ▼
                            adminService.getAdminLogs(page, limit, status)
                                  │
                                  ▼
                            prisma.scanLog (count + findMany with pagination & filter)

Admin FE  ──DELETE /api/v1/admin/logs/:id──► (authMiddleware) → adminController → adminService
Admin FE  ──DELETE /api/v1/admin/logs──► (authMiddleware) → adminController → adminService

---

## 3. Struktur Folder & Tanggung Jawab Setiap File

```
awas-link-BE/
├── index.js                    # Entry point. Load dotenv, start Express server.
├── prisma.config.js            # Konfigurasi Prisma v7 (datasource DIRECT_URL untuk migrasi)
├── package.json                # Dependencies dan npm scripts
│
├── prisma/
│   ├── schema.prisma           # Definisi tabel: ScanLog, Admin
│   ├── seed.js                 # Buat akun admin default (upsert, idempotent)
│   └── migrations/             # History migrasi SQL
│
└── src/
    ├── app.js                  # Konfigurasi Express: middleware, swagger, route aggregator
    │
    ├── config/
    │   ├── database.js         # Prisma Client singleton (PgBouncer adapter)
    │   └── swagger.js          # Konfigurasi OpenAPI 3.0 + reusable schemas
    │
    ├── middleware/
    │   └── authMiddleware.js   # JWT verification → attach req.admin
    │
    ├── routes/
    │   ├── scanRoutes.js       # POST / (scan), GET /history (riwayat publik)
    │   ├── authRoutes.js       # POST /login
    │   └── adminRoutes.js      # GET /logs, DELETE /logs/:id, DELETE /logs (semua JWT)
    │
    ├── controllers/            # Terima request, validasi input, panggil service, kirim response
    │   ├── scanController.js   # scanMessage, getPublicHistory
    │   ├── authController.js   # loginAdmin
    │   ├── adminController.js  # getAdminLogs, deleteScanLog, deleteAllScanLogs
    │
    ├── services/               # Business logic & query database (tidak tahu soal req/res)
    │   ├── scanService.js      # analyzeAndSaveMessage, getPublicHistory
    │   ├── authService.js      # loginAdmin (verify password + generate JWT)
    │   └── adminService.js     # getAdminLogs (pagination+filter), deleteScanLog, deleteAllScanLogs
    │
    └── utils/
        └── response.js         # sendSuccess(res, statusCode, message, data?)
                                # sendError(res, statusCode, message)
```

---

## 4. Layered Architecture — Aturan Antar Layer

```
Routes → Controllers → Services → Prisma (database)
                 ↘ utils/response.js
```

| Layer        | Boleh                                          | TIDAK Boleh                                     |
| ------------ | ---------------------------------------------- | ------------------------------------------------ |
| **Routes**   | Definisi path, swagger docs, middleware chain   | Logic bisnis, query DB, format response           |
| **Controllers** | Validasi input dasar (cek kosong, UUID format), panggil service, kirim response via `sendSuccess`/`sendError` | Query database, parsing pagination, filter logic  |
| **Services** | Query database (prisma), logic bisnis, parsing & validasi params (pagination, filter, limit cap), throw Error dengan `statusCode` | Import `req`/`res`, format HTTP response          |
| **Utils**    | Helper functions yang reusable                  | Import prisma, logic bisnis                       |

> **Penting:** Controller meneruskan `req.query` mentah ke service. Service yang bertanggung jawab parsing `page`, `limit`, `status` dan menerapkan default values serta validasi (misal: limit max 100, page min 1).

### Pola Error Handling (Service → Controller)

Service melempar Error dengan property `statusCode`:
```js
// Di service
const err = new Error('Log scan tidak ditemukan.');
err.statusCode = 404;
throw err;
```

Controller menangkap dan meneruskan:
```js
// Di controller
catch (error) {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Terjadi kesalahan pada server.' : error.message;
  console.error('namaFunction Error:', error.message);
  return sendError(res, statusCode, message);
}
```

---

## 5. Database Schema (Prisma)

```prisma
model ScanLog {
  id               String   @id @default(uuid()) @db.Uuid
  messageContent   String   @map("message_content") @db.Text
  messageRiskScore Float?   @map("message_risk_score")    // Skor confidence dari AI (0-100)
  finalStatus      String   @map("final_status") @db.VarChar(50) // "Phishing/Scam" atau "Aman"
  createdAt        DateTime @default(now()) @map("created_at")
  deletedAt        DateTime? @map("deleted_at") // Untuk fitur soft delete
  @@map("scan_logs")
}

model Admin {
  id           String   @id @default(uuid()) @db.Uuid
  username     String   @unique @db.VarChar(100)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  createdAt    DateTime @default(now()) @map("created_at")
  @@map("admins")
}
```

**Konvensi penamaan:**
- Prisma model: `camelCase` (contoh: `messageContent`)
- Kolom SQL aktual: `snake_case` (contoh: `message_content`) via `@map()`
- Nama tabel SQL: plural `snake_case` (contoh: `scan_logs`) via `@@map()`

### Koneksi Database (Supabase)

| Variabel       | Kegunaan                                    | Port |
| -------------- | ------------------------------------------- | ---- |
| `DATABASE_URL` | Runtime (query) — via PgBouncer pooling     | 6543 |
| `DIRECT_URL`   | Migrasi Prisma — direct connection          | 5432 |

- `database.js` → menggunakan `DATABASE_URL` untuk `Pool` + `PrismaPg` adapter
- `prisma.config.js` → menggunakan `DIRECT_URL` untuk migrasi

---

## 6. API Endpoints (Kontrak untuk Front-End)

### Semua response mengikuti format:
```json
// Sukses
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "..." }
```

### Public Endpoints (tanpa auth)

#### `POST /api/v1/scans` — Pindai pesan
```json
// Request body
{ "message_content": "Teks pesan yang akan dipindai" }

// Response 200
{
  "success": true,
  "message": "Pesan berhasil dianalisis oleh AI.",
  "data": {
    "id": "uuid",
    "messageContent": "...",
    "messageRiskScore": 98.5,
    "finalStatus": "Phishing/Scam",
    "createdAt": "2026-05-22T07:15:30.123Z"
  }
}
```
- Error 400: `message_content` kosong atau bukan string
- Error 503: AI service tidak bisa dihubungi (timeout 15 detik)

#### `GET /api/v1/scans/history` — Riwayat scan publik
Mendukung parameter pagination dan filter:
- `page` (default: 1)
- `limit` (default: 20, max 100)
- `status` (opsional: `"Phishing/Scam"` atau `"Aman"`)

```json
// Response 200
{
  "success": true,
  "message": "Berhasil mengambil riwayat pemindaian publik.",
  "data": {
    "total_scanned": 1420,
    "pagination": { "total": 1420, "page": 1, "limit": 20, "totalPages": 71 },
    "history": [
      { "id": "uuid", "messageContent": "...", "finalStatus": "...", "messageRiskScore": 98.5, "createdAt": "..." }
    ]
  }
}
```

#### `POST /api/v1/auth/login` — Login admin
```json
// Request body
{ "username": "admin", "password": "adminpassword123" }

// Response 200
{
  "success": true,
  "message": "Login berhasil.",
  "data": { "token": "eyJhbGciOi..." }
}
```
- Error 400: Username/password tidak diisi
- Error 401: Kredensial salah

---

### Private Endpoints (wajib header `Authorization: Bearer <token>`)

#### `GET /api/v1/admin/logs` — Semua log + statistik
`adminService.getAdminLogs` mendukung parameter pagination dan filter:
- `page` (default: 1)
- `limit` (default: 20)
- `status` (opsional: `"Phishing/Scam"` atau `"Aman"`)

```json
// Response 200
{
  "success": true,
  "message": "Berhasil mengambil seluruh log pemindaian.",
  "data": {
    "summary": { "total_scanned": 1420, "total_phishing": 980, "total_aman": 440 },
    "pagination": { "total": 1420, "page": 1, "limit": 20, "totalPages": 71 },
    "logs": [ { ... } ]
  }
}
```

#### `DELETE /api/v1/admin/logs/:id` — Soft Delete satu log
- Validasi UUID format sebelum query (regex di controller)
- Data tidak terhapus permanen melainkan di set `deletedAt = now()`
- Error 400: Format UUID tidak valid
- Error 404: Log tidak ditemukan

#### `DELETE /api/v1/admin/logs` — Soft Delete semua log
- Data tidak terhapus permanen melainkan di set `deletedAt = now()` untuk seluruh data yang masih aktif (`deletedAt: null`).
```json
// Response 200
{
  "success": true,
  "message": "Seluruh log scan berhasil dihapus. Total: 42 data.",
  "data": { "deleted_count": 42 }
}
```

---

## 7. Integrasi AI Service (Hugging Face)

| Aspek         | Detail                                              |
| ------------- | --------------------------------------------------- |
| URL           | `${process.env.AI_SERVICE_URL}/predict`              |
| Method        | POST                                                |
| Timeout       | 15 detik                                            |
| Request key   | `message` (**bukan** `message_content` atau `text`) |
| Response keys | `verdict` (string), `confidence` (float), `message` |

```js
// Request ke AI
axios.post(aiUrl, { message: messageContent }, { timeout: 15000 })

// Response dari AI
{ "verdict": "Phishing/Scam", "confidence": 95.50, "message": "..." }
```

**Mapping AI response → Database:**
- `aiResult.confidence` → `messageRiskScore`
- `aiResult.verdict` → `finalStatus`

---

## 8. Environment Variables (.env)

```env
PORT=3000
AI_SERVICE_URL=https://your-ai-service.hf.space
DATABASE_URL="postgresql://...pooler...supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...pooler...supabase.com:5432/postgres"
JWT_SECRET="random-string-minimal-32-karakter"
PRODUCTION_URL=https://your-app.railway.app  # opsional, untuk swagger
```

---

## 9. Coding Conventions & Rules

### Yang HARUS diikuti:

1. **Bahasa variable & function**: `camelCase` dalam bahasa Inggris
2. **Pesan response ke user**: Bahasa Indonesia
3. **Console error**: Format `'namaFunction Error:'` diikuti `error.message`
4. **Response format**: SELALU gunakan `sendSuccess()` / `sendError()` dari `utils/response.js`
5. **Validasi input**: Di controller, BUKAN di service
6. **Database query**: Di service, BUKAN di controller
7. **Import prisma**: Hanya di service, BUKAN di controller
8. **Error dari service**: Throw `new Error()` dengan property `statusCode`
9. **UUID validation**: Gunakan regex `UUID_REGEX` yang sudah ada di `adminController.js`
10. **Swagger docs**: Ditulis sebagai JSDoc comment langsung di file routes
11. **Reusable schemas**: `ErrorResponse` dan `ScanLog` sudah didefinisikan di `swagger.js`, gunakan `$ref`

### Yang TIDAK BOLEH dilakukan:

1. **Jangan** panggil `require('dotenv').config()` di mana pun selain `index.js`
2. **Jangan** akses `req` atau `res` di dalam service
3. **Jangan** query database langsung di controller
4. **Jangan** hardcode response JSON tanpa `sendSuccess`/`sendError`
5. **Jangan** buat file baru di root `src/` — tempatkan sesuai layer yang benar
6. **Jangan** simpan kredensial asli di `.env.example`

---

## 10. Cara Menjalankan

```bash
# Install dependencies
npm install

# Migrasi database (sinkronisasi schema ke Supabase)
npx prisma db push
npx prisma generate

# Seed akun admin default (username: admin, password: adminpassword123)
node prisma/seed.js

# Jalankan server development (auto-reload)
npm run dev

# Buka dokumentasi API
# http://localhost:3000/api-docs
```

---

## 11. Saat Menambah Fitur Baru

Ikuti urutan ini:

1. **Schema** — Tambah/ubah model di `prisma/schema.prisma` → jalankan `npx prisma db push`
2. **Service** — Buat function bisnis logik di `src/services/namaService.js`
3. **Controller** — Buat handler yang validasi input + panggil service di `src/controllers/namaController.js`
4. **Route** — Daftarkan endpoint + swagger docs di `src/routes/namaRoutes.js`
5. **App** — Daftarkan route baru di `src/app.js` menggunakan `app.use()`
6. **Test** — Cek di Swagger UI (`/api-docs`)

---

## 12. Dependency List

### Production
| Package              | Versi    | Fungsi                                          |
| -------------------- | -------- | ----------------------------------------------- |
| express              | ^5.2.1   | Web framework                                   |
| @prisma/client       | ^7.8.0   | ORM client                                      |
| @prisma/adapter-pg   | ^7.8.0   | Native PG adapter (mengganti binary engine)     |
| pg                   | ^8.20.0  | PostgreSQL driver                               |
| axios                | ^1.16.0  | HTTP client untuk panggil AI service             |
| bcryptjs             | ^3.0.3   | Password hashing                                |
| jsonwebtoken         | ^9.0.3   | JWT token generation & verification              |
| cors                 | ^2.8.6   | Cross-Origin Resource Sharing                    |
| helmet               | ^8.1.0   | Security HTTP headers                            |
| dotenv               | ^17.4.2  | Load .env ke process.env                         |
| swagger-jsdoc        | ^6.2.8   | Generate OpenAPI spec dari JSDoc comments        |
| swagger-ui-express   | ^5.0.1   | Serve Swagger UI di /api-docs                    |

### Development
| Package | Versi   | Fungsi                     |
| ------- | ------- | -------------------------- |
| prisma  | ^7.8.0  | CLI untuk migrasi & generate |
| nodemon | ^3.1.14 | Auto-reload saat development |