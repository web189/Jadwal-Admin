/* Petugas Sakit — dikelola KA Gudang, tampil di "PETUGAS HARI INI". Data: Firebase  sakit/YYYY-MM-DD */
(function () {
  'use strict';
  var doc = document, sick = [], key = '';
  function $(id) { return doc.getElementById(id); }
  function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dkey() { var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  function toast(m, t) { try { window.showToast(m, t || 'info'); } catch (e) {} }
  function staff() {
    var out = [], tbl = $('scheduleTable'); if (!tbl) return out;
    var s = tbl.querySelectorAll('.staff-cell span');
    for (var i = 0; i < s.length; i++) out.push(s[i].textContent.trim());
    return out;
  }
  function ready() { return window.firebaseReady && window.db; }
  function load() {
    if (!ready()) return;
    key = dkey();
    window.firebaseGet(window.firebaseRef(window.db, 'sakit/' + key)).then(function (s) {
      var v = s.val(); sick = Array.isArray(v) ? v.filter(Boolean) : (v ? Object.keys(v).map(function (k) { return v[k]; }) : []);
      paint();
    }).catch(function () {});
  }
  function paint() {
    var el = $('todayCrew'); if (!el) return;
    var body = el.querySelector('.crew-body'); if (!body) return;
    var old = el.querySelector('.crew-sick'); if (old) old.remove();
    var lis = el.querySelectorAll('.crew-card li');
    for (var i = 0; i < lis.length; i++) lis[i].classList.toggle('is-sick', sick.indexOf(lis[i].textContent.trim()) > -1);
    if (!sick.length) return;
    var d = doc.createElement('div'); d.className = 'crew-sick';
    d.innerHTML = '<b><i class="fas fa-notes-medical"></i> Sakit:</b> ' + sick.map(esc).join(', ');
    body.appendChild(d);
  }
  /* Tombol di menu KA Gudang (hanya tampil saat login) */
  var btn = doc.createElement('button');
  btn.id = 'sakitBtn'; btn.className = 'hmenu-btn hidden';
  btn.innerHTML = '<i class="fas fa-briefcase-medical"></i> Petugas Sakit';
  var modal = doc.createElement('div'); modal.id = 'sakitModal'; modal.className = 'sakit-modal'; modal.hidden = true;
  modal.innerHTML = '<div class="sakit-box"><div class="sakit-title"><i class="fas fa-briefcase-medical"></i> Petugas Sakit Hari Ini</div>' +
    '<div class="sakit-sub">Centang admin yang sakit. Akan tampil di "Petugas Hari Ini".</div><div id="sakitList" class="sakit-list"></div>' +
    '<div class="sakit-act"><button type="button" id="sakitCancel" class="hmenu-btn btn-outline">Batal</button><button type="button" id="sakitSave" class="hmenu-btn btn-success">Simpan</button></div></div>';
  function open() {
    var names = staff(), h = '';
    names.forEach(function (n, i) { h += '<label class="sakit-row"><input type="checkbox" value="' + esc(n) + '"' + (sick.indexOf(n) > -1 ? ' checked' : '') + '><span>' + esc(n) + '</span></label>'; });
    $('sakitList').innerHTML = h || '<div class="sakit-sub">Data staf belum dimuat.</div>';
    modal.hidden = false;
    var m = $('hmenu') || doc.querySelector('.hmenu'); try { doc.body.classList.remove('menu-open'); } catch (e) {}
  }
  function save() {
    if (!ready()) { toast('Koneksi database belum siap', 'error'); return; }
    var c = modal.querySelectorAll('input:checked'), v = [], i;
    for (i = 0; i < c.length; i++) v.push(c[i].value);
    window.firebaseSet(window.firebaseRef(window.db, 'sakit/' + dkey()), v.length ? v : null).then(function () {
      sick = v; paint(); modal.hidden = true; toast(v.length ? 'Petugas sakit disimpan' : 'Daftar sakit dikosongkan', 'success');
    }).catch(function () { toast('Gagal menyimpan (cek aturan database)', 'error'); });
  }
  function init() {
    var anchor = $('rotationOrderBtn'); if (!anchor || btn.parentNode) return;
    anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    doc.body.appendChild(modal);
    btn.addEventListener('click', open);
    $('sakitCancel').addEventListener('click', function () { modal.hidden = true; });
    $('sakitSave').addEventListener('click', save);
    var lo = $('logoutBtn');
    function sync() { btn.classList.toggle('hidden', lo.classList.contains('hidden')); }
    if (lo) { sync(); new MutationObserver(sync).observe(lo, { attributes: true, attributeFilter: ['class'] }); }
    var tc = $('todayCrew');
    new MutationObserver(function () { var e = $('todayCrew'); if (e && !e.querySelector('.crew-sick') && sick.length || (e && e.querySelector('.crew-card li.is-sick') === null && sick.length)) paint(); })
      .observe(doc.body, { childList: true, subtree: true });
    var t = 0, iv = setInterval(function () { if (ready() || ++t > 40) { clearInterval(iv); load(); } }, 500);
    setInterval(load, 60000);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
