import fs from 'fs';
import path from 'path';

// Define DB structures
export interface User {
  id: number;
  username: string;
  nama_depan: string;
  nama_belakang: string;
  password_hash: string; // Plain password for prototype demo, but simulation shows secure hash
  email: string;
  no_hp: string;
  foto: string;
  role: 'Administrator' | 'Operator' | 'Kepala Sekolah';
  status: 'Aktif' | 'Nonaktif';
  login_terakhir: string | null;
}

export interface Kategori {
  id: number;
  kode_kategori: string;
  nama_kategori: string;
  deskripsi: string;
  label_warna: string; // e.g., 'blue', 'green', 'red'
  ikon: string; // lucide icon name
}

export interface Arsip {
  id: number;
  nomor_arsip: string;
  kode_arsip: string;
  judul_dokumen: string;
  id_kategori: number;
  jenis_dokumen: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'JPG' | 'ZIP' | 'Lainnya';
  tanggal_dokumen: string;
  tanggal_unggah: string;
  pengunggah: string;
  deskripsi: string;
  kata_kunci: string;
  nomor_surat: string;
  asal_surat: string;
  tujuan_surat: string;
  status_arsip: 'Aktif' | 'Dipinjam' | 'Arsip' | 'Kadaluarsa';
  lokasi_penyimpanan: string;
  berkas_dokumen: string; // File name or base64 representation
  berkas_nama_asli: string;
  berkas_ukuran: string;
  version: number;
  favorites_count: number;
  views_count: number;
  download_count: number;
}

export interface ArsipVersi {
  id: number;
  id_arsip: number;
  versi: number;
  berkas_dokumen: string;
  berkas_nama_asli: string;
  berkas_ukuran: string;
  tanggal_versi: string;
  diubah_oleh: string;
  deskripsi: string;
}

export interface LogAktivitas {
  id: number;
  id_pengguna: number | null;
  username: string;
  aksi: 'Login' | 'Logout' | 'Tambah Arsip' | 'Edit Arsip' | 'Hapus Arsip' | 'Unduh' | 'Unggah' | 'Cadangkan' | 'Memulihkan' | 'Akses Sistem';
  rincian: string;
  waktu: string;
  ip_address: string;
  browser: string;
}

export interface UnduhLog {
  id: number;
  id_arsip: number;
  judul_arsip: string;
  id_pengguna: number;
  username: string;
  waktu: string;
  ip_address: string;
  browser: string;
}

export interface Pengaturan {
  id: number;
  nama_sekolah: string;
  logo: string;
  alamat: string;
  email: string;
  no_hp: string;
  website: string;
  tahun_ajaran: string;
  kepala_sekolah: string;
  favicon: string;
  tema: string; // 'Classic Blue', 'Emerald Green', 'Maroon'
  mode_gelap: boolean;
}

export interface RiwayatCadangan {
  id: number;
  nama_file: string;
  tanggal_cadangan: string;
  ukuran: string;
  dibuat_oleh: string;
}

export interface Favorit {
  id: number;
  id_pengguna: number;
  id_arsip: number;
  waktu: string;
}

