// ============================================================
// CRM SPMB - Setup Google Sheets
// PIN Login Version
// ============================================================

function setupCRMSPMB() {
  const ss = getSpreadsheet();
  ss.setName('CRM SPMB SMK Karya Bangsa');

  setupSheetReferensi(ss);
  setupSheetUsers(ss);
  setupSheetAuditLog(ss);
  setupSheetNotificationLog(ss);
  setupSheetDataCalon(ss);
  setupSheetFollowUp(ss);
  setupSheetTemplateWA(ss);
  setupSheetDashboard(ss);

  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  ss.setActiveSheet(ss.getSheetByName(CONFIG.sheets.DATA_CALON));
  SpreadsheetApp.getUi().alert(
    '✅ Setup Selesai!\n\n' +
    'Sheet CRM SPMB berhasil dibuat.\n' +
    'Silakan isi sheet Users (termasuk kolom PIN) lalu deploy ulang Web App.'
  );
}

function setupSheetReferensi(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.REFERENSI);
  sh.clearContents();
  sh.setTabColor('#9e9e9e');

  const data = [
    ['STATUS_PIPELINE', 'JURUSAN', 'SUMBER_INFO', 'PRIORITAS', 'ARAH_WA', 'PIC_SPMB'],
    ['Baru', 'RPL', 'Pameran', 'Tinggi', 'Outbound', 'Tim SPMB 1'],
    ['Dihubungi', 'TSM', 'Media Sosial', 'Sedang', 'Inbound', 'Tim SPMB 2'],
    ['Tertarik', 'HTL', 'Referral', 'Rendah', '', 'Tim SPMB 3'],
    ['Proses Daftar', '', 'Website', '', '', 'Tim SPMB 4'],
    ['Sudah Daftar', '', 'Brosur', '', '', ''],
    ['Tidak Jadi', '', 'Walk-in', '', '', ''],
    ['', '', 'Lainnya', '', '', '']
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

function setupSheetUsers(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.USERS);
  sh.clearContents();
  sh.setTabColor('#7c3aed');

  sh.getRange(1, 1, 1, 5)
    .setValues([['Email', 'Nama', 'Role', 'Aktif', 'PIN']])
    .setBackground('#7c3aed')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  sh.setColumnWidth(1, 220);
  sh.setColumnWidth(2, 180);
  sh.setColumnWidth(3, 100);
  sh.setColumnWidth(4, 80);
  sh.setColumnWidth(5, 100);
  sh.setFrozenRows(1);

  // Sample admin awal
  if (sh.getLastRow() === 1) {
    sh.getRange(2, 1, 1, 5).setValues([
      ['vincentlayarda8@gmail.com', 'Sukardi', 'ADMIN', true, '123456']
    ]);
  }
}

function setupSheetAuditLog(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.AUDIT_LOG);
  sh.clearContents();
  sh.setTabColor('#0f766e');

  sh.getRange(1, 1, 1, 7)
    .setValues([['Timestamp', 'UserEmail', 'Action', 'EntityType', 'EntityId', 'Summary', 'PayloadJson']])
    .setBackground('#0f766e')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  sh.setColumnWidth(1, 150);
  sh.setColumnWidth(2, 220);
  sh.setColumnWidth(3, 150);
  sh.setColumnWidth(4, 120);
  sh.setColumnWidth(5, 100);
  sh.setColumnWidth(6, 220);
  sh.setColumnWidth(7, 400);
  sh.setFrozenRows(1);
}

function setupSheetNotificationLog(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.NOTIFICATION_LOG);
  sh.clearContents();
  sh.setTabColor('#7c2d12');

  sh.getRange(1, 1, 1, 6)
    .setValues([['Timestamp', 'Target', 'Type', 'Subject', 'Status', 'Detail']])
    .setBackground('#7c2d12')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  sh.setColumnWidth(1, 150);
  sh.setColumnWidth(2, 220);
  sh.setColumnWidth(3, 140);
  sh.setColumnWidth(4, 240);
  sh.setColumnWidth(5, 100);
  sh.setColumnWidth(6, 320);
  sh.setFrozenRows(1);
}

