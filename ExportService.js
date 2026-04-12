// ============================================================
// CRM SPMB - Export Service
// Milestone 4
// ============================================================

const ExportService = {
  exportReport: function(type, filter) {
    AuthService.assertCanExport();
    filter = filter || {};
    type = String(type || '').toLowerCase();
    if (!type) throw new Error('Tipe export wajib diisi.');

    if (type === 'calon') return this.exportCalonCsv(filter);
    if (type === 'followup') return this.exportFollowupCsv(filter);
    if (type === 'dashboard') return this.exportDashboardCsv();
    throw new Error('Tipe export tidak dikenali: ' + type);
  },

  exportCalonCsv: function(filter) {
    const rows = CalonService.list(filter || {});
    const header = [
      'ID','Nama Lengkap','No WA','Asal Sekolah','Jurusan Minat','Sumber Info','Tanggal Masuk',
      'Status','PIC','Prioritas','Jadwal Followup','Terakhir Followup','Jumlah Followup','Catatan',
      'IsDeleted','DeletedAt','DeletedBy','CreatedAt','CreatedBy','UpdatedAt','UpdatedBy'
    ];
    const data = rows.map(function(r) {
      return [
        r.id, r.nama, r.noWa, r.asalSekolah, r.jurusan, r.sumber, r.tanggalMasuk,
        r.status, r.pic, r.prioritas, r.jadwalFollowup, r.terakhirFollowup, r.jumlahFollowup, r.catatan,
        r.isDeleted, r.deletedAt, r.deletedBy, r.createdAt, r.createdBy, r.updatedAt, r.updatedBy
      ];
    });
    return {
      filename: 'crm-spmb-calon-' + Utilities.formatDate(new Date(), APP.timezone, 'yyyyMMdd-HHmmss') + '.csv',
      mimeType: 'text/csv',
      content: toCsv([header].concat(data))
    };
  },

  exportFollowupCsv: function(filter) {
    const rows = FollowUpService.listAll(filter || {});
    const header = ['ID Log','ID Calon','Nama Calon','Tanggal & Waktu','PIC','Arah','Isi Percakapan','Hasil / Kesimpulan','Next Action','Jadwal Berikutnya'];
    const data = rows.map(function(r) {
      return [
        r.idLog, r.idCalon, r.namaCalon, r.tanggal,
        r.pic, r.arah, r.isiPercakapan, r.hasil, r.nextAction, r.jadwalBerikutnya
      ];
    });
    return {
      filename: 'crm-spmb-followup-' + Utilities.formatDate(new Date(), APP.timezone, 'yyyyMMdd-HHmmss') + '.csv',
      mimeType: 'text/csv',
      content: toCsv([header].concat(data))
    };
  },

  exportDashboardCsv: function() {
    const stats = DashboardService.getStats();
    const rows = [];
    rows.push(['METRIC','VALUE']);
    rows.push(['Total Calon', stats.total || 0]);
    rows.push(['Sudah Daftar', stats.sudahDaftar || 0]);
    rows.push(['Tidak Jadi', stats.tidakJadi || 0]);
    rows.push(['Arsip', stats.archived || 0]);
    rows.push(['Belum Pernah Followup', stats.belumPernahFollowup || 0]);
    rows.push(['Calon Baru 7 Hari', stats.calonBaru7Hari || 0]);
    rows.push(['Reminder Hari Ini', (stats.reminderHariIni || []).length]);
    rows.push(['Overdue', (stats.overdueCalon || []).length]);
    rows.push([]);
    rows.push(['STATUS PIPELINE','JUMLAH']);
    Object.keys(stats.byStatus || {}).sort().forEach(function(k) { rows.push([k, stats.byStatus[k]]); });
    rows.push([]);
    rows.push(['SUMBER INFO','JUMLAH']);
    Object.keys(stats.bySumber || {}).sort().forEach(function(k) { rows.push([k, stats.bySumber[k]]); });
    rows.push([]);
    rows.push(['KONVERSI PER PIC','TOTAL CALON','SUDAH DAFTAR','KONVERSI %']);
    (stats.conversionByPic || []).forEach(function(r) { rows.push([r.pic, r.total, r.sudahDaftar, r.konversi]); });
    rows.push([]);
    rows.push(['TREN BULANAN','TOTAL']);
    (stats.monthlyTrend || []).forEach(function(r) { rows.push([r.label, r.total]); });
    return {
      filename: 'crm-spmb-dashboard-' + Utilities.formatDate(new Date(), APP.timezone, 'yyyyMMdd-HHmmss') + '.csv',
      mimeType: 'text/csv',
      content: toCsv(rows)
    };
  }
};
