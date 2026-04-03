Bisa. Dari file yang kamu kirim, memang saat ini **mobile** masih mengisi `fu_pic` dengan semua `cfg.pics` lalu hanya memilih default yang mirip nama user, jadi PIC lain tetap muncul. Itu terlihat di `populateDropdowns(cfg)` pada `App.js.html` . Hal yang sama juga terjadi di **desktop**: `desktopPopulateDropdowns(cfg)` mengisi `desktop_fu_pic` dengan semua `cfg.pics` tanpa pembatasan role PIC .

Di bawah ini patch finalnya.

---

# 1) PATCH `App.js.html` (mobile)

## A. Tambahkan helper ini

Taruh **setelah** `fillSelect(...)` atau di dekat helper dropdown pada file mobile kamu 

```javascript
function getScopedPicOptions(cfg) {
  var allPics = (cfg && cfg.pics) || [];
  var user = (cfg && cfg.user) || {};
  var role = String(user.role || '').toUpperCase();
  var userName = String(user.name || '').trim();

  if (role === 'PIC') {
    var exact = allPics.find(function(p) {
      return String(p || '').trim().toLowerCase() === userName.toLowerCase();
    });

    if (exact) return [exact];
    return userName ? [userName] : [];
  }

  return allPics;
}

function lockPicFieldIfNeeded(fieldId, cfg, preferredValue) {
  var el = document.getElementById(fieldId);
  if (!el) return;

  var user = (cfg && cfg.user) || {};
  var role = String(user.role || '').toUpperCase();
  var scopedPics = getScopedPicOptions(cfg);

  if (role === 'PIC') {
    fillSelect(fieldId, scopedPics);
    el.value = scopedPics[0] || preferredValue || '';
    el.disabled = true;
    el.classList.add('bg-slate-100');
  } else {
    el.disabled = false;
    el.classList.remove('bg-slate-100');
    fillSelect(fieldId, (cfg && cfg.pics) || []);
    if (preferredValue) el.value = preferredValue;
  }
}
```

---

## B. Ganti penuh fungsi `populateDropdowns(cfg)`

Fungsi sekarang masih ini polanya:

* `fillSelect('f_pic', cfg.pics);`
* `fillSelect('fu_pic', cfg.pics);`
* lalu hanya memilih default yang mirip nama user 

Ganti dengan ini:

```javascript
function populateDropdowns(cfg) {
  fillSelect('f_jurusan', cfg.jurusans);
  fillSelect('f_sumber', cfg.sumbers);
  fillSelect('f_prioritas', cfg.prioritas);
  fillSelect('f_status', cfg.statuses);

  fillSelect('fu_arah', cfg.arahs);
  fillSelect('fu_status', cfg.statuses, true);

  fillSelect('filterStatus', cfg.statuses, true);
  fillSelect('filterJurusan', cfg.jurusans, true);
  fillSelect('filterPic', cfg.pics, true);

  var userRole = String((cfg.user && cfg.user.role) || '').toUpperCase();
  var userName = String((cfg.user && cfg.user.name) || '').trim();
  var scopedPics = getScopedPicOptions(cfg);

  if (userRole === 'PIC') {
    fillSelect('f_pic', scopedPics);
    document.getElementById('f_pic').value = scopedPics[0] || '';
    document.getElementById('f_pic').disabled = true;
    document.getElementById('f_pic').classList.add('bg-slate-100');

    fillSelect('fu_pic', scopedPics);
    document.getElementById('fu_pic').value = scopedPics[0] || '';
    document.getElementById('fu_pic').disabled = true;
    document.getElementById('fu_pic').classList.add('bg-slate-100');
  } else {
    fillSelect('f_pic', cfg.pics);
    fillSelect('fu_pic', cfg.pics);

    document.getElementById('f_pic').disabled = false;
    document.getElementById('fu_pic').disabled = false;
    document.getElementById('f_pic').classList.remove('bg-slate-100');
    document.getElementById('fu_pic').classList.remove('bg-slate-100');

    var picMatch = (cfg.pics || []).find(function(p) {
      return String(p || '').toLowerCase().includes(userName.toLowerCase());
    });

    if (picMatch) {
      document.getElementById('f_pic').value = picMatch;
      document.getElementById('fu_pic').value = picMatch;
    }
  }
}
```

