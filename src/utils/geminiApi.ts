/**
 * Google Gemini API integration for AI question generation
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAPuXT-qcIArQx9EufLMvLtyItzs8e1gY4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface AIQuestionRequest {
  subject: string;
  topic: string;
  gradeLevel?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  language: 'turkish' | 'english';
  includeAnswerKey?: boolean;
  questionType?: 'multiple-choice' | 'true-false' | 'fill-blank';
}

export interface AIGeneratedQuestion {
  id: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  topic: string;
}

export interface AIQuestionResponse {
  success: boolean;
  questions: AIGeneratedQuestion[];
  message?: string;
  error?: string;
}

/**
 * Generate questions using Google Gemini API
 */
export const generateQuestionsWithAI = async (request: AIQuestionRequest): Promise<AIQuestionResponse> => {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await attemptGeneration(request);
    } catch (error: any) {
      // Check if it's a retryable error (503, 429, 500, network errors)
      const isRetryable = error.message?.includes('503') || 
                         error.message?.includes('429') || 
                         error.message?.includes('500') ||
                         error.message?.includes('Failed to fetch') ||
                         error.message?.includes('Network error');
      
      // If it's the last attempt or not retryable, throw the error
      if (attempt === maxRetries || !isRetryable) {
        console.error('AI question generation failed after retries:', error);
        return {
          success: false,
          questions: [],
          error: getErrorMessage(error)
        };
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`API request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but just in case
  return {
    success: false,
    questions: [],
    error: 'Maksimum deneme sayısına ulaşıldı'
  };
};

/**
 * Attempt to generate questions (extracted for retry logic)
 */
const attemptGeneration = async (request: AIQuestionRequest): Promise<AIQuestionResponse> => {
  try {
    const prompt = createPrompt(request);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 16384,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API request failed: ${response.status} - ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    const questions = parseGeneratedQuestions(generatedText, request);

    return {
      success: true,
      questions,
      message: `${questions.length} soru başarıyla oluşturuldu`
    };

  } catch (error) {
    throw error; // Re-throw for retry logic
  }
};

/**
 * Get user-friendly error message
 */
const getErrorMessage = (error: any): string => {
  const message = error?.message || 'Bilinmeyen hata oluştu';
  
  if (message.includes('503')) {
    return 'Gemini API geçici olarak kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.';
  }
  
  if (message.includes('429')) {
    return 'API kullanım limiti aşıldı. Lütfen birkaç dakika bekleyip tekrar deneyin.';
  }
  
  if (message.includes('401') || message.includes('403')) {
    return 'API anahtarı geçersiz veya yetkisiz. Lütfen API anahtarınızı kontrol edin.';
  }
  
  if (message.includes('Failed to fetch') || message.includes('Network error')) {
    return 'İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.';
  }
  
  return 'AI soru üretimi sırasında bir hata oluştu. Lütfen tekrar deneyin.';
};
/**
 * Create prompt for Gemini API
 */
const createPrompt = (request: AIQuestionRequest): string => {
  const difficultyText = {
    easy: 'kolay',
    medium: 'orta',
    hard: 'zor'
  };

  const gradeText = request.gradeLevel ? `\nSınıf Seviyesi: ${request.gradeLevel}` : '';

  return `
Sen deneyimli bir eğitim uzmanı ve soru yazarısın. Aşağıdaki kriterlere göre ${request.questionCount} adet yüksek kaliteli çoktan seçmeli soru oluştur:

Konu: ${request.subject} - ${request.topic}
Zorluk Seviyesi: ${difficultyText[request.difficulty]}
Dil: Türkçe
Soru Tipi: 5 şıklı çoktan seçmeli (A, B, C, D, E)

ÖNEMLI: Her soru eğitim müfredatına uygun, ölçme-değerlendirme ilkelerine göre hazırlanmalı.

Her soru için şu formatı kullan:

SORU [numara]:
[Soru metni]

A) [Şık A]
B) [Şık B] 
C) [Şık C]
D) [Şık D]
E) [Şık E]

DOĞRU CEVAP: [A/B/C/D/E]
${request.includeAnswerKey ? 'AÇIKLAMA: [Kısa açıklama]' : ''}

---

Önemli kurallar:
1. Sorular Türkçe olmalı ve eğitim seviyesine uygun olmalı
2. Her şık anlamlı ve mantıklı olmalı
3. Sadece bir doğru cevap olmalı
4. Sorular birbirinden farklı konuları kapsamalı
5. Zorluk seviyesi tutarlı olmalı
6. Açık ve net ifadeler kullan
7. Akademik dil kullan
8. Çeldirici şıklar gerçekçi ve mantıklı olmalı
9. Soru kökü net ve anlaşılır olmalı
10. Ölçülmek istenen kazanımı doğru ölçmeli

Lütfen ${request.questionCount} soru oluştur:
`;
};

/**
 * Parse generated questions from Gemini response
 */
const parseGeneratedQuestions = (text: string, request: AIQuestionRequest): AIGeneratedQuestion[] => {
  const questions: AIGeneratedQuestion[] = [];
  const questionBlocks = text.split('---').filter(block => block.trim());

  questionBlocks.forEach((block, index) => {
    try {
      const lines = block.trim().split('\n').filter(line => line.trim());
      
      // Find question text
      const questionLine = lines.find(line => line.startsWith('SORU'));
      if (!questionLine) return;
      
      const questionStartIndex = lines.indexOf(questionLine);
      let questionText = '';
      
      // Extract question text (everything between SORU line and first option)
      for (let i = questionStartIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^[A-E]\)/)) break;
        if (line) questionText += line + ' ';
      }
      
      // Extract options
      const options = { A: '', B: '', C: '', D: '', E: '' };
      lines.forEach(line => {
        const optionMatch = line.match(/^([A-E])\)\s*(.+)$/);
        if (optionMatch) {
          const [, letter, text] = optionMatch;
          options[letter as keyof typeof options] = text.trim();
        }
      });
      
      // Extract correct answer
      const answerLine = lines.find(line => line.includes('DOĞRU CEVAP:'));
      const correctAnswer = answerLine?.match(/([A-E])/)?.[1] as 'A' | 'B' | 'C' | 'D' | 'E' || 'A';
      
      // Extract explanation if requested
      let explanation = '';
      if (request.includeAnswerKey) {
        const explanationLine = lines.find(line => line.includes('AÇIKLAMA:'));
        explanation = explanationLine?.replace('AÇIKLAMA:', '').trim() || '';
      }
      
      // Validate that all options are filled
      if (Object.values(options).every(opt => opt.trim())) {
        questions.push({
          id: `ai_question_${Date.now()}_${index}`,
          questionText: questionText.trim(),
          options,
          correctAnswer,
          explanation: explanation || undefined,
          difficulty: request.difficulty,
          subject: request.subject,
          topic: request.topic
        });
      }
    } catch (error) {
      console.warn('Error parsing question block:', error);
    }
  });

  return questions;
};

/**
 * Test Gemini API connection
 */
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const testUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    const response = await fetch(`${testUrl}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Bu bir API bağlantı testidir. Kısa bir yanıt ver.'
          }]
        }]
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Gemini 2.5 Flash API connection test failed:', error);
    return false;
  }
};