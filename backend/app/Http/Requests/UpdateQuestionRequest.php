<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('test'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'question_text' => ['nullable', 'string'],
            'image_data' => ['nullable', 'string'],
            'options' => ['nullable', 'array'],
            'options.A' => ['required_with:options', 'string'],
            'options.B' => ['required_with:options', 'string'],
            'options.C' => ['required_with:options', 'string'],
            'options.D' => ['required_with:options', 'string'],
            'options.E' => ['required_with:options', 'string'],
            'correct_answer' => ['sometimes', 'required', Rule::in(['A', 'B', 'C', 'D', 'E'])],
            'points' => ['nullable', 'integer', 'min:1', 'max:100'],
            'explanation' => ['nullable', 'string'],
            'order_index' => ['nullable', 'integer', 'min:0'],
            'crop_area' => ['nullable', 'array'],
            'actual_width' => ['nullable', 'integer', 'min:1'],
            'actual_height' => ['nullable', 'integer', 'min:1'],
            'difficulty' => ['nullable', Rule::in(['easy', 'medium', 'hard'])],
            'subject' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'correct_answer.required' => 'Doğru cevap zorunludur.',
            'correct_answer.in' => 'Doğru cevap A, B, C, D veya E olmalıdır.',
        ];
    }
}