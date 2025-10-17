/**
 * Online Exam Utilities
 * Helper functions for online exam functionality
 */

/**
 * Format time display
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate exam progress percentage
 */
export const calculateProgress = (answeredCount: number, totalQuestions: number): number => {
  if (totalQuestions === 0) return 0;
  return Math.round((answeredCount / totalQuestions) * 100);
};

/**
 * Get performance level based on score
 */
export const getPerformanceLevel = (percentage: number) => {
  if (percentage >= 90) return { label: 'Mükemmel', color: 'text-green-600', bgColor: 'bg-green-100' };
  if (percentage >= 80) return { label: 'Çok İyi', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  if (percentage >= 70) return { label: 'İyi', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  if (percentage >= 60) return { label: 'Orta', color: 'text-orange-600', bgColor: 'bg-orange-100' };
  return { label: 'Geliştirilmeli', color: 'text-red-600', bgColor: 'bg-red-100' };
};

/**
 * Validate exam session
 */
export const validateExamSession = (session: any, examConfig: any): boolean => {
  if (!session || !examConfig) return false;
  if (session.isCompleted) return false;
  if (examConfig.timeLimit && session.timeRemaining <= 0) return false;
  return true;
};

/**
 * Generate exam session ID
 */
export const generateSessionId = (examId: string, userId: string): string => {
  return `session_${examId}_${userId}_${Date.now()}`;
};

/**
 * Get answer display value
 */
export const getAnswerDisplayValue = (answer: string | boolean | string[]): string => {
  if (typeof answer === 'boolean') {
    return answer ? 'Doğru' : 'Yanlış';
  }
  if (Array.isArray(answer)) {
    return answer.join(', ');
  }
  return String(answer);
};

/**
 * Check if exam is currently active
 */
export const isExamActive = (examConfig: any): boolean => {
  if (!examConfig.isActive) return false;
  
  const now = new Date();
  if (examConfig.startDate && now < new Date(examConfig.startDate)) return false;
  if (examConfig.endDate && now > new Date(examConfig.endDate)) return false;
  
  return true;
};

/**
 * Calculate remaining time
 */
export const calculateRemainingTime = (startTime: Date, timeLimit: number): number => {
  const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
  const totalTime = timeLimit * 60; // Convert minutes to seconds
  return Math.max(0, totalTime - elapsed);
};