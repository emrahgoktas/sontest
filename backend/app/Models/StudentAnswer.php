<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_session_id',
        'question_id',
        'selected_option',
        'is_correct',
        'time_spent',
        'answered_at',
    ];

    protected function casts(): array
    {
        return [
            'is_correct' => 'boolean',
            'answered_at' => 'datetime',
        ];
    }

    /**
     * Get the exam session that owns the answer
     */
    public function examSession()
    {
        return $this->belongsTo(ExamSession::class);
    }

    /**
     * Get the question that owns the answer
     */
    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Check if answer is correct
     */
    public function checkCorrectness()
    {
        $this->is_correct = $this->selected_option === $this->question->correct_answer;
        $this->save();
    }
}