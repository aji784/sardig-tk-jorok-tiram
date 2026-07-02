# 📂 SARDIG (Sistem Arsip Digital)

SARDIG (Sistem Arsip Digital) adalah aplikasi berbasis web yang dirancang untuk membantu sekolah dalam mengelola dokumen dan arsip secara digital. Aplikasi ini memudahkan proses penyimpanan, pencarian, pengelompokan, serta pengunduhan dokumen dengan sistem yang terstruktur, aman, dan mudah digunakan.

> Proyek ini dikembangkan menggunakan **PHP Native**, **MySQL**, **Bootstrap 5**, dan dijalankan pada **XAMPP** sebagai web server lokal.

---

## 🏫 Informasi Proyek

- **Nama Aplikasi** : SARDIG (Sistem Arsip Digital)
- **Instansi** : TK JOROK TIRAM
- **Bahasa Pemrograman** : PHP Native
- **Database** : MySQL
- **Web Server** : Apache (XAMPP)
- **Frontend** : HTML5, CSS3, Bootstrap 5, JavaScript
- **Versi** : 1.0.0

---

# ✨ Fitur Utama

## 🔐 Autentikasi

- Login Administrator
- Login Operator
- Logout
- Session Login

---

## 📊 Dashboard

- Total Arsip
- Total Kategori
- Total Pengguna
- Statistik Data

---

## 📁 Manajemen Kategori

- Tambah Kategori
- Edit Kategori
- Hapus Kategori
- Pencarian Data

---

## 📄 Manajemen Arsip

- Tambah Arsip
- Edit Arsip
- Hapus Arsip
- Upload Dokumen
- Download Dokumen
- Pencarian Arsip
- Filter Berdasarkan Kategori

---

## 👥 Manajemen Pengguna

- Administrator
- Operator

---

## 📑 Laporan

- Cetak Data Arsip
- Export PDF *(Tahap Pengembangan)*
- Export Excel *(Tahap Pengembangan)*

---

# 🛠️ Teknologi yang Digunakan

- PHP 8.x
- MySQL / MariaDB
- Bootstrap 5
- JavaScript
- HTML5
- CSS3
- Font Awesome
- DataTables *(Tahap Pengembangan)*
- SweetAlert2 *(Tahap Pengembangan)*

---

# 📂 Struktur Folder

```
sardig/
│
├── assets/
│   ├── css/
│   ├── js/
│   └── uploads/
│
├── config/
│   ├── auth.php
│   ├── database.php
│   └── session.php
│
├── includes/
│   ├── header.php
│   ├── navbar.php
│   ├── sidebar.php
│   └── footer.php
│
├── kategori/
│
├── arsip/
│
├── database/
│   └── sardig.sql
│
├── dashboard.php
├── index.php
├── login.php
└── logout.php
```

---

# ⚙️ Persyaratan Sistem

- PHP 8.x
- MySQL 8.x / MariaDB
- Apache Web Server
- XAMPP
- Browser Modern

---

# 🚀 Instalasi

## 1. Clone Repository

```bash
git clone https://github.com/USERNAME/sardig.git
```

atau download ZIP dari GitHub.

---

## 2. Pindahkan Folder

Salin folder proyek ke

```
C:\xampp\htdocs\
```

---

## 3. Buat Database

Masuk ke

```
http://localhost/phpmyadmin
```

Buat database baru

```
sardig
```

Kemudian import file

```
database/sardig.sql
```

---

## 4. Jalankan Aplikasi

Buka browser

```
http://localhost/sardig
```

---

# 👤 Login Default

Username

```
admin
```

Password

```
admin123
```

> **Catatan:** Password default sebaiknya segera diubah setelah instalasi.

---

# 📌 Roadmap Pengembangan

- [x] Struktur Folder
- [x] Database
- [x] Login
- [x] Dashboard
- [ ] CRUD Kategori
- [ ] CRUD Arsip
- [ ] Upload File
- [ ] Download File
- [ ] DataTables
- [ ] SweetAlert2
- [ ] Export PDF
- [ ] Export Excel
- [ ] Log Aktivitas
- [ ] Backup Database
- [ ] Restore Database
- [ ] Dark Mode
- [ ] Dashboard Statistik

---

# 🤝 Kontribusi

Kontribusi sangat terbuka. Silakan lakukan:

1. Fork repository
2. Buat branch baru
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

---

# 📄 Lisensi

Proyek ini menggunakan lisensi **MIT License**.

---

# 👨‍💻 Pengembang

**Muhaji**

GitHub: https://github.com/USERNAME

Email: abangmuhaji08@gmail.com

---

# ⭐ Dukungan

Jika proyek ini bermanfaat, jangan lupa berikan ⭐ pada repository GitHub agar mendukung pengembangan proyek ini.

Terima kasih telah menggunakan **SARDIG (Sistem Arsip Digital)**.
