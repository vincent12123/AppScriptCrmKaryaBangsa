// ============================================================
// CRM SPMB - Setup Google Sheets
// SMK Karya Bangsa | Dibuat oleh: Sukardi, S.Kom
// ============================================================

const CONFIG = {
  sheets: {
    DATA_CALON:  'DataCalon',
    FOLLOWUP:    'FollowUp',
    DASHBOARD:   'Dashboard',
    REFERENSI:   'Referensi',
    TEMPLATE_WA: 'TemplateWA'
  }
};

function setupCRMSPMB() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setName('CRM SPMB SMK Karya Bangsa');

  // Buat semua sheet DULU
  setupSheetReferensi(ss);
  setupSheetDataCalon(ss);
  setupSheetFollowUp(ss);
  setupSheetTemplateWA(ss);
  setupSheetDashboard(ss);

  // Baru hapus Sheet1 default (kalau masih ada)
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  // Aktifkan DataCalon
  ss.setActiveSheet(ss.getSheetByName(CONFIG.sheets.DATA_CALON));

  SpreadsheetApp.getUi().alert(
    '✅ Setup Selesai!\n\nSemua sheet CRM SPMB berhasil dibuat.\nSilakan mulai input data calon siswa.'
  );
}

// ── SHEET: REFERENSI ────────────────────────────────────────
function setupSheetReferensi(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.REFERENSI);
  sh.clearContents();
  sh.setTabColor('#9e9e9e');

  const data = [
    ['STATUS_PIPELINE', 'JURUSAN', 'SUMBER_INFO', 'PRIORITAS', 'ARAH_WA', 'PIC_SPMB'],
    ['Baru',           'RPL',     'Pameran',      'Tinggi',    'Outbound', 'Tim SPMB 1'],
    ['Dihubungi',      'TSM',     'Media Sosial', 'Sedang',    'Inbound',  'Tim SPMB 2'],
    ['Tertarik',       'HTL',     'Referral',     'Rendah',    '',         'Tim SPMB 3'],
    ['Proses Daftar',  '',         'Website',      '',          '',         'Tim SPMB 4'],
    ['Sudah Daftar',   '',         'Brosur',       '',          '',         ''],
    ['Tidak Jadi',     '',         'Walk-in',      '',          '',         ''],
    ['',               '',         'Lainnya',      '',          '',         '']
  ];

  sh.getRange(1, 1, data.length, data[0].length).setValues(data);

  sh.getRange(1, 1, 1, 6)
    .setBackground('#424242')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  sh.setColumnWidths(1, 6, 130);
  sh.setFrozenRows(1);
  sh.hideSheet();
}

// ── SHEET: DATA CALON ───────────────────────────────────────
function setupSheetDataCalon(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.DATA_CALON);
  sh.clearContents();
  sh.setTabColor('#1a73e8');

  const headers = [
    'ID', 'Nama Lengkap', 'No WA', 'Asal Sekolah',
    'Jurusan Minat', 'Sumber Info', 'Tanggal Masuk',
    'Status', 'PIC', 'Prioritas',
    'Jadwal Followup', 'Terakhir Followup',
    'Jumlah Followup', 'Catatan'
  ];

  const headerRange = sh.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  const widths = [70, 160, 120, 150, 120, 120, 110,
                  120, 110, 90, 120, 130, 80, 200];
  widths.forEach((w, i) => sh.setColumnWidth(i + 1, w));

  // ✅ Dropdown dengan signature baru: (sh, startRow, col, numRows, sheetName, rangeA1)
  const ref = CONFIG.sheets.REFERENSI;
  setDropdown(sh, 2, 5,  499, ref, 'B2:B7');  // Jurusan
  setDropdown(sh, 2, 6,  499, ref, 'C2:C8');  // Sumber Info
  setDropdown(sh, 2, 8,  499, ref, 'A2:A7');  // Status
  setDropdown(sh, 2, 9,  499, ref, 'F2:F4');  // PIC
  setDropdown(sh, 2, 10, 499, ref, 'D2:D4');  // Prioritas

  sh.getRange(2, 7,  499).setNumberFormat('dd/mm/yyyy');
  sh.getRange(2, 11, 499).setNumberFormat('dd/mm/yyyy');
  sh.getRange(2, 12, 499).setNumberFormat('dd/mm/yyyy hh:mm');

  sh.getRange(2, 1, 499)
    .setBackground('#f5f5f5')
    .setFontColor('#9e9e9e');

  sh.setFrozenRows(1);
  sh.setFrozenColumns(2);

  applyStatusFormatting(sh);
  insertSampleDataCalon(sh);
}

// ── SHEET: FOLLOWUP ─────────────────────────────────────────
function setupSheetFollowUp(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.FOLLOWUP);
  sh.clearContents();
  sh.setTabColor('#34a853');

  const headers = [
    'ID Log', 'ID Calon', 'Nama Calon', 'Tanggal & Waktu',
    'PIC', 'Arah', 'Isi Percakapan (Copy WA)',
    'Hasil / Kesimpulan', 'Next Action', 'Jadwal Berikutnya'
  ];

  const headerRange = sh.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange
    .setBackground('#34a853')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  const widths = [70, 70, 150, 140, 110, 90, 350, 200, 200, 120];
  widths.forEach((w, i) => sh.setColumnWidth(i + 1, w));

  sh.getRange(2, 7, 999).setWrap(true);
  sh.getRange(2, 8, 999).setWrap(true);

  // ✅ Dropdown dengan signature baru
  setDropdown(sh, 2, 6, 999, CONFIG.sheets.REFERENSI, 'E2:E3');

  sh.getRange(2, 4,  999).setNumberFormat('dd/mm/yyyy hh:mm');
  sh.getRange(2, 10, 999).setNumberFormat('dd/mm/yyyy');

  const outRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Outbound')
    .setBackground('#e8f0fe')
    .setRanges([sh.getRange('A2:J1000')])
    .build();
  const inRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Inbound')
    .setBackground('#e6f4ea')
    .setRanges([sh.getRange('A2:J1000')])
    .build();
  sh.setConditionalFormatRules([outRule, inRule]);

  sh.setFrozenRows(1);
  sh.setFrozenColumns(3);

  insertSampleFollowUp(sh);
}