---

## C. Ganti fungsi `openLogFU(calon)`

Supaya saat PIC membuka form log follow-up, field PIC tetap terkunci ke dirinya sendiri.

Ganti fungsi ini:

```javascript
function openLogFU(calon) {
  if (!(CFG.permissions && CFG.permissions.canWrite)) { showToast('⚠️ Akun Anda read only.'); return; }
  selectedCalon = calon;
  document.getElementById('fuCalonInfo').innerHTML =
    '<div class="font-semibold text-slate-900">' + calon.nama + '</div>' +
    '<div class="mt-1 text-xs text-slate-500">' + calon.noWa + ' · ' + calon.jurusan + '</div>' +
    '<div class="mt-2 flex flex-wrap gap-2">' + badge(calon.status, getStatusClass(calon.status)) + badge('PIC: ' + calon.pic, 'bg-white text-slate-700') + '</div>';
  if (calon.pic) document.getElementById('fu_pic').value = calon.pic;
  ['fu_isi','fu_hasil','fu_nextAction','fu_jadwal'].forEach(function(id) { document.getElementById(id).value = ''; });
  document.getElementById('fu_status').value = '';
  openModal('modalLogFU');
}
```

menjadi:

```javascript
function openLogFU(calon) {
  if (!(CFG.permissions && CFG.permissions.canWrite)) {
    showToast('⚠️ Akun Anda read only.');
    return;
  }

  selectedCalon = calon;

  document.getElementById('fuCalonInfo').innerHTML =
    '<div class="font-semibold text-slate-900">' + calon.nama + '</div>' +
    '<div class="mt-1 text-xs text-slate-500">' + calon.noWa + ' · ' + calon.jurusan + '</div>' +
    '<div class="mt-2 flex flex-wrap gap-2">' +
      badge(calon.status, getStatusClass(calon.status)) +
      badge('PIC Data: ' + (calon.pic || '-'), 'bg-white text-slate-700') +
    '</div>';

  ['fu_isi','fu_hasil','fu_nextAction','fu_jadwal'].forEach(function(id) {
    document.getElementById(id).value = '';
  });
  document.getElementById('fu_status').value = '';

  var preferredPic = calon.pic || '';
  lockPicFieldIfNeeded('fu_pic', CFG, preferredPic);

  openModal('modalLogFU');
}
```

---

# 2) PATCH `AppDesktop.js.html` (desktop)

## A. Tambahkan helper ini

Taruh setelah `desktopFillSelect(...)` atau dekat helper dropdown desktop 

```javascript
function desktopGetScopedPicOptions(cfg) {
  var allPics = (cfg && cfg.pics) || [];
  var user = (cfg && cfg.user) || {};
  var role = String(user.role || '').toUpperCase();
  var userName = String(user.name || '').trim();

  if (role === 'PIC') {
    var exact = allPics.find(function(p) {
      return String(p || '').trim().toLowerCase() === userName.toLowerCase();
    });

    if (exact) return [exact];
    return userName ? [userName] : [];
  }

  return allPics;
}

function desktopLockPicFieldIfNeeded(fieldId, cfg, preferredValue) {
  var el = document.getElementById(fieldId);
  if (!el) return;

  var user = (cfg && cfg.user) || {};
  var role = String(user.role || '').toUpperCase();
  var scopedPics = desktopGetScopedPicOptions(cfg);

  if (role === 'PIC') {
    desktopFillSelect(fieldId, scopedPics);
    el.value = scopedPics[0] || preferredValue || '';
    el.disabled = true;
    el.classList.add('bg-slate-100');
  } else {
    el.disabled = false;
    el.classList.remove('bg-slate-100');
    desktopFillSelect(fieldId, (cfg && cfg.pics) || []);
    if (preferredValue) el.value = preferredValue;
  }
}
```

