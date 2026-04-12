// ============================================================
// CRM SPMB - Import Service
// Milestone 4
// ============================================================

const ImportService = {
  importCalonCsv: function(csvText, options) {
    const user = AuthService.assertCanImport();
    options = options || {};
    const text = String(csvText || '');
    if (!text.trim()) throw new Error('Konten CSV kosong.');
    if (text.length > CONFIG.import.maxChars) throw new Error('Ukuran CSV terlalu besar. Maksimal ' + CONFIG.import.maxChars + ' karakter.');

    const rows = this.parseCsvText_(text);
    if (rows.length < 2) throw new Error('CSV minimal harus berisi header dan 1 baris data.');
    if (rows.length - 1 > CONFIG.import.maxRows) throw new Error('Jumlah baris melebihi batas import (' + CONFIG.import.maxRows + ').');

    const mapped = this.mapRows_(rows);
    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.DATA_CALON);
    const now = new Date();
    const toAppend = [];
    const report = { imported: 0, skipped: 0, errors: [], importedIds: [] };
    const skipDuplicates = options.skipDuplicates !== false;

    mapped.forEach(function(item) {
      const line = item.line;
      try {
        const payload = Validation.validateCalonPayload(item.data);
        const existing = CalonService.findExistingByNameWa_(payload.nama, payload.noWa);
        if (existing && skipDuplicates) {
          report.skipped++;
          report.errors.push({ line: line, type: 'SKIPPED', message: 'Duplikat aktif ditemukan untuk nama + no WA.' });
          return;
        }
        const id = IdService.nextCalonId();
        toAppend.push([
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
        report.imported++;
        report.importedIds.push(id);
      } catch (err) {
        report.errors.push({ line: line, type: 'ERROR', message: err.message });
      }
    });

    if (toAppend.length) {
      sh.getRange(sh.getLastRow() + 1, 1, toAppend.length, COL.DATA_CALON.COUNT).setValues(toAppend);
      AuditService.log('IMPORT_CALON_CSV', 'CALON', 'BATCH', 'Import CSV calon', {
        imported: report.imported,
        skipped: report.skipped,
        totalInput: mapped.length,
        importedIds: report.importedIds
      }, user);
    }

    return report;
  },

  parseCsvText_: function(csvText) {
    const normalized = String(csvText || '').replace(/^\ufeff/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return Utilities.parseCsv(normalized).filter(function(row) {
      return (row || []).some(function(cell) { return String(cell || '').trim() !== ''; });
    });
  },

  mapRows_: function(rows) {
    const header = rows[0].map(function(h) {
      return String(h || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    });
    const aliases = {
      nama: ['nama', 'nama_lengkap'],
      noWa: ['no_wa', 'no_whatsapp', 'wa', 'whatsapp', 'nomor_wa'],
      asalSekolah: ['asal_sekolah', 'sekolah', 'asal'],
      jurusan: ['jurusan', 'jurusan_minat'],
      sumber: ['sumber', 'sumber_info'],
      status: ['status'],
      pic: ['pic'],
      prioritas: ['prioritas'],
      jadwalFollowup: ['jadwal_followup', 'jadwal_fu', 'followup'],
      catatan: ['catatan', 'note', 'notes']
    };

    function pick(row, keys) {
      for (var i = 0; i < keys.length; i++) {
        var idx = header.indexOf(keys[i]);
        if (idx !== -1) return row[idx];
      }
      return '';
    }

    return rows.slice(1).map(function(row, idx) {
      return {
        line: idx + 2,
        data: {
          nama: pick(row, aliases.nama),
          noWa: pick(row, aliases.noWa),
          asalSekolah: pick(row, aliases.asalSekolah),
          jurusan: pick(row, aliases.jurusan),
          sumber: pick(row, aliases.sumber),
          status: pick(row, aliases.status),
          pic: pick(row, aliases.pic),
          prioritas: pick(row, aliases.prioritas),
          jadwalFollowup: pick(row, aliases.jadwalFollowup),
          catatan: pick(row, aliases.catatan)
        }
      };
    });
  }
};
