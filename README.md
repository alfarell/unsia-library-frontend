# UNSIA Library Frontend

Antarmuka web UNSIA Digital Library yang dibangun dengan React, TypeScript, dan Vite. Aplikasi ini terhubung ke REST API backend untuk autentikasi serta pengelolaan data perpustakaan.

## Fitur tersedia

- Registrasi, masuk, keluar, validasi sesi, dan proteksi halaman untuk pengguna yang belum terautentikasi.
- Dashboard dengan ringkasan data, grafik status peminjaman, dan aktivitas terbaru.
- Manajemen buku: melihat daftar dan detail buku, serta menambah, mengubah, dan menghapus buku.
- Manajemen anggota: melihat daftar dan detail anggota, serta menambah, mengubah, dan menghapus anggota.
- Manajemen peminjaman: membuat peminjaman untuk satu atau beberapa buku yang masih tersedia, melihat detail, dan memproses pengembalian buku.
- Tata letak responsif, notifikasi umpan balik, tema terang/gelap yang disimpan di browser, serta pilihan Bahasa Indonesia dan Inggris.

## Teknologi

- React 19, TypeScript, dan Vite
- React Router untuk navigasi
- Axios untuk komunikasi API
- Tailwind CSS untuk antarmuka
- Chart.js untuk visualisasi dashboard
- i18next untuk lokalisasi

## Prasyarat

Sebelum menjalankan aplikasi, pastikan tersedia:

- Node.js versi 24 atau yang lebih baru.
- npm (terpasang bersama Node.js).
- Server backend UNSIA Library yang sedang berjalan dan dapat diakses dari browser. Frontend memerlukan backend untuk proses autentikasi dan seluruh data perpustakaan.

## Setup environment

1. Masuk ke direktori proyek frontend.
2. Salin `.env.example` menjadi file baru bernama `.env`.
3. Isi `VITE_API_BASE_URL` dengan alamat dasar API backend yang akan digunakan.

Contoh konfigurasi untuk backend yang berjalan secara lokal pada port 3000:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Jika backend berjalan pada host atau port lain, sesuaikan nilainya. Jangan menyimpan kredensial atau informasi rahasia pada file `.env` yang dibagikan.

## Menjalankan development server secara lokal

1. Jalankan server backend dan pastikan alamatnya sama dengan nilai `VITE_API_BASE_URL` di file `.env`.
2. Dari direktori `unsia-library-frontend`, instal dependensi:

```bash
npm install
```

3. Jalankan development server:

```bash
npm run dev
```

4. Buka alamat yang ditampilkan di terminal. Secara normal, Vite menggunakan `http://localhost:5173`; port dapat berubah apabila port tersebut telah digunakan.

## Verifikasi

Jalankan pemeriksaan berikut dari direktori frontend:

```bash
npm run lint
npm run format:check
npm test
npm run build
```

Untuk melihat hasil build produksi secara lokal, jalankan `npm run preview` setelah `npm run build` berhasil.
