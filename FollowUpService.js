// ============================================================
// CRM SPMB - FollowUp Service
// Milestone 4
// ============================================================

function normalizePicName_(value) {
  return String(value || '').trim().toLowerCase();
}

function assertFollowupPicAllowed_(user, requestedPic) {
  if (!user) throw new Error('User tidak valid.');

  var role = String(user.role || '').trim().toUpperCase();
  var userName = String(user.name || '').trim();
  var pic = String(requestedPic || '').trim();

  if (!pic) throw new Error('PIC wajib diisi.');

  if (role === 'ADMIN') return pic;

  if (role === 'PIC') {
    if (normalizePicName_(pic) !== normalizePicName_(userName)) {
      throw new Error('PIC hanya boleh mengirim log follow-up atas nama PIC sendiri.');
    }
    return userName;
  }

  throw new Error('Anda tidak memiliki izin menambah log follow-up.');
}

const FollowUpService = {
  add: function(data) {
    const user = AuthService.assertCanWrite();
    const payload = Validation.validateFollowUpPayload(data, { user: user });
    const found = CalonService.findRowById_(payload.idCalon);
    const pic = assertFollowupPicAllowed_(user, payload.pic);
    if (!AuthService.canLogFollowupForCalonRow(user, found.row)) throw new Error('Anda tidak memiliki izin menambah log untuk calon ini.');

    const ss = getSpreadsheet();
    const shLog = ss.getSheetByName(CONFIG.sheets.FOLLOWUP);
    const now = new Date();
    const logId = IdService.nextFollowupId();

    shLog.appendRow([
      logId,
      payload.idCalon,
      payload.namaCalon,
      now,
      pic,
      payload.arah,
      payload.isiPercakapan,
      payload.hasil || '',
      payload.nextAction || '',
      payload.jadwalBerikutnya || ''
    ]);

    const updates = found.row.slice();
    updates[COL.DATA_CALON.TERAKHIR_FOLLOWUP - 1] = now;
    updates[COL.DATA_CALON.JUMLAH_FOLLOWUP - 1] = (Number(found.row[COL.DATA_CALON.JUMLAH_FOLLOWUP - 1]) || 0) + 1;
    if (payload.statusBaru) updates[COL.DATA_CALON.STATUS - 1] = payload.statusBaru;
    if (payload.jadwalBerikutnya) updates[COL.DATA_CALON.JADWAL_FOLLOWUP - 1] = payload.jadwalBerikutnya;
    updates[COL.DATA_CALON.UPDATED_AT - 1] = now;
    updates[COL.DATA_CALON.UPDATED_BY - 1] = user.email;
    found.sheet.getRange(found.rowIndex, 1, 1, COL.DATA_CALON.COUNT).setValues([updates]);

    payload.pic = pic;
    AuditService.log('CREATE_FOLLOWUP', 'FOLLOWUP', logId, 'Tambah log followup', payload, user);
    return { logId: logId };
  },

  listAll: function(filter) {
    const user = AuthService.assertCanRead();
    filter = filter || {};
    const calonRows = getSpreadsheet().getSheetByName(CONFIG.sheets.DATA_CALON).getDataRange().getValues().slice(1);
    const calonMap = {};
    calonRows.forEach(function(r) {
      if (r[COL.DATA_CALON.ID - 1]) calonMap[String(r[COL.DATA_CALON.ID - 1])] = r;
    });

    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.FOLLOWUP);
    const rows = sh.getDataRange().getValues().slice(1).filter(function(r) { return r[COL.FOLLOWUP.ID_LOG - 1]; });
    return rows.filter(function(r) {
      if (filter.idCalon && String(r[COL.FOLLOWUP.ID_CALON - 1]) !== String(filter.idCalon)) return false;
      if (filter.pic && String(r[COL.FOLLOWUP.PIC - 1]) !== String(filter.pic)) return false;
      const calonRow = calonMap[String(r[COL.FOLLOWUP.ID_CALON - 1])];
      return calonRow ? AuthService.canAccessCalonRow(user, calonRow) : AuthService.isAdmin(user);
    }).map(toFollowUpRecord).reverse();
  },

  listByCalon: function(idCalon) {
    const user = AuthService.assertCanRead();
    const calon = CalonService.findRowById_(idCalon);
    if (!AuthService.canAccessCalonRow(user, calon.row)) throw new Error('Anda tidak memiliki akses ke riwayat calon ini.');
    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.FOLLOWUP);
    const data = sh.getDataRange().getValues();
    return data.slice(1)
      .filter(function(r) { return r[COL.FOLLOWUP.ID_CALON - 1] === idCalon && r[COL.FOLLOWUP.ID_LOG - 1]; })
      .map(toFollowUpRecord)
      .reverse();
  }
};
