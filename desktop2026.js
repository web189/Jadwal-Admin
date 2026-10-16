/* ============================================================
   desktop2026.js — tombol "Instal Aplikasi" + panduan pemasangan.
   Ringan, tanpa library, gaya ES5 agar aman di Chrome lama (Windows 7).
   Bergantung pada pwa.js (window.pwaInstall / window.pwaCanInstall).
   ============================================================ */
(function () {
  'use strict';
  var doc = document;
  function $(id) { return doc.getElementById(id); }

  var card = $('installCard'), btn = $('installAppBtn'), chip = $('installHeaderBtn');
  var sub = $('installSub'), modal = $('installHelp');
  if (!btn) return;

  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/.test(ua);
  var isFirefox = /Firefox\//.test(ua);
  var isEdge = /Edg\//.test(ua);
  var isSafariMac = /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\//.test(ua) && !isIOS;

  function standalone() {
    try {
      return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
             window.navigator.standalone === true;
    } catch (e) { return false; }
  }

  function setVisible(show) {
    if (card) card.hidden = !show;
    if (chip) chip.hidden = !show;
  }

  function refresh() {
    if (standalone()) { setVisible(false); return; }
    setVisible(true);
    var ready = !!(window.pwaCanInstall && window.pwaCanInstall());
    if (sub) sub.textContent = ready ? 'Klik untuk memasang sekarang' : 'Buka seperti aplikasi desktop';
    if (btn.classList) { if (ready) btn.classList.add('ready'); else btn.classList.remove('ready'); }
    if (chip && chip.classList) { if (ready) chip.classList.add('ready'); else chip.classList.remove('ready'); }
  }

  /* ---------- panduan manual ---------- */
  function steps() {
    if (isIOS) {
      return { s: ['Buka situs ini di <b>Safari</b>.', 'Ketuk tombol <b>Bagikan</b> (kotak dengan panah ke atas).', 'Pilih <b>Tambahkan ke Layar Utama</b>, lalu ketuk <b>Tambah</b>.'],
               n: 'Di iPhone/iPad, pemasangan hanya bisa lewat Safari.' };
    }
    if (isAndroid) {
      return { s: ['Buka menu browser <b>&#8942;</b> di kanan atas.', 'Pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.', 'Konfirmasi dengan <b>Instal</b>.'],
               n: 'Gunakan Chrome atau Edge agar pilihan instal muncul.' };
    }
    if (isFirefox) {
      return { s: ['Firefox di komputer belum mendukung pemasangan aplikasi web.', 'Buka situs ini di <b>Google Chrome</b> atau <b>Microsoft Edge</b>.', 'Klik ikon <b>Instal</b> di ujung kanan kolom alamat.'],
               n: 'Atau tambahkan situs ke bookmark untuk akses cepat.' };
    }
    if (isSafariMac) {
      return { s: ['Di menu Safari pilih <b>File</b>.', 'Klik <b>Tambahkan ke Dock</b>.', 'Konfirmasi dengan <b>Tambah</b>.'],
               n: 'Butuh Safari 17 / macOS Sonoma atau lebih baru.' };
    }
    if (isEdge) {
      return { s: ['Klik ikon <b>Aplikasi tersedia</b> di ujung kanan kolom alamat, atau menu <b>&#8943;</b>.', 'Pilih <b>Aplikasi &rarr; Instal situs ini sebagai aplikasi</b>.', 'Klik <b>Instal</b>. Pintasan muncul di Desktop &amp; Start Menu.'],
               n: 'Setelah terpasang, aplikasi terbuka di jendela sendiri.' };
    }
    return { s: ['Klik ikon <b>Instal</b> (monitor dengan panah) di ujung kanan kolom alamat Chrome.', 'Atau buka menu <b>&#8942;</b> &rarr; <b>Transmisi, simpan, dan bagikan</b> &rarr; <b>Instal halaman sebagai aplikasi</b>.', 'Klik <b>Instal</b>. Pintasan muncul di Desktop &amp; Start Menu.'],
             n: 'Windows 7 didukung sampai Chrome 109. Setelah terpasang, aplikasi terbuka di jendela sendiri.' };
  }

  function openHelp() {
    if (!modal) return;
    var d = steps(), html = '', i;
    for (i = 0; i < d.s.length; i++) html += '<li><span class="inst-n">' + (i + 1) + '</span><span>' + d.s[i] + '</span></li>';
    $('installSteps').innerHTML = html;
    $('installNote').textContent = d.n;
    modal.hidden = false;
    var ok = $('installHelpOk'); if (ok && ok.focus) ok.focus();
  }
  function closeHelp() { if (modal) modal.hidden = true; }

  function onInstallClick() {
    if (window.pwaInstall && window.pwaInstall()) return;   /* dialog bawaan browser */
    openHelp();                                             /* tidak tersedia -> tampilkan panduan */
  }

  btn.addEventListener('click', onInstallClick);
  if (chip) chip.addEventListener('click', onInstallClick);
  if ($('installHelpClose')) $('installHelpClose').addEventListener('click', closeHelp);
  if ($('installHelpOk')) $('installHelpOk').addEventListener('click', closeHelp);
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeHelp(); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeHelp(); });

  window.addEventListener('pwa-installable', refresh);
  window.addEventListener('appinstalled', function () { setVisible(false); });
  try {
    var mq = window.matchMedia('(display-mode: standalone)');
    if (mq.addEventListener) mq.addEventListener('change', refresh);
  } catch (e) {}

  refresh();
})();
