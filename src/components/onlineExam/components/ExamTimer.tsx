/**
 * Exam Timer Component
 * Displays remaining time with visual indicators
 */

import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface ExamTimerProps {
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
  className?: string;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
  timeRemaining,
  totalTime,
  className = ''
}) => {
  /**
   * Format time to HH:MM:SS or MM:SS
   */
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Get timer color based on remaining time
   */
  const getTimerColor = (): string => {
    const percentage = (timeRemaining / totalTime) * 100;
    
    if (percentage <= 10) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage <= 25) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  /**
   * Get progress bar color
   */
  const getProgressColor = (): string => {
    const percentage = (timeRemaining / totalTime) * 100;
    
    if (percentage <= 10) return 'bg-red-500';
    if (percentage <= 25) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const percentage = Math.max(0, (timeRemaining / totalTime) * 100);
  const isLowTime = percentage <= 25;

  return (
    <div className={`${className}`}>
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border ${getTimerColor()}`}>
        <div className="flex items-center space-x-2">
          {isLowTime ? (
            <AlertTriangle size={20} className="animate-pulse" />
          ) : (
            <Clock size={20} />
          )}
          <span className="font-mono text-lg font-semibold">
            {formatTime(timeRemaining)}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
      
      {isLowTime && (
        <p className="text-xs text-center mt-2 text-orange-600 animate-pulse">
          ⚠️ Süre azalıyor!
        </p>
      )}
    </div>
  );
};