<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
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
            'question_text' => $this->question_text,
            'image_path' => $this->image_path,
            'image_data' => $this->image_data,
            'options' => $this->options,
            'correct_answer' => $this->correct_answer,
            'points' => $this->points,
            'explanation' => $this->explanation,
            'order_index' => $this->order_index,
            'crop_area' => $this->crop_area,
            'actual_width' => $this->actual_width,
            'actual_height' => $this->actual_height,
            'question_type' => $this->question_type,
            'difficulty' => $this->difficulty,
            'subject' => $this->subject,
            'tags' => $this->tags,
            'usage_count' => $this->usage_count,
            'test' => new TestResource($this->whenLoaded('test')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}