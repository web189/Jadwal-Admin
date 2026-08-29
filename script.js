/* ============================================================
   JHT KAS Adm PRG — Aplikasi Buku Kas Admin Gudang
   Penyimpanan: Firebase Firestore (real-time, lintas perangkat).
   Login admin: Firebase Authentication.
   Lihat firebase-config.js untuk konfigurasi & lapisan data.
============================================================ */

/* ---------------- KONSTANTA & WARNA ANGGOTA ---------------- */
const MEMBER_COLORS = {
  KARTIKA:  "#6B7280",
  RIKI:     "#3B82F6",
  KAMIL:    "#E4574C",
  DAUD:     "#7A2E2E",
  RANDHIKA: "#2E8B57",
  BUDI:     "#8B5FBF",
  TAHIR:    "#14919B",
  RIAN:     "#F0A93A",
};
const COLOR_CHOICES = ["#3B82F6","#E4574C","#7A2E2E","#2E8B57","#8B5FBF","#14919B","#F0A93A","#6B7280","#D9534F","#0EA5A5"];
const RIBA_COLOR = "#9CA3AF";

/* ---------------- SEED DATA ANGGOTA ---------------- */
const SEED_MEMBERS = [
  { id:"KARTIKA",  nama:"Kartika",  color:MEMBER_COLORS.KARTIKA,  status:"off",    sejak:"2025-09-11", offSejak:"2025-10-09", catatan:"Nonaktif — terakhir tercatat kasbon Jul 2026" },
  { id:"RIKI",     nama:"Riki",     color:MEMBER_COLORS.RIKI,     status:"active", sejak:"2025-09-11" },
  { id:"KAMIL",    nama:"Kamil",    color:MEMBER_COLORS.KAMIL,    status:"active", sejak:"2025-09-14" },
  { id:"DAUD",     nama:"Daud",     color:MEMBER_COLORS.DAUD,     status:"active", sejak:"2025-09-15" },
  { id:"RANDHIKA", nama:"Randhika", color:MEMBER_COLORS.RANDHIKA, status:"active", sejak:"2025-09-16" },
  { id:"BUDI",     nama:"Budi",     color:MEMBER_COLORS.BUDI,     status:"active", sejak:"2025-11-20" },
  { id:"TAHIR",    nama:"Tahir",    color:MEMBER_COLORS.TAHIR,    status:"active", sejak:"2025-10-02" },
  { id:"RIAN",      nama:"Rian",      color:MEMBER_COLORS.RIAN, status:"active", sejak:"2026-08-27" },
  // "Uang Riba" bukan anggota manusia — ini pos kas hasil bunga/riba yang sejak awal
  // sudah tercatat rutin di RAW_TX (kas masuk tiap tgl 5) & RAW_ASET (Kasur Palembang).
  // Dijadikan anggota resmi (id sama persis dgn yg dipakai di RAW_TX/RAW_ASET) supaya
  // otomatis muncul di Anggota & Peringkat Setoran dgn kas masuk/keluar/aset/saldo-nya.
  { id:"UANG RIBA", nama:"Uang Riba", color:RIBA_COLOR, status:"active", sejak:"2025-11-05" },
];

/* ---------------- SEED DATA TRANSAKSI ----------------
   format tuple: [tanggalISO, admin, shift|null, btb(masuk), bkb(keluar), keterangan]
------------------------------------------------------------ */
const RAW_TX = [
["2025-09-11","KARTIKA","Shift 1",10000,0,"4 Box Pulpen Biru"],
["2025-09-11","RIKI","Shift 1",10000,0,"4 Box Pulpen Belang"],
["2025-09-14","KARTIKA","Shift 1",5000,0,"Sapu + kain pel + tempat sampah"],
["2025-09-14","RIKI","Shift 1",5000,0,"Kantong plastik paket PO"],
["2025-09-14","KAMIL","Shift 2",20000,0,"Staples Niceso"],
["2025-09-14","RIKI","Shift 2",20000,0,"Plastik paket PO + lakban"],
["2025-09-15","DAUD","Shift 3",20000,0,"Karet gelang + tip x"],
["2025-09-15","KARTIKA","Shift 1",5000,0,"Colokan listrik"],
["2025-09-15","RIKI","Shift 1",5000,0,""],
["2025-09-16","KARTIKA","Shift 1",2500,0,""],
["2025-09-16","RANDHIKA","Shift 1",2500,0,""],
["2025-09-18","KARTIKA","Shift 1",5000,0,""],
["2025-09-18","RIKI","Shift 1",5000,0,""],
["2025-09-19","DAUD","Shift 3",5000,0,""],
["2025-09-19","RANDHIKA","Shift 1",5000,0,""],
["2025-09-19","KARTIKA","Shift 1",5000,0,""],
["2025-09-20","RANDHIKA","Shift 1",2500,0,""],
["2025-09-20","KARTIKA","Shift 1",2500,0,""],
["2025-09-22","RANDHIKA","Shift 1",5000,0,""],
["2025-09-22","KARTIKA","Shift 1",5000,0,""],
["2025-09-26","KARTIKA","Shift 1",5000,0,""],
["2025-09-26","KAMIL","Shift 1",5000,0,""],
["2025-09-29","KARTIKA","Shift 1",5000,0,""],
["2025-09-29","KAMIL","Shift 1",5000,0,""],
["2025-09-29","RIKI","Shift 2",2500,0,""],
["2025-09-29","DAUD","Shift 2",2500,0,""],
["2025-09-30","KARTIKA","Shift 1",7500,0,""],
["2025-09-30","KAMIL","Shift 1",7500,0,""],
["2025-09-30","RIKI","Shift 2",2000,0,""],
["2025-09-30","DAUD","Shift 2",2000,0,""],
["2025-10-01","RIKI","Shift 2",1000,0,""],
["2025-10-01","DAUD","Shift 2",1000,0,""],
["2025-10-02","TAHIR","Shift 1",7500,0,""],
["2025-10-02","KARTIKA","Shift 1",7500,0,""],
["2025-10-03","RIKI","Shift 2",5000,0,""],
["2025-10-05","DAUD","Shift 2",2000,0,""],
["2025-10-09","KARTIKA","Shift 1",2500,0,""],
["2025-10-09","DAUD","Shift 1",2500,0,""],
["2025-10-27","DAUD","Shift 2",5000,0,""],
["2025-10-29","DAUD","Shift 2",5000,0,""],
["2025-11-05","RANDHIKA","Shift 1",2500,0,""],
["2025-11-05","TAHIR","Shift 1",2500,0,""],
["2025-11-05","UANG RIBA",null,10000,0,""],
["2025-11-20","RIKI","Shift 1",2500,0,""],
["2025-11-20","BUDI","Shift 1",2500,0,""],
["2025-11-21","RIKI","Shift 1",2500,0,""],
["2025-11-21","BUDI","Shift 1",2500,0,""],
["2025-11-22","RIKI","Shift 1",2500,0,""],
["2025-11-22","BUDI","Shift 1",2500,0,""],
["2025-11-23","RIKI","Shift 1",2500,0,""],
["2025-11-23","BUDI","Shift 1",2500,0,""],
["2025-11-24","RIKI","Shift 1",2500,0,""],
["2025-11-24","BUDI","Shift 1",2500,0,""],
["2025-11-25","RIKI","Shift 1",2500,0,""],
["2025-11-25","DAUD","Shift 1",2500,0,""],
["2025-12-05","UANG RIBA",null,10000,0,""],
["2025-12-18","RIKI",null,0,10000,"Patungan kado nikah (dari saldo kas masing2)"],
["2025-12-18","TAHIR",null,0,10000,"Patungan kado nikah (dari saldo kas masing2)"],
["2025-12-18","KAMIL",null,0,10000,"Patungan kado nikah (dari saldo kas masing2)"],
["2025-12-18","RANDHIKA",null,0,10000,"Patungan kado nikah (dari saldo kas masing2)"],
["2025-12-18","DAUD",null,0,10000,"Patungan kado nikah (dari saldo kas masing2)"],
["2025-12-18","BUDI",null,0,10000,"Patungan kado nikah (dari saldo kas masing2)"],
["2025-12-27","RIKI","Shift 1",5000,0,""],
["2025-12-27","BUDI","Shift 1",5000,0,""],
["2026-01-05","UANG RIBA",null,20000,0,"Setoran uang riba"],
["2026-01-19","BUDI","Shift 3",18000,0,""],
["2026-01-21","BUDI","Shift 3",25000,0,""],
["2026-01-24","DAUD","Shift 1",2500,0,""],
["2026-01-24","TAHIR","Shift 1",2500,0,""],
["2026-02-05","UANG RIBA",null,10000,0,""],
["2026-02-06","RIKI","Shift 1",2500,0,""],
["2026-02-06","KAMIL","Shift 1",2500,0,""],
["2026-02-11","DAUD","Shift 3",5000,0,""],
["2026-02-12","DAUD","Shift 3",5000,0,""],
["2025-02-20","BUDI","Shift 1",20000,0,""],
["2025-02-20","DAUD","Shift 2",5000,0,""],
["2026-02-23","BUDI","Shift 1",10000,0,""],
["2026-03-25","BUDI","Shift 1",9000,0,""],
["2026-03-05","UANG RIBA",null,10000,0,""],
["2026-03-07","DAUD","Shift 1",2500,0,""],
["2026-03-07","TAHIR","Shift 1",2500,0,""],
["2026-03-11","BUDI",null,0,80000,"Isi steples + bantal"],
["2026-03-30","DAUD",null,0,35000,"Colokan listrik"],
["2026-05-14","RANDHIKA","Shift 1",5000,0,""],
["2026-05-15","RANDHIKA","Shift 1",5000,0,""],
["2026-05-16","RANDHIKA","Shift 1",5000,0,""],
["2026-05-21","BUDI","Shift 3",30000,0,""],
["2026-05-23","TAHIR","Shift 1",5000,0,""],
["2026-06-16","BUDI","Shift 1",5000,0,""],
["2026-06-16","KAMIL","Shift 1",5000,0,""],
["2026-06-23","BUDI",null,0,30000,"Mouse pad"],
["2026-06-29","RIKI",null,0,10000,"Pulpen 6 box"],
["2026-06-29","TAHIR",null,0,10000,"Pulpen 6 box"],
["2026-06-29","RANDHIKA",null,0,10000,"Pulpen 6 box"],
["2026-06-29","BUDI",null,0,10000,"Pulpen 6 box"],
["2026-06-29","KAMIL",null,0,10000,"Pulpen 6 box"],
["2026-06-29","DAUD",null,0,10000,"Pulpen 6 box"],
["2026-06-30","RIKI","Shift 1",7500,0,""],
["2026-06-30","BUDI","Shift 1",7500,0,""],
["2026-07-01","RIKI","Shift 1",5000,0,""],
["2026-07-01","BUDI","Shift 1",5000,0,""],
["2026-07-05","KARTIKA",null,0,67500,"Kasbon 150k"],
["2026-07-11","KAMIL",null,0,10000,"Kipas CPU 2pcs"],
["2026-07-11","RANDHIKA",null,0,10000,"Kipas CPU 2pcs"],
["2026-07-11","RIKI",null,0,10000,"Kipas CPU 2pcs"],
["2026-07-11","BUDI",null,0,10000,"Kipas CPU 2pcs"],
["2026-07-11","DAUD",null,0,10000,"Kipas CPU 2pcs"],
["2026-07-11","UANG RIBA",null,0,50000,"Kasur Palembang"],
["2026-07-11","KAMIL",null,0,10000,"Kunci gembok 2pcs"],
["2026-07-12","KAMIL","Shift 2",10000,0,""],
["2026-07-13","BUDI","Shift 2",24000,0,""],
["2026-07-20","KAMIL","Shift 1",3500,0,""],
["2026-07-20","BUDI","Shift 1",3500,0,""],
["2026-07-30","BUDI","Shift 1",10000,0,""],
["2026-07-31","BUDI","Shift 1",5000,0,""],
["2026-08-01","RIKI",null,0,6400,"Plastik ripack tisu"],
["2026-08-01","BUDI",null,0,6400,"Plastik ripack tisu"],
["2026-08-01","DAUD",null,0,6400,"Plastik ripack tisu"],
["2026-08-01","KAMIL",null,0,6400,"Plastik ripack tisu"],
["2026-08-01","RANDHIKA",null,0,6400,"Plastik ripack tisu"],
["2026-08-01","BUDI","Shift 1",10000,0,""],
["2026-08-06","RANDHIKA","Shift 3",10000,0,""],
["2026-08-18","BUDI","Shift 2",25000,0,""],
["2026-08-20","BUDI","Shift 2",8000,0,""],
["2026-08-20","BUDI","Shift 2",8000,0,""],
["2026-08-25","RIKI","Shift 2",7500,0,""],
["2026-08-25","BUDI","Shift 2",7500,0,""],
];

function buildSeedTransactions(){
  return RAW_TX.map((r,i)=>{
    const [tgl, admin, shift, btb, bkb, ket] = r;
    // Logika: KAS MASUK (btb) vs KAS KELUAR (bkb) — belanja barang, kasbon, uang riba, dll.
    const kat = bkb > 0 ? "pinjaman" : "kas";
    return { id:"tx"+(i+1), tgl, admin, shift: shift || "Non Shift", btb, bkb, ket, kat };
  });
}

/* ---------------- STORAGE ---------------- */
// Data (members/transaksi/requests) & sesi admin sekarang berasal dari Firebase
// (Firestore + Authentication) — lihat firebase-config.js. LS_KEYS tersisa cuma
// untuk preferensi tampilan lokal (tema), yang memang wajar per-perangkat.
const LS_KEYS = { theme:"jht_theme" };

function titleCaseName(id){
  if(!id) return id;
  if(id === "UANG RIBA") return "Uang Riba";
  return id.charAt(0) + id.slice(1).toLowerCase();
}
/* ---------------- SEED DATA: ASET BARANG/JASA MILIK PRIBADI ADMIN ----------------
   Diambil LANGSUNG dari tabel "Aset Barang/Jasa Milik Pribadi Admin" di dokumen
   Riki — bukan hasil turunan dari RAW_TX — supaya SEMUA baris ikut masuk tanpa
   kecuali, termasuk barang Rp0 (sumbangan pribadi tanpa ganti kas) dan Kasbon.
   format tuple: [tanggalISO, admins[], mode('solo'|'patungan'), nominalTotal, keterangan, jenis('barang'|'jasa')]
------------------------------------------------------------------------------- */
const RAW_ASET = [
  ["2025-09-11",["RIKI"],"solo",0,"4Box Pulpel Biru","barang"],
  ["2025-09-11",["RIKI"],"solo",0,"4Box Pulpen Belang","barang"],
  ["2025-09-14",["RIKI"],"solo",0,"Sapu, Kain pel, Tempat sampah","barang"],
  ["2025-09-14",["RIKI"],"solo",0,"Kanton plastik Paket PO","barang"],
  ["2025-09-14",["RIKI"],"solo",0,"Staples Niceso","barang"],
  ["2025-09-14",["RIKI"],"solo",0,"Plastik Paket+Lakban","barang"],
  ["2025-09-15",["RIKI"],"solo",0,"Karet Gelang+Tip X","barang"],
  ["2025-09-15",["RIKI"],"solo",0,"Colokan Listrik","barang"],
  ["2025-12-18",["RIKI","TAHIR","KAMIL","RANDHIKA","DAUD","BUDI"],"patungan",60000,"Kado Teten Kawin","barang"],
  ["2026-03-11",["BUDI"],"solo",80000,"Isi Steples + Bantal","barang"],
  ["2026-03-30",["DAUD"],"solo",35000,"Colokan Listrik","barang"],
  ["2026-06-23",["BUDI"],"solo",30000,"Mouse Pad","barang"],
  ["2026-06-29",["RIKI","TAHIR","RANDHIKA","BUDI","KAMIL","DAUD"],"patungan",60000,"Pulpen 6 Box","barang"],
  ["2026-07-05",["KARTIKA"],"solo",67500,"Kasbon 150k","jasa"],
  ["2026-07-11",["KAMIL","RANDHIKA","RIKI","BUDI","DAUD"],"patungan",50000,"Kipas CPU 2pcs","barang"],
  ["2026-07-11",["UANG RIBA"],"solo",50000,"Kasur Palembang","barang"],
  ["2026-07-11",["KAMIL"],"solo",10000,"Kunci Gembok 2pcs","barang"],
  ["2026-08-01",["RIKI","BUDI","DAUD","KAMIL","RANDHIKA"],"patungan",32000,"Plastik Ripack Tisu","barang"],
];
function buildSeedRequestsFromAset(rawAset){
  return rawAset.map((r,i)=>{
    const [tgl, admins, mode, nominal, ket, jenis] = r;
    return {
      id:"req_seed"+(i+1), tgl, keterangan:ket, nominal, mode,
      admins:[...admins], pemohon:titleCaseName(admins[0]),
      status:"approved", decidedAt:tgl, jenis: jenis||"barang",
    };
  });
}
const SEED_REQUESTS = buildSeedRequestsFromAset(RAW_ASET);

/* ---------------- SEED DATA: ARISAN TANTEH SUSI ----------------
   Contoh batch pendaftaran arisan bulanan. Kocokan pertama tgl 05 Oktober 2026,
   iuran Rp150.000/orang, kuota 5 slot — persis skenario contoh dari admin.
------------------------------------------------------------------ */
const SEED_ARISAN = [
  {
    id: "arisan_seed1",
    nama: "Arisan Tanteh Susi — Batch Oktober 2026",
    biaya: 150000,
    kuota: 5,
    tglMulai: "2026-10-05",
    status: "pendaftaran",
    currentRound: 0,
    createdAt: "2026-08-20",
    members: [
      { id:"am1", nama:"Riki", hp:"", status:"approved", daftarAt:"2026-08-20", sudahMenang:false, menangRound:null, menangTgl:null },
      { id:"am2", nama:"Budiansyah", hp:"", status:"approved", daftarAt:"2026-08-21", sudahMenang:false, menangRound:null, menangTgl:null },
      { id:"am3", nama:"Daud", hp:"", status:"approved", daftarAt:"2026-08-24", sudahMenang:false, menangRound:null, menangTgl:null },
      { id:"am4", nama:"Rian", hp:"", status:"pending", daftarAt:"2026-08-27", sudahMenang:false, menangRound:null, menangTgl:null },
    ],
    drawHistory: [],
  },
];


/** Simpan ke Firestore. DB lokal sudah dimutasi duluan oleh pemanggil (pola lama
 *  dipertahankan), fungsi ini cuma mendorong array terbaru ke server. */
function saveMembers(m){ FJHT.saveMembers(m).catch(err=>toast("Gagal menyimpan anggota: "+err.message)); }
function saveTx(t){ FJHT.saveTx(t).catch(err=>toast("Gagal menyimpan transaksi: "+err.message)); }
function saveRequests(r){ FJHT.saveRequests(r).catch(err=>toast("Gagal menyimpan pengajuan: "+err.message)); }
function saveArisan(a){ FJHT.saveArisan(a).catch(err=>toast("Gagal menyimpan data arisan: "+err.message)); }
function isAuthed(){ return FJHT.isAdmin(); }

let DB = { members: [], tx: [], requests: [], arisan: [] };
let DB_READY = false;

/** Boot: tunggu status login Firebase Auth siap, ambil data dari Firestore
 *  (seed otomatis kalau koleksi masih kosong), lalu render pertama kali.
 *  Sesudahnya, langganan real-time menjaga semua perangkat tetap sinkron. */
async function bootFromFirebase(){
  try{
    await FJHT.waitForAuthReady();
    const seeded = await FJHT.migrateSeedIfEmpty(
      SEED_MEMBERS,
      buildSeedTransactions(),
      SEED_REQUESTS.map(r=>({...r})),
      SEED_ARISAN.map(a=>({...a, members:a.members.map(x=>({...x})), drawHistory:a.drawHistory.map(x=>({...x}))}))
    );
    DB = seeded;
    if(!DB.arisan) DB.arisan = [];

    // Firestore cuma di-seed SEKALI waktu koleksinya masih kosong (lihat
    // migrateSeedIfEmpty). Supaya anggota/transaksi/aset BARU yang ditambahkan
    // lewat update kode nanti tetap ikut nongol di app yang datanya sudah lebih
    // dulu terisi — tanpa menimpa/menghapus data yang sudah diedit lewat
    // aplikasi — gabungkan apa saja dari seed kode yang belum ada di Firestore.
    //
    // PENTING — dicocokkan berdasarkan ISI (signature), BUKAN id:
    // Baris baru di RAW_TX / RAW_ASET seringkali disisipkan DI TENGAH array
    // (bukan selalu di akhir), sedangkan id lama untuk transaksi/pengajuan
    // dibangkitkan dari POSISI ("tx"+index, "req_seed"+index). Begitu ada
    // sisipan di tengah, semua id sesudahnya ikut bergeser, sehingga baris yang
    // sebelumnya sudah tersimpan di Firestore dengan id lama akan "bentrok" id
    // dengan baris seed yang isinya BEDA di posisi yang sama — akibatnya
    // pengecekan "sudah ada apa belum" berdasarkan id jadi salah: baris baru
    // (mis. entri "Uang Riba") dianggap sudah ada padahal isinya belum pernah
    // tersimpan. Untuk anggota, id memang bermakna (KARTIKA, RIKI, dst) jadi
    // tetap dicocokkan lewat id; untuk transaksi & pengajuan dicocokkan lewat
    // signature isi baris supaya kebal terhadap pergeseran posisi.
    const txSignature  = t => [t.tgl, t.admin, t.shift||"", t.btb, t.bkb, t.ket||""].join("|");
    const reqSignature = r => [r.tgl, (r.admins||[]).join(","), r.mode, r.nominal, r.keterangan||"", r.jenis||""].join("|");
    const mergeMissing = (live, seed, sigFn) => {
      const liveSigs = new Set(live.map(sigFn));
      const existingIds = new Set(live.map(x=>x.id));
      const missing = [];
      seed.forEach(s=>{
        if(liveSigs.has(sigFn(s))) return; // isinya sudah ada, lewati
        let id = s.id, n = 2;
        while(existingIds.has(id)){ id = `${s.id}_${n++}`; } // hindari id bentrok saat ditambahkan
        existingIds.add(id);
        missing.push({ ...s, id });
      });
      return { merged: missing.length ? [...live, ...missing] : live, changed: missing.length>0 };
    };
    const mMembers = mergeMissing(DB.members, SEED_MEMBERS, m=>m.id);
    const mTx      = mergeMissing(DB.tx, buildSeedTransactions(), txSignature);
    const mReq     = mergeMissing(DB.requests, SEED_REQUESTS, reqSignature);
    if(mMembers.changed) DB.members = mMembers.merged;
    if(mTx.changed) DB.tx = mTx.merged;
    if(mReq.changed) DB.requests = mReq.merged;
    // Menulis hasil merge ke Firestore butuh login admin (lihat firestore.rules:
    // update/delete pada kas/members & kas/transaksi wajib isAdmin()). Kalau yang
    // membuka app adalah tamu (belum login), JANGAN coba menulis — cukup tampilkan
    // data gabungan itu secara lokal. Begitu ada admin yang login, hasil merge yang
    // sama akan otomatis ikut tersimpan ke server. Ini mencegah error
    // "Missing or insufficient permissions" muncul untuk tamu biasa.
    if(isAuthed()){
      try{
        if(mMembers.changed) await FJHT.saveMembers(DB.members);
        if(mTx.changed) await FJHT.saveTx(DB.tx);
        if(mReq.changed) await FJHT.saveRequests(DB.requests);
      }catch(err){
        console.warn("Gagal menyimpan hasil merge seed:", err);
      }
    }

    DB_READY = true;
    render();
    FJHT.subscribe(data=>{
      DB = data;
      render();
    });
  }catch(err){
    DB_READY = true;
    document.getElementById("app").innerHTML =
      `<div style="padding:32px;text-align:center;">
         <p><b>Gagal terhubung ke database.</b></p>
         <p style="opacity:.7;font-size:13px;">${(err && err.message) || err}</p>
       </div>`;
  }
}

/* ---------------- STATE APLIKASI ---------------- */
const state = {
  route: location.hash.replace("#","") || "/",
  guestTxFilter: "all",  // all | masuk | keluar
  adminSection: "dashboard",
  filterText: "",
  filterAdmin: "",
  filterMonth: "",
  adminTxFilter: "all",  // all | masuk | keluar
  viewRows: 5,           // 5 | 15 | 'all'
  visibleRows: 10,
  editingTxId: null,
  editingMemberId: null,
  mobileMenuOpen: false,
  guestFilterOpen: false, // panel filter tabel transaksi (tampilan tamu) — tersembunyi secara default
  moneyRevealed: false,   // samarkan (blur) semua nominal uang di tampilan tamu sampai user klik "Tampilkan Semua Nominal"
  // draft form "Pengajuan Pembelian" — dipertahankan lintas re-render
  pengajuan: { mode:"solo", soloAdmin:"", patunganSet:null, ket:"", nominal:"", pemohon:"", editingReqId:null },
  // draft form pendaftaran arisan (tampilan tamu)
  arisanReg: { nama:"", hp:"" },
};

