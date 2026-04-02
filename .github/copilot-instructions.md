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
├── Code.gs          # Setup sheet otomatis
├── Helper.gs        # Fungsi helper & sample data
├── WebApp.gs        # Server-side functions (CRUD)
└── Index.html       # UI Web App (SPA)
```

### Struktur Google Sheets

| Sheet | Warna Tab | Fungsi |
|---|---|---|
| `DataCalon` | 🔵 Biru | Master data semua calon siswa |
| `FollowUp` | 🟢 Hijau | Log riwayat percakapan WA |
| `TemplateWA` | 🟢 WhatsApp Green | Template pesan siap pakai |
| `Dashboard` | 🟡 Kuning | Rekap statistik (formula) |
| `Referensi` | ⚫ Abu | Data dropdown (tersembunyi) |

---

## 🗂️ Struktur Data

### Sheet: DataCalon
| Kolom | Tipe | Keterangan |
|---|---|---|
| ID | Text | Auto-generate (CS-0001, CS-0002, ...) |
| Nama Lengkap | Text | Nama calon siswa |
| No WA | Text | Nomor WhatsApp aktif |
| Asal Sekolah | Text | SMP/MTs asal |
| Jurusan Minat | Dropdown | RPL / TKJ / AKL / OTKP / PM / BDP |
| Sumber Info | Dropdown | Pameran / Medsos / Referral / dll |
| Tanggal Masuk | Date | Tanggal data diinput |
| Status | Dropdown | Pipeline status (lihat di bawah) |
| PIC | Dropdown | Penanggung jawab tim SPMB |
| Prioritas | Dropdown | Tinggi / Sedang / Rendah |
| Jadwal Followup | Date | Tanggal rencana followup berikutnya |
| Terakhir Followup | DateTime | Auto-update saat log baru ditambah |
| Jumlah Followup | Number | Auto-hitung total interaksi |
| Catatan | Text | Catatan bebas |

### Pipeline Status
```
Baru → Dihubungi → Tertarik → Proses Daftar → Sudah Daftar
                                                     ↕
                                               Tidak Jadi
```

### Sheet: FollowUp
| Kolom | Keterangan |
|---|---|
| ID Log | Auto-generate (LOG-0001, ...) |
| ID Calon | Relasi ke DataCalon |
| Nama Calon | Redundan untuk kemudahan baca |
| Tanggal & Waktu | Auto-timestamp saat disimpan |
| PIC | Tim SPMB yang menangani |
| Arah | Outbound (kita kirim) / Inbound (calon balas) |
| Isi Percakapan | Copy-paste dari WhatsApp |
| Hasil / Kesimpulan | Ringkasan hasil percakapan |
| Next Action | Rencana tindak lanjut |
| Jadwal Berikutnya | Tanggal followup selanjutnya |

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

### 💬 Log Followup WA
- Cari calon → lihat riwayat percakapan
- Form input log baru (copy-paste dari WA)
- Update status calon sekaligus
- Set jadwal followup berikutnya

### 📱 Template WA
- Daftar template pesan diambil dari sheet `TemplateWA`
- Tombol **Salin** ke clipboard — tinggal paste ke WA
- Template dapat diedit langsung di sheet tanpa ubah kode

---

## 🚀 Cara Setup

### Prasyarat
- Akun Google Workspace (akun sekolah `@karyabangsa.sch.id`)
- Akses ke Google Sheets dan Apps Script

### Langkah 1 — Setup Google Sheets
1. Buka [Google Sheets](https://sheets.google.com) → buat spreadsheet baru
2. Klik **Extensions → Apps Script**
3. Hapus kode default
4. Buat dua file:
   - `Code.gs` → paste isi `Code.gs`
   - `Helper.gs` → paste isi `Helper.gs`
5. Pilih fungsi `setupCRMSPMB` di dropdown → klik **▶ Run**
6. Izinkan permission yang diminta
7. Semua sheet akan terbuat otomatis ✅

### Langkah 2 — Setup Web App
1. Tambah dua file lagi di Apps Script:
   - `WebApp.gs` → paste isi `WebApp.gs`
   - `Index.html` → paste isi `Index.html`
2. Klik **Deploy → New deployment**
3. Pilih type: **Web app**
4. Konfigurasi:
   - Execute as: **Me**
   - Who has access: **Anyone with Google account**
5. Klik **Deploy** → salin URL Web App
6. Bagikan URL ke seluruh tim SPMB ✅

### Langkah 3 — Kustomisasi Data Referensi
Buka sheet `Referensi` (unhide dulu) → sesuaikan:
- **PIC_SPMB** — nama-nama anggota tim SPMB
- **JURUSAN** — jurusan yang tersedia di sekolah
- **SUMBER_INFO** — sumber informasi yang relevan

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
8. Ulangi langkah 3-7 hingga Sudah Daftar / Tidak Jadi
```

