# JHT KAS Adm PRG

Website buku kas admin gudang — tampilan tamu (lihat saja) + dashboard admin (kelola transaksi & anggota) + alur pengajuan pembelian dengan persetujuan admin.
Dibangun dengan HTML, CSS, dan JavaScript murni (tanpa framework). Mode gelap/terang, responsif HP & PC.

## Fitur utama
- **Tabel Transaksi** ala-Excel (geser 2 arah, sticky header, filter Kas Masuk/Keluar, kontrol 5/15/Semua baris)
- **Peringkat Setoran Anggota** dengan diagram bar animasi, avatar unik bergradient, anggota nonaktif otomatis diberi tanda pudar+coret
- **Ekspor Excel & PDF** dari data transaksi (tersedia di menu ☰ / desktop)
- **Pengajuan Pembelian** — siapa saja bisa mengajukan pembelian barang/jasa (solo atau patungan beberapa admin), masuk ke dashboard admin untuk di-ACC/ditolak. Jika disetujui, otomatis tercatat sebagai transaksi kas keluar.
- **Riwayat Pengajuan** & **Aset Barang/Jasa** — dapat diakses dari menu ☰, transparan untuk semua orang
- Dashboard admin: kelola transaksi, anggota (aktif/nonaktif), histori, laporan bulanan, dan pengajuan pembelian

## Cara pakai (lokal, tanpa install apapun)
1. Extract semua file (index.html, style.css, script.js) ke **folder yang sama**, lalu buka `index.html` di browser.
2. Atau jalankan server statis sederhana supaya lebih stabil:
   ```
   npx serve .
   ```
   lalu buka `http://localhost:3000`

## Login admin (mode uji)
- Username: `admin`
- Password: `admin123`

Kredensial ini disimpan polos di localStorage — **wajib diganti dengan sistem login/backend sungguhan** sebelum website ini dipakai untuk data kas nyata secara publik, supaya orang lain tidak bisa login dari perangkat mereka sendiri.

## Penyimpanan data
Semua data (transaksi, anggota, pengajuan pembelian) disimpan di **localStorage** browser — artinya:
- Data hanya tersimpan di perangkat/browser tempat kamu membukanya.
- Kalau dibuka di HP lain / browser lain, datanya akan mulai dari data contoh (seed) lagi.
- Untuk data yang bisa diakses bersama oleh banyak orang (tamu di HP masing-masing melihat data yang sama, termasuk pengajuan pembelian dari orang lain), langkah selanjutnya adalah menyambungkan ke backend (mis. Firebase, Supabase, atau Google Sheets API) menggantikan bagian `localStorage` di `script.js`.

## Struktur file
```
index.html   -> struktur HTML halaman + sprite ikon SVG
style.css    -> semua styling (warna, layout, animasi, responsif)
script.js    -> data, logika render, dan interaksi
README.md    -> file ini
```

## Push ke GitHub
```
git init
git add .
git commit -m "JHT KAS Adm PRG - versi awal"
git branch -M main
git remote add origin <url-repo-kamu>
git push -u origin main
```
Untuk publish otomatis sebagai website (GitHub Pages): Settings → Pages → Source: branch `main`, folder `/root`.
