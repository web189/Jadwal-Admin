/* ============================================================
   offline-sync.js — antrean tulis OFFLINE + sinkron otomatis
   ------------------------------------------------------------
   Masalah yang diselesaikan:
   • Saat offline, tombol Simpan (jadwal, serah terima, chat, kegiatan,
     petugas sakit, rotasi) gagal / menggantung dan datanya hilang.
   Cara kerja:
   1) Tulis (set/hapus) saat offline -> disimpan di ANTREAN (localStorage,
      tahan tutup-aplikasi & reload) + langsung dicerminkan ke cache lokal,
      sehingga tampilan memakai data baru walau belum terkirim.
   2) Begitu koneksi Firebase kembali, antrean dikirim berurutan secara
      otomatis (dengan percobaan ulang bertahap bila jaringan masih labil).
   3) Saat membaca data dari server, perubahan yang masih mengantre
      ditempelkan di atas hasilnya, jadi data lokal tidak "ditimpa" data lama.
   API (window.OfflineSync):
     init({rawSet, rawGet, makeRef})  dipanggil dari index.html
     set(ref, value) / get(ref)       pengganti firebaseSet / firebaseGet
     setConnected(bool)               status dari Firebase ".info/connected"
     flush()  state()  isOffline()  pending()
   Event di window: 'offline-sync-state', 'offline-sync-queued',
                    'offline-sync-done', 'offline-sync-dropped'
   ============================================================ */
