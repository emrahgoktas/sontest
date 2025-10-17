<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOnlineExamRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isTeacher() || $this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'time_limit' => ['nullable', 'integer', 'min:1', 'max:300'],
            'shuffle_questions' => ['nullable', 'boolean'],
            'shuffle_options' => ['nullable', 'boolean'],
            'show_results' => ['nullable', 'boolean'],
            'allow_review' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'start_date' => ['nullable', 'date', 'after_or_equal:now'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Sınav başlığı zorunludur.',
            'time_limit.min' => 'Süre limiti en az 1 dakika olmalıdır.',
            'time_limit.max' => 'Süre limiti en fazla 300 dakika olabilir.',
            'start_date.after_or_equal' => 'Başlangıç tarihi bugünden önce olamaz.',
            'end_date.after' => 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır.',
        ];
    }
}