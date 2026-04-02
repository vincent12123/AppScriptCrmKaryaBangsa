# 📋 CRM SPMB — SMK Karya Bangsa

> Sistem CRM (Customer Relationship Management) berbasis Google Apps Script untuk manajemen dan followup calon siswa baru dalam proses **Seleksi Penerimaan Murid Baru (SPMB)**.

**Dibuat oleh:** Sukardi, S.Kom  
**Institusi:** SMK Karya Bangsa, Sintang, Kalimantan Barat  
**Platform:** Google Sheets + Google Apps Script (Web App)  
**Lisensi:** Internal / Sekolah

---

## 🎯 Latar Belakang

Tim SPMB SMK Karya Bangsa melakukan followup calon siswa melalui WhatsApp secara manual. Sebelumnya tidak ada sistem terpusat untuk:
- Menyimpan data calon siswa
- Mencatat riwayat percakapan WA
- Memantau status pipeline per calon
- Mengingatkan jadwal followup
- Melihat performa tim SPMB

CRM ini dibangun **tanpa API WhatsApp** — percakapan WA cukup di-copy-paste ke sistem, sehingga aman dari risiko banned dan tidak membutuhkan biaya tambahan.

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                  Google Apps Script                  │
│                                                      │
│   WebApp.gs   ←→   Google Sheets (Database)         │
│   Helper.gs                                          │
│   Code.gs                                            │
│                                                      │
│   Index.html  ←→   Browser (Web App UI)              │
└─────────────────────────────────────────────────────┘
```

### Stack Teknologi

| Komponen | Teknologi |
|---|---|
| Database | Google Sheets |
| Backend | Google Apps Script |
| Frontend | HTML + CSS + Vanilla JS (Web App) |
| Auth | Google OAuth (login akun sekolah) |
| Hosting | Google Apps Script Web App (gratis) |

---

## 📁 Struktur File

```
CRM-SPMB/
├── Code.js          # Setup sheet otomatis
├── Helper.js        # Fungsi helper & sample data
├── WebApp.js        # Server-side functions (CRUD)
├── Index.html       # UI Web App (SPA)
└── appsscript.json  # Konfigurasi Apps Script
```

> **Catatan:** File `.clasp.json` berisi `scriptId` dan **tidak disertakan** di repo (ada di `.gitignore`).

### Struktur Google Sheets

| Sheet | Warna Tab | Fungsi |
|---|---|---|
| `DataCalon` | 🔵 Biru | Master data semua calon siswa |
| `FollowUp` | 🟢 Hijau | Log riwayat percakapan WA |
| `TemplateWA` | 🟢 WhatsApp Green | Template pesan siap pakai |
| `Dashboard` | 🟡 Kuning | Rekap statistik (formula) |
| `Referensi` | ⚫ Abu | Data dropdown (tersembunyi) |

---

## ⚙️ Fitur Web App

### 📊 Dashboard
- Statistik total calon, konversi, aktif diproses
- **Reminder followup hari ini** — siapa yang harus dihubungi
- Pipeline chart per status
- Distribusi minat jurusan
- Performa per PIC

### 👥 Data Calon
- Tabel semua calon dengan filter (status, jurusan, PIC, search)
- Tombol langsung ke WhatsApp
- Detail calon + riwayat percakapan lengkap
- Form tambah calon baru
- **Hapus calon** dengan konfirmasi

### 💬 Log Followup WA
- Cari calon → lihat riwayat percakapan
- Form input log baru (copy-paste dari WA)
- Update status calon sekaligus
- Set jadwal followup berikutnya

### 📱 Template WA
- Daftar template pesan diambil langsung dari sheet `TemplateWA`
- Tombol **Salin** ke clipboard — tinggal paste ke WA
- Template dapat diedit di sheet tanpa sentuh kode

---

## 🚀 Cara Setup

### Prasyarat
- Akun Google (akun sekolah `@karyabangsa.sch.id`)
- Akses ke Google Sheets dan Apps Script

### Langkah 1 — Setup Google Sheets
1. Buka [Google Sheets](https://sheets.google.com) → buat spreadsheet baru
2. Klik **Extensions → Apps Script**
3. Hapus kode default
4. Buat file-file berikut dan paste isinya masing-masing:
   - `Code.gs` ← isi dari `Code.js`
   - `Helper.gs` ← isi dari `Helper.js`
   - `WebApp.gs` ← isi dari `WebApp.js`
   - `Index.html` ← isi dari `Index.html`
5. Pilih fungsi `setupCRMSPMB` di dropdown → klik **▶ Run**
6. Izinkan permission yang diminta
7. Semua sheet akan terbuat otomatis ✅

### Langkah 2 — Deploy Web App
1. Klik **Deploy → New deployment**
2. Pilih type: **Web app**
3. Konfigurasi:
   - Execute as: **Me**
   - Who has access: **Anyone with Google account**
4. Klik **Deploy** → salin URL Web App
5. Bagikan URL ke seluruh tim SPMB ✅

### Langkah 3 — Kustomisasi
Buka sheet `Referensi` (unhide dulu) → sesuaikan:
- **PIC_SPMB** — nama-nama anggota tim SPMB
- **JURUSAN** — jurusan yang tersedia di sekolah
- **SUMBER_INFO** — sumber informasi yang relevan

---

## 📌 Deploy Ulang Setelah Update Kode

> ⚠️ Setiap kali ada perubahan kode, wajib buat versi baru.

1. **Deploy → Manage deployments**
2. Klik ✏️ **Edit** pada deployment aktif
3. Version: pilih **"New version"**
4. Klik **Deploy**

URL tetap sama — tidak perlu bagikan ulang ke tim.

---

## 🔄 Alur Kerja Tim SPMB

```
1. Calon baru masuk (pameran/medsos/referral)
         ↓
