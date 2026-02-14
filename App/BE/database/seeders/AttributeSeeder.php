<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attribute;

class AttributeSeeder extends Seeder
{
    public function run(): void
    {
        $attributes = [
            ['name' => 'Pedas'],
            ['name' => 'Manis'],
            ['name' => 'Asin'],
            ['name' => 'Gurih'],
        ];

        foreach ($attributes as $attr) {
            Attribute::create($attr);
        }
    }
}
