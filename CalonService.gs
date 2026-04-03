// ============================================================
// CRM SPMB - Calon Service
// Milestone 4
// ============================================================

const CalonService = {
  list: function(filter) {
    const user = AuthService.assertCanRead();
    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.DATA_CALON);
    const raw = sh.getDataRange().getValues();
    let rows = raw.slice(1).filter(function(r) { return r[COL.DATA_CALON.ID - 1]; });
    filter = filter || {};
    const lifecycle = AuthService.getAllowedLifecycle(filter.lifecycle || 'active', user);
    const overdueOnly = normalizeBool(filter.overdueOnly);

    rows = rows.filter(function(r) {
      const deleted = normalizeBool(r[COL.DATA_CALON.IS_DELETED - 1]);
      if (lifecycle === 'archived' && !deleted) return false;
      if (lifecycle === 'active' && deleted) return false;
      return AuthService.canAccessCalonRow(user, r);
    });

    if (filter.status) rows = rows.filter(function(r) { return r[COL.DATA_CALON.STATUS - 1] === filter.status; });
    if (filter.pic) rows = rows.filter(function(r) { return r[COL.DATA_CALON.PIC - 1] === filter.pic; });
    if (filter.jurusan) rows = rows.filter(function(r) { return r[COL.DATA_CALON.JURUSAN - 1] === filter.jurusan; });
    if (filter.search) {
      const q = String(filter.search).toLowerCase();
      rows = rows.filter(function(r) {
        return String(r[COL.DATA_CALON.NAMA - 1]).toLowerCase().includes(q) ||
          String(r[COL.DATA_CALON.NO_WA - 1]).toLowerCase().includes(q) ||
          String(r[COL.DATA_CALON.ASAL_SEKOLAH - 1]).toLowerCase().includes(q);
      });
    }

    if (overdueOnly) {
      const todayStr = Utilities.formatDate(new Date(), APP.timezone, 'yyyy-MM-dd');
      const terminalStatuses = ['Sudah Daftar', 'Tidak Jadi'];
      rows = rows.filter(function(r) {
        const jadwal = r[COL.DATA_CALON.JADWAL_FOLLOWUP - 1];
        if (!(jadwal instanceof Date)) return false;
        const status = String(r[COL.DATA_CALON.STATUS - 1] || '');
        if (terminalStatuses.indexOf(status) !== -1) return false;
        return Utilities.formatDate(jadwal, APP.timezone, 'yyyy-MM-dd') < todayStr;
      });
    }

    return rows.map(function(row) {
      return CalonService.decorateRecord_(user, row);
    });
  },

  decorateRecord_: function(user, row) {
    const record = toCalonRecord(row);
    record.actions = AuthService.getCalonActions(user, row);
    return record;
  },

  findById: function(id) {
    const user = AuthService.assertCanRead();
    const found = this.findRowById_(id);
    if (!AuthService.canAccessCalonRow(user, found.row)) throw new Error('Anda tidak memiliki akses ke data calon ini.');
    return this.decorateRecord_(user, found.row);
  },

  findRowById_: function(id) {
    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.DATA_CALON);
    const data = sh.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][COL.DATA_CALON.ID - 1]) === String(id)) {
        return { sheet: sh, rowIndex: i + 1, row: data[i] };
      }
    }
    throw new Error('ID calon tidak ditemukan: ' + id);
  },

  add: function(data) {
    const user = AuthService.assertCanWrite();
    const payload = Validation.validateCalonPayload(data, { user: user });
    if (AuthService.isPic(user) && !AuthService.isScopedPicMatch(user, payload.pic)) {
      throw new Error('PIC hanya boleh menambah calon untuk PIC dirinya sendiri.');
    }
    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.DATA_CALON);
    const now = new Date();
    const id = IdService.nextCalonId();

    sh.appendRow([
      id,
      payload.nama,
      payload.noWa,
      payload.asalSekolah,
      payload.jurusan,
      payload.sumber,
      now,
      payload.status || 'Baru',
      payload.pic,
      payload.prioritas,
      payload.jadwalFollowup || '',
      '',
      0,
      payload.catatan,
      false,
      '',
      '',
      now,
      user.email,
      now,
      user.email
    ]);

    AuditService.log('CREATE_CALON', 'CALON', id, 'Tambah calon baru', payload, user);
    return { id: id };
  },

  update: function(data) {
    const user = AuthService.assertCanWrite();
    const payload = Validation.validateCalonPayload(data, { isUpdate: true, user: user });
    if (!payload.id) throw new Error('ID calon wajib diisi untuk edit.');
    const found = this.findRowById_(payload.id);
    if (!AuthService.canMutateCalonRow(user, found.row)) throw new Error('Anda tidak memiliki izin edit untuk calon ini.');
    if (AuthService.isPic(user) && !AuthService.isScopedPicMatch(user, payload.pic)) {
      throw new Error('PIC tidak boleh memindahkan calon ke PIC lain.');
    }

    const row = found.row.slice();
    row[COL.DATA_CALON.NAMA - 1] = payload.nama;
    row[COL.DATA_CALON.NO_WA - 1] = payload.noWa;
    row[COL.DATA_CALON.ASAL_SEKOLAH - 1] = payload.asalSekolah;
    row[COL.DATA_CALON.JURUSAN - 1] = payload.jurusan;
    row[COL.DATA_CALON.SUMBER - 1] = payload.sumber;
    row[COL.DATA_CALON.STATUS - 1] = payload.status;
    row[COL.DATA_CALON.PIC - 1] = payload.pic;
    row[COL.DATA_CALON.PRIORITAS - 1] = payload.prioritas;
    row[COL.DATA_CALON.JADWAL_FOLLOWUP - 1] = payload.jadwalFollowup || '';
    row[COL.DATA_CALON.CATATAN - 1] = payload.catatan;
    row[COL.DATA_CALON.UPDATED_AT - 1] = new Date();
    row[COL.DATA_CALON.UPDATED_BY - 1] = user.email;

    found.sheet.getRange(found.rowIndex, 1, 1, COL.DATA_CALON.COUNT).setValues([row]);
    AuditService.log('UPDATE_CALON', 'CALON', payload.id, 'Edit data calon', payload, user);
    return { id: payload.id, updated: true };
  },

  reschedule: function(data) {
    const user = AuthService.assertCanWrite();
    const payload = Validation.validateReschedulePayload(data);
    const found = this.findRowById_(payload.idCalon);
    if (!AuthService.canMutateCalonRow(user, found.row)) throw new Error('Anda tidak memiliki izin reschedule untuk calon ini.');
    const row = found.row.slice();
    row[COL.DATA_CALON.JADWAL_FOLLOWUP - 1] = payload.jadwalFollowup;
    row[COL.DATA_CALON.UPDATED_AT - 1] = new Date();
    row[COL.DATA_CALON.UPDATED_BY - 1] = user.email;
    found.sheet.getRange(found.rowIndex, 1, 1, COL.DATA_CALON.COUNT).setValues([row]);
    AuditService.log('RESCHEDULE_CALON', 'CALON', payload.idCalon, 'Reschedule followup', {
      idCalon: payload.idCalon,
      jadwalFollowup: formatDateSafe(payload.jadwalFollowup, 'yyyy-MM-dd'),
      note: payload.note
    }, user);
    return { id: payload.idCalon, rescheduled: true };
  },

  archive: function(id) {
    const user = AuthService.assertCanWrite();
    const found = this.findRowById_(id);
    if (!AuthService.canMutateCalonRow(user, found.row)) throw new Error('Anda tidak memiliki izin mengarsipkan calon ini.');
    if (normalizeBool(found.row[COL.DATA_CALON.IS_DELETED - 1])) return { success: true, archived: true };
    const now = new Date();
    found.sheet.getRange(found.rowIndex, COL.DATA_CALON.IS_DELETED, 1, 7).setValues([[true, now, user.email, found.row[COL.DATA_CALON.CREATED_AT - 1] || now, found.row[COL.DATA_CALON.CREATED_BY - 1] || user.email, now, user.email]]);
    AuditService.log('ARCHIVE_CALON', 'CALON', id, 'Arsipkan calon', { id: id }, user);
    return { success: true, archived: true };
  },

  restore: function(id) {
    const user = AuthService.assertCanManage();
    const found = this.findRowById_(id);
    if (!AuthService.canRestoreCalonRow(user, found.row)) throw new Error('Anda tidak memiliki izin restore untuk calon ini.');
    const now = new Date();
    found.sheet.getRange(found.rowIndex, COL.DATA_CALON.IS_DELETED, 1, 7).setValues([[false, '', '', found.row[COL.DATA_CALON.CREATED_AT - 1] || now, found.row[COL.DATA_CALON.CREATED_BY - 1] || user.email, now, user.email]]);
    AuditService.log('RESTORE_CALON', 'CALON', id, 'Pulihkan calon dari arsip', { id: id }, user);
    return { success: true, restored: true };
  },

  findExistingByNameWa_: function(nama, noWa) {
    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.DATA_CALON);
    const rows = sh.getDataRange().getValues().slice(1);
    const targetName = String(nama || '').trim().toLowerCase();
    const targetWa = String(noWa || '').trim();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row[COL.DATA_CALON.ID - 1]) continue;
      if (normalizeBool(row[COL.DATA_CALON.IS_DELETED - 1])) continue;
      if (String(row[COL.DATA_CALON.NAMA - 1] || '').trim().toLowerCase() === targetName && String(row[COL.DATA_CALON.NO_WA - 1] || '').trim() === targetWa) {
        return { rowIndex: i + 2, row: row };
      }
    }
    return null;
  },

  remove: function(id) {
    return this.archive(id);
  }
};
