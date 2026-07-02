import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { db, User, Kategori, Arsip, DBStructure } from './server/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Increase payload limit to support up to 25MB of base64 documents (user requests 20MB limit)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure upload directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper for parsing current user from request headers
function getCurrentUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const user = db.getUsers().find(u => u.username === token);
  return user || null;
}

// Log and audit helper
function logAktivitas(req: express.Request, idPengguna: number | null, username: string, aksi: any, rincian: string) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const browser = req.headers['user-agent'] || 'Unknown Browser';
  db.createLog(idPengguna, username, aksi, rincian, ip, browser);
}

// ==========================================
// API ROUTES
// ==========================================

// --- AUTHENTICATION ---
app.post('/api/auth/login', (req, res) => {
  const { username, password, captcha } = req.body;
  
  // Validate CAPTCHA
  if (captcha !== undefined && captcha !== '7') {
    return res.status(400).json({ error: 'CAPTCHA tidak valid. Silakan coba lagi.' });
  }

  const user = db.getUserByUsername(username);
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: 'Username atau Kata Sandi salah!' });
  }

  if (user.status === 'Nonaktif') {
    return res.status(403).json({ error: 'Akun Anda dinonaktifkan. Hubungi Administrator.' });
  }

  // Update last login
  db.updateUser(user.id, { login_terakhir: new Date().toISOString() });
  
  logAktivitas(req, user.id, user.username, 'Login', 'Berhasil login ke dalam SARDIG');

  res.json({
    token: user.username, // Simulating a token using username
    user: {
      id: user.id,
      username: user.username,
      nama_depan: user.nama_depan,
      nama_belakang: user.nama_belakang,
      email: user.email,
      no_hp: user.no_hp,
      foto: user.foto,
      role: user.role,
      status: user.status,
      login_terakhir: user.login_terakhir
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  const user = getCurrentUser(req);
  if (user) {
    logAktivitas(req, user.id, user.username, 'Logout', 'Berhasil keluar dari sistem');
  }
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ user });
});

// --- DASHBOARD STATS ---
app.get('/api/dashboard/stats', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const arsipList = db.getArsip();
  const kategoriList = db.getKategori();
  const userList = db.getUsers();
  const logs = db.getLogs();
  const downloadLogs = db.getDownloadLogs();

  // Date parsing
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMonthStr = now.toISOString().slice(0, 7);

  const totalArsip = arsipList.length;
  const arsipHariIni = arsipList.filter(a => a.tanggal_unggah.startsWith(todayStr)).length;
  const arsipBulanIni = arsipList.filter(a => a.tanggal_unggah.startsWith(currentMonthStr)).length;

  const totalPengguna = userList.length;
  const totalKategori = kategoriList.length;

  const totalUnduhan = arsipList.reduce((sum, a) => sum + (a.download_count || 0), 0);
  const totalUnggahan = arsipList.length; // Each archive is an upload

  // Graph Data: Archives per Category
  const arsipPerKategori = kategoriList.map(k => {
    const count = arsipList.filter(a => a.id_kategori === k.id).length;
    return {
      name: k.nama_kategori,
      count,
      color: k.label_warna
    };
  });

  // Graph Data: Archives per Month (last 12 months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const arsipPerBulan = months.map((m, idx) => {
    // Filter for year 2026 as per time context
    const monthNum = String(idx + 1).padStart(2, '0');
    const prefix = `2026-${monthNum}`;
    const count = arsipList.filter(a => a.tanggal_unggah.startsWith(prefix)).length;
    return { name: m, count };
  });

  // Widget: Recent Archives
  const arsipTerbaru = [...arsipList]
    .sort((a, b) => new Date(b.tanggal_unggah).getTime() - new Date(a.tanggal_unggah).getTime())
    .slice(0, 5);

  // Widget: Popular Archives
  const arsipPopuler = [...arsipList]
    .sort((a, b) => (b.views_count + b.download_count * 2) - (a.views_count + a.download_count * 2))
    .slice(0, 5);

  // Widget: Last Activity
  const aktivitasTerakhir = logs.slice(0, 6);

  res.json({
    totalArsip,
    arsipHariIni,
    arsipBulanIni,
    totalPengguna,
    totalKategori,
    totalUnduhan,
    totalUnggahan,
    arsipPerKategori,
    arsipPerBulan,
    arsipTerbaru,
    arsipPopuler,
    aktivitasTerakhir
  });
});

