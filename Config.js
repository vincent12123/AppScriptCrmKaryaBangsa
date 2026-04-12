// ============================================================
// CRM SPMB - Shared Configuration & Column Indexes
// Milestone 4 + PIN Auth
// ============================================================

const APP = {
  name: 'CRM SPMB — SMK Karya Bangsa',
  timezone: 'Asia/Jakarta'
};

const CONFIG = {
  sheets: {
    DATA_CALON: 'DataCalon',
    FOLLOWUP: 'FollowUp',
    DASHBOARD: 'Dashboard',
    REFERENSI: 'Referensi',
    TEMPLATE_WA: 'TemplateWA',
    USERS: 'Users',
    AUDIT_LOG: 'AuditLog',
    NOTIFICATION_LOG: 'NotificationLog'
  },
  ranges: {
    REF_STATUS: 'A2:A7',
    REF_JURUSAN: 'B2:B7',
    REF_SUMBER: 'C2:C8',
    REF_PRIORITAS: 'D2:D4',
    REF_ARAH: 'E2:E3',
    REF_PIC: 'F2:F5'
  },
  roles: {
    ADMIN: 'ADMIN',
    PIC: 'PIC',
    VIEWER: 'VIEWER'
  },
  reminders: {
    hour: 7,
    minute: 0
  },
  import: {
    maxRows: 500,
    maxChars: 400000
  },
  session: {
    ttlSeconds: 28800, // 8 jam
    cachePrefix: 'crm_sess_'
  }
};

const COL = {
  DATA_CALON: {
    ID: 1,
    NAMA: 2,
    NO_WA: 3,
    ASAL_SEKOLAH: 4,
    JURUSAN: 5,
    SUMBER: 6,
    TANGGAL_MASUK: 7,
    STATUS: 8,
    PIC: 9,
    PRIORITAS: 10,
    JADWAL_FOLLOWUP: 11,
    TERAKHIR_FOLLOWUP: 12,
    JUMLAH_FOLLOWUP: 13,
    CATATAN: 14,
    IS_DELETED: 15,
    DELETED_AT: 16,
    DELETED_BY: 17,
    CREATED_AT: 18,
    CREATED_BY: 19,
    UPDATED_AT: 20,
    UPDATED_BY: 21,
    COUNT: 21
  },
  FOLLOWUP: {
    ID_LOG: 1,
    ID_CALON: 2,
    NAMA_CALON: 3,
    TANGGAL_WAKTU: 4,
    PIC: 5,
    ARAH: 6,
    ISI_PERCAKAPAN: 7,
    HASIL: 8,
    NEXT_ACTION: 9,
    JADWAL_BERIKUTNYA: 10,
    COUNT: 10
  },
  USERS: {
    EMAIL: 1,
    NAMA: 2,
    ROLE: 3,
    AKTIF: 4,
    PIN: 5,      // ← kolom baru
    COUNT: 5
  },
  AUDIT_LOG: {
    TIMESTAMP: 1,
    USER_EMAIL: 2,
    ACTION: 3,
    ENTITY_TYPE: 4,
    ENTITY_ID: 5,
    SUMMARY: 6,
    PAYLOAD_JSON: 7,
    COUNT: 7
  },
  NOTIFICATION_LOG: {
    TIMESTAMP: 1,
    TARGET: 2,
    TYPE: 3,
    SUBJECT: 4,
    STATUS: 5,
    DETAIL: 6,
    COUNT: 6
  }
};