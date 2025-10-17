import React from 'react';

/**
 * Result Analysis Cards Component
 * Displays exam-level performance cards
 */

interface ExamAnalysis {
  title: string;
  participantCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

interface ResultAnalysisCardsProps {
  examAnalysis: ExamAnalysis[];
  getScoreColor: (score: number) => string;
}

export const ResultAnalysisCards: React.FC<ResultAnalysisCardsProps> = ({
  examAnalysis,
  getScoreColor
}) => {
  if (examAnalysis.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {examAnalysis.map((exam, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{exam.title}</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Katılımcı:</span>
              <span className="font-medium">{exam.participantCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Ortalama:</span>
              <span className={`font-medium ${getScoreColor(exam.averageScore)}`}>
                {exam.averageScore.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">En Yüksek:</span>
              <span className="font-medium text-green-600">{exam.highestScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">En Düşük:</span>
              <span className="font-medium text-red-600">{exam.lowestScore}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};