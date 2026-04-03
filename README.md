# CRM SPMB — Milestone 4

Implementasi milestone 4 di atas milestone 3, fokus pada scale-up: import CSV, role-based access yang lebih tegas, dan hardening dasar.

## Yang dibawa dari milestone sebelumnya
- refactor struktur
- ID generator aman multi-user
- validasi server-side
- audit field
- soft delete / arsip + restore
- edit calon
- overdue filter
- reschedule followup
- reminder email harian
- template pintar
- export laporan CSV
- dashboard lanjutan

## Fitur baru Milestone 4

### 1) Import CSV
- import calon dari file `.csv` atau paste isi CSV ke modal import
- validasi per baris saat import
- dukungan header fleksibel:
  - `nama`
  - `nama_lengkap`
  - `no_wa`
  - `wa`
  - `whatsapp`
  - `asal_sekolah`
  - `jurusan`
  - `sumber`
  - `status`
  - `pic`
  - `prioritas`
  - `jadwal_followup`
  - `catatan`
- default skip duplikat aktif berdasarkan kombinasi **nama + no WA**
- hasil import mengembalikan ringkasan `imported / skipped / errors`

### 2) Role-based access penuh
Role sekarang dibedakan lebih tegas:

#### ADMIN
- lihat semua data aktif dan arsip
- tambah, edit, arsip, restore, reschedule
- import CSV
- export laporan
- kirim reminder

#### PIC
- hanya melihat calon yang `PIC`-nya sama dengan **Nama** user pada sheet `Users`
- hanya bisa edit / arsip / reschedule / log followup untuk calon miliknya sendiri
- bisa export laporan sesuai scope miliknya
- tidak bisa restore arsip
- tidak bisa import CSV

#### VIEWER
- read only
- hanya melihat data aktif
- tidak bisa edit, arsip, restore, import, export, atau kirim reminder

> Penting: untuk role `PIC`, kolom **Nama** di sheet `Users` harus sama dengan nilai **PIC** pada data calon. Contoh: jika data calon memakai `Tim SPMB 1`, maka user PIC terkait juga harus punya `Nama = Tim SPMB 1`.

### 3) Hardening dasar
- sanitasi input text untuk mencegah isi HTML/tag berlebih
- pembatasan panjang field
- parsing tanggal lebih aman (`YYYY-MM-DD` dan `DD/MM/YYYY`)
- validasi ukuran import CSV
- validasi jumlah baris import
- pembatasan aksi UI berdasarkan izin per-record

## File baru
- `ImportService.gs`

## File utama yang berubah
- `AuthService.gs`
- `ConfigService.gs`
- `CalonService.gs`
- `FollowUpService.gs`
- `DashboardService.gs`
- `ExportService.gs`
- `Validation.gs`
- `App.js.html`
- `AppBody.html`
- `WebApp.gs`

## Endpoint baru
- `importCalonCsv(csvText, options)`

## Cara pakai
1. Push folder ini ke Apps Script.
2. Untuk spreadsheet lama, jalankan `migrateMilestone4Schema()`.
3. Pastikan sheet `Users` sudah terisi:
   - `Email | Nama | Role | Aktif`
4. Pastikan nama user role `PIC` cocok dengan nilai PIC pada data calon.
5. Deploy ulang Web App.
6. Untuk import, buka halaman **Data Calon** lalu klik **Import CSV** (hanya untuk ADMIN).

## Contoh CSV minimal
```csv
nama,no_wa,asal_sekolah,jurusan,sumber,status,pic,prioritas,jadwal_followup,catatan
Budi Santoso,081234567890,SMP N 1 Sintang,RPL,Pameran,Baru,Tim SPMB 1,Tinggi,2026-04-05,Lead dari pameran
Siti Rahayu,082345678901,SMP N 2 Sintang,TSM,Media Sosial,Dihubungi,Tim SPMB 2,Sedang,2026-04-06,Followup kedua
```

## Catatan hardening
- trigger reminder harian sekarang memakai `DashboardService.getStats(true)` agar tetap jalan saat dipanggil oleh trigger
- restore arsip dibatasi ke `ADMIN`
- export dibatasi ke `ADMIN` dan `PIC`
- PIC tidak dapat memindahkan calon ke PIC lain saat edit
