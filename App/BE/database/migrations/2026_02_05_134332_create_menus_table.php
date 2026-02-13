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
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('menu_image');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('price')->nullable();
            $table->integer('stock')->nullable()->default(1);
            $table->boolean('is_active')->default(true);
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('discount_id')->nullable()->constrained()->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
