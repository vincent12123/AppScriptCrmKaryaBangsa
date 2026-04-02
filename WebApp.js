// ============================================================
// CRM SPMB - Web App Server Functions
// SMK Karya Bangsa | Dibuat oleh: Sukardi, S.Kom
// ============================================================

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('CRM SPMB — SMK Karya Bangsa')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getCurrentUser() {
  const email = Session.getActiveUser().getEmail();
  const name = email.split('@')[0];
  return { email, name };
}

function getConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ref = ss.getSheetByName('Referensi');
  const data = ref.getDataRange().getValues().slice(1);
  return {
    user:      getCurrentUser(),
    statuses:  data.map(r => r[0]).filter(v => v),
    jurusans:  data.map(r => r[1]).filter(v => v),
    sumbers:   data.map(r => r[2]).filter(v => v),
    prioritas: data.map(r => r[3]).filter(v => v),
    arahs:     data.map(r => r[4]).filter(v => v),
    pics:      data.map(r => r[5]).filter(v => v),
  };
}

function getDataCalon(filter) {
  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  const sh  = ss.getSheetByName('DataCalon');
  const raw = sh.getDataRange().getValues();
  let rows  = raw.slice(1).filter(r => r[0]);

  if (filter) {
    if (filter.status)  rows = rows.filter(r => r[7]  === filter.status);
    if (filter.pic)     rows = rows.filter(r => r[8]  === filter.pic);
    if (filter.jurusan) rows = rows.filter(r => r[4]  === filter.jurusan);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      rows = rows.filter(r =>
        String(r[1]).toLowerCase().includes(q) ||
        String(r[2]).toLowerCase().includes(q) ||
        String(r[3]).toLowerCase().includes(q)
      );
    }
  }

  return rows.map(function(r) {
    return {
      id:              String(r[0]  || ''),
      nama:            String(r[1]  || ''),
      noWa:            String(r[2]  || ''),
      asalSekolah:     String(r[3]  || ''),
      jurusan:         String(r[4]  || ''),
      sumber:          String(r[5]  || ''),
      tanggalMasuk:    r[6]  ? Utilities.formatDate(new Date(r[6]),  'Asia/Jakarta', 'dd/MM/yyyy')       : '',
      status:          String(r[7]  || ''),
      pic:             String(r[8]  || ''),
      prioritas:       String(r[9]  || ''),
      jadwalFollowup:  r[10] ? Utilities.formatDate(new Date(r[10]), 'Asia/Jakarta', 'dd/MM/yyyy')       : '',
      terakhirFollowup:r[11] ? Utilities.formatDate(new Date(r[11]), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm') : '',
      jumlahFollowup:  r[12] || 0,
      catatan:         String(r[13] || '')
    };
  });
}

function addCalon(data) {
  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  const sh  = ss.getSheetByName('DataCalon');
  const id  = 'CS-' + String(sh.getLastRow()).padStart(4, '0');
  const now = new Date();

  sh.appendRow([
    id, data.nama, data.noWa, data.asalSekolah,
    data.jurusan, data.sumber, now,
    'Baru', data.pic, data.prioritas || 'Sedang',
    data.jadwalFollowup ? new Date(data.jadwalFollowup) : '',
    '', 0, data.catatan || ''
  ]);

  return { success: true, id };
}

function addFollowUp(data) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const shLog  = ss.getSheetByName('FollowUp');
  const shCalon= ss.getSheetByName('DataCalon');
  const now    = new Date();
  const logId  = 'LOG-' + String(shLog.getLastRow()).padStart(4, '0');

  shLog.appendRow([
    logId, data.idCalon, data.namaCalon, now,
    data.pic, data.arah, data.isiPercakapan,
    data.hasil || '', data.nextAction || '',
    data.jadwalBerikutnya ? new Date(data.jadwalBerikutnya) : ''
  ]);

  // Update DataCalon
  const rows = shCalon.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.idCalon) {
      const r = i + 1;
      shCalon.getRange(r, 12).setValue(now);
      shCalon.getRange(r, 13).setValue((rows[i][12] || 0) + 1);
      if (data.statusBaru)        shCalon.getRange(r, 8).setValue(data.statusBaru);
      if (data.jadwalBerikutnya)  shCalon.getRange(r, 11).setValue(new Date(data.jadwalBerikutnya));
      break;
    }
  }

  return { success: true, logId };
}

