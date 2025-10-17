/**
 * PDF generation constants and configuration values
 * 
 * Centralizes all magic numbers and layout constants used across PDF generation modules
 * Optimized for maximum image utilization and professional appearance with modern design
 */

/**
 * Layout constants for consistent PDF generation with optimized image scaling
 */
export const PDF_CONSTANTS = {
  // Page dimensions (A4 in points)
  PAGE_WIDTH: 595,
  PAGE_HEIGHT: 842,
  
  // Layout spacing - optimized for maximum content area
  MARGIN: 40,
  COLUMN_GAP: 20,
  
  // Grid configuration - optimized for larger images
  ROWS_PER_PAGE: 8,        // Reduced from 10 for larger image cells
  COLUMNS_PER_ROW: 2,      // Two-column layout
  
  // Image constraints - enhanced for better scaling
  MIN_IMAGE_SIZE: 80,      // Minimum image size in points
  IMAGE_PADDING: 2,        // Minimal padding for maximum utilization
  
  // Typography - professional sizing with modern hierarchy
  TITLE_SIZE: 18,          // Reduced from 20 for softer appearance
  HEADER_SIZE: 14,         // Reduced from 16 for modern look
  BODY_SIZE: 11,           // Reduced from 12 for cleaner text
  FOOTER_SIZE: 9,          // Reduced from 10 for subtle footer
  QUESTION_NUMBER_SIZE: 12, // Reduced from 14 for better balance
  
  // Answer key layout - optimized grid
  ANSWER_ITEMS_PER_ROW: 10,
  ANSWER_ITEM_WIDTH: 49,
  ANSWER_ITEM_HEIGHT: 25,
  
  // Modern spacing and visual elements
  QUESTION_BOX_RADIUS: 4,   // Border radius for question boxes
  QUESTION_BOX_SHADOW: 2,   // Shadow offset for depth
  VERTICAL_DIVIDER_WIDTH: 0.5, // Thin vertical divider
  HEADER_DIVIDER_WIDTH: 0.8,   // Thinner header divider
  
  // Answer area spacing for written exams
  ANSWER_AREA_HEIGHT: 40,   // Height for answer lines
  ANSWER_LINE_SPACING: 8,   // Space between answer lines
  
  // Quality settings for optimal output
  IMAGE_QUALITY: {
    DPI: 150,              // High quality for crisp images
    SCALE_FACTOR: 1.0,     // No additional scaling loss
    COMPRESSION: 0.85      // Balanced quality/size ratio
  }
} as const;

/**
 * Color constants for PDF elements with modern professional palette
 */
export const PDF_COLORS = {
  // Primary text colors - softer blacks
  BLACK: { r: 0.1, g: 0.1, b: 0.1 },           // Softer black
  DARK_GRAY: { r: 0.3, g: 0.3, b: 0.3 },       // Softer dark gray
  MEDIUM_GRAY: { r: 0.5, g: 0.5, b: 0.5 },
  LIGHT_GRAY: { r: 0.75, g: 0.75, b: 0.75 },   // Lighter for dividers
  VERY_LIGHT_GRAY: { r: 0.97, g: 0.97, b: 0.97 }, // Subtle background
  
  // Modern dividers and borders
  DIVIDER_GRAY: { r: 0.85, g: 0.85, b: 0.85 }, // Light dividers
  BORDER_GRAY: { r: 0.9, g: 0.9, b: 0.9 },     // Subtle borders
  COLUMN_DIVIDER: { r: 0.88, g: 0.88, b: 0.88 }, // Column separator
  
  // Question box styling
  QUESTION_BOX_BORDER: { r: 0.92, g: 0.92, b: 0.92 }, // Subtle box border
  QUESTION_BOX_SHADOW: { r: 0.94, g: 0.94, b: 0.94 }, // Light shadow
  QUESTION_BOX_BG: { r: 0.99, g: 0.99, b: 0.99 },     // Almost white background
  
  // Error states
  ERROR_RED: { r: 0.7, g: 0, b: 0 },
  ERROR_BORDER_RED: { r: 0.8, g: 0, b: 0 },
  
  // Professional accent colors
  ACCENT_BLUE: { r: 0.2, g: 0.4, b: 0.8 },
  SUCCESS_GREEN: { r: 0.2, g: 0.7, b: 0.3 },
  
  // Header and footer - softer appearance
  HEADER_TEXT: { r: 0.2, g: 0.2, b: 0.2 },     // Softer header text
  FOOTER_TEXT: { r: 0.6, g: 0.6, b: 0.6 },     // Subtle footer text
  METADATA_TEXT: { r: 0.4, g: 0.4, b: 0.4 },   // Metadata text
  
  // Answer area styling
  ANSWER_LINE_COLOR: { r: 0.8, g: 0.8, b: 0.8 }, // Light gray for answer lines
  ANSWER_AREA_BG: { r: 0.98, g: 0.98, b: 0.98 }   // Very light background for answer areas
} as const;

/**
 * Turkish character mapping for PDF compatibility
 */
export const TURKISH_CHAR_MAP: Record<string, string> = {
  'ı': 'i', 'İ': 'I', 'ş': 's', 'Ş': 'S',
  'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G',
  'ü': 'u', 'Ü': 'U', 'ö': 'o', 'Ö': 'O'
};

/**
 * Layout optimization presets for different content types
 */
export const LAYOUT_PRESETS = {
  STANDARD: {
    rowsPerPage: 8,
    imageUtilization: 0.85,  // Use 85% of available cell space
    paddingRatio: 0.02       // 2% padding relative to cell size
  },
  COMPACT: {
    rowsPerPage: 10,
    imageUtilization: 0.80,
    paddingRatio: 0.03
  },
  SPACIOUS: {
    rowsPerPage: 6,
    imageUtilization: 0.90,
    paddingRatio: 0.01
  }
} as const;