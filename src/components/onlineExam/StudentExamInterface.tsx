import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { CroppedQuestion } from '../../types';
import { OnlineExamConfig, OnlineExamSession, StudentAnswer } from '../../types/booklet';

/**
 * Öğrenci Sınav Arayüzü
 * İki sütunlu responsive tasarım ile online sınav deneyimi
 */

interface StudentExamInterfaceProps {
  examConfig: OnlineExamConfig;
  questions: CroppedQuestion[];
  onSubmitExam: (session: OnlineExamSession) => void;
}

export const StudentExamInterface: React.FC<StudentExamInterfaceProps> = ({
  examConfig,
  questions,
  onSubmitExam
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(examConfig.timeLimit ? examConfig.timeLimit * 60 : 0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showAnswerForm, setShowAnswerForm] = useState(true);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  /**
   * Zamanlayıcı
   */
  useEffect(() => {
    if (!examConfig.timeLimit || timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted, examConfig.timeLimit]);

  /**
   * Cevap seçme
   */
  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  /**
   * Soru işaretleme
   */
  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  /**
   * Soru değiştirme
   */
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  /**
   * Sınavı bitirme
   */
  const handleSubmitExam = () => {
    if (isSubmitted) return;

    const studentAnswers: StudentAnswer[] = questions.map(question => ({
      questionId: question.id,
      selectedOption: answers[question.id] || '',
      isCorrect: answers[question.id] === question.correctAnswer,
      timeSpent: 0, // Mock value
      answeredAt: new Date()
    }));

    const session: OnlineExamSession = {
      id: `session_${Date.now()}`,
      examId: examConfig.id,
      studentId: 'student_123', // Mock student ID
      studentName: 'Test Öğrencisi', // Mock student name
      answers: studentAnswers,
      startTime: new Date(Date.now() - (examConfig.timeLimit ? examConfig.timeLimit * 60 * 1000 : 0)),
      endTime: new Date(),
      score: studentAnswers.filter(a => a.isCorrect).length,
      isCompleted: true,
      currentQuestionIndex
    };

    setIsSubmitted(true);
    onSubmitExam(session);
  };

  /**
   * Zaman formatı
   */
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sınav Tamamlandı!
          </h2>
          <p className="text-gray-600 mb-4">
            Cevaplarınız başarıyla kaydedildi.
          </p>
          {examConfig.showResults && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>Doğru Cevap:</strong> {answers && Object.values(answers).filter((answer, index) => answer === questions[index]?.correctAnswer).length} / {totalQuestions}
              </p>
              <p className="text-blue-800 mt-2">
                <strong>Başarı Oranı:</strong> {Math.round((Object.values(answers).filter((answer, index) => answer === questions[index]?.correctAnswer).length / totalQuestions) * 100)}%
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {examConfig.title}
              </h1>
              <p className="text-sm text-gray-500">
                Soru {currentQuestionIndex + 1} / {totalQuestions}
              </p>
            </div>
            
            {examConfig.timeLimit && timeRemaining > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Clock size={16} className="text-blue-600" />
                <span className={`font-mono text-sm ${
                  timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnswerForm(!showAnswerForm)}
              className="md:hidden"
            >
              {showAnswerForm ? 'Cevap Formunu Gizle' : 'Cevap Formunu Göster'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Ana İçerik - Soru */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Soru Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Soru {currentQuestionIndex + 1}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Flag}
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={flaggedQuestions.has(currentQuestion.id) ? 'text-red-600' : 'text-gray-400'}
                >
                  İşaretle
                </Button>
              </div>

              {/* Soru Görseli */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <img
                    src={currentQuestion.imageData}
                    alt={`Soru ${currentQuestionIndex + 1}`}
                    className="max-w-full max-h-96 object-contain mx-auto rounded"
                  />
                </div>
              </div>

              {/* Navigasyon Butonları */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  icon={ChevronLeft}
                >
                  Önceki
                </Button>

                <div className="flex space-x-3">
                  {currentQuestionIndex === totalQuestions - 1 ? (
                    <Button
                      onClick={handleSubmitExam}
                      variant="secondary"
                    >
                      Sınavı Bitir
                    </Button>
                  ) : (
                    <Button
                      onClick={() => goToQuestion(currentQuestionIndex + 1)}
                      icon={ChevronRight}
                      iconPosition="right"
                    >
                      Sonraki
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Panel - Sürekli Görünür Cevap Formu */}
          <div className={`lg:col-span-1 ${showAnswerForm ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
              <h3 className="font-medium text-gray-900 mb-4">Cevap Formu</h3>
              
              {/* Süre Göstergesi */}
              {examConfig.timeLimit && timeRemaining > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-blue-700">Kalan Süre:</span>
                    <span className={`font-mono font-bold ${
                      timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        timeRemaining < 300 ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.max(0, (timeRemaining / (examConfig.timeLimit * 60)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Mevcut Soru Cevap Seçenekleri */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Soru {currentQuestionIndex + 1} Cevabı:
                </h4>
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D', 'E'].map(option => (
                    <label
                      key={option}
                      className={`
                        flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all
                        ${answers[currentQuestion.id] === option
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => selectAnswer(currentQuestion.id, option)}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Soru Navigasyon Grid */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Soru Navigasyonu:</h4>
                <div className="grid grid-cols-5 gap-1">
                  {questions.map((question, index) => {
                    const isAnswered = answers[question.id];
                    const isCurrent = index === currentQuestionIndex;
                    const isFlagged = flaggedQuestions.has(question.id);
                    
                    return (
                      <button
                        key={question.id}
                        onClick={() => goToQuestion(index)}
                        className={`
                          relative w-8 h-8 rounded text-xs font-medium transition-all duration-200
                          ${isCurrent
                            ? 'bg-blue-500 text-white'
                            : isAnswered
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {index + 1}
                        {isFlagged && (
                          <Flag size={6} className="absolute -top-1 -right-1 text-red-500 fill-current" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* İstatistikler */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {Object.keys(answers).length}
                    </div>
                    <div className="text-gray-600">Cevaplanmış</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-600">
                      {totalQuestions - Object.keys(answers).length}
                    </div>
                    <div className="text-gray-600">Kalan</div>
                  </div>
                </div>
                
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(Object.keys(answers).length / totalQuestions) * 100}%` 
                    }}
                  ></div>
                </div>
                
                <div className="mt-2 text-center text-xs text-gray-500">
                  %{Math.round((Object.keys(answers).length / totalQuestions) * 100)} tamamlandı
                </div>
              </div>

              {/* Sınavı Bitir Butonu */}
              {Object.keys(answers).length === totalQuestions && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleSubmitExam}
                    fullWidth
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Sınavı Tamamla
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};