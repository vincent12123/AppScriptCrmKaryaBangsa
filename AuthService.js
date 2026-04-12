// ============================================================
// CRM SPMB - Auth Service
// PIN Login Only - Unified Token Auth
// ============================================================

const AuthService = {
  _requestToken: null,

  setRequestToken: function(token) {
    this._requestToken = (token && String(token).trim()) ? String(token).trim() : null;
  },

  _cacheKey_: function(token) {
    return CONFIG.session.cachePrefix + String(token || '').trim();
  },

  _cache_: function() {
    return CacheService.getScriptCache();
  },

  _normalizeEmail_: function(email) {
    return String(email || '').trim().toLowerCase();
  },

  _normalizeRole_: function(role) {
    const val = String(role || '').trim().toUpperCase();
    return val || CONFIG.roles.VIEWER;
  },

  _lookupUserSheet_: function(email) {
    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.USERS);
    if (!sh || sh.getLastRow() <= 1) return null;

    const rows = sh.getRange(2, 1, sh.getLastRow() - 1, COL.USERS.COUNT).getValues();
    const target = this._normalizeEmail_(email);
    let found = null;

    rows.some(function(r) {
      const rowEmail = String(r[COL.USERS.EMAIL - 1] || '').trim().toLowerCase();
      const aktif = normalizeBool(r[COL.USERS.AKTIF - 1]);
      if (rowEmail === target && aktif) {
        found = {
          email: rowEmail,
          name: String(r[COL.USERS.NAMA - 1] || rowEmail.split('@')[0]).trim() || rowEmail.split('@')[0],
          role: String(r[COL.USERS.ROLE - 1] || CONFIG.roles.VIEWER).trim().toUpperCase() || CONFIG.roles.VIEWER,
          aktif: true,
          pin: String(r[COL.USERS.PIN - 1] || '').trim()
        };
        return true;
      }
      return false;
    });

    return found;
  },

  _resolveToken_: function(token) {
    token = String(token || '').trim();
    if (!token) return null;
    try {
      const raw = this._cache_().get(this._cacheKey_(token));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  _writeToken_: function(token, user) {
    const payload = {
      email: user.email,
      name: user.name,
      role: this._normalizeRole_(user.role),
      aktif: true,
      loginAt: new Date().toISOString()
    };

    this._cache_().put(
      this._cacheKey_(token),
      JSON.stringify(payload),
      CONFIG.session.ttlSeconds
    );

    return payload;
  },

  loginWithPin: function(email, pin) {
    email = this._normalizeEmail_(email);
    pin = String(pin || '').trim();

    if (!email) throw new Error('Email wajib diisi.');
    if (!pin) throw new Error('PIN wajib diisi.');

    const user = this._lookupUserSheet_(email);
    if (!user) throw new Error('Email tidak terdaftar atau akun tidak aktif.');
    if (!user.pin) throw new Error('PIN belum diatur. Hubungi admin.');
    if (user.pin !== pin) throw new Error('Email atau PIN salah.');

    const token = Utilities.getUuid().replace(/-/g, '');
    const sessionUser = this._writeToken_(token, user);

    return {
      token: token,
      user: sessionUser
    };
  },

  logoutSession: function(token) {
    token = String(token || '').trim();
    if (token) {
      try {
        this._cache_().remove(this._cacheKey_(token));
      } catch (e) {}
    }
    return { done: true };
  },

  getCurrentUser: function() {
    if (!this._requestToken) {
      return { email: '', name: 'guest', role: CONFIG.roles.VIEWER, aktif: false };
    }

    const session = this._resolveToken_(this._requestToken);
    if (!session) {
      return { email: '', name: 'guest', role: CONFIG.roles.VIEWER, aktif: false };
    }

    return {
      email: String(session.email || '').trim().toLowerCase(),
      name: String(session.name || 'guest').trim(),
      role: this._normalizeRole_(session.role),
      aktif: true
    };
  },

  isAdmin: function(user) {
    return String((user && user.role) || '') === CONFIG.roles.ADMIN;
  },

  isPic: function(user) {
    return String((user && user.role) || '') === CONFIG.roles.PIC;
  },

  isViewer: function(user) {
    return String((user && user.role) || '') === CONFIG.roles.VIEWER;
  },

  canWrite: function(user) {
    return this.isAdmin(user) || this.isPic(user);
  },

  canManage: function(user) {
    return this.isAdmin(user);
  },

  canImport: function(user) {
    return this.isAdmin(user);
  },

  canExport: function(user) {
    return this.isAdmin(user) || this.isPic(user);
  },

  canSendReminder: function(user) {
    return this.isAdmin(user);
  },

  canViewArchived: function(user) {
    return this.isAdmin(user) || this.isPic(user);
  },

  getAllowedLifecycle: function(requestedLifecycle, user) {
    const lifecycle = String(requestedLifecycle || 'active');
    if (this.canViewArchived(user)) {
      if (lifecycle === 'archived' || lifecycle === 'all') return lifecycle;
    }
    return 'active';
  },

  getScopedPicName: function(user) {
    return this.isPic(user) ? String((user && user.name) || '').trim() : '';
  },

  getScopedPicOptionName: function(user) {
    return this.resolveReferencePicName(this.getScopedPicName(user));
  },

  normalizePicName: function(value) {
    return String(value || '').trim().toLowerCase();
  },

  resolveReferencePicName: function(picName) {
    const normalized = this.normalizePicName(picName);
    if (!normalized) return '';
    const pics = getReferenceColumns().pics || [];
    for (let i = 0; i < pics.length; i++) {
      if (this.normalizePicName(pics[i]) === normalized) return pics[i];
    }
    return '';
  },

  isScopedPicMatch: function(user, picName) {
    return this.normalizePicName(picName) === this.normalizePicName(this.getScopedPicName(user));
  },

  canAccessCalonRow: function(user, row) {
    const deleted = normalizeBool(row[COL.DATA_CALON.IS_DELETED - 1]);
    const pic = String(row[COL.DATA_CALON.PIC - 1] || '').trim();

    if (this.isAdmin(user)) return true;

    if (this.isPic(user)) {
      if (!pic) return false;
      if (!this.isScopedPicMatch(user, pic)) return false;
      if (deleted && !this.canViewArchived(user)) return false;
      return true;
    }

    return !deleted;
  },

  canMutateCalonRow: function(user, row) {
    if (this.isAdmin(user)) return true;
    if (!this.isPic(user)) return false;
    if (normalizeBool(row[COL.DATA_CALON.IS_DELETED - 1])) return false;
    return this.isScopedPicMatch(user, row[COL.DATA_CALON.PIC - 1]);
  },

  canRestoreCalonRow: function(user, row) {
    return this.isAdmin(user) && normalizeBool(row[COL.DATA_CALON.IS_DELETED - 1]);
  },

  canLogFollowupForCalonRow: function(user, row) {
    return this.canMutateCalonRow(user, row);
  },

  getCalonActions: function(user, row) {
    const canMutate = this.canMutateCalonRow(user, row);
    const isDeleted = normalizeBool(row[COL.DATA_CALON.IS_DELETED - 1]);
    return {
      canView: this.canAccessCalonRow(user, row),
      canEdit: !isDeleted && canMutate,
      canArchive: !isDeleted && canMutate,
      canRestore: this.canRestoreCalonRow(user, row),
      canReschedule: !isDeleted && canMutate,
      canLogFollowup: !isDeleted && this.canLogFollowupForCalonRow(user, row)
    };
  },

  assertCanRead: function() {
    const user = this.getCurrentUser();
    if (!user.email) throw new Error('Sesi tidak valid. Silakan login ulang.');
    return user;
  },

  assertCanWrite: function() {
    const user = this.getCurrentUser();
    if (!user.email) throw new Error('Sesi tidak valid. Silakan login ulang.');
    if (!this.canWrite(user)) throw new Error('Anda tidak memiliki izin untuk mengubah data.');
    return user;
  },

  assertCanManage: function() {
    const user = this.getCurrentUser();
    if (!user.email) throw new Error('Sesi tidak valid. Silakan login ulang.');
    if (!this.canManage(user)) throw new Error('Hanya ADMIN yang dapat menjalankan aksi ini.');
    return user;
  },

  assertCanImport: function() {
    const user = this.getCurrentUser();
    if (!user.email) throw new Error('Sesi tidak valid. Silakan login ulang.');
    if (!this.canImport(user)) throw new Error('Hanya ADMIN yang dapat melakukan import CSV.');
    return user;
  },

  assertCanExport: function() {
    const user = this.getCurrentUser();
    if (!user.email) throw new Error('Sesi tidak valid. Silakan login ulang.');
    if (!this.canExport(user)) throw new Error('Anda tidak memiliki izin export laporan.');
    return user;
  }
};