<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attribute;
use App\Models\AttributeLevel;

class AttributeLevelSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            'Pedas' => ['Tidak Pedas', 'Sedang', 'Pedas', 'Sangat Pedas'],
            'Manis' => ['Tidak Manis', 'Sedikit', 'Manis', 'Sangat Manis'],
            'Asin' => ['Ringan', 'Sedang', 'Kuat'],
            'Gurih' => ['Ringan', 'Sedang', 'Tinggi'],
        ];

        foreach ($levels as $attrName => $lvlNames) {
            $attribute = Attribute::where('name', $attrName)->first();
            if ($attribute) {
                foreach ($lvlNames as $name) {
                    AttributeLevel::create([
                        'attribute_id' => $attribute->id,
                        'name' => $name
                    ]);
                }
            }
        }
    }
}