2. Input ke Web App → form Tambah Calon
         ↓
3. Tim kirim WA menggunakan Template WA
         ↓
4. Copy pesan WA yang dikirim → Log Followup (Outbound)
         ↓
5. Calon membalas WA → copy balasan → Log Followup (Inbound)
         ↓
6. Update status + set jadwal followup berikutnya
         ↓
7. Sistem tampilkan reminder di Dashboard keesokan harinya
         ↓
8. Ulangi langkah 3–7 hingga Sudah Daftar / Tidak Jadi
```

---

## 🗓️ Roadmap

### ✅ Selesai (v1.0)
- [x] Setup otomatis Google Sheets (5 sheet + dropdown + conditional formatting)
- [x] Web App UI dengan sidebar navigasi
- [x] Dashboard statistik + reminder followup hari ini
- [x] CRUD data calon siswa (tambah & hapus)
- [x] Log followup WA (copy-paste, tanpa API)
- [x] Template WA diambil langsung dari sheet
- [x] Filter & pencarian data calon
- [x] Detail calon + riwayat percakapan lengkap
- [x] Multi-user dengan login Google

### 🔜 v1.1 — Notifikasi & Reminder
- [ ] Email harian otomatis via `MailApp`
- [ ] Time-based trigger jam 07.00 WIB
- [ ] Tandai calon overdue

### 🔜 v1.2 — Manajemen Calon
- [ ] Edit data calon dari Web App
- [ ] Soft delete / arsip calon
- [ ] Import data massal dari CSV/Excel
- [ ] Export laporan ke Excel

### 🔜 v1.3 — Analitik
- [ ] Grafik konversi per bulan
- [ ] Laporan performa per PIC
- [ ] Analisis sumber info terbaik

---

## 🐛 Troubleshooting

| Masalah | Solusi |
|---|---|
| Spinner loading terus | Cek browser console (F12), pastikan deploy sudah **New Version** |
| Formula Dashboard `#ERROR!` | Jalankan fungsi `fixDashboard()` di Apps Script Editor |
| `Range not found` di setDropdown | Gunakan signature `(sh, row, col, numRows, sheetName, rangeA1)` |
| No WA tidak bisa `.replace()` | Cast ke String: `String(r[2] \|\| '')` di server sebelum dikirim |
| Template WA tidak muncul | Pastikan sheet `TemplateWA` ada isinya; fungsi `getTemplateWA()` membaca dari sheet |

---

## 👤 Kontak

**Sukardi, S.Kom**  
IT Administrator — SMK Karya Bangsa Sintang  
📧 sukardi@karyabangsa.sch.id
