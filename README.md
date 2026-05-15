## 1. CLONE REPOSITORY

```bash
git https://github.com/Mheszzz/awas-link-BE.git
```

## 2. NPM INSTALL (INSTAL NODE MODULE)

```bash
npm install
```

## 3. COPY FILE .env.example menjadi file .env pada branch main

```bash
cp .env.example .env
```

## 4. PASTIKAN SUDAH MENGINSTALL POSTGRESQL dan MENYELESAIKAN SEMUA KONFIGURASI

jika sudah sesuaikan kode untuk konfigurasi DATABASE pada file .env, sesuaikan dengan konfigurasi database postgre masing masing seperti username dan password

## 5. GENERATE PRISMA (DATABASE)

```bash
npx prisma generate
```
## 6. JALANKAN SERVER NYA

```bash
npm run dev
```

## 7. API-DOCS

untuk API Dokumentasi untuk frontend bisa diakses di URL berikut

```bash
localhost:3000/api-docs
```
------------------------------------------------------------------------