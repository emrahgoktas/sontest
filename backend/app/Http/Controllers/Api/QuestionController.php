<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Http\Requests\UploadQuestionImageRequest;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use App\Models\Test;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class QuestionController extends Controller
{
    /**
     * Display questions for a test
     */
    public function index(Test $test): JsonResponse
    {
        $this->authorize('view', $test);

        $questions = $test->questions()->orderBy('order_index')->get();

        return response()->json([
            'success' => true,
            'data' => QuestionResource::collection($questions),
        ]);
    }

    /**
     * Store a newly created question
     */
    public function store(StoreQuestionRequest $request, Test $test): JsonResponse
    {
        $this->authorize('update', $test);

        $question = $test->questions()->create([
            'question_text' => $request->question_text,
            'image_data' => $request->image_data,
            'options' => $request->options,
            'correct_answer' => $request->correct_answer,
            'explanation' => $request->explanation,
            'order_index' => $request->order_index ?? $test->questions()->count(),
            'crop_area' => $request->crop_area,
            'actual_width' => $request->actual_width,
            'actual_height' => $request->actual_height,
            'question_type' => $request->question_type ?? 'manual',
            'difficulty' => $request->difficulty,
            'subject' => $request->subject,
            'tags' => $request->tags ?? [],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Soru başarıyla eklendi',
            'data' => new QuestionResource($question),
        ], 201);
    }

    /**
     * Display the specified question
     */
    public function show(Test $test, Question $question): JsonResponse
    {
        $this->authorize('view', $test);

        if ($question->test_id !== $test->id) {
            return response()->json([
                'success' => false,
                'message' => 'Soru bu teste ait değil',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new QuestionResource($question),
        ]);
    }

    /**
     * Update the specified question
     */
    public function update(UpdateQuestionRequest $request, Test $test, Question $question): JsonResponse
    {
        $this->authorize('update', $test);

        if ($question->test_id !== $test->id) {
            return response()->json([
                'success' => false,
                'message' => 'Soru bu teste ait değil',
            ], 404);
        }

        $question->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Soru başarıyla güncellendi',
            'data' => new QuestionResource($question),
        ]);
    }

    /**
     * Remove the specified question
     */
    public function destroy(Test $test, Question $question): JsonResponse
    {
        $this->authorize('update', $test);

        if ($question->test_id !== $test->id) {
            return response()->json([
                'success' => false,
                'message' => 'Soru bu teste ait değil',
            ], 404);
        }

        // Delete image file if exists
        if ($question->image_path && Storage::exists($question->image_path)) {
            Storage::delete($question->image_path);
        }

        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Soru başarıyla silindi',
        ]);
    }

    /**
     * Upload question image
     */
    public function uploadImage(UploadQuestionImageRequest $request): JsonResponse
    {
        $file = $request->file('image');
        $path = $file->store('questions', 'public');

        return response()->json([
            'success' => true,
            'message' => 'Görsel başarıyla yüklendi',
            'data' => [
                'path' => $path,
                'url' => Storage::url($path),
            ],
        ]);
    }

    /**
     * Reorder questions
     */
    public function reorder(Request $request, Test $test): JsonResponse
    {
        $this->authorize('update', $test);

        $request->validate([
            'questions' => 'required|array',
            'questions.*.id' => 'required|exists:questions,id',
            'questions.*.order_index' => 'required|integer|min:0',
        ]);

        foreach ($request->questions as $questionData) {
            Question::where('id', $questionData['id'])
                ->where('test_id', $test->id)
                ->update(['order_index' => $questionData['order_index']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Soru sırası başarıyla güncellendi',
        ]);
    }

    /**
     * Bulk delete questions
     */
    public function bulkDelete(Request $request, Test $test): JsonResponse
    {
        $this->authorize('update', $test);

        $request->validate([
            'question_ids' => 'required|array',
            'question_ids.*' => 'exists:questions,id',
        ]);

        $questions = Question::whereIn('id', $request->question_ids)
            ->where('test_id', $test->id)
            ->get();

        foreach ($questions as $question) {
            if ($question->image_path && Storage::exists($question->image_path)) {
                Storage::delete($question->image_path);
            }
            $question->delete();
        }

        return response()->json([
            'success' => true,
            'message' => count($questions) . ' soru başarıyla silindi',
        ]);
    }
}