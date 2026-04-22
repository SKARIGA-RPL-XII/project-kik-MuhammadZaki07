<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::create('menu_attribute_level', function (Blueprint $table) {
        $table->id();
        $table->foreignId('menu_id')->constrained('menus')->onDelete('cascade');
        $table->foreignId('attribute_level_id')->constrained('attribute_levels')->onDelete('cascade');
        $table->decimal('price', 15, 2)->default(0);    
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_attribute_level');
    }
};
