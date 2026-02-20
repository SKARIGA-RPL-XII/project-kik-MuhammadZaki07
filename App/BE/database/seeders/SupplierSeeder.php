<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            ['name' => 'PT. Sembako Jaya', 'contact_person' => 'Budi Santoso', 'phone' => '081234567890', 'address' => 'Jl. Merdeka No. 10, Jakarta', 'is_active' => true],
            ['name' => 'CV. Sayur Segar', 'contact_person' => 'Siti Aminah', 'phone' => '081299887766', 'address' => 'Pasar Induk Blok A, Bogor', 'is_active' => true],
            ['name' => 'UD. Daging Mantap', 'contact_person' => 'Agus Pratama', 'phone' => '085566778899', 'address' => 'Jl. Jagal No. 5, Surabaya', 'is_active' => true],
            ['name' => 'PT. Bumbu Nusantara', 'contact_person' => 'Dewi Lestari', 'phone' => '081122334455', 'address' => 'Kawasan Industri Cikarang', 'is_active' => true],
            ['name' => 'Distributor Telur Ayam', 'contact_person' => 'Eko Wijaya', 'phone' => '082233445566', 'address' => 'Kecamatan Blitar, Jawa Timur', 'is_active' => true],
            ['name' => 'Sumber Plastik', 'contact_person' => 'Lani Wijaya', 'phone' => '087788990011', 'address' => 'Jl. Toko Tiga No. 45, Jakarta Barat', 'is_active' => true],
            ['name' => 'PT. Beras Cianjur', 'contact_person' => 'H. Dadang', 'phone' => '081344556677', 'address' => 'Jl. Raya Cianjur KM 5', 'is_active' => true],
            ['name' => 'CV. Lautan Seafood', 'contact_person' => 'Anto Shark', 'phone' => '081900112233', 'address' => 'Muara Baru, Jakarta Utara', 'is_active' => true],
            ['name' => 'UD. Es Batu Kristal', 'contact_person' => 'Riko Ice', 'phone' => '085277889900', 'address' => 'Samping Terminal Depok', 'is_active' => true],
            ['name' => 'PT. Minyak Goreng Kita', 'contact_person' => 'Andi Wijaya', 'phone' => '081266554433', 'address' => 'Kawasan Pelabuhan Tanjung Priok', 'is_active' => true],
            ['name' => 'Kopi Gayo Supplier', 'contact_person' => 'Zulkifli', 'phone' => '081199008877', 'address' => 'Takengon, Aceh Tengah', 'is_active' => true],
            ['name' => 'CV. Kemasan Food Grade', 'contact_person' => 'Maya Sari', 'phone' => '081833445566', 'address' => 'Jl. Panjang No. 12, Tangerang', 'is_active' => true],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }
    }
}
