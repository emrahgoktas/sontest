me_spent' => $answerData['timeSpent'] ?? 0,
                        'answered_at' => now(),
                    ]
                );
            }
        }

        // Complete the session
        $examSession->complete();

        // Calculate results
        $totalQuestions = $examSession->onlineExam->test->questions()->count();
        $correctAnswers = $examSession->studentAnswers()->where('is_correct', true)->count();
        $wrongAnswers = $examSession->studentAnswers()->where('is_correct', false)->where('selected_option', '!=', null)->count();
        $unansweredQuestions = $totalQuestions - $examSession->studentAnswers()->count();

        $result = [
            'sessionId' => $examSession->id,
            'examId' => $examSession->online_exam_id,
            'userId' => $examSession->student_id,
            'score' => $correctAnswers,
            'percentage' => $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 100 : 0,
            'totalQuestions' => $totalQuestions,
            'correctAnswers' => $correctAnswers,
            'wrongAnswers' => $wrongAnswers,
            'unansweredQuestions' => $unansweredQuestions,
            'timeSpent' => $examSession->completion_time ?? 0,
            'passed' => $examSession->percentage >= 60,
            'completedAt' => $examSession->completed_at,
            'questionResults' => $examSession->studentAnswers()->with('question')->get()->map(function ($answer) {
                return [
                    'questionId' => $answer->question_id,
                    'userAnswer' => $answer->selected_option,
                    'correctAnswer' => $answer->question->correct_answer,
                    'isCorrect' => $answer->is_correct,
                    'points' => $answer->is_correct ? 1 : 0,
                    'timeSpent' => $answer->time_spent,
                ];
            }),
        ];

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Get exam for student (public access)
     */
    public function getExamForStudent(string $examId): JsonResponse
    {
        try {
            // Find exam by ID (support both numeric and string IDs)
            $onlineExam = OnlineExam::with(['test.questions'])
                ->where('id', $examId)
                ->orWhere('id', 'like', "%{$examId}%")
                ->first();

            if (!$onlineExam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sınav bulunamadı',
                ], 404);
            }

            // Force auto-activate exam for testing
            $this->forceAutoActivateExam($onlineExam);

            // Check exam status
            $status = $onlineExam->getDetailedStatus();
            
            if (!$status['can_start']) {
                return response()->json([
                    'success' => false,
                    'message' => $this->getDetailedErrorMessage($status, $onlineExam),
                    'data' => [
                        'status' => $status,
                        'exam' => [
                            'id' => $onlineExam->id,
                            'title' => $onlineExam->title,
                            'description' => $onlineExam->description,
                        ]
                    ]
                ], 403);
            }

            // Get questions
            $questions = $onlineExam->test->questions()->orderBy('order_index')->get();
            
            // Transform questions to frontend format
            $transformedQuestions = $questions->map(function ($question) {
                return [
                    'id' => $question->id,
                    'type' => 'multiple-choice',
                    'text' => $question->question_text ?: 'Soru metni mevcut değil',
                    'options' => $question->options ?: [
                        'A' => 'Seçenek A',
                        'B' => 'Seçenek B', 
                        'C' => 'Seçenek C',
                        'D' => 'Seçenek D',
                        'E' => 'Seçenek E'
                    ],
                    'correctAnswer' => $question->correct_answer,
                    'points' => 1,
                    'order' => $question->order_index
                ];
            });

            // Get PDF pages
            $pdfPages = $this->getPDFPagesForExam($onlineExam);

            return response()->json([
                'success' => true,
                'data' => [
                    'config' => [
                        'id' => $onlineExam->id,
                        'title' => $onlineExam->title,
                        'description' => $onlineExam->description,
                        'timeLimit' => $onlineExam->time_limit ?: 60,
                        'totalQuestions' => $questions->count(),
                        'totalPoints' => $questions->count(),
                        'passingScore' => 60,
                        'shuffleQuestions' => $onlineExam->shuffle_questions,
                        'allowReview' => $onlineExam->allow_review,
                        'showResults' => $onlineExam->show_results,
                        'canStart' => true,
                        'status' => $status
                    ],
                    'questions' => $transformedQuestions,
                    'pdfPages' => $pdfPages
                ]
            ]);

        } catch (Exception $e) {
            \Log::error("Error in getExamForStudent: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Sınav yüklenirken hata oluştu: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Start exam for student (public access)
     */
    public function startExamForStudent(string $examId): JsonResponse
    {
        try {
            // Find exam
            $onlineExam = OnlineExam::findOrFail($examId);
            
            // Mock student ID for demo
            $studentId = 99999;
            
            // Check if session already exists
            $existingSession = ExamSession::where('online_exam_id', $onlineExam->id)
                ->where('student_id', $studentId)
                ->first();
                
            if ($existingSession) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => $existingSession->id,
                        'examId' => $existingSession->online_exam_id,
                        'studentId' => $existingSession->student_id,
                        'startTime' => $existingSession->started_at,
                        'currentQuestionIndex' => $existingSession->current_question_index,
                        'timeRemaining' => $onlineExam->time_limit ? 
                            max(0, ($onlineExam->time_limit * 60) - $existingSession->started_at->diffInSeconds(now())) : 0,
                        'isCompleted' => $existingSession->is_completed,
                        'answers' => []
                    ]
                ]);
            }
            
            // Create new session
            $session = ExamSession::create([
                'online_exam_id' => $onlineExam->id,
                'student_id' => $studentId,
                'started_at' => now(),
                'current_question_index' => 0,
                'is_completed' => false
            ]);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $session->id,
                    'examId' => $session->online_exam_id,
                    'studentId' => $session->student_id,
                    'startTime' => $session->started_at,
                    'currentQuestionIndex' => 0,
                    'timeRemaining' => $onlineExam->time_limit ? $onlineExam->time_limit * 60 : 0,
                    'isCompleted' => false,
                    'answers' => []
                ]
            ]);
            
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sınav oturumu başlatılamadı: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get exam session
     */
    public function getExamSession(ExamSession $examSession): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $examSession->id,
                'examId' => $examSession->online_exam_id,
                'studentId' => $examSession->student_id,
                'startTime' => $examSession->started_at,
                'endTime' => $examSession->completed_at,
                'currentQuestionIndex' => $examSession->current_question_index,
                'answers' => [],
                'timeRemaining' => $examSession->onlineExam->time_limit ? 
                    max(0, ($examSession->onlineExam->time_limit * 60) - $examSession->started_at->diffInSeconds(now())) : 0,
                'isCompleted' => $examSession->is_completed,
                'isPaused' => false,
            ],
        ]);
    }

    /**
     * Pause exam session
     */
    public function pauseExamSession(ExamSession $examSession): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Sınav duraklatıldı',
        ]);
    }

    /**
     * Resume exam session
     */
    public function resumeExamSession(ExamSession $examSession): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Sınav devam ettirildi',
        ]);
    }

    /**
     * Get detailed error message for exam status
     */
    private function getDetailedErrorMessage(array $status, OnlineExam $exam): string
    {
        switch ($status['status']) {
            case 'inactive':
                return 'Bu sınav henüz aktifleştirilmemiş. Lütfen öğretmeninizle iletişime geçin.';
            case 'not_started':
                $startDate = $exam->start_date ? $exam->start_date->format('d.m.Y H:i') : 'Belirtilmemiş';
                return "Sınav henüz başlamamış. Başlangıç zamanı: {$startDate}";
            case 'expired':
                $endDate = $exam->end_date ? $exam->end_date->format('d.m.Y H:i') : 'Belirtilmemiş';
                return "Sınav süresi dolmuş. Bitiş zamanı: {$endDate}";
            default:
                return $status['message'];
        }
    }

    /**
     * Force auto-activate exam based on current time (enhanced version)
     */
    private function forceAutoActivateExam(OnlineExam $exam): void
    {
        $now = now();
        
        // If exam has start date and it's time to start, force activate
        if ($exam->start_date && $now >= $exam->start_date && !$exam->is_active) {
            $exam->update(['is_active' => true]);
            \Log::info("Auto-activated exam {$exam->id} at {$now}");
        }
        
        // If exam has end date and it's past end time, force deactivate
        if ($exam->end_date && $now > $exam->end_date && $exam->is_active) {
            $exam->update(['is_active' => false]);
            \Log::info("Auto-deactivated exam {$exam->id} at {$now}");
        }
        
        // If no dates are set, ensure exam is active for immediate testing
        if (!$exam->start_date && !$exam->end_date && !$exam->is_active) {
            $exam->update(['is_active' => true]);
            \Log::info("Force-activated exam {$exam->id} (no dates set)");
        }
    }

    /**
     * Get PDF pages for exam (mock implementation)
     */
    private function getPDFPagesForExam(OnlineExam $onlineExam): array
    {
        // First check if there's a real PDF uploaded for this exam
        $realPdfPath = storage_path("app/public/pdfs/exam_{$onlineExam->id}.pdf");
        
        if (file_exists($realPdfPath)) {
            // Return real PDF as base64 data URL for direct display
            try {
                $pdfContent = file_get_contents($realPdfPath);
                $base64Pdf = base64_encode($pdfContent);
                
                // Split PDF into pages if needed (for now return as single page)
                // In a real implementation, you would use a PDF library to split pages
                return ["data:application/pdf;base64,{$base64Pdf}"];
            } catch (Exception $e) {
                \Log::warning("Failed to load real PDF for exam {$onlineExam->id}: " . $e->getMessage());
                \Log::warning("Failed to load PDF for exam {$onlineExam->id}: " . $e->getMessage());
        }
        
        
        // Check if test has uploaded PDF files in storage/app/public/pdfs/
        $publicPdfPath = public_path("storage/pdfs");
        if (is_dir($publicPdfPath)) {
            $pdfFiles = glob($publicPdfPath . "/*.pdf");
            if (!empty($pdfFiles)) {
                // Use the most recent PDF file
                $latestPdf = end($pdfFiles);
                try {
                    $pdfContent = file_get_contents($latestPdf);
                    $base64Pdf = base64_encode($pdfContent);
                    \Log::info("Using uploaded PDF file: " . basename($latestPdf));
                    return ["data:application/pdf;base64,{$base64Pdf}"];
                } catch (Exception $e) {
                    \Log::warning("Failed to load uploaded PDF: " . $e->getMessage());
                }
            }
        }
        // Check if test has uploaded PDF file
        // Fallback to generated SVG pages
        $pdfPages = [];
        
        $questionCount = $onlineExam->test->questions()->count();
        
        // Calculate pages needed: 8 questions per page (2 columns x 4 rows)
        $questionsPerPage = 8;
        $pagesNeeded = max(1, ceil($questionCount / $questionsPerPage));
        
        for ($i = 1; $i <= $pagesNeeded; $i++) {
            $startQuestion = ($i - 1) * $questionsPerPage + 1;
            $endQuestion = min($i * $questionsPerPage, $questionCount);
            $pdfPages[] = "data:image/svg+xml;base64," . base64_encode(
                $this->generateMockPDFPage($i, $onlineExam, $startQuestion, $endQuestion)
            );
        }
        
        return $pdfPages;
    }

    /**
     * Generate mock PDF page content
     */
    private function generateMockPDFPage(int $pageNumber, OnlineExam $onlineExam, int $startQuestion, int $endQuestion): string
    {
        $title = htmlspecialchars($onlineExam->title);
        $description = htmlspecialchars($onlineExam->description ?: 'Online Sınav');
        $questionRange = "Sorular {$startQuestion}-{$endQuestion}";
        
        return "
        <svg width='595' height='842' xmlns='http://www.w3.org/2000/svg'>
            <rect width='100%' height='100%' fill='white'/>
            <rect x='20' y='20' width='555' height='802' fill='none' stroke='#e5e5e5' stroke-width='1'/>
            
            <!-- Header -->
            <text x='297.5' y='60' text-anchor='middle' font-family='Arial' font-size='18' font-weight='bold' fill='#333'>
                {$title}
            </text>
            <text x='297.5' y='80' text-anchor='middle' font-family='Arial' font-size='12' fill='#666'>
                {$description} - Sayfa {$pageNumber} ({$questionRange})
            </text>
            
            <!-- Question Grid (2 columns x 4 rows) -->
            " . $this->generateQuestionGrid($startQuestion, $endQuestion) . "
            
            <!-- Footer -->
            <text x='297.5' y='820' text-anchor='middle' font-family='Arial' font-size='10' fill='#999'>
                Sayfa {$pageNumber}
            </text>
        </svg>";
    }

    /**
     * Generate question grid for PDF page
     */
    private function generateQuestionGrid(int $startQuestion, int $endQuestion): string
    {
        $grid = '';
        $questionsPerRow = 2;
        $rowHeight = 160;
        $colWidth = 250;
        $startY = 120;
        $startX = 50;
        
        for ($q = $startQuestion; $q <= $endQuestion; $q++) {
            $row = floor(($q - $startQuestion) / $questionsPerRow);
            $col = ($q - $startQuestion) % $questionsPerRow;
            
            $x = $startX + ($col * $colWidth);
            $y = $startY + ($row * $rowHeight);
            
            // Question box
            $grid .= "
            <rect x='{$x}' y='{$y}' width='240' height='150' fill='#f8f9fa' stroke='#dee2e6' stroke-width='1'/>
            
            <!-- Question number -->
            <text x='" . ($x + 10) . "' y='" . ($y + 20) . "' font-family='Arial' font-size='14' font-weight='bold' fill='#333'>
                {$q}.
            </text>
            
            <!-- Question content area -->
            <rect x='" . ($x + 10) . "' y='" . ($y + 30) . "' width='220' height='80' fill='white' stroke='#e9ecef' stroke-width='1'/>
            <text x='" . ($x + 120) . "' y='" . ($y + 75) . "' text-anchor='middle' font-family='Arial' font-size='12' fill='#6c757d'>
                Soru İçeriği
            </text>
            
            <!-- Answer options -->
            <text x='" . ($x + 10) . "' y='" . ($y + 130) . "' font-family='Arial' font-size='12' fill='#495057'>
                A) ___  B) ___  C) ___  D) ___  E) ___
            </text>
            ";
        }
        
        return $grid;
    }
}