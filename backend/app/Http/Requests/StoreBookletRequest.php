<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookletRequest extends FormRequest
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
            'test_id' => ['required', 'exists:tests,id'],
            'name' => ['required', 'string', 'max:255'],
            'versions' => ['required', 'array', 'min:1', 'max:8'],
            'versions.*' => ['string', 'in:A,B,C,D,E,F,G,H'],
            'question_orders' => ['required', 'array'],
            'question_orders.*' => ['array'], // Each version should have an array of question orders
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'test_id.required' => 'Test ID zorunludur.',
            'test_id.exists' => 'Geçersiz test ID.',
            'name.required' => 'Kitapçık adı zorunludur.',
            'versions.required' => 'En az bir versiyon seçilmelidir.',
            'versions.max' => 'Maksimum 8 versiyon seçilebilir.',
            'versions.*.in' => 'Versiyon A-H arasında olmalıdır.',
            'question_orders.required' => 'Soru sıralaması zorunludur.',
        ];
    }
}