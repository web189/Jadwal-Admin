/* PRO 2026 — penyempurna tampilan, ringan & aman untuk Chrome 109 / Windows 7.
   Tidak mengubah data, rotasi, atau warna tabel. Semua fitur gagal-aman:
   bila ada elemen yang tidak ditemukan, bagian itu dilewati. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var LITE = !!window.__LITE;
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ANIMATE = !LITE && !REDUCE;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  function $(id) { return doc.getElementById(id); }

  /* ---------- 1. Garis progres scroll di tepi atas ---------- */
  var bar = doc.createElement('div');
  bar.id = 'proScroll'; bar.setAttribute('aria-hidden', 'true');
  doc.body.appendChild(bar);
  var ticking = false;
  function paintScroll() {
    ticking = false;
    var h = root.scrollHeight - root.clientHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, (window.pageYOffset || root.scrollTop) / h)) : 0;
    bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(paintScroll); }
  }, { passive: true });
  window.addEventListener('resize', paintScroll);

  /* ---------- 2. Kartu statistik: hitung naik + bar proporsi ---------- */
  var STAT_IDS = ['statP', 'statS', 'statM', 'statOFF'];
  var statVals = {};
  function setBars() {
    var sum = 0, i;
    for (i = 0; i < STAT_IDS.length; i++) sum += statVals[STAT_IDS[i]] || 0;
    for (i = 0; i < STAT_IDS.length; i++) {
      var el = $(STAT_IDS[i]); if (!el) continue;
      var b = el.parentNode.querySelector('.stat-bar b');
      var pct = sum ? Math.round((statVals[STAT_IDS[i]] || 0) / sum * 100) : 0;
      if (b) b.style.width = pct + '%';
      el.parentNode.setAttribute('title', pct + '% dari total shift minggu ini');
    }
  }
  /* el.__last = teks terakhir yang DITULIS skrip ini (supaya tidak dianggap perubahan baru)
     el.__tok  = token animasi; nilai baru dari app.js membatalkan animasi yang sedang jalan */
  function write(el, v) { el.__last = String(v); el.textContent = v; }
  function countUp(el, to) {
    var tok = (el.__tok = (el.__tok || 0) + 1);
    if (!ANIMATE || to <= 0) { write(el, to); return; }
    var t0 = Date.now(), D = 650;
    (function step() {
      if (el.__tok !== tok) return;
      var t = Math.min(1, (Date.now() - t0) / D);
      write(el, Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) window.requestAnimationFrame(step);
    })();
  }
  STAT_IDS.forEach(function (id) {
    var el = $(id); if (!el) return;
    var card = el.parentNode;
    if (!card.querySelector('.stat-bar')) {
      var bw = doc.createElement('i'); bw.className = 'stat-bar'; bw.innerHTML = '<b></b>';
      card.appendChild(bw);
    }
    new MutationObserver(function () {
      if (el.textContent === el.__last) return;          /* tulisan kita sendiri */
      var v = parseInt(el.textContent, 10);
      if (isNaN(v)) return;
      if (v === statVals[id]) { write(el, v); return; }  /* nilai sama: tidak perlu animasi ulang */
      statVals[id] = v; setBars();
      countUp(el, v);
    }).observe(el, { childList: true, characterData: true, subtree: true });
  });

  /* ---------- 3. Rentang tanggal minggu + geser otomatis ke HARI INI ---------- */
  /* ---------- 3b. Ringkasan "Petugas Hari Ini" (dibaca dari tabel yang tampil) ---------- */
  var crewEl = null;
  var SH = [
    { k: 'P', n: 'Pagi', t: '07:30', id: 1 },
    { k: 'S', n: 'Sore', t: '15:30', id: 2 },
    { k: 'M', n: 'Malam', t: '23:30', id: 3 }
  ];
  function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function activeShiftId() {
    try { if (typeof window.getCurrentShift === 'function') return window.getCurrentShift(); } catch (e) {}
    var d = new Date(), m = d.getHours() * 60 + d.getMinutes();
    return (m > 450 && m <= 930) ? 1 : (m > 930 && m <= 1410) ? 2 : 3;
  }
  function paintActive() {
    if (!crewEl) return;
    var a = activeShiftId(), i, c = crewEl.querySelectorAll('.crew-card');
    for (i = 0; i < c.length; i++) c[i].classList.toggle('active', +c[i].getAttribute('data-sid') === a);
  }
  function buildCrew() {
    var tbl = $('scheduleTable'); if (!tbl) return;
    var th = tbl.querySelector('th.today-col'); if (!th) return;      /* minggu lain: biarkan yang terakhir */
    var idx = th.cellIndex, rows = tbl.querySelectorAll('tr'), g = { P: [], S: [], M: [], OFF: [], C: [] }, r;
    for (r = 0; r < rows.length; r++) {
      var cell = rows[r].cells[idx], nm = rows[r].querySelector('.staff-cell span');
      if (!cell || !nm || !cell.getAttribute('data-shift')) continue;
      var sh = cell.getAttribute('data-shift');
      if (g[sh]) g[sh].push(nm.textContent);
    }
    var scope = $('scheduleSection'); if (!scope) return;
    if (!crewEl) {
      crewEl = doc.createElement('section');
      crewEl.id = 'todayCrew'; crewEl.className = 'today-crew';
      crewEl.setAttribute('aria-label', 'Petugas hari ini');
      scope.insertBefore(crewEl, scope.firstChild);
    }
    var day = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
    var h = '<div class="crew-head"><span class="crew-title">PETUGAS HARI INI</span><span class="crew-date">' + esc(day) + '</span></div><div class="crew-grid">';
    SH.forEach(function (x) {
      var list = g[x.k];
      h += '<div class="crew-card crew-' + x.k + '" data-sid="' + x.id + '"><div class="crew-top"><i class="crew-dot"></i><b>' + x.n +
        '</b><em>' + x.t + '</em><span class="crew-live">AKTIF</span></div><ul>' +
        (list.length ? list.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') : '<li class="crew-none">—</li>') + '</ul></div>';
    });
    h += '</div>';
    var off = g.OFF.concat(g.C);
    if (off.length) h += '<div class="crew-off"><b>Libur / Cuti:</b> ' + off.map(esc).join(', ') + '</div>';
    crewEl.innerHTML = h;
    paintActive();
  }
  window.setInterval(paintActive, 30000);

  var lastKey = '';
  function onTable() {
    var tbl = $('scheduleTable'); if (!tbl) return;
    var ths = tbl.querySelectorAll('th');
    if (ths.length < 10) return;
    try { buildCrew(); } catch (e) {}
    var first = /(\d{2})\/(\d{2})\/(\d{4})/.exec(ths[3].textContent);
    var last = /(\d{2})\/(\d{2})\/(\d{4})/.exec(ths[9].textContent);
    var lab = $('quickNavLabel');
    if (first && last && lab) {
      var a = +first[1], am = +first[2] - 1, b = +last[1], bm = +last[2] - 1;
      lab.setAttribute('data-range', a + (am === bm ? '' : ' ' + MON[am]) + ' – ' + b + ' ' + MON[bm] + ' ' + last[3]);
    }
    /* geser ke kolom hari ini — hanya sekali per minggu yang ditampilkan */
    var key = lab ? lab.textContent : '';
    if (key === lastKey) return;
    lastKey = key;
    var wrap = tbl.parentNode, today = tbl.querySelector('th.today-col');
    if (wrap && today && wrap.scrollWidth > wrap.clientWidth + 4) {
      var nameTh = tbl.querySelector('th.nama-col-header');
      var left = today.offsetLeft - (nameTh ? nameTh.offsetWidth : 0) - 6;
      try { wrap.scrollTo ? wrap.scrollTo({ left: Math.max(0, left), behavior: ANIMATE ? 'smooth' : 'auto' }) : (wrap.scrollLeft = Math.max(0, left)); }
      catch (e) { wrap.scrollLeft = Math.max(0, left); }
    }
  }
  var tb = $('scheduleTable');
  if (tb) {
    var pend = 0;
    new MutationObserver(function () {
      window.clearTimeout(pend);
      pend = window.setTimeout(onTable, 60);   /* tunggu render selesai */
    }).observe(tb, { childList: true });
    onTable();
  }

  /* ---------- 5. Lencana chat belum dibaca -> ikut tampil di navigasi bawah (HP) ---------- */
  var cb = $('chatBadge'), nb = $('mobileNavBadge');
  if (cb && nb) {
    var sync = function () {
      var on = cb.style.display !== 'none' && cb.textContent !== '' && cb.textContent !== '0';
      nb.style.display = on ? 'flex' : 'none';
      nb.textContent = on ? cb.textContent : '';
    };
    new MutationObserver(sync).observe(cb, { attributes: true, childList: true, characterData: true, subtree: true });
    sync();
  }

  paintScroll();
})();
