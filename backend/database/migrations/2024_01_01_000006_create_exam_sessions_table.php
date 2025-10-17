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
        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('online_exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->integer('score')->default(0);
            $table->integer('correct_answers')->default(0);
            $table->integer('wrong_answers')->default(0);
            $table->integer('empty_answers')->default(0);
            $table->decimal('percentage', 5, 2)->default(0);
            $table->integer('completion_time')->nullable(); // in minutes
            $table->boolean('is_completed')->default(false);
            $table->integer('current_question_index')->default(0);
            $table->json('flagged_questions')->nullable();
            $table->timestamps();
            
            $table->unique(['online_exam_id', 'student_id']);
            $table->index(['student_id', 'is_completed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_sessions');
    }
};