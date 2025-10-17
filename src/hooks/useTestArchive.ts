import { useState, useEffect } from 'react';
import { ArchivedTest, ArchivedQuestion } from '../types/booklet';
import { TestMetadata, CroppedQuestion } from '../types';

/**
 * Test ve Soru Arşivi Yönetimi Hook'u
 * Mock verilerle test arşivi işlemleri
 */

export const useTestArchive = () => {
  const [archivedTests, setArchivedTests] = useState<ArchivedTest[]>([]);
  const [archivedQuestions, setArchivedQuestions] = useState<ArchivedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Mock arşiv verilerini yükleme
   */
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock archived tests
    const mockTests: ArchivedTest[] = [
      {
        id: 'test_1',
        name: 'Matematik 1. Dönem Sınavı',
        metadata: {
          testName: 'Matematik 1. Dönem Sınavı',
          className: '10-A',
          courseName: 'Matematik',
          teacherName: 'Ahmet Öğretmen',
          questionSpacing: 5
        },
        questions: [],
        theme: 'classic',
        createdAt: new Date('2024-01-15'),
        tags: ['matematik', '10.sınıf', 'dönem sınavı']
      },
      {
        id: 'test_2',
        name: 'Türkçe Deneme Sınavı',
        metadata: {
          testName: 'Türkçe Deneme Sınavı',
          className: '11-B',
          courseName: 'Türkçe',
          teacherName: 'Ayşe Öğretmen',
          questionSpacing: 5
        },
        questions: [],
        theme: 'deneme-sinavi',
        createdAt: new Date('2024-01-10'),
        tags: ['türkçe', '11.sınıf', 'deneme']
      }
    ];

    // Mock archived questions
    const mockQuestions: ArchivedQuestion[] = [
      {
        id: 'q_1',
        originalQuestionId: 'question_1',
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        correctAnswer: 'A',
        tags: ['matematik', 'geometri'],
        sourceTest: 'test_1',
        pageNumber: 1,
        createdAt: new Date('2024-01-15'),
        usageCount: 2
      },
      {
        id: 'q_2',
        originalQuestionId: 'question_2',
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        correctAnswer: 'B',
        tags: ['türkçe', 'anlam'],
        sourceTest: 'test_2',
        pageNumber: 2,
        createdAt: new Date('2024-01-10'),
        usageCount: 1
      }
    ];

    setArchivedTests(mockTests);
    setArchivedQuestions(mockQuestions);
  };

  /**
   * Test arşive kaydetme
   */
  const saveTest = async (
    metadata: TestMetadata,
    questions: CroppedQuestion[],
    theme: string,
    tags: string[] = []
  ): Promise<ArchivedTest> => {
    setIsLoading(true);

    try {
      const newTest: ArchivedTest = {
        id: `test_${Date.now()}`,
        name: metadata.testName || 'Yeni Test',
        metadata,
        questions,
        theme: theme as any,
        createdAt: new Date(),
        tags
      };

      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setArchivedTests(prev => [newTest, ...prev]);

      // Soruları da arşive ekle
      const newArchivedQuestions: ArchivedQuestion[] = questions.map(q => ({
        id: `archived_${q.id}`,
        originalQuestionId: q.id,
        imageData: q.imageData,
        correctAnswer: q.correctAnswer,
        tags: tags,
        sourceTest: newTest.id,
        createdAt: new Date(),
        usageCount: 0
      }));

      setArchivedQuestions(prev => [...newArchivedQuestions, ...prev]);

      return newTest;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Arşivlenmiş test getirme
   */
  const getArchivedTest = (testId: string): ArchivedTest | undefined => {
    return archivedTests.find(test => test.id === testId);
  };

  /**
   * Arşivlenmiş soruları filtreleme
   */
  const getArchivedQuestions = (filters?: {
    tags?: string[];
    sourceTest?: string;
    limit?: number;
  }): ArchivedQuestion[] => {
    let filtered = [...archivedQuestions];

    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter(q => 
        filters.tags!.some(tag => q.tags.includes(tag))
      );
    }

    if (filters?.sourceTest) {
      filtered = filtered.filter(q => q.sourceTest === filters.sourceTest);
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  /**
   * Test silme
   */
  const deleteTest = async (testId: string): Promise<void> => {
    setIsLoading(true);

    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setArchivedTests(prev => prev.filter(test => test.id !== testId));
      setArchivedQuestions(prev => prev.filter(q => q.sourceTest !== testId));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Soru kullanım sayısını artırma
   */
  const incrementQuestionUsage = (questionId: string): void => {
    setArchivedQuestions(prev => 
      prev.map(q => 
        q.id === questionId 
          ? { ...q, usageCount: q.usageCount + 1 }
          : q
      )
    );
  };

  /**
   * Popüler etiketleri getirme
   */
  const getPopularTags = (): string[] => {
    const tagCounts: Record<string, number> = {};
    
    archivedTests.forEach(test => {
      test.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  };

  return {
    archivedTests,
    archivedQuestions,
    isLoading,
    saveTest,
    getArchivedTest,
    getArchivedQuestions,
    deleteTest,
    incrementQuestionUsage,
    getPopularTags
  };
};