/* offline-plus.js (v30.2) — pelengkap sistem offline. ES5, ringan, aman Windows 7 / Chrome 109.
   1) Prefetch data jadwal beberapa minggu di sekitar minggu ini saat ONLINE -> bisa dibuka offline.
   2) Periodic Background Sync (PWA terpasang): file inti disegarkan sendiri walau aplikasi tidak dibuka.
   3) Penanda "Siap offline" sekali saja + cek kapasitas penyimpanan.
   Tidak mengubah jd.js; semua dibungkus try/catch. */
(function (w, d, n) {
  "use strict";
  var KEY = "opPrefetchAt", EVERY = 6 * 3600 * 1000;
  function now() { return Date.now(); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function online() { return n.onLine !== false; }
  function toast(m, t) { try { if (typeof w.showToast === "function") w.showToast(m, t || "info"); } catch (e) {} }

  /* minggu ke-berapa sekarang (sama dengan START_WEEK=6 pada 2 Feb 2026) */
  function curWeek() {
    var s = new Date(2026, 1, 2), t = new Date();
    var w0 = Math.floor((t - s) / (7 * 864e5)) + 6;
    return Math.max(6, Math.min(52, w0));
  }

  function prefetchWeeks() {
    if (!online() || !w.firebaseReady || !w.db || w.__fbOffline || typeof w.firebaseGet !== "function") return;
    var last = parseInt(lsGet(KEY) || "0", 10);
    if (last && now() - last < EVERY) return;
    var c = curWeek(), list = [], i;
    for (i = -2; i <= 4; i++) { if (c + i >= 6 && c + i <= 52) list.push(c + i); }
    var idx = 0, ok = 0;
    (function next() {
      if (idx >= list.length || !online()) { if (ok) lsSet(KEY, String(now())); return; }
      var wk = list[idx++];
      try {
        w.firebaseGet(w.firebaseRef(w.db, "schedules/week_" + wk)).then(function () { ok++; }, function () {}).then(function () { setTimeout(next, 350); });
      } catch (e) { setTimeout(next, 350); }
    })();
  }

  function periodic() {
    if (!n.serviceWorker || !n.serviceWorker.ready) return;
    n.serviceWorker.ready.then(function (reg) {
      if (reg.periodicSync && reg.periodicSync.register) {
        return reg.periodicSync.register("jadwal-refresh", { minInterval: 12 * 3600 * 1000 }).catch(function () {});
      }
    }).catch(function () {});
  }

  function readyBadge() {
    d.documentElement.className += " offline-ready";
    if (!lsGet("opReadyShown")) { lsSet("opReadyShown", "1"); toast("✅ Siap dipakai tanpa internet", "success"); }
  }

  function storage() {
    try {
      if (n.storage && n.storage.persist) n.storage.persist();
      if (n.storage && n.storage.estimate) n.storage.estimate().then(function (e) {
        if (e && e.quota && e.usage / e.quota > 0.9) toast("⚠️ Penyimpanan perangkat hampir penuh", "error");
      }).catch(function () {});
    } catch (e) {}
  }

  /* ---- Update otomatis setelah kembali online ----
     Bila halaman dibuka dari simpanan saat offline, file di server bisa sudah berubah. Begitu internet kembali,
     bandingkan penanda versi (ETag / Last-Modified) file inti di server vs simpanan; beda -> muat ulang otomatis
     (menunggu bila pengguna sedang mengetik atau ada jendela terbuka). */
  var FILES = ["index.html", "jd.js", "app.css", "tema2026.css", "tema-pro.css", "tema-nova.css", "offline-plus.js"];
  function sig(h) { return h ? (h.get("etag") || h.get("last-modified") || "") : ""; }
  function changedSinceCache() {
    if (!w.caches || !w.fetch) return Promise.resolve(false);
    return caches.keys().then(function (ks) {
      var name = null, i;
      for (i = 0; i < ks.length; i++) { if (ks[i].indexOf("jadwal-shell-") === 0) name = ks[i]; }
      if (!name) return false;
      return caches.open(name).then(function (cache) {
        return Promise.all(FILES.map(function (f) {
          return Promise.all([cache.match("./" + f), fetch(f, { method: "HEAD", cache: "no-store" })]).then(function (r) {
            if (!r[0] || !r[1] || !r[1].ok) return false;
            var a = sig(r[0].headers), b = sig(r[1].headers);
            return !!(a && b && a !== b);
          }).catch(function () { return false; });
        })).then(function (arr) { return arr.indexOf(true) >= 0; });
      });
    }).catch(function () { return false; });
  }
  function busy() {
    var a = d.activeElement;
    if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return true;
    return !!d.querySelector(".modal.active, .inst-modal:not([hidden])");
  }
  function reloadWhenIdle() {
    var t = 0;
    try { t = parseInt(sessionStorage.getItem("opReloadAt") || "0", 10); } catch (e) {}
    if (now() - t < 30000) return;
    (function wait() {
      if (busy()) { setTimeout(wait, 2500); return; }
      try { sessionStorage.setItem("opReloadAt", String(now())); } catch (e) {}
      w.location.reload();
    })();
  }
  function checkAfterReconnect() {
    if (!online()) return;
    var reg = n.serviceWorker && n.serviceWorker.getRegistration ? n.serviceWorker.getRegistration() : null;
    if (reg && reg.then) reg.then(function (r) { if (r && r.update) r.update().catch(function () {}); }).catch(function () {});
    changedSinceCache().then(function (ch) {
      if (!ch) return;
      toast("\u{1F504} Versi terbaru ditemukan \u2014 memperbarui\u2026", "info");
      setTimeout(reloadWhenIdle, 2200);
    });
  }
  w.addEventListener("online", function () { setTimeout(checkAfterReconnect, 2000); });

  w.addEventListener("pwa-offline-ready", readyBadge);
  w.addEventListener("online", function () { setTimeout(prefetchWeeks, 4000); });
  w.addEventListener("app-resync", function () { setTimeout(prefetchWeeks, 2500); });
  w.addEventListener("load", function () {
    setTimeout(function () { try { prefetchWeeks(); periodic(); storage(); } catch (e) {} }, 9000);
  });
  /* PWA sempat tidak dibuka lama: minta SW menyegarkan file inti begitu halaman aktif lagi */
  d.addEventListener("visibilitychange", function () {
    if (d.hidden || !online() || !n.serviceWorker || !n.serviceWorker.controller) return;
    var last = parseInt(lsGet("opShellAt") || "0", 10);
    if (now() - last < 6 * 3600 * 1000) return;
    lsSet("opShellAt", String(now()));
    try { n.serviceWorker.controller.postMessage({ type: "REFRESH_SHELL" }); } catch (e) {}
  });
})(window, document, navigator);
