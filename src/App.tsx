import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Folder,
  Users,
  Download,
  Upload,
  Shield,
  Database,
  Settings,
  LogOut,
  Search,
  Plus,
  Edit,
  Trash2,
  Key,
  Calendar,
  Mail,
  Phone,
  Globe,
  BookOpen,
  DollarSign,
  Image as ImageIcon,
  Send,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  X,
  Star,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Activity,
  RefreshCw,
  BarChart2,
  ChevronRight,
  FileDown
} from 'lucide-react';

// Definitions for interfaces matching backend
interface User {
  id: number;
  username: string;
  nama_depan: string;
  nama_belakang: string;
  email: string;
  no_hp: string;
  foto: string;
  role: 'Administrator' | 'Operator' | 'Kepala Sekolah';
  status: 'Aktif' | 'Nonaktif';
  login_terakhir: string | null;
}

interface Kategori {
  id: number;
  kode_kategori: string;
  nama_kategori: string;
  deskripsi: string;
  label_warna: string;
  ikon: string;
}

interface Arsip {
  id: number;
  nomor_arsip: string;
  kode_arsip: string;
  judul_dokumen: string;
  id_kategori: number;
  jenis_dokumen: string;
  tanggal_dokumen: string;
  tanggal_unggah: string;
  pengunggah: string;
  deskripsi: string;
  kata_kunci: string;
  nomor_surat: string;
  asal_surat: string;
  tujuan_surat: string;
  status_arsip: 'Aktif' | 'Dipinjam' | 'Arsip' | 'Kadaluarsa' | 'Active' | 'Borrowed' | 'Archived' | 'Expired';
  lokasi_penyimpanan: string;
  berkas_dokumen: string;
  berkas_nama_asli: string;
  berkas_ukuran: string;
  version: number;
  favorites_count: number;
  views_count: number;
  download_count: number;
}

interface LogAktivitas {
  id: number;
  username: string;
  aksi: string;
  rincian: string;
  waktu: string;
  ip_address: string;
  browser: string;
}

interface Pengaturan {
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
  tema: string;
  mode_gelap: boolean;
}

interface BackupFile {
  id: number;
  nama_file: string;
  tanggal_cadangan: string;
  ukuran: string;
  dibuat_oleh: string;
}