function setupSheetDataCalon(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.DATA_CALON);
  sh.clearContents();
  sh.setTabColor('#1a73e8');

  const headers = [
    'ID', 'Nama Lengkap', 'No WA', 'Asal Sekolah', 'Jurusan Minat', 'Sumber Info', 'Tanggal Masuk',
    'Status', 'PIC', 'Prioritas', 'Jadwal Followup', 'Terakhir Followup', 'Jumlah Followup', 'Catatan',
    'IsDeleted', 'DeletedAt', 'DeletedBy', 'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy'
  ];

  sh.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  const widths = [80, 160, 120, 150, 120, 120, 110, 120, 110, 90, 120, 130, 80, 200, 90, 130, 180, 130, 180, 130, 180];
  widths.forEach(function(w, i) { sh.setColumnWidth(i + 1, w); });

  const ref = CONFIG.sheets.REFERENSI;
  setDropdown(sh, 2, COL.DATA_CALON.JURUSAN, 499, ref, CONFIG.ranges.REF_JURUSAN);
  setDropdown(sh, 2, COL.DATA_CALON.SUMBER, 499, ref, CONFIG.ranges.REF_SUMBER);
  setDropdown(sh, 2, COL.DATA_CALON.STATUS, 499, ref, CONFIG.ranges.REF_STATUS);
  setDropdown(sh, 2, COL.DATA_CALON.PIC, 499, ref, CONFIG.ranges.REF_PIC);
  setDropdown(sh, 2, COL.DATA_CALON.PRIORITAS, 499, ref, CONFIG.ranges.REF_PRIORITAS);

  sh.getRange(2, COL.DATA_CALON.TANGGAL_MASUK, 499).setNumberFormat('dd/mm/yyyy');
  sh.getRange(2, COL.DATA_CALON.JADWAL_FOLLOWUP, 499).setNumberFormat('dd/mm/yyyy');
  sh.getRange(2, COL.DATA_CALON.TERAKHIR_FOLLOWUP, 499).setNumberFormat('dd/mm/yyyy hh:mm');
  sh.getRange(2, COL.DATA_CALON.DELETED_AT, 499).setNumberFormat('dd/mm/yyyy hh:mm');
  sh.getRange(2, COL.DATA_CALON.CREATED_AT, 499).setNumberFormat('dd/mm/yyyy hh:mm');
  sh.getRange(2, COL.DATA_CALON.UPDATED_AT, 499).setNumberFormat('dd/mm/yyyy hh:mm');

  sh.setFrozenRows(1);
  sh.setFrozenColumns(2);

  applyStatusFormatting(sh);
  insertSampleDataCalon(sh);
}

function setupSheetFollowUp(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.FOLLOWUP);
  sh.clearContents();
  sh.setTabColor('#34a853');

  const headers = [
    'ID Log', 'ID Calon', 'Nama Calon', 'Tanggal & Waktu', 'PIC', 'Arah',
    'Isi Percakapan (Copy WA)', 'Hasil / Kesimpulan', 'Next Action', 'Jadwal Berikutnya'
  ];

  sh.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground('#34a853')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  const widths = [70, 70, 150, 140, 110, 90, 350, 200, 200, 120];
  widths.forEach(function(w, i) { sh.setColumnWidth(i + 1, w); });

  sh.getRange(2, COL.FOLLOWUP.ISI_PERCAKAPAN, 999).setWrap(true);
  sh.getRange(2, COL.FOLLOWUP.HASIL, 999).setWrap(true);
  setDropdown(sh, 2, COL.FOLLOWUP.ARAH, 999, CONFIG.sheets.REFERENSI, CONFIG.ranges.REF_ARAH);

  sh.getRange(2, COL.FOLLOWUP.TANGGAL_WAKTU, 999).setNumberFormat('dd/mm/yyyy hh:mm');
  sh.getRange(2, COL.FOLLOWUP.JADWAL_BERIKUTNYA, 999).setNumberFormat('dd/mm/yyyy');

  sh.setFrozenRows(1);
  sh.setFrozenColumns(3);

  insertSampleFollowUp(sh);
}

