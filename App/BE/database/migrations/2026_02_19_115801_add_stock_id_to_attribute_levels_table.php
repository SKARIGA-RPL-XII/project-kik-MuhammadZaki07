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
        Schema::table('attribute_levels', function (Blueprint $table) {
            $table->foreignId('stock_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('pull_quantity')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attribute_levels', function (Blueprint $table) {
            //
        });
    }
};
