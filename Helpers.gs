// ============================================================
// CRM SPMB - Shared Helpers
// Phase 2
// ============================================================

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function ok(data, meta) {
  const res = { ok: true, data: data };
  if (meta) res.meta = meta;
  return res;
}

function fail(message, details) {
  const res = { ok: false, message: message || 'Terjadi kesalahan.' };
  if (details !== undefined) res.details = details;
  return res;
}

function runSafely(handlerName, fn) {
  try {
    return fn();
  } catch (err) {
    console.error(handlerName + ': ' + err.message + '\n' + (err.stack || ''));
    return fail(handlerName + ': ' + err.message);
  }
}

function formatDateSafe(value, pattern) {
  if (!value) return '';
  return Utilities.formatDate(new Date(value), APP.timezone, pattern);
}

function setDropdown(sh, startRow, col, numRows, sheetName, rangeA1) {
  const ss = getSpreadsheet();
  const sourceRange = ss.getSheetByName(sheetName).getRange(rangeA1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sourceRange, true)
    .setAllowInvalid(false)
    .build();
  sh.getRange(startRow, col, numRows).setDataValidation(rule);
}

function applyStatusFormatting(sh) {
  const range = sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), COL.DATA_CALON.COUNT);
  const colorMap = {
    'Baru': '#e3f2fd',
    'Dihubungi': '#fff8e1',
    'Tertarik': '#e8f5e9',
    'Proses Daftar': '#f3e5f5',
    'Sudah Daftar': '#e0f7fa',
    'Tidak Jadi': '#ffebee'
  };

  const rules = Object.keys(colorMap).map(function(status) {
    return SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$H2="' + status + '"')
      .setBackground(colorMap[status])
      .setRanges([range])
      .build();
  });

  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$O2=TRUE')
      .setBackground('#f1f5f9')
      .setFontColor('#64748b')
      .setRanges([range])
      .build()
  );

  sh.setConditionalFormatRules(rules);
}

function uniqueNonEmpty(values) {
  const out = [];
  const seen = {};
  (values || []).forEach(function(v) {
    const val = String(v || '').trim();
    if (!val) return;
    const key = val.toLowerCase();
    if (!seen[key]) {
      seen[key] = true;
      out.push(val);
    }
  });
  return out;
}

function normalizeBool(value) {
  if (value === true || value === 'TRUE' || value === 'true' || value === 1 || value === '1') return true;
  return false;
}

function parseDateInput(value) {
  if (!value) return null;
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) return value;
  var str = String(value || '').trim();
  if (!str) return null;
  var m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    // Buat tanggal di timezone WIB (UTC+7) untuk konsistensi dengan APP.timezone
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    // new Date(y,m,d) membuat di timezone lokal server; konversi ke WIB
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utc + (7 * 3600000));
  }
  m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    var d2 = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    var utc2 = d2.getTime() + (d2.getTimezoneOffset() * 60000);
    return new Date(utc2 + (7 * 3600000));
  }
  var d3 = new Date(str);
  if (isNaN(d3.getTime())) return null;
  return d3;
}

function toCalonRecord(row) {
  return {
    id: String(row[COL.DATA_CALON.ID - 1] || ''),
    nama: String(row[COL.DATA_CALON.NAMA - 1] || ''),
    noWa: String(row[COL.DATA_CALON.NO_WA - 1] || ''),
    asalSekolah: String(row[COL.DATA_CALON.ASAL_SEKOLAH - 1] || ''),
    jurusan: String(row[COL.DATA_CALON.JURUSAN - 1] || ''),
    sumber: String(row[COL.DATA_CALON.SUMBER - 1] || ''),
    tanggalMasuk: row[COL.DATA_CALON.TANGGAL_MASUK - 1] ? formatDateSafe(row[COL.DATA_CALON.TANGGAL_MASUK - 1], 'dd/MM/yyyy') : '',
    status: String(row[COL.DATA_CALON.STATUS - 1] || ''),
    pic: String(row[COL.DATA_CALON.PIC - 1] || ''),
    prioritas: String(row[COL.DATA_CALON.PRIORITAS - 1] || ''),
    jadwalFollowup: row[COL.DATA_CALON.JADWAL_FOLLOWUP - 1] ? formatDateSafe(row[COL.DATA_CALON.JADWAL_FOLLOWUP - 1], 'dd/MM/yyyy') : '',
    terakhirFollowup: row[COL.DATA_CALON.TERAKHIR_FOLLOWUP - 1] ? formatDateSafe(row[COL.DATA_CALON.TERAKHIR_FOLLOWUP - 1], 'dd/MM/yyyy HH:mm') : '',
    jumlahFollowup: row[COL.DATA_CALON.JUMLAH_FOLLOWUP - 1] || 0,
    catatan: String(row[COL.DATA_CALON.CATATAN - 1] || ''),
    isDeleted: normalizeBool(row[COL.DATA_CALON.IS_DELETED - 1]),
    deletedAt: row[COL.DATA_CALON.DELETED_AT - 1] ? formatDateSafe(row[COL.DATA_CALON.DELETED_AT - 1], 'dd/MM/yyyy HH:mm') : '',
    deletedBy: String(row[COL.DATA_CALON.DELETED_BY - 1] || ''),
    createdAt: row[COL.DATA_CALON.CREATED_AT - 1] ? formatDateSafe(row[COL.DATA_CALON.CREATED_AT - 1], 'dd/MM/yyyy HH:mm') : '',
    createdBy: String(row[COL.DATA_CALON.CREATED_BY - 1] || ''),
    updatedAt: row[COL.DATA_CALON.UPDATED_AT - 1] ? formatDateSafe(row[COL.DATA_CALON.UPDATED_AT - 1], 'dd/MM/yyyy HH:mm') : '',
    updatedBy: String(row[COL.DATA_CALON.UPDATED_BY - 1] || '')
  };
}