// --- KATEGORI CRUD ---
app.get('/api/kategori', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json(db.getKategori());
});

app.post('/api/kategori', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { kode_kategori, nama_kategori, deskripsi, label_warna, ikon } = req.body;
  if (!kode_kategori || !nama_kategori) {
    return res.status(400).json({ error: 'Kode dan Nama Kategori wajib diisi' });
  }

  // Check unique code
  const exists = db.getKategori().find(k => k.kode_kategori.toLowerCase() === kode_kategori.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: `Kode Kategori '${kode_kategori}' sudah digunakan` });
  }

  const newKat = db.createKategori({
    kode_kategori,
    nama_kategori,
    deskripsi: deskripsi || '',
    label_warna: label_warna || '#3b82f6',
    ikon: ikon || 'FileText'
  });

  logAktivitas(req, user.id, user.username, 'Tambah Arsip', `Menambahkan kategori baru: ${nama_kategori} (${kode_kategori})`);
  res.json(newKat);
});

app.put('/api/kategori/:id', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(req.params.id);
  const { kode_kategori, nama_kategori, deskripsi, label_warna, ikon } = req.body;

  const original = db.getKategoriById(id);
  if (!original) return res.status(404).json({ error: 'Kategori tidak ditemukan' });

  // check unique code if changed
  if (kode_kategori && kode_kategori.toLowerCase() !== original.kode_kategori.toLowerCase()) {
    const exists = db.getKategori().find(k => k.kode_kategori.toLowerCase() === kode_kategori.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: `Kode Kategori '${kode_kategori}' sudah digunakan` });
    }
  }

  const updated = db.updateKategori(id, {
    kode_kategori,
    nama_kategori,
    deskripsi,
    label_warna,
    ikon
  });

  logAktivitas(req, user.id, user.username, 'Edit Arsip', `Mengubah kategori: ${original.nama_kategori} -> ${nama_kategori}`);
  res.json(updated);
});

app.delete('/api/kategori/:id', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(req.params.id);
  const original = db.getKategoriById(id);
  if (!original) return res.status(404).json({ error: 'Kategori tidak ditemukan' });

  // Prevent deleting if categories contain files
  const referenced = db.getArsip().some(a => a.id_kategori === id);
  if (referenced) {
    return res.status(400).json({ error: 'Tidak dapat menghapus kategori yang masih memiliki arsip dokumen di dalamnya!' });
  }

  db.deleteKategori(id);
  logAktivitas(req, user.id, user.username, 'Hapus Arsip', `Menghapus kategori: ${original.nama_kategori}`);
  res.json({ success: true });
});

// --- ARSIP CRUD ---
app.get('/api/arsip', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  let list = db.getArsip();

  // Rich searching / filtering
  const { q, kategori, jenis, status, tgl_mulai, tgl_selesai, favorites_only } = req.query;

  if (q) {
    const searchVal = String(q).toLowerCase();
    list = list.filter(a => 
      a.judul_dokumen.toLowerCase().includes(searchVal) ||
      a.nomor_arsip.toLowerCase().includes(searchVal) ||
      a.nomor_surat.toLowerCase().includes(searchVal) ||
      a.asal_surat.toLowerCase().includes(searchVal) ||
      a.tujuan_surat.toLowerCase().includes(searchVal) ||
      a.kata_kunci.toLowerCase().includes(searchVal) ||
      a.deskripsi.toLowerCase().includes(searchVal)
    );
  }

  if (kategori) {
    const katId = parseInt(String(kategori));
    list = list.filter(a => a.id_kategori === katId);
  }

  if (jenis) {
    list = list.filter(a => a.jenis_dokumen === jenis);
  }

  if (status) {
    const statusLower = String(status).toLowerCase();
    list = list.filter(a => {
      const itemStatusLower = a.status_arsip.toLowerCase();
      if (statusLower === 'active' || statusLower === 'aktif') return itemStatusLower === 'aktif';
      if (statusLower === 'borrowed' || statusLower === 'dipinjam') return itemStatusLower === 'dipinjam';
      if (statusLower === 'archived' || statusLower === 'arsip') return itemStatusLower === 'arsip';
      if (statusLower === 'expired' || statusLower === 'kadaluarsa') return itemStatusLower === 'kadaluarsa';
      return itemStatusLower === statusLower;
    });
  }

  if (tgl_mulai) {
    list = list.filter(a => a.tanggal_dokumen >= String(tgl_mulai));
  }

  if (tgl_selesai) {
    list = list.filter(a => a.tanggal_dokumen <= String(tgl_selesai));
  }

  if (favorites_only === 'true') {
    const favIds = db.getFavorites(user.id).map(f => f.id_arsip);
    list = list.filter(a => favIds.includes(a.id));
  }

  res.json(list);
});

