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
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->string('table_number')->unique();
            $table->enum('status', ['available', 'occupied','booked','reserved'])
                ->default('available');
            $table->string('qr_code')->nullable();
            $table->foreignId('room_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->integer('capacity')->default(4);
            $table->integer('x_position')->nullable();
            $table->integer('y_position')->nullable();
            $table->integer('width')->default(80);
            $table->integer('height')->default(80);
            $table->enum('shape', ['square', 'round', 'rectangle'])
                ->default('square');
            $table->timestamp('reserved_until')->nullable();
            $table->timestamp('last_service_at')->nullable();
            $table->text('notes')->nullable();
            $table->text('rotation')->nullable();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};
