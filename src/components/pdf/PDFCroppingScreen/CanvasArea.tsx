import React, { RefObject } from 'react';
import { CropArea } from '../../../types';

/**
 * Canvas Area Component
 * Displays the PDF canvas with selection overlay + existing crop overlays
 */

type ExistingOverlay = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;  // border/label rengi
  label: string;  // "5. C" gibi
};

interface CanvasAreaProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  isPageLoading: boolean;
  currentSelection: CropArea | null;
  overlayPosition: { left: number; top: number; width: number; height: number } | null;
  onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onTouchStart: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchMove: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd: (event: React.TouchEvent<HTMLCanvasElement>) => void;

  /** NEW: mevcut kırpımların sayfa üstü işaretleri */
  existingOverlays?: ExistingOverlay[];
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  canvasRef,
  isPageLoading,
  currentSelection,
  overlayPosition,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  existingOverlays = [],
}) => {
  return (
    <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
      <div className="relative inline-block max-w-full overflow-auto">
        {isPageLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span>Yüksek kalitede yükleniyor...</span>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`
            border border-gray-300 rounded max-w-full h-auto
            ${isPageLoading ? 'opacity-50' : 'cursor-crosshair'}
          `}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: 'none' }}
        />

        {/* NEW: mevcut kırpım overlay'leri (interaksiyonu etkilemez) */}
        <div className="pointer-events-none absolute inset-0">
          {existingOverlays.map((ov) => (
            <div
              key={ov.id}
              className="absolute rounded"
              style={{
                left: ov.left,
                top: ov.top,
                width: ov.width,
                height: ov.height,
                border: `2px dashed ${ov.color}`,
                boxShadow: `inset 0 0 0 1px ${ov.color}33`,
              }}
            >
              <div
                className="absolute -top-2 -left-2 text-[11px] px-1.5 py-0.5 rounded-md font-medium shadow"
                style={{
                  background: '#ffffff',
                  border: `1px solid ${ov.color}`,
                  color: ov.color,
                }}
              >
                {ov.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mevcut seçim overlay'i */}
        {currentSelection && overlayPosition && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30 pointer-events-none rounded"
            style={{
              left: overlayPosition.left,
              top: overlayPosition.top,
              width: overlayPosition.width,
              height: overlayPosition.height
            }}
          />
        )}
      </div>
    </div>
  );
};