(function () {
  'use strict';

  var CK = 'fbc1:';              /* cache baca (sama dengan index.html lama) */
  var QK = 'fbq1';               /* antrean tulis */
  var MAX_QUEUE = 300;
  var MAX_ATTEMPTS = 5;          /* batas percobaan untuk error "ditolak server" (izin/login) */
  var WRITE_TIMEOUT = 10000;
  var GET_TIMEOUT = 8000;
  var EPHEMERAL = /^(typing|presence)(\/|$)/;   /* data sesaat: jangan diantrekan */

  var rawSet = null, rawGet = null, makeRef = null;
  var queue = loadQueue();
  var connected = null, seenConnected = false;
  var flushing = false, retryTimer = null, retryStep = 0;

  /* ---------- util ---------- */
  function pathOf(r) {
    return String(r).replace(/^https?:\/\/[^/?#]+\/?/, '').replace(/[?#].*$/, '').replace(/^\/+|\/+$/g, '');
  }
  function clone(v) { return v === undefined ? null : JSON.parse(JSON.stringify(v)); }
  function isObj(v) { return v !== null && typeof v === 'object'; }
  function emit(name, detail) {
    try { window.dispatchEvent(new CustomEvent(name, { detail: detail || {} })); } catch (e) {}
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function loadQueue() {
    try {
      var a = JSON.parse(lsGet(QK) || '[]');
      return Array.isArray(a) ? a.filter(function (o) { return o && typeof o.path === 'string'; }) : [];
    } catch (e) { return []; }
  }
  function saveQueue() {
    /* val undefined tidak ada di JSON; hapus dicatat sebagai null */
    if (!queue.length) { lsDel(QK); return; }
    if (!lsSet(QK, JSON.stringify(queue))) {
      /* penyimpanan penuh: buang cache baca agar antrean (data penting) muat */
      purgeReadCache();
      lsSet(QK, JSON.stringify(queue));
    }
  }
  function purgeReadCache() {
    try {
      var del = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(CK) === 0) del.push(k);
      }
      del.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
  }

  /* ---------- pohon JSON: ambil / pasang nilai di sub-path ---------- */
  function getAt(tree, parts) {
    var cur = tree;
    for (var i = 0; i < parts.length; i++) {
      if (!isObj(cur)) return null;
      cur = cur[parts[i]];
      if (cur === undefined) return null;
    }
    return cur;
  }
  function setAt(tree, parts, val) {
    if (!parts.length) return clone(val);
    var root = isObj(tree) ? tree : {};
    var cur = root;
    for (var i = 0; i < parts.length - 1; i++) {
      if (!isObj(cur[parts[i]])) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    var last = parts[parts.length - 1];
    if (val === null || val === undefined) delete cur[last]; else cur[last] = clone(val);
    return prune(root);
  }
  function prune(node) {            /* Firebase tidak menyimpan objek kosong */
    if (!isObj(node)) return node;
    Object.keys(node).forEach(function (k) {
      if (isObj(node[k])) { node[k] = prune(node[k]); if (node[k] === null) delete node[k]; }
    });
    return Object.keys(node).length ? node : null;
  }

  /* ---------- cache baca ---------- */
  function readCacheVal(path) {
    try { var t = lsGet(CK + path); return t ? JSON.parse(t) : null; } catch (e) { return null; }
  }
  function storeVal(path, v) {
    try {
      if (v === null || v === undefined) { lsDel(CK + path); return; }
      var j = JSON.stringify(v);
      if (j.length < 150000) lsSet(CK + path, j);
    } catch (e) {}
  }
  function snap(v, extra) {
    var s = { exists: function () { return v !== null && v !== undefined; }, val: function () { return clone(v); }, __offline: true };
    if (extra) for (var k in extra) s[k] = extra[k];
    return s;
  }
  function cached(r) { return snap(readCacheVal(pathOf(r))); }

  /* cerminkan sebuah tulis ke semua entri cache yang bersinggungan */
  function applyToCache(path, val) {
    var parts = path ? path.split('/') : [];
    var keys = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(CK) === 0) keys.push(k.slice(CK.length));
      }
    } catch (e) {}
    keys.forEach(function (K) {
      if (K === path) return;
      if (path.indexOf(K + '/') === 0) {                      /* K = induk path */
        var rest = path.slice(K.length + 1).split('/');
        storeVal(K, setAt(readCacheVal(K), rest, val));
      } else if (K.indexOf(path + '/') === 0) {               /* K = anak path */
        storeVal(K, getAt(val, K.slice(path.length + 1).split('/')));
      }
    });
    storeVal(path, val);
  }

  /* tempelkan antrean di atas hasil server untuk path tertentu */
  function overlay(path, serverVal) {
    var v = serverVal, touched = false;
    var parts = path ? path.split('/') : [];
    queue.forEach(function (op) {
      if (op.path === path) { v = clone(op.val); touched = true; }
      else if (path.indexOf(op.path + '/') === 0) {          /* op di induk */
        v = getAt(op.val, parts.slice(op.path.split('/').length)); touched = true;
      } else if (op.path.indexOf(path + '/') === 0) {        /* op di anak */
        v = setAt(clone(v), op.path.slice(path.length + 1).split('/'), op.val); touched = true;
      }
    });
    return { touched: touched, val: v };
  }

  /* ---------- status ---------- */
  function isOffline() {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
    return seenConnected && connected === false;
  }
  function state() {
    return { online: !isOffline(), pending: queue.length, syncing: flushing };
  }
  function announce() { emit('offline-sync-state', state()); }

  function isPermission(err) {
    var s = String((err && (err.code || err.message)) || '').toLowerCase();
    return s.indexOf('permission') > -1 || s.indexOf('denied') > -1 || s.indexOf('unauthorized') > -1;
  }
  function withTimeout(p, ms) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { reject(new Error('timeout')); }, ms);
      p.then(function (v) { clearTimeout(t); resolve(v); }, function (e) { clearTimeout(t); reject(e); });
    });
  }

  /* ---------- antrean ---------- */
  function enqueue(path, val) {
    /* tulis terbaru pada path yang sama / di bawahnya menggantikan yang lama */
    queue = queue.filter(function (o) { return !(o.path === path || o.path.indexOf(path + '/') === 0); });
    queue.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), path: path, val: val === undefined ? null : clone(val), t: Date.now(), n: 0 });
    if (queue.length > MAX_QUEUE) queue = queue.slice(queue.length - MAX_QUEUE);
    saveQueue();
    applyToCache(path, val === undefined ? null : val);
    emit('offline-sync-queued', { path: path, pending: queue.length });
    announce();
    scheduleFlush(isOffline() ? 0 : 800);
  }

  function scheduleFlush(ms) {
    if (retryTimer) clearTimeout(retryTimer);
    if (!queue.length) { retryTimer = null; return; }
    retryTimer = setTimeout(function () { retryTimer = null; flush(); }, ms);
  }

  function ensureAuthReady() {
    return Promise.resolve().then(function () {
      if (typeof window.ensureAuth === 'function') return window.ensureAuth();
    }).then(function () {
      if (window.auth && typeof window.auth.authStateReady === 'function') return window.auth.authStateReady();
    }).catch(function () {});
  }

  function flush() {
    if (flushing || !rawSet || !queue.length) return Promise.resolve(state());
    if (isOffline()) return Promise.resolve(state());
    flushing = true; announce();
    var sent = 0, dropped = 0, stoppedByNetwork = false, blocked = false;

    function next() {
      if (!queue.length) return Promise.resolve();
      var op = queue[0];
      return withTimeout(Promise.resolve(rawSet(makeRef(op.path), op.val)), WRITE_TIMEOUT).then(function () {
        queue = queue.filter(function (o) { return o.id !== op.id; });
        saveQueue(); sent++; announce();
        return next();
      }, function (err) {
        if (isPermission(err)) {
          op.n = (op.n || 0) + 1;
          if (op.n >= MAX_ATTEMPTS) {
            queue = queue.filter(function (o) { return o.id !== op.id; });
            dropped++; emit('offline-sync-dropped', { path: op.path });
          } else {                         /* taruh di belakang, coba lagi nanti (mis. setelah login ulang) */
            queue = queue.filter(function (o) { return o.id !== op.id; }); queue.push(op);
            blocked = true; emit('offline-sync-blocked', { path: op.path });
            if (queue.every(function (o) { return (o.n || 0) > 0; })) { stoppedByNetwork = true; saveQueue(); return; }
          }
          saveQueue(); announce();
          return next();
        }
        stoppedByNetwork = true;           /* jaringan/timeout: berhenti, coba lagi nanti */
      });
    }

    return ensureAuthReady().then(next).then(function () {
      flushing = false;
      if (stoppedByNetwork && queue.length) {
        retryStep = blocked ? 4 : Math.min(retryStep + 1, 3);
        scheduleFlush([5000, 15000, 30000, 60000, 120000][retryStep]);
      } else { retryStep = 0; }
      announce();
      if (sent || dropped) emit('offline-sync-done', { sent: sent, dropped: dropped, pending: queue.length });
      return state();
    });
  }

  /* ---------- API tulis / baca ---------- */
  function write(ref, val) {
    var path = pathOf(ref);
    if (val === undefined) val = null;
    if (EPHEMERAL.test(path)) {                       /* typing / presence */
      return isOffline() ? Promise.resolve() : rawSet(ref, val);
    }
    if (isOffline() || queue.length) {                /* antre agar urutan tulis tetap benar */
      enqueue(path, val);
      return Promise.resolve();
    }
    return withTimeout(Promise.resolve(rawSet(ref, val)), WRITE_TIMEOUT).catch(function (err) {
      if (isPermission(err)) throw err;               /* error sungguhan: tampilkan ke pengguna */
      enqueue(path, val);                             /* jaringan lemot/putus: simpan & kirim nanti */
    });
  }

  function read(ref) {
    var path = pathOf(ref);
    if (isOffline()) {
      var c = readCacheVal(path);
      var o = overlay(path, c);
      return Promise.resolve(snap(o.touched ? o.val : c, { __pending: o.touched }));
    }
    return withTimeout(Promise.resolve(rawGet(ref)), GET_TIMEOUT).then(function (s) {
      var sv = null;
      try { sv = s.exists() ? s.val() : null; } catch (e) {}
      var o = overlay(path, sv);
      if (o.touched) { storeVal(path, o.val); return snap(o.val, { __pending: true }); }
      storeVal(path, sv);
      return s;
    }).catch(function (err) {
      var c2 = readCacheVal(path);
      if (c2 !== null) return snap(c2);
      throw err;
    });
  }

  function setConnected(v) {
    var was = isOffline();
    connected = !!v;
    if (v) seenConnected = true;
    announce();
    if (connected && queue.length) scheduleFlush(400);
    if (was !== isOffline()) emit('offline-sync-connection', { online: !isOffline() });
  }

  /* navigator.onLine bukan penentu tunggal, tapi cukup untuk memicu percobaan kirim */
  window.addEventListener('online', function () { announce(); scheduleFlush(600); });
  window.addEventListener('offline', function () { announce(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && queue.length) scheduleFlush(300); });
  window.addEventListener('firebase-auth-ready', function () { if (queue.length) scheduleFlush(800); });
  setInterval(function () { if (queue.length && !flushing && !isOffline()) flush(); }, 20000);

  window.OfflineSync = {
    init: function (o) {
      rawSet = o.rawSet; rawGet = o.rawGet; makeRef = o.makeRef;
      announce();
      if (queue.length) scheduleFlush(1500);     /* sisa antrean dari sesi sebelumnya */
    },
    set: write,
    get: read,
    cached: cached,
    setConnected: setConnected,
    flush: flush,
    state: state,
    isOffline: isOffline,
    pending: function () { return queue.length; },
    /* untuk pengujian */
    _queue: function () { return queue.slice(); },
    _pathOf: pathOf
  };
})();