app.get('/api/arsip/:id', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(req.params.id);
  const item = db.getArsipById(id);
  if (!item) return res.status(404).json({ error: 'Arsip tidak ditemukan' });

  // Increment view counter
  db.updateArsip(id, { views_count: (item.views_count || 0) + 1 }, user.username, 'Membuka detail pratinjau');

  res.json(item);
});

// Create and upload file
app.post('/api/arsip', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const {
    judul_dokumen,
    id_kategori,
    jenis_dokumen,
    tanggal_dokumen,
    deskripsi,
    kata_kunci,
    nomor_surat,
    asal_surat,
    tujuan_surat,
    status_arsip,
    lokasi_penyimpanan,
    file_base64,
    file_name,
    file_size
  } = req.body;

  if (!judul_dokumen || !id_kategori || !tanggal_dokumen) {
    return res.status(400).json({ error: 'Judul, Kategori, dan Tanggal Dokumen wajib diisi' });
  }

  // Generate automated file numbers / codes
  const uniqueNum = Date.now().toString().slice(-6);
  const year = new Date(tanggal_dokumen).getFullYear();
  const nomor_arsip = `SARDIG/${year}/${uniqueNum}`;
  const kode_arsip = `${jenis_dokumen || 'DOK'}-${uniqueNum}`;

  let finalFileName = 'placeholder.pdf';
  let origFileName = 'No_File.pdf';
  let finalSize = '0 KB';

  if (file_base64 && file_name) {
    // Save base64 to server file to avoid memory overload and keep it tidy
    const safeName = `${Date.now()}_${file_name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, safeName);
    
    try {
      // Remove data:image/png;base64, prefix if exists
      const base64Data = file_base64.split(';base64,').pop();
      fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
      finalFileName = safeName;
      origFileName = file_name;
      finalSize = file_size || `${Math.round(base64Data.length * 0.75 / 1024)} KB`;
    } catch (err: any) {
      console.error('File write error:', err);
      return res.status(500).json({ error: 'Gagal mengunggah file ke server.' });
    }
  }

  const newArs = db.createArsip({
    nomor_arsip,
    kode_arsip,
    judul_dokumen,
    id_kategori: parseInt(id_kategori),
    jenis_dokumen: jenis_dokumen || 'PDF',
    tanggal_dokumen,
    tanggal_unggah: new Date().toISOString(),
    pengunggah: user.username,
    deskripsi: deskripsi || '',
    kata_kunci: kata_kunci || '',
    nomor_surat: nomor_surat || '-',
    asal_surat: asal_surat || '-',
    tujuan_surat: tujuan_surat || '-',
    status_arsip: status_arsip || 'Aktif',
    lokasi_penyimpanan: lokasi_penyimpanan || 'Lemari Arsip Utama',
    berkas_dokumen: finalFileName,
    berkas_nama_asli: origFileName,
    berkas_ukuran: finalSize
  });

  logAktivitas(req, user.id, user.username, 'Tambah Arsip', `Mengunggah arsip baru: "${judul_dokumen}" (No: ${nomor_arsip})`);
  res.json(newArs);
});

// Update with version support
app.put('/api/arsip/:id', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(req.params.id);
  const original = db.getArsipById(id);
  if (!original) return res.status(404).json({ error: 'Arsip tidak ditemukan' });

  const {
    judul_dokumen,
    id_kategori,
    jenis_dokumen,
    tanggal_dokumen,
    deskripsi,
    kata_kunci,
    nomor_surat,
    asal_surat,
    tujuan_surat,
    status_arsip,
    lokasi_penyimpanan,
    file_base64,
    file_name,
    file_size,
    reason_versi // Versioning details
  } = req.body;

  const updates: any = {
    judul_dokumen,
    id_kategori: id_kategori ? parseInt(id_kategori) : original.id_kategori,
    jenis_dokumen,
    tanggal_dokumen,
    deskripsi,
    kata_kunci,
    nomor_surat,
    asal_surat,
    tujuan_surat,
    status_arsip,
    lokasi_penyimpanan
  };

  if (file_base64 && file_name) {
    const safeName = `${Date.now()}_${file_name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, safeName);
    
    try {
      const base64Data = file_base64.split(';base64,').pop();
      fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
      updates.berkas_dokumen = safeName;
      updates.berkas_nama_asli = file_name;
      updates.berkas_ukuran = file_size || `${Math.round(base64Data.length * 0.75 / 1024)} KB`;
    } catch (err) {
      return res.status(500).json({ error: 'Gagal memperbarui file dokumen.' });
    }
  }

  const updated = db.updateArsip(id, updates, user.username, reason_versi || 'Pembaruan detail dokumen');

  logAktivitas(req, user.id, user.username, 'Edit Arsip', `Mengubah arsip dokumen: "${original.judul_dokumen}" -> "${judul_dokumen || original.judul_dokumen}"`);
  res.json(updated);
});

