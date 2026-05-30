# DiagnosaKelas

**AI diagnostic tool untuk guru — bukan platform belajar.**

Guru buat 5 soal pilihan ganda per topik (manual atau generate via Claude AI). Murid jawab via HP tanpa perlu akun — cukup kode kelas. Sistem langsung generate heatmap: konsep mana yang gagal, siapa yang tertinggal, action item spesifik.

## Tech Stack

- **Frontend:** React 19 + TypeScript + TailwindCSS v4 + React Router v6
- **Backend:** Supabase (Auth, PostgreSQL, RLS)
- **AI:** Claude API (Anthropic) — fallback questions built-in
- **Build:** Vite 8

## Fitur

| Fitur | Detail |
|-------|--------|
| Auth Guru | Register/login via Supabase Auth |
| Kelola Kelas | Buat kelas, dapatkan kode unik 6 karakter |
| AI Generate Soal | Masukkan topik → Claude buat 5 soal diagnostic + tag konsep |
| Edit Soal | Ubah soal hasil generate manual |
| Siswa No-Auth | Cukup kode kelas + nama, jawab 5 soal via HP |
| Heatmap Real-time | Akurasi per soal, breakdown per siswa, warna merah-kuning-hijau |
| Action Item | Deteksi otomatis konsep terlemah + jumlah siswa butuh bantuan |

## Cara Pakai

### 1. Setup

```bash
cp .env.example .env
# Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
```

### 2. Database

Jalankan `supabase/schema.sql` di Supabase SQL Editor, atau via CLI:

```bash
supabase link --project-ref <ref>
supabase db push
```

### 3. Matikan email confirmation (opsional untuk testing)

**Supabase Dashboard → Authentication → Settings → Confirm email → OFF**

### 4. Dev

```bash
npm install
npm run dev
```

### 5. Build

```bash
npm run build
```

## Routes

| Route | Akses | Fungsi |
|-------|-------|--------|
| `/` | Publik | Landing |
| `/login` | Publik | Login guru |
| `/register` | Publik | Daftar guru |
| `/dashboard` | Guru | Daftar kelas |
| `/class/:id` | Guru | Detail kelas + topik |
| `/class/:id/topics/new` | Guru | Buat topik + AI generate |
| `/class/:id/topic/:topicId` | Guru | Heatmap hasil |
| `/q/:code` | Publik | Siswa jawab soal |

## Environment Variables

```
VITE_SUPABASE_URL       # https://[ref].supabase.co
VITE_SUPABASE_ANON_KEY  # anon/public key dari dashboard
VITE_CLAUDE_API_KEY     # opsional — fallback questions built-in
```

## Database Schema

- `teachers` — extends `auth.users`
- `classes` — belongs to teacher, has unique 6-char code
- `topics` — belongs to class
- `questions` — belongs to topic, JSONB options
- `quiz_sessions` — per student attempt
- `answers` — individual question answers

RLS enabled: teachers CRUD own data, students insert answers without auth.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjaweed3%2Fontbossen)