function deleteCalon(id) {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const sh   = ss.getSheetByName('DataCalon');
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sh.deleteRow(i + 1);
      return { success: true };
    }
  }
  throw new Error('ID calon tidak ditemukan: ' + id);
}

function getFollowUpByCalon(idCalon) {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const sh   = ss.getSheetByName('FollowUp');
  const data = sh.getDataRange().getValues();

  return data.slice(1)
    .filter(r => r[1] === idCalon && r[0])
    .map(r => ({
      idLog:           r[0],
      tanggal:         r[3] ? Utilities.formatDate(new Date(r[3]), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm') : '',
      pic:             r[4],
      arah:            r[5],
      isiPercakapan:   r[6],
      hasil:           r[7],
      nextAction:      r[8],
      jadwalBerikutnya:r[9] ? Utilities.formatDate(new Date(r[9]), 'Asia/Jakarta', 'dd/MM/yyyy') : ''
    }))
    .reverse();
}

function getDashboardStats() {
  try {
    const ss   = SpreadsheetApp.getActiveSpreadsheet();
    const sh   = ss.getSheetByName('DataCalon');
    const rows = sh.getLastRow();

    const stats = { total:0, byStatus:{}, byJurusan:{}, byPic:{}, reminderHariIni:[], sudahDaftar:0, tidakJadi:0 };
    if (rows <= 1) return stats; // Belum ada data

    const data = sh.getRange(2, 1, rows - 1, 14).getValues().filter(r => r[0]);

    const today = new Date();
    const todayStr = Utilities.formatDate(today, 'Asia/Jakarta', 'yyyy-MM-dd');

    data.forEach(r => {
      stats.total++;

      const status  = String(r[7] || '-');
      const jurusan = String(r[4] || '-');
      const pic     = String(r[8] || '-');

      stats.byStatus[status]   = (stats.byStatus[status]   || 0) + 1;
      stats.byJurusan[jurusan] = (stats.byJurusan[jurusan] || 0) + 1;
      stats.byPic[pic]         = (stats.byPic[pic]         || 0) + 1;

      if (status === 'Sudah Daftar') stats.sudahDaftar++;
      if (status === 'Tidak Jadi')   stats.tidakJadi++;

      // Cek reminder hari ini
      if (r[10] && r[10] instanceof Date) {
        const jadwalStr = Utilities.formatDate(r[10], 'Asia/Jakarta', 'yyyy-MM-dd');
        if (jadwalStr === todayStr) {
          stats.reminderHariIni.push({
            id:              String(r[0]),
            nama:            String(r[1]),
            noWa:            String(r[2]),
            asalSekolah:     String(r[3]),
            jurusan:         String(r[4]),
            sumber:          String(r[5]),
            status:          String(r[7]),
            pic:             String(r[8]),
            prioritas:       String(r[9] || ''),
            jadwalFollowup:  r[10] ? Utilities.formatDate(r[10], 'Asia/Jakarta', 'dd/MM/yyyy') : '',
            terakhirFollowup:r[11] ? Utilities.formatDate(r[11], 'Asia/Jakarta', 'dd/MM/yyyy HH:mm') : '',
            jumlahFollowup:  r[12] || 0,
            catatan:         String(r[13] || '')
          });
        }
      }
    });

    return stats;

  } catch(e) {
    throw new Error('getDashboardStats: ' + e.message);
  }
}

function getTemplateWA() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('TemplateWA');
  const rows = sh.getDataRange().getValues().slice(1).filter(r => r[0]);
  return rows.map(r => ({
    nama:    String(r[0] || ''),
    situasi: String(r[1] || ''),
    isi:     String(r[2] || '')
  }));
}

