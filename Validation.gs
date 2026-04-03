// ============================================================
// CRM SPMB - Validation
// Milestone 4
// ============================================================

const Validation = {
  resolveAllowedValue: function(value, allowedValues) {
    var normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return '';
    var items = allowedValues || [];
    for (var i = 0; i < items.length; i++) {
      if (String(items[i] || '').trim().toLowerCase() === normalized) return items[i];
    }
    return '';
  },

  resolvePicValue: function(value, refs, options) {
    var pic = this.sanitizePlainText(value, 80);
    var resolved = this.resolveAllowedValue(pic, refs);
    if (resolved) return resolved;

    var user = options && options.user;
    if (user && AuthService.isPic(user) && AuthService.isScopedPicMatch(user, pic)) {
      return AuthService.getScopedPicOptionName(user) || AuthService.getScopedPicName(user);
    }

    return '';
  },

  sanitizePlainText: function(value, maxLen) {
    let str = String(value || '');
    str = str.replace(/<[^>]*>/g, ' ');
    str = str.replace(/[\u0000-\u001f\u007f]/g, ' ');
    str = str.replace(/\s+/g, ' ').trim();
    if (maxLen && str.length > maxLen) str = str.slice(0, maxLen).trim();
    return str;
  },

  sanitizeMultiline: function(value, maxLen) {
    let str = String(value || '');
    str = str.replace(/<[^>]*>/g, ' ');
    str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    str = str.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ');
    str = str.split('\n').map(function(line) { return line.trimEnd(); }).join('\n').trim();
    if (maxLen && str.length > maxLen) str = str.slice(0, maxLen).trim();
    return str;
  },

  normalizePhoneNumber: function(noWa) {
    const digits = String(noWa || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.indexOf('62') === 0) return '0' + digits.slice(2);
    return digits;
  },

  validateCalonPayload: function(data, options) {
    data = data || {};
    options = options || {};
    const refs = getReferenceColumns();
    const nama = this.sanitizePlainText(data.nama, 120);
    const asalSekolah = this.sanitizePlainText(data.asalSekolah, 120);
    const noWa = this.normalizePhoneNumber(data.noWa);
    const jurusan = this.sanitizePlainText(data.jurusan, 60);
    const pic = this.resolvePicValue(data.pic, refs.pics, options);
    const sumber = this.sanitizePlainText(data.sumber, 80);
    const prioritas = this.sanitizePlainText(data.prioritas, 30);
    const status = this.sanitizePlainText(data.status, 40);
    const jadwal = data.jadwalFollowup ? parseDateInput(data.jadwalFollowup) : null;
    const catatan = this.sanitizeMultiline(data.catatan, 500);

    if (!nama) throw new Error('Nama lengkap wajib diisi.');
    if (!asalSekolah) throw new Error('Asal sekolah wajib diisi.');
    if (!noWa || noWa.length < 10 || noWa.length > 16) throw new Error('No WhatsApp tidak valid.');
    if (!jurusan || refs.jurusans.indexOf(jurusan) === -1) throw new Error('Jurusan tidak valid.');
    if (!pic) throw new Error('PIC tidak valid.');
    if (sumber && refs.sumbers.indexOf(sumber) === -1) throw new Error('Sumber info tidak valid.');
    if (prioritas && refs.prioritas.indexOf(prioritas) === -1) throw new Error('Prioritas tidak valid.');
    if (status && refs.statuses.indexOf(status) === -1) throw new Error('Status tidak valid.');
    if (data.jadwalFollowup && !jadwal) throw new Error('Jadwal followup tidak valid.');

    return {
      id: this.sanitizePlainText(data.id, 40),
      nama: nama,
      noWa: noWa,
      asalSekolah: asalSekolah,
      jurusan: jurusan,
      sumber: sumber,
      pic: pic,
      prioritas: prioritas || 'Sedang',
      status: status || 'Baru',
      jadwalFollowup: jadwal,
      catatan: catatan
    };
  },

  validateReschedulePayload: function(data) {
    data = data || {};
    const id = this.sanitizePlainText(data.idCalon || data.id, 40);
    const jadwal = parseDateInput(data.jadwalFollowup || data.jadwal || data.newDate);
    if (!id) throw new Error('ID calon wajib diisi.');
    if (!jadwal) throw new Error('Tanggal followup baru tidak valid.');
    return {
      idCalon: id,
      jadwalFollowup: jadwal,
      note: this.sanitizePlainText(data.note, 200)
    };
  },

  validateFollowUpPayload: function(data, options) {
    data = data || {};
    options = options || {};
    const refs = getReferenceColumns();
    const jadwal = data.jadwalBerikutnya ? parseDateInput(data.jadwalBerikutnya) : null;
    const payload = {
      idCalon: this.sanitizePlainText(data.idCalon, 40),
      namaCalon: this.sanitizePlainText(data.namaCalon, 120),
      pic: this.resolvePicValue(data.pic, refs.pics, options),
      arah: this.sanitizePlainText(data.arah, 30),
      isiPercakapan: this.sanitizeMultiline(data.isiPercakapan, 4000),
      hasil: this.sanitizeMultiline(data.hasil, 1000),
      nextAction: this.sanitizePlainText(data.nextAction, 200),
      statusBaru: this.sanitizePlainText(data.statusBaru, 40),
      jadwalBerikutnya: jadwal
    };

    if (!payload.idCalon) throw new Error('ID calon wajib diisi.');
    if (!payload.namaCalon) throw new Error('Nama calon wajib diisi.');
  if (!payload.pic) throw new Error('PIC tidak valid.');
    if (!payload.arah || refs.arahs.indexOf(payload.arah) === -1) throw new Error('Arah percakapan tidak valid.');
    if (!payload.isiPercakapan) throw new Error('Isi percakapan wajib diisi.');
    if (payload.statusBaru && refs.statuses.indexOf(payload.statusBaru) === -1) throw new Error('Status baru tidak valid.');
    if (data.jadwalBerikutnya && !jadwal) throw new Error('Jadwal berikutnya tidak valid.');
    return payload;
  }
};
