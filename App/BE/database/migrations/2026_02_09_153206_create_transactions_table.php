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

            $table->foreignId('table_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('cashier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string("transaction_code")->nullable()->unique();
            $table->string('customer_name')->nullable();

            $table->enum('status', [
                'pending_payment',
                'pending_confirmation',
                'paid',
                'to_cook',
                'cooking',
                'completed',
                'cancelled',
                'failed'
            ])->default('pending_payment');

            $table->integer('total_amount');
            $table->string('payment_method')->nullable();
            $table->integer('amount_paid')->nullable();
            $table->integer('change_amount')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamp('transaction_date')->useCurrent();
            $table->enum('order_source', ['qr_code', 'cashier_direct'])->default('cashier_direct');
            $table->string('snap_token')->nullable();

            $table->timestamp('cooking_started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('total_duration')->nullable();
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
