<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OnlineExamResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'time_limit' => $this->time_limit,
            'shuffle_questions' => $this->shuffle_questions,
            'shuffle_options' => $this->shuffle_options,
            'show_results' => $this->show_results,
            'allow_review' => $this->allow_review,
            'is_active' => $this->is_active,
            'start_date' => $this->start_date?->toISOString(),
            'end_date' => $this->end_date?->toISOString(),
            'participant_count' => $this->participant_count,
            'average_score' => $this->average_score,
            'is_currently_active' => $this->isCurrentlyActive(),
            'test' => new TestResource($this->whenLoaded('test')),
            'user' => new UserResource($this->whenLoaded('user')),
            'exam_sessions' => ExamSessionResource::collection($this->whenLoaded('examSessions')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}