/**
 * Exam Results Component
 * Displays detailed exam results and performance analysis
 */

import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Award, BarChart3, Download, Home } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ExamResult, ExamConfig, Question } from '../../../types/onlineExam';

interface ExamResultsProps {
  result: ExamResult;
  config: ExamConfig;
  questions: Question[];
  onReturnHome: () => void;
}

export const ExamResults: React.FC<ExamResultsProps> = ({
  result,
  config,
  questions,
  onReturnHome
}) => {
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  /**
   * Get performance level
   */
  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { label: 'Mükemmel', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 80) return { label: 'Çok İyi', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 70) return { label: 'İyi', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (percentage >= 60) return { label: 'Orta', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { label: 'Geliştirilmeli', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  /**
   * Format time
   */
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours} saat ${mins} dakika`;
    }
    return `${mins} dakika`;
  };

  /**
   * Get question by ID
   */
  const getQuestionById = (questionId: string) => {
    return questions.find(q => q.id === questionId);
  };

  const performance = getPerformanceLevel(result.percentage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${performance.bgColor} mb-4`}>
              {result.passed ? (
                <Award className={`w-8 h-8 ${performance.color}`} />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sınav Tamamlandı!
            </h1>
            <p className="text-lg text-gray-600">
              {config.title} sınavı başarıyla tamamlandı
            </p>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-6xl font-bold text-gray-900">
                  {result.percentage}%
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${performance.bgColor} ${performance.color}`}>
                  {performance.label}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.correctAnswers}</div>
                  <div className="text-sm text-gray-600">Doğru</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{result.wrongAnswers}</div>
                  <div className="text-sm text-gray-600">Yanlış</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{result.unansweredQuestions}</div>
                  <div className="text-sm text-gray-600">Boş</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.score}</div>
                  <div className="text-sm text-gray-600">Puan</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pass/Fail Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                {result.passed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {result.passed ? 'Başarılı' : 'Başarısız'}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Geçme Puanı:</span>
                  <span className="font-medium">{config.passingScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aldığınız Puan:</span>
                  <span className={`font-medium ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {result.percentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fark:</span>
                  <span className={`font-medium ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {result.passed ? '+' : ''}{(result.percentage - config.passingScore).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Time Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Süre İstatistikleri</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Süre:</span>
                  <span className="font-medium">{formatTime(config.timeLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kullanılan Süre:</span>
                  <span className="font-medium">{formatTime(result.timeSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama/Soru:</span>
                  <span className="font-medium">
                    {Math.round((result.timeSpent * 60) / result.totalQuestions)} saniye
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tamamlanma:</span>
                  <span className="font-medium">
                    {new Date(result.completedAt).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Results Toggle */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detaylı Sonuçlar</h3>
              <Button
                variant="outline"
                onClick={() => setShowDetailedResults(!showDetailedResults)}
                icon={BarChart3}
              >
                {showDetailedResults ? 'Gizle' : 'Göster'}
              </Button>
            </div>

            {showDetailedResults && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {result.questionResults.map((questionResult, index) => {
                    const question = getQuestionById(questionResult.questionId);
                    if (!question) return null;

                    return (
                      <div
                        key={questionResult.questionId}
                        className={`p-4 rounded-lg border-2 ${
                          questionResult.isCorrect
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              Soru {index + 1}
                            </span>
                            {questionResult.isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {questionResult.points} puan
                          </div>
                        </div>
                        
                        <p className="text-gray-900 mb-3">{question.text}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Verdiğiniz Cevap:</span>
                            <div className={`font-medium ${questionResult.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              {String(questionResult.userAnswer)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Doğru Cevap:</span>
                            <div className="font-medium text-green-600">
                              {String(questionResult.correctAnswer)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={onReturnHome}
              icon={Home}
              size="lg"
            >
              Ana Sayfaya Dön
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.print()}
              icon={Download}
              size="lg"
            >
              Sonuçları Yazdır
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};