function toFollowUpRecord(row) {
  return {
    idLog: String(row[COL.FOLLOWUP.ID_LOG - 1] || ''),
    idCalon: String(row[COL.FOLLOWUP.ID_CALON - 1] || ''),
    namaCalon: String(row[COL.FOLLOWUP.NAMA_CALON - 1] || ''),
    tanggal: row[COL.FOLLOWUP.TANGGAL_WAKTU - 1] ? formatDateSafe(row[COL.FOLLOWUP.TANGGAL_WAKTU - 1], 'dd/MM/yyyy HH:mm') : '',
    pic: String(row[COL.FOLLOWUP.PIC - 1] || ''),
    arah: String(row[COL.FOLLOWUP.ARAH - 1] || ''),
    isiPercakapan: String(row[COL.FOLLOWUP.ISI_PERCAKAPAN - 1] || ''),
    hasil: String(row[COL.FOLLOWUP.HASIL - 1] || ''),
    nextAction: String(row[COL.FOLLOWUP.NEXT_ACTION - 1] || ''),
    jadwalBerikutnya: row[COL.FOLLOWUP.JADWAL_BERIKUTNYA - 1] ? formatDateSafe(row[COL.FOLLOWUP.JADWAL_BERIKUTNYA - 1], 'dd/MM/yyyy') : ''
  };
}

function getReferenceColumns() {
  const ref = getSpreadsheet().getSheetByName(CONFIG.sheets.REFERENSI);
  const data = ref.getDataRange().getValues().slice(1);
  return {
    statuses: uniqueNonEmpty(data.map(function(r) { return r[0]; })),
    jurusans: uniqueNonEmpty(data.map(function(r) { return r[1]; })),
    sumbers: uniqueNonEmpty(data.map(function(r) { return r[2]; })),
    prioritas: uniqueNonEmpty(data.map(function(r) { return r[3]; })),
    arahs: uniqueNonEmpty(data.map(function(r) { return r[4]; })),
    pics: uniqueNonEmpty(data.map(function(r) { return r[5]; }))
  };
}

function insertSampleDataCalon(sh) {
  const today = new Date();
  const sample = [
    ['CS-0001', 'Budi Santoso', '081234567890', 'SMP N 1 Sintang', 'RPL', 'Pameran', today, 'Tertarik', 'Tim SPMB 1', 'Tinggi', today, today, 2, 'Orang tua sudah setuju', false, '', '', today, 'system', today, 'system'],
    ['CS-0002', 'Siti Rahayu', '082345678901', 'SMP N 2 Sintang', 'TSM', 'Media Sosial', today, 'Dihubungi', 'Tim SPMB 2', 'Sedang', today, today, 1, 'Masih tanya ke orang tua', false, '', '', today, 'system', today, 'system'],
    ['CS-0003', 'Ahmad Fauzi', '083456789012', 'MTs Nurul Iman', 'HTL', 'Referral', today, 'Baru', 'Tim SPMB 1', 'Rendah', today, today, 0, 'Belum dihubungi', false, '', '', today, 'system', today, 'system']
  ];
  sh.getRange(2, 1, sample.length, sample[0].length).setValues(sample);
}

function insertSampleFollowUp(sh) {
  const now = new Date();
  const sample = [
    ['LOG-0001', 'CS-0001', 'Budi Santoso', now, 'Tim SPMB 1', 'Outbound', 'Halo Budi, perkenalkan saya dari Tim SPMB SMK Karya Bangsa...', 'Calon merespon positif, tertarik jurusan RPL', 'Kirim brosur jurusan RPL', now],
    ['LOG-0002', 'CS-0001', 'Budi Santoso', now, 'Tim SPMB 1', 'Inbound', 'Kak, saya mau tanya untuk RPL nanti belajar apa saja ya?', 'Sudah dijelaskan kurikulum RPL', 'Follow up seminggu lagi', now]
  ];
  sh.getRange(2, 1, sample.length, sample[0].length).setValues(sample);
}


function csvCell(value) {
  if (value === null || value === undefined) return '';
  var str = String(value);
  if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
  return str;
}

function toCsv(rows) {
  return (rows || []).map(function(row) {
    return (row || []).map(csvCell).join(',');
  }).join('\n');
}
