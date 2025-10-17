/**
 * Online Exam Screen Component
 * Main interface for students taking online exams
 * Modular structure with separated concerns
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useOnlineExamScreen } from '../../hooks/useOnlineExamScreen';
import { ExamLoadingState } from './components/ExamLoadingState';
import { ExamErrorState } from './components/ExamErrorState';
import { ExamNotFoundState } from './components/ExamNotFoundState';
import { ExamResults } from './components/ExamResults';
import { ExamScreenHeader } from './components/ExamScreenHeader';
import { PDFDisplay } from './components/PDFDisplay';
import { AdvancedAnswerForm } from './components/AdvancedAnswerForm';
import { ExamProgress } from './components/ExamProgress';
import { ExamNavigation } from './components/ExamNavigation';
import { QuestionRenderer } from './components/QuestionRenderer';
import { ExamScreenFooter } from './components/ExamScreenFooter';
import { CompletionPrompt } from './components/CompletionPrompt';
import { ExitConfirmModal } from './components/ExitConfirmModal';

const OnlineExamScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    setState,
    session,
    timeRemaining,
    answers,
    getProgress,
    isQuestionAnswered,
    getQuestionAnswer,
    actions
  } = useOnlineExamScreen();

  // Show loading state
  if (state.isLoading) {
    return <ExamLoadingState />;
  }

  // Show error state
  if (state.error) {
    return (
      <ExamErrorState 
        error={state.error} 
        onReturnHome={() => navigate('/')} 
      />
    );
  }

  // Show exam results if completed
  if (state.examResult && state.examConfig) {
    return (
      <ExamResults
        result={state.examResult}
        config={state.examConfig}
        questions={state.questions}
        onReturnHome={() => navigate('/')}
      />
    );
  }

  // Show exam interface
  if (!state.examConfig || !session) {
    // If we have exam config but no session, show the exam with start button
    if (state.examConfig && !session) {
      return (
        <div className="min-h-screen bg-gray-50">
          <ExamScreenHeader
            examTitle={state.examConfig.title}
            currentQuestionIndex={0}
            totalQuestions={state.questions.length}
            timeRemaining={state.examConfig.timeLimit * 60}
            timeLimit={state.examConfig.timeLimit}
            onExitExam={() => navigate('/')}
          />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* PDF Display */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <PDFDisplay
                      pdfPages={state.pdfPages}
                      currentQuestionIndex={0}
                      questions={state.questions}
                      isCompleted={false}
                    />
                  </div>
                </div>
              </div>
              
              {/* Start Exam Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Sınav Başlat</h3>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p><strong>Soru Sayısı:</strong> {state.questions.length}</p>
                      <p><strong>Süre:</strong> {state.examConfig.timeLimit} dakika</p>
                    </div>
                    <Button
                      onClick={actions.startNewSession}
                      size="lg"
                      fullWidth
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Sınavı Başlat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return <ExamNotFoundState onReturnHome={() => navigate('/')} />;
  }

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const progress = getProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ExamScreenHeader
        examTitle={state.examConfig.title}
        currentQuestionIndex={state.currentQuestionIndex}
        totalQuestions={state.questions.length}
        timeRemaining={timeRemaining}
        timeLimit={state.examConfig.timeLimit}
        onExitExam={actions.handleExitExam}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - PDF Pages or Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Question Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {state.pdfPages.length > 0 ? 'Sınav Dökümanı' : `Soru ${state.currentQuestionIndex + 1}`}
                </h2>
                {state.pdfPages.length > 0 && (
                  <div className="text-sm text-gray-500">
                    {state.pdfPages.length} sayfa • {state.questions.length} soru
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className={state.pdfPages.length > 0 ? "" : "p-6"}>
                {state.pdfPages.length > 0 ? (
                  <PDFDisplay
                    pdfPages={state.pdfPages}
                    currentQuestionIndex={state.currentQuestionIndex}
                    questions={state.questions}
                    isCompleted={session.isCompleted}
                  />
                ) : (
                  currentQuestion && (
                    <QuestionRenderer
                      question={currentQuestion}
                      userAnswer={getQuestionAnswer(currentQuestion.id)}
                      onAnswerSelect={(answer) => actions.handleAnswerSelect(currentQuestion.id, answer)}
                      disabled={session.isCompleted}
                    />
                  )
                )}
              </div>

              {/* Footer Navigation */}
              {state.pdfPages.length === 0 && (
                <ExamScreenFooter
                  currentQuestionIndex={state.currentQuestionIndex}
                  totalQuestions={state.questions.length}
                  isSubmitting={state.isSubmitting}
                  onPrevious={() => actions.handleQuestionNavigation(state.currentQuestionIndex - 1)}
                  onNext={() => actions.handleQuestionNavigation(state.currentQuestionIndex + 1)}
                  onSubmitExam={actions.handleSubmitExam}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Answer Form and Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Progress Card */}
              <ExamProgress
                progress={progress}
                timeRemaining={timeRemaining}
                totalTime={state.examConfig.timeLimit * 60}
              />

              {/* Advanced Answer Form - 100 Questions Grid */}
              <AdvancedAnswerForm
                questions={state.questions}
                currentQuestionIndex={state.currentQuestionIndex}
                answers={answers}
                onAnswerSelect={actions.handleAnswerSelect}
                onQuestionNavigation={actions.handleQuestionNavigation}
                isCompleted={session.isCompleted}
              />

              currentQuestion ? (
              <ExamNavigation
                questions={state.questions}
                currentQuestionIndex={state.currentQuestionIndex}
                answers={answers}
                onQuestionSelect={actions.handleQuestionNavigation}
              />

              {/* Completion Prompt */}
              {progress.answeredQuestions === state.questions.length ? (
                <CompletionPrompt
                  isSubmitting={state.isSubmitting}
                  onSubmitExam={actions.handleSubmitExam}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <p>Soru içeriği yükleniyor...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <ExitConfirmModal
        isOpen={state.showExitConfirm}
        onCancel={() => setState(prev => ({ ...prev, showExitConfirm: false }))}
        onConfirm={actions.confirmExitExam}
      />
    </div>
  );
};

export default OnlineExamScreen;