// ── SHEET: TEMPLATE WA ──────────────────────────────────────
function setupSheetTemplateWA(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.TEMPLATE_WA);
  sh.clearContents();
  sh.setTabColor('#25D366');

  const headers = ['Nama Template', 'Situasi', 'Isi Pesan'];
  sh.getRange(1, 1, 1, 3).setValues([headers])
    .setBackground('#25D366')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  const templates = [
    ['Perkenalan Awal', 'Pertama kali hubungi',
     'Halo [Nama], perkenalkan saya [PIC] dari Tim SPMB SMK Karya Bangsa Sintang. Kami ingin memberikan informasi mengenai pendaftaran siswa baru tahun ajaran 2025/2026. Apakah [Nama] berminat untuk mengetahui lebih lanjut? 😊'],
    ['Follow Up Ke-2', 'Belum ada respon 2-3 hari',
     'Halo [Nama] 🙏 Kami dari SMK Karya Bangsa ingin mengingatkan kembali mengenai informasi pendaftaran yang kami sampaikan sebelumnya. Apakah ada pertanyaan yang bisa kami bantu? Kami dengan senang hati akan membantu 😊'],
    ['Info Jurusan', 'Calon tertarik tanya jurusan',
     'SMK Karya Bangsa memiliki beberapa jurusan unggulan:\n✅ RPL (Rekayasa Perangkat Lunak)\n✅ TSM (Teknik Sepeda Motor)\n✅ HTL (Perhotelan)\n\nJurusan mana yang diminati [Nama]?'],
    ['Pengingat Deadline', 'Mendekati batas pendaftaran',
     'Halo [Nama] 👋 Kami ingin menginformasikan bahwa batas pendaftaran SPMB SMK Karya Bangsa tinggal [X] hari lagi. Segera daftarkan diri agar tidak kehabisan kuota! Info lebih lanjut hubungi kami. 🏫'],
    ['Konfirmasi Daftar', 'Setelah calon mendaftar',
     'Selamat [Nama]! 🎉 Pendaftaran Anda di SMK Karya Bangsa telah kami terima. Tim kami akan segera menghubungi untuk informasi selanjutnya. Terima kasih telah mempercayai SMK Karya Bangsa sebagai pilihan pendidikan Anda 🙏']
  ];

  sh.getRange(2, 1, templates.length, 3).setValues(templates);
  sh.setColumnWidths(1, 1, 150);
  sh.setColumnWidths(2, 1, 180);
  sh.setColumnWidths(3, 1, 500);
  sh.getRange(2, 3, templates.length).setWrap(true);
  sh.setFrozenRows(1);
}

// ── SHEET: DASHBOARD ────────────────────────────────────────
function setupSheetDashboard(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.DASHBOARD);
  sh.clearContents();
  sh.setTabColor('#f9ab00');

  sh.getRange('A1:E1').merge()
    .setValue('📊 DASHBOARD CRM SPMB — SMK Karya Bangsa')
    .setBackground('#f9ab00')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(13)
    .setHorizontalAlignment('center');

  sh.getRange('A3').setValue('STATUS PIPELINE').setFontWeight('bold');
  const statuses = ['Baru', 'Dihubungi', 'Tertarik', 'Proses Daftar', 'Sudah Daftar', 'Tidak Jadi'];
  statuses.forEach((s, i) => {
    const row = i + 4;
    sh.getRange(row, 1).setValue(s);
    // SUMPRODUCT 1 argumen — tidak ada koma/titik koma antar argumen
    sh.getRange(row, 2).setFormula(`=SUMPRODUCT((DataCalon!H2:H="${s}")*1)`);
    // Pembagian pakai operator, COUNTA 1 argumen — aman semua locale
    sh.getRange(row, 3).setFormula(`=B${row}/COUNTA(DataCalon!H2:H)`);
  });
  // Format kolom C sebagai persen
  sh.getRange(4, 3, statuses.length).setNumberFormat('0%');

  sh.getRange('A10').setValue('TOTAL CALON').setFontWeight('bold');
  sh.getRange('B10').setFormula('=COUNTA(DataCalon!B2:B)');

  sh.getRange('A12').setValue('MINAT JURUSAN').setFontWeight('bold');
  const jurusans = ['RPL', 'TSM', 'HTL'];
  jurusans.forEach((j, i) => {
    sh.getRange(i + 13, 1).setValue(j);
    sh.getRange(i + 13, 2).setFormula(`=SUMPRODUCT((DataCalon!E2:E="${j}")*1)`);
  });

  sh.getRange('A20').setValue('FOLLOWUP HARI INI').setFontWeight('bold');
  sh.getRange('B20').setFormula('=SUMPRODUCT((DataCalon!K2:K=TODAY())*1)');

  sh.setColumnWidth(1, 160);
  sh.setColumnWidth(2, 80);
  sh.setColumnWidth(3, 70);
}

// ── FIX DASHBOARD: Jalankan tanpa reset data ─────────────────
function fixDashboard() {
  setupSheetDashboard(SpreadsheetApp.getActiveSpreadsheet());
  SpreadsheetApp.getUi().alert('✅ Formula Dashboard berhasil diperbaiki!');
}