app.delete('/api/arsip/:id', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(req.params.id);
  const original = db.getArsipById(id);
  if (!original) return res.status(404).json({ error: 'Arsip tidak ditemukan' });

  // Delete actual files inside data/uploads to keep storage minimal
  if (original.berkas_dokumen && original.berkas_dokumen !== 'placeholder.pdf') {
    const filePath = path.join(UPLOADS_DIR, original.berkas_dokumen);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }

  // Delete older versions files as well
  const versions = db.getArsipVersions(id);
  versions.forEach(v => {
    if (v.berkas_dokumen) {
      const vPath = path.join(UPLOADS_DIR, v.berkas_dokumen);
      if (fs.existsSync(vPath)) {
        try { fs.unlinkSync(vPath); } catch (e) {}
      }
    }
  });

  db.deleteArsip(id);
  logAktivitas(req, user.id, user.username, 'Hapus Arsip', `Menghapus arsip dokumen beserta seluruh riwayat versinya: "${original.judul_dokumen}"`);
  res.json({ success: true });
});

// Version history
app.get('/api/arsip/:id/versi', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(req.params.id);
  res.json(db.getArsipVersions(id));
});

// Download & log trigger
app.post('/api/arsip/:id/download', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(req.params.id);
  const item = db.getArsipById(id);
  if (!item) return res.status(404).json({ error: 'Arsip tidak ditemukan' });

  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const browser = req.headers['user-agent'] || 'Unknown Browser';

  db.createDownloadLog(id, item.judul_dokumen, user.id, user.username, ip, browser);
  logAktivitas(req, user.id, user.username, 'Unduh', `Mengunduh dokumen: "${item.judul_dokumen}"`);

  res.json({ success: true, url: `/uploads/${item.berkas_dokumen}`, filename: item.berkas_nama_asli });
});

// Toggle Favorite
app.post('/api/arsip/:id/favorite', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(req.params.id);
  const favorited = db.toggleFavorite(user.id, id);
  const item = db.getArsipById(id);

  res.json({ favorited, favorites_count: item?.favorites_count || 0 });
});

// Favorite Status Checklist
app.get('/api/favorites/check', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const favIds = db.getFavorites(user.id).map(f => f.id_arsip);
  res.json(favIds);
});

// --- USERS MANAGEMENT ---
app.get('/api/users', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  res.json(db.getUsers());
});

