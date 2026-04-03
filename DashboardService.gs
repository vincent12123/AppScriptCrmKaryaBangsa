// ============================================================
// CRM SPMB - Dashboard Service
// Milestone 4
// ============================================================

const DashboardService = {
  getStats: function(skipAuth) {
    const user = skipAuth ? { email: 'system', role: CONFIG.roles.ADMIN, name: 'system' } : AuthService.assertCanRead();
    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.DATA_CALON);
    const rows = sh.getLastRow();
    const stats = {
      total: 0,
      byStatus: {},
      byJurusan: {},
      byPic: {},
      bySumber: {},
      reminderHariIni: [],
      overdueCalon: [],
      overdueByPic: {},
      sudahDaftar: 0,
      tidakJadi: 0,
      archived: 0,
      belumPernahFollowup: 0,
      calonBaru7Hari: 0,
      conversionByPic: [],
      monthlyTrend: []
    };
    if (rows <= 1) return stats;

    const data = sh.getRange(2, 1, rows - 1, COL.DATA_CALON.COUNT).getValues().filter(function(r) {
      return r[COL.DATA_CALON.ID - 1] && AuthService.canAccessCalonRow(user, r);
    });

    const now = new Date();
    const todayStr = Utilities.formatDate(now, APP.timezone, 'yyyy-MM-dd');
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const terminalStatuses = ['Sudah Daftar', 'Tidak Jadi'];
    const picAgg = {};
    const monthMap = {};

    data.forEach(function(row) {
      const calon = toCalonRecord(row);
      const pic = calon.pic || '-';
      const status = calon.status || '-';
      const sumber = calon.sumber || '-';
      const jurusan = calon.jurusan || '-';
      const tanggalMasuk = row[COL.DATA_CALON.TANGGAL_MASUK - 1] instanceof Date ? row[COL.DATA_CALON.TANGGAL_MASUK - 1] : null;
      const jadwal = row[COL.DATA_CALON.JADWAL_FOLLOWUP - 1] instanceof Date ? row[COL.DATA_CALON.JADWAL_FOLLOWUP - 1] : null;

      if (calon.isDeleted) {
        stats.archived++;
        return;
      }

      stats.total++;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      stats.byJurusan[jurusan] = (stats.byJurusan[jurusan] || 0) + 1;
      stats.byPic[pic] = (stats.byPic[pic] || 0) + 1;
      stats.bySumber[sumber] = (stats.bySumber[sumber] || 0) + 1;

      if (!picAgg[pic]) picAgg[pic] = { pic: pic, total: 0, sudahDaftar: 0 };
      picAgg[pic].total++;
      if (status === 'Sudah Daftar') {
        stats.sudahDaftar++;
        picAgg[pic].sudahDaftar++;
      }
      if (status === 'Tidak Jadi') stats.tidakJadi++;
      if (!Number(row[COL.DATA_CALON.JUMLAH_FOLLOWUP - 1] || 0)) stats.belumPernahFollowup++;
      if (tanggalMasuk && tanggalMasuk >= sevenDaysAgo) stats.calonBaru7Hari++;
      if (tanggalMasuk) {
        const label = Utilities.formatDate(tanggalMasuk, APP.timezone, 'yyyy-MM');
        monthMap[label] = (monthMap[label] || 0) + 1;
      }

      if (jadwal) {
        const jadwalStr = Utilities.formatDate(jadwal, APP.timezone, 'yyyy-MM-dd');
        if (jadwalStr === todayStr) {
          calon.actions = AuthService.getCalonActions(user, row);
          stats.reminderHariIni.push(calon);
        } else if (jadwalStr < todayStr && terminalStatuses.indexOf(status) === -1) {
          calon.actions = AuthService.getCalonActions(user, row);
          stats.overdueCalon.push(calon);
          stats.overdueByPic[pic] = (stats.overdueByPic[pic] || 0) + 1;
        }
      }
    });

    stats.conversionByPic = Object.keys(picAgg).sort().map(function(pic) {
      var total = picAgg[pic].total || 0;
      var done = picAgg[pic].sudahDaftar || 0;
      return {
        pic: pic,
        total: total,
        sudahDaftar: done,
        konversi: total ? Math.round((done / total) * 100) : 0
      };
    });

    stats.monthlyTrend = Object.keys(monthMap).sort().slice(-6).map(function(label) {
      return { label: label, total: monthMap[label] };
    });

    return stats;
  }
};
