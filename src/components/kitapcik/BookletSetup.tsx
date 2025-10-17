import React, { useState } from 'react';
import { Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { CroppedQuestion, AnswerChoice } from '../../types';
import { BookletVersion, Booklet } from '../../types/booklet';

/**
 * Kitapçık Kurulum Bileşeni
 * Kitapçık versiyonlarını seçme ve temel ayarları yapma
 */

interface BookletSetupProps {
  questions: CroppedQuestion[];
  onComplete: (selectedVersions: BookletVersion[], booklets: Booklet[]) => void;
  onBack: () => void;
}

export const BookletSetup: React.FC<BookletSetupProps> = ({
  questions,
  onComplete,
  onBack
}) => {
  const [selectedVersions, setSelectedVersions] = useState<BookletVersion[]>(['A']);
  const [autoShuffle, setAutoShuffle] = useState(true);

  const availableVersions: BookletVersion[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  /**
   * Versiyon ekleme
   */
  const addVersion = () => {
    if (selectedVersions.length < 8) {
      const nextVersion = availableVersions.find(v => !selectedVersions.includes(v));
      if (nextVersion) {
        setSelectedVersions([...selectedVersions, nextVersion]);
      }
    }
  };

  /**
   * Versiyon çıkarma
   */
  const removeVersion = (version: BookletVersion) => {
    if (selectedVersions.length > 1) {
      setSelectedVersions(selectedVersions.filter(v => v !== version));
    }
  };

  /**
   * Soruları karıştırma algoritması
   */
  const shuffleQuestions = (questions: CroppedQuestion[]): CroppedQuestion[] => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.map((q, index) => ({ ...q, order: index }));
  };

  /**
   * Kitapçıkları oluşturma
   */
  const createBooklets = (): Booklet[] => {
    return selectedVersions.map(version => {
      const bookletQuestions = autoShuffle ? shuffleQuestions(questions) : [...questions];
      
      return {
        id: `booklet_${version}_${Date.now()}`,
        version,
        name: `Kitapçık ${version}`,
        questions: bookletQuestions,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
  };

  /**
   * Kurulumu tamamlama
   */
  const handleComplete = () => {
    const booklets = createBooklets();
    onComplete(selectedVersions, booklets);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Kitapçık Versiyonları
        </h3>
        <p className="text-gray-600">
          Oluşturmak istediğiniz kitapçık versiyonlarını seçin (maksimum 8 adet)
        </p>
      </div>

      {/* Test Bilgileri */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Test Bilgileri</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
          <div><strong>Toplam Soru:</strong> {questions.length}</div>
          <div><strong>Seçilen Versiyon:</strong> {selectedVersions.length}</div>
        </div>
      </div>

      {/* Versiyon Seçimi */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Kitapçık Versiyonları</h4>
          <Button
            onClick={addVersion}
            disabled={selectedVersions.length >= 8}
            icon={Plus}
            size="sm"
          >
            Versiyon Ekle
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {selectedVersions.map(version => (
            <div
              key={version}
              className="bg-white border-2 border-blue-500 rounded-lg p-4 text-center relative"
            >
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {version}
              </div>
              <div className="text-sm text-gray-600">
                Kitapçık {version}
              </div>
              {selectedVersions.length > 1 && (
                <button
                  onClick={() => removeVersion(version)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <Minus size={12} />
                </button>
              )}
            </div>
          ))}

          {/* Boş slotlar */}
          {Array.from({ length: 8 - selectedVersions.length }, (_, i) => (
            <div
              key={`empty_${i}`}
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-gray-400 mb-2">
                {availableVersions[selectedVersions.length + i]}
              </div>
              <div className="text-sm text-gray-400">
                Boş slot
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ayarlar */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Kitapçık Ayarları</h4>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={autoShuffle}
              onChange={(e) => setAutoShuffle(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Soruları otomatik karıştır
              </span>
              <p className="text-xs text-gray-500">
                Her kitapçık versiyonunda sorular farklı sırada olacak
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Önizleme */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Oluşturulacak Kitapçıklar</h4>
        <div className="space-y-2">
          {selectedVersions.map(version => (
            <div key={version} className="flex items-center justify-between text-sm">
              <span className="font-medium">Kitapçık {version}</span>
              <span className="text-gray-600">{questions.length} soru</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
        >
          Geri
        </Button>
        
        <Button
          onClick={handleComplete}
          icon={ArrowRight}
          iconPosition="right"
        >
          Soru Düzenlemesine Geç
        </Button>
      </div>
    </div>
  );
};