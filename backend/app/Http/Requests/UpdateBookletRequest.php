<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookletRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $booklet = $this->route('booklet');
        return $this->user()->can('update', $booklet->test);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'versions' => ['sometimes', 'required', 'array', 'min:1', 'max:8'],
            'versions.*' => ['string', 'in:A,B,C,D,E,F,G,H'],
            'question_orders' => ['sometimes', 'required', 'array'],
            'question_orders.*' => ['array'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Kitapçık adı zorunludur.',
            'versions.required' => 'En az bir versiyon seçilmelidir.',
            'versions.max' => 'Maksimum 8 versiyon seçilebilir.',
            'versions.*.in' => 'Versiyon A-H arasında olmalıdır.',
            'question_orders.required' => 'Soru sıralaması zorunludur.',
        ];
    }
}