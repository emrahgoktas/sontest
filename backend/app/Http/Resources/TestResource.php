<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestResource extends JsonResource
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
            'lesson' => $this->lesson,
            'class_name' => $this->class_name,
            'teacher_name' => $this->teacher_name,
            'question_spacing' => $this->question_spacing,
            'theme' => $this->theme,
            'watermark_config' => $this->watermark_config,
            'include_answer_key' => $this->include_answer_key,
            'is_public' => $this->is_public,
            'download_count' => $this->download_count,
            'tags' => $this->tags,
            'question_count' => $this->whenLoaded('questions', function () {
                return $this->questions->count();
            }),
            'user' => new UserResource($this->whenLoaded('user')),
            'questions' => QuestionResource::collection($this->whenLoaded('questions')),
            'booklets' => BookletResource::collection($this->whenLoaded('booklets')),
            'online_exams' => OnlineExamResource::collection($this->whenLoaded('onlineExams')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}