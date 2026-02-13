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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('table_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('cashier_id')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('status', [
                'pending_payment',
                'paid',
                'to_cook',
                'cooking',
                'completed',
                'cancelled'
            ])->default('pending_payment');

            $table->integer('total_amount');
            $table->string('payment_method')->nullable();
            $table->integer('amount_paid')->nullable();
            $table->integer('change_amount')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamp('transaction_date')->useCurrent();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
