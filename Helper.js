// ── HELPER: Get or Create Sheet ──────────────────────────────
function getOrCreateSheet(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

// ── HELPER: Set Dropdown Validation ─────────────────────────
function setDropdown(sh, startRow, col, numRows, sheetName, rangeA1) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceRange = ss.getSheetByName(sheetName).getRange(rangeA1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sourceRange, true)
    .setAllowInvalid(false)
    .build();
  sh.getRange(startRow, col, numRows).setDataValidation(rule);
}

// ── HELPER: Conditional Formatting Status ────────────────────
function applyStatusFormatting(sh) {
  const range = sh.getRange('A2:N500');
  const colorMap = {
    'Baru':          '#e3f2fd',
    'Dihubungi':     '#fff8e1',
    'Tertarik':      '#e8f5e9',
    'Proses Daftar': '#f3e5f5',
    'Sudah Daftar':  '#e0f7fa',
    'Tidak Jadi':    '#ffebee'
  };

  const rules = Object.entries(colorMap).map(([status, color]) =>
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(`=$H2="${status}"`)   // ✅ bukan whenFormula
      .setBackground(color)
      .setRanges([range])
      .build()
  );

  sh.setConditionalFormatRules(rules);
}

// ── HELPER: Generate ID ──────────────────────────────────────
function generateID(prefix, sheet) {
  const lastRow = sheet.getLastRow();
  const num = String(lastRow).padStart(4, '0');
  return `${prefix}-${num}`;
}

// ── SAMPLE DATA: DataCalon ───────────────────────────────────
function insertSampleDataCalon(sh) {
  const today = new Date();
  const sample = [
    ['CS-0001', 'Budi Santoso', '081234567890', 'SMP N 1 Sintang',
     'RPL', 'Pameran', today, 'Tertarik', 'Tim SPMB 1',
     'Tinggi', today, today, 2, 'Orang tua sudah setuju'],
    ['CS-0002', 'Siti Rahayu', '082345678901', 'SMP N 2 Sintang',
     'TSM', 'Media Sosial', today, 'Dihubungi', 'Tim SPMB 2',
     'Sedang', today, today, 1, 'Masih tanya ke orang tua'],
    ['CS-0003', 'Ahmad Fauzi', '083456789012', 'MTs Nurul Iman',
     'HTL', 'Referral', today, 'Baru', 'Tim SPMB 1',
     'Rendah', today, today, 0, 'Belum dihubungi']
  ];
  sh.getRange(2, 1, sample.length, sample[0].length).setValues(sample);
}

// ── SAMPLE DATA: FollowUp ────────────────────────────────────
function insertSampleFollowUp(sh) {
  const now = new Date();
  const sample = [
    ['LOG-0001', 'CS-0001', 'Budi Santoso', now,
     'Tim SPMB 1', 'Outbound',
     'Halo Budi, perkenalkan saya dari Tim SPMB SMK Karya Bangsa...',
     'Calon merespon positif, tertarik jurusan RPL',
     'Kirim brosur jurusan RPL', now],
    ['LOG-0002', 'CS-0001', 'Budi Santoso', now,
     'Tim SPMB 1', 'Inbound',
     'Kak, saya mau tanya untuk RPL nanti belajar apa saja ya?',
     'Sudah dijelaskan kurikulum RPL',
     'Follow up seminggu lagi', now]
  ];
  sh.getRange(2, 1, sample.length, sample[0].length).setValues(sample);
}