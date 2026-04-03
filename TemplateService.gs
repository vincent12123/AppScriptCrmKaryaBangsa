// ============================================================
// CRM SPMB - Template Service
// Milestone 3
// ============================================================

const TemplateService = {
  list: function() {
    AuthService.assertCanRead();
    const sh = getSpreadsheet().getSheetByName(CONFIG.sheets.TEMPLATE_WA);
    const rows = sh.getDataRange().getValues().slice(1).filter(function(r) { return r[0]; });
    return rows.map(function(r) {
      return {
        nama: String(r[0] || ''),
        situasi: String(r[1] || ''),
        isi: String(r[2] || '')
      };
    });
  },

  render: function(templateName, calonId, extras) {
    AuthService.assertCanRead();
    extras = extras || {};
    const template = this.list().filter(function(t) { return t.nama === templateName; })[0];
    if (!template) throw new Error('Template tidak ditemukan: ' + templateName);
    const calon = calonId ? CalonService.findById(calonId) : null;
    const values = {
      Nama: calon ? calon.nama : '',
      PIC: calon ? calon.pic : '',
      Jurusan: calon ? calon.jurusan : '',
      AsalSekolah: calon ? calon.asalSekolah : '',
      TanggalFollowup: calon ? calon.jadwalFollowup : '',
      Deadline: String(extras.deadline || ''),
      Status: calon ? calon.status : '',
      Prioritas: calon ? calon.prioritas : '',
      Sumber: calon ? calon.sumber : '',
      TanggalMasuk: calon ? calon.tanggalMasuk : '',
      X: String(extras.x || extras.deadline || '')
    };
    var rendered = template.isi;
    Object.keys(values).forEach(function(key) {
      var token = '[' + key + ']';
      rendered = rendered.split(token).join(values[key] || token);
    });
    return {
      templateName: template.nama,
      calonId: calon ? calon.id : '',
      renderedText: rendered,
      waUrl: calon ? 'https://wa.me/62' + String(calon.noWa || '').replace(/^0/, '') + '?text=' + encodeURIComponent(rendered) : ''
    };
  }
};