---

## B. Ganti penuh fungsi `desktopPopulateDropdowns(cfg)`

Versi sekarang masih mengisi:

* `desktop_f_pic` dengan semua PIC
* `desktop_fu_pic` dengan semua PIC 

Ganti dengan ini:

```javascript
function desktopPopulateDropdowns(cfg) {
  desktopFillSelect('desktopFilterStatus', cfg.statuses);
  desktopFillSelect('desktopFilterJurusan', cfg.jurusans);
  desktopFillSelect('desktopFilterPic', cfg.pics);

  desktopFillSelect('desktop_f_jurusan', cfg.jurusans);
  desktopFillSelect('desktop_f_sumber', cfg.sumbers);
  desktopFillSelect('desktop_f_prioritas', cfg.prioritas);
  desktopFillSelect('desktop_f_status', cfg.statuses);

  desktopFillSelect('desktop_fu_arah', cfg.arahs);
  desktopFillSelect('desktop_fu_status', cfg.statuses);

  var userRole = String((cfg.user && cfg.user.role) || '').toUpperCase();
  var userName = String((cfg.user && cfg.user.name) || '').trim();
  var scopedPics = desktopGetScopedPicOptions(cfg);

  if (userRole === 'PIC') {
    desktopFillSelect('desktop_f_pic', scopedPics);
    document.getElementById('desktop_f_pic').value = scopedPics[0] || '';
    document.getElementById('desktop_f_pic').disabled = true;
    document.getElementById('desktop_f_pic').classList.add('bg-slate-100');

    desktopFillSelect('desktop_fu_pic', scopedPics);
    document.getElementById('desktop_fu_pic').value = scopedPics[0] || '';
    document.getElementById('desktop_fu_pic').disabled = true;
    document.getElementById('desktop_fu_pic').classList.add('bg-slate-100');
  } else {
    desktopFillSelect('desktop_f_pic', cfg.pics);
    desktopFillSelect('desktop_fu_pic', cfg.pics);

    document.getElementById('desktop_f_pic').disabled = false;
    document.getElementById('desktop_fu_pic').disabled = false;
    document.getElementById('desktop_f_pic').classList.remove('bg-slate-100');
    document.getElementById('desktop_fu_pic').classList.remove('bg-slate-100');

    var picMatch = (cfg.pics || []).find(function(p) {
      return String(p || '').toLowerCase().includes(userName.toLowerCase());
    });

    if (picMatch) {
      document.getElementById('desktop_f_pic').value = picMatch;
      document.getElementById('desktop_fu_pic').value = picMatch;
    }
  }
}
```

---

## C. Patch `desktopOpenCreateCalon()`

Supaya kalau login sebagai PIC, field PIC di form tambah calon otomatis terkunci ke dirinya.

Ganti fungsi `desktopOpenCreateCalon()` menjadi:

```javascript
function desktopOpenCreateCalon() {
  DESKTOP_FORM_MODE = 'create';
  DESKTOP_SELECTED_CALON = null;

  document.getElementById('desktopEditTitle').textContent = 'Tambah Calon Baru';
  document.getElementById('desktopEditSubmitBtn').textContent = 'Simpan';

  ['desktop_f_id','desktop_f_nama','desktop_f_noWa','desktop_f_asalSekolah','desktop_f_catatan','desktop_f_jadwal'].forEach(function(id) {
    document.getElementById(id).value = '';
  });

  ['desktop_f_jurusan','desktop_f_sumber','desktop_f_prioritas'].forEach(function(id) {
    document.getElementById(id).value = '';
  });

  document.getElementById('desktop_f_status').value = 'Baru';

  desktopLockPicFieldIfNeeded('desktop_f_pic', DESKTOP_CFG, '');

  document.getElementById('desktopEditModal').classList.remove('hidden');
  document.getElementById('desktopEditModal').classList.add('flex');
}
```

---

