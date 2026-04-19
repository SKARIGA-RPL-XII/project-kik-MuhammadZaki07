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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('action');
            $table->string('module');
            $table->json('payload_before')->nullable();
            $table->json('payload_after')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('message');
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
            $table->index('module');
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
