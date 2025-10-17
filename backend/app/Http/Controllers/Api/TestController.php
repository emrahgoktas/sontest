<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTestRequest;
use App\Http\Requests\UpdateTestRequest;
use App\Http\Resources\TestResource;
use App\Models\Test;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TestController extends Controller
{
    /**
     * Display a listing of tests
     */
    public function index(Request $request): JsonResponse
    {
        $query = Test::with(['user', 'questions'])
            ->when($request->user()->isTeacher(), function ($q) use ($request) {
                return $q->where('user_id', $request->user()->id);
            })
            ->when($request->lesson, function ($q, $lesson) {
                return $q->byLesson($lesson);
            })
            ->when($request->search, function ($q, $search) {
                return $q->whereFullText(['title', 'description'], $search);
            })
            ->when($request->is_public !== null, function ($q) use ($request) {
                return $q->where('is_public', $request->boolean('is_public'));
            });

        $tests = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => TestResource::collection($tests->items()),
            'meta' => [
                'current_page' => $tests->currentPage(),
                'last_page' => $tests->lastPage(),
                'per_page' => $tests->perPage(),
                'total' => $tests->total(),
            ],
        ]);
    }

    /**
     * Store a newly created test
     */
    public function store(StoreTestRequest $request): JsonResponse
    {
        $test = Test::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'lesson' => $request->lesson,
            'class_name' => $request->class_name,
            'teacher_name' => $request->teacher_name ?? $request->user()->name,
            'question_spacing' => $request->question_spacing ?? 5,
            'theme' => $request->theme ?? 'classic',
            'watermark_config' => $request->watermark_config,
            'include_answer_key' => $request->boolean('include_answer_key', true),
            'is_public' => $request->boolean('is_public', false),
            'tags' => $request->tags ?? [],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Test başarıyla oluşturuldu',
            'data' => new TestResource($test->load(['user', 'questions'])),
        ], 201);
    }

    /**
     * Display the specified test
     */
    public function show(Test $test): JsonResponse
    {
        $this->authorize('view', $test);

        return response()->json([
            'success' => true,
            'data' => new TestResource($test->load(['user', 'questions', 'booklets', 'onlineExams'])),
        ]);
    }

    /**
     * Update the specified test
     */
    public function update(UpdateTestRequest $request, Test $test): JsonResponse
    {
        $this->authorize('update', $test);

        $test->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Test başarıyla güncellendi',
            'data' => new TestResource($test->load(['user', 'questions'])),
        ]);
    }

    /**
     * Remove the specified test
     */
    public function destroy(Test $test): JsonResponse
    {
        $this->authorize('delete', $test);

        $test->delete();

        return response()->json([
            'success' => true,
            'message' => 'Test başarıyla silindi',
        ]);
    }

    /**
     * Duplicate a test
     */
    public function duplicate(Test $test): JsonResponse
    {
        $this->authorize('view', $test);

        $newTest = $test->replicate();
        $newTest->title = $test->title . ' (Kopya)';
        $newTest->user_id = auth()->id();
        $newTest->is_public = false;
        $newTest->download_count = 0;
        $newTest->save();

        // Duplicate questions
        foreach ($test->questions as $question) {
            $newQuestion = $question->replicate();
            $newQuestion->test_id = $newTest->id;
            $newQuestion->usage_count = 0;
            $newQuestion->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Test başarıyla kopyalandı',
            'data' => new TestResource($newTest->load(['user', 'questions'])),
        ], 201);
    }

    /**
     * Get public tests
     */
    public function public(Request $request): JsonResponse
    {
        $tests = Test::with(['user', 'questions'])
            ->public()
            ->when($request->lesson, function ($q, $lesson) {
                return $q->byLesson($lesson);
            })
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => TestResource::collection($tests->items()),
            'meta' => [
                'current_page' => $tests->currentPage(),
                'last_page' => $tests->lastPage(),
                'per_page' => $tests->perPage(),
                'total' => $tests->total(),
            ],
        ]);
    }

    /**
     * Upload PDF file
     */
    public function uploadPDF(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'pdf' => [
                'required',
                'file',
                'mimes:pdf',
                'max:' . (config('app.max_upload_size', 52428800) / 1024), // Convert bytes to KB
            ],
        ], [
            'pdf.required' => 'PDF dosyası zorunludur.',
            'pdf.file' => 'Yüklenen dosya geçerli bir dosya olmalıdır.',
            'pdf.mimes' => 'Sadece PDF dosyaları kabul edilir.',
            'pdf.max' => 'PDF dosyası çok büyük.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dosya yükleme hatası',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $file = $request->file('pdf');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('pdfs', $filename, 'public');

            return response()->json([
                'success' => true,
                'message' => 'PDF başarıyla yüklendi',
                'data' => [
                    'id' => uniqid('pdf_'),
                    'url' => Storage::url($path),
                    'path' => $path,
                    'filename' => $filename,
                    'size' => $file->getSize(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'PDF yüklenirken bir hata oluştu',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}