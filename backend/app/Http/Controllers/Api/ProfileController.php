<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TestResource;
use App\Http\Resources\QuestionResource;
use App\Http\Resources\BookletResource;
use App\Http\Resources\OnlineExamResource;
use App\Http\Resources\ExamSessionResource;
use App\Models\Test;
use App\Models\Question;
use App\Models\Booklet;
use App\Models\OnlineExam;
use App\Models\ExamSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Get user's tests
     */
    public function tests(Request $request): JsonResponse
    {
        $tests = Test::with(['questions'])
            ->where('user_id', $request->user()->id)
            ->when($request->search, function ($q, $search) {
                return $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->lesson, function ($q, $lesson) {
                return $q->where('lesson', $lesson);
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
     * Get user's questions
     */
    public function questions(Request $request): JsonResponse
    {
        $questions = Question::whereHas('test', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->with(['test'])
            ->when($request->search, function ($q, $search) {
                return $q->where('question_text', 'like', "%{$search}%");
            })
            ->when($request->difficulty, function ($q, $difficulty) {
                return $q->where('difficulty', $difficulty);
            })
            ->when($request->subject, function ($q, $subject) {
                return $q->where('subject', $subject);
            })
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => QuestionResource::collection($questions->items()),
            'meta' => [
                'current_page' => $questions->currentPage(),
                'last_page' => $questions->lastPage(),
                'per_page' => $questions->perPage(),
                'total' => $questions->total(),
            ],
        ]);
    }

    /**
     * Get user's booklets
     */
    public function booklets(Request $request): JsonResponse
    {
        $booklets = Booklet::whereHas('test', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->with(['test'])
            ->when($request->search, function ($q, $search) {
                return $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('test', function ($testQuery) use ($search) {
                        $testQuery->where('title', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => BookletResource::collection($booklets->items()),
            'meta' => [
                'current_page' => $booklets->currentPage(),
                'last_page' => $booklets->lastPage(),
                'per_page' => $booklets->perPage(),
                'total' => $booklets->total(),
            ],
        ]);
    }

    /**
     * Get user's online exams
     */
    public function onlineExams(Request $request): JsonResponse
    {
        $exams = OnlineExam::with(['test'])
            ->where('user_id', $request->user()->id)
            ->when($request->search, function ($q, $search) {
                return $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->is_active !== null, function ($q) use ($request) {
                return $q->where('is_active', $request->boolean('is_active'));
            })
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => OnlineExamResource::collection($exams->items()),
            'meta' => [
                'current_page' => $exams->currentPage(),
                'last_page' => $exams->lastPage(),
                'per_page' => $exams->perPage(),
                'total' => $exams->total(),
            ],
        ]);
    }

    /**
     * Get user's exam results (for students)
     */
    public function results(Request $request): JsonResponse
    {
        if (!$request->user()->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'Bu endpoint sadece öğrenciler için geçerlidir',
            ], 403);
        }

        $sessions = ExamSession::with(['onlineExam.test', 'studentAnswers.question'])
            ->where('student_id', $request->user()->id)
            ->where('is_completed', true)
            ->when($request->search, function ($q, $search) {
                return $q->whereHas('onlineExam', function ($examQuery) use ($search) {
                    $examQuery->where('title', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => ExamSessionResource::collection($sessions->items()),
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
            ],
        ]);
    }

    /**
     * Get user statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();
        $stats = [];

        if ($user->isTeacher()) {
            $stats = [
                'tests_created' => $user->tests()->count(),
                'questions_archived' => Question::whereHas('test', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->count(),
                'booklets_generated' => Booklet::whereHas('test', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->count(),
                'online_exams_created' => $user->onlineExams()->count(),
                'total_students' => ExamSession::whereHas('onlineExam', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->distinct('student_id')->count(),
                'storage_used' => 0, // Calculate based on uploaded files
                'storage_limit' => $this->getStorageLimit($user->plan_type),
            ];
        } elseif ($user->isStudent()) {
            $stats = [
                'exams_taken' => $user->examSessions()->where('is_completed', true)->count(),
                'average_score' => $user->examSessions()->where('is_completed', true)->avg('percentage') ?? 0,
                'total_questions_answered' => $user->examSessions()
                    ->where('is_completed', true)
                    ->sum('correct_answers') + $user->examSessions()
                    ->where('is_completed', true)
                    ->sum('wrong_answers'),
                'best_score' => $user->examSessions()->where('is_completed', true)->max('percentage') ?? 0,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get storage limit based on plan type
     */
    private function getStorageLimit(string $planType): int
    {
        return match ($planType) {
            'free' => 100, // 100MB
            'pro' => 5000, // 5GB
            'premium' => 20000, // 20GB
            default => 100,
        };
    }
}