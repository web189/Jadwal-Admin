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
  var crewEl = null, crewCollapsed = false;
  try { crewCollapsed = localStorage.getItem('proCrew') === '1'; } catch (e) {}
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
      crewEl.addEventListener('click', function (e) {
        if (!e.target.closest || !e.target.closest('.crew-head')) return;
        crewCollapsed = !crewCollapsed;
        crewEl.classList.toggle('collapsed', crewCollapsed);
        var hd = crewEl.querySelector('.crew-head'); if (hd) hd.setAttribute('aria-expanded', crewCollapsed ? 'false' : 'true');
        try { localStorage.setItem('proCrew', crewCollapsed ? '1' : '0'); } catch (x) {}
      });
    }
    var day = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
    var h = '<button type="button" class="crew-head" aria-expanded="' + (crewCollapsed ? 'false' : 'true') + '"><span class="crew-title">PETUGAS HARI INI</span><span class="crew-date">' + esc(day) + '</span><i class="crew-chev" aria-hidden="true"></i></button><div class="crew-body"><div class="crew-grid">';
    SH.forEach(function (x) {
      var list = g[x.k];
      h += '<div class="crew-card crew-' + x.k + '" data-sid="' + x.id + '"><div class="crew-top"><i class="crew-dot"></i><b>' + x.n +
        '</b><em>' + x.t + '</em><span class="crew-live">AKTIF</span></div><ul>' +
        (list.length ? list.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') : '<li class="crew-none">—</li>') + '</ul></div>';
    });
    h += '</div>';
    var off = g.OFF.concat(g.C);
    if (off.length) h += '<div class="crew-off"><b>Libur / Cuti:</b> ' + off.map(esc).join(', ') + '</div>';
    h += '</div>';
    crewEl.classList.toggle('collapsed', crewCollapsed);
    crewEl.innerHTML = h;
    paintActive();
  }
  window.setInterval(paintActive, 30000);

  /* ---------- 3c. Penanda "tersinkron" di footer ---------- */
  var syncEl = null;
  function stampSync() {
    if (!syncEl) {
      var ft = doc.querySelector('footer.cyber-signature'); if (!ft) return;
      syncEl = doc.createElement('div'); syncEl.className = 'sync-chip';
      syncEl.innerHTML = '<i></i><span></span>';
      ft.insertBefore(syncEl, ft.firstChild);
    }
    var d = new Date(), p2 = function (n) { return (n < 10 ? '0' : '') + n; };
    syncEl.lastChild.textContent = 'Data tersinkron ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()) + ' WIB';
  }

  var lastKey = '';
  function onTable() {
    var tbl = $('scheduleTable'); if (!tbl) return;
    var ths = tbl.querySelectorAll('th');
    if (ths.length < 10) return;
    try { buildCrew(); } catch (e) {}
    try { stampSync(); } catch (e) {}
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
    var firstRun = lastKey === '';
    lastKey = key;
    var wrap = tbl.parentNode, today = tbl.querySelector('th.today-col');
    if (!firstRun && ANIMATE && wrap) {            /* transisi halus saat pindah minggu */
      wrap.classList.remove('wk-swap'); void wrap.offsetWidth; wrap.classList.add('wk-swap');
    }
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

  /* ---------- 6. Sorot cahaya mengikuti kursor di kartu (PC / mouse saja) ---------- */
  if (ANIMATE && window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var ptEl = null, ptX = 0, ptY = 0, ptRaf = 0;
    doc.addEventListener('pointermove', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('.stat-card,.crew-card,.kegiatan-card') : null;
      if (!t) return;
      ptEl = t; ptX = e.clientX; ptY = e.clientY;
      if (!ptRaf) ptRaf = window.requestAnimationFrame(function () {
        ptRaf = 0; if (!ptEl) return;
        var r = ptEl.getBoundingClientRect();
        ptEl.style.setProperty('--mx', (ptX - r.left) + 'px');
        ptEl.style.setProperty('--my', (ptY - r.top) + 'px');
      });
    }, { passive: true });
  }

  /* ---------- 7. Perbaikan penyorotan navigasi bawah (HP) ----------
     Skrip bawaan memetakan 3 bagian ke tombol ke-1,2,3 padahal urutan tombolnya
     Beranda, Arisan, Jadwal, Kebersihan… sehingga tombol yang menyala selalu bergeser satu. */
  var navBtns = doc.querySelectorAll('.mobile-nav-item'), navMap = {};
  Array.prototype.forEach.call(navBtns, function (b) {
    var sp = b.querySelector('span'); if (!sp) return;
    var t = sp.textContent.replace(/\s+/g, '');
    if (t === 'Beranda') navMap.header = b;
    else if (t === 'Jadwal') navMap.scheduleSection = b;
    else if (t === 'Kebersihan') navMap.kegiatanSection = b;
  });
  var navTick = false;
  function pageTop(el) { return el.getBoundingClientRect().top + (window.pageYOffset || root.scrollTop); }
  function navSpy() {
    navTick = false;
    var sy = window.pageYOffset || root.scrollTop, y = sy + window.innerHeight * 0.3, cur = 'header';
    var ids = ['scheduleSection', 'kegiatanSection'], i;
    for (i = 0; i < ids.length; i++) { var el = $(ids[i]); if (el && y >= pageTop(el)) cur = ids[i]; }
    if (sy < 60) cur = 'header';
    else if (sy + window.innerHeight >= root.scrollHeight - 6) cur = 'kegiatanSection';
    var want = navMap[cur]; if (!want) return;
    Array.prototype.forEach.call(navBtns, function (b) { if (b !== want) b.classList.remove('active'); });
    want.classList.add('active');
  }
  if (navMap.header) {
    window.addEventListener('scroll', function () { if (!navTick) { navTick = true; window.requestAnimationFrame(navSpy); } }, { passive: true });
    window.addEventListener('resize', navSpy);
    navSpy();
  }

  /* ---------- 8. Tombol ganti tema cepat di header + warna bilah browser ikut tema ---------- */
  var row1 = doc.querySelector('.header-row-1'), tt = $('themeToggle');
  if (row1 && tt && !doc.getElementById('themeQuick')) {
    var q = doc.createElement('button');
    q.id = 'themeQuick'; q.type = 'button'; q.className = 'theme-quick';
    q.setAttribute('aria-label', 'Ganti tema terang / gelap');
    q.innerHTML =
      '<svg class="tq-moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
      '<svg class="tq-sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7"/></g></svg>';
    q.addEventListener('click', function () { tt.click(); });
    row1.appendChild(q);
  }
  var metaTheme = doc.querySelector('meta[name="theme-color"]');
  function syncThemeColor() {
    if (metaTheme) metaTheme.setAttribute('content', doc.body.classList.contains('formal-theme') ? '#EEF3FC' : '#070B18');
  }
  new MutationObserver(syncThemeColor).observe(doc.body, { attributes: true, attributeFilter: ['class'] });
  syncThemeColor();

  /* ---------- 9. Chip "Kembali ke minggu ini" saat melihat minggu lain ---------- */
  var backChip = null;
  function updateBackChip() {
    var lab = $('quickNavLabel'), bar = doc.querySelector('.schedule-toolbar');
    if (!lab || !bar || typeof window.getCurrentWeekNumber !== 'function') return;
    var shown = parseInt((/\d+/.exec(lab.textContent) || [0])[0], 10), cur = window.getCurrentWeekNumber();
    if (!backChip) {
      backChip = doc.createElement('button');
      backChip.type = 'button'; backChip.className = 'back-chip'; backChip.style.display = 'none';
      backChip.addEventListener('click', function () {
        var sel = $('weekSelect'); if (!sel) return;
        sel.value = window.getCurrentWeekNumber();
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      });
      bar.appendChild(backChip);
    }
    if (shown && shown !== cur) {
      backChip.textContent = '↩ Kembali ke minggu ini (Week ' + cur + ')';
      backChip.style.display = '';
    } else backChip.style.display = 'none';
  }
  var qnl = $('quickNavLabel');
  if (qnl) new MutationObserver(updateBackChip).observe(qnl, { childList: true, characterData: true, subtree: true });
  window.setTimeout(updateBackChip, 800);

  paintScroll();
})();
