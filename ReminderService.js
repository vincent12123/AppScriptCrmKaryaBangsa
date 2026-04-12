// ============================================================
// CRM SPMB - Reminder Service
// Milestone 2
// ============================================================

const ReminderService = {
  sendDailyReminderEmails: function() {
    const user = AuthService.assertCanManage();
    return this._sendDailyReminderEmailsInternal_(user);
  },

  runDailyReminderJob: function() {
    const actor = { email: 'trigger', role: CONFIG.roles.ADMIN };
    return this._sendDailyReminderEmailsInternal_(actor);
  },

  _sendDailyReminderEmailsInternal_: function(actor) {
    const stats = DashboardService.getStats(true);
    const byPic = {};

    (stats.reminderHariIni || []).forEach(function(item) {
      const picName = String(item.pic || '').trim() || 'Tanpa PIC';
      const key = AuthService.normalizePicName(picName);
      if (!byPic[key]) byPic[key] = { pic: picName, dueToday: [], overdue: [] };
      byPic[key].dueToday.push(item);
    });
    (stats.overdueCalon || []).forEach(function(item) {
      const picName = String(item.pic || '').trim() || 'Tanpa PIC';
      const key = AuthService.normalizePicName(picName);
      if (!byPic[key]) byPic[key] = { pic: picName, dueToday: [], overdue: [] };
      byPic[key].overdue.push(item);
    });

    const recipients = this._resolveRecipients_();
    const sent = [];
    const skipped = [];

    Object.keys(byPic).forEach(function(picKey) {
      const pack = byPic[picKey];
      const recipient = recipients[picKey];
      const pic = (recipient && recipient.nama) || pack.pic;
      if (!recipient || !recipient.email) {
        skipped.push({ pic: pic, reason: 'Email PIC tidak ditemukan di sheet Users.' });
        ReminderService._logNotification_('SKIPPED', pic, 'DAILY_REMINDER', 'Reminder followup harian', 'Email PIC tidak ditemukan');
        return;
      }

      const subject = 'Reminder Followup CRM SPMB - ' + pic;
      const body = ReminderService._buildEmailBody_(pic, pack);
      MailApp.sendEmail({
        to: recipient.email,
        subject: subject,
        body: body
      });
      sent.push({ pic: pic, email: recipient.email, dueToday: pack.dueToday.length, overdue: pack.overdue.length });
      ReminderService._logNotification_('SENT', recipient.email, 'DAILY_REMINDER', subject, 'today=' + pack.dueToday.length + ';overdue=' + pack.overdue.length);
    });

    return {
      sent: sent,
      skipped: skipped,
      totalReminderHariIni: (stats.reminderHariIni || []).length,
      totalOverdue: (stats.overdueCalon || []).length,
      executedBy: actor.email || ''
    };
  },

  installDailyReminderTrigger: function() {
    AuthService.assertCanManage();
    const existing = ScriptApp.getProjectTriggers().filter(function(t) {
      return t.getHandlerFunction() === 'runDailyReminderJob';
    });
    existing.forEach(function(t) { ScriptApp.deleteTrigger(t); });
    ScriptApp.newTrigger('runDailyReminderJob')
      .timeBased()
      .everyDays(1)
      .atHour(CONFIG.reminders.hour)
      .nearMinute(CONFIG.reminders.minute)
      .create();
    return { installed: true, hour: CONFIG.reminders.hour, minute: CONFIG.reminders.minute };
  },

  _resolveRecipients_: function() {
    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.USERS);
    if (!sh || sh.getLastRow() <= 1) return {};
    const rows = sh.getRange(2, 1, sh.getLastRow() - 1, COL.USERS.COUNT).getValues();
    const out = {};
    rows.forEach(function(r) {
      const email = String(r[COL.USERS.EMAIL - 1] || '').trim();
      const nama = String(r[COL.USERS.NAMA - 1] || '').trim();
      const aktif = !String(r[COL.USERS.AKTIF - 1] || '').trim() || normalizeBool(r[COL.USERS.AKTIF - 1]);
      if (email && nama && aktif) out[AuthService.normalizePicName(nama)] = { email: email, nama: nama };
    });
    return out;
  },

  _buildEmailBody_: function(pic, pack) {
    const lines = [];
    lines.push('Halo ' + pic + ',');
    lines.push('');
    lines.push('Berikut reminder followup CRM SPMB hari ini.');
    lines.push('');
    lines.push('Followup hari ini: ' + pack.dueToday.length);
    pack.dueToday.forEach(function(item, idx) {
      lines.push((idx + 1) + '. ' + item.nama + ' | ' + item.jurusan + ' | WA ' + item.noWa + ' | Jadwal ' + (item.jadwalFollowup || '-'));
    });
    lines.push('');
    lines.push('Overdue: ' + pack.overdue.length);
    pack.overdue.forEach(function(item, idx) {
      lines.push((idx + 1) + '. ' + item.nama + ' | ' + item.jurusan + ' | WA ' + item.noWa + ' | Jadwal ' + (item.jadwalFollowup || '-'));
    });
    lines.push('');
    lines.push('Silakan buka Web App CRM untuk tindak lanjut.');
    return lines.join('\n');
  },

  _logNotification_: function(status, target, type, subject, detail) {
    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.NOTIFICATION_LOG);
    if (!sh) return;
    sh.appendRow([new Date(), String(target || ''), String(type || ''), String(subject || ''), String(status || ''), String(detail || '')]);
  }
};

function runDailyReminderJob() {
  return ReminderService.runDailyReminderJob();
}