export interface DBStructure {
  users: User[];
  kategori: Kategori[];
  arsip: Arsip[];
  arsip_versi: ArsipVersi[];
  log_aktivitas: LogAktivitas[];
  unduh_log: UnduhLog[];
  pengaturan: Pengaturan;
  riwayat_cadangan: RiwayatCadangan[];
  favorit: Favorit[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'sardig_db.json');

// Initial default data
const defaultDB: DBStructure = {
  users: [
    {
      id: 1,
      username: 'admin',
      nama_depan: 'Achmad',
      nama_belakang: 'Fauzi',
      password_hash: 'admin123', // Demo simplified plain-text password check
      email: 'admin.sardig@tkjoroktiram.sch.id',
      no_hp: '081234567890',
      foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
      role: 'Administrator',
      status: 'Aktif',
      login_terakhir: '2026-07-01T14:32:00-07:00'
    },
    {
      id: 2,
      username: 'operator',
      nama_depan: 'Siti',
      nama_belakang: 'Aminah',
      password_hash: 'operator123',
      email: 'operator.sardig@tkjoroktiram.sch.id',
      no_hp: '082345678901',
      foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
      role: 'Operator',
      status: 'Aktif',
      login_terakhir: '2026-07-02T08:15:00-07:00'
    },
    {
      id: 3,
      username: 'kepsek',
      nama_depan: 'Hj. Ratna',
      nama_belakang: 'Sari, M.Pd.',
      password_hash: 'kepsek123',
      email: 'kepsek@tkjoroktiram.sch.id',
      no_hp: '083456789012',
      foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150',
      role: 'Kepala Sekolah',
      status: 'Aktif',
      login_terakhir: '2026-06-30T10:05:00-07:00'
    }
  ],
  kategori: [
    { id: 1, kode_kategori: 'ADM', nama_kategori: 'Administrasi Umum', deskripsi: 'Dokumen administrasi harian dan tata usaha sekolah.', label_warna: '#3b82f6', ikon: 'FileText' },
    { id: 2, kode_kategori: 'KEU', nama_kategori: 'Keuangan & SPP', deskripsi: 'Laporan keuangan, pembayaran SPP, BOS, dan kwitansi.', label_warna: '#10b981', ikon: 'DollarSign' },
    { id: 3, kode_kategori: 'KUR', nama_kategori: 'Kurikulum & RPP', deskripsi: 'Rencana Pelaksanaan Pembelajaran (RPP), silabus, dan materi TK.', label_warna: '#8b5cf6', ikon: 'BookOpen' },
    { id: 4, kode_kategori: 'KES', nama_kategori: 'Kesiswaan', deskripsi: 'Data murid, absensi, perkembangan belajar anak, dan raport.', label_warna: '#f59e0b', ikon: 'Users' },
    { id: 5, kode_kategori: 'KPG', nama_kategori: 'Kepegawaian', deskripsi: 'Data guru (PTK), SK Pengangkatan, sertifikasi, dan absensi staf.', label_warna: '#ec4899', ikon: 'UserCheck' },
    { id: 6, kode_kategori: 'INV', nama_kategori: 'Inventaris Sekolah', deskripsi: 'Aset sekolah, daftar mainan edukatif, meja, kursi, dan sarana prasarana.', label_warna: '#6b7280', ikon: 'Archive' },
    { id: 7, kode_kategori: 'SM',  nama_kategori: 'Surat Masuk', deskripsi: 'Arsip surat kedinasan dari Dinas Pendidikan atau eksternal.', label_warna: '#06b6d4', ikon: 'Mail' },
    { id: 8, kode_kategori: 'SK',  nama_kategori: 'Surat Keluar', deskripsi: 'Salinan surat keluar resmi dari sekolah untuk wali murid atau yayasan.', label_warna: '#14b8a6', ikon: 'Send' },
    { id: 9, kode_kategori: 'DOK', nama_kategori: 'Dokumen Legalitas', deskripsi: 'Akte yayasan, izin operasional sekolah, NPSN, dan akreditasi.', label_warna: '#ef4444', ikon: 'ShieldCheck' },
    { id: 10, kode_kategori: 'LAIN', nama_kategori: 'Dokumentasi Kegiatan', deskripsi: 'Foto kegiatan belajar, pentas seni, kelulusan, dan dokumentasi lain.', label_warna: '#64748b', ikon: 'Image' }
  ],
  arsip: [
    {
      id: 1,
      nomor_arsip: 'SARDIG/2026/001',
      kode_arsip: 'DOK-01',
      judul_dokumen: 'Izin Operasional TK JOROK TIRAM',
      id_kategori: 9,
      jenis_dokumen: 'PDF',
      tanggal_dokumen: '2024-05-12',
      tanggal_unggah: '2026-06-15T09:30:00-07:00',
      pengunggah: 'admin',
      deskripsi: 'Dokumen Surat Keputusan Dinas Pendidikan tentang perpanjangan izin operasional TK JOROK TIRAM.',
      kata_kunci: 'izin operasional, legalitas, dinas, tk jorok tiram',
      nomor_surat: '421.1/782-Disdik/2024',
      asal_surat: 'Dinas Pendidikan Kabupaten',
      tujuan_surat: 'TK JOROK TIRAM',
      status_arsip: 'Aktif',
      lokasi_penyimpanan: 'Lemari A, Rak Ke-1, Map Merah',
      berkas_dokumen: 'Izin_Operasional_TK_Jorok_Tiram.pdf',
      berkas_nama_asli: 'SK_Izin_Operasional_2024_Signed.pdf',
      berkas_ukuran: '1.8 MB',
      version: 1,
      favorites_count: 2,
      views_count: 45,
      download_count: 14
    },
    {
      id: 2,
      nomor_arsip: 'SARDIG/2026/002',
      kode_arsip: 'KEU-01',
      judul_dokumen: 'Laporan Pertanggungjawaban Dana BOS Semester 1',
      id_kategori: 2,
      jenis_dokumen: 'XLSX',
      tanggal_dokumen: '2026-06-20',
      tanggal_unggah: '2026-06-22T10:45:00-07:00',
      pengunggah: 'operator',
      deskripsi: 'Laporan realisasi dan kwitansi pengeluaran dana Bantuan Operasional Sekolah (BOS) semester ganjil.',
      kata_kunci: 'bos, keuangan, laporan, dana, pertanggungjawaban',
      nomor_surat: '023/BOS/TK-JT/VI/2026',
      asal_surat: 'Bendahara Sekolah',
      tujuan_surat: 'Kepala Dinas Pendidikan',
      status_arsip: 'Aktif',
      lokasi_penyimpanan: 'Lemari B, Rak Ke-2, Binder Biru',
      berkas_dokumen: 'LPJ_BOS_Sem_1_2026.xlsx',
      berkas_nama_asli: 'BOS_Semester1_Final.xlsx',
      berkas_ukuran: '345 KB',
      version: 2,
      favorites_count: 1,
      views_count: 28,
      download_count: 8
    },
    {
      id: 3,
      nomor_arsip: 'SARDIG/2026/003',
      kode_arsip: 'KUR-01',
      judul_dokumen: 'RPPH Pembelajaran Tema Alam Semesta - TK B',
      id_kategori: 3,
      jenis_dokumen: 'DOCX',
      tanggal_dokumen: '2026-07-01',
      tanggal_unggah: '2026-07-01T15:20:00-07:00',
      pengunggah: 'operator',
      deskripsi: 'Rencana Pelaksanaan Pembelajaran Harian (RPPH) Kurikulum Merdeka dengan tema pengenalan bintang dan bulan untuk kelas TK B.',
      kata_kunci: 'rpph, alam semesta, tk b, kurikulum merdeka, modul',
      nomor_surat: '-',
      asal_surat: 'Guru Kelas B (Ibu Suci)',
      tujuan_surat: 'Arsip Kurikulum',
      status_arsip: 'Aktif',
      lokasi_penyimpanan: 'Google Drive Kurikulum & Map Plastik Hijau',
      berkas_dokumen: 'RPPH_Alam_Semesta_TKB.docx',
      berkas_nama_asli: 'RPPH_Tema_Alam_Semesta_Revisi.docx',
      berkas_ukuran: '124 KB',
      version: 1,
      favorites_count: 3,
      views_count: 31,
      download_count: 12
    },
    {
      id: 4,
      nomor_arsip: 'SARDIG/2026/004',
      kode_arsip: 'SM-12',
      judul_dokumen: 'Undangan Workshop Akreditasi PAUD 2026',
      id_kategori: 7,
      jenis_dokumen: 'PDF',
      tanggal_dokumen: '2026-06-25',
      tanggal_unggah: '2026-06-28T08:12:00-07:00',
      pengunggah: 'admin',
      deskripsi: 'Surat undangan resmi dari BAN PAUD Provinsi untuk mengikuti pembekalan pengisian SISPRAPENA akreditasi.',
      kata_kunci: 'undangan, workshop, akreditasi, ban paud, sisprapena',
      nomor_surat: 'UND/098/BAN-PAUD/VI/2026',
      asal_surat: 'BAN PAUD & PNF Provinsi',
      tujuan_surat: 'Kepala Sekolah TK JOROK TIRAM',
      status_arsip: 'Aktif',
      lokasi_penyimpanan: 'Lemari A, Rak Ke-3, Binder Surat Masuk',
      berkas_dokumen: 'Undangan_Workshop_Akreditasi.pdf',
      berkas_nama_asli: 'Surat_Undangan_BAN_Signed.pdf',
      berkas_ukuran: '560 KB',
      version: 1,
      favorites_count: 0,
      views_count: 15,
      download_count: 4
    }
  ],
  arsip_versi: [
    {
      id: 1,
      id_arsip: 2,
      versi: 1,
      berkas_dokumen: 'LPJ_BOS_Sem_1_2026_Draft.xlsx',
      berkas_nama_asli: 'BOS_Semester1_Draft_V1.xlsx',
      berkas_ukuran: '342 KB',
      tanggal_versi: '2026-06-20T09:00:00-07:00',
      diubah_oleh: 'operator',
      deskripsi: 'Draft awal laporan BOS, sebelum disetujui Kepala Sekolah.'
    },
    {
      id: 2,
      id_arsip: 2,
      versi: 2,
      berkas_dokumen: 'LPJ_BOS_Sem_1_2026.xlsx',
      berkas_nama_asli: 'BOS_Semester1_Final.xlsx',
      berkas_ukuran: '345 KB',
      tanggal_versi: '2026-06-22T10:45:00-07:00',
      diubah_oleh: 'operator',
      deskripsi: 'Revisi nominal pengeluaran pembelian alat peraga edukatif (APE) luar ruangan.'
    }
  ],
  log_aktivitas: [
    {
      id: 1,
      id_pengguna: 1,
      username: 'admin',
      aksi: 'Login',
      rincian: 'Pengguna admin berhasil masuk ke dalam sistem.',
      waktu: '2026-07-02T08:00:00-07:00',
      ip_address: '127.0.0.1',
      browser: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0'
    },
    {
      id: 2,
      id_pengguna: 1,
      username: 'admin',
      aksi: 'Akses Sistem',
      rincian: 'Membuka dasbor utama sistem arsip.',
      waktu: '2026-07-02T08:02:15-07:00',
      ip_address: '127.0.0.1',
      browser: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0'
    },
    {
      id: 3,
      id_pengguna: 2,
      username: 'operator',
      aksi: 'Login',
      rincian: 'Pengguna operator berhasil masuk ke dalam sistem.',
      waktu: '2026-07-02T08:15:00-07:00',
      ip_address: '127.0.0.1',
      browser: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/125.0.0.0'
    },
    {
      id: 4,
      id_pengguna: 2,
      username: 'operator',
      aksi: 'Tambah Arsip',
      rincian: 'Menambahkan arsip baru: RPPH Pembelajaran Tema Alam Semesta - TK B.',
      waktu: '2026-07-01T15:20:00-07:00',
      ip_address: '192.168.1.15',
      browser: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/125.0.0.0'
    }
  ],
  unduh_log: [
    {
      id: 1,
      id_arsip: 1,
      judul_arsip: 'Izin Operasional TK JOROK TIRAM',
      id_pengguna: 3,
      username: 'kepsek',
      waktu: '2026-06-30T10:15:00-07:00',
      ip_address: '127.0.0.1',
      browser: 'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) Safari/605.1.15'
    },
    {
      id: 2,
      id_arsip: 3,
      judul_arsip: 'RPPH Pembelajaran Tema Alam Semesta - TK B',
      id_pengguna: 3,
      username: 'kepsek',
      waktu: '2026-07-01T16:00:00-07:00',
      ip_address: '127.0.0.1',
      browser: 'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) Safari/605.1.15'
    }
  ],
  pengaturan: {
    id: 1,
    nama_sekolah: 'TK JOROK TIRAM',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=150&h=150',
    alamat: 'Dusun Tiram, Desa Jorok, Kecamatan Unter Iwes, Kabupaten Sumbawa, NTB',
    email: 'info@tkjoroktiram.sch.id',
    no_hp: '(0371) 23456',
    website: 'www.tkjoroktiram.sch.id',
    tahun_ajaran: '2026/2027',
    kepala_sekolah: 'Hj. Ratna Sari, M.Pd.',
    favicon: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=32&h=32',
    tema: 'Classic Blue',
    mode_gelap: false
  },
  riwayat_cadangan: [
    {
      id: 1,
      nama_file: 'backup_sardig_20260630_1000.sql',
      tanggal_cadangan: '2026-06-30T10:00:00-07:00',
      ukuran: '45 KB',
      dibuat_oleh: 'admin'
    }
  ],
  favorit: [
    { id: 1, id_pengguna: 1, id_arsip: 1, waktu: '2026-06-16T12:00:00-07:00' },
    { id: 2, id_pengguna: 1, id_arsip: 3, waktu: '2026-07-01T15:30:00-07:00' },
    { id: 3, id_pengguna: 3, id_arsip: 1, waktu: '2026-06-30T10:10:00-07:00' }
  ]
};

class LocalDB {
  private data: DBStructure = { ...defaultDB };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure standard keys exist
        if (!this.data.users) this.data.users = [...defaultDB.users];
        if (!this.data.kategori) this.data.kategori = [...defaultDB.kategori];
        if (!this.data.arsip) this.data.arsip = [...defaultDB.arsip];
        if (!this.data.arsip_versi) this.data.arsip_versi = [...defaultDB.arsip_versi];
        if (!this.data.log_aktivitas) this.data.log_aktivitas = [...defaultDB.log_aktivitas];
        if (!this.data.unduh_log) this.data.unduh_log = [...defaultDB.unduh_log];
        if (!this.data.pengaturan) this.data.pengaturan = { ...defaultDB.pengaturan };
        if (!this.data.riwayat_cadangan) this.data.riwayat_cadangan = [...defaultDB.riwayat_cadangan];
        if (!this.data.favorit) this.data.favorit = [...defaultDB.favorit];
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Failed to init LocalDB, using defaults:', e);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save LocalDB:', e);
    }
  }

  // --- USERS ---
  getUsers() { return this.data.users; }
  getUserById(id: number) { return this.data.users.find(u => u.id === id); }
  getUserByUsername(username: string) { return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase()); }
  createUser(user: Omit<User, 'id' | 'login_terakhir'>) {
    const id = this.data.users.length > 0 ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1;
    const newUser: User = { ...user, id, login_terakhir: null };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }
  updateUser(id: number, updates: Partial<User>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }
  deleteUser(id: number) {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- KATEGORI ---
  getKategori() { return this.data.kategori; }
  getKategoriById(id: number) { return this.data.kategori.find(k => k.id === id); }
  createKategori(kat: Omit<Kategori, 'id'>) {
    const id = this.data.kategori.length > 0 ? Math.max(...this.data.kategori.map(k => k.id)) + 1 : 1;
    const newKat: Kategori = { ...kat, id };
    this.data.kategori.push(newKat);
    this.save();
    return newKat;
  }
  updateKategori(id: number, updates: Partial<Kategori>) {
    const idx = this.data.kategori.findIndex(k => k.id === id);
    if (idx !== -1) {
      this.data.kategori[idx] = { ...this.data.kategori[idx], ...updates };
      this.save();
      return this.data.kategori[idx];
    }
    return null;
  }
  deleteKategori(id: number) {
    const initialLen = this.data.kategori.length;
    this.data.kategori = this.data.kategori.filter(k => k.id !== id);
    if (this.data.kategori.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- ARSIP ---
  getArsip() { return this.data.arsip; }
  getArsipById(id: number) { return this.data.arsip.find(a => a.id === id); }
  createArsip(ars: Omit<Arsip, 'id' | 'version' | 'favorites_count' | 'views_count' | 'download_count'>) {
    const id = this.data.arsip.length > 0 ? Math.max(...this.data.arsip.map(a => a.id)) + 1 : 1;
    const newArs: Arsip = {
      ...ars,
      id,
      version: 1,
      favorites_count: 0,
      views_count: 0,
      download_count: 0
    };
    this.data.arsip.push(newArs);
    this.save();
    return newArs;
  }
  updateArsip(id: number, updates: Partial<Arsip>, changedBy: string, updateReason: string = 'Pembaruan dokumen') {
    const idx = this.data.arsip.findIndex(a => a.id === id);
    if (idx !== -1) {
      const oldArsip = this.data.arsip[idx];
      
      // If file is changing, save current version to versions log first
      if (updates.berkas_dokumen && updates.berkas_dokumen !== oldArsip.berkas_dokumen) {
        const vId = this.data.arsip_versi.length > 0 ? Math.max(...this.data.arsip_versi.map(v => v.id)) + 1 : 1;
        const newVersionRecord: ArsipVersi = {
          id: vId,
          id_arsip: oldArsip.id,
          versi: oldArsip.version,
          berkas_dokumen: oldArsip.berkas_dokumen,
          berkas_nama_asli: oldArsip.berkas_nama_asli,
          berkas_ukuran: oldArsip.berkas_ukuran,
          tanggal_versi: new Date().toISOString(),
          diubah_oleh: changedBy,
          deskripsi: updateReason
        };
        this.data.arsip_versi.push(newVersionRecord);
        updates.version = oldArsip.version + 1;
      }

      this.data.arsip[idx] = { ...this.data.arsip[idx], ...updates };
      this.save();
      return this.data.arsip[idx];
    }
    return null;
  }
  deleteArsip(id: number) {
    const initialLen = this.data.arsip.length;
    this.data.arsip = this.data.arsip.filter(a => a.id !== id);
    // clean up versions
    this.data.arsip_versi = this.data.arsip_versi.filter(v => v.id_arsip !== id);
    // clean up favorites
    this.data.favorit = this.data.favorit.filter(f => f.id_arsip !== id);
    if (this.data.arsip.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  getArsipVersions(idArsip: number) {
    return this.data.arsip_versi.filter(v => v.id_arsip === idArsip);
  }

  // --- LOG AKTIVITAS ---
  getLogs() { return this.data.log_aktivitas; }
  createLog(idPengguna: number | null, username: string, aksi: LogAktivitas['aksi'], rincian: string, ip: string, browser: string) {
    const id = this.data.log_aktivitas.length > 0 ? Math.max(...this.data.log_aktivitas.map(l => l.id)) + 1 : 1;
    const newLog: LogAktivitas = {
      id,
      id_pengguna: idPengguna,
      username,
      aksi,
      rincian,
      waktu: new Date().toISOString(),
      ip_address: ip || '127.0.0.1',
      browser: browser || 'Unknown'
    };
    this.data.log_aktivitas.unshift(newLog); // newest first
    // keep max 500 logs for demo size control
    if (this.data.log_aktivitas.length > 500) {
      this.data.log_aktivitas = this.data.log_aktivitas.slice(0, 500);
    }
    this.save();
    return newLog;
  }

  // --- UNDUH LOGS ---
  getDownloadLogs() { return this.data.unduh_log; }
  createDownloadLog(idArsip: number, judulArsip: string, idPengguna: number, username: string, ip: string, browser: string) {
    const id = this.data.unduh_log.length > 0 ? Math.max(...this.data.unduh_log.map(d => d.id)) + 1 : 1;
    const newLog: UnduhLog = {
      id,
      id_arsip: idArsip,
      judul_arsip: judulArsip,
      id_pengguna: idPengguna,
      username,
      waktu: new Date().toISOString(),
      ip_address: ip || '127.0.0.1',
      browser: browser || 'Unknown'
    };
    this.data.unduh_log.unshift(newLog);
    // Increment download count
    const idx = this.data.arsip.findIndex(a => a.id === idArsip);
    if (idx !== -1) {
      this.data.arsip[idx].download_count += 1;
    }
    this.save();
    return newLog;
  }

  // --- PENGATURAN ---
  getPengaturan() { return this.data.pengaturan; }
  updatePengaturan(updates: Partial<Pengaturan>) {
    this.data.pengaturan = { ...this.data.pengaturan, ...updates };
    this.save();
    return this.data.pengaturan;
  }

  // --- FAVORITES ---
  getFavorites(idPengguna: number) {
    return this.data.favorit.filter(f => f.id_pengguna === idPengguna);
  }
  toggleFavorite(idPengguna: number, idArsip: number) {
    const idx = this.data.favorit.findIndex(f => f.id_pengguna === idPengguna && f.id_arsip === idArsip);
    const arsIdx = this.data.arsip.findIndex(a => a.id === idArsip);
    if (idx !== -1) {
      // remove favorite
      this.data.favorit.splice(idx, 1);
      if (arsIdx !== -1) {
        this.data.arsip[arsIdx].favorites_count = Math.max(0, this.data.arsip[arsIdx].favorites_count - 1);
      }
      this.save();
      return false; // Not favorited anymore
    } else {
      // add favorite
      const id = this.data.favorit.length > 0 ? Math.max(...this.data.favorit.map(f => f.id)) + 1 : 1;
      this.data.favorit.push({
        id,
        id_pengguna: idPengguna,
        id_arsip: idArsip,
        waktu: new Date().toISOString()
      });
      if (arsIdx !== -1) {
        this.data.arsip[arsIdx].favorites_count += 1;
      }
      this.save();
      return true; // Favorited
    }
  }

  // --- BACKUP & RESTORE ---
  getBackups() { return this.data.riwayat_cadangan; }
  createBackupRecord(username: string) {
    const id = this.data.riwayat_cadangan.length > 0 ? Math.max(...this.data.riwayat_cadangan.map(b => b.id)) + 1 : 1;
    const time = new Date();
    const formattedDate = time.toISOString().slice(0,10).replace(/-/g, '');
    const formattedTime = time.toTimeString().slice(0,5).replace(/:/g, '');
    const filename = `backup_sardig_${formattedDate}_${formattedTime}.sql`;
    
    const newRecord: RiwayatCadangan = {
      id,
      nama_file: filename,
      tanggal_cadangan: time.toISOString(),
      ukuran: `${Math.round(JSON.stringify(this.data).length / 1024)} KB`,
      dibuat_oleh: username
    };
    this.data.riwayat_cadangan.unshift(newRecord);
    this.save();
    return newRecord;
  }

  restoreDatabase(fullData: DBStructure) {
    // Basic verification of structure
    if (fullData.users && fullData.kategori && fullData.arsip) {
      this.data = { ...fullData };
      this.save();
      return true;
    }
    return false;
  }

  // Helper to dump DB to SQL format string
  generateSQLDump(): string {
    let sql = `-- SARDIG TK JOROK TIRAM Database Dump\n`;
    sql += `-- Generated on: ${new Date().toISOString()}\n`;
    sql += `-- System: MySQL 8.x / MariaDB\n\n`;
    
    sql += `SET FOREIGN_KEY_CHECKS=0;\n\n`;

    // 1. PENGATURAN
    sql += `-- Table: pengaturan\n`;
    sql += `DROP TABLE IF EXISTS \`pengaturan\`;\n`;
    sql += `CREATE TABLE \`pengaturan\` (\n`;
    sql += `  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n`;
    sql += `  \`nama_sekolah\` varchar(100) NOT NULL,\n`;
    sql += `  \`logo\` varchar(255) DEFAULT NULL,\n`;
    sql += `  \`alamat\` text DEFAULT NULL,\n`;
    sql += `  \`email\` varchar(100) DEFAULT NULL,\n`;
    sql += `  \`no_hp\` varchar(30) DEFAULT NULL,\n`;
    sql += `  \`website\` varchar(100) DEFAULT NULL,\n`;
    sql += `  \`tahun_ajaran\` varchar(20) DEFAULT NULL,\n`;
    sql += `  \`kepala_sekolah\` varchar(100) DEFAULT NULL,\n`;
    sql += `  \`favicon\` varchar(255) DEFAULT NULL,\n`;
    sql += `  \`tema\` varchar(50) DEFAULT 'Classic Blue',\n`;
    sql += `  \`mode_gelap\` tinyint(1) DEFAULT 0,\n`;
    sql += `  PRIMARY KEY (\`id\`)\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    const p = this.data.pengaturan;
    sql += `INSERT INTO \`pengaturan\` VALUES (${p.id}, '${p.nama_sekolah.replace(/'/g, "''")}', '${p.logo}', '${p.alamat.replace(/'/g, "''")}', '${p.email}', '${p.no_hp}', '${p.website}', '${p.tahun_ajaran}', '${p.kepala_sekolah.replace(/'/g, "''")}', '${p.favicon}', '${p.tema}', ${p.mode_gelap ? 1 : 0});\n\n`;

    // 2. KATEGORI
    sql += `-- Table: kategori\n`;
    sql += `DROP TABLE IF EXISTS \`kategori\`;\n`;
    sql += `CREATE TABLE \`kategori\` (\n`;
    sql += `  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n`;
    sql += `  \`kode_kategori\` varchar(10) NOT NULL,\n`;
    sql += `  \`nama_kategori\` varchar(100) NOT NULL,\n`;
    sql += `  \`deskripsi\` text DEFAULT NULL,\n`;
    sql += `  \`label_warna\` varchar(10) DEFAULT NULL,\n`;
    sql += `  \`ikon\` varchar(50) DEFAULT 'FileText',\n`;
    sql += `  PRIMARY KEY (\`id\`),\n`;
    sql += `  UNIQUE KEY \`kode_kategori\` (\`kode_kategori\`)\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    this.data.kategori.forEach(k => {
      sql += `INSERT INTO \`kategori\` VALUES (${k.id}, '${k.kode_kategori}', '${k.nama_kategori.replace(/'/g, "''")}', '${k.deskripsi.replace(/'/g, "''")}', '${k.label_warna}', '${k.ikon}');\n`;
    });
    sql += `\n`;

    // 3. PENGGUNA
    sql += `-- Table: pengguna\n`;
    sql += `DROP TABLE IF EXISTS \`pengguna\`;\n`;
    sql += `CREATE TABLE \`pengguna\` (\n`;
    sql += `  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n`;
    sql += `  \`username\` varchar(50) NOT NULL,\n`;
    sql += `  \`nama_depan\` varchar(50) NOT NULL,\n`;
    sql += `  \`nama_belakang\` varchar(50) DEFAULT NULL,\n`;
    sql += `  \`password_hash\` varchar(255) NOT NULL,\n`;
    sql += `  \`email\` varchar(100) NOT NULL,\n`;
    sql += `  \`no_hp\` varchar(20) DEFAULT NULL,\n`;
    sql += `  \`foto\` varchar(255) DEFAULT NULL,\n`;
    sql += `  \`role\` enum('Administrator','Operator','Kepala Sekolah') NOT NULL,\n`;
    sql += `  \`status\` enum('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',\n`;
    sql += `  \`login_terakhir\` datetime DEFAULT NULL,\n`;
    sql += `  PRIMARY KEY (\`id\`),\n`;
    sql += `  UNIQUE KEY \`username\` (\`username\`),\n`;
    sql += `  UNIQUE KEY \`email\` (\`email\`)\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    this.data.users.forEach(u => {
      const loginVal = u.login_terakhir ? `'${u.login_terakhir.slice(0, 19).replace('T', ' ')}'` : 'NULL';
      sql += `INSERT INTO \`pengguna\` VALUES (${u.id}, '${u.username}', '${u.nama_depan.replace(/'/g, "''")}', '${u.nama_belakang.replace(/'/g, "''")}', '${u.password_hash}', '${u.email}', '${u.no_hp}', '${u.foto}', '${u.role}', '${u.status}', ${loginVal});\n`;
    });
    sql += `\n`;

    // 4. ARSIP
    sql += `-- Table: arsip\n`;
    sql += `DROP TABLE IF EXISTS \`arsip\`;\n`;
    sql += `CREATE TABLE \`arsip\` (\n`;
    sql += `  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n`;
    sql += `  \`nomor_arsip\` varchar(50) NOT NULL,\n`;
    sql += `  \`kode_arsip\` varchar(50) NOT NULL,\n`;
    sql += `  \`judul_dokumen\` varchar(255) NOT NULL,\n`;
    sql += `  \`id_kategori\` int(11) NOT NULL,\n`;
    sql += `  \`jenis_dokumen\` varchar(20) NOT NULL,\n`;
    sql += `  \`tanggal_dokumen\` date NOT NULL,\n`;
    sql += `  \`tanggal_unggah\` datetime NOT NULL,\n`;
    sql += `  \`pengunggah\` varchar(50) NOT NULL,\n`;
    sql += `  \`deskripsi\` text DEFAULT NULL,\n`;
    sql += `  \`kata_kunci\` varchar(255) DEFAULT NULL,\n`;
    sql += `  \`nomor_surat\` varchar(100) DEFAULT NULL,\n`;
    sql += `  \`asal_surat\` varchar(150) DEFAULT NULL,\n`;
    sql += `  \`tujuan_surat\` varchar(150) DEFAULT NULL,\n`;
    sql += `  \`status_arsip\` enum('Aktif','Dipinjam','Arsip','Kadaluarsa') NOT NULL DEFAULT 'Aktif',\n`;
    sql += `  \`lokasi_penyimpanan\` varchar(150) DEFAULT NULL,\n`;
    sql += `  \`berkas_dokumen\` varchar(255) NOT NULL,\n`;
    sql += `  \`berkas_nama_asli\` varchar(255) NOT NULL,\n`;
    sql += `  \`berkas_ukuran\` varchar(30) NOT NULL,\n`;
    sql += `  \`version\` int(11) DEFAULT 1,\n`;
    sql += `  \`favorites_count\` int(11) DEFAULT 0,\n`;
    sql += `  \`views_count\` int(11) DEFAULT 0,\n`;
    sql += `  \`download_count\` int(11) DEFAULT 0,\n`;
    sql += `  PRIMARY KEY (\`id\`),\n`;
    sql += `  KEY \`id_kategori\` (\`id_kategori\`),\n`;
    sql += `  CONSTRAINT \`fk_arsip_kategori\` FOREIGN KEY (\`id_kategori\`) REFERENCES \`kategori\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    this.data.arsip.forEach(a => {
      sql += `INSERT INTO \`arsip\` VALUES (${a.id}, '${a.nomor_arsip}', '${a.kode_arsip}', '${a.judul_dokumen.replace(/'/g, "''")}', ${a.id_kategori}, '${a.jenis_dokumen}', '${a.tanggal_dokumen}', '${a.tanggal_unggah.slice(0,19).replace('T', ' ')}', '${a.pengunggah}', '${a.deskripsi.replace(/'/g, "''")}', '${a.kata_kunci.replace(/'/g, "''")}', '${a.nomor_surat.replace(/'/g, "''")}', '${a.asal_surat.replace(/'/g, "''")}', '${a.tujuan_surat.replace(/'/g, "''")}', '${a.status_arsip}', '${a.lokasi_penyimpanan.replace(/'/g, "''")}', '${a.berkas_dokumen}', '${a.berkas_nama_asli}', '${a.berkas_ukuran}', ${a.version}, ${a.favorites_count}, ${a.views_count}, ${a.download_count});\n`;
    });
    sql += `\n`;

    // 5. ARSIP VERSI
    sql += `-- Table: arsip_versi\n`;
    sql += `DROP TABLE IF EXISTS \`arsip_versi\`;\n`;
    sql += `CREATE TABLE \`arsip_versi\` (\n`;
    sql += `  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n`;
    sql += `  \`id_arsip\` int(11) NOT NULL,\n`;
    sql += `  \`versi\` int(11) NOT NULL,\n`;
    sql += `  \`berkas_dokumen\` varchar(255) NOT NULL,\n`;
    sql += `  \`berkas_nama_asli\` varchar(255) NOT NULL,\n`;
    sql += `  \`berkas_ukuran\` varchar(30) NOT NULL,\n`;
    sql += `  \`tanggal_versi\` datetime NOT NULL,\n`;
    sql += `  \`diubah_oleh\` varchar(50) NOT NULL,\n`;
    sql += `  \`deskripsi\` text DEFAULT NULL,\n`;
    sql += `  PRIMARY KEY (\`id\`),\n`;
    sql += `  KEY \`id_arsip\` (\`id_arsip\`),\n`;
    sql += `  CONSTRAINT \`fk_versi_arsip\` FOREIGN KEY (\`id_arsip\`) REFERENCES \`arsip\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    this.data.arsip_versi.forEach(v => {
      sql += `INSERT INTO \`arsip_versi\` VALUES (${v.id}, ${v.id_arsip}, ${v.versi}, '${v.berkas_dokumen}', '${v.berkas_nama_asli}', '${v.berkas_ukuran}', '${v.tanggal_versi.slice(0,19).replace('T', ' ')}', '${v.diubah_oleh}', '${v.deskripsi.replace(/'/g, "''")}');\n`;
    });
    sql += `\n`;

    // 6. LOG AKTIVITAS
    sql += `-- Table: log_aktivitas\n`;
    sql += `DROP TABLE IF EXISTS \`log_aktivitas\`;\n`;
    sql += `CREATE TABLE \`log_aktivitas\` (\n`;
    sql += `  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n`;
    sql += `  \`id_pengguna\` int(11) DEFAULT NULL,\n`;
    sql += `  \`username\` varchar(50) NOT NULL,\n`;
    sql += `  \`aksi\` varchar(50) NOT NULL,\n`;
    sql += `  \`rincian\` text DEFAULT NULL,\n`;
    sql += `  \`waktu\` datetime NOT NULL,\n`;
    sql += `  \`ip_address\` varchar(45) NOT NULL,\n`;
    sql += `  \`browser\` varchar(255) DEFAULT NULL,\n`;
    sql += `  PRIMARY KEY (\`id\`)\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    this.data.log_aktivitas.forEach(l => {
      const uId = l.id_pengguna ? l.id_pengguna : 'NULL';
      sql += `INSERT INTO \`log_aktivitas\` VALUES (${l.id}, ${uId}, '${l.username}', '${l.aksi}', '${l.rincian.replace(/'/g, "''")}', '${l.waktu.slice(0,19).replace('T', ' ')}', '${l.ip_address}', '${l.browser}');\n`;
    });
    sql += `\n`;

    // 7. UNDUH LOG
    sql += `-- Table: unduh_log\n`;
    sql += `DROP TABLE IF EXISTS \`unduh_log\`;\n`;
    sql += `CREATE TABLE \`unduh_log\` (\n`;
    sql += `  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n`;
    sql += `  \`id_arsip\` int(11) NOT NULL,\n`;
    sql += `  \`judul_arsip\` varchar(255) NOT NULL,\n`;
    sql += `  \`id_pengguna\` int(11) NOT NULL,\n`;
    sql += `  \`username\` varchar(50) NOT NULL,\n`;
    sql += `  \`waktu\` datetime NOT NULL,\n`;
    sql += `  \`ip_address\` varchar(45) NOT NULL,\n`;
    sql += `  \`browser\` varchar(255) DEFAULT NULL,\n`;
    sql += `  PRIMARY KEY (\`id\`),\n`;
    sql += `  KEY \`id_arsip\` (\`id_arsip\`),\n`;
    sql += `  CONSTRAINT \`fk_unduh_arsip\` FOREIGN KEY (\`id_arsip\`) REFERENCES \`arsip\` (\`id\`) ON DELETE CASCADE\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    this.data.unduh_log.forEach(u => {
      sql += `INSERT INTO \`unduh_log\` VALUES (${u.id}, ${u.id_arsip}, '${u.judul_arsip.replace(/'/g, "''")}', ${u.id_pengguna}, '${u.username}', '${u.waktu.slice(0,19).replace('T', ' ')}', '${u.ip_address}', '${u.browser}');\n`;
    });
    sql += `\n`;

    // 8. FAVORIT
    sql += `-- Table: favorit\n`;
    sql += `DROP TABLE IF EXISTS \`favorit\`;\n`;
    sql += `CREATE TABLE \`favorit\` (\n`;
    sql += `  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n`;
    sql += `  \`id_pengguna\` int(11) NOT NULL,\n`;
    sql += `  \`id_arsip\` int(11) NOT NULL,\n`;
    sql += `  \`waktu\` datetime NOT NULL,\n`;
    sql += `  PRIMARY KEY (\`id\`),\n`;
    sql += `  KEY \`id_pengguna\` (\`id_pengguna\`),\n`;
    sql += `  KEY \`id_arsip\` (\`id_arsip\`),\n`;
    sql += `  CONSTRAINT \`fk_fav_user\` FOREIGN KEY (\`id_pengguna\`) REFERENCES \`pengguna\` (\`id\`) ON DELETE CASCADE,\n`;
    sql += `  CONSTRAINT \`fk_fav_arsip\` FOREIGN KEY (\`id_arsip\`) REFERENCES \`arsip\` (\`id\`) ON DELETE CASCADE\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    this.data.favorit.forEach(f => {
      sql += `INSERT INTO \`favorit\` VALUES (${f.id}, ${f.id_pengguna}, ${f.id_arsip}, '${f.waktu.slice(0,19).replace('T', ' ')}');\n`;
    });
    sql += `\n`;

    // 9. RIWAYAT CADANGAN
    sql += `-- Table: riwayat_cadangan\n`;
    sql += `DROP TABLE IF EXISTS \`riwayat_cadangan\`;\n`;
    sql += `CREATE TABLE \`riwayat_cadangan\` (\n`;
    sql += `  \`id\` int(11) NOT NULL AUTO_INCREMENT,\n`;
    sql += `  \`nama_file\` varchar(150) NOT NULL,\n`;
    sql += `  \`tanggal_cadangan\` datetime NOT NULL,\n`;
    sql += `  \`ukuran\` varchar(30) NOT NULL,\n`;
    sql += `  \`dibuat_oleh\` varchar(50) NOT NULL,\n`;
    sql += `  PRIMARY KEY (\`id\`)\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    this.data.riwayat_cadangan.forEach(b => {
      sql += `INSERT INTO \`riwayat_cadangan\` VALUES (${b.id}, '${b.nama_file}', '${b.tanggal_cadangan.slice(0,19).replace('T', ' ')}', '${b.ukuran}', '${b.dibuat_oleh}');\n`;
    });
    sql += `\n`;

    sql += `SET FOREIGN_KEY_CHECKS=1;\n`;
    return sql;
  }
}

export const db = new LocalDB();