function setupSheetTemplateWA(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.TEMPLATE_WA);
  sh.clearContents();
  sh.setTabColor('#25D366');

  const headers = ['Nama Template', 'Situasi', 'Isi Pesan'];
  sh.getRange(1, 1, 1, 3)
    .setValues([headers])
    .setBackground('#25D366')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  const templates = [
    ['Perkenalan Awal', 'Pertama kali hubungi', 'Halo [Nama], perkenalkan saya [PIC] dari Tim SPMB SMK Karya Bangsa Sintang. Kami ingin memberikan informasi mengenai pendaftaran siswa baru tahun ajaran 2025/2026. Apakah [Nama] berminat untuk mengetahui lebih lanjut? 😊'],
    ['Follow Up Ke-2', 'Belum ada respon 2-3 hari', 'Halo [Nama] 🙏 Kami dari SMK Karya Bangsa ingin mengingatkan kembali mengenai informasi pendaftaran yang kami sampaikan sebelumnya. Apakah ada pertanyaan yang bisa kami bantu? Kami dengan senang hati akan membantu 😊'],
    ['Info Jurusan', 'Calon tertarik tanya jurusan', 'SMK Karya Bangsa memiliki beberapa jurusan unggulan:\n✅ RPL (Rekayasa Perangkat Lunak)\n✅ TSM (Teknik Sepeda Motor)\n✅ HTL (Perhotelan)\n\nJurusan mana yang diminati [Nama]?'],
    ['Pengingat Deadline', 'Mendekati batas pendaftaran', 'Halo [Nama] 👋 Kami ingin menginformasikan bahwa batas pendaftaran SPMB SMK Karya Bangsa tinggal [X] hari lagi. Segera daftarkan diri agar tidak kehabisan kuota! Info lebih lanjut hubungi kami. 🏫'],
    ['Konfirmasi Daftar', 'Setelah calon mendaftar', 'Selamat [Nama]! 🎉 Pendaftaran Anda di SMK Karya Bangsa telah kami terima. Tim kami akan segera menghubungi untuk informasi selanjutnya. Terima kasih telah mempercayai SMK Karya Bangsa sebagai pilihan pendidikan Anda 🙏']
  ];

  sh.getRange(2, 1, templates.length, 3).setValues(templates);
  sh.setColumnWidths(1, 1, 150);
  sh.setColumnWidths(2, 1, 180);
  sh.setColumnWidths(3, 1, 500);
  sh.getRange(2, 3, templates.length).setWrap(true);
  sh.setFrozenRows(1);
}

function setupSheetDashboard(ss) {
  const sh = getOrCreateSheet(ss, CONFIG.sheets.DASHBOARD);
  sh.clearContents();
  sh.setTabColor('#f9ab00');

  sh.getRange('A1:E1')
    .merge()
    .setValue('📊 DASHBOARD CRM SPMB — SMK Karya Bangsa')
    .setBackground('#f9ab00')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(13)
    .setHorizontalAlignment('center');

  sh.getRange('A3').setValue('Dashboard utama memakai Web App.').setFontWeight('bold');
  sh.setColumnWidth(1, 200);
}

function migratePhase1Phase2Schema() {
  const ss = getSpreadsheet();

  setupSheetUsers(ss);
  if (!ss.getSheetByName(CONFIG.sheets.AUDIT_LOG)) setupSheetAuditLog(ss);
  if (!ss.getSheetByName(CONFIG.sheets.NOTIFICATION_LOG)) setupSheetNotificationLog(ss);

  const sh = ss.getSheetByName(CONFIG.sheets.DATA_CALON);
  if (!sh) {
    SpreadsheetApp.getUi().alert('Sheet DataCalon tidak ditemukan.');
    return;
  }

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const required = ['IsDeleted', 'DeletedAt', 'DeletedBy', 'CreatedAt', 'CreatedBy', 'UpdatedAt', 'UpdatedBy'];

  required.forEach(function(name) {
    if (headers.indexOf(name) === -1) {
      sh.insertColumnAfter(sh.getLastColumn());
      sh.getRange(1, sh.getLastColumn()).setValue(name);
    }
  });

  const rows = sh.getLastRow();
  if (rows > 1) {
    const map = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const values = sh.getRange(2, 1, rows - 1, sh.getLastColumn()).getValues();

    values.forEach(function(r) {
      if (r[map.indexOf('IsDeleted')] === '') r[map.indexOf('IsDeleted')] = false;
      if (!r[map.indexOf('CreatedAt')]) r[map.indexOf('CreatedAt')] = r[COL.DATA_CALON.TANGGAL_MASUK - 1] || new Date();
      if (!r[map.indexOf('CreatedBy')]) r[map.indexOf('CreatedBy')] = 'migration';
      if (!r[map.indexOf('UpdatedAt')]) r[map.indexOf('UpdatedAt')] = new Date();
      if (!r[map.indexOf('UpdatedBy')]) r[map.indexOf('UpdatedBy')] = 'migration';
    });

    sh.getRange(2, 1, rows - 1, sh.getLastColumn()).setValues(values);
  }

  applyStatusFormatting(sh);
  SpreadsheetApp.getUi().alert('✅ Migrasi selesai. Cek sheet Users lalu deploy ulang Web App.');
}

function installMilestone2Triggers() {
  const result = ReminderService.installDailyReminderTrigger();
  SpreadsheetApp.getUi().alert('✅ Trigger reminder terpasang jam ' + result.hour + ':00 setiap hari.');
}

function migrateMilestone2Schema() {
  return migratePhase1Phase2Schema();
}

function migrateMilestone4Schema() {
  return migratePhase1Phase2Schema();
}