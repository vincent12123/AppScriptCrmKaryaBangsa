// ============================================================
// CRM SPMB - ID Service
// Phase 1/2
// ============================================================

const IdService = {
  next: function(key, prefix) {
    const lock = LockService.getDocumentLock();
    lock.waitLock(30000);
    try {
      const props = PropertiesService.getDocumentProperties();
      let current = Number(props.getProperty(key) || 0);
      if (!current) current = this.inferCurrent(prefix);
      current += 1;
      props.setProperty(key, String(current));
      return prefix + '-' + Utilities.formatString('%04d', current);
    } finally {
      lock.releaseLock();
    }
  },

  inferCurrent: function(prefix) {
    const pattern = new RegExp('^' + prefix + '-(\\d+)$');
    const sheetName = prefix === 'LOG' ? CONFIG.sheets.FOLLOWUP : CONFIG.sheets.DATA_CALON;
    const colIndex = prefix === 'LOG' ? COL.FOLLOWUP.ID_LOG : COL.DATA_CALON.ID;
    const sh = getSpreadsheet().getSheetByName(sheetName);
    if (!sh || sh.getLastRow() <= 1) return 0;
    const values = sh.getRange(2, colIndex, sh.getLastRow() - 1, 1).getValues();
    let maxVal = 0;
    values.forEach(function(r) {
      const val = String(r[0] || '');
      const m = val.match(pattern);
      if (m) maxVal = Math.max(maxVal, Number(m[1]));
    });
    return maxVal;
  },

  nextCalonId: function() {
    return this.next('CRM_LAST_CALON_ID', 'CS');
  },

  nextFollowupId: function() {
    return this.next('CRM_LAST_LOG_ID', 'LOG');
  }
};
