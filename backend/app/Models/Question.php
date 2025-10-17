<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_id',
        'question_text',
        'image_path',
        'image_data',
        'options',
        'correct_answer',
        'points',
        'explanation',
        'order_index',
        'crop_area',
        'actual_width',
        'actual_height',
        'question_type',
        'difficulty',
        'subject',
        'tags',
        'usage_count',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'crop_area' => 'array',
            'tags' => 'array',
        ];
    }

    /**
     * Get the test that owns the question
     */
    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    /**
     * Get the student answers for this question
     */
    public function studentAnswers()
    {
        return $this->hasMany(StudentAnswer::class);
    }

    /**
     * Increment usage count
     */
    public function incrementUsage()
    {
        $this->increment('usage_count');
    }

    /**
     * Check if question is manual type
     */
    public function isManual(): bool
    {
        return $this->question_type === 'manual';
    }

    /**
     * Check if question is cropped type
     */
    public function isCropped(): bool
    {
        return $this->question_type === 'cropped';
    }

    /**
     * Scope for manual questions
     */
    public function scopeManual($query)
    {
        return $query->where('question_type', 'manual');
    }

    /**
     * Scope for cropped questions
     */
    public function scopeCropped($query)
    {
        return $query->where('question_type', 'cropped');
    }
}