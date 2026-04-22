<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attribute_level_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_level_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('stock_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('unit_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('amount', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribute_level_stocks');
    }
};
