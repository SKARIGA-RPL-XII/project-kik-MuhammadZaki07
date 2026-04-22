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
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('abbreviation');
            $table->enum('category', ['weight', 'volume', 'unit']);
            $table->unsignedBigInteger('base_unit_id')->nullable();
            $table->decimal('multiplier', 16, 4)->default(1.0000);
            $table->timestamps();

            $table->foreign('base_unit_id')->references('id')->on('units')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
