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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('table_id')->constrained('tables')->cascadeOnDelete();
            $table->dateTime('booking_time');
            $table->integer('number_of_people');
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed','pending_confirmation'])->default('pending');
            $table->text('notes')->nullable();
            $table->integer('duration_minutes')->default(120);
            $table->dateTime('end_time')->nullable();
            $table->decimal('deposit_amount', 15, 2)->default(0);
            $table->foreignId('transaction_id')->nullable()->constrained('transactions');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