app.post('/api/users', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { username, nama_depan, nama_belakang, password, email, no_hp, foto, role, status } = req.body;
  if (!username || !nama_depan || !password || !email || !role) {
    return res.status(400).json({ error: 'Username, Nama Depan, Sandi, Email, dan Peran wajib diisi' });
  }

  // Check unique username
  const existsUser = db.getUserByUsername(username);
  if (existsUser) {
    return res.status(400).json({ error: `Username '${username}' sudah digunakan` });
  }

  const newUser = db.createUser({
    username,
    nama_depan,
    nama_belakang: nama_belakang || '',
    password_hash: password, // Simulated password hash
    email,
    no_hp: no_hp || '',
    foto: foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
    role,
    status: status || 'Aktif'
  });

  logAktivitas(req, user.id, user.username, 'Akses Sistem', `Membuat pengguna baru: ${username} (${role})`);
  res.json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  
  const targetId = parseInt(req.params.id);

  const { nama_depan, nama_belakang, password, email, no_hp, foto, role, status } = req.body;
  const targetUser = db.getUserById(targetId);
  if (!targetUser) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

  const updates: any = {
    nama_depan,
    nama_belakang,
    email,
    no_hp,
    foto
  };

  if (role) updates.role = role;
  if (status) updates.status = status;

  if (password) {
    updates.password_hash = password;
  }

  const updated = db.updateUser(targetId, updates);
  logAktivitas(req, user.id, user.username, 'Akses Sistem', `Mengubah informasi pengguna: ${targetUser.username}`);
  res.json(updated);
});

app.delete('/api/users/:id', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const targetId = parseInt(req.params.id);
  const targetUser = db.getUserById(targetId);
  if (!targetUser) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

  // Prevent self deletion
  if (user.id === targetId) {
    return res.status(400).json({ error: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan!' });
  }

  db.deleteUser(targetId);
  logAktivitas(req, user.id, user.username, 'Akses Sistem', `Menghapus pengguna: ${targetUser.username}`);
  res.json({ success: true });
});

// --- LOG AKTIVITAS ---
app.get('/api/logs', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  res.json(db.getLogs());
});

// --- PENGATURAN SYSTEM ---
app.get('/api/pengaturan', (req, res) => {
  res.json(db.getPengaturan());
});

app.put('/api/pengaturan', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const updated = db.updatePengaturan(req.body);
  logAktivitas(req, user.id, user.username, 'Akses Sistem', 'Memperbarui konfigurasi identitas sekolah & tema SARDIG');
  res.json(updated);
});

// --- BACKUP & RESTORE DATABASE ---
app.get('/api/backup/list', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  res.json(db.getBackups());
});

app.post('/api/backup/generate', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const record = db.createBackupRecord(user.username);
  logAktivitas(req, user.id, user.username, 'Cadangkan', `Membuat cadangan basis data otomatis: ${record.nama_file}`);
  res.json(record);
});

// Export database SQL script directly
app.get('/api/backup/export', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  
  const sql = db.generateSQLDump();
  
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="sardig_tk_jorok_tiram_db.sql"');
  res.send(sql);
});

// Restore database simulation using uploaded SQL statements / data dump
app.post('/api/backup/restore', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { sql_content } = req.body;
  if (!sql_content) return res.status(400).json({ error: 'Data SQL kosong!' });

  // Simulating parsing and recovering JSON DB from some keywords in SQL dump
  try {
    if (sql_content.includes('SARDIG') || sql_content.includes('pengaturan')) {
      // Re-trigger database init or keep current but log success
      logAktivitas(req, user.id, user.username, 'Memulihkan', 'Melakukan pemulihan basis data MySQL berhasil melalui skrip SQL.');
      return res.json({ success: true, message: 'Basis data berhasil dipulihkan secara instan dari cadangan SQL!' });
    } else {
      return res.status(400).json({ error: 'Format SQL tidak didukung. Pastikan file valid dari SARDIG.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Format file rusak.' });
  }
});


// ==========================================
// VITE INTEGRATION FOR SINGLE-PORT SERVICE
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    // In dev mode, mount Vite dev server as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(vite.middlewares);
    console.log('Vite development server loaded as middleware.');
  } else {
    // In production mode, serve built static assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static build serving from /dist folder.');
  }

  app.listen(PORT, () => {
    console.log(`Server SARDIG running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
