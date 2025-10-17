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
        Schema::create('tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('lesson');
            $table->string('class_name')->nullable();
            $table->string('teacher_name')->nullable();
            $table->integer('question_spacing')->default(5);
            $table->enum('theme', ['classic', 'yaprak-test', 'deneme-sinavi', 'yazili-sinav', 'tyt-2024'])->default('classic');
            $table->json('watermark_config')->nullable();
            $table->boolean('include_answer_key')->default(true);
            $table->boolean('is_public')->default(false);
            $table->integer('download_count')->default(0);
            $table->json('tags')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'is_public']);
            $table->index('lesson');
            $table->fullText(['title', 'description']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tests');
    }
};