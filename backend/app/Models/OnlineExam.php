<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OnlineExam extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_id',
        'user_id',
        'title',
        'description',
        'time_limit',
        'shuffle_questions',
        'shuffle_options',
        'show_results',
        'allow_review',
        'is_active',
        'start_date',
        'end_date',
        'participant_count',
        'average_score',
    ];

    protected function casts(): array
    {
        return [
            'shuffle_questions' => 'boolean',
            'shuffle_options' => 'boolean',
            'show_results' => 'boolean',
            'allow_review' => 'boolean',
            'is_active' => 'boolean',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'average_score' => 'decimal:2',
        ];
    }

    /**
     * Get the test that owns the online exam
     */
    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    /**
     * Get the user (teacher) that owns the online exam
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the exam sessions for this online exam
     */
    public function examSessions()
    {
        return $this->hasMany(ExamSession::class);
    }

    /**
     * Check if exam is currently active
     */
    public function isCurrentlyActive(): bool
    {
        // Base active status check
        if (!$this->is_active) {
            return false;
        }
        
        // Date-based automatic activation
        $now = now();
        
        // If start date is set and hasn't arrived yet
        if ($this->start_date && $now < $this->start_date) {
            return false;
        }

        // If end date is set and has passed
        if ($this->end_date && $now > $this->end_date) {
            return false;
        }

        // If no dates are set, exam is active based on is_active flag only
        return true;
    }
    
    /**
     * Get exam status with detailed information
     */
    public function getDetailedStatus(): array
    {
        $now = now();
        
        // Check base active status
        if (!$this->is_active) {
            return [
                'status' => 'inactive',
                'message' => 'Sınav manuel olarak devre dışı bırakılmış',
                'can_start' => false
            ];
        }
        
        // Check start date
        if ($this->start_date && $now < $this->start_date) {
            return [
                'status' => 'not_started',
                'message' => 'Sınav henüz başlamamış',
                'can_start' => false,
                'start_date' => $this->start_date,
                'time_until_start' => $this->start_date->diffInMinutes($now)
            ];
        }
        
        // Check end date
        if ($this->end_date && $now > $this->end_date) {
            return [
                'status' => 'expired',
                'message' => 'Sınav süresi dolmuş',
                'can_start' => false,
                'end_date' => $this->end_date
            ];
        }
        
        // Exam is currently active
        return [
            'status' => 'active',
            'message' => 'Sınav aktif ve katılıma açık',
            'can_start' => true,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date
        ];
    }
    
    /**
     * Auto-activate exam based on current time
     */
    public function autoActivateIfTime(): bool
    {
        $now = now();
        
        // If exam has start date and it's time to start
        if ($this->start_date && $now >= $this->start_date && !$this->is_active) {
            $this->update(['is_active' => true]);
            return true;
        }
        
        // If exam has end date and it's past end time
        if ($this->end_date && $now > $this->end_date && $this->is_active) {
            $this->update(['is_active' => false]);
            return true;
        }
        
        return false;
    }

    /**
     * Update participant count and average score
     */
    public function updateStatistics()
    {
        $sessions = $this->examSessions()->where('is_completed', true);
        
        $this->update([
            'participant_count' => $sessions->count(),
            'average_score' => $sessions->avg('percentage'),
        ]);
    }

    /**
     * Scope for active exams
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}