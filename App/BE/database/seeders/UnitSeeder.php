<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        // --- 1. KATEGORI: BERAT (Base: Gram) ---
        // Milligram (mg) -> 0.001 gram (Jika ingin Gram sebagai base)
        // Namun agar aman dari desimal, kita bisa set Miligram sebagai Base (multiplier 1)
        // Tapi umumnya di Restoran, Gram sudah cukup kecil sebagai base.

        $gram = Unit::create([
            'name' => 'Gram',
            'abbreviation' => 'g',
            'category' => 'weight',
            'multiplier' => 1,
        ]);
        $gram->update(['base_unit_id' => $gram->id]);

        Unit::create([
            'name' => 'Miligram',
            'abbreviation' => 'mg',
            'category' => 'weight',
            'base_unit_id' => $gram->id,
            'multiplier' => 0.001, // 1 mg = 0.001 g
        ]);

        Unit::create([
            'name' => 'Ons',
            'abbreviation' => 'ons',
            'category' => 'weight',
            'base_unit_id' => $gram->id,
            'multiplier' => 100, // 1 ons = 100 g
        ]);

        Unit::create([
            'name' => 'Kilogram',
            'abbreviation' => 'kg',
            'category' => 'weight',
            'base_unit_id' => $gram->id,
            'multiplier' => 1000, // 1 kg = 1000 g
        ]);

        Unit::create([
            'name' => 'Kuintal',
            'abbreviation' => 'kw',
            'category' => 'weight',
            'base_unit_id' => $gram->id,
            'multiplier' => 100000, // 1 kw = 100.000 g
        ]);

        Unit::create([
            'name' => 'Ton',
            'abbreviation' => 't',
            'category' => 'weight',
            'base_unit_id' => $gram->id,
            'multiplier' => 1000000, // 1 t = 1.000.000 g
        ]);


        // --- 2. KATEGORI: VOLUME (Base: Mililiter) ---

        $ml = Unit::create([
            'name' => 'Mililiter',
            'abbreviation' => 'ml',
            'category' => 'volume',
            'multiplier' => 1,
        ]);
        $ml->update(['base_unit_id' => $ml->id]);

        Unit::create([
            'name' => 'Sentiliter',
            'abbreviation' => 'cl',
            'category' => 'volume',
            'base_unit_id' => $ml->id,
            'multiplier' => 10, // 1 cl = 10 ml
        ]);

        Unit::create([
            'name' => 'Desiliter',
            'abbreviation' => 'dl',
            'category' => 'volume',
            'base_unit_id' => $ml->id,
            'multiplier' => 100, // 1 dl = 100 ml
        ]);

        Unit::create([
            'name' => 'Liter',
            'abbreviation' => 'L',
            'category' => 'volume',
            'base_unit_id' => $ml->id,
            'multiplier' => 1000, // 1 L = 1000 ml
        ]);


        // --- 3. KATEGORI: UNIT / PCS (Base: Pcs) ---

        $pcs = Unit::create([
            'name' => 'Pcs',
            'abbreviation' => 'pcs',
            'category' => 'unit',
            'multiplier' => 1,
        ]);
        $pcs->update(['base_unit_id' => $pcs->id]);

        Unit::create([
            'name' => 'Butir',
            'abbreviation' => 'btr',
            'category' => 'unit',
            'base_unit_id' => $pcs->id,
            'multiplier' => 1, // Sama dengan pcs
        ]);

        Unit::create([
            'name' => 'Lusin',
            'abbreviation' => 'lsn',
            'category' => 'unit',
            'base_unit_id' => $pcs->id,
            'multiplier' => 12, // 1 lusin = 12 pcs
        ]);

        Unit::create([
            'name' => 'Kodi',
            'abbreviation' => 'kodi',
            'category' => 'unit',
            'base_unit_id' => $pcs->id,
            'multiplier' => 20, // 1 kodi = 20 pcs
        ]);

        Unit::create([
            'name' => 'Gross',
            'abbreviation' => 'gross',
            'category' => 'unit',
            'base_unit_id' => $pcs->id,
            'multiplier' => 144, // 1 gross = 144 pcs
        ]);

        Unit::create([
            'name' => 'Pack',
            'abbreviation' => 'pack',
            'category' => 'unit',
            'base_unit_id' => $pcs->id,
            'multiplier' => 1, // Default 1, bisa diubah admin per produk nantinya
        ]);
    }
}
