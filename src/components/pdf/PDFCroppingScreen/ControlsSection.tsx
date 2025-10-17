import React from 'react';
import { ArrowLeft, ArrowRight, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../../ui/Button';

/**
 * Controls Section Component
 * Provides page navigation, zoom controls, and preview toggle
 */

interface ControlsSectionProps {
  currentPage: number;
  totalPages: number;
  isPageLoading: boolean;
  showPreview: boolean;
  zoomLevel: number;
  mobilePageOffset: number;
  onChangePage: (newPage: number) => void;
  onTogglePreview: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMobileNext: () => void;
}

export const ControlsSection: React.FC<ControlsSectionProps> = ({
  currentPage,
  totalPages,
  isPageLoading,
  showPreview,
  zoomLevel,
  mobilePageOffset,
  onChangePage,
  onTogglePreview,
  onZoomIn,
  onZoomOut,
  onMobileNext
}) => {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
      {/* Page Navigation */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => onChangePage(currentPage - 1)}
          disabled={currentPage === 0 || isPageLoading}
          icon={ArrowLeft}
          size="sm"
        >
          Önceki
        </Button>
        
        <div className="flex items-center space-x-2">
          {/* Desktop: Show up to 10 pages */}
          <div className="hidden sm:flex items-center space-x-2">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
              <button
                key={i}
                onClick={() => onChangePage(i)}
                disabled={isPageLoading}
                className={`
                  w-8 h-8 rounded-full text-sm font-medium transition-all duration-200
                  ${currentPage === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }
                  ${isPageLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {i + 1}
              </button>
            ))}
            {totalPages > 10 && (
              <span className="text-gray-500 text-sm">...</span>
            )}
          </div>

          {/* Mobile: Show 5 pages at a time with navigation */}
          <div className="flex sm:hidden items-center space-x-2">
            {Array.from({ length: Math.min(5, totalPages - (mobilePageOffset * 5)) }, (_, i) => {
              const pageIndex = (mobilePageOffset * 5) + i;
              return (
                <button
                  key={pageIndex}
                  onClick={() => onChangePage(pageIndex)}
                  disabled={isPageLoading}
                  className={`
                    w-8 h-8 rounded-full text-sm font-medium transition-all duration-200
                    ${currentPage === pageIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }
                    ${isPageLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {pageIndex + 1}
                </button>
              );
            })}
            
            {/* Mobile "Sonraki" button - only show if there are more than 5 pages and not on last group */}
            {totalPages > 5 && (mobilePageOffset + 1) * 5 < totalPages && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMobileNext}
                disabled={isPageLoading}
                className="text-xs px-2 py-1 h-8"
              >
                Sonraki
              </Button>
            )}
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={() => onChangePage(currentPage + 1)}
          disabled={currentPage === totalPages - 1 || isPageLoading}
          icon={ArrowRight}
          iconPosition="right"
          size="sm"
        >
          Sonraki
        </Button>
      </div>

      {/* Quality Controls */}
      <div className="flex items-center space-x-4">
        {/* Live Preview Toggle */}
        <Button
          variant={showPreview ? "primary" : "outline"}
          size="sm"
          icon={Eye}
          onClick={onTogglePreview}
          disabled={isPageLoading}
        >
          Canlı Önizleme
        </Button>
        
        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={ZoomOut}
            onClick={onZoomOut}
            disabled={zoomLevel <= 0.5 || isPageLoading}
          />
          <span className="text-sm text-gray-600 min-w-20 text-center">
            Zoom: {Math.round(zoomLevel * 100)}%
            {zoomLevel >= 2.0 && <span className="text-green-600">★</span>}
          </span>
          <Button
            variant="outline"
            size="sm"
            icon={ZoomIn}
            onClick={onZoomIn}
            disabled={zoomLevel >= 3.0 || isPageLoading}
          />
        </div>
      </div>
    </div>
  );
};