/* ---------------- UTIL ---------------- */
function rupiah(n){
  n = Number(n)||0;
  return "Rp" + n.toLocaleString("id-ID");
}
/** Versi tersamar dari rupiah(): setiap digit diganti "x" (pemisah ribuan &
 *  tanda minus tetap tampil apa adanya), supaya panjang "xxxxx" mengikuti
 *  jumlah digit nominal aslinya — bukan cuma diblur seragam. */
function maskedRupiah(n){ return rupiah(n).replace(/[0-9]/g, "x"); }
/** Render dua versi (asli & tersamar) sekaligus dalam span terpisah; CSS
 *  (.money-blur) yang memutuskan mana yang terlihat berdasarkan status
 *  reveal, tanpa perlu ubah logika class di tiap tempat pemanggilan. */
function moneyDual(n, prefix){
  prefix = prefix || "";
  return `<span class="money-real">${prefix}${rupiah(n)}</span><span class="money-masked">${prefix}${maskedRupiah(n)}</span>`;
}
function fmtDate(iso){
  const d = new Date(iso+"T00:00:00");
  return d.toLocaleDateString("id-ID",{weekday:"long", day:"2-digit", month:"long", year:"numeric"});
}
function fmtDateShort(iso){
  const d = new Date(iso+"T00:00:00");
  return d.toLocaleDateString("id-ID",{day:"2-digit", month:"short", year:"numeric"});
}
function fmtMonthKey(iso){ return iso.slice(0,7); }
function monthLabel(key){
  const [y,m] = key.split("-");
  const names = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return names[parseInt(m,10)-1] + " " + y.slice(2);
}
function memberById(id){ return DB.members.find(m=>m.id===id); }
function colorOf(adminId){
  if(adminId === "UANG RIBA") return RIBA_COLOR;
  const m = memberById(adminId);
  return m ? m.color : "#999";
}
function nameOf(adminId){
  if(adminId === "UANG RIBA") return "Uang Riba";
  const m = memberById(adminId);
  return m ? m.nama : adminId;
}
function uid(prefix){ return prefix + Math.random().toString(36).slice(2,9); }
// Dicek lewat JS (bukan cuma CSS media-query) supaya tombol ekspor pasti
// tidak muncul dobel di HP, apapun engine preview yang dipakai.
function isDesktopWidth(){ return window.innerWidth > 760; }
function initials(name){
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if(words.length>=2) return (words[0][0]+words[1][0]).toUpperCase();
  const w = words[0]||"";
  if(w.length>=2) return (w[0]+w[w.length-1]).toUpperCase(); // huruf awal+akhir -> lebih unik antar nama
  return w.toUpperCase();
}
function shadeColor(hex, percent){
  hex = String(hex).replace('#','');
  if(hex.length===3) hex = hex.split('').map(c=>c+c).join('');
  const num = parseInt(hex,16);
  let r = (num>>16)+percent, g=((num>>8)&0x00FF)+percent, b=(num&0x0000FF)+percent;
  r = Math.max(Math.min(255,r),0); g=Math.max(Math.min(255,g),0); b=Math.max(Math.min(255,b),0);
  return "#"+(0x1000000+r*0x10000+g*0x100+Math.round(b)).toString(16).slice(1);
}
function avatarBg(color){
  return `linear-gradient(135deg, ${color} 0%, ${shadeColor(color,-32)} 100%)`;
}
function avatarHtml(adminId, size){
  const cls = size==="sm" ? "avatar sm" : "avatar";
  return `<span class="${cls}" style="background:${avatarBg(colorOf(adminId))}">${initials(nameOf(adminId))}</span>`;
}
function escapeHtml(s){ return String(s??"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function totals(list){
  const masuk = list.reduce((s,t)=>s+Number(t.btb||0),0);
  const keluar = list.reduce((s,t)=>s+Number(t.bkb||0),0);
  return { masuk, keluar, saldo: masuk - keluar };
}
/* ---------------- PENGAJUAN PEMBELIAN ---------------- */
function activeMembers(){ return DB.members.filter(m=>m.status==="active"); }

function splitAmount(nominal, n){
  // bagi rata, sisa pembulatan dibebankan ke admin pertama-pertama agar totalnya pas
  const base = Math.floor(nominal/n);
  const remainder = nominal - base*n;
  return Array.from({length:n}, (_,i)=> base + (i<remainder ? 1 : 0));
}

function requestStatusMeta(status){
  if(status==="approved") return {label:"Disetujui", cls:"approved"};
  if(status==="rejected") return {label:"Ditolak", cls:"rejected"};
  return {label:"Menunggu", cls:"pending"};
}

/* ---------------- SALDO PRIBADI ADMIN (untuk validasi pengajuan) ---------------- */
// Saldo pribadi = total kas masuk (setoran) dikurangi total kas keluar (pengeluaran)
// yang tercatat atas nama admin tsb di buku kas (DB.tx).
function memberSaldo(adminId){
  let bal = 0;
  DB.tx.forEach(t=>{ if(t.admin===adminId) bal += Number(t.btb||0) - Number(t.bkb||0); });
  return bal;
}
// Dana yang sudah "ditahan" oleh pengajuan LAIN yang masih menunggu (pending),
// supaya satu admin tidak bisa dipakai dananya dobel oleh dua pengajuan sekaligus.
function memberPendingHold(adminId, excludeReqId){
  let hold = 0;
  DB.requests.forEach(r=>{
    if(r.status!=="pending" || (excludeReqId && r.id===excludeReqId)) return;
    const idx = r.admins.indexOf(adminId);
    if(idx===-1) return;
    hold += splitAmount(r.nominal, r.admins.length)[idx];
  });
  return hold;
}
function memberAvailableSaldo(adminId, excludeReqId){
  return memberSaldo(adminId) - memberPendingHold(adminId, excludeReqId);
}
const ANGKA_KATA_ID = ["nol","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh"];
function terbilangID(n){ return ANGKA_KATA_ID[n] || String(n); }
function joinNamesID(names){
  if(names.length===0) return "";
  if(names.length===1) return names[0];
  if(names.length===2) return `${names[0]} dan ${names[1]}`;
  return `${names.slice(0,-1).join(", ")}, dan ${names[names.length-1]}`;
}
// Validasi sumber dana SOLO — mengembalikan {ok, note}
function computeSoloValidation(){
  const d = state.pengajuan;
  const nominal = Number(d.nominal)||0;
  if(!d.soloAdmin || nominal<=0) return {ok:true, note:null}; // belum cukup data buat dicek, biarkan submit klik yang validasi field wajib
  const m = memberById(d.soloAdmin);
  const nama = m ? m.nama : "Admin ini";
  const available = memberAvailableSaldo(d.soloAdmin, d.editingReqId);
  if(available < nominal){
    return {ok:false, note:`Saldo ${nama} tidak cukup (tersedia ${rupiah(available)}, dibutuhkan ${rupiah(nominal)}). Pilih admin lain atau minta ${nama} setor kas dahulu.`};
  }
  return {ok:true, note:null};
}
// Validasi sumber dana PATUNGAN — mengembalikan {ok, note}
function computePatunganValidation(){
  const d = state.pengajuan;
  const nominal = Number(d.nominal)||0;
  const actives = activeMembers();
  const set = d.patunganSet || new Set(actives.map(m=>m.id));
  const ids = actives.filter(m=>set.has(m.id)).map(m=>m.id);
  if(ids.length===0 || nominal<=0) return {ok:true, note:null};
  const shares = splitAmount(nominal, ids.length);
  const insufficient = [];
  ids.forEach((id,i)=>{
    const avail = memberAvailableSaldo(id, d.editingReqId);
    if(avail < shares[i]) insufficient.push({ id, nama:nameOf(id), available:avail });
  });
  if(insufficient.length>0){
    const daftar = insufficient.map(x=>`${x.nama} ${rupiah(x.available)}`).join(", ");
    const hubungi = joinNamesID(insufficient.map(x=>x.nama));
    const subjek = insufficient.length===1 ? "1 orang admin" : `${terbilangID(insufficient.length)} (${insufficient.length}) orang admin`;
    return {ok:false, note:`Saldo ${subjek} ${daftar} tidak cukup untuk melakukan patungan ini. Hubungi ${hubungi} untuk setoran kas segera.`};
  }
  return {ok:true, note:null};
}
function computePengajuanValidation(){
  return state.pengajuan.mode==="solo" ? computeSoloValidation() : computePatunganValidation();
}
// Perbarui kartu peringatan saldo + status tombol kirim TANPA render ulang seluruh
// halaman, supaya fokus ketik di kolom Nominal tidak hilang (papan ketik tidak tertutup).
function updatePengajuanValidation(){
  const v = computePengajuanValidation();
  const noteEl = document.getElementById("pgSaldoNote");
  const btn = document.getElementById("pgSubmit");
  if(noteEl){
    if(v.note){
      noteEl.innerHTML = `${icon('alert')}<span>${escapeHtml(v.note)}</span>`;
      noteEl.classList.add("show");
    } else {
      noteEl.innerHTML = "";
      noteEl.classList.remove("show");
    }
  }
  if(btn) btn.disabled = !v.ok;
  return v;
}

function pendingRequestCount(){ return DB.requests.filter(r=>r.status==="pending").length; }

function approveRequest(id){
  const req = DB.requests.find(r=>r.id===id);
  if(!req || req.status!=="pending") return;
  const amounts = splitAmount(req.nominal, req.admins.length);
  const today = new Date().toISOString().slice(0,10);
  req.admins.forEach((adminId, i)=>{
    DB.tx.push({
      id: uid("tx"), tgl: today, admin: adminId, shift:"Non Shift",
      btb:0, bkb: amounts[i],
      ket: `Pengajuan disetujui: ${req.keterangan}${req.admins.length>1 ? ' (patungan)' : ''}`,
      kat: "pinjaman",
    });
  });
  saveTx(DB.tx);
  req.status = "approved";
  req.decidedAt = today;
  saveRequests(DB.requests);
  toast("Pengajuan disetujui & tercatat di kas keluar");
}
function rejectRequest(id){
  const req = DB.requests.find(r=>r.id===id);
  if(!req || req.status!=="pending") return;
  const alasan = window.prompt("Alasan penolakan (opsional):","") || "";
  req.status = "rejected";
  req.decidedAt = new Date().toISOString().slice(0,10);
  req.catatan = alasan;
  saveRequests(DB.requests);
  toast("Pengajuan ditolak");
}

/* ============================================================
   ARISAN TANTEH SUSI — logika inti
   Model 1 dokumen "kas/arisan" -> { list: [ batch, ... ] }, tiap batch:
   { id, nama, biaya, kuota, tglMulai, status('pendaftaran'|'berjalan'|'selesai'),
     currentRound, createdAt, members:[{id,nama,hp,status,daftarAt,sudahMenang,
     menangRound,menangTgl}], drawHistory:[{round,tgl,winnerId,winnerNama}] }
============================================================ */
function addMonthsISO(iso, n){
  const [y,m,d] = iso.split("-").map(Number);
  const dt = new Date(y, (m-1)+n, d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
}
/** Batch "aktif" = batch terbaru yang belum selesai (pendaftaran atau berjalan). */
function activeArisanBatch(){
  const list = DB.arisan||[];
  const open = list.filter(a=>a.status!=="selesai");
  if(!open.length) return null;
  return [...open].sort((a,b)=> b.createdAt.localeCompare(a.createdAt))[0];
}
function finishedArisanBatches(){
  return (DB.arisan||[]).filter(a=>a.status==="selesai").sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
}
function arisanApprovedMembers(batch){ return (batch.members||[]).filter(m=>m.status==="approved"); }
function arisanPendingMembers(batch){ return (batch.members||[]).filter(m=>m.status==="pending"); }
function arisanEligibleMembers(batch){ return arisanApprovedMembers(batch).filter(m=>!m.sudahMenang); }
/** Cek tiap beberapa detik: kalau jadwal kocok sudah lewat & belum ada
 *  kocokan yang sedang berjalan/menunggu konfirmasi, otomatis buka & mulai
 *  mesin slot — TANPA perlu admin klik "Kocok Sekarang!" dulu. Ini hanya
 *  bisa jalan kalau ada browser admin yang sedang terbuka (situs statis,
 *  tidak ada server/cron di belakang layar) — begitu admin login & tab-nya
 *  terbuka, pengecekan ini otomatis aktif di background. */
function checkArisanAutoDraw(){
  if(!DB_READY || !isAuthed()) return;
  const batch = activeArisanBatch();
  if(!batch || batch.status!=="berjalan") return;
  if(batch.liveDraw && batch.liveDraw.active) return; // sudah ada kocokan berjalan / menunggu konfirmasi ya-tidak
  const eligible = arisanEligibleMembers(batch);
  if(!eligible.length) return;
  const due = new Date(arisanNextDrawDate(batch)+"T00:00:00").getTime();
  if(Date.now() < due) return; // belum waktunya
  startArisanDraw(batch);
  // Bawa admin ke halaman "Kelola Arisan" biar langsung lihat mesin slot
  // yang tertanam di bawah hitung mundur mulai berputar.
  state.adminSection = "arisan";
  if(location.hash.replace(/^#/,"")==="/admin"){ refreshAdminContent(); syncNavActive?.(); }
  else goto("/admin");
  toast(`⏰ Waktunya kocok arisan "${batch.nama}"! Mesin slot otomatis mulai berputar.`);
}
setInterval(checkArisanAutoDraw, 8000);
/** Kembalikan info siaran live kalau kocokan sedang berlangsung & masih dalam
 *  rentang waktu wajar untuk ditonton (kasih toleransi ~20 detik ekstra
 *  setelah reel harusnya berhenti, buat jaga-jaga admin belum sempat klik
 *  Simpan/Batal). Kalau sudah lewat/basi, dianggap tidak ada siaran live. */
function arisanLiveDrawInfo(batch){
  const ld = batch.liveDraw;
  if(!ld || !ld.active || !ld.startedAt) return null;
  const elapsed = Date.now() - ld.startedAt;
  const GRACE_MS = 45000;
  if(elapsed > ld.durationMs + GRACE_MS) return null;
  return { ...ld, elapsed: Math.max(0, elapsed) };
}
function arisanNextDrawDate(batch){ return addMonthsISO(batch.tglMulai, batch.currentRound); }
function arisanQuotaTaken(batch){ return (batch.members||[]).filter(m=>m.status!=="rejected").length; }
function arisanQuotaFull(batch){ return !!batch.kuota && arisanQuotaTaken(batch) >= batch.kuota; }
function computeCountdown(targetIso){
  const target = new Date(targetIso+"T00:00:00").getTime();
  const diff = Math.max(0, target - Date.now());
  return {
    d: Math.floor(diff/86400000),
    h: Math.floor((diff%86400000)/3600000),
    m: Math.floor((diff%3600000)/60000),
    s: Math.floor((diff%60000)/1000),
    done: diff<=0,
  };
}
function saveArisanList(){ saveArisan(DB.arisan); }
/** Anggota arisan tidak selalu terdaftar sebagai anggota kas (DB.members), jadi
 *  warnanya perlu dibangkitkan sendiri dari nama (hash sederhana -> palet warna)
 *  supaya tiap orang konsisten dapat 1 warna yang sama di avatar & roda kocok. */
function _hashStr(s){ let h=0; for(let i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))>>>0; } return h; }
function arisanColorFor(nama){ return COLOR_CHOICES[_hashStr(String(nama||"?")) % COLOR_CHOICES.length]; }
function arisanAvatarHtml(nama, size){
  const cls = size==="sm" ? "avatar sm" : "avatar";
  return `<span class="${cls}" style="background:${avatarBg(arisanColorFor(nama))}">${initials(nama)}</span>`;
}
/** Nama pendek untuk label di roda (biar tidak numpuk): ambil kata pertama, potong kalau kepanjangan. */
function arisanShortName(nama){
  const first = String(nama||"?").trim().split(/\s+/)[0] || "?";
  return first.length>10 ? first.slice(0,9)+"…" : first;
}
function arisanPendingCount(){
  const b = activeArisanBatch();
  return b ? arisanPendingMembers(b).length : 0;
}
function arisanMenuBadge(){
  const b = activeArisanBatch();
  if(!b) return "";
  if(b.status==="pendaftaran") return `<span class="mm-badge mm-badge-pink">Buka</span>`;
  if(b.status==="berjalan") return `<span class="mm-badge mm-badge-pink">Live</span>`;
  return "";
}

/* ---------------- PERINGKAT SETORAN (KAS MASUK) PER ANGGOTA ---------------- */
function depositRanking(){
  const map = {};
  DB.tx.forEach(t=>{
    if(!map[t.admin]) map[t.admin] = { total:0, keluar:0, count:0 };
    map[t.admin].total += Number(t.btb||0);
    map[t.admin].keluar += Number(t.bkb||0);
    if(t.btb>0) map[t.admin].count += 1;
  });
  const total = Object.values(map).reduce((s,x)=>s+x.total,0) || 1;
  return DB.members
    .filter(m=>map[m.id])
    .map(m=>({
      id:m.id,
      total:map[m.id].total,        // dipakai untuk peringkat (total setoran kas masuk)
      keluar:map[m.id].keluar,      // total kas keluar milik anggota ini (kasbon/pembelian dll)
      saldo: map[m.id].total - map[m.id].keluar, // sisa saldo kas pribadi anggota
      count:map[m.id].count,
      pct: map[m.id].total/total*100
    }))
    .sort((a,b)=>b.total-a.total); // urutan peringkat TETAP berdasarkan total kas masuk
}

// Rincian saldo anggota dalam bentuk 3 "chip" berwarna: Setor (hijau) − Keluar (merah) = Sisa Saldo (aksen).
// compact=true dipakai di ringkasan dashboard admin (hanya chip Sisa Saldo yang tampil).
function rankBreakdownHtml(r, compact){
  const neg = r.saldo < 0;
  const saldoChip = `
    <div class="rb-chip rb-saldo ${neg?'is-neg':'is-pos'}">
      <span class="rb-chip-label">Sisa Saldo</span>
      <span class="rb-chip-val mono money-blur">${moneyDual(Math.abs(r.saldo), neg?'-':'')}</span>
    </div>`;
  if(compact){
    return `<div class="rank-breakdown compact">${saldoChip}</div>`;
  }
  return `
    <div class="rank-breakdown">
      <div class="rb-chip rb-in">
        <span class="rb-chip-label">Setor</span>
        <span class="rb-chip-val mono money-blur">${moneyDual(r.total)}</span>
      </div>
      <span class="rb-op">&minus;</span>
      <div class="rb-chip rb-out">
        <span class="rb-chip-label">Keluar</span>
        <span class="rb-chip-val mono money-blur">${moneyDual(r.keluar)}</span>
      </div>
      <span class="rb-op">=</span>
      ${saldoChip}
    </div>`;
}

/* ---------------- EKSPOR EXCEL & PDF ---------------- */
function exportRowsPlain(list){
  return list.map((t,i)=>{
    const isIn = t.btb>0;
    return {
      No: i+1,
      Tanggal: fmtDate(t.tgl),
      Nama: nameOf(t.admin),
      Shift: t.shift||"Non Shift",
      Jenis: isIn ? "Kas Masuk" : "Kas Keluar",
      Jumlah: isIn ? t.btb : t.bkb,
      Keterangan: t.ket || ""
    };
  });
}
/** Pemuatan library berat (xlsx / jspdf / autotable) ditunda sampai
 *  benar-benar dibutuhkan (klik tombol Excel/PDF), bukan diblokir di
 *  <head> saat halaman pertama kali dibuka. Ini yang paling besar
 *  pengaruhnya ke kecepatan muat awal situs — 3 script vendor ini total
 *  ratusan KB dan sebelumnya WAJIB selesai dimuat sebelum apa pun lain
 *  jalan, padahal 99% pengunjung tidak pernah mengeklik ekspor. */
const _libCache = {};
function _loadScriptOnce(src){
  if(_libCache[src]) return _libCache[src];
  _libCache[src] = new Promise((resolve,reject)=>{
    const s = document.createElement("script");
    s.src = src;
    s.onload = ()=>resolve();
    s.onerror = ()=>{ delete _libCache[src]; reject(new Error("load fail: "+src)); };
    document.body.appendChild(s);
  });
  return _libCache[src];
}
async function ensureXlsxLib(){
  if(!window.XLSX) await _loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
}
async function ensurePdfLib(){
  if(!window.jspdf) await _loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  if(window.jspdf && !window.jspdf.jsPDF.API.autoTable) await _loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
}
async function exportExcel(list){
  try{
    toast("Menyiapkan Excel…");
    await ensureXlsxLib();
  }catch(e){ toast("Gagal memuat pustaka Excel, cek koneksi internet","err"); return; }
  const rows = exportRowsPlain(list);
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{wch:5},{wch:16},{wch:14},{wch:11},{wch:11},{wch:13},{wch:32}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transaksi Kas");
  XLSX.writeFile(wb, `JHT-KAS-Transaksi-${new Date().toISOString().slice(0,10)}.xlsx`);
  toast("Excel berhasil diunduh");
}
async function exportPdf(list){
  try{
    toast("Menyiapkan PDF…");
    await ensurePdfLib();
  }catch(e){ toast("Gagal memuat pustaka PDF, cek koneksi internet","err"); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:"landscape" });
  doc.setFontSize(14);
  doc.text("JHT KAS Adm PRG — Tabel Transaksi", 14, 16);
  doc.setFontSize(9);
  doc.text(`Diunduh: ${new Date().toLocaleString("id-ID")}`, 14, 22);
  const rows = exportRowsPlain(list);
  doc.autoTable({
    startY: 27,
    head: [["No","Tanggal","Nama","Shift","Jenis","Jumlah","Keterangan"]],
    body: rows.map(r=>[r.No, r.Tanggal, r.Nama, r.Shift, r.Jenis, rupiah(r.Jumlah), r.Keterangan]),
    styles:{ fontSize:8, cellPadding:2.5 },
    headStyles:{ fillColor:[240,169,58], textColor:[36,26,6] },
    alternateRowStyles:{ fillColor:[245,245,242] },
  });
  doc.save(`JHT-KAS-Transaksi-${new Date().toISOString().slice(0,10)}.pdf`);
  toast("PDF berhasil diunduh");
}

/* ---------------- TOAST ---------------- */
function toast(msg, isErr){
  let stack = document.querySelector(".toast-stack");
  if(!stack){ stack = document.createElement("div"); stack.className="toast-stack"; document.body.appendChild(stack); }
  const el = document.createElement("div");
  el.className = "toast" + (isErr ? " err" : "");
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(()=>{ el.style.transition="opacity .3s,transform .3s"; el.style.opacity="0"; el.style.transform="translateX(20px)"; setTimeout(()=>el.remove(),300); }, 2600);
}

/* ---------------- THEME ---------------- */
function applyTheme(){
  const t = localStorage.getItem(LS_KEYS.theme) || "dark";
  document.documentElement.setAttribute("data-theme", t);
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  localStorage.setItem(LS_KEYS.theme, next);
  document.documentElement.setAttribute("data-theme", next);
}

/* ============================================================
   ICON helper
============================================================ */
function icon(name, cls){ return `<svg width="16" height="16" class="${cls||''}"><use href="#ic-${name}"/></svg>`; }

/* ============================================================
   ROUTER
============================================================ */
window.addEventListener("hashchange", ()=>{
  state.route = location.hash.replace("#","") || "/";
  render();
});

function goto(route){ location.hash = route; }

function render(){
  document.body.classList.toggle("money-revealed", !!state.moneyRevealed);
  const root = document.getElementById("app");
  if(!DB_READY){
    root.innerHTML = `<div style="padding:60px 20px;text-align:center;opacity:.7;">Memuat data…</div>`;
    return;
  }
  if(state.route === "/admin"){
    if(!isAuthed()){ goto("/login"); return; }
    root.innerHTML = renderAdmin();
    bindAdmin();
  } else if(state.route === "/login"){
    if(isAuthed()){ goto("/admin"); return; }
    root.innerHTML = renderLogin();
    bindLogin();
  } else if(state.route === "/pengajuan"){
    root.innerHTML = renderPengajuanPage();
    bindPengajuanPage();
  } else if(state.route === "/riwayat"){
    root.innerHTML = renderRiwayatPage();
    bindSimplePage();
  } else if(state.route === "/aset"){
    root.innerHTML = renderAsetPage();
    bindSimplePage();
  } else if(state.route === "/arisan"){
    root.innerHTML = renderArisanPage();
    bindArisanPage();
  } else {
    root.innerHTML = renderGuest();
    bindGuest();
  }
}

/* ============================================================
   TOPBAR (shared antara guest & bisa dipakai ulang)
============================================================ */
function topbar(){
  const theme = document.documentElement.getAttribute("data-theme")||"dark";
  const pendingCount = pendingRequestCount();
  return `
  <div class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="#/">
        <div class="brand-mark"><img src="assets/piggy-sm.png" alt="Logo"></div>
        <div class="brand-text"><b>JHT KAS Adm PRG</b><span>Buku kas admin gudang</span></div>
      </a>
      <div class="topbar-actions">
        <button class="icon-btn" id="themeBtn" title="Ganti tema">${icon(theme==='dark'?'sun':'moon')}</button>
        <button class="btn btn-primary" id="loginBtn">${icon('lock')}<span>Masuk Admin</span></button>
      </div>
      <button class="icon-btn hamburger-btn" id="hamburgerBtn" title="Menu">${icon('menu')}${pendingCount>0?`<span class="menu-dot"></span>`:""}</button>
    </div>

    <!-- ======= NAV DESKTOP (>760px): baris menu kedua yang SELALU
         terlihat langsung, TANPA ikon hamburger — sesuai permintaan.
         Dropdown dipakai hanya buat mengelompokkan item sekunder
         (unduh/tautan/game) supaya baris menu tidak penuh sesak. Murni
         CSS+JS ringan, tanpa library, dan disembunyikan total di layar
         mobile (digantikan hamburger + panel seperti sebelumnya). ---- -->
    <nav class="desktop-nav" id="desktopNav">
      <div class="desktop-nav-inner">
        <a class="dnav-link" href="#/" id="dnHome">${icon('home')}<span>Home</span></a>
        <button class="dnav-link" id="dnPengajuan">${icon('plus-circle')}<span>Ajukan Pembelian</span></button>
        <button class="dnav-link" id="dnRiwayat">${icon('inbox')}<span>Riwayat Pengajuan</span>${pendingCount>0?`<span class="dnav-badge">${pendingCount}</span>`:""}</button>
        <button class="dnav-link" id="dnAset">${icon('box')}<span>Aset</span></button>
        <button class="dnav-link dnav-arisan" id="dnArisan">${icon('gift')}<span>Arisan Tanteh Susi</span>${arisanMenuBadge()}</button>
        <div class="dnav-dropdown" id="dnDownloadWrap">
          <button class="dnav-link dnav-trigger" id="dnDownloadToggle">${icon('download')}<span>Unduh Data</span>${icon('down')}</button>
          <div class="dnav-menu" id="dnDownloadMenu">
            <button class="dnav-menu-item" id="dnExportExcel">${icon('file-excel')}<span>Unduh Excel</span></button>
            <button class="dnav-menu-item" id="dnExportPdf">${icon('file-pdf')}<span>Unduh PDF</span></button>
          </div>
        </div>
        <div class="dnav-dropdown" id="dnLinksWrap">
          <button class="dnav-link dnav-trigger" id="dnLinksToggle">${icon('external')}<span>Tautan</span>${icon('down')}</button>
          <div class="dnav-menu" id="dnLinksMenu">
            <button class="dnav-menu-item" id="dnJadwal">${icon('calendar')}<span>Jadwal Admin GDNG PRG</span></button>
            <button class="dnav-menu-item" id="dnRekapLama">${icon('sheet')}<span>Data Rekap Lama (Spreadsheet)</span></button>
            <button class="dnav-menu-item" id="dnRitase">${icon('report')}<span>Uang Ritase TUA</span></button>
          </div>
        </div>
        <div class="dnav-dropdown" id="dnGameWrap">
          <button class="dnav-link dnav-trigger" id="dnGameToggle">${icon('gamepad')}<span>Game</span>${icon('down')}</button>
          <div class="dnav-menu" id="dnGameMenu">
            <button class="dnav-menu-item" data-game="catur"><span class="dnav-emoji">♟️</span><span>Catur</span></button>
            <button class="dnav-menu-item" data-game="ular"><span class="dnav-emoji">🐍</span><span>Ular Tangga</span></button>
            <button class="dnav-menu-item" data-game="monopoli">${icon('dice')}<span>Monopoly</span></button>
          </div>
        </div>
      </div>
    </nav>

    <div class="mobile-menu-panel" id="mobileMenuPanel">
      <div class="mm-panel-head"><span class="mm-panel-head-icon">${icon('menu')}</span><span>Menu Navigasi</span></div>
      <button class="mm-item" id="mmHome"><span class="mm-ico-wrap">${icon('home')}</span><span>Home</span></button>
      <button class="mm-item" id="themeBtnMob"><span class="mm-ico-wrap">${icon(theme==='dark'?'sun':'moon')}</span><span>Ganti Tema</span></button>
      <button class="mm-item" id="loginBtnMob"><span class="mm-ico-wrap">${icon('lock')}</span><span>Masuk Admin</span></button>
      <div class="mm-sep"></div>
      <div class="mm-label" style="--tone:var(--forest);">Pengajuan Pembelian</div>
      <button class="mm-item" id="mmPengajuan" data-tone="action"><span class="mm-ico-wrap">${icon('plus-circle')}</span><span>Ajukan Pembelian</span></button>
      <button class="mm-item" id="mmRiwayat" data-tone="action"><span class="mm-ico-wrap">${icon('inbox')}</span><span>Riwayat Pengajuan</span>${pendingCount>0?`<span class="mm-badge">${pendingCount}</span>`:""}</button>
      <button class="mm-item" id="mmAset" data-tone="action"><span class="mm-ico-wrap">${icon('box')}</span><span>Aset Barang/Jasa Milik Pribadi Admin</span></button>
      <div class="mm-sep"></div>
      <div class="mm-label" style="--tone:#D6488E;">Arisan</div>
      <button class="mm-item mm-arisan-item" id="mmArisan" data-tone="arisan"><span class="mm-ico-wrap">${icon('gift')}</span><span>Arisan Tanteh Susi</span>${arisanMenuBadge()}</button>
      <div class="mm-sep"></div>
      <div class="mm-label" style="--tone:var(--amber);">Unduh Data</div>
      <button class="mm-item" id="mmExportExcel" data-tone="download"><span class="mm-ico-wrap">${icon('file-excel')}</span><span>Unduh Excel</span></button>
      <button class="mm-item" id="mmExportPdf" data-tone="download"><span class="mm-ico-wrap">${icon('file-pdf')}</span><span>Unduh PDF</span></button>
      <div class="mm-sep"></div>
      <div class="mm-label" style="--tone:var(--blue);">Tautan Cepat</div>
      <button class="mm-item" id="mmJadwal" data-tone="info"><span class="mm-ico-wrap">${icon('calendar')}</span><span>Jadwal Admin GDNG PRG</span><span class="mm-ext">${icon('external')}</span></button>
      <button class="mm-item" id="mmRekapLama" data-tone="info"><span class="mm-ico-wrap">${icon('sheet')}</span><span>Data Rekap Lama (Spreadsheet)</span><span class="mm-ext">${icon('external')}</span></button>
      <button class="mm-item" id="mmRitase" data-tone="info"><span class="mm-ico-wrap">${icon('report')}</span><span>Uang Ritase TUA</span><span class="mm-ext">${icon('external')}</span></button>
      <div class="mm-sep"></div>
      <div class="mm-label" style="--tone:#8B5CF6;">Hiburan</div>
      <button class="mm-item mm-expandable" id="mmGameToggle" data-tone="fun" aria-expanded="false"><span class="mm-ico-wrap">${icon('gamepad')}</span><span>Game</span><span class="mm-chev">${icon('chevron-right')}</span></button>
      <div class="mm-submenu" id="mmGameSubmenu">
        <button class="mm-item" data-game="catur" data-tone="fun"><span class="mm-ico-wrap">♟️</span><span>Catur</span></button>
        <button class="mm-item" data-game="ular" data-tone="fun"><span class="mm-ico-wrap">🐍</span><span>Ular Tangga</span></button>
        <button class="mm-item" data-game="monopoli" data-tone="fun"><span class="mm-ico-wrap">${icon('dice')}</span><span>Monopoly</span></button>
      </div>
      <div class="mm-footer">Website Developer <a href="https://benyoriki.com/" target="_blank" rel="noopener">benyoriki.com</a></div>
    </div>
  </div>`;
}

/* ============================================================
   HERO — animasi grafik candlestick (dekoratif & ringan)
   Catatan: data acak untuk estetika, bukan data pasar riil.
============================================================ */
let heroChartData = null;
let heroChartTimer = null;

function genCandle(prevClose){
  const vol = prevClose * (0.006 + Math.random()*0.01);
  const open = prevClose;
  const dir = Math.random() > 0.46 ? 1 : -1;
  const close = Math.max(1, open + dir * vol * (0.4 + Math.random()*0.9));
  const high = Math.max(open,close) + vol*Math.random()*0.5;
  const low = Math.max(0.5, Math.min(open,close) - vol*Math.random()*0.5);
  return {open, close, high, low};
}
function initHeroChartData(){
  const n = 36;
  let price = 100;
  const arr = [];
  for(let i=0;i<n;i++){ const c = genCandle(price); arr.push(c); price = c.close; }
  return arr;
}
function initHeroChart(){
  const svg = document.getElementById("heroChartSvg");
  if(!svg) return;
  if(heroChartTimer){ clearInterval(heroChartTimer); heroChartTimer = null; }
  heroChartData = initHeroChartData();
  drawHeroChart();
  heroChartTimer = setInterval(()=>{
    if(!document.getElementById("heroChartSvg")){ clearInterval(heroChartTimer); heroChartTimer = null; return; }
    const last = heroChartData[heroChartData.length-1];
    heroChartData.push(genCandle(last.close));
    if(heroChartData.length>36) heroChartData.shift();
    drawHeroChart();
  }, 1500);
}
function drawHeroChart(){
  const svg = document.getElementById("heroChartSvg");
  if(!svg || !heroChartData) return;
  const W = 600, H = 130;
  const n = heroChartData.length;
  const cw = W/n;
  const highs = heroChartData.map(c=>c.high), lows = heroChartData.map(c=>c.low);
  const max = Math.max(...highs), min = Math.min(...lows);
  const pad = (max-min)*0.1 || 1;
  const top = max+pad, bottom = min-pad;
  const scaleY = v => H - ((v-bottom)/(top-bottom))*H;

  let bars = "";
  heroChartData.forEach((c,i)=>{
    const x = i*cw;
    const up = c.close >= c.open;
    const color = up ? "var(--forest)" : "var(--rust)";
    const bodyTop = scaleY(Math.max(c.open,c.close));
    const bodyBot = scaleY(Math.min(c.open,c.close));
    const bodyH = Math.max(bodyBot-bodyTop, 1.4);
    const wickX = x+cw/2;
    bars += `<line x1="${wickX.toFixed(2)}" y1="${scaleY(c.high).toFixed(2)}" x2="${wickX.toFixed(2)}" y2="${scaleY(c.low).toFixed(2)}" stroke="${color}" stroke-width="1" opacity=".8"/>`;
    bars += `<rect x="${(x+cw*0.18).toFixed(2)}" y="${bodyTop.toFixed(2)}" width="${(cw*0.64).toFixed(2)}" height="${bodyH.toFixed(2)}" fill="${color}" rx="1"/>`;
  });
  const linePts = heroChartData.map((c,i)=> `${(i*cw+cw/2).toFixed(2)},${scaleY(c.close).toFixed(2)}`);
  const lastX = (n-1)*cw + cw/2;
  const lastY = scaleY(heroChartData[n-1].close);
  const areaPts = `0,${H} ${linePts.join(" ")} ${W},${H}`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--amber)" stop-opacity=".28"/>
        <stop offset="100%" stop-color="var(--amber)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <line x1="0" y1="${(H*0.25).toFixed(1)}" x2="${W}" y2="${(H*0.25).toFixed(1)}" stroke="var(--border)" stroke-width="1" stroke-dasharray="3,4"/>
    <line x1="0" y1="${(H*0.5).toFixed(1)}" x2="${W}" y2="${(H*0.5).toFixed(1)}" stroke="var(--border)" stroke-width="1" stroke-dasharray="3,4"/>
    <line x1="0" y1="${(H*0.75).toFixed(1)}" x2="${W}" y2="${(H*0.75).toFixed(1)}" stroke="var(--border)" stroke-width="1" stroke-dasharray="3,4"/>
    <polygon points="${areaPts}" fill="url(#heroAreaGrad)" stroke="none"/>
    <polyline points="${linePts.join(" ")}" fill="none" stroke="var(--amber)" stroke-width="1.3" opacity=".6"/>
    ${bars}
    <circle class="hero-live-ring" cx="${lastX.toFixed(2)}" cy="${lastY.toFixed(2)}" r="7" fill="none" stroke="var(--amber)" stroke-width="1.5"/>
    <circle cx="${lastX.toFixed(2)}" cy="${lastY.toFixed(2)}" r="3" fill="var(--amber)"/>
  `;

  const last = heroChartData[heroChartData.length-1];
  const prev = heroChartData[heroChartData.length-2] || last;
  const up = last.close >= prev.close;
  const chg = prev.close ? ((last.close-prev.close)/prev.close*100) : 0;
  const valEl = document.getElementById("heroChartVal");
  const chgEl = document.getElementById("heroChartChg");
  if(valEl){ valEl.textContent = last.close.toFixed(2); valEl.style.color = up ? "var(--forest)" : "var(--rust)"; }
  if(chgEl){ chgEl.textContent = `${up?'▲':'▼'} ${Math.abs(chg).toFixed(2)}%`; chgEl.style.color = up ? "var(--forest)" : "var(--rust)"; }
  const hiEl = document.getElementById("heroChartHi");
  const loEl = document.getElementById("heroChartLo");
  if(hiEl) hiEl.textContent = max.toFixed(2);
  if(loEl) loEl.textContent = min.toFixed(2);
}

/* ============================================================
   GUEST VIEW
============================================================ */
function renderGuest(){
  const t = totals(DB.tx);
  const ranking = depositRanking();
  const maxTotal = Math.max(...ranking.map(r=>r.total), 1);

  return `
  ${topbar()}
  <div class="container">
    <div class="hero">
      <div class="hero-top">
        <div>
          <div class="hero-eyebrow">Transparansi Kas dan Anggaran Pembelian Barang dan Jasa</div>
          <h1>Rekap Kas Admin GDNG 2026</h1>
          <div class="hero-chart" id="heroChart">
            <svg class="hero-chart-svg" id="heroChartSvg" viewBox="0 0 600 130" preserveAspectRatio="none"></svg>
            <div class="hero-chart-tag">
              <span class="hct-dot"></span><span>KAS-IDX</span>
            </div>
            <div class="hero-chart-price" id="heroChartPrice">
              <span class="hcp-val mono" id="heroChartVal">0</span>
              <span class="hcp-chg mono" id="heroChartChg">+0.00%</span>
            </div>
            <div class="hero-chart-range">
              <span>H <b class="mono" id="heroChartHi">0</b></span>
              <span>L <b class="mono" id="heroChartLo">0</b></span>
            </div>
          </div>
        </div>
        <div class="hero-stamp">Terbuka<br>untuk<br>semua</div>
      </div>

      ${excelPanelHtml(false)}

      <div class="saldo-strip reveal">
        <div class="saldo-col in">
          <span class="saldo-label">Kas Masuk</span>
          <span class="saldo-fig mono money-blur">${moneyDual(t.masuk)}</span>
        </div>
        <span class="saldo-op">−</span>
        <div class="saldo-col out">
          <span class="saldo-label">Kas Keluar</span>
          <span class="saldo-fig mono money-blur">${moneyDual(t.keluar)}</span>
        </div>
        <span class="saldo-op">=</span>
        <div class="saldo-col final">
          <span class="saldo-label">Saldo Akhir</span>
          <span class="saldo-fig mono money-blur">${moneyDual(t.saldo)}</span>
        </div>
      </div>
      <button class="money-toggle-btn" id="moneyToggleBtn">
        ${icon(state.moneyRevealed ? 'eye-off' : 'eye')}
        <span>${state.moneyRevealed ? 'Sembunyikan Semua Nominal' : 'Tampilkan Semua Nominal'}</span>
      </button>

      <div class="panel" style="margin-top:16px;">
        <div class="panel-head"><h3>🏆 Peringkat Setoran Anggota</h3><span class="hint">urut dari yang paling rajin setor</span></div>
        <div class="rank-list">
          ${ranking.length ? ranking.map((r,i)=>{
            const m = memberById(r.id);
            const widthPct = Math.max(4, (r.total/maxTotal*100));
            const isOff = m && m.status==='off';
            return `
            <div class="rank-row ${isOff?'off-member':''} ${i<3?'podium podium-'+(i+1):''}" data-member="${r.id}" style="--i:${i};--m-color:${colorOf(r.id)};--target-width:${widthPct}%;">
              <span class="rank-no ${i<3?'top'+(i+1):''}">${i+1}</span>
              ${avatarHtml(r.id)}
              <span class="rank-name"><span class="rank-name-text">${nameOf(r.id)}</span>${isOff ? '<span class="off-tag">nonaktif</span>' : ''}</span>
              <div class="rank-figures">
                <span class="rank-amt money-blur">${moneyDual(r.total)}</span>
                <span class="rank-pct">${r.pct.toFixed(1)}% dari total</span>
              </div>
              ${rankBreakdownHtml(r,false)}
              <div class="rank-bar-track"><div class="rank-bar-fill"></div></div>
            </div>
          `;}).join("") : `<div class="empty-row">Belum ada setoran tercatat.</div>`}
        </div>
      </div>
    </div>
  </div>
  <footer class="site-footer">JHT KAS Adm PRG — mode uji, data tersimpan di penyimpanan lokal perangkat ini.</footer>
  `;
}

/* ============================================================
   TABEL TRANSAKSI ALA-EXCEL — dipakai tampilan tamu (lihat saja)
   maupun admin (dengan kolom aksi). Native <table> dipilih supaya
   render konsisten di semua perangkat (tanpa flex bersarang).
============================================================ */
function getFilteredTxList(withActions){
  const typeFilter = withActions ? state.adminTxFilter : state.guestTxFilter;
  // Urutan kronologis (No 1 = transaksi paling lama, seperti buku kas asli) —
  // transaksi terbaru otomatis berada di baris paling bawah.
  let list = [...DB.tx].sort((a,b)=> a.tgl.localeCompare(b.tgl) || a.id.localeCompare(b.id));
  if(typeFilter==="masuk") list = list.filter(t=>t.btb>0);
  else if(typeFilter==="keluar") list = list.filter(t=>t.bkb>0);
  return filterList(list);
}

function excelPanelHtml(withActions){
  const list = getFilteredTxList(withActions);
  const typeFilter = withActions ? state.adminTxFilter : state.guestTxFilter;
  const filterIdPrefix = withActions ? "a" : "g";
  const ROW_H = 46, HEAD_H = 44;
  const maxH = state.viewRows==="all" ? null : (HEAD_H + Number(state.viewRows)*ROW_H);
  const collapsible = !withActions;
  const isOpen = !collapsible || state.guestFilterOpen;

  const filterBlock = `
      <div class="sheet-tabs" id="${filterIdPrefix}TypeFilter" style="margin-bottom:10px;">
        <button class="sheet-tab ${typeFilter==='all'?'active':''}" data-type="all">Semua</button>
        <button class="sheet-tab ${typeFilter==='masuk'?'active':''}" data-type="masuk">Kas Masuk</button>
        <button class="sheet-tab ${typeFilter==='keluar'?'active':''}" data-type="keluar">Kas Keluar</button>
      </div>
      <div class="filters">
        <div class="search-wrap">${icon('search')}<input type="text" id="${filterIdPrefix}Text" placeholder="Cari keterangan / admin..." value="${escapeHtml(state.filterText)}"></div>
        <select id="${filterIdPrefix}Admin"><option value="">Semua admin</option>${adminOptions()}</select>
        <select id="${filterIdPrefix}Month"><option value="">Semua bulan</option>${monthOptions()}</select>
      </div>
      <div class="rows-toggle" id="${filterIdPrefix}RowsFilter">
        <span class="rows-toggle-label">Tampilkan:</span>
        <button class="sheet-tab ${String(state.viewRows)==='5'?'active':''}" data-rows="5">5 Data</button>
        <button class="sheet-tab ${String(state.viewRows)==='15'?'active':''}" data-rows="15">15 Data</button>
        <button class="sheet-tab ${state.viewRows==='all'?'active':''}" data-rows="all">Semua</button>
      </div>
  `;

  return `
    <div class="panel panel-ledger">
      <div class="panel-head ${collapsible ? 'panel-head-toggle' : ''}" ${collapsible ? `id="ledgerToggle" role="button" tabindex="0" aria-expanded="${isOpen}"` : ""}>
        <h3>📋 Tabel Excel Real Time</h3>
        ${collapsible ? `<span class="panel-head-hint">${isOpen?'Sembunyikan filter':'Tampilkan filter'}<span class="panel-head-chev">${icon('chevron-right')}</span></span>` : ""}
      </div>
      ${isDesktopWidth() ? `
      <div class="export-row">
        <button class="btn btn-sm export-btn" id="${filterIdPrefix}ExportExcel">${icon('file-excel')}<span>Excel</span></button>
        <button class="btn btn-sm export-btn" id="${filterIdPrefix}ExportPdf">${icon('file-pdf')}<span>PDF</span></button>
      </div>` : ``}
      ${collapsible ? `<div class="ledger-filter-collapse ${isOpen?'open':''}" id="ledgerFilterCollapse">${filterBlock}</div>` : filterBlock}
      ${excelTableHtml(list, withActions, maxH)}
    </div>
  `;
}

function excelTableHtml(list, withActions, maxHeightPx){
  if(!list.length) return `<div class="empty-row">Belum ada transaksi yang cocok.</div>`;
  const capStyle = maxHeightPx===undefined ? "" : (maxHeightPx===null ? `max-height:none;` : `max-height:${maxHeightPx}px;`);
  return `
  <div class="excel-wrap" style="${capStyle}">
    <table class="excel">
      <thead>
        <tr>
          <th class="col-no">No</th>
          <th>Tanggal</th>
          <th>Nama</th>
          <th>Shift</th>
          <th style="text-align:right;">Kas Masuk / Keluar</th>
          <th>Keterangan</th>
          ${withActions ? `<th class="col-no">Aksi</th>` : ""}
        </tr>
      </thead>
      <tbody>
        ${list.map((t,i)=>{
          const isIn = t.btb>0;
          const amount = isIn ? t.btb : t.bkb;
          return `
          <tr>
            <td class="col-no" style="border-left:3px solid ${colorOf(t.admin)};">${i+1}</td>
            <td>${fmtDateShort(t.tgl)}</td>
            <td class="col-name"><span class="avatar-mini" style="background:${avatarBg(colorOf(t.admin))}">${initials(nameOf(t.admin))}</span>${nameOf(t.admin)}</td>
            <td><span class="tx-shift-chip">${t.shift||"Non Shift"}</span></td>
            <td class="col-amt"><span class="amt-pill ${isIn?'in':'out'} ${withActions?'':'money-blur'}">${isIn?'↑':'↓'} ${moneyDual(amount)}</span></td>
            <td class="col-ket">${escapeHtml(t.ket) || "—"}</td>
            ${withActions ? `<td class="col-no"><button class="icon-btn sm" data-edit="${t.id}" title="Ubah">${icon('edit')}</button><button class="icon-btn sm" style="color:var(--rust);" data-del="${t.id}" title="Hapus">${icon('trash')}</button></td>` : ""}
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  </div>`;
}

function adminOptions(){
  const ids = DB.members.map(m=>m.id); // "UANG RIBA" sudah termasuk (anggota resmi)
  return ids.map(id=>`<option value="${id}">${nameOf(id)}</option>`).join("");
}
function monthOptions(){
  const keys = [...new Set(DB.tx.map(t=>fmtMonthKey(t.tgl)))].sort();
  return keys.map(k=>`<option value="${k}">${monthLabel(k)}</option>`).join("");
}

function filterList(list){
  return list.filter(t=>{
    if(state.filterAdmin && t.admin !== state.filterAdmin) return false;
    if(state.filterMonth && fmtMonthKey(t.tgl) !== state.filterMonth) return false;
    if(state.filterText){
      const q = state.filterText.toLowerCase();
      if(!(t.ket||"").toLowerCase().includes(q) && !nameOf(t.admin).toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function closeMobileMenu(){ document.getElementById("mobileMenuPanel")?.classList.remove("open"); }

function bindTopbarCommon(){
  document.getElementById("themeBtn")?.addEventListener("click", ()=>{ toggleTheme(); render(); });
  document.getElementById("loginBtn")?.addEventListener("click", ()=> goto("/login"));
  document.getElementById("themeBtnMob")?.addEventListener("click", ()=>{ toggleTheme(); render(); });
  document.getElementById("loginBtnMob")?.addEventListener("click", ()=> goto("/login"));
  document.getElementById("mmHome")?.addEventListener("click", ()=>{ closeMobileMenu(); goto("/"); });
  document.getElementById("mmJadwal")?.addEventListener("click", ()=>{ closeMobileMenu(); window.open("https://web189.github.io/Jadwal-Admin/","_blank","noopener"); });
  document.getElementById("mmRekapLama")?.addEventListener("click", ()=>{ closeMobileMenu(); window.open("https://docs.google.com/spreadsheets/d/18V_4io2MWv-dRpOp44gwLrfl_ZzLAoKbpB5OPECaA0c/edit?usp=drivesdk","_blank","noopener"); });
  document.getElementById("mmRitase")?.addEventListener("click", ()=>{ closeMobileMenu(); window.open("https://web189.github.io/UangRitase/","_blank","noopener"); });
  document.getElementById("mmExportExcel")?.addEventListener("click", ()=>{ exportExcel(getFilteredTxList(false)); closeMobileMenu(); });
  document.getElementById("mmExportPdf")?.addEventListener("click", ()=>{ exportPdf(getFilteredTxList(false)); closeMobileMenu(); });
  document.getElementById("mmPengajuan")?.addEventListener("click", ()=>{ closeMobileMenu(); goto("/pengajuan"); });
  document.getElementById("mmRiwayat")?.addEventListener("click", ()=>{ closeMobileMenu(); goto("/riwayat"); });
  document.getElementById("mmAset")?.addEventListener("click", ()=>{ closeMobileMenu(); goto("/aset"); });
  document.getElementById("mmArisan")?.addEventListener("click", ()=>{ closeMobileMenu(); goto("/arisan"); });
  document.getElementById("mmGameToggle")?.addEventListener("click", (e)=>{
    e.stopPropagation();
    const sub = document.getElementById("mmGameSubmenu");
    const btn = document.getElementById("mmGameToggle");
    const open = sub.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true":"false");
  });
  document.querySelectorAll("#mmGameSubmenu [data-game]").forEach(btn=>{
    btn.addEventListener("click", ()=>{ closeMobileMenu(); openGameCenter(btn.dataset.game); });
  });
  document.getElementById("hamburgerBtn")?.addEventListener("click", (e)=>{
    e.stopPropagation();
    document.getElementById("mobileMenuPanel")?.classList.toggle("open");
  });

  /* ---- NAV DESKTOP: item langsung + 3 dropdown kecil (unduh/tautan/game) ---- */
  document.getElementById("dnHome")?.addEventListener("click", (e)=>{ e.preventDefault(); goto("/"); });
  document.getElementById("dnPengajuan")?.addEventListener("click", ()=> goto("/pengajuan"));
  document.getElementById("dnRiwayat")?.addEventListener("click", ()=> goto("/riwayat"));
  document.getElementById("dnAset")?.addEventListener("click", ()=> goto("/aset"));
  document.getElementById("dnArisan")?.addEventListener("click", ()=> goto("/arisan"));
  document.getElementById("dnExportExcel")?.addEventListener("click", ()=>{ exportExcel(getFilteredTxList(false)); closeDesktopDropdowns(); });
  document.getElementById("dnExportPdf")?.addEventListener("click", ()=>{ exportPdf(getFilteredTxList(false)); closeDesktopDropdowns(); });
  document.getElementById("dnJadwal")?.addEventListener("click", ()=>{ closeDesktopDropdowns(); window.open("https://web189.github.io/Jadwal-Admin/","_blank","noopener"); });
  document.getElementById("dnRekapLama")?.addEventListener("click", ()=>{ closeDesktopDropdowns(); window.open("https://docs.google.com/spreadsheets/d/18V_4io2MWv-dRpOp44gwLrfl_ZzLAoKbpB5OPECaA0c/edit?usp=drivesdk","_blank","noopener"); });
  document.getElementById("dnRitase")?.addEventListener("click", ()=>{ closeDesktopDropdowns(); window.open("https://web189.github.io/UangRitase/","_blank","noopener"); });
  document.querySelectorAll("#dnGameMenu [data-game]").forEach(btn=>{
    btn.addEventListener("click", ()=>{ closeDesktopDropdowns(); openGameCenter(btn.dataset.game); });
  });
  [["dnDownloadToggle","dnDownloadWrap"],["dnLinksToggle","dnLinksWrap"],["dnGameToggle","dnGameWrap"]].forEach(([btnId,wrapId])=>{
    document.getElementById(btnId)?.addEventListener("click", (e)=>{
      e.stopPropagation();
      const wrap = document.getElementById(wrapId);
      const willOpen = !wrap.classList.contains("open");
      closeDesktopDropdowns();
      if(willOpen) wrap.classList.add("open");
    });
  });
}
function closeDesktopDropdowns(){
  document.querySelectorAll(".dnav-dropdown.open").forEach(el=>el.classList.remove("open"));
}
/* Klik di luar dropdown nav desktop -> tutup otomatis */
document.addEventListener("click", (e)=>{
  if(!e.target.closest(".dnav-dropdown")) closeDesktopDropdowns();
});

/* Klik di luar panel menu -> tutup otomatis */
document.addEventListener("click", (e)=>{
  const panel = document.getElementById("mobileMenuPanel");
  if(panel && panel.classList.contains("open") && !panel.contains(e.target) && e.target.id!=="hamburgerBtn" && !e.target.closest("#hamburgerBtn")){
    closeMobileMenu();
  }
});

function bindMoneyToggle(){
  document.getElementById("moneyToggleBtn")?.addEventListener("click", ()=>{
    state.moneyRevealed = !state.moneyRevealed;
    render();
  });
}

function bindGuest(){
  bindTopbarCommon();
  initHeroChart();
  bindMoneyToggle();
  document.getElementById("ledgerToggle")?.addEventListener("click", ()=>{
    state.guestFilterOpen = !state.guestFilterOpen;
    render();
  });
  document.getElementById("ledgerToggle")?.addEventListener("keydown", (e)=>{
    if(e.key==="Enter" || e.key===" "){
      e.preventDefault();
      state.guestFilterOpen = !state.guestFilterOpen;
      render();
    }
  });
  document.querySelectorAll("#gTypeFilter .sheet-tab").forEach(btn=>{
    btn.addEventListener("click", ()=>{ state.guestTxFilter = btn.dataset.type; render(); });
  });
  document.getElementById("gText")?.addEventListener("input", e=>{ state.filterText = e.target.value; render(); });
  document.getElementById("gAdmin")?.addEventListener("change", e=>{ state.filterAdmin = e.target.value; render(); });
  document.getElementById("gMonth")?.addEventListener("change", e=>{ state.filterMonth = e.target.value; render(); });
  document.querySelectorAll("#gRowsFilter [data-rows]").forEach(btn=>{
    btn.addEventListener("click", ()=>{ state.viewRows = btn.dataset.rows==="all" ? "all" : Number(btn.dataset.rows); render(); });
  });
  document.getElementById("gExportExcel")?.addEventListener("click", ()=> exportExcel(getFilteredTxList(false)));
  document.getElementById("gExportPdf")?.addEventListener("click", ()=> exportPdf(getFilteredTxList(false)));

  document.querySelectorAll("[data-member]").forEach(row=>{
    row.addEventListener("click", ()=>{
      state.filterAdmin = row.dataset.member;
      state.guestTxFilter = "masuk";
      render();
      setTimeout(()=>document.querySelector(".panel-ledger")?.scrollIntoView({behavior:"smooth", block:"start"}), 60);
    });
  });

  scrollExcelTablesToLatest();
}

/* Buka tampilan tabel langsung menunjukkan transaksi TERBARU
   (baris paling bawah, karena penomoran kronologis dari atas). */
function scrollExcelTablesToLatest(){
  requestAnimationFrame(()=>{
    document.querySelectorAll(".excel-wrap").forEach(el=>{ el.scrollTop = el.scrollHeight; });
  });
}

/* ============================================================
   HALAMAN: ARISAN TANTEH SUSI (publik — lihat & daftar)
============================================================ */
function arisanStatusMeta(status){
  if(status==="berjalan") return {label:"Sedang Berjalan", cls:"berjalan"};
  if(status==="selesai") return {label:"Selesai", cls:"selesai"};
  return {label:"Pendaftaran Dibuka", cls:"pendaftaran"};
}
function arisanCountdownHtml(targetIso, idPrefix, caption){
  const c = computeCountdown(targetIso);
  return `
  <div class="arisan-countdown">
    <div class="arisan-countdown-caption">${caption} <b class="mono">${fmtDate(targetIso)}</b></div>
    <div class="cd-grid" id="${idPrefix}Grid" data-target="${targetIso}">
      <div class="cd-box"><span class="cd-num mono" id="${idPrefix}Day">${String(c.d).padStart(2,"0")}</span><span class="cd-label">Hari</span></div>
      <span class="cd-colon">:</span>
      <div class="cd-box"><span class="cd-num mono" id="${idPrefix}Hour">${String(c.h).padStart(2,"0")}</span><span class="cd-label">Jam</span></div>
      <span class="cd-colon">:</span>
      <div class="cd-box"><span class="cd-num mono" id="${idPrefix}Min">${String(c.m).padStart(2,"0")}</span><span class="cd-label">Menit</span></div>
      <span class="cd-colon">:</span>
      <div class="cd-box"><span class="cd-num mono" id="${idPrefix}Sec">${String(c.s).padStart(2,"0")}</span><span class="cd-label">Detik</span></div>
    </div>
  </div>`;
}
function arisanMemberRowHtml(m, mode){
  if(mode==="pending"){
    return `<div class="arisan-mem-row is-pending">${arisanAvatarHtml(m.nama,"sm")}<span class="am-name">${escapeHtml(m.nama)}</span><span class="am-badge am-badge-pending">${icon('history')}<span>Menunggu ACC</span></span></div>`;
  }
  if(m.sudahMenang){
    return `<div class="arisan-mem-row is-winner"><span class="am-trophy">${icon('trophy')}</span><span class="am-name">${escapeHtml(m.nama)}</span><span class="am-badge am-badge-winner">Menang ronde ${m.menangRound}</span></div>`;
  }
  return `<div class="arisan-mem-row is-eligible">${arisanAvatarHtml(m.nama,"sm")}<span class="am-name">${escapeHtml(m.nama)}</span><span class="am-badge am-badge-eligible">${icon('check')}<span>Aktif</span></span></div>`;
}
function arisanBatchHtml(batch){
  const meta = arisanStatusMeta(batch.status);
  const approved = arisanApprovedMembers(batch);
  const pending = arisanPendingMembers(batch);
  const taken = arisanQuotaTaken(batch);
  const quotaFull = arisanQuotaFull(batch);
  const quotaPct = batch.kuota ? Math.min(100, taken/batch.kuota*100) : 0;
  const nextDraw = arisanNextDrawDate(batch);
  const history = [...(batch.drawHistory||[])].sort((a,b)=>b.round-a.round);
  const liveInfo = arisanLiveDrawInfo(batch);

  const regBlock = (batch.status==="pendaftaran" && !quotaFull) ? `
    <div class="arisan-reg-card">
      <div class="pg-card-head">
        <span class="pg-card-head-icon">${icon('gift')}</span>
        <div>
          <div class="pg-card-head-title">Daftar Arisan Ini</div>
          <div class="pg-card-head-sub">Iuran ${rupiah(batch.biaya)}/bulan — kirim data diri, tunggu di-ACC admin.</div>
        </div>
      </div>
      <div class="field"><label>${icon('edit')} Nama Lengkap</label><input type="text" id="arNama" placeholder="Nama kamu" value="${escapeHtml(state.arisanReg.nama)}"></div>
      <div class="field"><label>${icon('edit')} No. WhatsApp <span style="font-weight:400;color:var(--ink-faint);">(opsional)</span></label><input type="text" id="arHp" placeholder="0812xxxxxxx" value="${escapeHtml(state.arisanReg.hp)}"></div>
      <div class="modal-actions pg-actions">
        <button class="btn btn-primary" id="arSubmit">${icon('gift')}<span>Daftar Sekarang</span></button>
      </div>
    </div>
  ` : (batch.status==="pendaftaran" ? `<div class="arisan-full-note">${icon('alert')}<span>Kuota pendaftaran sudah penuh (${taken}/${batch.kuota}). Nantikan batch arisan berikutnya!</span></div>` : "");

  return `
  <div class="panel arisan-panel reveal" style="margin-top:16px;">
    <div class="arisan-panel-head">
      <div>
        <div class="arisan-batch-name">${escapeHtml(batch.nama)}</div>
        <span class="arisan-status-badge ${meta.cls}">${meta.label}</span>
      </div>
      <div class="arisan-fee-chip"><span class="label">Iuran / bulan</span><span class="val mono">${rupiah(batch.biaya)}</span></div>
    </div>

    ${batch.kuota ? `
    <div class="arisan-quota-wrap">
      <div class="arisan-quota-label"><span>Slot Anggota</span><span class="mono">${taken}/${batch.kuota}</span></div>
      <div class="arisan-quota-track"><div class="arisan-quota-fill" style="width:${quotaPct}%;"></div></div>
    </div>` : ""}

    ${arisanCountdownHtml(nextDraw, "arCd", batch.status==="berjalan" ? "⏱️ Kocokan berikutnya:" : "🎯 Kocokan pertama dijadwalkan:")}

    ${!liveInfo && batch.status==="berjalan" ? arisanIdleSlotHtml(arisanEligibleMembers(batch)) : ""}

    ${liveInfo ? `
    <div class="arisan-live-card" id="arLiveCard">
      <div class="arisan-live-badge"><span class="dot"></span>LIVE — Kocokan Sedang Berlangsung</div>
      <div class="wheel-status-label" id="arLiveStatus">🔴 LIVE — reel sedang berputar…</div>
      ${slotMachineMarkup("arLive")}
      <div class="draw-result" id="arLiveResult" style="display:none;">
        <div class="draw-confetti" id="arLiveConfetti"></div>
        <div class="draw-winner-trophy">${icon('trophy')}</div>
        <div class="draw-winner-label">Selamat kepada</div>
        <div class="draw-winner-name" id="arLiveWinnerName"></div>
      </div>
    </div>` : ""}

    ${regBlock}

    <div class="arisan-members-block">
      ${approved.length ? `
      <div class="arisan-mem-group-label">Anggota Aktif (${approved.length})</div>
      <div class="arisan-mem-list">${approved.map(m=>arisanMemberRowHtml(m,"approved")).join("")}</div>` : ""}
      ${pending.length ? `
      <div class="arisan-mem-group-label">Menunggu Persetujuan Admin (${pending.length})</div>
      <div class="arisan-mem-list">${pending.map(m=>arisanMemberRowHtml(m,"pending")).join("")}</div>` : ""}
      ${!approved.length && !pending.length ? `<div class="empty-row">Belum ada yang mendaftar. Jadilah yang pertama!</div>` : ""}
    </div>

    ${history.length ? `
    <div class="arisan-mem-group-label">🏆 Riwayat Kocokan</div>
    <div class="arisan-history-list">
      ${history.map(h=>`
        <div class="arisan-history-item">
          <span class="ahi-round">Ronde ${h.round}</span>
          <span class="ahi-winner">${arisanAvatarHtml(h.winnerNama,"sm")}${escapeHtml(h.winnerNama)}</span>
          <span class="ahi-date mono">${fmtDateShort(h.tgl)}</span>
        </div>
      `).join("")}
    </div>` : ""}

    ${isAuthed() ? `<div style="margin-top:14px;"><button class="btn btn-sm" id="arGoAdminManage">${icon('shield')}<span>Kelola Arisan di Dashboard Admin</span></button></div>` : ""}
  </div>`;
}
function arisanEmptyHtml(){
  return `
  <div class="panel arisan-panel reveal" style="margin-top:16px;">
    <div class="empty-row" style="padding:36px 12px;">${icon('gift')}<div style="margin-top:8px;">Belum ada arisan yang dibuka saat ini. Nantikan pengumuman dari admin ya!</div></div>
    ${isAuthed() ? `<div style="text-align:center;margin-top:6px;"><button class="btn btn-primary btn-sm" id="arGoAdminManage">${icon('plus-circle')}<span>Buka Pendaftaran Arisan</span></button></div>` : ""}
  </div>`;
}
function arisanHistoryHtml(list){
  return `
  <div class="panel" style="margin-top:16px;">
    <div class="panel-head"><h3>📜 Riwayat Batch Arisan Selesai</h3></div>
    <div class="arisan-mem-list">
      ${list.map(b=>`
        <div class="arisan-mem-row is-eligible">
          <span class="am-name">${escapeHtml(b.nama)}</span>
          <span class="am-badge am-badge-eligible">${b.drawHistory.length} ronde · ${rupiah(b.biaya)}/orang</span>
        </div>
      `).join("")}
    </div>
  </div>`;
}

function renderArisanPage(){
  const batch = activeArisanBatch();
  const history = finishedArisanBatches();
  return `
  ${topbar()}
  <div class="container">
    <div class="hero">
      <button class="back-link" id="backHome2">&larr; Kembali ke beranda</button>
      <div class="hero-eyebrow">🎁 Kocok Tiap Tanggal 05 · Transparan &amp; Seru</div>
      <h1>Arisan Tanteh Susi</h1>
      <p class="hero-sub">Ikut arisan bulanan, iuran ringan, dikocok terbuka di depan semua anggota. Daftar, tunggu di-ACC admin, lalu nantikan giliranmu menang!</p>
      ${batch ? arisanBatchHtml(batch) : arisanEmptyHtml()}
      ${history.length ? arisanHistoryHtml(history) : ""}
    </div>
  </div>
  <footer class="site-footer">JHT KAS Adm PRG — mode uji, data tersimpan di penyimpanan lokal perangkat ini.</footer>
  `;
}

const _arisanCountdownTimers = {};
function startCountdownTicker(idPrefix){
  if(_arisanCountdownTimers[idPrefix]) clearInterval(_arisanCountdownTimers[idPrefix]);
  _arisanCountdownTimers[idPrefix] = setInterval(()=>{
    const grid = document.getElementById(idPrefix+"Grid");
    if(!grid){ clearInterval(_arisanCountdownTimers[idPrefix]); delete _arisanCountdownTimers[idPrefix]; return; }
    const c = computeCountdown(grid.dataset.target);
    document.getElementById(idPrefix+"Day").textContent = String(c.d).padStart(2,"0");
    document.getElementById(idPrefix+"Hour").textContent = String(c.h).padStart(2,"0");
    document.getElementById(idPrefix+"Min").textContent = String(c.m).padStart(2,"0");
    document.getElementById(idPrefix+"Sec").textContent = String(c.s).padStart(2,"0");
  }, 1000);
}

function bindArisanPage(){
  bindTopbarCommon();
  document.getElementById("backHome2")?.addEventListener("click", ()=> goto("/"));
  document.getElementById("arGoAdminManage")?.addEventListener("click", ()=>{ state.adminSection="arisan"; goto("/admin"); });
  document.getElementById("arNama")?.addEventListener("input", e=> state.arisanReg.nama = e.target.value);
  document.getElementById("arHp")?.addEventListener("input", e=> state.arisanReg.hp = e.target.value);
  document.getElementById("arSubmit")?.addEventListener("click", ()=>{
    const batch = activeArisanBatch();
    if(!batch || batch.status!=="pendaftaran"){ toast("Pendaftaran sudah ditutup","err"); return; }
    if(arisanQuotaFull(batch)){ toast("Kuota sudah penuh","err"); return; }
    const nama = (document.getElementById("arNama").value||"").trim();
    const hp = (document.getElementById("arHp").value||"").trim();
    if(!nama){ toast("Nama wajib diisi","err"); return; }
    batch.members.push({ id: uid("am"), nama, hp, status:"pending", daftarAt: new Date().toISOString().slice(0,10), sudahMenang:false, menangRound:null, menangTgl:null });
    saveArisanList();
    state.arisanReg = { nama:"", hp:"" };
    toast("Pendaftaran terkirim, menunggu ACC admin");
    render();
  });
  startCountdownTicker("arCd");
  bindArisanLiveWidget();
}
/** Kalau ada kocokan yang sedang live, jalankan animasi slot di halaman tamu,
 *  tersinkron ke waktu & pemenang yang sama dengan yang admin lihat (lihat
 *  arisanLiveDrawInfo & bindArisanAdminLiveWidget). Aman dipanggil berkali-kali —
 *  kalau tidak ada elemen widget-nya (tidak sedang live), langsung berhenti. */
function bindArisanLiveWidget(){
  const card = document.getElementById("arLiveCard");
  if(!card) return;
  const batch = activeArisanBatch();
  const liveInfo = batch ? arisanLiveDrawInfo(batch) : null;
  if(!liveInfo) return;
  const eligible = arisanEligibleMembers(batch);
  if(!eligible.length) return;
  const winner = eligible.find(m=>m.id===liveInfo.winnerId) || { id: liveInfo.winnerId, nama: liveInfo.winnerNama };
  const status = document.getElementById("arLiveStatus");
  const machine = document.getElementById("arLiveMachine");
  if(liveInfo.elapsed >= liveInfo.durationMs){
    // telat gabung — reel sudah harusnya berhenti, langsung tampilkan hasilnya
    machine?.classList.add("is-jackpot");
    if(status) status.textContent = `🎉 Pemenangnya adalah ${winner.nama}!`;
    document.getElementById("arLiveResult").style.display = "flex";
    document.getElementById("arLiveWinnerName").textContent = winner.nama;
    const prog = document.getElementById("arLiveProgress");
    if(prog){ prog.style.transition="none"; prog.style.width="100%"; }
    SLOT_REEL_TIMING.forEach((cfg,i)=>{
      const strip = document.getElementById("arLiveReel"+i);
      if(!strip) return;
      const { html, targetIndex } = _buildSlotReelHtml(eligible, winner, cfg.laps);
      strip.innerHTML = html;
      strip.style.transition = "none";
      strip.style.transform = `translateY(${-(targetIndex-1)*SLOT_CELL}px)`;
      strip.closest(".slot-reel-window")?.classList.add("is-settled");
    });
    return;
  }
  machine?.classList.add("is-spinning");
  _startSlotProgress("arLive", liveInfo.elapsed);
  runSlotMachineSpin("arLive", eligible, winner, liveInfo.elapsed,
    ()=>{
      machine?.classList.remove("is-spinning");
      machine?.classList.add("is-jackpot");
      if(status) status.textContent = `🎉 Pemenangnya adalah ${winner.nama}!`;
      document.getElementById("arLiveResult").style.display = "flex";
      document.getElementById("arLiveWinnerName").textContent = winner.nama;
      spawnConfetti(document.getElementById("arLiveConfetti"));
    },
    (settled, total)=>{
      if(!status || settled>=total) return;
      status.textContent = settled===total-1 ? "🔴 LIVE — reel terakhir masih berputar… tahan napas!" : `🔴 LIVE — reel ${settled}/${total} berhenti…`;
    }
  );
}

/* ============================================================
   LOGIN VIEW
============================================================ */
/* ============================================================
   HALAMAN: PENGAJUAN PEMBELIAN (siapa saja bisa mengajukan)
============================================================ */
function renderPengajuanPage(){
  const d = state.pengajuan;
  const actives = activeMembers();
  const checkedSet = d.patunganSet || new Set(actives.map(m=>m.id));
  const initialValidation = computePengajuanValidation();

  return `
  ${topbar()}
  <div class="container">
    <div class="hero">
      <button class="back-link" id="backHome2">&larr; Kembali ke beranda</button>
      <div class="hero-eyebrow">Formulir Terbuka · Bisa Diisi Siapa Saja</div>
      <h1>Ajukan Pembelian Barang/Jasa</h1>
      <p class="hero-sub">Isi kebutuhan barang/jasa yang mau dibeli pakai kas. Pengajuan akan masuk ke dashboard admin untuk disetujui atau ditolak.</p>

      <div class="pg-card">
        <div class="pg-card-head">
          <span class="pg-card-head-icon">${icon('plus-circle')}</span>
          <div>
            <div class="pg-card-head-title">Detail Pengajuan</div>
            <div class="pg-card-head-sub">Lengkapi data di bawah, admin akan meninjau pengajuanmu.</div>
          </div>
        </div>

        <div class="field">
          <label><span class="field-ico">${icon('edit')}</span>Keterangan Barang/Jasa</label>
          <textarea id="pgKet" rows="3" placeholder="mis. Beli tinta printer 1 botol">${escapeHtml(d.ket)}</textarea>
        </div>
        <div class="field">
          <label><span class="field-ico">${icon('sheet')}</span>Nominal</label>
          <div class="field-money">
            <span class="field-money-prefix">Rp</span>
            <input type="number" inputmode="numeric" id="pgNominal" value="${d.nominal||""}" placeholder="25.000">
          </div>
        </div>

        <div class="field">
          <label><span class="field-ico">${icon('users')}</span>Sumber Dana</label>
          <div class="sheet-tabs pg-mode-tabs" id="pgModeTabs" style="width:100%;">
            <button class="sheet-tab ${d.mode==='solo'?'active':''}" data-mode="solo" style="flex:1;">${icon('lock')}<span>Solo (1 Admin)</span></button>
            <button class="sheet-tab ${d.mode==='patungan'?'active':''}" data-mode="patungan" style="flex:1;">${icon('users')}<span>Patungan</span></button>
          </div>
        </div>

        ${d.mode==='solo' ? `
        <div class="field">
          <label><span class="field-ico">${icon('lock')}</span>Pilih Admin (saldo orang tsb harus mencukupi)</label>
          <select id="pgSoloAdmin">
            <option value="">— pilih admin —</option>
            ${actives.map(m=>`<option value="${m.id}" ${d.soloAdmin===m.id?'selected':''}>${m.nama} — saldo ${rupiah(memberAvailableSaldo(m.id))}</option>`).join("")}
          </select>
        </div>
        ` : `
        <div class="field">
          <label><span class="field-ico">${icon('users')}</span>Pilih Admin yang Patungan</label>
          <div class="check-list">
            ${actives.map(m=>`
              <label class="check-row">
                <input type="checkbox" data-patungan="${m.id}" ${checkedSet.has(m.id)?'checked':''}>
                ${avatarHtml(m.id,"sm")}<span>${m.nama}</span>
                <span class="check-row-saldo mono">${rupiah(memberAvailableSaldo(m.id))}</span>
              </label>
            `).join("")}
          </div>
          <p class="field-hint">Nominal akan dibagi rata ke semua admin yang dicentang.</p>
        </div>
        `}

        <div class="field">
          <label><span class="field-ico">${icon('edit')}</span>Nama Pemohon <span style="font-weight:400;color:var(--ink-faint);">(opsional)</span></label>
          <input type="text" id="pgPemohon" value="${escapeHtml(d.pemohon)}" placeholder="Nama kamu">
        </div>

        <div class="pg-saldo-note ${initialValidation.note?'show':''}" id="pgSaldoNote">${initialValidation.note?`${icon('alert')}<span>${escapeHtml(initialValidation.note)}</span>`:''}</div>

        <div class="modal-actions pg-actions">
          <button class="btn btn-primary" id="pgSubmit" ${initialValidation.ok?'':'disabled'}>${icon('plus-circle')}<span>Kirim Pengajuan</span></button>
          <button class="btn" id="pgCancel">Batal</button>
        </div>
      </div>
    </div>
  </div>
  <footer class="site-footer">JHT KAS Adm PRG — mode uji, data tersimpan di penyimpanan lokal perangkat ini.</footer>
  `;
}

function resetPengajuanDraft(){
  state.pengajuan = { mode:"solo", soloAdmin:"", patunganSet:null, ket:"", nominal:"", pemohon:"", editingReqId:null };
}

function bindPengajuanPage(){
  bindTopbarCommon();
  document.getElementById("backHome2")?.addEventListener("click", ()=> goto("/"));

  document.getElementById("pgKet")?.addEventListener("input", e=> state.pengajuan.ket = e.target.value);
  document.getElementById("pgNominal")?.addEventListener("input", e=>{
    state.pengajuan.nominal = e.target.value;
    updatePengajuanValidation();
  });
  document.getElementById("pgPemohon")?.addEventListener("input", e=> state.pengajuan.pemohon = e.target.value);
  document.getElementById("pgSoloAdmin")?.addEventListener("change", e=>{
    state.pengajuan.soloAdmin = e.target.value;
    updatePengajuanValidation();
  });

  document.querySelectorAll("#pgModeTabs [data-mode]").forEach(btn=>{
    btn.addEventListener("click", ()=>{ state.pengajuan.mode = btn.dataset.mode; render(); });
  });
  document.querySelectorAll("[data-patungan]").forEach(cb=>{
    cb.addEventListener("change", ()=>{
      if(!state.pengajuan.patunganSet) state.pengajuan.patunganSet = new Set(activeMembers().map(m=>m.id));
      const id = cb.dataset.patungan;
      if(cb.checked) state.pengajuan.patunganSet.add(id); else state.pengajuan.patunganSet.delete(id);
      updatePengajuanValidation();
    });
  });

  document.getElementById("pgCancel")?.addEventListener("click", ()=>{ resetPengajuanDraft(); goto("/"); });
  document.getElementById("pgSubmit")?.addEventListener("click", ()=>{
    const d = state.pengajuan;
    const ket = (document.getElementById("pgKet").value||"").trim();
    const nominal = Number(document.getElementById("pgNominal").value)||0;
    if(!ket){ toast("Keterangan barang/jasa wajib diisi","err"); return; }
    if(nominal<=0){ toast("Nominal harus lebih dari 0","err"); return; }
    let admins = [];
    if(d.mode==="solo"){
      if(!d.soloAdmin){ toast("Pilih admin untuk sumber dana","err"); return; }
      admins = [d.soloAdmin];
    } else {
      const set = d.patunganSet || new Set(activeMembers().map(m=>m.id));
      admins = activeMembers().filter(m=>set.has(m.id)).map(m=>m.id);
      if(admins.length===0){ toast("Pilih minimal 1 admin untuk patungan","err"); return; }
    }
    // Validasi saldo final (jaga-jaga kalau tombol sempat ter-enable dari state lama)
    const finalCheck = computePengajuanValidation();
    if(!finalCheck.ok){
      toast(finalCheck.note || "Saldo tidak cukup untuk pengajuan ini","err");
      updatePengajuanValidation();
      return;
    }
    DB.requests.push({
      id: uid("req"), tgl: new Date().toISOString().slice(0,10),
      keterangan: ket, nominal, mode: d.mode, admins,
      pemohon: (document.getElementById("pgPemohon").value||"").trim() || "Tamu",
      status:"pending", decidedAt:null,
    });
    saveRequests(DB.requests);
    resetPengajuanDraft();
    toast("Pengajuan terkirim, menunggu persetujuan admin");
    goto("/riwayat");
  });

  updatePengajuanValidation();
}

/* ============================================================
   HALAMAN: RIWAYAT PENGAJUAN
============================================================ */
function renderRiwayatPage(){
  const list = [...DB.requests].sort((a,b)=> b.tgl.localeCompare(a.tgl) || b.id.localeCompare(a.id));
  const nPending = list.filter(r=>r.status==='pending').length;
  const nApproved = list.filter(r=>r.status==='approved').length;
  const nRejected = list.filter(r=>r.status==='rejected').length;
  return `
  ${topbar()}
  <div class="container">
    <div class="hero">
      <button class="back-link" id="backHome2">&larr; Kembali ke beranda</button>
      <div class="hero-eyebrow">Transparansi Pengajuan</div>
      <h1>Riwayat Pengajuan Pembelian</h1>
      <p class="hero-sub">Semua pengajuan pembelian—baik yang disetujui, ditolak, maupun masih menunggu—tercatat terbuka di sini.</p>
      ${!isAuthed() ? `<button class="money-toggle-btn" id="moneyToggleBtn" style="margin-bottom:16px;">${icon(state.moneyRevealed?'eye-off':'eye')}<span>${state.moneyRevealed?'Sembunyikan Semua Nominal':'Tampilkan Semua Nominal'}</span></button>` : ""}

      ${list.length ? `
      <div class="req-summary reveal">
        <div class="rq-stat rq-stat-pending"><span class="rq-num mono">${nPending}</span><span class="rq-label">Menunggu</span></div>
        <div class="rq-stat rq-stat-approved"><span class="rq-num mono">${nApproved}</span><span class="rq-label">Disetujui</span></div>
        <div class="rq-stat rq-stat-rejected"><span class="rq-num mono">${nRejected}</span><span class="rq-label">Ditolak</span></div>
      </div>` : ""}

      <div class="panel">
        <div class="req-list">
          ${list.length ? list.map(r=>reqCardHtml(r)).join("") : `<div class="empty-row">Belum ada pengajuan.</div>`}
        </div>
      </div>
      <div style="margin-top:16px;">
        <button class="btn btn-primary" id="goPengajuanBtn">${icon('plus-circle')}<span>Ajukan Pembelian Baru</span></button>
      </div>
    </div>
  </div>
  <footer class="site-footer">JHT KAS Adm PRG — mode uji, data tersimpan di penyimpanan lokal perangkat ini.</footer>
  `;
}

function reqCardHtml(r, withActions){
  const meta = requestStatusMeta(r.status);
  const adminNames = r.admins.map(nameOf).join(", ");
  const blur = !isAuthed() ? "money-blur" : "";
  const shown = r.admins.slice(0,5);
  const extra = r.admins.length - shown.length;
  return `
    <div class="req-card">
      <div class="req-top">
        <span class="stamp ${meta.cls}">${meta.label}</span>
        <span class="req-amt mono ${blur}">${moneyDual(r.nominal)}</span>
      </div>
      <div class="req-ket">${escapeHtml(r.keterangan)}</div>
      <div class="req-meta-row">
        <span class="asset-meta-chip">${icon('calendar')}<span>Diajukan ${fmtDateShort(r.tgl)}</span></span>
        <span class="asset-meta-chip">${avatarHtml(r.pemohon||"Tamu","sm")}<span>${escapeHtml(r.pemohon||"Tamu")}</span></span>
      </div>
      <div class="asset-funding">
        <div class="asset-avatars">
          ${shown.map(id=>avatarHtml(id,'sm')).join("")}
          ${extra>0 ? `<span class="asset-avatar-more">+${extra}</span>` : ""}
        </div>
        <span class="asset-funding-label" title="${escapeHtml(adminNames)}">${r.mode==='solo' ? 'Solo' : 'Patungan'}: ${adminNames}</span>
      </div>
      ${r.status!=="pending" ? `
        <div class="req-decision ${meta.cls}">
          ${icon(r.status==='approved'?'check':'close')}
          <span>Diputuskan ${r.decidedAt?fmtDateShort(r.decidedAt):''}${r.catatan?` — "${escapeHtml(r.catatan)}"`:''}</span>
        </div>` : ""}
      ${withActions ? `
        <div class="req-actions">
          ${r.status==="pending" ? `
          <button class="btn btn-sm" style="color:var(--forest);border-color:var(--forest);" data-acc="${r.id}">${icon('check')}<span>ACC</span></button>
          <button class="btn btn-sm btn-danger" data-tolak="${r.id}">${icon('close')}<span>Tolak</span></button>
          <button class="btn btn-sm" data-edit-req="${r.id}">${icon('edit')}<span>Edit</span></button>
          ` : ""}
          <button class="btn btn-sm btn-danger" data-del-req="${r.id}" title="Hapus pengajuan">${icon('trash')}</button>
        </div>` : ""}
    </div>
  `;
}

/* ============================================================
   HALAMAN: ASET BARANG/JASA (hasil pengajuan yang disetujui)
============================================================ */
function renderAsetPage(){
  const approved = DB.requests.filter(r=>r.status==="approved").sort((a,b)=> b.decidedAt.localeCompare(a.decidedAt));
  const totalNilai = approved.reduce((s,r)=>s+r.nominal,0);
  const totalBarang = approved.filter(r=>r.jenis!=="jasa").length;
  const totalJasa = approved.filter(r=>r.jenis==="jasa").length;
  return `
  ${topbar()}
  <div class="container">
    <div class="hero">
      <button class="back-link" id="backHome2">&larr; Kembali ke beranda</button>
      <div class="hero-eyebrow">Hasil Pengeluaran Kas</div>
      <h1>Aset Barang/Jasa Milik Pribadi Admin</h1>
      <p class="hero-sub">Daftar barang/jasa yang sudah dibeli menggunakan saldo kas pribadi admin, hasil dari pengajuan yang disetujui.</p>
      ${!isAuthed() ? `<button class="money-toggle-btn" id="moneyToggleBtn" style="margin-bottom:16px;">${icon(state.moneyRevealed?'eye-off':'eye')}<span>${state.moneyRevealed?'Sembunyikan Semua Nominal':'Tampilkan Semua Nominal'}</span></button>` : ""}

      <div class="asset-summary reveal">
        <div class="asset-summary-main">
          <div class="asset-summary-icon">${icon('box')}</div>
          <div>
            <div class="label">Total Nilai Aset</div>
            <div class="value mono money-blur">${moneyDual(totalNilai)}</div>
          </div>
        </div>
        <div class="asset-summary-stats">
          <div class="asu-stat"><span class="asu-num mono">${approved.length}</span><span class="asu-label">Total Item</span></div>
          <div class="asu-stat"><span class="asu-num mono">${totalBarang}</span><span class="asu-label">Barang</span></div>
          <div class="asu-stat"><span class="asu-num mono">${totalJasa}</span><span class="asu-label">Jasa</span></div>
        </div>
      </div>

      <div class="panel">
        <div class="asset-list">
          ${approved.length ? approved.map((r,i)=>{
            const isJasa = r.jenis==='jasa';
            const namesFull = r.admins.map(nameOf).join(", ");
            const shown = r.admins.slice(0,5);
            const extra = r.admins.length - shown.length;
            return `
            <div class="asset-card" style="--i:${i};">
              <div class="asset-card-top">
                <span class="asset-type-badge ${isJasa?'jasa':'barang'}">${icon(isJasa?'report':'box')}<span>${isJasa ? 'Jasa' : 'Barang'}</span></span>
                <span class="asset-amt mono money-blur">${moneyDual(r.nominal)}</span>
              </div>
              <div class="asset-ket">${escapeHtml(r.keterangan)}</div>
              <div class="asset-meta-row">
                <span class="asset-meta-chip">${icon('calendar')}<span>Disetujui ${fmtDateShort(r.decidedAt)}</span></span>
              </div>
              <div class="asset-funding">
                <div class="asset-avatars">
                  ${shown.map(id=>avatarHtml(id,'sm')).join("")}
                  ${extra>0 ? `<span class="asset-avatar-more">+${extra}</span>` : ""}
                </div>
                <span class="asset-funding-label" title="${escapeHtml(namesFull)}">${r.mode==='solo' ? 'Dana dari' : 'Patungan'}: ${namesFull}</span>
              </div>
            </div>
          `;}).join("") : `<div class="empty-row">Belum ada aset tercatat.</div>`}
        </div>
      </div>
    </div>
  </div>
  <footer class="site-footer">JHT KAS Adm PRG — mode uji, data tersimpan di penyimpanan lokal perangkat ini.</footer>
  `;
}

function bindSimplePage(){
  bindTopbarCommon();
  document.getElementById("backHome2")?.addEventListener("click", ()=> goto("/"));
  document.getElementById("goPengajuanBtn")?.addEventListener("click", ()=> goto("/pengajuan"));
  bindMoneyToggle();
}

function renderLogin(){
  return `
  <div class="login-screen">
    <div class="login-card">
      <button class="back-link" id="backHome">&larr; Kembali ke tampilan tamu</button>
      <div class="login-brand">
        <div class="brand-mark" style="width:46px;height:46px;"><img src="assets/piggy-sm.png" alt="Logo"></div>
        <h2 style="font-size:17px;">Masuk sebagai Admin</h2>
        <span class="stamp active" style="font-size:9px;">Akses Terbatas</span>
      </div>
      <div class="field">
        <label>Username / Email</label>
        <input type="text" id="loginUser" placeholder="admin" autocomplete="username">
      </div>
      <div class="field">
        <label>Password</label>
        <input type="password" id="loginPass" placeholder="••••••••" autocomplete="current-password">
      </div>
      <div class="login-error" id="loginErr"></div>
      <button class="btn btn-primary" id="loginSubmit" style="width:100%;justify-content:center;">${icon('shield')}<span>Masuk</span></button>
      <p class="login-hint">Login dengan username <b>admin</b> (atau email langsung) — akun dikelola lewat Firebase Authentication.</p>
    </div>
  </div>`;
}
function bindLogin(){
  document.getElementById("backHome").addEventListener("click", ()=>goto("/"));
  const submit = async ()=>{
    const u = document.getElementById("loginUser").value.trim();
    const p = document.getElementById("loginPass").value;
    const btn = document.getElementById("loginSubmit");
    const errEl = document.getElementById("loginErr");
    errEl.textContent = "";
    btn.disabled = true;
    try{
      await FJHT.signInAdmin(u, p);
      goto("/admin");
    }catch(err){
      errEl.textContent = "Username atau password salah.";
    }finally{
      btn.disabled = false;
    }
  };
  document.getElementById("loginSubmit").addEventListener("click", submit);
  document.getElementById("loginPass").addEventListener("keydown", e=>{ if(e.key==="Enter") submit(); });
}

/* ============================================================
   ADMIN VIEW
============================================================ */
const ADMIN_NAV = [
  { id:"dashboard", label:"Dashboard", icon:"grid" },
  { id:"transaksi", label:"Transaksi", icon:"book" },
  { id:"pengajuan", label:"Pengajuan", icon:"inbox" },
  { id:"anggota", label:"Anggota", icon:"users" },
  { id:"arisan", label:"Arisan", icon:"gift" },
  { id:"histori", label:"Histori", icon:"history" },
  { id:"laporan", label:"Laporan", icon:"report" },
];

function renderAdmin(){
  const theme = document.documentElement.getAttribute("data-theme")||"dark";
  const pendingCount = pendingRequestCount();
  return `
  <div class="admin-topbar-mobile">
    <div class="brand-mark" style="width:32px;height:32px;"><img src="assets/piggy-sm.png" alt="Logo"></div>
    <div class="brand-text"><b>JHT KAS Adm</b></div>
    <button class="icon-btn hamburger-btn" id="adminHamburgerBtn" style="margin-left:auto;" title="Menu">${icon('menu')}${pendingCount>0?`<span class="menu-dot"></span>`:""}</button>
    <div class="mobile-menu-panel" id="adminMobileMenuPanel">
      <div class="mm-panel-head"><span class="mm-panel-head-icon">${icon('menu')}</span><span>Menu Navigasi</span></div>
      <div class="mm-label" style="--tone:var(--blue);">Navigasi</div>
      ${ADMIN_NAV.map(n=>`
        <button class="mm-item ${state.adminSection===n.id?'active':''}" data-sec="${n.id}" data-tone="info"><span class="mm-ico-wrap">${icon(n.icon)}</span><span>${n.label}</span>${n.id==='pengajuan'&&pendingCount>0?`<span class="mm-badge">${pendingCount}</span>`:''}${n.id==='arisan'&&arisanPendingCount()>0?`<span class="mm-badge">${arisanPendingCount()}</span>`:''}</button>
      `).join("")}
      <div class="mm-sep"></div>
      <div class="mm-label" style="--tone:var(--amber);">Unduh Data</div>
      <button class="mm-item" id="mAdminExportExcel" data-tone="download"><span class="mm-ico-wrap">${icon('file-excel')}</span><span>Unduh Excel</span></button>
      <button class="mm-item" id="mAdminExportPdf" data-tone="download"><span class="mm-ico-wrap">${icon('file-pdf')}</span><span>Unduh PDF</span></button>
      <div class="mm-sep"></div>
      <button class="mm-item" id="themeBtnM"><span class="mm-ico-wrap">${icon(theme==='dark'?'sun':'moon')}</span><span>Ganti Tema</span></button>
      <button class="mm-item" id="viewGuestBtnM"><span class="mm-ico-wrap">${icon('grid')}</span><span>Lihat Tampilan Tamu</span></button>
      <button class="mm-item" id="logoutBtnM" style="color:var(--rust);"><span class="mm-ico-wrap">${icon('logout')}</span><span>Keluar</span></button>
    </div>
  </div>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-mark"><img src="assets/piggy-sm.png" alt="Logo"></div>
        <div class="brand-text"><b>JHT KAS</b><span>Admin</span></div>
      </div>
      ${ADMIN_NAV.map(n=>`
        <button class="nav-item ${state.adminSection===n.id?'active':''}" data-sec="${n.id}">
          ${icon(n.icon)}<span>${n.label}</span>${n.id==='pengajuan'&&pendingCount>0?`<span class="mm-badge">${pendingCount}</span>`:''}${n.id==='arisan'&&arisanPendingCount()>0?`<span class="mm-badge">${arisanPendingCount()}</span>`:''}
        </button>
      `).join("")}
      <div class="nav-sep"></div>
      <div class="nav-foot">
        <button class="icon-btn" id="themeBtnA" title="Ganti tema">${icon(theme==='dark'?'sun':'moon')}</button>
        <button class="nav-item" id="viewGuestBtn">${icon('grid')}<span>Lihat Tampilan Tamu</span></button>
        <button class="nav-item" id="logoutBtn" style="color:var(--rust);">${icon('logout')}<span>Keluar</span></button>
      </div>
    </aside>
    <main class="admin-main">
      <div id="adminContent"></div>
    </main>
  </div>
  <div class="modal-overlay" id="modalOverlay"><div class="modal" id="modalBody"></div></div>
  `;
}

function adminContentHtml(){
  switch(state.adminSection){
    case "transaksi": return secTransaksi();
    case "pengajuan": return secPengajuan();
    case "anggota": return secAnggota();
    case "arisan": return secArisan();
    case "histori": return secHistori();
    case "laporan": return secLaporan();
    default: return secDashboard();
  }
}

function secPengajuan(){
  const all = [...DB.requests].sort((a,b)=> b.tgl.localeCompare(a.tgl) || b.id.localeCompare(a.id));
  const pending = all.filter(r=>r.status==="pending");
  const decided = all.filter(r=>r.status!=="pending");
  return `
    <div class="admin-topline">
      <div><h2>Pengajuan Pembelian</h2><div class="sub">${pending.length} menunggu persetujuan · ${decided.length} sudah diputuskan</div></div>
    </div>
    <div class="panel" style="margin-bottom:16px;">
      <div class="panel-head"><h3>⏳ Menunggu Persetujuan</h3></div>
      <div class="req-list">
        ${pending.length ? pending.map(r=>reqCardHtml(r,true)).join("") : `<div class="empty-row">Tidak ada pengajuan yang menunggu.</div>`}
      </div>
    </div>
    <div class="panel">
      <div class="panel-head"><h3>Riwayat Keputusan</h3></div>
      <div class="req-list">
        ${decided.length ? decided.map(r=>reqCardHtml(r,true)).join("") : `<div class="empty-row">Belum ada riwayat.</div>`}
      </div>
    </div>
  `;
}

/* ============================================================
   ADMIN — KELOLA ARISAN TANTEH SUSI
============================================================ */
function secArisan(){
  const batch = activeArisanBatch();
  const finished = finishedArisanBatches();
  return `
    <div class="admin-topline">
      <div><h2>🎁 Arisan Tanteh Susi</h2><div class="sub">Buka pendaftaran, ACC anggota, dan kocok pemenang tiap bulan</div></div>
      ${!batch ? `<button class="btn btn-primary" id="arisanNewBatchBtn">${icon('plus-circle')}<span>Buka Pendaftaran Baru</span></button>` : ""}
    </div>

    ${batch ? secArisanBatchHtml(batch) : `<div class="panel"><div class="empty-row" style="padding:30px;">Belum ada batch arisan yang dibuka.</div></div>`}

    ${finished.length ? `
    <div class="panel" style="margin-top:16px;">
      <div class="panel-head"><h3>📜 Riwayat Batch Selesai</h3></div>
      <div class="arisan-mem-list">
        ${finished.map(b=>`
          <div class="arisan-mem-row is-eligible">
            <span class="am-name">${escapeHtml(b.nama)}</span>
            <span class="am-badge am-badge-eligible">${b.drawHistory.length} ronde selesai · ${rupiah(b.biaya)}/orang</span>
            <button class="icon-btn sm" style="color:var(--rust);" data-del-arisan-batch="${b.id}" title="Hapus riwayat">${icon('trash')}</button>
          </div>
        `).join("")}
      </div>
    </div>` : ""}
  `;
}
function secArisanBatchHtml(batch){
  const meta = arisanStatusMeta(batch.status);
  const approved = arisanApprovedMembers(batch);
  const pending = arisanPendingMembers(batch);
  const eligible = arisanEligibleMembers(batch);
  const taken = arisanQuotaTaken(batch);
  const nextDraw = arisanNextDrawDate(batch);
  const history = [...(batch.drawHistory||[])].sort((a,b)=>b.round-a.round);
  return `
  <div class="panel arisan-panel" style="margin-bottom:16px;">
    <div class="arisan-panel-head">
      <div>
        <div class="arisan-batch-name">${escapeHtml(batch.nama)}</div>
        <span class="arisan-status-badge ${meta.cls}">${meta.label}</span>
      </div>
      <div class="arisan-fee-chip"><span class="label">Iuran / bulan</span><span class="val mono">${rupiah(batch.biaya)}</span></div>
    </div>
    <div class="hint" style="margin-bottom:10px;">Kuota: ${batch.kuota ? `${taken}/${batch.kuota}` : "Tanpa batas"} · Mulai kocok: ${fmtDateShort(batch.tglMulai)} · Ronde berjalan: ${batch.currentRound}</div>

    ${arisanCountdownHtml(nextDraw, "adCd", batch.status==="berjalan" ? "⏱️ Kocokan berikutnya:" : "🎯 Kocokan pertama dijadwalkan:")}

    <!-- Mesin slot ditempel LANGSUNG di bawah hitung mundur (bukan pop-up
         modal terpisah lagi). Saat belum waktunya kocok, tampilkan pratinjau
         statis (idle) di posisi yang sama supaya tidak ada "lubang" kosong;
         begitu live, digantikan versi yang benar-benar berputar — lihat
         bindArisanAdminLiveWidget. -->
    ${!arisanLiveDrawInfo(batch) && batch.status==="berjalan" ? arisanIdleSlotHtml(eligible) : ""}

    ${arisanLiveDrawInfo(batch) ? `
    <div class="arisan-live-card" id="adDrawCard">
      <div class="arisan-live-badge"><span class="dot"></span>LIVE — Kocokan Sedang Berlangsung</div>
      <div class="wheel-status-label" id="adWheelStatus">🔴 LIVE — reel sedang berputar…</div>
      ${slotMachineMarkup("adDraw")}
      <div class="draw-result" id="adDrawResult" style="display:none;">
        <div class="draw-confetti" id="adDrawConfetti"></div>
        <div class="draw-winner-trophy">${icon('trophy')}</div>
        <div class="draw-winner-label">Selamat kepada</div>
        <div class="draw-winner-name" id="adDrawWinnerName"></div>
        <div class="draw-confirm-question">Sah sebagai pemenang ronde ini?</div>
      </div>
      <div class="modal-actions" id="adDrawActions" style="visibility:hidden;">
        <button class="btn" id="adDrawCancel">${icon('dice')}<span>Tidak Sah — Putar Ulang</span></button>
        <button class="btn btn-primary" id="adDrawConfirm">${icon('check')}<span>Ya, Sah — Simpan</span></button>
      </div>
    </div>` : ""}

    <div class="admin-arisan-actions">
      ${batch.status==="pendaftaran" ? `<button class="btn btn-primary btn-sm" id="arisanStartBtn" ${approved.length===0?'disabled':''}>${icon('check')}<span>Tutup Pendaftaran &amp; Mulai</span></button>` : ""}
      ${batch.status==="berjalan" && !arisanLiveDrawInfo(batch) ? `<button class="btn btn-primary btn-sm" id="arisanDrawBtn" ${eligible.length===0?'disabled':''}>${icon('dice')}<span>Kocok Sekarang!</span></button>` : ""}
      <button class="btn btn-sm btn-danger" id="arisanDeleteBatchBtn">${icon('trash')}<span>Hapus Batch</span></button>
    </div>

    ${pending.length ? `
    <div class="arisan-mem-group-label">⏳ Menunggu Persetujuan (${pending.length})</div>
    <div class="arisan-mem-list">
      ${pending.map(m=>`
        <div class="arisan-mem-row is-pending">
          ${arisanAvatarHtml(m.nama,"sm")}<span class="am-name">${escapeHtml(m.nama)}${m.hp?` · ${escapeHtml(m.hp)}`:''}</span>
          <div class="req-actions" style="margin-left:auto;">
            <button class="btn btn-sm" style="color:var(--forest);border-color:var(--forest);" data-arisan-acc="${batch.id}|${m.id}">${icon('check')}<span>ACC</span></button>
            <button class="btn btn-sm btn-danger" data-arisan-tolak="${batch.id}|${m.id}">${icon('close')}<span>Tolak</span></button>
          </div>
        </div>
      `).join("")}
    </div>` : ""}

    <div class="arisan-mem-group-label">👥 Anggota Aktif (${approved.length})</div>
    <div class="arisan-mem-list">
      ${approved.length ? approved.map(m=>`
        <div class="arisan-mem-row ${m.sudahMenang?'is-winner':'is-eligible'}">
          ${m.sudahMenang ? `<span class="am-trophy">${icon('trophy')}</span>` : arisanAvatarHtml(m.nama,"sm")}
          <span class="am-name">${escapeHtml(m.nama)}</span>
          <span class="am-badge ${m.sudahMenang?'am-badge-winner':'am-badge-eligible'}">${m.sudahMenang ? `Menang ronde ${m.menangRound}` : 'Aktif'}</span>
          ${batch.status==="pendaftaran" ? `<button class="icon-btn sm" style="color:var(--rust);margin-left:auto;" data-arisan-remove="${batch.id}|${m.id}" title="Keluarkan">${icon('trash')}</button>` : ""}
        </div>
      `).join("") : `<div class="empty-row">Belum ada anggota disetujui.</div>`}
    </div>

    ${history.length ? `
    <div class="arisan-mem-group-label">🏆 Riwayat Kocokan</div>
    <div class="arisan-history-list">
      ${history.map(h=>`
        <div class="arisan-history-item">
          <span class="ahi-round">Ronde ${h.round}</span>
          <span class="ahi-winner">${arisanAvatarHtml(h.winnerNama,"sm")}${escapeHtml(h.winnerNama)}</span>
          <span class="ahi-date mono">${fmtDateShort(h.tgl)}</span>
        </div>
      `).join("")}
    </div>` : ""}
  </div>`;
}
function arisanBatchFormModal(){
  const defaultDate = (()=>{ const d=new Date(); d.setMonth(d.getMonth()+1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-05`; })();
  return `
    <div class="modal-head"><h3>🎁 Buka Pendaftaran Arisan</h3><button class="icon-btn" id="modalClose">&times;</button></div>
    <div class="field"><label>Nama Batch</label><input type="text" id="abNama" placeholder="mis. Arisan Tanteh Susi — Batch Oktober 2026" value="Arisan Tanteh Susi — Batch ${monthLabel(defaultDate.slice(0,7))}"></div>
    <div class="form-row2">
      <div class="field"><label>Iuran / bulan (Rp)</label><input type="number" id="abBiaya" value="150000"></div>
      <div class="field"><label>Kuota Anggota <span style="font-weight:400;color:var(--ink-faint);">(0 = tanpa batas)</span></label><input type="number" id="abKuota" value="5"></div>
    </div>
    <div class="field"><label>Tanggal Kocokan Pertama</label><input type="date" id="abTgl" value="${defaultDate}"></div>
    <p class="field-hint">Kocokan berikutnya otomatis dijadwalkan tiap tanggal yang sama setiap bulan.</p>
    <div class="modal-actions">
      <button class="btn" id="modalClose2">Batal</button>
      <button class="btn btn-primary" id="abSave">${icon('gift')}<span>Buka Pendaftaran</span></button>
    </div>
  `;
}
function bindArisanBatchForm(){
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalClose2").addEventListener("click", closeModal);
  document.getElementById("abSave").addEventListener("click", ()=>{
    const nama = (document.getElementById("abNama").value||"").trim();
    const biaya = Number(document.getElementById("abBiaya").value)||0;
    const kuota = Number(document.getElementById("abKuota").value)||0;
    const tgl = document.getElementById("abTgl").value;
    if(!nama){ toast("Nama batch wajib diisi","err"); return; }
    if(biaya<=0){ toast("Iuran harus lebih dari 0","err"); return; }
    if(!tgl){ toast("Tanggal kocokan pertama wajib diisi","err"); return; }
    DB.arisan.push({
      id: uid("arisan"), nama, biaya, kuota: kuota>0?kuota:0, tglMulai: tgl,
      status:"pendaftaran", currentRound:0, createdAt: new Date().toISOString().slice(0,10),
      members: [], drawHistory: [],
    });
    saveArisanList();
    toast("Pendaftaran arisan dibuka!");
    closeModal();
    refreshAdminContent();
  });
}

/* ---- modal animasi pengocokan arisan: MESIN SLOT 3-REEL ----
   Murni CSS transform + transition (tanpa canvas/library). Tiap reel jalan
   2 FASE: (1) putaran cepat linear yang lama (bikin tegang, kelihatan masih
   acak), lalu (2) perlambatan dramatis di ujung yang presisi berhenti di
   pemenang. Reel terakhir dapat porsi fase-lambat paling besar & paling
   panjang. Total durasi 50 detik. Engine ini dipakai BERSAMA oleh modal
   admin maupun widget live di halaman tamu (lihat runSlotMachineSpin),
   dengan dukungan "elapsedMs" supaya penonton yang baru buka halaman di
   tengah kocokan tetap mendarat di detik & pemenang yang SAMA. */
const SLOT_CELL = 72;   // px — HARUS sinkron dengan tinggi .slot-cell di CSS
const SLOT_TOTAL_MS = 50000;
const SLOT_REEL_TIMING = [
  { totalSec: 19, slowPortion: 0.20, laps: 25,  ease: "cubic-bezier(.12,.84,.18,1)" },
  { totalSec: 33, slowPortion: 0.26, laps: 43,  ease: "cubic-bezier(.08,.87,.13,1)" },
  { totalSec: 50, slowPortion: 0.38, laps: 65,  ease: "cubic-bezier(.05,.92,.08,1)" }, // reel terakhir: paling lama & paling "creep" di akhir
];
function _shuffleCopy(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}
function _slotCellHtml(m){
  return `<div class="slot-cell"><span class="slot-avatar" style="background:${avatarBg(arisanColorFor(m.nama))}">${initials(m.nama)}</span><span class="slot-name">${escapeHtml(arisanShortName(m.nama))}</span></div>`;
}
function _buildSlotReelHtml(eligible, winner, laps){
  let seq = [];
  for(let lap=0; lap<laps; lap++) seq.push(..._shuffleCopy(eligible));
  const targetIndex = seq.length; // index tempat pemenang akan berada
  seq.push(winner);
  seq.push(..._shuffleCopy(eligible).slice(0,2)); // 2 sel ekstra biar baris bawah payline tetap terisi
  return { html: seq.map(_slotCellHtml).join(""), targetIndex };
}
function slotMachineMarkup(idPrefix){
  const bulb = (n)=>Array.from({length:n}).map((_,i)=>`<span class="slot-bulb" style="--i:${i}"></span>`).join("");
  const reelsHtml = SLOT_REEL_TIMING.map((_,i)=>`
    <div class="slot-reel-window"><div class="slot-reel-strip" id="${idPrefix}Reel${i}"></div></div>
  `).join("");
  return `
    <div class="slot-machine" id="${idPrefix}Machine">
      <div class="slot-inner">
        <div class="slot-marquee">${bulb(14)}</div>
        <div class="slot-reels-row">
          ${reelsHtml}
          <div class="slot-payline"><span class="pl-arrow left"></span><span class="pl-arrow right"></span></div>
        </div>
        <div class="slot-progress-track"><div class="slot-progress-fill" id="${idPrefix}Progress"></div></div>
        <div class="slot-marquee bottom">${bulb(14)}</div>
      </div>
    </div>`;
}
/** Pratinjau mesin slot yang STATIS (tidak berputar, tidak ada JS interval) —
 *  ditampilkan tepat di bawah hitung mundur SELAMA belum waktunya kocok,
 *  supaya area "Arisan Tanteh Susi" selalu punya mesin slotnya kelihatan,
 *  bukan cuma muncul mendadak pas live. Dekoratif & ringan: cuma HTML+CSS,
 *  kedip lampu bulb tetap ada (CSS animation ringan), tapi reel-nya diam. */
function arisanIdleSlotHtml(eligible){
  const bulb = (n)=>Array.from({length:n}).map((_,i)=>`<span class="slot-bulb" style="--i:${i}"></span>`).join("");
  const pick = (i)=> eligible && eligible.length ? eligible[i % eligible.length] : null;
  const cellHtml = (m)=> m
    ? `<div class="slot-cell"><span class="slot-avatar" style="background:${avatarBg(arisanColorFor(m.nama))}">${initials(m.nama)}</span></div>`
    : `<div class="slot-cell"><span class="slot-avatar" style="background:var(--bg-elev);color:var(--ink-faint);">?</span></div>`;
  const reels = [0,1,2].map(i=>`<div class="slot-reel-window is-idle"><div class="slot-reel-strip is-idle">${cellHtml(pick(i))}</div></div>`).join("");
  return `
  <div class="arisan-live-card arisan-idle-card">
    <div class="wheel-status-label">🎰 Mesin kocok siap — menanti jadwal kocokan berikutnya</div>
    <div class="slot-machine">
      <div class="slot-inner">
        <div class="slot-marquee">${bulb(14)}</div>
        <div class="slot-reels-row">
          ${reels}
          <div class="slot-payline"><span class="pl-arrow left"></span><span class="pl-arrow right"></span></div>
        </div>
        <div class="slot-marquee bottom">${bulb(14)}</div>
      </div>
    </div>
  </div>`;
}
/** Bar tipis di bawah reel yang mengisi penuh selama total durasi kocokan,
 *  sekadar penanda "masih berjalan, ini progresnya" biar 30 detik tidak
 *  terasa diam/macet. Dekoratif saja, tidak memengaruhi hasil. */
function _startSlotProgress(idPrefix, elapsedMs){
  const fill = document.getElementById(idPrefix+"Progress");
  if(!fill) return;
  const remainMs = Math.max(0, SLOT_TOTAL_MS - elapsedMs);
  const startPct = Math.min(100, (elapsedMs/SLOT_TOTAL_MS)*100);
  fill.style.transition = "none";
  fill.style.width = startPct+"%";
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    fill.style.transition = `width ${remainMs/1000}s linear`;
    fill.style.width = "100%";
  }));
}
/** Jalankan 1 reel sampai berhenti presisi di finalY, dengan dukungan
 *  elapsedMs>0 untuk "menyusul" animasi yang sudah berjalan di client lain. */
function _runReelSync(strip, finalY, cfg, elapsedMs, onDone){
  const totalMs = cfg.totalSec*1000;
  if(elapsedMs >= totalMs){
    strip.style.transition = "none";
    strip.style.transform = `translateY(${finalY}px)`;
    onDone();
    return;
  }
  const fastMs = totalMs*(1-cfg.slowPortion);
  const slowMs = totalMs-fastMs;
  const fastDist = finalY*(1-cfg.slowPortion*0.55);
  const startSlowPhase = ()=>{
    requestAnimationFrame(()=>{
      strip.style.transition = `transform ${slowMs/1000}s ${cfg.ease}`;
      strip.style.transform = `translateY(${finalY}px)`;
    });
    strip.addEventListener("transitionend", function done(e){
      if(e.propertyName!=="transform") return;
      strip.removeEventListener("transitionend", done);
      onDone();
    });
  };
  if(elapsedMs < fastMs){
    const startY = elapsedMs>0 ? fastDist*(elapsedMs/fastMs) : 0;
    strip.style.transition = "none";
    strip.style.transform = `translateY(${startY}px)`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      strip.style.transition = `transform ${(fastMs-elapsedMs)/1000}s linear`;
      strip.style.transform = `translateY(${fastDist}px)`;
    }));
    strip.addEventListener("transitionend", function toSlow(e){
      if(e.propertyName!=="transform") return;
      strip.removeEventListener("transitionend", toSlow);
      startSlowPhase();
    });
  } else {
    const remainMs = totalMs-elapsedMs;
    strip.style.transition = "none";
    strip.style.transform = `translateY(${fastDist}px)`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      strip.style.transition = `transform ${remainMs/1000}s ${cfg.ease}`;
      strip.style.transform = `translateY(${finalY}px)`;
    }));
    strip.addEventListener("transitionend", function done(e){
      if(e.propertyName!=="transform") return;
      strip.removeEventListener("transitionend", done);
      onDone();
    });
  }
}
/** Jalankan seluruh mesin slot (dipakai admin & widget live tamu).
 *  elapsedMs=0 untuk mulai dari awal (admin memicu kocokan baru). */
function runSlotMachineSpin(idPrefix, eligible, winner, elapsedMs, onAllSettled, onReelSettle){
  let settledCount = 0;
  SLOT_REEL_TIMING.forEach((cfg,i)=>{
    const strip = document.getElementById(idPrefix+"Reel"+i);
    if(!strip) return;
    const { html, targetIndex } = _buildSlotReelHtml(eligible, winner, cfg.laps);
    strip.innerHTML = html;
    const finalY = -(targetIndex-1) * SLOT_CELL;
    _runReelSync(strip, finalY, cfg, elapsedMs, ()=>{
      strip.closest(".slot-reel-window")?.classList.add("is-settled");
      settledCount++;
      if(onReelSettle) onReelSettle(settledCount, SLOT_REEL_TIMING.length);
      if(settledCount===SLOT_REEL_TIMING.length && onAllSettled) onAllSettled();
    });
  });
}
/** Mulai kocokan baru: pilih pemenang & siarkan ke Firestore SEBELUM animasi
 *  lokal jalan, supaya semua tamu yang sedang membuka halaman Arisan Tanteh
 *  Susi ikut melihat kocokan ini live, tersinkron ke pemenang & waktu yang
 *  sama persis (lihat bindArisanPage). Dipakai baik dari tombol
 *  "Kocok Sekarang!" (manual) maupun pemicu otomatis saat hitung mundur habis. */
function startArisanDraw(batch){
  const eligible = arisanEligibleMembers(batch);
  if(!eligible.length){ toast("Tidak ada anggota yang eligible untuk dikocok","err"); return; }
  const winner = eligible[Math.floor(Math.random()*eligible.length)];
  batch.liveDraw = {
    active: true, winnerId: winner.id, winnerNama: winner.nama,
    round: batch.currentRound+1, startedAt: Date.now(), durationMs: SLOT_TOTAL_MS,
  };
  saveArisanList();
}
/** Ikat mesin slot yang tertanam LANGSUNG di bawah kartu hitung mundur pada
 *  dashboard admin (lihat secArisanBatchHtml) ke kocokan yang sedang live,
 *  memakai engine sinkron waktu yang sama dengan widget tamu
 *  (bindArisanLiveWidget) — jadi kalau admin reload atau berpindah menu lalu
 *  kembali, reel otomatis "menyusul" ke posisi & sisa waktu yang benar,
 *  bukan mengulang dari 0. */
function bindArisanAdminLiveWidget(batch){
  const card = document.getElementById("adDrawCard");
  if(!card) return;
  const liveInfo = arisanLiveDrawInfo(batch);
  if(!liveInfo) return;
  const eligible = arisanEligibleMembers(batch);
  const winner = eligible.find(m=>m.id===liveInfo.winnerId) || { id: liveInfo.winnerId, nama: liveInfo.winnerNama };
  const status = document.getElementById("adWheelStatus");
  const machine = document.getElementById("adDrawMachine");
  const resultEl = document.getElementById("adDrawResult");
  const actionsEl = document.getElementById("adDrawActions");

  function showResult(){
    machine?.classList.remove("is-spinning");
    machine?.classList.add("is-jackpot");
    if(status) status.textContent = `🎉 Pemenangnya adalah ${winner.nama}!`;
    resultEl.style.display = "flex";
    document.getElementById("adDrawWinnerName").textContent = winner.nama;
    spawnConfetti(document.getElementById("adDrawConfetti"));
    actionsEl.style.visibility = "visible";
  }

  if(liveInfo.elapsed >= liveInfo.durationMs){
    // Reel harusnya sudah berhenti (mis. admin sempat pindah tab) — langsung
    // render posisi akhir yang benar, tanpa animasi, lalu tampilkan hasil.
    SLOT_REEL_TIMING.forEach((cfg,i)=>{
      const strip = document.getElementById("adDrawReel"+i);
      if(!strip) return;
      const { html, targetIndex } = _buildSlotReelHtml(eligible, winner, cfg.laps);
      strip.innerHTML = html;
      strip.style.transition = "none";
      strip.style.transform = `translateY(${-(targetIndex-1)*SLOT_CELL}px)`;
      strip.closest(".slot-reel-window")?.classList.add("is-settled");
    });
    const prog = document.getElementById("adDrawProgress");
    if(prog){ prog.style.transition = "none"; prog.style.width = "100%"; }
    showResult();
  } else {
    machine?.classList.add("is-spinning");
    if(status) status.textContent = `🔴 LIVE — mengocok ${eligible.length} peserta…`;
    _startSlotProgress("adDraw", liveInfo.elapsed);
    runSlotMachineSpin("adDraw", eligible, winner, liveInfo.elapsed,
      showResult,
      (settled, total)=>{
        if(!status || settled>=total) return;
        status.textContent = settled===total-1 ? "🔴 LIVE — reel terakhir masih berputar… tahan napas!" : `🔴 LIVE — reel ${settled}/${total} berhenti…`;
      }
    );
  }

  document.getElementById("adDrawCancel")?.addEventListener("click", ()=>{
    toast("Diulang — mengocok ulang pemenang baru");
    startArisanDraw(batch);
    refreshAdminContent();
  });
  document.getElementById("adDrawConfirm")?.addEventListener("click", ()=>{
    const today = new Date().toISOString().slice(0,10);
    const mem = batch.members.find(x=>x.id===winner.id);
    mem.sudahMenang = true;
    mem.menangRound = batch.currentRound+1;
    mem.menangTgl = today;
    batch.drawHistory.push({ round: batch.currentRound+1, tgl: today, winnerId: winner.id, winnerNama: winner.nama });
    batch.currentRound += 1; // otomatis menggeser jadwal kocokan berikutnya +1 bulan (lihat arisanNextDrawDate)
    const stillEligible = arisanEligibleMembers(batch);
    if(stillEligible.length===0) batch.status = "selesai";
    batch.liveDraw = { active:false }; // tutup siaran live di halaman tamu
    saveArisanList();
    toast(`🎉 ${winner.nama} menang ronde ${mem.menangRound}! Tersimpan ke riwayat.`);
    refreshAdminContent();
  });
}
function spawnConfetti(container){
  if(!container) return;
  const colors = ["#F0A93A","#3D7A5D","#B34632","#2C5A88","#D6488E"];
  let html = "";
  for(let i=0;i<36;i++){
    const left = Math.random()*100;
    const delay = (Math.random()*0.4).toFixed(2);
    const dur = (1.4+Math.random()*0.9).toFixed(2);
    const color = colors[i%colors.length];
    const rot = Math.floor(Math.random()*360);
    html += `<span class="confetti-piece" style="left:${left}%;background:${color};animation-delay:${delay}s;animation-duration:${dur}s;--rot:${rot}deg;"></span>`;
  }
  container.innerHTML = html;
}

function secDashboard(){
  const t = totals(DB.tx);
  const activeCount = DB.members.filter(m=>m.status==="active").length;
  const recent = [...DB.tx].sort((a,b)=>b.tgl.localeCompare(a.tgl)).slice(0,6);
  const ranking = depositRanking().slice(0,5);

  const months = [...new Set(DB.tx.map(x=>fmtMonthKey(x.tgl)))].sort().slice(-6);
  const perMonth = months.map(k=>{
    const list = DB.tx.filter(x=>fmtMonthKey(x.tgl)===k);
    return { k, ...totals(list) };
  });
  const maxVal = Math.max(...perMonth.map(m=>Math.max(m.masuk,m.keluar)),1);

  return `
    <div class="admin-topline">
      <div><h2>Dashboard</h2><div class="sub">Ringkasan kondisi kas hari ini</div></div>
      <button class="btn btn-primary" id="quickAddBtn">${icon('plus')}<span>Tambah Transaksi</span></button>
    </div>
    ${pendingRequestCount()>0 ? `
    <div class="alert-banner" id="goPengajuanAlertBtn">
      ${icon('inbox')}
      <span><b>${pendingRequestCount()} pengajuan pembelian</b> menunggu persetujuan kamu.</span>
      <span class="alert-cta">Lihat &rarr;</span>
    </div>` : ""}
    <div class="stat-grid">
      <div class="stat-card accent reveal"><div class="stat-card-top"><span class="stat-card-icon">${icon('sheet')}</span><div class="label">Saldo Kas</div></div><div class="value mono">${rupiah(t.saldo)}</div></div>
      <div class="stat-card tone-forest reveal"><div class="stat-card-top"><span class="stat-card-icon">${icon('up')}</span><div class="label">Total Masuk</div></div><div class="value mono">${rupiah(t.masuk)}</div></div>
      <div class="stat-card tone-rust reveal"><div class="stat-card-top"><span class="stat-card-icon">${icon('down')}</span><div class="label">Total Keluar</div></div><div class="value mono">${rupiah(t.keluar)}</div></div>
      <div class="stat-card tone-blue reveal"><div class="stat-card-top"><span class="stat-card-icon">${icon('users')}</span><div class="label">Anggota Aktif</div></div><div class="value mono">${activeCount}/${DB.members.length}</div></div>
    </div>
    <div class="split">
      <div class="panel">
        <div class="panel-head"><h3>Arus Kas 6 Bulan Terakhir</h3><span class="hint"><span style="color:var(--forest);">●</span> Masuk &nbsp; <span style="color:var(--rust);">●</span> Keluar</span></div>
        <div class="mini-bar-wrap">
          ${perMonth.map(m=>`
            <div style="flex:1;display:flex;gap:3px;align-items:flex-end;height:100%;">
              <div class="mini-bar" title="Masuk ${rupiah(m.masuk)}" style="height:${Math.max(2,(m.masuk/maxVal*100))}%;background:var(--forest);"></div>
              <div class="mini-bar" title="Keluar ${rupiah(m.keluar)}" style="height:${Math.max(2,(m.keluar/maxVal*100))}%;background:var(--rust);"></div>
            </div>
          `).join("")}
        </div>
        <div class="mini-bar-labels">${perMonth.map(m=>`<span>${monthLabel(m.k)}</span>`).join("")}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><h3>🏆 Peringkat Setoran</h3><span class="hint"><a href="javascript:void(0)" id="goAnggotaBtn" style="color:var(--ink-soft);text-decoration:underline;">lihat semua</a></span></div>
        <div class="rank-list">
          ${ranking.map((r,i)=>{
            const m = memberById(r.id);
            const isOff = m && m.status==='off';
            return `
            <div class="rank-row ${isOff?'off-member':''} ${i<3?'podium podium-'+(i+1):''}" style="cursor:default;">
              <span class="rank-no ${i<3?'top'+(i+1):''}">${i+1}</span>
              ${avatarHtml(r.id)}
              <span class="rank-name"><span class="rank-name-text">${nameOf(r.id)}</span>${isOff ? '<span class="off-tag">nonaktif</span>' : ''}</span>
              <div class="rank-figures">
                <span class="rank-amt">${rupiah(r.total)}</span>
                <span class="rank-pct">${r.pct.toFixed(1)}%</span>
              </div>
              ${rankBreakdownHtml(r,true)}
            </div>
          `;}).join("") || `<div class="empty-row">Belum ada data.</div>`}
        </div>
      </div>
    </div>
    <div class="panel" style="margin-top:14px;">
        <div class="panel-head"><h3>Aktivitas Terbaru</h3></div>
        ${excelTableHtml(recent, false)}
    </div>
  `;
}

function secTransaksi(){
  return `
    <div class="admin-topline">
      <div><h2>Transaksi</h2><div class="sub">Kelola semua data kas masuk &amp; keluar</div></div>
      <button class="btn btn-primary" id="addTxBtn">${icon('plus')}<span>Tambah Transaksi</span></button>
    </div>
    ${excelPanelHtml(true)}
  `;
}

function secAnggota(){
  return `
    <div class="admin-topline">
      <div><h2>Anggota</h2><div class="sub">${DB.members.length} anggota terdaftar</div></div>
      <button class="btn btn-primary" id="addMemberBtn">${icon('plus')}<span>Tambah Anggota</span></button>
    </div>
    <div class="card-grid">
      ${DB.members.map((m,i)=>{
        const myTx = DB.tx.filter(t=>t.admin===m.id);
        const tot = totals(myTx);
        return `
        <div class="member-card" style="--m-color:${m.color};--i:${i};">
          <div class="member-head">
            ${avatarHtml(m.id)}
            <div class="member-head-text">
              <span class="mname">${m.nama}</span>
              <span class="mrole">Sejak ${fmtDate(m.sejak)}</span>
            </div>
          </div>
          <div class="mtotal mono">${rupiah(tot.saldo)}</div>
          <div class="mlabel">sisa saldo kas pribadi</div>
          <div class="rank-breakdown compact" style="margin:6px 0 10px;">
            <div class="rb-chip rb-in"><span class="rb-chip-label">Setor</span><span class="rb-chip-val mono">${rupiah(tot.masuk)}</span></div>
            <span class="rb-op">&minus;</span>
            <div class="rb-chip rb-out"><span class="rb-chip-label">Keluar</span><span class="rb-chip-val mono">${rupiah(tot.keluar)}</span></div>
          </div>
          <span class="stamp ${m.status}">${m.status==='active'?'Aktif':'Nonaktif'}</span>
          <div class="member-actions">
            <button class="btn btn-sm" data-edit-member="${m.id}">${icon('edit')}Edit</button>
            <button class="btn btn-sm ${m.status==='active'?'btn-danger':''}" data-toggle-status="${m.id}">${m.status==='active' ? 'Nonaktifkan' : 'Aktifkan'}</button>
            <button class="btn btn-sm btn-danger" data-del-member="${m.id}" title="Hapus anggota">${icon('trash')}</button>
          </div>
        </div>`;
      }).join("")}
    </div>
  `;
}

function secHistori(){
  const offMembers = DB.members.filter(m=>m.status==="off");
  return `
    <div class="admin-topline">
      <div><h2>Histori Anggota Nonaktif</h2><div class="sub">Data tetap tersimpan walau anggota sudah off</div></div>
    </div>
    ${offMembers.length===0 ? `<div class="panel"><p style="color:var(--ink-soft);">Belum ada anggota yang dinonaktifkan.</p></div>` : offMembers.map(m=>{
      const myTx = DB.tx.filter(t=>t.admin===m.id).sort((a,b)=>b.tgl.localeCompare(a.tgl));
      const tot = totals(myTx);
      return `
      <div class="panel" style="margin-bottom:16px;">
        <div class="panel-head">
          <h3><span class="avatar-mini" style="background:${avatarBg(colorOf(m.id))};width:26px;height:26px;line-height:26px;font-size:11px;">${initials(m.nama)}</span>${m.nama} <span class="stamp off" style="font-size:9px;">Nonaktif sejak ${m.offSejak?fmtDate(m.offSejak):'-'}</span></h3>
          <span class="hint mono">Total masuk ${rupiah(tot.masuk)} · keluar ${rupiah(tot.keluar)}</span>
        </div>
        ${m.catatan ? `<p style="font-size:12.5px;color:var(--ink-soft);margin-bottom:12px;">${escapeHtml(m.catatan)}</p>` : ""}
        ${excelTableHtml(myTx, false)}
      </div>`;
    }).join("")}
  `;
}

function secLaporan(){
  const months = [...new Set(DB.tx.map(x=>fmtMonthKey(x.tgl)))].sort();
  const rows = months.map(k=>{
    const list = DB.tx.filter(x=>fmtMonthKey(x.tgl)===k);
    return { k, ...totals(list) };
  });
  return `
    <div class="admin-topline"><div><h2>Laporan Bulanan</h2><div class="sub">Rekap masuk/keluar per bulan</div></div></div>
    <div class="panel">
      <div style="overflow-x:auto;">
      <table class="ledger">
        <thead><tr><th>Bulan</th><th>Masuk</th><th>Keluar</th><th>Saldo Bulan</th></tr></thead>
        <tbody>${rows.map(r=>`
          <tr><td data-label="Bulan">${monthLabel(r.k)}</td>
          <td data-label="Masuk" class="mono">${rupiah(r.masuk)}</td>
          <td data-label="Keluar" class="mono">${rupiah(r.keluar)}</td>
          <td data-label="Saldo" class="mono" style="font-weight:700;">${rupiah(r.saldo)}</td></tr>
        `).join("")}</tbody>
      </table>
      </div>
    </div>
  `;
}

/* ---------------- MODALS ---------------- */
function openModal(html){
  document.getElementById("modalBody").innerHTML = html;
  document.getElementById("modalOverlay").classList.add("open");
}
function closeModal(){
  document.getElementById("modalOverlay").classList.remove("open");
}

function txFormModal(existing){
  const isEdit = !!existing;
  const ids = DB.members.map(m=>m.id); // "UANG RIBA" sudah termasuk (anggota resmi)
  const jenis = existing ? (existing.bkb>0 ? "keluar" : "masuk") : "masuk";
  const jumlah = existing ? (existing.bkb>0 ? existing.bkb : existing.btb) : 0;
  return `
    <div class="modal-head"><h3>${isEdit?'Ubah':'Tambah'} Transaksi</h3><button class="icon-btn" id="modalClose">&times;</button></div>
    <div class="field"><label>Tanggal</label><input type="date" id="txTgl" value="${existing?.tgl || new Date().toISOString().slice(0,10)}"></div>
    <div class="form-row2">
      <div class="field"><label>Admin</label><select id="txAdmin">${ids.map(id=>`<option value="${id}" ${existing?.admin===id?'selected':''}>${nameOf(id)}</option>`).join("")}</select></div>
      <div class="field"><label>Shift</label><select id="txShift">${["Non Shift","Shift 1","Shift 2","Shift 3"].map(s=>`<option ${(existing?.shift||"Non Shift")===s?'selected':''}>${s}</option>`).join("")}</select></div>
    </div>
    <div class="form-row2">
      <div class="field"><label>Jenis</label><select id="txJenis">
        <option value="masuk" ${jenis==='masuk'?'selected':''}>Kas Masuk</option>
        <option value="keluar" ${jenis==='keluar'?'selected':''}>Kas Keluar</option>
      </select></div>
      <div class="field"><label>Jumlah (Rp)</label><input type="number" id="txJumlah" value="${jumlah||0}"></div>
    </div>
    <div class="field"><label>Keterangan</label><input type="text" id="txKet" placeholder="mis. Beli pulpen 4 box (kosongkan jika tidak ada)" value="${existing?escapeHtml(existing.ket):''}"></div>
    <div class="modal-actions">
      <button class="btn" id="modalClose2">Batal</button>
      <button class="btn btn-primary" id="txSave">${icon('plus')}<span>${isEdit?'Simpan Perubahan':'Simpan Transaksi'}</span></button>
    </div>
  `;
}

function memberFormModal(existing){
  const isEdit = !!existing;
  return `
    <div class="modal-head"><h3>${isEdit?'Ubah':'Tambah'} Anggota</h3><button class="icon-btn" id="modalClose">&times;</button></div>
    <div class="field"><label>Nama</label><input type="text" id="mNama" value="${existing?escapeHtml(existing.nama):''}" placeholder="mis. Sinta"></div>
    <div class="field"><label>Warna Tab</label>
      <div class="color-picker" id="colorPicker">
        ${COLOR_CHOICES.map(c=>`<div class="color-swatch ${existing?.color===c?'selected':''}" style="background:${c}" data-color="${c}"></div>`).join("")}
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn" id="modalClose2">Batal</button>
      <button class="btn btn-primary" id="memberSave">${icon('plus')}<span>${isEdit?'Simpan Perubahan':'Simpan Anggota'}</span></button>
    </div>
  `;
}

function reqFormModal(existing){
  const actives = activeMembers();
  const checkedSet = new Set(existing.admins);
  return `
    <div class="modal-head"><h3>Ubah Pengajuan Pembelian</h3><button class="icon-btn" id="modalClose">&times;</button></div>
    <div class="field"><label>Keterangan Barang/Jasa</label><textarea id="reqKet" rows="2">${escapeHtml(existing.keterangan)}</textarea></div>
    <div class="form-row2">
      <div class="field"><label>Nominal (Rp)</label><input type="number" id="reqNominal" value="${existing.nominal}"></div>
      <div class="field"><label>Tanggal</label><input type="date" id="reqTgl" value="${existing.tgl}"></div>
    </div>
    <div class="field">
      <label>Sumber Dana</label>
      <div class="sheet-tabs" id="reqModeTabs" style="width:100%;">
        <button class="sheet-tab ${existing.mode==='solo'?'active':''}" data-mode="solo" style="flex:1;">Solo (1 Admin)</button>
        <button class="sheet-tab ${existing.mode==='patungan'?'active':''}" data-mode="patungan" style="flex:1;">Patungan</button>
      </div>
    </div>
    <div class="field" id="reqAdminWrap">
      ${existing.mode==='solo' ? `
        <label>Admin</label>
        <select id="reqSoloAdmin">${actives.map(m=>`<option value="${m.id}" ${existing.admins[0]===m.id?'selected':''}>${m.nama}</option>`).join("")}</select>
      ` : `
        <label>Admin Patungan</label>
        <div class="check-list">
          ${actives.map(m=>`
            <label class="check-row">
              <input type="checkbox" data-req-patungan="${m.id}" ${checkedSet.has(m.id)?'checked':''}>
              ${avatarHtml(m.id,"sm")}<span>${m.nama}</span>
            </label>
          `).join("")}
        </div>
      `}
    </div>
    <div class="field"><label>Nama Pemohon</label><input type="text" id="reqPemohon" value="${escapeHtml(existing.pemohon||'')}"></div>
    <div class="modal-actions">
      <button class="btn" id="modalClose2">Batal</button>
      <button class="btn btn-primary" id="reqSave">${icon('plus')}<span>Simpan Perubahan</span></button>
    </div>
  `;
}

function bindReqForm(existing){
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalClose2").addEventListener("click", closeModal);
  let mode = existing.mode;
  let patunganSet = new Set(existing.admins);

  function renderAdminWrap(){
    const actives = activeMembers();
    const wrap = document.getElementById("reqAdminWrap");
    if(mode==='solo'){
      wrap.innerHTML = `
        <label>Admin</label>
        <select id="reqSoloAdmin">${actives.map(m=>`<option value="${m.id}" ${existing.admins[0]===m.id?'selected':''}>${m.nama}</option>`).join("")}</select>
      `;
    } else {
      wrap.innerHTML = `
        <label>Admin Patungan</label>
        <div class="check-list">
          ${actives.map(m=>`
            <label class="check-row">
              <input type="checkbox" data-req-patungan="${m.id}" ${patunganSet.has(m.id)?'checked':''}>
              ${avatarHtml(m.id,"sm")}<span>${m.nama}</span>
            </label>
          `).join("")}
        </div>
      `;
      wireReqPatunganChecks();
    }
  }
  function wireReqPatunganChecks(){
    document.querySelectorAll("[data-req-patungan]").forEach(cb=>{
      cb.addEventListener("change", ()=>{
        if(cb.checked) patunganSet.add(cb.dataset.reqPatungan); else patunganSet.delete(cb.dataset.reqPatungan);
      });
    });
  }
  if(mode==='patungan') wireReqPatunganChecks();

  document.querySelectorAll("#reqModeTabs [data-mode]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      mode = btn.dataset.mode;
      document.querySelectorAll("#reqModeTabs [data-mode]").forEach(b=>b.classList.toggle("active", b===btn));
      renderAdminWrap();
    });
  });

  document.getElementById("reqSave").addEventListener("click", ()=>{
    const ket = document.getElementById("reqKet").value.trim();
    const nominal = Number(document.getElementById("reqNominal").value)||0;
    const tgl = document.getElementById("reqTgl").value;
    const pemohon = document.getElementById("reqPemohon").value.trim();
    if(!ket){ toast("Keterangan wajib diisi","err"); return; }
    if(nominal<=0){ toast("Nominal harus lebih dari 0","err"); return; }
    let admins = [];
    if(mode==='solo'){
      const sel = document.getElementById("reqSoloAdmin").value;
      if(!sel){ toast("Pilih admin","err"); return; }
      admins = [sel];
    } else {
      admins = [...patunganSet];
      if(admins.length===0){ toast("Pilih minimal 1 admin untuk patungan","err"); return; }
    }
    existing.keterangan = ket;
    existing.nominal = nominal;
    existing.tgl = tgl || existing.tgl;
    existing.pemohon = pemohon || "Tamu";
    existing.mode = mode;
    existing.admins = admins;
    saveRequests(DB.requests);
    toast("Pengajuan diperbarui");
    closeModal();
    refreshAdminContent();
  });
}

/* ---------------- BIND ADMIN ---------------- */
function refreshAdminContent(){
  document.getElementById("adminContent").innerHTML = adminContentHtml();
  bindAdminContentEvents();
  if(state.adminSection==="arisan"){
    startCountdownTicker("adCd");
    const batch = activeArisanBatch();
    if(batch) bindArisanAdminLiveWidget(batch);
  }
}

function bindAdmin(){
  document.getElementById("themeBtnA").addEventListener("click", ()=>{ toggleTheme(); render(); });
  document.getElementById("viewGuestBtn").addEventListener("click", ()=> goto("/"));
  document.getElementById("themeBtnM")?.addEventListener("click", ()=>{ toggleTheme(); render(); });
  document.getElementById("mAdminExportExcel")?.addEventListener("click", ()=>{ exportExcel(getFilteredTxList(true)); closeAdminMobileMenu(); });
  document.getElementById("mAdminExportPdf")?.addEventListener("click", ()=>{ exportPdf(getFilteredTxList(true)); closeAdminMobileMenu(); });
  document.getElementById("viewGuestBtnM")?.addEventListener("click", ()=> goto("/"));
  const doLogout = async ()=>{
    await FJHT.signOutAdmin();
    toast("Berhasil keluar");
    goto("/");
  };
  document.getElementById("logoutBtn").addEventListener("click", doLogout);
  document.getElementById("logoutBtnM")?.addEventListener("click", doLogout);
  document.getElementById("adminHamburgerBtn")?.addEventListener("click", (e)=>{
    e.stopPropagation();
    document.getElementById("adminMobileMenuPanel")?.classList.toggle("open");
  });
  document.querySelectorAll("[data-sec]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      state.adminSection = btn.dataset.sec; state.filterText=""; state.filterAdmin=""; state.filterMonth="";
      refreshAdminContent(); syncNavActive(); closeAdminMobileMenu();
    });
  });
  document.getElementById("modalOverlay").addEventListener("click", e=>{ if(e.target.id==="modalOverlay") closeModal(); });
  refreshAdminContent();
}
function closeAdminMobileMenu(){ document.getElementById("adminMobileMenuPanel")?.classList.remove("open"); }
document.addEventListener("click", (e)=>{
  const panel = document.getElementById("adminMobileMenuPanel");
  if(panel && panel.classList.contains("open") && !panel.contains(e.target) && !e.target.closest("#adminHamburgerBtn")){
    closeAdminMobileMenu();
  }
});

function syncNavActive(){
  document.querySelectorAll("[data-sec]").forEach(b=>b.classList.toggle("active", b.dataset.sec===state.adminSection));
}

function bindAdminContentEvents(){
  // dashboard quick add
  document.getElementById("quickAddBtn")?.addEventListener("click", ()=>{ openModal(txFormModal(null)); bindTxForm(null); });
  document.getElementById("goPengajuanAlertBtn")?.addEventListener("click", ()=>{ state.adminSection="pengajuan"; refreshAdminContent(); syncNavActive(); });
  document.getElementById("goAnggotaBtn")?.addEventListener("click", ()=>{ state.adminSection="anggota"; refreshAdminContent(); syncNavActive(); });
  document.getElementById("addTxBtn")?.addEventListener("click", ()=>{ openModal(txFormModal(null)); bindTxForm(null); });
  document.getElementById("addMemberBtn")?.addEventListener("click", ()=>{ openModal(memberFormModal(null)); bindMemberForm(null); });

  // pengajuan pembelian: ACC / Tolak
  document.querySelectorAll("[data-acc]").forEach(b=>{
    b.addEventListener("click", ()=>{
      if(confirm("Setujui pengajuan ini? Nominal akan otomatis tercatat sebagai kas keluar.")){
        approveRequest(b.dataset.acc);
        refreshAdminContent();
      }
    });
  });
  document.querySelectorAll("[data-tolak]").forEach(b=>{
    b.addEventListener("click", ()=>{
      rejectRequest(b.dataset.tolak);
      refreshAdminContent();
    });
  });

  // arisan tanteh susi
  document.getElementById("arisanNewBatchBtn")?.addEventListener("click", ()=>{
    openModal(arisanBatchFormModal()); bindArisanBatchForm();
  });
  document.getElementById("arisanStartBtn")?.addEventListener("click", ()=>{
    const batch = activeArisanBatch();
    if(!batch) return;
    if(confirm("Tutup pendaftaran & mulai arisan? Anggota yang masih menunggu ACC akan otomatis ditolak.")){
      batch.members.forEach(m=>{ if(m.status==="pending") m.status="rejected"; });
      batch.status = "berjalan";
      saveArisanList();
      toast("Arisan dimulai! Countdown kocokan pertama aktif.");
      refreshAdminContent();
    }
  });
  document.getElementById("arisanDrawBtn")?.addEventListener("click", ()=>{
    const batch = activeArisanBatch();
    if(!batch) return;
    startArisanDraw(batch);
    refreshAdminContent();
  });
  document.getElementById("arisanDeleteBatchBtn")?.addEventListener("click", ()=>{
    const batch = activeArisanBatch();
    if(!batch) return;
    if(confirm(`Hapus batch "${batch.nama}"? Semua data pendaftar & riwayat kocokan batch ini ikut terhapus.`)){
      DB.arisan = DB.arisan.filter(a=>a.id!==batch.id);
      saveArisanList();
      toast("Batch arisan dihapus");
      refreshAdminContent();
    }
  });
  document.querySelectorAll("[data-arisan-acc]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const [batchId, memberId] = b.dataset.arisanAcc.split("|");
      const batch = DB.arisan.find(a=>a.id===batchId);
      const mem = batch?.members.find(m=>m.id===memberId);
      if(!mem) return;
      mem.status = "approved";
      saveArisanList();
      toast(`${mem.nama} disetujui ikut arisan`);
      refreshAdminContent();
    });
  });
  document.querySelectorAll("[data-arisan-tolak]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const [batchId, memberId] = b.dataset.arisanTolak.split("|");
      const batch = DB.arisan.find(a=>a.id===batchId);
      const mem = batch?.members.find(m=>m.id===memberId);
      if(!mem) return;
      mem.status = "rejected";
      saveArisanList();
      toast(`Pendaftaran ${mem.nama} ditolak`);
      refreshAdminContent();
    });
  });
  document.querySelectorAll("[data-arisan-remove]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const [batchId, memberId] = b.dataset.arisanRemove.split("|");
      const batch = DB.arisan.find(a=>a.id===batchId);
      if(!batch) return;
      const mem = batch.members.find(m=>m.id===memberId);
      if(mem && confirm(`Keluarkan ${mem.nama} dari arisan ini?`)){
        batch.members = batch.members.filter(m=>m.id!==memberId);
        saveArisanList();
        toast(`${mem.nama} dikeluarkan dari arisan`);
        refreshAdminContent();
      }
    });
  });
  document.querySelectorAll("[data-del-arisan-batch]").forEach(b=>{
    b.addEventListener("click", ()=>{
      if(confirm("Hapus riwayat batch arisan ini secara permanen?")){
        DB.arisan = DB.arisan.filter(a=>a.id!==b.dataset.delArisanBatch);
        saveArisanList();
        toast("Riwayat batch dihapus");
        refreshAdminContent();
      }
    });
  });

  // filters (transaksi section)
  document.getElementById("aText")?.addEventListener("input", e=>{ state.filterText=e.target.value; refreshAdminContent(); });
  document.getElementById("aAdmin")?.addEventListener("change", e=>{ state.filterAdmin=e.target.value; refreshAdminContent(); });
  document.getElementById("aMonth")?.addEventListener("change", e=>{ state.filterMonth=e.target.value; refreshAdminContent(); });
  document.querySelectorAll("#aTypeFilter .sheet-tab").forEach(btn=>{
    btn.addEventListener("click", ()=>{ state.adminTxFilter = btn.dataset.type; refreshAdminContent(); });
  });
  document.querySelectorAll("#aRowsFilter [data-rows]").forEach(btn=>{
    btn.addEventListener("click", ()=>{ state.viewRows = btn.dataset.rows==="all" ? "all" : Number(btn.dataset.rows); refreshAdminContent(); });
  });
  document.getElementById("aExportExcel")?.addEventListener("click", ()=> exportExcel(getFilteredTxList(true)));
  document.getElementById("aExportPdf")?.addEventListener("click", ()=> exportPdf(getFilteredTxList(true)));
  scrollExcelTablesToLatest();

  // edit / delete transaksi
  document.querySelectorAll("[data-edit]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const tx = DB.tx.find(t=>t.id===b.dataset.edit);
      openModal(txFormModal(tx)); bindTxForm(tx);
    });
  });
  document.querySelectorAll("[data-del]").forEach(b=>{
    b.addEventListener("click", ()=>{
      if(confirm("Hapus transaksi ini?")){
        DB.tx = DB.tx.filter(t=>t.id!==b.dataset.del);
        saveTx(DB.tx);
        toast("Transaksi dihapus");
        refreshAdminContent();
      }
    });
  });

  // anggota
  document.querySelectorAll("[data-edit-member]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const m = memberById(b.dataset.editMember);
      openModal(memberFormModal(m)); bindMemberForm(m);
    });
  });
  document.querySelectorAll("[data-toggle-status]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const m = memberById(b.dataset.toggleStatus);
      if(m.status==="active"){
        if(confirm(`Nonaktifkan ${m.nama}? Histori transaksi tetap tersimpan.`)){
          m.status = "off"; m.offSejak = new Date().toISOString().slice(0,10);
          saveMembers(DB.members); toast(`${m.nama} dinonaktifkan`); refreshAdminContent();
        }
      } else {
        m.status = "active"; delete m.offSejak;
        saveMembers(DB.members); toast(`${m.nama} diaktifkan kembali`); refreshAdminContent();
      }
    });
  });
  document.querySelectorAll("[data-del-member]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const m = memberById(b.dataset.delMember);
      if(!m) return;
      const hasTx = DB.tx.some(t=>t.admin===m.id);
      const warn = hasTx
        ? `${m.nama} masih punya histori transaksi. Menghapus anggota ini TIDAK menghapus histori transaksinya, tapi namanya tidak akan bisa dipilih lagi untuk transaksi baru. Lanjutkan hapus?`
        : `Hapus anggota ${m.nama}? Tindakan ini tidak bisa dibatalkan.`;
      if(confirm(warn)){
        DB.members = DB.members.filter(x=>x.id!==m.id);
        saveMembers(DB.members);
        toast(`${m.nama} dihapus dari daftar anggota`);
        refreshAdminContent();
      }
    });
  });

  // pengajuan pembelian: edit / hapus
  document.querySelectorAll("[data-edit-req]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const r = DB.requests.find(x=>x.id===b.dataset.editReq);
      if(r) { openModal(reqFormModal(r)); bindReqForm(r); }
    });
  });
  document.querySelectorAll("[data-del-req]").forEach(b=>{
    b.addEventListener("click", ()=>{
      if(confirm("Hapus pengajuan ini? Tindakan ini tidak bisa dibatalkan.")){
        DB.requests = DB.requests.filter(x=>x.id!==b.dataset.delReq);
        saveRequests(DB.requests);
        toast("Pengajuan dihapus");
        refreshAdminContent();
      }
    });
  });
}

function bindTxForm(existing){
  const close = ()=>closeModal();
  document.getElementById("modalClose").addEventListener("click", close);
  document.getElementById("modalClose2").addEventListener("click", close);
  document.getElementById("txSave").addEventListener("click", ()=>{
    const tgl = document.getElementById("txTgl").value;
    const admin = document.getElementById("txAdmin").value;
    const shift = document.getElementById("txShift").value;
    const jenis = document.getElementById("txJenis").value;
    const jumlah = Number(document.getElementById("txJumlah").value)||0;
    const ket = document.getElementById("txKet").value.trim();
    if(!tgl){ toast("Tanggal wajib diisi","err"); return; }
    if(jumlah<=0){ toast("Jumlah harus lebih dari 0","err"); return; }
    const btb = jenis==="masuk" ? jumlah : 0;
    const bkb = jenis==="keluar" ? jumlah : 0;
    const kat = jenis==="keluar" ? "pinjaman" : "kas";
    if(existing){
      Object.assign(existing, {tgl,admin,shift,btb,bkb,ket,kat});
      toast("Transaksi diperbarui");
    } else {
      DB.tx.push({ id: uid("tx"), tgl, admin, shift, btb, bkb, ket, kat });
      toast("Transaksi ditambahkan");
    }
    saveTx(DB.tx);
    closeModal();
    refreshAdminContent();
  });
}

function bindMemberForm(existing){
  let selectedColor = existing?.color || COLOR_CHOICES[0];
  const close = ()=>closeModal();
  document.getElementById("modalClose").addEventListener("click", close);
  document.getElementById("modalClose2").addEventListener("click", close);
  document.querySelectorAll("#colorPicker .color-swatch").forEach(sw=>{
    sw.addEventListener("click", ()=>{
      selectedColor = sw.dataset.color;
      document.querySelectorAll("#colorPicker .color-swatch").forEach(s=>s.classList.remove("selected"));
      sw.classList.add("selected");
    });
  });
  document.getElementById("memberSave").addEventListener("click", ()=>{
    const nama = document.getElementById("mNama").value.trim();
    if(!nama){ toast("Nama wajib diisi","err"); return; }
    if(existing){
      existing.nama = nama; existing.color = selectedColor;
      toast("Anggota diperbarui");
    } else {
      const id = nama.toUpperCase().replace(/\s+/g,"_");
      if(DB.members.some(m=>m.id===id)){ toast("Anggota dengan nama itu sudah ada","err"); return; }
      DB.members.push({ id, nama, color:selectedColor, status:"active", sejak:new Date().toISOString().slice(0,10) });
      toast("Anggota ditambahkan");
    }
    saveMembers(DB.members);
    closeModal();
    refreshAdminContent();
  });
}

/* ============================================================
   GAME CENTER — Catur (bebas), Ular Tangga, Monopoly (ringkas)
============================================================ */
const GAME_COLORS = ["#B34632","#2C5A88","#3D7A5D","#F0A93A"];

function showGameOverlay(){ document.getElementById("gameModalOverlay")?.classList.add("open"); }
function closeGameModal(){ document.getElementById("gameModalOverlay")?.classList.remove("open"); }
function bindGameClose(){ document.getElementById("gameCloseBtn")?.addEventListener("click", closeGameModal); }
document.getElementById("gameModalOverlay")?.addEventListener("click", (e)=>{
  if(e.target.id==="gameModalOverlay") closeGameModal();
});
document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeGameModal(); });

function openGameCenter(type){
  if(type==="catur") openChess();
  else if(type==="ular") openLadder();
  else if(type==="monopoli") openMonopoly();
}

/* ---- dadu (dipakai Ular Tangga & Monopoly) ---- */
const DICE_PATTERNS = { 1:[4], 2:[0,8], 3:[0,4,8], 4:[0,2,6,8], 5:[0,2,4,6,8], 6:[0,2,3,5,6,8] };
function diceDots(n){
  const on = new Set(DICE_PATTERNS[n]||[4]);
  let html = "";
  for(let i=0;i<9;i++) html += `<i class="${on.has(i)?'on':''}"></i>`;
  return html;
}

/* ---- setup pemain (dipakai Ular Tangga & Monopoly) ---- */
function playerSetupRowHtml(i){
  return `<div class="player-setup-row"><span class="player-dot" style="background:${GAME_COLORS[i]}"></span><input type="text" placeholder="Nama pemain ${i+1}" maxlength="14"></div>`;
}
function renderPlayerSetup({title, emoji, sub, onStart}){
  document.getElementById("gameModalBody").innerHTML = `
    <div class="game-head"><h3>${emoji} ${title}</h3><button class="icon-btn" id="gameCloseBtn">${icon('close')}</button></div>
    <div class="game-sub">${sub}</div>
    <div id="playerSetupRows">${[0,1].map(i=>playerSetupRowHtml(i)).join("")}</div>
    <button class="btn btn-sm" id="addPlayerBtn" style="margin-bottom:14px;">${icon('plus')}<span>Tambah Pemain</span></button>
    <button class="btn btn-primary" id="startGameBtn" style="width:100%;justify-content:center;">${icon('check')}<span>Mulai Main</span></button>
  `;
  bindGameClose();
  const rows = ()=>document.getElementById("playerSetupRows");
  document.getElementById("addPlayerBtn").addEventListener("click", ()=>{
    if(rows().children.length>=4) return;
    rows().insertAdjacentHTML("beforeend", playerSetupRowHtml(rows().children.length));
    if(rows().children.length>=4) document.getElementById("addPlayerBtn").classList.add("hidden");
  });
  document.getElementById("startGameBtn").addEventListener("click", ()=>{
    const names = [...rows().querySelectorAll("input")].map((inp,i)=> inp.value.trim() || `Pemain ${i+1}`);
    onStart(names.map((n,i)=>({ name:n, color:GAME_COLORS[i] })));
  });
}

/* ---------------- CATUR (mode bebas, tanpa validasi aturan) ---------------- */
let chessBoard=null, chessSel=null, chessTurn='w';
const CHESS_UNICODE = { w:{K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙'}, b:{K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞',P:'♟'} };
function initChessBoard(){
  const back = ['R','N','B','Q','K','B','N','R'];
  const b = Array.from({length:8},()=>Array(8).fill(null));
  for(let c=0;c<8;c++){
    b[0][c] = {t:back[c], color:'b'};
    b[1][c] = {t:'P', color:'b'};
    b[6][c] = {t:'P', color:'w'};
    b[7][c] = {t:back[c], color:'w'};
  }
  return b;
}
function openChess(){
  chessBoard = initChessBoard(); chessSel = null; chessTurn = 'w';
  showGameOverlay();
  renderChessModal();
}
function renderChessModal(){
  document.getElementById("gameModalBody").innerHTML = `
    <div class="game-head"><h3>♟️ Catur</h3><button class="icon-btn" id="gameCloseBtn">${icon('close')}</button></div>
    <div class="game-sub">Mode bebas — pilih bidak lalu ketuk kotak tujuan. Cocok untuk main santai berdua di satu perangkat.</div>
    <div class="game-toolbar">
      <span class="game-turn-badge"><span class="game-turn-dot" style="background:${chessTurn==='w'?'#f4f4f4':'#222'};border:1px solid var(--border);"></span>Giliran: ${chessTurn==='w'?'Putih':'Hitam'}</span>
      <button class="btn btn-sm" id="chessResetBtn">${icon('history')}<span>Ulang</span></button>
    </div>
    <div class="chess-board" id="chessBoardEl"></div>
  `;
  bindGameClose();
  const boardEl = document.getElementById("chessBoardEl");
  boardEl.innerHTML = chessBoard.map((row,r)=>row.map((cell,c)=>{
    const light = (r+c)%2===0;
    const isSel = chessSel && chessSel.r===r && chessSel.c===c;
    const piece = cell ? CHESS_UNICODE[cell.color][cell.t] : "";
    return `<div class="chess-cell ${light?'light':'dark'} ${isSel?'sel':''}" data-r="${r}" data-c="${c}">${piece}</div>`;
  }).join("")).join("");
  boardEl.querySelectorAll(".chess-cell").forEach(cellEl=>{
    cellEl.addEventListener("click", ()=>{
      const r = +cellEl.dataset.r, c = +cellEl.dataset.c;
      const cell = chessBoard[r][c];
      if(chessSel){
        const from = chessBoard[chessSel.r][chessSel.c];
        if(from && !(chessSel.r===r && chessSel.c===c)){
          chessBoard[r][c] = from;
          chessBoard[chessSel.r][chessSel.c] = null;
          chessTurn = chessTurn==='w' ? 'b' : 'w';
        }
        chessSel = null;
      } else if(cell){
        chessSel = {r,c};
      }
      renderChessModal();
    });
  });
  document.getElementById("chessResetBtn").addEventListener("click", openChess);
}

/* ---------------- ULAR TANGGA ---------------- */
let ladderPlayers=null, ladderTurnIdx=0, ladderWinner=null, ladderLastRoll=1;
const LADDER_LADDERS = {4:14,9:31,20:38,28:84,40:59,51:67,63:81,71:91};
const LADDER_SNAKES  = {17:7,54:34,62:19,64:60,87:24,93:73,95:75,99:78};
function openLadder(){
  showGameOverlay();
  renderPlayerSetup({
    title:"Ular Tangga", emoji:"🐍",
    sub:"Atur nama pemain (2–4 orang), lalu lempar dadu bergantian sampai ada yang tiba di kotak 100.",
    onStart:(players)=>{
      ladderPlayers = players.map(p=>({...p,pos:1}));
      ladderTurnIdx = 0; ladderWinner = null; ladderLastRoll = 1;
      renderLadderBoard();
    }
  });
}
function ladderCellNumber(r,c){
  const boardRow = 10-r;
  const ltr = boardRow % 2 === 1;
  return ltr ? (boardRow-1)*10 + c + 1 : (boardRow-1)*10 + (10-c);
}
function renderLadderBoard(){
  let cells = "";
  for(let r=0;r<10;r++){
    for(let c=0;c<10;c++){
      const num = ladderCellNumber(r,c);
      let cls = "", tag = "";
      if(LADDER_LADDERS[num]){ cls="ladder"; tag=`↑${LADDER_LADDERS[num]}`; }
      if(LADDER_SNAKES[num]){ cls="snake"; tag=`↓${LADDER_SNAKES[num]}`; }
      const tokens = ladderPlayers.filter(p=>p.pos===num).map(p=>`<span class="game-token" style="background:${p.color}"></span>`).join("");
      cells += `<div class="ladder-cell ${cls}"><span>${num}</span>${tag?`<span class="lc-tag">${tag}</span>`:""}<span class="ladder-tokens">${tokens}</span></div>`;
    }
  }
  const current = ladderPlayers[ladderTurnIdx];
  document.getElementById("gameModalBody").innerHTML = `
    <div class="game-head"><h3>🐍 Ular Tangga</h3><button class="icon-btn" id="gameCloseBtn">${icon('close')}</button></div>
    <div class="game-toolbar">
      ${ladderWinner
        ? `<span class="game-turn-badge"><span class="game-turn-dot" style="background:${ladderWinner.color}"></span>${ladderWinner.name} menang! 🎉</span>`
        : `<span class="game-turn-badge"><span class="game-turn-dot" style="background:${current.color}"></span>Giliran: ${current.name}</span>`}
      <button class="btn btn-sm" id="ladderResetBtn">${icon('history')}<span>Main Ulang</span></button>
    </div>
    <div class="ladder-board" id="ladderBoardEl">${cells}</div>
    <div style="display:flex;align-items:center;gap:14px;margin-top:14px;">
      <div class="dice-face" id="ladderDiceFace">${diceDots(ladderLastRoll)}</div>
      <button class="btn btn-primary" id="ladderRollBtn" ${ladderWinner?'disabled':''} style="flex:1;justify-content:center;">${icon('dice')}<span>Lempar Dadu</span></button>
    </div>
    <div class="game-legend">
      <span>🪜 Tangga = naik</span>
      <span>🐍 Ular = turun</span>
    </div>
  `;
  bindGameClose();
  document.getElementById("ladderResetBtn").addEventListener("click", openLadder);
  document.getElementById("ladderRollBtn")?.addEventListener("click", rollLadderDice);
}
function rollLadderDice(){
  const btn = document.getElementById("ladderRollBtn");
  const face = document.getElementById("ladderDiceFace");
  btn.disabled = true;
  face.classList.add("rolling");
  let ticks = 0;
  const spin = setInterval(()=>{
    face.innerHTML = diceDots(1+Math.floor(Math.random()*6));
    ticks++;
    if(ticks>6){
      clearInterval(spin);
      const roll = 1+Math.floor(Math.random()*6);
      ladderLastRoll = roll;
      applyLadderMove(roll);
    }
  }, 90);
}
function applyLadderMove(roll){
  const p = ladderPlayers[ladderTurnIdx];
  let next = p.pos + roll;
  if(next > 100) next = p.pos;
  else {
    if(LADDER_LADDERS[next]) next = LADDER_LADDERS[next];
    else if(LADDER_SNAKES[next]) next = LADDER_SNAKES[next];
  }
  p.pos = next;
  if(p.pos >= 100){ p.pos = 100; ladderWinner = p; }
  else { ladderTurnIdx = (ladderTurnIdx+1) % ladderPlayers.length; }
  renderLadderBoard();
}

/* ---------------- MONOPOLY (versi ringkas: papan + dadu, tanpa uang) ---------------- */
let monoPlayers=null, monoTurnIdx=0, monoLastRoll=1, monoLanded=null;
const MONO_NAMES = [
  "MULAI","Jl. Melati","Kotak Dana Umum","Jl. Mawar","Pajak Penghasilan","Stasiun Gambir","Jl. Kenanga","PARKIR BEBAS",
  "Jl. Anggrek","Kesempatan","Jl. Tulip","Jl. Kamboja","Stasiun Senen","Jl. Cempaka","MASUK PENJARA",
  "Jl. Dahlia","Kotak Dana Umum","Jl. Flamboyan","Jl. Teratai","Stasiun Kota","Jl. Sakura","PENJARA / KUNJUNGAN",
  "Jl. Lily","Kesempatan","Jl. Bougenville","Pajak Mewah","Jl. Aster","Jl. Edelweiss"
];
function openMonopoly(){
  showGameOverlay();
  renderPlayerSetup({
    title:"Monopoly", emoji:"🎲",
    sub:"Versi ringkas: jalan keliling papan, lempar dadu bergantian, lihat properti yang disinggahi.",
    onStart:(players)=>{
      monoPlayers = players.map(p=>({...p,pos:0}));
      monoTurnIdx = 0; monoLastRoll = 1; monoLanded = null;
      renderMonoBoard();
    }
  });
}
function monoCellPos(i){
  if(i<=7) return {row:8, col:i+1};
  if(i<=14) return {row:8-(i-7), col:8};
  if(i<=21) return {row:1, col:8-(i-14)};
  return {row:(i-22)+2, col:1};
}
function renderMonoBoard(){
  let cellsHtml = "";
  for(let i=0;i<28;i++){
    const {row,col} = monoCellPos(i);
    const isCorner = [0,7,14,21].includes(i);
    const tokens = monoPlayers.filter(p=>p.pos===i).map(p=>`<span class="game-token" style="background:${p.color}"></span>`).join("");
    cellsHtml += `<div class="mono-cell ${isCorner?'corner':''}" style="grid-row:${row};grid-column:${col};"><span>${MONO_NAMES[i]}</span><span class="ladder-tokens" style="position:absolute;bottom:1px;left:1px;">${tokens}</span></div>`;
  }
  const current = monoPlayers[monoTurnIdx];
  document.getElementById("gameModalBody").innerHTML = `
    <div class="game-head"><h3>🎲 Monopoly</h3><button class="icon-btn" id="gameCloseBtn">${icon('close')}</button></div>
    <div class="game-toolbar">
      <span class="game-turn-badge"><span class="game-turn-dot" style="background:${current.color}"></span>Giliran: ${current.name}</span>
      <button class="btn btn-sm" id="monoResetBtn">${icon('history')}<span>Main Ulang</span></button>
    </div>
    <div class="mono-board" id="monoBoardEl">
      ${cellsHtml}
      <div class="mono-center">
        <b>MONOPOLY</b>
        <div class="dice-face" id="monoDiceFace">${diceDots(monoLastRoll)}</div>
        <button class="btn btn-primary btn-sm" id="monoRollBtn">${icon('dice')}<span>Lempar Dadu</span></button>
        ${monoLanded?`<div style="font-size:11.5px;text-align:center;color:var(--ink-soft);max-width:150px;">${monoLanded}</div>`:""}
      </div>
    </div>
  `;
  bindGameClose();
  document.getElementById("monoResetBtn").addEventListener("click", openMonopoly);
  document.getElementById("monoRollBtn").addEventListener("click", rollMonoDice);
}
function rollMonoDice(){
  const btn = document.getElementById("monoRollBtn");
  const face = document.getElementById("monoDiceFace");
  btn.disabled = true;
  face.classList.add("rolling");
  let ticks = 0;
  const spin = setInterval(()=>{
    face.innerHTML = diceDots(1+Math.floor(Math.random()*6));
    ticks++;
    if(ticks>6){
      clearInterval(spin);
      const roll = 1+Math.floor(Math.random()*6);
      monoLastRoll = roll;
      const p = monoPlayers[monoTurnIdx];
      p.pos = (p.pos + roll) % 28;
      monoLanded = `${p.name} mendarat di "${MONO_NAMES[p.pos]}"`;
      monoTurnIdx = (monoTurnIdx+1) % monoPlayers.length;
      renderMonoBoard();
    }
  }, 90);
}

/* ============================================================
   BOOT LOADER — splash singkat (1.5 detik, bisa di-skip), frasa ala
   programmer + koin jatuh. Konten asli di baliknya sudah siap sejak awal;
   ini murni sentuhan branding, bukan loading sungguhan.
============================================================ */
const BOOT_PHRASES = [
  "Menginisialisasi kernel sistem…",
  "Mengompilasi modul enkripsi AES-256…",
  "Menyinkronkan ledger transaksi terdistribusi…",
  "Membangun indeks basis data real-time…",
  "Mengoptimalkan query kas multi-thread…",
  "Memvalidasi checksum integritas data…",
  "Menjalankan garbage collector memori…",
  "Menghubungkan node microservices…",
  "Menyusun cache neural-index UI…",
  "Merender antarmuka reaktif…",
  "Mengunci sesi dengan token keamanan…",
  "Menstabilkan protokol sinkronisasi cloud…",
  "Menghitung ulang saldo dengan presisi ganda…",
  "Mengaktifkan lapisan observability sistem…",
  "Memuat komponen UI secara asinkron…",
  "Kompilasi selesai. Menyiapkan tampilan…",
];
function runBootLoader(){
  const el = document.getElementById("bootLoader");
  if(!el) return;
  // Durasi splash sesuai permintaan: 8 detik. Konten ASLI di baliknya sudah
  // selesai dirender sejak awal (lihat render() di bagian INIT di bawah),
  // jadi splash ini murni dekoratif/branding — dan tetap bisa dilewati
  // kapan saja dengan tap/klik kalau pengunjung tidak ingin menunggu.
  const DURATION = 8000;
  const fill = document.getElementById("bootProgressFill");
  const pct = document.getElementById("bootPercent");
  const phraseEl = document.getElementById("bootPhrase");
  const start = performance.now();
  let phraseIdx = 0;
  let finished = false;

  function setPhrase(i){
    if(!phraseEl) return;
    phraseEl.style.animation = "none";
    void phraseEl.offsetWidth; // reflow biar animasi restart
    phraseEl.style.animation = "";
    phraseEl.textContent = BOOT_PHRASES[i % BOOT_PHRASES.length];
  }
  setPhrase(0);
  const phraseTimer = setInterval(()=>{
    phraseIdx++;
    setPhrase(phraseIdx);
  }, 260);

  function finish(){
    if(finished) return;
    finished = true;
    clearInterval(phraseTimer);
    el.removeEventListener("click", finish);
    if(fill) fill.style.width = "100%";
    if(pct) pct.textContent = "100%";
    el.classList.add("hide");
    setTimeout(()=>{ el.remove(); }, 500);
  }
  // Klik/tap di mana saja pada splash langsung melewatinya — buat pengunjung
  // yang tidak ingin menunggu animasi sama sekali.
  el.addEventListener("click", finish);
  el.title = "Klik untuk lewati";
  el.style.cursor = "pointer";

  function tick(now){
    if(finished) return;
    const elapsed = now - start;
    const p = Math.min(100, Math.round((elapsed/DURATION)*100));
    if(fill) fill.style.width = p + "%";
    if(pct) pct.textContent = p + "%";
    if(elapsed < DURATION){
      requestAnimationFrame(tick);
    } else {
      finish();
    }
  }
  requestAnimationFrame(tick);
}

/* ============================================================
   INIT
============================================================ */
applyTheme();
render(); // render layar "Memuat data…" sambil menunggu Firebase
runBootLoader();
bootFromFirebase();

let _resizeTimer = null;
let _lastWidth = window.innerWidth;
window.addEventListener("resize", ()=>{
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(()=>{
    const w = window.innerWidth;
    // Di HP, membuka papan ketik virtual memicu event "resize" karena tinggi
    // viewport mengecil — TANPA perubahan lebar. Re-render penuh saat itu akan
    // menghancurkan elemen <input>/<textarea> yang sedang fokus dan otomatis
    // menutup papan ketik. Maka re-render hanya dijalankan jika LEBAR berubah.
    if(w === _lastWidth) return;
    _lastWidth = w;
    const active = document.activeElement;
    const isEditing = active && ["INPUT","TEXTAREA","SELECT"].includes(active.tagName);
    if(isEditing) return; // jangan ganggu saat user sedang mengetik
    render();
  }, 200);
});
