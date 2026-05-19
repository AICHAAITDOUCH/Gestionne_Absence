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
        Schema::table('modules', function (Blueprint $table) {
            $table->foreignId('formateur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('groupe_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropForeign(['formateur_id']);
            $table->dropForeign(['groupe_id']);
            $table->dropColumn(['formateur_id', 'groupe_id']);
        });
    }
};
