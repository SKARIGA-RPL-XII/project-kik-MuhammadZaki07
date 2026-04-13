# Gagal Lapar - Restaurant Management System

**Gagal Lapar** adalah solusi manajemen restoran modern berbasis **Web, Desktop (Cashier Optimized), dan Android (APK)** yang dirancang untuk mengintegrasikan operasional dapur, transaksi kasir, pelayanan pelanggan, hingga laporan keuangan dalam satu ekosistem digital yang efisien dan terpusat.

🌐 **Live Demo**: https://gagallapar.my.id/

---

## Fitur Utama Berdasarkan Peran

Sistem ini mengimplementasikan **Role-Based Access Control (RBAC)** untuk memastikan setiap peran memiliki akses yang sesuai.

### Admin
- **Full System Control**: Pengaturan konfigurasi sistem, pajak (10%), dan service charge (5%)
- **Inventory Management**: Monitoring stok bahan baku dengan fitur *low stock alert*
- **Master Data**: Manajemen Menu, Kategori, Banner Promo, dan Badge
- **Staff Management**: Pengaturan jadwal, absensi, dan cuti karyawan
- **Analytics & Reporting**: Laporan pendapatan, penjualan, dan statistik menu terlaris

---

### Kasir (Desktop Optimized)
- **Point of Sales (POS)**: Transaksi cepat untuk dine-in & take-away
- **Flexible Payment**: Dukungan berbagai metode pembayaran (BRI, BNI, BCA VA, DANA, ShopeePay, QRIS)
- **Order Queue Management**: Monitoring antrean pesanan secara real-time
- **Auto Print**: Cetak struk otomatis setelah transaksi berhasil

---

### Pelanggan
- **Digital Menu**: Akses menu melalui web responsif
- **Reservation System**: Pemesanan meja dan ruangan secara online
- **Self-Ordering**: Pemesanan mandiri langsung dari perangkat pengguna

---

### Karyawan
- **Kitchen Display System (KDS)**: Pengelolaan pesanan dari kasir/pelanggan
- **Attendance System**: Absensi digital dan pengajuan cuti
- **Stock Adjustment**: Penyesuaian stok bahan secara real-time

---

## Tech Stack

- **Backend**: Laravel 12 (REST API)
- **Frontend**: React.js + Vite (SPA)
- **Mobile/Desktop Wrapper**: Capacitor (Android & Desktop)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Database**: MySQL / MariaDB
- **Documentation**: Draw.io (DFD, Flowchart), ERD

---

## 📁 Struktur Proyek

```text
PROJECT-KIK-2026/
├── App/
│   ├── BE/                 # Laravel API (Backend)
│   │   ├── app/
│   │   ├── database/
│   │   └── routes/
│   └── FE/                 # React + Vite (Frontend)
│       ├── src/
│       ├── android/        # Android APK (Capacitor)
│       └── assets/         # App Assets (icon, splash)
├── Documents/              # SDLC Documentation
│   ├── DFD/
│   ├── Flowchart/
│   ├── Mockup/
│   ├── ERD-KIK-2026.png
│   └── LAPORAN PROJECT.docx
└── README.md
```

### 1. Clone Repository

```
https://github.com/SKARIGA-RPL-XII/project-kik-MuhammadZaki07.git
```

### 2. Backend Setup (Laravel)

```
cd App/BE
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 3. Frontend Setup (React)

```
cd App/FE
npm install
npm run dev
```

#### Copyright 2026 PT Nero Coffee & Roastery APP - Gagal Lapar Project.

