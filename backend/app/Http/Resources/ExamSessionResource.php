<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'started_at' => $this->started_at->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'score' => $this->score,
            'correct_answers' => $this->correct_answers,
            'wrong_answers' => $this->wrong_answers,
            'empty_answers' => $this->empty_answers,
            'percentage' => $this->percentage,
            'completion_time' => $this->completion_time,
            'is_completed' => $this->is_completed,
            'current_question_index' => $this->current_question_index,
            'flagged_questions' => $this->flagged_questions,
            'is_expired' => $this->isExpired(),
            'online_exam' => new OnlineExamResource($this->whenLoaded('onlineExam')),
            'student' => new UserResource($this->whenLoaded('student')),
            'student_answers' => StudentAnswerResource::collection($this->whenLoaded('studentAnswers')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}