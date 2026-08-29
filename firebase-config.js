/* ============================================================
   FIREBASE CONFIG & DATA LAYER — JHT KAS Adm PRG
   Menggantikan localStorage sebagai sumber data agar semua
   orang (tamu & admin), di HP/browser manapun, melihat data
   yang sama secara real-time.

   Cara pakai: file ini di-load SEBELUM script.js (lihat index.html).
   Semua fungsi diekspos lewat window.FJHT.
============================================================ */

// Konfigurasi proyek Firebase (dari Firebase Console punya kamu)
const firebaseConfig = {
  apiKey: "AIzaSyCV04Nk2tG-Inmn1Fj8ricgw3Kzc3pgFyo",
  authDomain: "kasjht.firebaseapp.com",
  projectId: "kasjht",
  storageBucket: "kasjht.firebasestorage.app",
  messagingSenderId: "343785979339",
  appId: "1:343785979339:web:aa26685e9831f3c0e9ca4e"
};

firebase.initializeApp(firebaseConfig);
const _db = firebase.firestore();
const _auth = firebase.auth();

// Aktifkan cache offline (opsional tapi enak: app tetap kebaca meski koneksi putus2)
_db.enablePersistence({ synchronizeTabs: true }).catch(()=>{ /* aman diabaikan, mis. banyak tab / browser lama */ });

/* ------------------------------------------------------------
   MODEL PENYIMPANAN
   Karena app ini selalu menulis ULANG seluruh array (members/tx/
   requests) setiap kali ada perubahan (bukan per-baris), data
   disimpan sebagai SATU dokumen per koleksi di:
     kas/members   -> { list: [...] }
     kas/transaksi -> { list: [...] }
     kas/requests  -> { list: [...] }
   Ini paling cocok dengan struktur kode yang sudah ada dan
   paling murah (1 read/write per sinkronisasi, bukan N).
------------------------------------------------------------ */
const DOC_MEMBERS  = _db.collection("kas").doc("members");
const DOC_TX        = _db.collection("kas").doc("transaksi");
const DOC_REQUESTS  = _db.collection("kas").doc("requests");
const DOC_ARISAN    = _db.collection("kas").doc("arisan");

function _adminEmail(username){
  // Username "admin" pada form login dipetakan ke email Firebase Auth ini.
  // Login utama saat ini: benyoriki@gmail.com (buat user ini di Firebase
  // Console -> Authentication -> Add user, dengan password yang sama).
  const MAP = { admin: "benyoriki@gmail.com" };
  if (MAP[username]) return MAP[username];
  return username.includes("@") ? username : null;
}

const FJHT = {
  auth: _auth,

  /** Ambil data awal (sekali saja, untuk boot pertama kali). */
  async loadAll(){
    const [mSnap, tSnap, rSnap, arSnap] = await Promise.all([
      DOC_MEMBERS.get(), DOC_TX.get(), DOC_REQUESTS.get(), DOC_ARISAN.get()
    ]);
    return {
      members: mSnap.exists ? (mSnap.data().list || null) : null,
      tx: tSnap.exists ? (tSnap.data().list || null) : null,
      requests: rSnap.exists ? (rSnap.data().list || null) : null,
      arisan: arSnap.exists ? (arSnap.data().list || null) : null,
    };
  },

  /** Isi Firestore dengan data awal HANYA jika koleksi masih kosong. */
  async migrateSeedIfEmpty(seedMembers, seedTx, seedRequests, seedArisan){
    const current = await this.loadAll();
    const tasks = [];
    if(!current.members) tasks.push(DOC_MEMBERS.set({ list: seedMembers }));
    if(!current.tx) tasks.push(DOC_TX.set({ list: seedTx }));
    if(!current.requests) tasks.push(DOC_REQUESTS.set({ list: seedRequests }));
    if(!current.arisan) tasks.push(DOC_ARISAN.set({ list: seedArisan || [] }));
    if(tasks.length) await Promise.all(tasks);
    return {
      members: current.members || seedMembers,
      tx: current.tx || seedTx,
      requests: current.requests || seedRequests,
      arisan: current.arisan || (seedArisan || []),
    };
  },

  saveMembers(list){ return DOC_MEMBERS.set({ list }); },
  saveTx(list){ return DOC_TX.set({ list }); },
  saveRequests(list){ return DOC_REQUESTS.set({ list }); },
  saveArisan(list){ return DOC_ARISAN.set({ list }); },

  /** Dengarkan perubahan real-time (dari perangkat lain) dan panggil onChange({members,tx,requests,arisan}). */
  subscribe(onChange){
    const cache = { members: null, tx: null, requests: null, arisan: null };
    const fire = ()=>{ if(cache.members && cache.tx && cache.requests && cache.arisan) onChange({ ...cache }); };
    DOC_MEMBERS.onSnapshot(s=>{ if(s.exists){ cache.members = s.data().list || []; fire(); } });
    DOC_TX.onSnapshot(s=>{ if(s.exists){ cache.tx = s.data().list || []; fire(); } });
    DOC_REQUESTS.onSnapshot(s=>{ if(s.exists){ cache.requests = s.data().list || []; fire(); } });
    DOC_ARISAN.onSnapshot(s=>{ if(s.exists){ cache.arisan = s.data().list || []; fire(); } });
  },

  /** Login admin: username "admin" dipetakan ke email Firebase Auth. */
  async signInAdmin(username, password){
    const email = _adminEmail(username.trim());
    if(!email) throw new Error("Username tidak dikenali");
    await _auth.signInWithEmailAndPassword(email, password);
  },
  signOutAdmin(){ return _auth.signOut(); },
  isAdmin(){ return !!_auth.currentUser; },
  /** Tunggu Firebase Auth selesai memuat status login (penting saat refresh halaman). */
  waitForAuthReady(){
    return new Promise(resolve=>{
      const unsub = _auth.onAuthStateChanged(user=>{ unsub(); resolve(user); });
    });
  },
};

window.FJHT = FJHT;
