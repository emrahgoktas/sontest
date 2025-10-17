<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'lesson',
        'class_name',
        'teacher_name',
        'question_spacing',
        'theme',
        'watermark_config',
        'include_answer_key',
        'is_public',
        'download_count',
        'tags',
    ];

    protected function casts(): array
    {
        return [
            'watermark_config' => 'array',
            'include_answer_key' => 'boolean',
            'is_public' => 'boolean',
            'tags' => 'array',
        ];
    }

    /**
     * Get the user that owns the test
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the questions for the test
     */
    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('order_index');
    }

    /**
     * Get the booklets for the test
     */
    public function booklets()
    {
        return $this->hasMany(Booklet::class);
    }

    /**
     * Get the online exams for the test
     */
    public function onlineExams()
    {
        return $this->hasMany(OnlineExam::class);
    }

    /**
     * Increment download count
     */
    public function incrementDownloadCount()
    {
        $this->increment('download_count');
    }

    /**
     * Scope for public tests
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for tests by lesson
     */
    public function scopeByLesson($query, $lesson)
    {
        return $query->where('lesson', $lesson);
    }
}