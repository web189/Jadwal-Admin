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
    (function registerSW() {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        var check = function () { if (navigator.onLine !== false) reg.update().catch(function () {}); };
        setTimeout(check, 4000);
        setInterval(check, 30 * 60 * 1000);
        document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
        window.addEventListener('online', check);
      }).catch(function (err) {
        if (window.console) console.warn('[PWA] service worker gagal didaftarkan:', err);
      });
    })();
  }

  /* ---- pil status: offline / mengantre / menyinkronkan ---- */
  var pill = null, lastOnline = navigator.onLine !== false, resyncTimer = null;
  function OS() { return window.OfflineSync || null; }
  function pend() { var o = OS(); return o ? o.pending() : 0; }
  function renderPill() {
    var o = OS(), st = o ? o.state() : { online: navigator.onLine !== false, pending: 0, syncing: false };
    var n = st.pending, txt = '', cls = 'net-pill';
    if (!st.online) {
      txt = 'Mode offline \u00b7 ' + (n ? n + ' perubahan tersimpan, dikirim otomatis saat online' : 'menampilkan data tersimpan terakhir');
    } else if (st.syncing) {
      txt = 'Menyinkronkan ' + n + ' perubahan\u2026'; cls += ' sync';
    } else if (n) {
      txt = n + ' perubahan menunggu dikirim \u00b7 ketuk untuk kirim sekarang'; cls += ' sync';
    }
    if (!txt) { if (pill && pill.parentNode) pill.parentNode.removeChild(pill); pill = null; return; }
    if (!document.body) { document.addEventListener('DOMContentLoaded', renderPill); return; }
    if (!pill) {
      pill = document.createElement('div');
      pill.setAttribute('role', 'status');
      pill.style.cursor = 'pointer';
      pill.addEventListener('click', function () { var x = OS(); if (x && !x.isOffline()) x.flush().then(function () { resync(true); }); });
      document.body.appendChild(pill);
    }
    pill.className = cls;
    pill.textContent = txt;
  }
  function whenIdle(fn) {
    var tries = 0;
    (function go() { if (busy() && tries++ < 20) return setTimeout(go, 3000); fn(); })();
  }
  /* muat ulang semua data dari server tanpa reload halaman */
  function resync(quiet) {
    if (window.__fbOffline) { reloadNow(); return; }       /* Firebase belum sempat dimuat -> muat ulang */
    whenIdle(function () {
      try {
        var w = parseInt((document.getElementById('weekSelect') || {}).value || 0, 10);
        if (typeof window.loadRotationOverrides === 'function') {
          var p = window.loadRotationOverrides();
          if (p && p.then) p.then(function () { if (w && typeof window.renderSchedule === 'function') window.renderSchedule(w); }, function () {});
          else if (w && typeof window.renderSchedule === 'function') window.renderSchedule(w);
        } else if (w && typeof window.renderSchedule === 'function') window.renderSchedule(w);
        if (typeof window.loadSerahTerima === 'function') window.loadSerahTerima();
        if (typeof window.loadKegiatan === 'function') window.loadKegiatan();
        if (typeof window.loadChatMessages === 'function') window.loadChatMessages();
      } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('app-resync')); } catch (e) {}
      if (!quiet) toast('Kembali online \u2014 data diperbarui', 'success');
    });
  }
  function goOnline() {
    lastOnline = true; renderPill();
    clearTimeout(resyncTimer);
    resyncTimer = setTimeout(function () {
      var o = OS();
      /* kirim dulu perubahan yang mengantre, baru tarik data terbaru (supaya tidak saling menimpa) */
      var p = (o && o.pending()) ? o.flush() : Promise.resolve();
      p.then(function () { resync(false); }, function () { resync(false); });
    }, 800);
  }
  window.addEventListener('offline', function () { lastOnline = false; renderPill(); toast('Anda offline \u2014 perubahan disimpan di perangkat', 'info'); });
  window.addEventListener('online', goOnline);
  window.addEventListener('offline-sync-state', renderPill);
  window.addEventListener('offline-sync-queued', function (e) {
    toast('\ud83d\udce5 Disimpan di perangkat \u2014 akan dikirim otomatis saat online', 'info');
  });
  window.addEventListener('offline-sync-done', function (e) {
    var d = e.detail || {};
    if (d.sent) toast('\u2705 ' + d.sent + ' perubahan offline berhasil disinkronkan', 'success');
    if (d.dropped) toast('\u26a0\ufe0f ' + d.dropped + ' perubahan ditolak server (cek login admin)', 'error');
    if (d.sent) resync(true);
  });
  window.addEventListener('offline-sync-blocked', function () { toast('\u26a0\ufe0f Perubahan ditolak server \u2014 login ulang sebagai admin untuk mengirim', 'error'); });
  window.addEventListener('offline-sync-connection', function (e) {
    if (e.detail && e.detail.online && !lastOnline) goOnline();
    lastOnline = !!(e.detail && e.detail.online);
  });
  if (navigator.onLine === false) { lastOnline = false; renderPill(); }

  /* ---- 1b. UPDATE OTOMATIS tanpa perlu menaikkan CACHE_VERSION ----
     Setiap kali online (dan tiap 5 menit / saat aplikasi dibuka kembali) file inti dicek
     lewat HEAD (ETag/Last-Modified). Bila berubah -> service worker diperbarui dan halaman dimuat ulang. */
  var WATCH = ['index.html', 'app.js', 'offline-sync.js', 'pro2026.js', 'desktop2026.js', 'sakit2026.js', 'notif-promo.js', 'pwa.js', 'style.css'];
  var baseSig = null;   /* tanda versi saat halaman ini dibuka (per sesi halaman, bukan disimpan) */
  function contentSig() {
    return Promise.all(WATCH.map(function (f) {
      return fetch(f, { method: 'HEAD', cache: 'no-cache' }).then(function (r) {
        return r.ok ? (r.headers.get('etag') || r.headers.get('last-modified') || r.headers.get('content-length') || '') : '';
      }).catch(function () { return ''; });
    })).then(function (a) { return a.join('|'); });
  }
  var checkingContent = false;
  function checkContent() {
    if (checkingContent || navigator.onLine === false || location.protocol === 'file:') return;
    checkingContent = true;
    contentSig().then(function (sig) {
      if (!sig.replace(/\|/g, '')) return;                 /* server tidak memberi header -> lewati */
      if (baseSig === null) { baseSig = sig; return; }
      if (baseSig !== sig) {
        baseSig = sig;
        if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
          navigator.serviceWorker.getRegistration().then(function (r) { if (r) r.update().catch(function () {}); }).catch(function () {});
        }
        /* jika service worker tidak berubah, controllerchange tidak terjadi -> muat ulang sendiri */
        applyUpdate();
      }
    }).catch(function () {}).then(function () { checkingContent = false; });
  }
  window.addEventListener('load', function () { setTimeout(checkContent, 6000); });
  setInterval(checkContent, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(checkContent, 1500); });
  window.addEventListener('online', function () { setTimeout(checkContent, 2500); });

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

  /* ---- API instal (dipakai tombol di header, menu, dan banner) ---- */
  var DONE_KEY = 'pwaInstalled:' + location.pathname;
  function markInstalled(v) { try { if (v) localStorage.setItem(DONE_KEY, '1'); else localStorage.removeItem(DONE_KEY); } catch (e) {} }
  function wasInstalled() { try { return localStorage.getItem(DONE_KEY) === '1'; } catch (e) { return false; } }

  window.pwaCanInstall = function () { return !!deferred; };
  window.pwaIsInstalled = function () { return isStandalone() || wasInstalled(); };

  /* Memunculkan dialog instal bawaan browser SEKARANG (harus dipanggil langsung dari klik). */
  window.pwaInstall = function () {
    if (!deferred) return false;
    var p = deferred; deferred = null; hide();
    try { p.prompt(); } catch (err) { return false; }
    if (p.userChoice && p.userChoice.then) {
      p.userChoice.then(function (c) {
        if (c && c.outcome === 'accepted') { markInstalled(true); window.dispatchEvent(new CustomEvent('pwa-installed')); }
        else { snooze(); }
      }).catch(function () {});
    }
    return true;
  };

  /* Seperti pwaInstall, tapi bila event instal belum datang, tunggu sebentar (maks. ~2,5 dtk)
     lalu panggil. Mengembalikan Promise<boolean>. */
  window.pwaInstallWait = function (ms) {
    if (window.pwaInstall()) return Promise.resolve(true);
    return new Promise(function (resolve) {
      var done = false;
      function fin(ok) { if (done) return; done = true; window.removeEventListener('pwa-installable', on); clearTimeout(t); resolve(ok); }
      function on() { fin(window.pwaInstall()); }
      var t = setTimeout(function () { fin(false); }, ms || 2500);
      window.addEventListener('pwa-installable', on);
    });
  };

  function gotPrompt(e) {
    if (e && e.preventDefault) e.preventDefault();
    deferred = e || deferred;
    markInstalled(false);
    window.dispatchEvent(new CustomEvent('pwa-installable'));
    if (document.readyState === 'complete') setTimeout(show, 2500);
    else window.addEventListener('load', function () { setTimeout(show, 2500); });
  }
  /* event yang sudah datang SEBELUM pwa.js selesai dimuat (ditangkap skrip kecil di <head>) */
  if (window.__bip) { var early = window.__bip; window.__bip = null; gotPrompt(early); }
  window.addEventListener('beforeinstallprompt', gotPrompt);
  window.addEventListener('appinstalled', function () {
    deferred = null; hide(); markInstalled(true);
    window.dispatchEvent(new CustomEvent('pwa-installed'));
    toast('Aplikasi berhasil dipasang', 'success');
  });

  /* Chrome Android/PC: cek apakah aplikasinya sudah terpasang di perangkat ini */
  try {
    if (navigator.getInstalledRelatedApps) {
      navigator.getInstalledRelatedApps().then(function (apps) {
        if (apps && apps.length) { markInstalled(true); window.dispatchEvent(new CustomEvent('pwa-installed')); }
      }).catch(function () {});
    }
  } catch (e) {}
})();
