<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booklet extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_id',
        'name',
        'versions',
        'question_orders',
        'download_count',
    ];

    protected function casts(): array
    {
        return [
            'versions' => 'array',
            'question_orders' => 'array',
        ];
    }

    /**
     * Get the test that owns the booklet
     */
    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    /**
     * Increment download count
     */
    public function incrementDownloadCount()
    {
        $this->increment('download_count');
    }

    /**
     * Get question count
     */
    public function getQuestionCountAttribute()
    {
        return $this->test->questions()->count();
    }

    /**
     * Get version count
     */
    public function getVersionCountAttribute()
    {
        return count($this->versions);
    }
}