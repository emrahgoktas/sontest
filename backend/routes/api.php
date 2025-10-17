<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\BookletController;
use App\Http\Controllers\Api\OnlineExamController;
use App\Http\Controllers\Api\ProfileController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Public tests
Route::get('tests/public', [TestController::class, 'public']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('logout-all', [AuthController::class, 'logoutAll']);
    });

    // Test management routes
    Route::apiResource('tests', TestController::class);
    Route::post('tests/{test}/duplicate', [TestController::class, 'duplicate']);
    
    // Question management routes (nested under tests)
    Route::prefix('tests/{test}')->group(function () {
        Route::apiResource('questions', QuestionController::class);
        Route::post('questions/reorder', [QuestionController::class, 'reorder']);
        Route::delete('questions/bulk-delete', [QuestionController::class, 'bulkDelete']);
    });
    
    // Question image upload (standalone)
    Route::post('questions/upload-image', [QuestionController::class, 'uploadImage']);

    // PDF upload route
    Route::post('upload/pdf', [TestController::class, 'uploadPDF']);

    // Booklet management routes
    Route::apiResource('booklets', BookletController::class);
    Route::get('booklets/{booklet}/download', [BookletController::class, 'download']);
    Route::get('tests/{test}/booklets', [BookletController::class, 'byTest']);

    // Online exam management routes
    Route::apiResource('online-exams', OnlineExamController::class);
    Route::post('online-exams/{onlineExam}/start-session', [OnlineExamController::class, 'startSession']);
    Route::post('online-exams/{onlineExam}/submit-answers', [OnlineExamController::class, 'submitAnswers']);
    Route::get('online-exams/{onlineExam}/results', [OnlineExamController::class, 'results']);
    Route::patch('online-exams/{onlineExam}/toggle-status', [OnlineExamController::class, 'toggleStatus']);

    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('tests', [ProfileController::class, 'tests']);
        Route::get('questions', [ProfileController::class, 'questions']);
        Route::get('booklets', [ProfileController::class, 'booklets']);
        Route::get('online-exams', [ProfileController::class, 'onlineExams']);
        Route::get('results', [ProfileController::class, 'results']); // For students
        Route::get('statistics', [ProfileController::class, 'statistics']);
    });

    // Admin only routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Admin-specific endpoints can be added here
        Route::get('users', function () {
            return response()->json(['message' => 'Admin users endpoint']);
        });
        
        Route::get('dashboard-stats', function () {
            return response()->json(['message' => 'Admin dashboard stats endpoint']);
        });
    });
});

// Health check
Route::get('health', function () {
    return response()->json([
        'status' => 'OK',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0',
    ]);
});

// Student exam routes (public access for students)
Route::prefix('student')->group(function () {
    Route::get('exams', [OnlineExamController::class, 'getAvailableExams']);
    Route::get('exams/{examId}', [OnlineExamController::class, 'getExamForStudent']);
    Route::post('exams/{examId}/start', [OnlineExamController::class, 'startExamForStudent']);
    Route::put('exam-sessions/{examSession}/progress', [OnlineExamController::class, 'saveExamProgress']);
    Route::post('exam-sessions/{examSession}/submit', [OnlineExamController::class, 'submitExamForStudent']);
    Route::get('exam-sessions/{examSession}', [OnlineExamController::class, 'getExamSession']);
    Route::post('exam-sessions/{examSession}/pause', [OnlineExamController::class, 'pauseExamSession']);
    Route::post('exam-sessions/{examSession}/resume', [OnlineExamController::class, 'resumeExamSession']);
});