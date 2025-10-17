<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadQuestionImageRequest extends FormRequest
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
            'image' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,png,jpg,gif,svg',
                'max:' . (config('app.max_upload_size', 52428800) / 1024), // Convert bytes to KB
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'image.required' => 'Görsel dosyası zorunludur.',
            'image.image' => 'Yüklenen dosya bir görsel olmalıdır.',
            'image.mimes' => 'Görsel formatı jpeg, png, jpg, gif veya svg olmalıdır.',
            'image.max' => 'Görsel dosyası çok büyük.',
        ];
    }
}