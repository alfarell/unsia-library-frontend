export const id = {
  app: {
    subtitle: 'Perpustakaan Digital',
  },
  actions: {
    changeLanguage: 'Ganti bahasa',
    changeTheme: 'Ganti tema',
  },
  theme: {
    dark: 'Gelap',
    light: 'Terang',
  },
  navigation: {
    label: 'Navigasi utama',
    dashboard: 'Dashboard',
    books: 'Buku',
    members: 'Anggota',
    loans: 'Peminjaman',
  },
  dashboard: {
    eyebrow: 'Ringkasan hari ini',
    title: 'Kelola perpustakaan dalam satu ruang kerja.',
    description:
      'Pantau koleksi, anggota, dan aktivitas peminjaman melalui data yang ringkas dan mudah dipahami.',
  },
  metrics: {
    label: 'Statistik perpustakaan',
    books: 'Total buku',
    members: 'Anggota aktif',
    activeLoans: 'Sedang dipinjam',
    overdue: 'Terlambat',
  },
  chart: {
    title: 'Status peminjaman',
    description: 'Distribusi transaksi pada periode berjalan',
    borrowed: 'Dipinjam',
    returned: 'Dikembalikan',
    overdue: 'Terlambat',
  },
  activity: {
    title: 'Aktivitas terbaru',
    loan: {
      title: 'Buku dipinjam oleh Budi Santoso',
      time: '5 menit lalu',
    },
    return: {
      title: 'Pengembalian buku telah dicatat',
      time: '18 menit lalu',
    },
    member: {
      title: 'Anggota baru berhasil didaftarkan',
      time: '42 menit lalu',
    },
  },
} as const
