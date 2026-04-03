// ============================================================
// CRM SPMB - Web App Endpoints
// Milestone 4 + PIN Auth
// ============================================================

function doGet(e) {
  var view = (e && e.parameter && e.parameter.view) || 'mobile';
  view = String(view).toLowerCase();

  var fileName = 'Index';
  if (view === 'desktop') fileName = 'IndexDesktop';

  return HtmlService.createTemplateFromFile(fileName)
    .evaluate()
    .setTitle('CRM SPMB — SMK Karya Bangsa')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ── Helper: set token sebelum eksekusi service ───────────────
function _withToken(token, fn) {
  AuthService.setRequestToken(token || null);
  try {
    return fn();
  } finally {
    AuthService.setRequestToken(null); // reset setelah selesai
  }
}

// ── Auth endpoints (tidak butuh token) ──────────────────────
function loginWithPin(credentials) {
  return runSafely('loginWithPin', function() {
    return ok(AuthService.loginWithPin(
      (credentials && credentials.email) || '',
      (credentials && credentials.pin)   || ''
    ));
  });
}

function logoutSession(token) {
  return runSafely('logoutSession', function() {
    return ok(AuthService.logoutSession(token));
  });
}

// ── Semua endpoint berikut butuh token ──────────────────────
function getConfig(token) {
  return runSafely('getConfig', function() {
    return _withToken(token, function() {
      return ok(ConfigService.getConfig());
    });
  });
}

function getDataCalon(filter, token) {
  return runSafely('getDataCalon', function() {
    return _withToken(token, function() { return ok(CalonService.list(filter || {})); });
  });
}

function addCalon(data, token) {
  return runSafely('addCalon', function() {
    return _withToken(token, function() { return ok(CalonService.add(data)); });
  });
}

function updateCalon(data, token) {
  return runSafely('updateCalon', function() {
    return _withToken(token, function() { return ok(CalonService.update(data)); });
  });
}

function deleteCalon(id, token) {
  return runSafely('deleteCalon', function() {
    return _withToken(token, function() { return ok(CalonService.archive(id)); });
  });
}

function restoreCalon(id, token) {
  return runSafely('restoreCalon', function() {
    return _withToken(token, function() { return ok(CalonService.restore(id)); });
  });
}

function rescheduleCalon(data, token) {
  return runSafely('rescheduleCalon', function() {
    return _withToken(token, function() { return ok(CalonService.reschedule(data)); });
  });
}

function addFollowUp(data, token) {
  return runSafely('addFollowUp', function() {
    return _withToken(token, function() { return ok(FollowUpService.add(data)); });
  });
}

function getFollowUpByCalon(idCalon, token) {
  return runSafely('getFollowUpByCalon', function() {
    return _withToken(token, function() { return ok(FollowUpService.listByCalon(idCalon)); });
  });
}

function getDashboardStats(token) {
  return runSafely('getDashboardStats', function() {
    return _withToken(token, function() { return ok(DashboardService.getStats()); });
  });
}

function getTemplateWA(token) {
  return runSafely('getTemplateWA', function() {
    return _withToken(token, function() { return ok(TemplateService.list()); });
  });
}

function exportReport(type, filter, token) {
  return runSafely('exportReport', function() {
    return _withToken(token, function() { return ok(ExportService.exportReport(type, filter || {})); });
  });
}

function importCalonCsv(csvText, options, token) {
  return runSafely('importCalonCsv', function() {
    return _withToken(token, function() { return ok(ImportService.importCalonCsv(csvText, options || {})); });
  });
}

function sendDailyReminderEmails(token) {
  return runSafely('sendDailyReminderEmails', function() {
    return _withToken(token, function() { return ok(ReminderService.sendDailyReminderEmails()); });
  });
}

function renderTemplatePreview(templateName, calonId, extras, token) {
  return runSafely('renderTemplatePreview', function() {
    return _withToken(token, function() { return ok(TemplateService.render(templateName, calonId, extras || {})); });
  });
}

function installDailyReminderTrigger() {
  return runSafely('installDailyReminderTrigger', function() {
    return ok(ReminderService.installDailyReminderTrigger());
  });
}