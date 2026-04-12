// ============================================================
// CRM SPMB - Audit Service
// Phase 2
// ============================================================

const AuditService = {
  log: function(action, entityType, entityId, summary, payload, user) {
    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.AUDIT_LOG);
    if (!sh) return;
    const actor = user || AuthService.getCurrentUser();
    sh.appendRow([
      new Date(),
      String((actor && actor.email) || ''),
      String(action || ''),
      String(entityType || ''),
      String(entityId || ''),
      String(summary || ''),
      JSON.stringify(payload || {})
    ]);
  }
};
