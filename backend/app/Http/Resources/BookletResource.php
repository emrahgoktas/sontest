<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookletResource extends JsonResource
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
            'name' => $this->name,
            'versions' => $this->versions,
            'question_orders' => $this->question_orders,
            'download_count' => $this->download_count,
            'question_count' => $this->question_count,
            'version_count' => $this->version_count,
            'test' => new TestResource($this->whenLoaded('test')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}