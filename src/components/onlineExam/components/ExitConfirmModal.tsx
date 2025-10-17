/**
 * Exit Confirm Modal Component
 * Modal for confirming exam exit
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../ui/Button';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-orange-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sınavdan Çıkmak İstediğinizden Emin misiniz?
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            İlerlemeniz kaydedilecek ve daha sonra kaldığınız yerden devam edebilirsiniz.
          </p>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              fullWidth
            >
              İptal
            </Button>
            <Button
              onClick={onConfirm}
              variant="danger"
              fullWidth
            >
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};