## D. Patch `desktopOpenEditCalon(calon)`

Supaya field PIC tetap aman untuk role PIC.

Ganti fungsi itu menjadi:

```javascript
function desktopOpenEditCalon(calon) {
  if (!(calon.actions && calon.actions.canEdit)) {
    desktopShowToast('⚠️ Anda tidak memiliki izin edit.');
    return;
  }

  DESKTOP_FORM_MODE = 'edit';
  DESKTOP_SELECTED_CALON = calon;

  document.getElementById('desktopEditTitle').textContent = 'Edit Data Calon';
  document.getElementById('desktopEditSubmitBtn').textContent = 'Simpan Perubahan';

  document.getElementById('desktop_f_id').value = calon.id || '';
  document.getElementById('desktop_f_nama').value = calon.nama || '';
  document.getElementById('desktop_f_noWa').value = calon.noWa || '';
  document.getElementById('desktop_f_asalSekolah').value = calon.asalSekolah || '';
  document.getElementById('desktop_f_jurusan').value = calon.jurusan || '';
  document.getElementById('desktop_f_sumber').value = calon.sumber || '';
  document.getElementById('desktop_f_status').value = calon.status || 'Baru';
  document.getElementById('desktop_f_prioritas').value = calon.prioritas || '';
  document.getElementById('desktop_f_jadwal').value = desktopToInputDate(calon.jadwalFollowup);
  document.getElementById('desktop_f_catatan').value = calon.catatan || '';

  desktopLockPicFieldIfNeeded('desktop_f_pic', DESKTOP_CFG, calon.pic || '');

  document.getElementById('desktopEditModal').classList.remove('hidden');
  document.getElementById('desktopEditModal').classList.add('flex');
}
```

---

## E. Patch `desktopSwitchToFollowupCalon(calon)` dan `desktopSelectFuCalon(calon)`

Keduanya sekarang masih set `desktop_fu_pic` langsung ke PIC calon tanpa pembatasan role 

Ganti dua fungsi itu menjadi:

```javascript
function desktopSwitchToFollowupCalon(calon) {
  DESKTOP_SELECTED_CALON = calon;
  desktopSwitchPage('followup');
  document.getElementById('desktopSearchFU').value = calon.nama;
  desktopSearchForFU();
  desktopSelectFuCalon(calon);
  document.getElementById('desktop_fu_namaCalon').value = calon.nama + ' · ' + calon.noWa;
  desktopLockPicFieldIfNeeded('desktop_fu_pic', DESKTOP_CFG, calon.pic || '');
}

function desktopSelectFuCalon(calon) {
  DESKTOP_SELECTED_CALON = calon;
  document.getElementById('desktop_fu_namaCalon').value = calon.nama + ' · ' + calon.noWa;
  desktopLockPicFieldIfNeeded('desktop_fu_pic', DESKTOP_CFG, calon.pic || '');

  var card = document.getElementById('desktopFuDetailCard');
  card.innerHTML = '<div class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Memuat riwayat...</div>';

  google.script.run
    .withSuccessHandler(function(res) {
      try {
        var logs = desktopUnwrapResponse(res);
        var logHtml = logs.length === 0
          ? '<div class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada log.</div>'
          : logs.map(function(l) {
              return '<div class="rounded-2xl p-4 ' + (l.arah === 'Outbound' ? 'bg-blue-50' : 'bg-emerald-50') + '">' +
                '<div class="mb-2 flex flex-wrap items-center gap-2">' +
                  desktopBadge(l.arah, desktopDirectionClass(l.arah)) +
                  '<span class="text-[11px] text-slate-500">' + l.tanggal + '</span>' +
                  '<span class="text-[11px] text-slate-500">' + l.pic + '</span>' +
                '</div>' +
                '<div class="rounded-2xl bg-white p-4 text-sm whitespace-pre-wrap text-slate-700">' + l.isiPercakapan + '</div>' +
              '</div>';
            }).join('');

        card.innerHTML =
          '<div class="mb-4 flex items-center justify-between">' +
            '<div><div class="text-lg font-bold text-slate-900">' + calon.nama + '</div><div class="mt-1 text-sm text-slate-500">' + calon.noWa + ' · ' + calon.jurusan + '</div></div>' +
            '<a href="https://wa.me/62' + String(calon.noWa || '').replace(/^0/, '') + '" target="_blank" class="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">Buka WA</a>' +
          '</div>' +
          '<div class="space-y-4">' + logHtml + '</div>';
      } catch (e) {
        if (e.message !== 'SESSION_EXPIRED') desktopShowToast('❌ ' + e.message);
      }
    })
    .withFailureHandler(function(err) {
      desktopShowToast('❌ ' + err.message);
    })
    .getFollowUpByCalon(calon.id, desktopTok());
}
```

