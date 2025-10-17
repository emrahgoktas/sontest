<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'online_exam_id',
        'student_id',
        'started_at',
        'completed_at',
        'score',
        'correct_answers',
        'wrong_answers',
        'empty_answers',
        'percentage',
        'completion_time',
        'is_completed',
        'current_question_index',
        'flagged_questions',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'percentage' => 'decimal:2',
            'is_completed' => 'boolean',
            'flagged_questions' => 'array',
        ];
    }

    /**
     * Get the online exam that owns the session
     */
    public function onlineExam()
    {
        return $this->belongsTo(OnlineExam::class);
    }

    /**
     * Get the student that owns the session
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the student answers for this session
     */
    public function studentAnswers()
    {
        return $this->hasMany(StudentAnswer::class);
    }

    /**
     * Complete the exam session
     */
    public function complete()
    {
        $this->calculateResults();
        
        $this->update([
            'completed_at' => now(),
            'is_completed' => true,
            'completion_time' => $this->started_at->diffInMinutes(now()),
        ]);

        // Update exam statistics
        $this->onlineExam->updateStatistics();
    }

    /**
     * Calculate exam results
     */
    private function calculateResults()
    {
        $answers = $this->studentAnswers;
        $totalQuestions = $this->onlineExam->test->questions()->count();
        
        $correctAnswers = $answers->where('is_correct', true)->count();
        $wrongAnswers = $answers->where('is_correct', false)->where('selected_option', '!=', null)->count();
        $emptyAnswers = $totalQuestions - $answers->count();
        
        $percentage = $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 100 : 0;
        
        $this->update([
            'score' => $correctAnswers,
            'correct_answers' => $correctAnswers,
            'wrong_answers' => $wrongAnswers,
            'empty_answers' => $emptyAnswers,
            'percentage' => $percentage,
        ]);
    }

    /**
     * Check if session is expired
     */
    public function isExpired(): bool
    {
        if (!$this->onlineExam->time_limit) {
            return false;
        }

        $timeLimit = $this->onlineExam->time_limit; // in minutes
        $elapsedTime = $this->started_at->diffInMinutes(now());

        return $elapsedTime >= $timeLimit;
    }
}