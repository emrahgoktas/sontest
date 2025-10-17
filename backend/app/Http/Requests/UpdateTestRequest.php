<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTestRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'lesson' => ['sometimes', 'required', 'string', 'max:255'],
            'class_name' => ['nullable', 'string', 'max:255'],
            'teacher_name' => ['nullable', 'string', 'max:255'],
            'question_spacing' => ['nullable', 'integer', 'min:0', 'max:50'],
            'theme' => ['nullable', Rule::in(['classic', 'yaprak-test', 'deneme-sinavi', 'yazili-sinav', 'tyt-2024'])],
            'watermark_config' => ['nullable', 'array'],
            'include_answer_key' => ['nullable', 'boolean'],
            'is_public' => ['nullable', 'boolean'],
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
            'title.required' => 'Test başlığı zorunludur.',
            'lesson.required' => 'Ders adı zorunludur.',
            'question_spacing.min' => 'Soru aralığı 0\'dan küçük olamaz.',
            'question_spacing.max' => 'Soru aralığı 50\'den büyük olamaz.',
        ];
    }
}