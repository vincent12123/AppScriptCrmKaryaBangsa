# CRM SPMB

CRM berbasis Google Apps Script untuk kebutuhan SPMB/PPDB sekolah. Repo ini saat ini sudah mencakup milestone 4 plus pembaruan autentikasi PIN, session token, dan tampilan web app untuk mode mobile maupun desktop.

## Ringkasan fitur
- login menggunakan `email + PIN`
- session berbasis token yang disimpan di `sessionStorage`
- web app mode mobile dan desktop
- dashboard pipeline calon siswa
- manajemen data calon: tambah, edit, arsip, restore
- log follow-up WhatsApp dan reschedule
- template WhatsApp dengan placeholder data calon
- export laporan CSV
- import calon dari CSV
- reminder email harian
- validasi server-side, audit field, dan pembatasan akses per role

## Mode tampilan
- default `mobile`
- `desktop` bisa dibuka dengan parameter `?view=desktop`

Contoh:

```text
https://script.google.com/macros/s/DEPLOYMENT_ID/exec
https://script.google.com/macros/s/DEPLOYMENT_ID/exec?view=desktop
```

## Role dan akses

### ADMIN
- lihat semua data aktif dan arsip
- tambah, edit, arsip, restore, reschedule
- import CSV
- export laporan
- kirim reminder

### PIC
- hanya melihat calon yang `PIC`-nya sesuai dengan nama user
- hanya bisa edit, arsip, reschedule, dan log follow-up untuk calon miliknya sendiri
- bisa export laporan sesuai scope miliknya
- bisa melihat arsip miliknya jika diizinkan oleh filter lifecycle
- tidak bisa restore arsip
- tidak bisa import CSV

### VIEWER
- read only
- hanya melihat data aktif
- tidak bisa edit, arsip, restore, import, export, atau kirim reminder

Penting: untuk role `PIC`, kolom `Nama` di sheet `Users` harus cocok dengan nilai `PIC` pada referensi/data calon. Contoh: jika data memakai `Tim SPMB 1`, maka user PIC tersebut juga harus punya `Nama = Tim SPMB 1`.

## Autentikasi
- login dilakukan lewat endpoint `loginWithPin(credentials)`
- setelah login berhasil, client menyimpan token session
- hampir semua endpoint lain membutuhkan token
- logout menghapus token dari cache session

Sheet `Users` sekarang memakai kolom:

```text
Email | Nama | Role | Aktif | PIN
```

## Import CSV
- bisa upload file `.csv` atau paste isi CSV ke modal import
- validasi dilakukan per baris
- default skip duplikat aktif berdasarkan kombinasi `nama + no WA`
- hasil import mengembalikan ringkasan `imported / skipped / errors`

Header fleksibel yang didukung:
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

Contoh CSV minimal:

```csv
nama,no_wa,asal_sekolah,jurusan,sumber,status,pic,prioritas,jadwal_followup,catatan
Budi Santoso,081234567890,SMP N 1 Sintang,RPL,Pameran,Baru,Tim SPMB 1,Tinggi,2026-04-05,Lead dari pameran
Siti Rahayu,082345678901,SMP N 2 Sintang,TSM,Media Sosial,Dihubungi,Tim SPMB 2,Sedang,2026-04-06,Follow-up kedua
```

## Struktur penting
### Server-side (Google Apps Script)
- `WebApp.js`: endpoint web app, pemilihan mode mobile/desktop, wrapper token
- `AuthService.js`: login PIN, session token, permission helper
- `Config.js`: konstanta konfigurasi, indeks kolom, dan definisi sheet
- `ConfigService.js`: config dropdown, user scope, permission flags
- `CalonService.js`: CRUD data calon
- `FollowUpService.js`: log follow-up
- `DashboardService.js`: statistik dashboard
- `ExportService.js`: export CSV
- `ImportService.js`: import CSV
- `ReminderService.js`: kirim reminder dan trigger harian
- `TemplateService.js`: manajemen dan render template WhatsApp dengan placeholder
- `Validation.js`: validasi input, sanitasi data, dan normalisasi nomor WA
- `AuditService.js`: logging audit trail untuk setiap aksi user
- `IdService.js`: generator ID otomatis (CS-XXXX, LOG-XXXX) dengan lock
- `Helpers.js`: fungsi helper umum (getSpreadsheet, include, ok/fail, formatDateSafe, setDropdown)
- `Setup.js`: setup awal Google Sheets (semua sheet, dropdown, conditional formatting)

### Client-side (HTML/JS)
- `App.js.html`: script client untuk mobile
- `AppDesktop.js.html`: script client untuk desktop
- `AppBody.html`: UI mobile
- `AppBodyDesktop.html`: UI desktop
- `Styles.html`: meta tags, Tailwind CSS config, dan custom styles
- `Index.html`: entry point web app (mobile)
- `IndexDesktop.html`: entry point web app (desktop)
- `appsscript.json`: konfigurasi project Apps Script

## Setup awal
1. Push project ini ke Google Apps Script.
2. Jalankan `setupCRMSPMB()` untuk membuat sheet awal.
3. Isi sheet `Users`, termasuk kolom `PIN`.
4. Pastikan nama user role `PIC` sesuai dengan referensi `PIC`.
5. Jika memakai spreadsheet lama, jalankan `migrateMilestone4Schema()`.
6. Deploy ulang sebagai Web App.

## Endpoint utama
- `loginWithPin(credentials)`
- `logoutSession(token)`
- `getConfig(token)`
- `getDataCalon(filter, token)`
- `addCalon(data, token)`
- `updateCalon(data, token)`
- `deleteCalon(id, token)`
- `restoreCalon(id, token)`
- `rescheduleCalon(data, token)`
- `addFollowUp(data, token)`
- `getFollowUpByCalon(idCalon, token)`
- `getDashboardStats(token)`
- `getTemplateWA(token)`
- `exportReport(type, filter, token)`
- `importCalonCsv(csvText, options, token)`
- `sendDailyReminderEmails(token)`

## Catatan implementasi
- tampilan desktop tersedia lewat `IndexDesktop.html` dan `AppBodyDesktop.html`
- reminder harian bisa dipasang lewat `installDailyReminderTrigger()`
- restore arsip dibatasi ke `ADMIN`
- export dibatasi ke `ADMIN` dan `PIC`
- PIC tidak bisa memindahkan data ke PIC lain saat edit dan log follow-up
