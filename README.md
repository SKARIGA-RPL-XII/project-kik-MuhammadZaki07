# Gagal Lapar - Restaurant Management System

Gagal Lapar adalah solusi manajemen restoran komprehensif berbasis Web dan Desktop (Cashier Optimized) yang dirancang untuk mengintegrasikan operasional dapur, pelayanan pelanggan, hingga laporan keuangan dalam satu ekosistem digital.

## Fitur Utama Berdasarkan Peran

Sistem ini menggunakan Role-Based Access Control (RBAC) yang ketat dengan pembagian fitur sebagai berikut:

### Admin
* Full System Control: Manajemen konfigurasi sistem, pajak (10%), dan service charge (5%).
* Inventory Management: Monitoring stok bahan baku dengan fitur low stock threshold.
* Master Data: Pengaturan Menu, Kategori, Banner Promo, dan Badge.
* Staff Management: Pengaturan jadwal tugas, absensi, dan izin/cuti karyawan.
* Analytics: Laporan pendapatan harian, laporan penjualan, dan statistik menu terlaris.

### Kasir (Desktop Optimized)
* Point of Sales (POS): Antarmuka cepat untuk transaksi dine-in maupun take-away.
* Flexible Payment: Terintegrasi dengan berbagai metode (BRI, BNI, BCA VA, DANA, ShopeePay, & QRIS).
* Order Queue: Monitoring antrean pesanan secara real-time.
* Auto Print: Pencetakan struk belanja otomatis setelah pembayaran sukses.

### Pelanggan
* Digital Menu: Eksplorasi menu melalui antarmuka web yang responsif.
* Reservation: Pemesanan meja dan ruangan secara online.
* Self-Ordering: Melakukan pesanan langsung dari perangkat masing-masing.

### Karyawan
* Kitchen Display System (KDS): Memproses pesanan masuk dari kasir/customer.
* Attendance: Sistem absensi digital dan pengajuan cuti.
* Stock Adjustment: Penyesuaian stok bahan di lapangan secara real-time.

### Tech Stack
* Core: Laravel 12 (Backend API) & React.js (Frontend SPA).
* Desktop/Mobile Wrapper: Capacitor (Untuk kebutuhan aplikasi kasir desktop).
* Styling: Tailwind CSS & Shadcn/UI.
* Database: MySQL / MariaDB.
* Documentation: Draw.io (DFD/Flowchart) & ERD Visualization.

### Struktur Proyek

```text
PROJECT-KIK-2026/
├── App/
│   ├── BE/                 # Laravel 11 API (Backend)
│   │   ├── app/            # Business Logic
│   │   ├── database/       # Migrations & Seeders
│   │   └── routes/         # API Endpoints
│   └── FE/                 # React + Vite (Frontend)
│       ├── src/            # Components, Hooks, & Pages
│       └── android/        # Capacitor Android Build
├── Documents/              # Software Development Life Cycle (SDLC) Docs
│   ├── DFD/                # Data Flow Diagrams
│   ├── Flowchart/          # Logic Flow
│   ├── Mockup/             # UI/UX Design
│   ├── ERD-KIK-2026.png    # Database Schema
│   └── LAPORAN PROJECT.docx # Final Academic Report
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

## Kontak dan Dukungan
## Nama Toko: Gagal Lapar
## Pengembang: Zaki (Tugas Akhir 2026)
## Alamat: Jl Mega Permai VI 138, Ngaliyan, Semarang
## Telepon: 083846871126

#### Copyright 2026 PT Nero Coffee & Roastery APP - Gagal Lapar Project.

