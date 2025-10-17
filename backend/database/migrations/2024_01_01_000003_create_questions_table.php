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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_id')->constrained()->onDelete('cascade');
            $table->text('question_text')->nullable(); // For manual questions
            $table->string('image_path')->nullable(); // For uploaded images
            $table->longText('image_data')->nullable(); // For base64 cropped images
            $table->json('options')->nullable(); // A, B, C, D, E options for manual questions
            $table->enum('correct_answer', ['A', 'B', 'C', 'D', 'E']);
            $table->text('explanation')->nullable();
            $table->integer('order_index')->default(0);
            $table->json('crop_area')->nullable(); // For PDF cropped questions
            $table->integer('actual_width')->nullable();
            $table->integer('actual_height')->nullable();
            $table->enum('question_type', ['manual', 'cropped'])->default('manual');
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->nullable();
            $table->string('subject')->nullable();
            $table->json('tags')->nullable();
            $table->integer('usage_count')->default(0);
            $table->timestamps();
            
            $table->index(['test_id', 'order_index']);
            $table->index('question_type');
            $table->index('difficulty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};