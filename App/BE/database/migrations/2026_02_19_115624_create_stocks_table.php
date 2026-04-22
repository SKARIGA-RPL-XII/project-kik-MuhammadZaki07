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
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('min_unit_id')->nullable()->constrained('units');
            $table->foreignId('supplier_id')
                ->nullable()
                ->constrained('suppliers')
                ->onDelete('set null');
            $table->foreignId('unit_id')
                ->nullable()
                ->constrained('units')
                ->onDelete('set null');
            $table->decimal('quantity', 15, 2)->nullable();
            $table->decimal('low_stock_threshold', 15, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