export default function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sardig_token'));
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [authError, setAuthError] = useState('');

  // App Navigation & UI State
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'arsip' | 'kategori' | 'users' | 'logs' | 'reports' | 'backup' | 'pengaturan'>('dashboard');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [systemOnline, setSystemOnline] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Database States
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [archives, setArchives] = useState<Arsip[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [logsList, setLogsList] = useState<LogAktivitas[]>([]);
  const [settings, setSettings] = useState<Pengaturan>({
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
  });

  // Modal States
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editId?: number; data: Partial<Kategori> } | null>(null);
  const [archiveModal, setArchiveModal] = useState<{ open: boolean; editId?: number; data: Partial<Arsip> & { file_base64?: string; file_name?: string; file_size?: string; reason_versi?: string } } | null>(null);
  const [userModal, setUserModal] = useState<{ open: boolean; editId?: number; data: Partial<User> & { password?: string } } | null>(null);
  const [previewArchive, setPreviewArchive] = useState<Arsip | null>(null);
  const [viewHistoryModal, setViewHistoryModal] = useState<{ open: boolean; archiveId: number; versions: any[] } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Dashboard Stats
  const [stats, setStats] = useState<any>(null);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Auth fetch headers
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // Load configuration, session, and DB
  useEffect(() => {
    fetchSettings();
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, activeMenu]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchCategories(),
        fetchArchives(),
        fetchUsers(),
        fetchLogs()
      ]);
    } catch (e) {
      showToast('Gagal memuat beberapa data sistem', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/pengaturan');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setDarkMode(data.mode_gelap);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        handleLogout();
      }
    } catch (e) {
      handleLogout();
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', { headers: getHeaders() });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/kategori', { headers: getHeaders() });
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchArchives = async () => {
    try {
      const url = new URL('/api/arsip', window.location.origin);
      if (searchQuery) url.searchParams.append('q', searchQuery);
      if (filterCategory) url.searchParams.append('kategori', filterCategory);
      if (filterType) url.searchParams.append('jenis', filterType);
      if (filterStatus) url.searchParams.append('status', filterStatus);
      if (filterDateStart) url.searchParams.append('tgl_mulai', filterDateStart);
      if (filterDateEnd) url.searchParams.append('tgl_selesai', filterDateEnd);
      if (favoritesOnly) url.searchParams.append('favorites_only', 'true');

      const res = await fetch(url.toString(), { headers: getHeaders() });
      if (res.ok) setArchives(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { headers: getHeaders() });
      if (res.ok) setUsersList(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs', { headers: getHeaders() });
      if (res.ok) setLogsList(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setCaptchaError('');

    if (captchaAnswer !== '7') {
      setCaptchaError('Jawaban CAPTCHA salah! Berapa hasil dari 3 + 4?');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
          captcha: captchaAnswer
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (rememberMe) {
          localStorage.setItem('sardig_token', data.token);
        }
        setToken(data.token);
        setUser(data.user);
        showToast(`Selamat datang kembali, ${data.user.nama_depan}!`, 'success');
      } else {
        const err = await res.json();
        setAuthError(err.error || 'Username atau Sandi tidak sesuai.');
      }
    } catch (e) {
      setAuthError('Koneksi ke server gagal. Pastikan Apache & node aktif.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: getHeaders() });
    } catch (e) {}
    localStorage.removeItem('sardig_token');
    setToken(null);
    setUser(null);
    setActiveMenu('dashboard');
    showToast('Anda telah keluar dari SARDIG.', 'info');
  };

  // Reset password warning simulation
  const handleForgotPassword = () => {
    alert('Kontak Administrator TK JOROK TIRAM untuk mereset kata sandi Anda.');
  };

  // --- CRUD ACTIONS ---

  // Categories CRUD
  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryModal) return;
    setLoading(true);

    const isEdit = !!categoryModal.editId;
    const url = isEdit ? `/api/kategori/${categoryModal.editId}` : '/api/kategori';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(categoryModal.data)
      });

      if (res.ok) {
        showToast(isEdit ? 'Kategori berhasil diperbarui' : 'Kategori baru berhasil ditambahkan', 'success');
        setCategoryModal(null);
        fetchCategories();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal menyimpan kategori', 'error');
      }
    } catch (e) {
      showToast('Gagal terhubung ke database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/kategori/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) {
        showToast('Kategori berhasil dihapus', 'success');
        fetchCategories();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal menghapus kategori', 'error');
      }
    } catch (e) {
      showToast('Koneksi database terputus', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Archives CRUD
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !archiveModal) return;

    if (file.size > 20 * 1024 * 1024) {
      showToast('Ukuran berkas melebihi batas maksimal 20 MB!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setArchiveModal({
        ...archiveModal,
        data: {
          ...archiveModal.data,
          file_base64: reader.result as string,
          file_name: file.name,
          file_size: `${(file.size / 1024).toFixed(0)} KB`,
          jenis_dokumen: file.name.split('.').pop()?.toUpperCase() || 'PDF'
        }
      });
      showToast('Berkas dokumen siap diunggah!', 'info');
    };
    reader.readAsDataURL(file);
  };

  const saveArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveModal) return;
    setLoading(true);

    const isEdit = !!archiveModal.editId;
    const url = isEdit ? `/api/arsip/${archiveModal.editId}` : '/api/arsip';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(archiveModal.data)
      });

      if (res.ok) {
        showToast(isEdit ? 'Arsip dokumen berhasil diperbarui & versi dicatat!' : 'Arsip baru berhasil diunggah & dicatat!', 'success');
        setArchiveModal(null);
        fetchArchives();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal menyimpan arsip', 'error');
      }
    } catch (e) {
      showToast('Kesalahan pengunggahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteArchive = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus arsip dokumen ini secara permanen? Seluruh riwayat versi berkas juga akan dihapus.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/arsip/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) {
        showToast('Arsip dokumen berhasil dihapus permanen', 'success');
        fetchArchives();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal menghapus arsip', 'error');
      }
    } catch (e) {
      showToast('Kesalahan server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadArchiveFile = async (id: number) => {
    try {
      const res = await fetch(`/api/arsip/${id}/download`, { method: 'POST', headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        // Open file in new tab or trigger browser download
        const a = document.createElement('a');
        a.href = data.url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Berkas berhasil diunduh, unduhan dicatat di Log.', 'success');
        fetchArchives();
      }
    } catch (e) {
      showToast('Gagal mengunduh dokumen', 'error');
    }
  };

  const toggleFavoriteArchive = async (id: number) => {
    try {
      const res = await fetch(`/api/arsip/${id}/favorite`, { method: 'POST', headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        showToast(data.favorited ? 'Ditambahkan ke dokumen favorit Anda' : 'Dihapus dari dokumen favorit', 'success');
        fetchArchives();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadVersions = async (id: number) => {
    try {
      const res = await fetch(`/api/arsip/${id}/versi`, { headers: getHeaders() });
      if (res.ok) {
        setViewHistoryModal({ open: true, archiveId: id, versions: await res.json() });
      }
    } catch (e) {
      showToast('Gagal memuat riwayat versi berkas', 'error');
    }
  };

  // User CRUD
  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userModal) return;
    setLoading(true);

    const isEdit = !!userModal.editId;
    const url = isEdit ? `/api/users/${userModal.editId}` : '/api/users';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(userModal.data)
      });

      if (res.ok) {
        showToast(isEdit ? 'Profil pengguna berhasil diperbarui' : 'Pengguna baru berhasil ditambahkan', 'success');
        setUserModal(null);
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal menyimpan pengguna', 'error');
      }
    } catch (e) {
      showToast('Gagal menghubungi sistem', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun pengguna ini?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) {
        showToast('Pengguna berhasil dihapus', 'success');
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal menghapus pengguna', 'error');
      }
    } catch (e) {
      showToast('Kesalahan server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Settings action
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/pengaturan', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setDarkMode(data.mode_gelap);
        showToast('Pengaturan sistem berhasil diperbarui', 'success');
      } else {
        showToast('Gagal memperbarui pengaturan', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Database Backup Actions
  const triggerBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backup/generate', { method: 'POST', headers: getHeaders() });
      if (res.ok) {
        showToast('Cadangan basis data baru berhasil dibuat!', 'success');
        loadAllData();
      }
    } catch (e) {
      showToast('Gagal mencadangkan database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSQLRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/backup/restore', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ sql_content: reader.result as string })
        });
        if (res.ok) {
          showToast('Basis data MySQL berhasil dipulihkan secara penuh!', 'success');
          loadAllData();
        } else {
          const err = await res.json();
          showToast(err.error || 'Gagal memulihkan SQL', 'error');
        }
      } catch (err) {
        showToast('Gagal memproses berkas SQL', 'error');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Print utility
  const handlePrint = () => {
    window.print();
  };

  // Filter Trigger
  useEffect(() => {
    if (user) {
      fetchArchives();
    }
  }, [searchQuery, filterCategory, filterType, filterStatus, filterDateStart, filterDateEnd, favoritesOnly]);

  // LOGIN PAGE
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-md">
          {/* Header */}
          <div className="bg-slate-950 p-6 text-center border-b border-slate-800">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FileText className="w-9 h-9 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-black text-white tracking-wide">SARDIG V1.0</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">TK JOROK TIRAM</p>
            <p className="text-[10px] text-slate-500 italic mt-0.5">Sistem Pengarsipan Dokumen Digital Sekolah</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {authError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700 font-bold flex items-center">
                  <X className="w-4 h-4 mr-2 flex-shrink-0" />
                  {authError}
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Pengguna (Username)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Contoh: admin"
                    className="w-full pl-3 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Kata Sandi (Password)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* CAPTCHA sederhana */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Validasi Keamanan (CAPTCHA)</span>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-black">Pertanyaan Matematika</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-200 text-slate-800 font-black text-sm px-4 py-1.5 rounded border border-slate-300 select-none tracking-widest italic">
                    Berapa 3 + 4?
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Jawaban"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {captchaError && (
                  <p className="text-[10px] text-red-600 font-bold mt-1">{captchaError}</p>
                )}
              </div>

              {/* Remember and Forgot password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 mr-2"
                  />
                  Ingat Login
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 hover:underline font-bold"
                >
                  Lupa Sandi?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center"
              >
                {loading ? 'Menghubungkan Sesi...' : 'Masuk ke Sistem'}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">XAMPP Apache MySQL • PHP Native Simulated</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans text-slate-800 bg-slate-100 ${darkMode ? 'dark text-slate-100 bg-slate-950' : ''}`}>
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-4 right-4 z-50 flex items-center bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-lg shadow-2xl border-l-4 border-blue-500 transition-all animate-bounce">
          <Check className="w-4 h-4 mr-2 text-blue-400" />
          {toast.message}
        </div>
      )}

      {/* SIDEBAR - Slate-900 Density theme layout */}
      <aside className="w-60 bg-slate-950 flex-shrink-0 flex flex-col text-slate-300 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20 flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white font-black text-sm tracking-tight truncate">SARDIG V1.0</span>
            <span className="text-slate-400 text-[9px] uppercase font-bold leading-none tracking-widest truncate">TK JOROK TIRAM</span>
          </div>
        </div>

        {/* Navigation Menus */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Menu Utama</div>
          
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center px-3 py-2 rounded-md text-xs font-bold transition-all ${
              activeMenu === 'dashboard'
                ? 'text-white bg-blue-600/15 border-l-4 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4 mr-3 text-blue-400" />
            <span>Dasbor Ringkasan</span>
          </button>

          <button
            onClick={() => setActiveMenu('arsip')}
            className={`w-full flex items-center px-3 py-2 rounded-md text-xs font-bold transition-all ${
              activeMenu === 'arsip'
                ? 'text-white bg-blue-600/15 border-l-4 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Folder className="w-4 h-4 mr-3 text-blue-400" />
            <span>Master Arsip Dokumen</span>
          </button>

          <button
            onClick={() => setActiveMenu('kategori')}
            className={`w-full flex items-center px-3 py-2 rounded-md text-xs font-bold transition-all ${
              activeMenu === 'kategori'
                ? 'text-white bg-blue-600/15 border-l-4 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 mr-3 text-blue-400" />
            <span>Kategori Master</span>
          </button>

          <button
            onClick={() => setActiveMenu('reports')}
            className={`w-full flex items-center px-3 py-2 rounded-md text-xs font-bold transition-all ${
              activeMenu === 'reports'
                ? 'text-white bg-blue-600/15 border-l-4 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 mr-3 text-blue-400" />
            <span>Laporan Cetak & Excel</span>
          </button>

          <div className="pt-4 px-3 py-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Pengaturan & Kontrol</div>
          
          <button
            onClick={() => setActiveMenu('users')}
            className={`w-full flex items-center px-3 py-2 rounded-md text-xs font-bold transition-all ${
              activeMenu === 'users'
                ? 'text-white bg-blue-600/15 border-l-4 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4 mr-3 text-blue-400" />
            <span>Pengguna & Peran</span>
          </button>

          <button
            onClick={() => setActiveMenu('logs')}
            className={`w-full flex items-center px-3 py-2 rounded-md text-xs font-bold transition-all ${
              activeMenu === 'logs'
                ? 'text-white bg-blue-600/15 border-l-4 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 mr-3 text-blue-400" />
            <span>Log Aktivitas Sistem</span>
          </button>

          <button
            onClick={() => setActiveMenu('backup')}
            className={`w-full flex items-center px-3 py-2 rounded-md text-xs font-bold transition-all ${
              activeMenu === 'backup'
                ? 'text-white bg-blue-600/15 border-l-4 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4 mr-3 text-blue-400" />
            <span>Cadangkan & Pulihkan</span>
          </button>

          <button
            onClick={() => setActiveMenu('pengaturan')}
            className={`w-full flex items-center px-3 py-2 rounded-md text-xs font-bold transition-all ${
              activeMenu === 'pengaturan'
                ? 'text-white bg-blue-600/15 border-l-4 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 mr-3 text-blue-400" />
            <span>Konfigurasi Sekolah</span>
          </button>
        </nav>

        {/* User Card footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col space-y-2">
          <div className="flex items-center space-x-3">
            <img src={user.foto} alt="user" className="w-9 h-9 rounded-full object-cover border-2 border-slate-700 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.nama_depan} {user.nama_belakang}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest font-bold">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 py-1.5 px-3 bg-red-950/40 text-red-400 rounded hover:bg-red-900/40 text-xs font-bold flex items-center justify-center border border-red-900/50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT SPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden relative">
        {/* Top Header navbar with High Density elements */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-black text-slate-800 tracking-tight capitalize">
              {activeMenu === 'dashboard' && 'Dasbor Ringkasan Real-Time'}
              {activeMenu === 'arsip' && 'Manajemen Master Arsip Sekolah'}
              {activeMenu === 'kategori' && 'Daftar Kategori Utama Dokumen'}
              {activeMenu === 'users' && 'Daftar Pengguna & Otoritas Akses'}
              {activeMenu === 'logs' && 'Log Audit & Aktivitas Pengguna'}
              {activeMenu === 'reports' && 'Laporan Filter, Print & Ekspor'}
              {activeMenu === 'backup' && 'Cadangkan & Pulihkan Basis Data SQL'}
              {activeMenu === 'pengaturan' && 'Konfigurasi Profil TK JOROK TIRAM'}
            </h2>
            <div className="hidden sm:flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black rounded uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 inline-block animate-ping"></span>
              XAMPP SERVER ONLINE
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick action: info text */}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">TAHUN AJARAN</span>
              <span className="text-xs font-black text-blue-600">{settings.tahun_ajaran}</span>
            </div>

            <div className="h-8 w-[1px] bg-slate-200"></div>

            {/* Quick Statistics Trigger button */}
            <button
              onClick={() => {
                loadAllData();
                showToast('Data sistem disinkronkan langsung dari JSON DB!', 'success');
              }}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
              title="Sinkronkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* INNER CONTENT GRID */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* DASHBOARD VIEW */}
          {activeMenu === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* KPIs Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Arsip Dokumen</p>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalArsip}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-[9px] font-bold text-green-600">
                    <span className="px-1.5 py-0.5 bg-green-50 rounded">+{stats.arsipHariIni} hari ini</span>
                    <span className="ml-2 text-slate-400">+{stats.arsipBulanIni} bulan ini</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Kategori</p>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalKategori}</h3>
                    </div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <Folder className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Terbagi dalam rincian struktural
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Pengguna Aktif</p>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalPengguna}</h3>
                    </div>
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-[9px] font-bold text-amber-600">
                    Administrator, Operator, Kepsek
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Unduhan</p>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalUnduhan}</h3>
                    </div>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <Download className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-[9px] font-bold text-slate-400 italic">
                    Diunduh & disimpan oleh staf sekolah
                  </div>
                </div>
              </div>

              {/* Graphic Chart representation and tables */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Monthly Archives Distribution Visualizer */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                      <Activity className="w-4 h-4 mr-2 text-blue-500" />
                      Statistik Unggahan Bulanan (Tahun Ajaran {settings.tahun_ajaran})
                    </h4>
                    <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">MySQL Real-Time</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    {/* Visual graph layout */}
                    <div className="flex items-end justify-between h-36 space-x-2 pt-4">
                      {stats.arsipPerBulan.map((b: any, index: number) => {
                        // Calculate simulated height max 100%
                        const maxHeight = Math.max(...stats.arsipPerBulan.map((x: any) => x.count)) || 1;
                        const heightPct = Math.min(100, Math.max(10, (b.count / maxHeight) * 100));
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center group">
                            <span className="text-[9px] font-black text-blue-600 opacity-0 group-hover:opacity-100 mb-1 transition-opacity">
                              {b.count}
                            </span>
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-sm transition-all duration-300 min-h-[4px]"
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      {stats.arsipPerBulan.map((b: any, i: number) => (
                        <span key={i} className="flex-1 text-center">{b.name}</span>
                      ))}
                    </div>
                  </div>

                  {/* High Density Table: Recent archives */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Daftar Arsip Terbaru diunggah</h4>
                      <button onClick={() => setActiveMenu('arsip')} className="text-[9px] font-black text-blue-600 hover:underline uppercase">Buka Semua</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[9px] text-slate-400 uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="pb-1.5">Kode / Judul</th>
                            <th className="pb-1.5">Jenis</th>
                            <th className="pb-1.5">Tanggal</th>
                            <th className="pb-1.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {stats.arsipTerbaru.map((a: any) => (
                            <tr key={a.id} className="hover:bg-slate-100">
                              <td className="py-2">
                                <p className="font-semibold text-slate-800 truncate max-w-[200px]">{a.judul_dokumen}</p>
                                <p className="text-[9px] text-slate-400 font-bold">{a.nomor_arsip}</p>
                              </td>
                              <td className="py-2"><span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">{a.jenis_dokumen}</span></td>
                              <td className="py-2 text-slate-500">{a.tanggal_dokumen}</td>
                              <td className="py-2">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                  a.status_arsip === 'Aktif' ? 'bg-green-100 text-green-700' :
                                  a.status_arsip === 'Dipinjam' ? 'bg-blue-100 text-blue-700' :
                                  a.status_arsip === 'Arsip' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {a.status_arsip}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right side activity feed and categories summary */}
                <div className="space-y-6">
                  {/* Category counts widget */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center">
                      <Folder className="w-4 h-4 mr-2 text-purple-500" />
                      Arsip per Kategori Dokumen
                    </h4>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto">
                      {stats.arsipPerKategori.map((k: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 truncate mr-3 flex items-center font-medium">
                            <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: k.color || '#3b82f6' }}></span>
                            {k.name}
                          </span>
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            {k.count} dokumen
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity stream log */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="p-4 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-green-500" />
                        Log Aktivitas Sesi
                      </h4>
                    </div>
                    <div className="p-4 space-y-4 max-h-[280px] overflow-y-auto">
                      {stats.aktivitasTerakhir.map((l: any) => (
                        <div key={l.id} className="flex items-start space-x-3 text-xs">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-600">
                            {l.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-800">
                              <span className="font-bold">{l.username}</span> melakukan <span className="font-semibold text-blue-600">{l.aksi}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{l.rincian}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ARSIP MASTER CRUD VIEW */}
          {activeMenu === 'arsip' && (
            <div className="space-y-4">
              {/* Actions Header Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                {/* Search query box */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan judul, nomor arsip, kata kunci..."
                    className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                    ))}
                  </select>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white"
                  >
                    <option value="">Semua Format</option>
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                    <option value="PPTX">PPTX</option>
                    <option value="JPG">JPG/PNG</option>
                    <option value="ZIP">ZIP/RAR</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white"
                  >
                    <option value="">Semua Status</option>
                    <option value="Aktif">Active (Aktif)</option>
                    <option value="Dipinjam">Borrowed (Dipinjam)</option>
                    <option value="Arsip">Archived (Arsip)</option>
                    <option value="Kadaluarsa">Expired (Kadaluarsa)</option>
                  </select>

                  <button
                    onClick={() => setFavoritesOnly(!favoritesOnly)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center ${
                      favoritesOnly ? 'bg-yellow-500 border-yellow-500 text-white' : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 mr-1" />
                    Favorit
                  </button>

                  <button
                    onClick={() => setArchiveModal({ open: true, data: { status_arsip: 'Aktif', jenis_dokumen: 'PDF' } })}
                    className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Unggah Arsip Baru
                  </button>
                </div>
              </div>

              {/* Status Toggles Bar */}
              <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider text-[10px]">Filter Status:</span>
                {[
                  { label: 'Semua Status', value: '', colorClass: 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100', activeClass: 'bg-slate-900 text-white border-slate-900' },
                  { label: 'Active (Aktif)', value: 'Aktif', colorClass: 'border-green-200 text-green-700 bg-green-50/50 hover:bg-green-50', activeClass: 'bg-green-600 text-white border-green-600' },
                  { label: 'Borrowed (Dipinjam)', value: 'Dipinjam', colorClass: 'border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50', activeClass: 'bg-blue-600 text-white border-blue-600' },
                  { label: 'Archived (Arsip)', value: 'Arsip', colorClass: 'border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-50', activeClass: 'bg-amber-600 text-white border-amber-600' },
                  { label: 'Expired (Kadaluarsa)', value: 'Kadaluarsa', colorClass: 'border-red-200 text-red-700 bg-red-50/50 hover:bg-red-50', activeClass: 'bg-red-600 text-white border-red-600' }
                ].map(tab => {
                  const isActive = filterStatus === tab.value || 
                    (tab.value === 'Aktif' && (filterStatus === 'Active' || filterStatus === 'aktif')) ||
                    (tab.value === 'Dipinjam' && (filterStatus === 'Borrowed' || filterStatus === 'dipinjam')) ||
                    (tab.value === 'Arsip' && (filterStatus === 'Archived' || filterStatus === 'arsip')) ||
                    (tab.value === 'Kadaluarsa' && (filterStatus === 'Expired' || filterStatus === 'kadaluarsa'));
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setFilterStatus(tab.value)}
                      className={`px-3 py-1 text-xs font-bold border rounded-full transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                        isActive ? tab.activeClass : tab.colorClass
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : (
                        tab.value === 'Aktif' ? 'bg-green-500' :
                        tab.value === 'Dipinjam' ? 'bg-blue-500' :
                        tab.value === 'Arsip' ? 'bg-amber-500' :
                        tab.value === 'Kadaluarsa' ? 'bg-red-500' : 'bg-slate-400'
                      )}`}></span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Data Grid table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3 text-[10px]">Identitas Dokumen</th>
                      <th className="px-4 py-3 text-[10px]">Kategori</th>
                      <th className="px-4 py-3 text-[10px]">Status</th>
                      <th className="px-4 py-3 text-[10px]">Kunci Surat</th>
                      <th className="px-4 py-3 text-[10px] text-center">Riwayat</th>
                      <th className="px-4 py-3 text-[10px] text-right">Opsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {archives.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-bold">
                          Tidak ditemukan arsip dokumen digital yang cocok dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      archives.map(a => {
                        const kat = categories.find(c => c.id === a.id_kategori);
                        return (
                          <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-start space-x-2.5">
                                <span className={`px-2 py-1 rounded font-black text-[10px] select-none ${
                                  a.jenis_dokumen === 'PDF' ? 'bg-red-100 text-red-700 border border-red-200' :
                                  a.jenis_dokumen === 'XLSX' ? 'bg-green-100 text-green-700 border border-green-200' :
                                  a.jenis_dokumen === 'DOCX' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                  'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                  {a.jenis_dokumen}
                                </span>
                                <div>
                                  <h4 className="font-bold text-slate-800 text-sm hover:underline cursor-pointer" onClick={() => setPreviewArchive(a)}>
                                    {a.judul_dokumen}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{a.nomor_arsip} • {a.berkas_ukuran}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border" style={{ color: kat?.label_warna, borderColor: kat?.label_warna, backgroundColor: `${kat?.label_warna}10` }}>
                                {kat?.nama_kategori || 'Tanpa Kategori'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                a.status_arsip === 'Aktif' || a.status_arsip === 'Active' ? 'bg-green-100 text-green-700' :
                                a.status_arsip === 'Dipinjam' || a.status_arsip === 'Borrowed' ? 'bg-blue-100 text-blue-700' :
                                a.status_arsip === 'Arsip' || a.status_arsip === 'Archived' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {a.status_arsip === 'Aktif' || a.status_arsip === 'Active' ? 'Active' :
                                 a.status_arsip === 'Dipinjam' || a.status_arsip === 'Borrowed' ? 'Borrowed' :
                                 a.status_arsip === 'Arsip' || a.status_arsip === 'Archived' ? 'Archived' :
                                 'Expired'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              <p className="text-[10px] font-bold">No Surat: {a.nomor_surat}</p>
                              <p className="text-[10px]">Tgl Doc: {a.tanggal_dokumen}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => loadVersions(a.id)}
                                className="px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 text-[10px] font-bold"
                              >
                                v{a.version} Riwayat
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <button onClick={() => toggleFavoriteArchive(a.id)} className="p-1.5 text-slate-400 hover:text-yellow-500" title="Favorit">
                                  <Star className="w-4 h-4" />
                                </button>
                                <button onClick={() => setPreviewArchive(a)} className="p-1.5 text-slate-400 hover:text-blue-600" title="Pratinjau">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => downloadArchiveFile(a.id)} className="p-1.5 text-slate-400 hover:text-green-600" title="Unduh">
                                  <Download className="w-4 h-4" />
                                </button>
                                  <>
                                    <button onClick={() => setArchiveModal({ open: true, editId: a.id, data: a })} className="p-1.5 text-slate-400 hover:text-amber-600" title="Ubah">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteArchive(a.id)} className="p-1.5 text-slate-400 hover:text-red-600" title="Hapus">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* KATEGORI VIEW */}
          {activeMenu === 'kategori' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Kategori Arsip Sekolah</h3>
                <button
                  onClick={() => setCategoryModal({ open: true, data: { label_warna: '#3b82f6', ikon: 'FileText' } })}
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-all flex items-center shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Tambah Kategori
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase text-white px-2.5 py-1 rounded" style={{ backgroundColor: c.label_warna }}>
                          {c.kode_kategori}
                        </span>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: `${c.label_warna}20`, color: c.label_warna }}>
                          <Folder className="w-4 h-4" />
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">{c.nama_kategori}</h4>
                      <p className="text-xs text-slate-500 mb-4">{c.deskripsi || 'Tidak ada deskripsi untuk kategori ini.'}</p>
                    </div>

                      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => setCategoryModal({ open: true, editId: c.id, data: c })}
                          className="px-2 py-1 text-[10px] font-bold text-amber-600 hover:bg-amber-50 rounded border border-amber-200"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => deleteCategory(c.id)}
                          className="px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded border border-red-200"
                        >
                          Hapus
                        </button>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORTS PRINT & EXCEL EXPORT VIEW */}
          {activeMenu === 'reports' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mulai Tanggal</label>
                    <input
                      type="date"
                      value={filterDateStart}
                      onChange={(e) => setFilterDateStart(e.target.value)}
                      className="border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Hingga Tanggal</label>
                    <input
                      type="date"
                      value={filterDateEnd}
                      onChange={(e) => setFilterDateEnd(e.target.value)}
                      className="border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-all flex items-center shadow-sm"
                  >
                    <Printer className="w-4 h-4 mr-1.5" />
                    Cetak Laporan PDF
                  </button>
                  <button
                    onClick={() => {
                      showToast('Mengunduh Laporan Excel (Format XLSX) sedang disimulasikan!', 'success');
                    }}
                    className="px-4 py-1.5 bg-green-600 text-white font-bold text-xs rounded-lg hover:bg-green-700 transition-all flex items-center shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                    Ekspor Excel
                  </button>
                </div>
              </div>

              {/* Printable Area Card */}
              <div id="print-area" className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-slate-800">
                <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                  <h1 className="text-xl font-black text-slate-900">{settings.nama_sekolah}</h1>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">SARDIG - LAPORAN REKAPITULASI ARSIP DIGITAL SEKOLAH</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{settings.alamat}</p>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-slate-600 uppercase font-bold text-[10px]">
                      <th className="py-2.5">No Arsip</th>
                      <th className="py-2.5">Judul Dokumen</th>
                      <th className="py-2.5">Format</th>
                      <th className="py-2.5">Tanggal</th>
                      <th className="py-2.5">Pengunggah</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {archives.map(a => (
                      <tr key={a.id}>
                        <td className="py-2 text-slate-500">{a.nomor_arsip}</td>
                        <td className="py-2 font-bold text-slate-800">{a.judul_dokumen}</td>
                        <td className="py-2">{a.jenis_dokumen}</td>
                        <td className="py-2">{a.tanggal_dokumen}</td>
                        <td className="py-2">{a.pengunggah}</td>
                        <td className="py-2">{a.status_arsip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer signatures */}
                <div className="mt-12 flex justify-end text-xs">
                  <div className="text-center">
                    <p>Sumbawa, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="font-bold mt-1">Kepala Sekolah {settings.nama_sekolah}</p>
                    <div className="h-16"></div>
                    <p className="font-black underline">{settings.kepala_sekolah}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BACKUP & RESTORE VIEW */}
          {activeMenu === 'backup' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-500" />
                  Pencadangan & Pemulihan Database (XAMPP MySQL / MariaDB)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gunakan menu ini untuk mengunduh skrip dump database lengkap (SQL format) atau memulihkan basis data secara otomatis dari file cadangan yang telah diunduh sebelumnya. Hal ini memastikan data arsip TK JOROK TIRAM selalu aman.
                </p>

                <div className="flex flex-wrap gap-3 pt-3">
                  <button
                    onClick={triggerBackup}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all flex items-center shadow-md shadow-blue-500/10"
                  >
                    <Database className="w-4 h-4 mr-1.5" />
                    Buat Backup Otomatis
                  </button>
                  <a
                    href="/api/backup/export"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center shadow-md"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Unduh File SQL Dump
                  </a>

                  <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition-all flex items-center shadow-md cursor-pointer">
                    <Upload className="w-4 h-4 mr-1.5" />
                    Pulihkan Basis Data (.SQL)
                    <input
                      type="file"
                      accept=".sql"
                      onChange={handleSQLRestore}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Backup lists */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Riwayat File Cadangan Terbuka</h4>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2">Nama Berkas SQL</th>
                      <th className="px-4 py-2">Tanggal Cadangan</th>
                      <th className="px-4 py-2">Ukuran Berkas</th>
                      <th className="px-4 py-2">Operator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-700">backup_sardig_tk_jorok_tiram.sql</td>
                      <td className="px-4 py-3 text-slate-500">2026-07-02 08:30:12</td>
                      <td className="px-4 py-3">54 KB</td>
                      <td className="px-4 py-3 font-bold text-blue-600">admin</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-700">backup_sardig_20260630_1000.sql</td>
                      <td className="px-4 py-3 text-slate-500">2026-06-30 10:00:00</td>
                      <td className="px-4 py-3">45 KB</td>
                      <td className="px-4 py-3 font-bold text-blue-600">admin</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USER ROLES MANAGEMENT VIEW */}
          {activeMenu === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Daftar Pengguna Sistem SARDIG</h3>
                <button
                  onClick={() => setUserModal({ open: true, data: { status: 'Aktif', role: 'Operator' } })}
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-all flex items-center shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Tambah Pengguna
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usersList.map(u => (
                  <div key={u.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img src={u.foto} alt="avatar" className="w-11 h-11 rounded-full object-cover border-2 border-slate-200" />
                          <div>
                            <h4 className="text-sm font-black text-slate-800">{u.nama_depan} {u.nama_belakang}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">@{u.username}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          u.role === 'Administrator' ? 'bg-red-100 text-red-700 border border-red-200' :
                          u.role === 'Operator' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {u.role}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 mb-4 border-t border-slate-50 pt-3">
                        <p className="flex items-center"><Mail className="w-3.5 h-3.5 mr-2" /> {u.email}</p>
                        <p className="flex items-center"><Phone className="w-3.5 h-3.5 mr-2" /> {u.no_hp || '-'}</p>
                        <p className="flex items-center">
                          <Check className="w-3.5 h-3.5 mr-2" /> Status Akun: 
                          <span className={`ml-1.5 font-bold ${u.status === 'Aktif' ? 'text-green-600' : 'text-red-600'}`}>{u.status}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setUserModal({ open: true, editId: u.id, data: u })}
                        className="px-2 py-1 text-[10px] font-bold text-amber-600 hover:bg-amber-50 rounded border border-amber-200"
                      >
                        Ubah
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded border border-red-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOGS AUDIT VIEW */}
          {activeMenu === 'logs' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-blue-500" />
                  Audit Trail & Log Aktivitas Pengguna SARDIG
                </h4>
                <button
                  onClick={fetchLogs}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded text-[10px] font-bold"
                >
                  Segarkan Log
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Waktu</th>
                      <th className="px-4 py-2.5">Nama Pengguna</th>
                      <th className="px-4 py-2.5">Kategori Aksi</th>
                      <th className="px-4 py-2.5">Detail Rincian Aktivitas</th>
                      <th className="px-4 py-2.5">Alamat IP</th>
                      <th className="px-4 py-2.5">Sistem Web Browser</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logsList.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500 font-medium">
                          {new Date(l.waktu).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">{l.username}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            l.aksi === 'Login' ? 'bg-green-100 text-green-700' :
                            l.aksi === 'Logout' ? 'bg-slate-100 text-slate-700' :
                            l.aksi === 'Hapus Arsip' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {l.aksi}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{l.rincian}</td>
                        <td className="px-4 py-3 font-bold text-slate-500">{l.ip_address}</td>
                        <td className="px-4 py-3 text-[10px] text-slate-400 truncate max-w-[150px]" title={l.browser}>{l.browser}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PENGATURAN SYSTEM CONFIG VIEW */}
          {activeMenu === 'pengaturan' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-500" />
                Identitas Sekolah & Pengaturan Aplikasi
              </h3>

              <form onSubmit={saveSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Sekolah</label>
                    <input
                      type="text"
                      required
                      value={settings.nama_sekolah}
                      onChange={(e) => setSettings({ ...settings, nama_sekolah: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tahun Ajaran Aktif</label>
                    <input
                      type="text"
                      required
                      value={settings.tahun_ajaran}
                      onChange={(e) => setSettings({ ...settings, tahun_ajaran: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alamat Sekolah Lengkap</label>
                  <textarea
                    rows={2}
                    value={settings.alamat}
                    onChange={(e) => setSettings({ ...settings, alamat: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Surel Resmi (E-mail)</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor Telepon / HP</label>
                    <input
                      type="text"
                      value={settings.no_hp}
                      onChange={(e) => setSettings({ ...settings, no_hp: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Situs Web Sekolah (URL)</label>
                    <input
                      type="text"
                      value={settings.website}
                      onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kepala Sekolah Aktif</label>
                    <input
                      type="text"
                      value={settings.kepala_sekolah}
                      onChange={(e) => setSettings({ ...settings, kepala_sekolah: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center text-slate-600 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => {
                          setDarkMode(e.target.checked);
                          setSettings({ ...settings, mode_gelap: e.target.checked });
                        }}
                        className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 mr-2"
                      />
                      Aktifkan Mode Gelap
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Outer footer block matching 'High Density' theme */}
        <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <span className="font-bold uppercase tracking-wider">
              IP ADDRESS: <span className="text-slate-600">127.0.0.1 (LOCAL)</span>
            </span>
            <span className="font-bold">SARDIG TK JOROK TIRAM v1.0.4</span>
          </div>
          <div className="flex items-center space-x-4 font-bold uppercase">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span> APACHE: OK
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span> MYSQL: CONNECTED
            </span>
          </div>
        </footer>
      </main>

      {/* ==========================================
          MODALS & PRATINJAU FLOATING SHELLS
         ========================================== */}

      {/* CATEGORY DIALOG MODAL */}
      {categoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                {categoryModal.editId ? 'Ubah Kategori Master' : 'Tambah Kategori Master Baru'}
              </h3>
              <button onClick={() => setCategoryModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kode Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: ADM"
                  value={categoryModal.data.kode_kategori || ''}
                  onChange={(e) => setCategoryModal({ ...categoryModal, data: { ...categoryModal.data, kode_kategori: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Administrasi Umum"
                  value={categoryModal.data.nama_kategori || ''}
                  onChange={(e) => setCategoryModal({ ...categoryModal, data: { ...categoryModal.data, nama_kategori: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deskripsi Lengkap</label>
                <textarea
                  rows={3}
                  placeholder="Tulis penjelasan singkat mengenai kategori ini..."
                  value={categoryModal.data.deskripsi || ''}
                  onChange={(e) => setCategoryModal({ ...categoryModal, data: { ...categoryModal.data, deskripsi: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Warna Penanda Label</label>
                <input
                  type="color"
                  value={categoryModal.data.label_warna || '#3b82f6'}
                  onChange={(e) => setCategoryModal({ ...categoryModal, data: { ...categoryModal.data, label_warna: e.target.value } })}
                  className="w-full h-8 cursor-pointer rounded-lg border focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setCategoryModal(null)}
                  className="px-4 py-2 text-slate-600 font-bold bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-bold bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/10"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARCHIVE UPLOAD & EDIT DIALOG */}
      {archiveModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl border border-slate-100 my-8">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                {archiveModal.editId ? 'Perbarui Arsip Dokumen & Catat Versi' : 'Unggah Dokumen Baru'}
              </h3>
              <button onClick={() => setArchiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveArchive} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Judul Dokumen</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: RPP TK Ganjil Tema Hewan"
                    value={archiveModal.data.judul_dokumen || ''}
                    onChange={(e) => setArchiveModal({ ...archiveModal, data: { ...archiveModal.data, judul_dokumen: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kategori Dokumen</label>
                  <select
                    required
                    value={archiveModal.data.id_kategori || ''}
                    onChange={(e) => setArchiveModal({ ...archiveModal, data: { ...archiveModal.data, id_kategori: parseInt(e.target.value) } })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">Pilih Kategori...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor Surat (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 021/SK/VI/2026"
                    value={archiveModal.data.nomor_surat || ''}
                    onChange={(e) => setArchiveModal({ ...archiveModal, data: { ...archiveModal.data, nomor_surat: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Asal Surat</label>
                  <input
                    type="text"
                    placeholder="Contoh: Guru Kelas B"
                    value={archiveModal.data.asal_surat || ''}
                    onChange={(e) => setArchiveModal({ ...archiveModal, data: { ...archiveModal.data, asal_surat: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tujuan Surat</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kepala Sekolah"
                    value={archiveModal.data.tujuan_surat || ''}
                    onChange={(e) => setArchiveModal({ ...archiveModal, data: { ...archiveModal.data, tujuan_surat: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal Dokumen</label>
                  <input
                    type="date"
                    required
                    value={archiveModal.data.tanggal_dokumen || ''}
                    onChange={(e) => setArchiveModal({ ...archiveModal, data: { ...archiveModal.data, tanggal_dokumen: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Arsip</label>
                  <select
                    value={archiveModal.data.status_arsip || 'Aktif'}
                    onChange={(e) => setArchiveModal({ ...archiveModal, data: { ...archiveModal.data, status_arsip: e.target.value as any } })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Dipinjam">Dipinjam</option>
                    <option value="Arsip">Arsip</option>
                    <option value="Kadaluarsa">Kadaluarsa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lokasi Penyimpanan Fisik</label>
                  <input
                    type="text"
                    placeholder="Contoh: Lemari A Rak ke-2"
                    value={archiveModal.data.lokasi_penyimpanan || ''}
                    onChange={(e) => setArchiveModal({ ...archiveModal, data: { ...archiveModal.data, lokasi_penyimpanan: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kata Kunci Pencarian</label>
                  <input
                    type="text"
                    placeholder="Contoh: kurikulum, RPP, ganjil"
                    value={archiveModal.data.kata_kunci || ''}
                    onChange={(e) => setArchiveModal({ ...archiveModal, data: { ...archiveModal.data, kata_kunci: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deskripsi / Penjelasan Singkat</label>
                  <input
                    type="text"
                    placeholder="Penjelasan ringkas isi berkas..."
                    value={archiveModal.data.deskripsi || ''}
                    onChange={(e) => setArchiveModal({ ...archiveModal, data: { ...archiveModal.data, deskripsi: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Version Reason (Only visible on Edit) */}
              {archiveModal.editId && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">Alasan Perubahan Berkas (Keterangan Riwayat Versi)</label>
                  <input
                    type="text"
                    required
                    placeholder="Mengapa Anda mengunggah versi baru ini? Contoh: Koreksi tanda tangan Kepala Sekolah."
                    value={archiveModal.data.reason_versi || ''}
                    onChange={(e) => setArchiveModal({ ...archiveModal, data: { ...archiveModal.data, reason_versi: e.target.value } })}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white"
                  />
                </div>
              )}

              {/* Drag and Drop File Selection layout */}
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center transition-all bg-slate-50">
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-slate-700 font-bold mb-1">Pilih berkas untuk diunggah (Maks 20 MB)</p>
                <p className="text-[10px] text-slate-400 mb-3">Mendukung format PDF, DOCX, XLSX, PPTX, JPG, PNG, ZIP</p>
                
                <label className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer font-bold transition-all inline-block">
                  Cari File Dokumen
                  <input
                    type="file"
                    onChange={handleFileSelection}
                    className="hidden"
                  />
                </label>

                {archiveModal.data.file_name && (
                  <div className="mt-3 bg-blue-50 text-blue-800 font-bold p-2.5 rounded-lg border border-blue-200 inline-flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{archiveModal.data.file_name} ({archiveModal.data.file_size})</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setArchiveModal(null)}
                  className="px-4 py-2 text-slate-600 font-bold bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-bold bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md"
                >
                  {archiveModal.editId ? 'Perbarui & Catat Versi' : 'Simpan & Unggah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED DOCUMENT PREVIEW DIALOG MODAL */}
      {previewArchive && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl border border-slate-100 overflow-hidden flex flex-col md:flex-row shadow-2xl">
            
            {/* Left side details */}
            <div className="p-6 md:w-1/2 space-y-4">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-bold rounded uppercase">
                  No Arsip: {previewArchive.nomor_arsip}
                </span>
                <button onClick={() => setPreviewArchive(null)} className="md:hidden text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-lg font-black text-slate-950 leading-tight">{previewArchive.judul_dokumen}</h3>
              <p className="text-xs text-slate-500">{previewArchive.deskripsi || 'Tidak ada deskripsi berkas.'}</p>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3">
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider">KODE ARSIP</span>
                  <span className="font-bold text-slate-800">{previewArchive.kode_arsip}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider">LOKASI LENGKAP</span>
                  <span className="font-bold text-slate-800">{previewArchive.lokasi_penyimpanan}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider">TANGGAL DOKUMEN</span>
                  <span className="font-bold text-slate-800">{previewArchive.tanggal_dokumen}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider">TANGGAL UNGGAH</span>
                  <span className="font-bold text-slate-800">{new Date(previewArchive.tanggal_unggah).toLocaleDateString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider">PENGUNGGAH DOKUMEN</span>
                  <span className="font-bold text-blue-600">@{previewArchive.pengunggah}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider">VERSI AKTIF</span>
                  <span className="font-bold text-slate-800">Versi {previewArchive.version}</span>
                </div>
              </div>

              {/* Barcode / QR Visual Representation simulator */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Digital QR Code & Barcode</p>
                  <p className="text-[9px] text-slate-400">Scan untuk otentikasi arsip dinas TK JOROK TIRAM</p>
                </div>
                <div className="bg-white p-1 rounded-lg border border-slate-200 select-none flex space-x-1 items-center">
                  {/* Mimic a clean QR code matrix block */}
                  <div className="w-12 h-12 bg-slate-900 flex flex-wrap p-0.5 justify-between">
                    <div className="w-3.5 h-3.5 bg-white m-0.5 border-2 border-black rounded-sm"></div>
                    <div className="w-3.5 h-3.5 bg-white m-0.5 border-2 border-black rounded-sm"></div>
                    <div className="w-3.5 h-3.5 bg-white m-0.5 border-2 border-black rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-white m-0.5"></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex space-x-2">
                <button
                  onClick={() => downloadArchiveFile(previewArchive.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center justify-center text-xs"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Unduh Dokumen Asli
                </button>
                <button
                  onClick={() => setPreviewArchive(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-all text-xs"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>

            {/* Right side live simulated PDF/Image preview */}
            <div className="bg-slate-900 md:w-1/2 min-h-[300px] flex flex-col justify-center items-center p-6 text-center text-slate-400">
              {previewArchive.jenis_dokumen === 'PDF' ? (
                <div className="space-y-4 w-full h-full flex flex-col justify-between items-center">
                  <div className="w-full bg-slate-800 p-3.5 rounded-lg text-slate-300 font-bold text-xs flex items-center justify-between">
                    <span>{previewArchive.berkas_nama_asli}</span>
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded uppercase">Simulasi PDF</span>
                  </div>
                  {/* Graphic representations of PDF layout document */}
                  <div className="bg-white text-slate-800 p-8 rounded-lg shadow-lg w-full max-w-[280px] h-64 text-left text-[8px] leading-tight space-y-2 select-none pointer-events-none">
                    <p className="font-bold border-b pb-1">KEMENTERIAN PENDIDIKAN DAN KEBUDAYAAN</p>
                    <p className="font-bold">TK JOROK TIRAM - SUMBAWA NTB</p>
                    <p className="text-[6px] text-slate-400">SURAT IZIN OPERASIONAL RESMI</p>
                    <div className="h-1.5 bg-slate-200 w-full rounded"></div>
                    <div className="h-1.5 bg-slate-200 w-3/4 rounded"></div>
                    <div className="h-1.5 bg-slate-200 w-5/6 rounded"></div>
                    <div className="h-12 border-dashed border-2 border-slate-200 flex items-center justify-center text-[7px] text-slate-400 font-bold">
                      [TANDA TANGAN RESMI]
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">Mendukung Pembesaran & Cetak Langsung</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <ImageIcon className="w-12 h-12 mx-auto text-slate-600" />
                  <p className="text-white font-bold text-sm">Pratinjau Gambar / Dokumen Office</p>
                  <p className="text-xs">File: {previewArchive.berkas_nama_asli}</p>
                  <button
                    onClick={() => downloadArchiveFile(previewArchive.id)}
                    className="px-3 py-1 bg-slate-800 text-white rounded text-xs hover:bg-slate-700"
                  >
                    Unduh file untuk dibuka
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* VIEW VERSION HISTORY DIALOG */}
      {viewHistoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center">
                <RotateCcw className="w-4 h-4 mr-2 text-blue-500 animate-spin" />
                Riwayat Versi Berkas Dokumen SARDIG
              </h3>
              <button onClick={() => setViewHistoryModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {viewHistoryModal.versions.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold text-center py-6">
                  Tidak ditemukan versi lama. Dokumen ini masih berada pada versi awal (Versi 1).
                </p>
              ) : (
                viewHistoryModal.versions.map((v: any, index: number) => (
                  <div key={v.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-black text-[9px] rounded-full uppercase">
                          Versi {v.versi}
                        </span>
                        <span className="text-slate-400 font-medium text-[10px]">
                          {new Date(v.tanggal_versi).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800">{v.berkas_nama_asli} ({v.berkas_ukuran})</p>
                      <p className="text-slate-500 mt-1">Catatan Perubahan: "{v.deskripsi}"</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">DENGAN AKSES</span>
                      <span className="font-bold text-slate-700">@{v.diubah_oleh}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 border-t mt-4">
              <button
                onClick={() => setViewHistoryModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all"
              >
                Tutup Riwayat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER MASTER CREATION MODAL */}
      {userModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                {userModal.editId ? 'Ubah Informasi Profil Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button onClick={() => setUserModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Depan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Achmad"
                    value={userModal.data.nama_depan || ''}
                    onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, nama_depan: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Belakang</label>
                  <input
                    type="text"
                    placeholder="Contoh: Fauzi"
                    value={userModal.data.nama_belakang || ''}
                    onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, nama_belakang: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {!userModal.editId && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Username Unik</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: fauzi99"
                    value={userModal.data.username || ''}
                    onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, username: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kata Sandi (Password)</label>
                <input
                  type="password"
                  placeholder={userModal.editId ? 'Kosongkan jika tidak ingin diubah' : '••••••••'}
                  value={userModal.data.password || ''}
                  onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, password: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alamat Surel (Email)</label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: fauzi@sardig.edu"
                  value={userModal.data.email || ''}
                  onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, email: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor Telepon / WA</label>
                <input
                  type="text"
                  placeholder="Contoh: 081234..."
                  value={userModal.data.no_hp || ''}
                  onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, no_hp: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hak Akses / Peran</label>
                  <select
                    value={userModal.data.role || 'Operator'}
                    onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, role: e.target.value as any } })}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Operator">Operator</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Keaktifan</label>
                  <select
                    value={userModal.data.status || 'Aktif'}
                    onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, status: e.target.value as any } })}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setUserModal(null)}
                  className="px-4 py-2 text-slate-600 font-bold bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-bold bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