---

# 3) PATCH backend: validasi PIC tidak boleh mengirim log atas nama PIC lain

Kamu belum upload file backend service, jadi saya kasih patch final yang bisa kamu taruh di `FollowUpService.gs` atau helper auth/service yang dipakai `addFollowUp(...)`.

## Tambahkan helper ini

```javascript
function normalizePicName_(value) {
  return String(value || '').trim().toLowerCase();
}

function assertFollowupPicAllowed_(user, requestedPic) {
  if (!user) throw new Error('User tidak valid.');

  var role = String(user.role || '').trim().toUpperCase();
  var userName = String(user.name || '').trim();
  var pic = String(requestedPic || '').trim();

  if (!pic) {
    throw new Error('PIC wajib diisi.');
  }

  if (role === 'ADMIN') {
    return pic;
  }

  if (role === 'PIC') {
    if (normalizePicName_(pic) !== normalizePicName_(userName)) {
      throw new Error('PIC hanya boleh mengirim log follow-up atas nama PIC sendiri.');
    }
    return userName;
  }

  throw new Error('Anda tidak memiliki izin menambah log follow-up.');
}
```

## Lalu di fungsi backend `addFollowUp(data)` atau yang setara

Cari bagian yang sekarang langsung memakai `data.pic`, lalu ganti polanya menjadi:

```javascript
function addFollowUp(data) {
  var user = AuthService.assertCanWrite();

  var idCalon = String(data.idCalon || '').trim();
  var pic = assertFollowupPicAllowed_(user, data.pic);

  if (!idCalon) throw new Error('ID calon wajib diisi.');
  if (!String(data.isiPercakapan || '').trim()) throw new Error('Isi percakapan wajib diisi.');

  // lanjutkan proses simpan dengan PIC yang SUDAH divalidasi
  // contoh:
  // var row = [
  //   generateLogId_(),
  //   idCalon,
  //   data.namaCalon || '',
  //   new Date(),
  //   pic,
  //   data.arah || '',
  //   data.isiPercakapan || '',
  //   data.hasil || '',
  //   data.nextAction || '',
  //   data.jadwalBerikutnya || ''
  // ];

  // gunakan variable `pic`, jangan lagi `data.pic` mentah
}
```

## Kalau kamu punya validasi edit/tambah calon juga

Kamu bisa pakai prinsip yang sama:

* `ADMIN` boleh pilih semua PIC
* `PIC` hanya boleh simpan calon dengan PIC dirinya sendiri

---

# Ringkasnya

Yang berubah setelah patch ini:

### Mobile

* dropdown `fu_pic` dan `f_pic` dibatasi kalau role `PIC`
* PIC lain tidak muncul lagi di form follow-up dan form calon

### Desktop

* dropdown `desktop_fu_pic` dan `desktop_f_pic` dibatasi kalau role `PIC`
* tetap semua PIC untuk `ADMIN`

### Backend

* walaupun user manipulasi request manual, kalau role `PIC` dan mengirim `pic` milik tim lain, request tetap ditolak

---

Kalau kamu mau, kirim file backend `FollowUpService.gs` atau `CalonService.gs`, nanti saya buatkan patch final yang benar-benar menempel ke struktur kodenya.
