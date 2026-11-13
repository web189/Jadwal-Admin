# Catatan perbaikan (PWA Windows 7 + versi ringan)

## Cara pasang di GitHub
1. Hapus isi lama repo, lalu upload SEMUA isi folder ini (termasuk `sw.js`, `manifest.json`, folder `vendor/` dan `fonts/`).
2. Tunggu GitHub Pages selesai (1-2 menit), buka situsnya sekali saat online.

## Di setiap PC (WAJIB sekali, karena ID aplikasi berubah)
1. Buka `chrome://apps`, klik kanan aplikasi lama, Hapus. Hapus juga shortcut desktop lama (termasuk yang berakhiran "(1)").
2. Buka situsnya di Chrome, klik tombol "Pasang/Instal Aplikasi" (atau ikon instal di kolom alamat).
3. Windows 7 butuh Chrome/Edge versi 109 (terakhir yang mendukung Win 7).

## Update otomatis
Setiap file diperiksa saat aplikasi dibuka; bila ada versi baru, halaman memuat ulang sendiri.
Jika mengedit file langsung di GitHub, tidak perlu mengubah apa pun di sw.js.

## Mode ringan Jadwal Admin
Otomatis di Windows XP-8 / PC spek rendah. Paksa: tambahkan ?lite=1 di alamat, matikan: ?lite=0.

## v28 — Tema 2026
- File baru `tema2026.css` (dimuat setelah app.css): tampilan bersih & profesional, tanpa blur/glow/animasi dekoratif.
- Warna shift di tabel (P/S/M/OFF/C/libur) tidak diubah. Loading screen tetap 4 detik. jd.js tidak diubah.
- Cara pasang: upload SEMUA isi folder ke GitHub (termasuk tema2026.css). sw.js sudah diperbarui.

## v29 — Tema Pro (terang & gelap, HP & PC)
- File baru `tema-pro.css` (dimuat paling akhir). `jd.js` tidak diubah; loading screen tetap 4 detik.
- Permukaan datar & netral (gradasi aqua/glow dihapus). Warna jenuh hanya untuk makna shift & "hari ini".
- Chip OFF dan Cuti dibuat lembut (isi transparan + garis warna); P/S/M tetap penuh. Untuk mengembalikan OFF/C penuh, hapus 2 baris `td.shift-OFF` & `td.shift-C` di bagian 7 `tema-pro.css`.
- Huruf: Space Grotesk (judul & angka), Inter (isi), JetBrains Mono (jam). Label tidak lagi HURUF BESAR.
- Teks footer "SYSTEM CORE ... cyber interface" diganti teks yang lebih wajar.
- Kembali ke tampilan lama: hapus baris `<link ... tema-pro.css>` di index.html dan class `pro26` di <body>.
- Pasang: upload SEMUA isi folder ke GitHub (termasuk `tema-pro.css`, `sw.js`, `index.html`).