---

## 📌 Cara Deploy Ulang Setelah Update

> ⚠️ **Penting:** Setiap kali ada perubahan kode, wajib buat versi baru — jangan hanya refresh browser.

1. **Deploy → Manage deployments**
2. Klik ✏️ **Edit** pada deployment aktif
3. Version: pilih **"New version"**
4. Klik **Deploy**
5. URL tetap sama — tidak perlu bagikan ulang ke tim

---

## 🐛 Troubleshooting

| Masalah | Solusi |
|---|---|
| Spinner loading terus di dashboard | Cek browser console (F12), pastikan deploy sudah new version |
| `SyntaxError: Invalid or unexpected token` | Jangan gunakan `JSON.stringify` di dalam atribut `onclick` HTML |
| `Range not found` di setDropdown | Gunakan signature `(sh, row, col, numRows, sheetName, rangeA1)` — bukan formula string |
| `whenFormula is not a function` | Gunakan `whenFormulaSatisfied()` bukan `whenFormula()` |
| No WA tidak bisa `.replace()` | Cast ke String: `String(r[2] \|\| '')` di server sebelum dikirim |
| Template WA hardcoded | Gunakan `getTemplateWA()` dari server, bukan array di HTML |

---

## 🗓️ Roadmap — Rencana Pengembangan

### ✅ Selesai (v1.0)
- [x] Setup otomatis Google Sheets (5 sheet + dropdown + conditional formatting)
- [x] Web App UI dengan sidebar navigasi
- [x] Dashboard statistik + reminder followup hari ini
- [x] CRUD data calon siswa
- [x] Log followup WA (copy-paste, tanpa API)
- [x] Template WA diambil dari sheet
- [x] Filter & pencarian data calon
- [x] Detail calon + riwayat percakapan lengkap
- [x] Multi-user dengan login Google

### 🔜 v1.1 — Notifikasi & Reminder
- [ ] **Email harian otomatis** — kirim ringkasan followup hari ini ke masing-masing PIC via `MailApp`
- [ ] **Trigger harian** — Apps Script time-based trigger jam 07.00 WIB
- [ ] **Notifikasi overdue** — tandai calon yang jadwal FU-nya sudah lewat

### 🔜 v1.2 — Manajemen Calon Lebih Lengkap
- [ ] **Edit data calon** — ubah info calon langsung dari Web App
- [ ] **Hapus / arsip calon** — soft delete dengan status "Arsip"
- [ ] **Import CSV/Excel** — upload data calon massal dari hasil pameran
- [ ] **Export laporan** — unduh data ke Excel per periode

### 🔜 v1.3 — Analitik & Laporan
- [ ] **Grafik konversi** — chart visual pipeline per bulan
- [ ] **Laporan per PIC** — performa individu tim SPMB
- [ ] **Sumber terbaik** — analisis sumber info mana yang paling banyak konversi
- [ ] **Laporan PDF otomatis** — generate laporan bulanan ke Drive

### 🔜 v1.4 — UX & Kolaborasi
- [ ] **Mode mobile** — optimasi tampilan untuk HP
- [ ] **Quick update status** — ganti status langsung dari tabel tanpa buka detail
- [ ] **Komentar internal** — catatan antar anggota tim per calon
- [ ] **History perubahan** — log siapa yang mengubah data apa

### 🔜 v2.0 — Integrasi
- [ ] **Google Forms → otomatis masuk DataCalon** — form pendaftaran online langsung tercatat
- [ ] **Google Calendar** — jadwal followup otomatis masuk ke kalender PIC
- [ ] **Looker Studio Dashboard** — visualisasi data lebih kaya untuk kepala sekolah

---

## 👤 Kontribusi

Proyek ini dikembangkan untuk kebutuhan internal SMK Karya Bangsa.  
Untuk request fitur atau laporan bug, hubungi:

**Sukardi, S.Kom**  
IT Administrator — SMK Karya Bangsa Sintang  
📧 sukardi@karyabangsa.sch.id

---

## 📄 Catatan Teknis

- Web App di-cache oleh Google — selalu buat **new version** saat deploy ulang
- Sheet `Referensi` disembunyikan (`hideSheet()`) — unhide manual jika perlu edit
- ID calon format `CS-XXXX`, ID log format `LOG-XXXX`
- Timezone: `Asia/Jakarta` (WIB, UTC+7)
- Semua field dari Sheets di-cast ke `String` sebelum dikirim ke browser untuk menghindari error `.replace()` pada tipe Number