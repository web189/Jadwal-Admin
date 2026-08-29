# Setup Firebase — JHT KAS Adm PRG

Kode sudah disambungkan ke proyek Firebase **kasjht** kamu (config sudah ditanam
di `firebase-config.js`). Yang perlu dilakukan di **Firebase Console**:

## 1. Aktifkan Authentication
Authentication → Sign-in method → aktifkan **Email/Password**.

## 2. Buat akun admin
Authentication → Users → **Add user**:
- Email: `benyoriki@gmail.com`
- Password: `123456`

Form login di website tetap pakai username **admin** (atau boleh langsung
ketik emailnya) — kode otomatis memetakan "admin" ke email di atas (lihat
`_adminEmail()` di `firebase-config.js`). Mau tambah admin lain? Tambah user
baru di sini + tambahkan pemetaannya di `_adminEmail()`.

## 3. Pasang Security Rules
Firestore Database → Rules → tempel isi file **`firestore.rules`** → Publish.
(Ini menggantikan rule bawaan yang otomatis expired dan yang saat ini mengizinkan
siapa saja baca-tulis-hapus semua data.)

## 4. Jalankan
Buka `index.html` seperti biasa (lokal atau hosting). Saat pertama kali jalan,
app otomatis mengisi Firestore dengan data anggota/transaksi/pengajuan yang
sudah ada di kode (data ini sudah dicocokkan 1:1 dengan dokumen dari Riki —
lihat catatan di bawah). Setelah itu, Firestore jadi satu-satunya sumber data;
perubahan dari 1 admin langsung muncul real-time di perangkat lain.

## Yang berubah dari versi localStorage
- `firebase-config.js` (baru): inisialisasi Firebase + fungsi baca/tulis Firestore.
- `script.js`: `loadDB()`/`saveMembers()`/`saveTx()`/`saveRequests()` sekarang
  memakai Firestore, bukan localStorage. Login/logout admin memakai Firebase
  Authentication (bukan `admin/admin123` yang tersimpan polos).
- `index.html`: menambahkan 3 tag `<script>` SDK Firebase + `firebase-config.js`.
- `firestore.rules` (baru): aturan akses (lihat komentar di dalam file).

## Catatan soal data
Saya bandingkan seluruh data di `RAW_TX` (127 baris transaksi) dan pengajuan
pembelian di kode terhadap 3 tabel di dokumen Riki (Kas Masuk, Kas Keluar,
Aset Barang/Jasa) — **cocok 100%**, tidak ada data contoh/fiktif yang tersisa.
Satu-satunya bagian dokumen yang belum masuk ke aplikasi: 8 baris awal di
tabel "Aset Barang/Jasa" bernilai Rp0 (barang pribadi yang disumbangkan tanpa
diganti kas, mis. "4Box Pulpen Biru", "Sapu, Kain pel..."). Ini cuma keterangan
teks di transaksi kas masuk terkait, bukan entri "Aset/Pengajuan" tersendiri —
kalau mau ditampilkan sebagai entri terpisah di halaman Aset, kabari saya.
