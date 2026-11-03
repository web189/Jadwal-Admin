/* ============================================================
   pwa.js — mendaftarkan service worker + tombol "Pasang Aplikasi"
   (mirip WhatsApp Web: bisa dipasang jadi aplikasi di komputer).
   Dipasang lewat:  <script src="pwa.js" data-app-name="..." data-accent="#..." defer></script>
   ============================================================ */
(function () {
  'use strict';

  var tag = document.querySelector('script[src*="pwa.js"]');
  var APP_NAME = (tag && tag.getAttribute('data-app-name')) || document.title || 'Aplikasi';
  var ACCENT = (tag && tag.getAttribute('data-accent')) || '#2f7dff';
  var KEY = 'pwaInstallDismissed:' + location.pathname;
  var SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

  /* ---- 1. Service worker + UPDATE OTOMATIS + indikator offline ---- */
  var hadController = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
  var reloading = false;

  function toast(msg, type) {
    try { if (typeof window.showToast === 'function') { window.showToast(msg, type || 'info', 3500); return; } } catch (e) {}
  }
  function busy() {   /* jangan reload saat pengguna sedang mengetik / membuka jendela */
    var a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return true;
    return !!document.querySelector('.modal.active');
  }
  function reloadNow() { if (reloading) return; reloading = true; location.reload(); }
  function applyUpdate() {
    toast('Versi terbaru terpasang, memuat ulang\u2026', 'success');
    var tries = 0;
    (function go() { if (busy() && tries++ < 20) return setTimeout(go, 3000); setTimeout(reloadNow, 900); })();
  }

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (hadController) applyUpdate();      /* kunjungan pertama: tidak perlu reload */
    });
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        var check = function () { if (navigator.onLine !== false) reg.update().catch(function () {}); };
        check();
        setInterval(check, 30 * 60 * 1000);
        document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
        window.addEventListener('online', check);
      }).catch(function (err) {
        if (window.console) console.warn('[PWA] service worker gagal didaftarkan:', err);
      });
    });
  }

  /* pil status offline + sinkron otomatis saat kembali online */
  var pill = null;
  function setPill(off) {
    if (off && !pill) {
      pill = document.createElement('div');
      pill.className = 'net-pill';
      pill.setAttribute('role', 'status');
      pill.textContent = 'Mode offline \u00b7 menampilkan data tersimpan terakhir';
      document.body.appendChild(pill);
    } else if (!off && pill) { pill.parentNode && pill.parentNode.removeChild(pill); pill = null; }
  }
  function resync() {
    if (window.__fbOffline) { reloadNow(); return; }       /* Firebase belum sempat dimuat -> muat ulang */
    try {
      var w = parseInt((document.getElementById('weekSelect') || {}).value || 0, 10);
      if (w && typeof window.renderSchedule === 'function') window.renderSchedule(w);
      if (typeof window.loadSerahTerima === 'function') window.loadSerahTerima();
      if (typeof window.loadKegiatan === 'function') window.loadKegiatan();
    } catch (e) {}
    toast('Kembali online \u2014 data diperbarui', 'success');
  }
  window.addEventListener('offline', function () { setPill(true); });
  window.addEventListener('online', function () { setPill(false); setTimeout(resync, 600); });
  if (navigator.onLine === false) { if (document.body) setPill(true); else document.addEventListener('DOMContentLoaded', function () { setPill(true); }); }

  /* ---- 2. Tombol pasang ---- */
  var deferred = null;
  var bar = null;

  function isStandalone() {
    try {
      return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
             window.navigator.standalone === true;
    } catch (e) { return false; }
  }
  function snoozed() {
    try { var t = parseInt(localStorage.getItem(KEY) || '0', 10); return t && (Date.now() - t) < SNOOZE_MS; }
    catch (e) { return false; }
  }
  function snooze() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }
  function textOn(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return '#fff';
    var n = parseInt(m[1], 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#06121f' : '#ffffff';
  }
  function hide() { if (bar && bar.parentNode) bar.parentNode.removeChild(bar); bar = null; }

  function show() {
    if (bar || !deferred || isStandalone() || snoozed()) return;
    /* tombol "Instal Aplikasi" permanen sudah ada di menu — tidak perlu bar melayang */
    if (document.getElementById('installAppBtn')) return;
    /* hanya tampil di layar lebar (komputer); di HP browser sudah punya menu sendiri */
    if (window.matchMedia && !window.matchMedia('(min-width: 800px)').matches) return;

    bar = document.createElement('div');
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Pasang aplikasi');
    bar.style.cssText = 'position:fixed;left:18px;bottom:18px;z-index:2147483000;display:flex;align-items:center;gap:12px;' +
      'max-width:420px;padding:12px 14px;border-radius:14px;background:rgba(12,17,30,.96);color:#eef3ff;' +
      'font:13px/1.35 "Segoe UI",Arial,sans-serif;box-shadow:0 10px 34px rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.12)';

    var msg = document.createElement('div');
    msg.style.cssText = 'flex:1;min-width:0';
    var b = document.createElement('strong');
    b.style.cssText = 'display:block;font-size:13.5px';
    b.textContent = 'Pasang ' + APP_NAME;
    var s = document.createElement('span');
    s.style.cssText = 'opacity:.75;font-size:12px';
    s.textContent = 'Buka langsung dari desktop, tanpa browser.';
    msg.appendChild(b); msg.appendChild(s);

    var ok = document.createElement('button');
    ok.type = 'button'; ok.textContent = 'Pasang';
    ok.style.cssText = 'border:0;border-radius:9px;padding:8px 16px;font:600 13px "Segoe UI",Arial,sans-serif;cursor:pointer;' +
      'background:' + ACCENT + ';color:' + textOn(ACCENT);
    ok.onclick = function () { window.pwaInstall(); };

    var no = document.createElement('button');
    no.type = 'button'; no.textContent = '\u00d7'; no.setAttribute('aria-label', 'Tutup');
    no.style.cssText = 'border:0;background:transparent;color:#9fb0d0;font-size:20px;line-height:1;cursor:pointer;padding:2px 6px';
    no.onclick = function () { snooze(); hide(); };

    bar.appendChild(msg); bar.appendChild(ok); bar.appendChild(no);
    document.body.appendChild(bar);
  }

  /* bisa dipanggil dari tombol buatan sendiri di situs: onclick="pwaInstall()" */
  window.pwaCanInstall = function () { return !!deferred; };
  window.pwaInstall = function () {
    if (!deferred) return false;
    var p = deferred; deferred = null; hide();
    p.prompt();
    if (p.userChoice && p.userChoice.then) p.userChoice.then(function (c) { if (c && c.outcome !== 'accepted') snooze(); });
    return true;
  };

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    window.dispatchEvent(new CustomEvent('pwa-installable'));
    if (document.readyState === 'complete') setTimeout(show, 2500);
    else window.addEventListener('load', function () { setTimeout(show, 2500); });
  });
  window.addEventListener('appinstalled', function () { deferred = null; hide(); });
})();
