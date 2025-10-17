<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentAnswerResource extends JsonResource
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
            'selected_option' => $this->selected_option,
            'is_correct' => $this->is_correct,
            'time_spent' => $this->time_spent,
            'answered_at' => $this->answered_at?->toISOString(),
            'question' => new QuestionResource($this->whenLoaded('question')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}