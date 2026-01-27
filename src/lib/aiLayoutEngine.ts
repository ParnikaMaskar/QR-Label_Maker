/**
 * AI MAGIC LAYOUT ENGINE v3.0 - Enhanced Print Optimization
 * Logic: Rules-based Heuristic Design System with Print-Safe Boundaries
 * Goal: Optimize label legibility, visual hierarchy, and prevent text overflow
 * 
 * Features:
 * - Content density analysis with overflow detection
 * - Dynamic label dimension calculation
 * - Print-safe font size enforcement
 * - Smart content scaling to fit boundaries
 * - Contrast guard for dark backgrounds
 */

export interface LabelField {
  name: string;
  value: string;
  fontSize?: number;
  bold?: boolean;
}

export interface AIInput {
  fields: Record<string, string>[]; // Data from your FileUploader or manual input
  hasLogo: boolean;
  logoRatio: number; // width / height (e.g., 1.0 for square, 2.0 for landscape)
  canvasWidth: number; // Current label width in mm
  canvasHeight?: number; // Current label height in mm (optional)
  qrBgColor?: string; // Background color for contrast detection
  labelWidth?: number; // User-specified label width in mm
  labelHeight?: number; // User-specified label height in mm
}

export interface AIConfigOutput {
  layout: 'horizontal' | 'vertical' | 'qr-only' | 'address' | 'product-tag' | '2x4-label';
  baseFontSize: number;
  qrSize: number;
  padding: number;
  gap: number;
  aiNote: string;
  minFontSize: number; // Print-safe minimum (6pt / ~8px)
  textColor: string; // Contrast guard - auto text color
  
  // Dynamic dimensions
  suggestedWidth: number; // Suggested label width in mm
  suggestedHeight: number; // Suggested label height in mm
  
  // Horizontal layout width percentages (for visual weight balance)
  leftWidthPercent: number;  // QR/Logo section width %
  rightWidthPercent: number; // Text section width %
  
  // Content warnings
  warnings: string[];
  needsExpansion: boolean; // Whether label needs to be larger
}

/**
 * Constants for print-safe calculations
 */
const PRINT_CONSTANTS = {
  MIN_FONT_SIZE: 6, // 6pt minimum for print legibility
  MAX_FONT_SIZE: 16, // Maximum reasonable font size
  PX_PER_MM: 3.78, // Pixels per mm at 96 DPI
  MM_PER_CHAR: 2.5, // Approximate mm per character at 12px font
  QR_OVERHEAD: 25, // Base overhead for QR code area in mm
  HEADER_HEIGHT: 8, // Header text height in mm
  PADDING_DEFAULT: 8, // Default padding in mm
  MIN_LABEL_WIDTH: 25, // Minimum label width in mm
  MIN_LABEL_HEIGHT: 15, // Minimum label height in mm
  MAX_LABEL_WIDTH: 100, // Maximum reasonable label width in mm
  MAX_LABEL_HEIGHT: 80, // Maximum reasonable label height in mm
};

/**
 * Detect logo dimensions from a File
 */
export const getLogoDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load logo image'));
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculate logo aspect ratio (width / height)
 */
export const getLogoRatio = (width: number, height: number): number => {
  return height > 0 ? width / height : 1;
};

/**
 * Check if a color is dark (for contrast guard)
 */
export const isDarkColor = (color: string): boolean => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  
  const darkColors = ['black', 'navy', 'darkblue', 'darkgreen', 'darkred', 'maroon', 'purple', 'teal', 'brown'];
  return darkColors.includes(color.toLowerCase());
};

/**
 * Get contrasting text color
 */
export const getContrastingTextColor = (bgColor: string): string => {
  return isDarkColor(bgColor) ? '#ffffff' : '#000000';
};

/**
 * Calculate estimated content width in mm
 */
const calculateContentWidth = (
  fields: Record<string, string>[],
  fontSize: number,
  hasLogo: boolean,
  logoRatio: number
): number => {
  if (fields.length === 0) return PRINT_CONSTANTS.MIN_LABEL_WIDTH;
  
  const sampleRow = fields[0];
  let maxContentWidth = 0;
  
  Object.values(sampleRow).forEach((value) => {
    const charCount = value.length;
    // Estimate width based on character count and font size
    const estimatedWidth = (charCount * fontSize * PRINT_CONSTANTS.MM_PER_CHAR) / 12;
    maxContentWidth = Math.max(maxContentWidth, estimatedWidth);
  });
  
  // Add logo width if present
  if (hasLogo) {
    const logoWidthEstimate = 15 * logoRatio; // Base 15mm * ratio
    maxContentWidth = Math.max(maxContentWidth, logoWidthEstimate);
  }
  
  return Math.max(maxContentWidth, PRINT_CONSTANTS.MIN_LABEL_WIDTH);
};

/**
 * Calculate estimated content height in mm
 */
const calculateContentHeight = (
  fields: Record<string, string>[],
  fontSize: number,
  layout: string,
  qrSize: number,
  hasLogo: boolean
): number => {
  const fieldCount = Math.min(fields.length, 5); // Consider up to 5 fields
  const fieldHeight = (fontSize * 1.3 * PRINT_CONSTANTS.MM_PER_CHAR) / 12; // Line height
  
  let contentHeight = fieldCount * fieldHeight;
  
  // Add QR size (convert px to mm)
  const qrHeight = (qrSize / PRINT_CONSTANTS.PX_PER_MM);
  contentHeight = Math.max(contentHeight, qrHeight);
  
  // Add logo height if present
  if (hasLogo) {
    contentHeight += 10; // ~10mm for logo
  }
  
  // Add header height
  contentHeight += PRINT_CONSTANTS.HEADER_HEIGHT;
  
  // Layout-specific adjustments
  if (layout === 'vertical') {
    contentHeight = Math.max(contentHeight, qrHeight + (fieldCount * fieldHeight) + 10);
  } else if (layout === 'horizontal') {
    contentHeight = Math.max(contentHeight, Math.max(qrHeight, fieldCount * fieldHeight) + 5);
  }
  
  return Math.max(contentHeight, PRINT_CONSTANTS.MIN_LABEL_HEIGHT);
};

/**
 * Calculate optimal font size to fit content within width
 */
const calculateOptimalFontSize = (
  contentWidth: number,
  availableWidth: number,
  charCount: number
): number => {
  if (charCount === 0) return 12;
  
  // Calculate ideal font size based on available space
  const idealFontSize = Math.min(
    (availableWidth / charCount) * (12 / PRINT_CONSTANTS.MM_PER_CHAR),
    PRINT_CONSTANTS.MAX_FONT_SIZE
  );
  
  // Clamp to print-safe range
  return Math.max(
    Math.min(Math.round(idealFontSize), PRINT_CONSTANTS.MAX_FONT_SIZE),
    PRINT_CONSTANTS.MIN_FONT_SIZE
  );
};

/**
 * Calculate optimal QR size based on label dimensions
 */
const calculateOptimalQrSize = (
  layout: string,
  labelWidth: number,
  labelHeight: number,
  hasLogo: boolean
): number => {
  // Maximum QR size based on smallest dimension
  const maxSize = Math.min(labelWidth, labelHeight) * PRINT_CONSTANTS.PX_PER_MM * 0.7;
  
  // Layout-specific sizing
  let optimalSize: number;
  
  switch (layout) {
    case 'qr-only':
      optimalSize = Math.min(maxSize, 150);
      break;
    case 'horizontal':
      optimalSize = hasLogo 
        ? Math.min(maxSize * 0.8, 90)
        : Math.min(maxSize * 0.5, 100);
      break;
    case 'vertical':
      optimalSize = Math.min(maxSize * 0.6, 80);
      break;
    case 'address':
    case '2x4-label':
      optimalSize = Math.min(maxSize * 0.4, 70);
      break;
    default:
      optimalSize = Math.min(maxSize * 0.5, 80);
  }
  
  return Math.max(Math.round(optimalSize), 40);
};

/**
 * Calculate horizontal layout width percentages based on content density
 * Returns { leftWidthPercent, rightWidthPercent } for QR/Logo and Text sections
 * 
 * Logic:
 * - Default: 40% QR/Logo, 60% Text
 * - High content density: 30% QR/Logo, 70% Text (more room for text)
 * - Low content density: 45% QR/Logo, 55% Text (balanced)
 * - Logo heavy: 50% QR/Logo, 50% Text (equal visual weight)
 * - Minimal content: 45% QR/Logo, 55% Text
 */
const calculateWidthPercentages = (
  totalChars: number,
  hasLogo: boolean,
  logoRatio: number,
  fieldCount: number
): { leftWidthPercent: number; rightWidthPercent: number } => {
  // Default split for horizontal layout
  let leftPercent = 40; // QR/Logo section
  let rightPercent = 60; // Text section
  
  // Calculate content density (characters per field)
  const avgCharsPerField = fieldCount > 0 ? totalChars / fieldCount : 0;
  
  if (totalChars > 100) {
    // Very high content density - give more space to text
    leftPercent = 30;
    rightPercent = 70;
  } else if (totalChars > 50) {
    // High content density
    leftPercent = 35;
    rightPercent = 65;
  } else if (totalChars > 25) {
    // Moderate content - balanced approach
    leftPercent = 40;
    rightPercent = 60;
  } else if (totalChars > 0) {
    // Low content density - slight bias to QR for visual appeal
    leftPercent = 45;
    rightPercent = 55;
  } else {
    // No text content - maximize QR visibility
    leftPercent = 50;
    rightPercent = 50;
  }
  
  // Adjust for logo presence
  if (hasLogo) {
    if (logoRatio > 1.5) {
      // Wide logo - give more space to logo section
      leftPercent = Math.min(leftPercent + 10, 55);
      rightPercent = Math.max(rightPercent - 10, 45);
    } else if (logoRatio < 0.8) {
      // Portrait logo - slightly more space to logo
      leftPercent = Math.min(leftPercent + 5, 50);
      rightPercent = Math.max(rightPercent - 5, 50);
    }
  }
  
  return {
    leftWidthPercent: leftPercent,
    rightWidthPercent: rightPercent,
  };
};

/**
 * Determine optimal layout based on content and label dimensions
 */
const determineOptimalLayout = (
  totalChars: number,
  fieldCount: number,
  hasLogo: boolean,
  logoRatio: number,
  suggestedWidth: number,
  suggestedHeight: number
): AIConfigOutput['layout'] => {
  const aspectRatio = suggestedWidth / suggestedHeight;
  
  // No content - QR only
  if (totalChars === 0 && fieldCount === 0) {
    return 'qr-only';
  }
  
  // High density - vertical layout preferred
  if (totalChars > 100 || fieldCount > 4) {
    return 'vertical';
  }
  
  // Wide labels - horizontal layout
  if (aspectRatio > 1.3 && totalChars < 50) {
    return 'horizontal';
  }
  
  // Tall labels - vertical layout
  if (aspectRatio < 0.8) {
    return 'vertical';
  }
  
  // Landscape logo - vertical to avoid whitespace
  if (hasLogo && logoRatio > 1.5) {
    return 'vertical';
  }
  
  // Portrait logo - horizontal for economy
  if (hasLogo && logoRatio < 0.8) {
    return 'horizontal';
  }
  
  // Default: horizontal for moderate content
  return 'horizontal';
};

/**
 * Main AI Layout Engine - Enhanced with print optimization
 */
export const runAiMagicLayout = (input: AIInput): AIConfigOutput => {
  const { 
    fields, 
    hasLogo, 
    logoRatio, 
    canvasWidth, 
    canvasHeight,
    qrBgColor = '#ffffff',
    labelWidth: userWidth,
    labelHeight: userHeight
  } = input;

  // 1. Calculate Content Metrics
  const sampleRow = fields[0] || {};
  const totalChars = Object.values(sampleRow).join('').length;
  const fieldCount = Object.keys(sampleRow).length;
  const charCount = Math.max(totalChars, Object.values(sampleRow).join(' ').length);

  // Warnings array
  const warnings: string[] = [];
  let needsExpansion = false;

  // 2. Calculate base dimensions
  const baseWidth = userWidth || Math.max(canvasWidth, PRINT_CONSTANTS.MIN_LABEL_WIDTH);
  const baseHeight = userHeight || canvasHeight || PRINT_CONSTANTS.MIN_LABEL_HEIGHT;

  // 3. Estimate content requirements
  const estimatedContentWidth = calculateContentWidth(fields, 12, hasLogo, logoRatio);
  const estimatedContentHeight = calculateContentHeight(fields, 12, 'horizontal', 80, hasLogo);

  // 4. Determine if label needs expansion
  const widthDeficit = estimatedContentWidth + (PRINT_CONSTANTS.PADDING_DEFAULT * 2) - baseWidth;
  const heightDeficit = estimatedContentHeight + (PRINT_CONSTANTS.PADDING_DEFAULT * 2) - baseHeight;

  // Calculate suggested dimensions
  let suggestedWidth = baseWidth;
  let suggestedHeight = baseHeight;

  if (widthDeficit > 0) {
    suggestedWidth = Math.min(baseWidth + widthDeficit * 1.2, PRINT_CONSTANTS.MAX_LABEL_WIDTH);
    warnings.push(`Content width exceeds label. Suggested width: ${Math.round(suggestedWidth)}mm`);
    needsExpansion = true;
  }

  if (heightDeficit > 0) {
    suggestedHeight = Math.min(baseHeight + heightDeficit * 1.2, PRINT_CONSTANTS.MAX_LABEL_HEIGHT);
    warnings.push(`Content height exceeds label. Suggested height: ${Math.round(suggestedHeight)}mm`);
    needsExpansion = true;
  }

  // 5. Determine optimal layout
  const layout = determineOptimalLayout(
    totalChars,
    fieldCount,
    hasLogo,
    logoRatio,
    suggestedWidth,
    suggestedHeight
  );

  // 6. Calculate optimal font size
  let baseFontSize: number;
  
  if (needsExpansion) {
    // If label will be expanded, use moderate font sizes
    baseFontSize = Math.min(14, calculateOptimalFontSize(totalChars, suggestedWidth - 10, charCount / fieldCount));
  } else {
    // Use density-based scaling
    const fontReduction = Math.floor(totalChars / 30);
    baseFontSize = Math.max(PRINT_CONSTANTS.MIN_FONT_SIZE, Math.min(16 - fontReduction, 14));
  }

  // 7. Calculate optimal QR size
  const qrSize = calculateOptimalQrSize(layout, suggestedWidth, suggestedHeight, hasLogo);

  // 8. Calculate padding and gap
  const padding = Math.max(PRINT_CONSTANTS.PADDING_DEFAULT, Math.min(8, suggestedWidth * 0.05));
  const gap = Math.max(4, Math.min(12, suggestedWidth * 0.03));

  // 9. Calculate horizontal layout width percentages
  const widthPercentages = calculateWidthPercentages(totalChars, hasLogo, logoRatio, fieldCount);
  
  // 10. Generate AI note with width split explanation
  let aiNote: string;
  if (totalChars === 0 && fieldCount === 0) {
    aiNote = "Minimalist mode: Maximum QR visibility. Balanced 50/50 split.";
  } else if (needsExpansion) {
    aiNote = `Content optimized. Suggested: ${Math.round(suggestedWidth)}mm × ${Math.round(suggestedHeight)}mm`;
  } else if (totalChars > 100) {
    aiNote = `High density: ${widthPercentages.leftWidthPercent}/${widthPercentages.rightWidthPercent} split prioritizes text legibility.`;
  } else if (layout === 'vertical') {
    aiNote = "Stacked layout for balanced visual hierarchy.";
  } else if (hasLogo && logoRatio > 1.5) {
    aiNote = "Wide logo detected: Stacked layout prevents awkward whitespace.";
  } else if (layout === 'horizontal') {
    // Include width split in the note for horizontal layouts
    aiNote = `Horizontal layout with ${widthPercentages.leftWidthPercent}/${widthPercentages.rightWidthPercent} split for optimal visual balance.`;
  } else {
    aiNote = "Layout optimized for readability and print quality.";
  }

  // 10. Contrast guard
  const textColor = getContrastingTextColor(qrBgColor);

  // 11. Final validation - ensure minimums
  const finalFontSize = Math.max(baseFontSize, PRINT_CONSTANTS.MIN_FONT_SIZE);
  const finalQrSize = Math.max(qrSize, 40);

  return {
    layout,
    baseFontSize: finalFontSize,
    qrSize: finalQrSize,
    padding: Math.round(padding),
    gap: Math.round(gap),
    aiNote,
    minFontSize: PRINT_CONSTANTS.MIN_FONT_SIZE,
    textColor,
    suggestedWidth: Math.round(suggestedWidth),
    suggestedHeight: Math.round(suggestedHeight),
    // Horizontal layout width percentages
    leftWidthPercent: widthPercentages.leftWidthPercent,
    rightWidthPercent: widthPercentages.rightWidthPercent,
    warnings,
    needsExpansion,
  };
};

/**
 * Apply AI suggestions to label configuration
 */
export const applyAiSuggestions = (
  currentConfig: Partial<AIConfigOutput>,
  userLabelWidth?: number,
  userLabelHeight?: number
): Partial<AIConfigOutput> => {
  const input: AIInput = {
    fields: [],
    hasLogo: false,
    logoRatio: 1,
    canvasWidth: userLabelWidth || 50,
    canvasHeight: userLabelHeight || 30,
    labelWidth: userLabelWidth,
    labelHeight: userLabelHeight,
  };

  const aiOutput = runAiMagicLayout(input);

  return {
    layout: currentConfig.layout || aiOutput.layout,
    baseFontSize: currentConfig.baseFontSize || aiOutput.baseFontSize,
    qrSize: currentConfig.qrSize || aiOutput.qrSize,
    padding: currentConfig.padding || aiOutput.padding,
    gap: currentConfig.gap || aiOutput.gap,
    minFontSize: aiOutput.minFontSize,
    textColor: aiOutput.textColor,
    suggestedWidth: aiOutput.suggestedWidth,
    suggestedHeight: aiOutput.suggestedHeight,
    leftWidthPercent: currentConfig.leftWidthPercent ?? aiOutput.leftWidthPercent,
    rightWidthPercent: currentConfig.rightWidthPercent ?? aiOutput.rightWidthPercent,
    warnings: aiOutput.warnings,
    needsExpansion: aiOutput.needsExpansion,
    aiNote: aiOutput.aiNote,
  };
};

/**
 * Batch process multiple rows to detect layout changes
 */
export const detectLayoutChanges = (
  data: Record<string, string>[],
  hasLogo: boolean,
  logoRatio: number,
  canvasWidth: number
): { startIndex: number; endIndex: number; config: AIConfigOutput }[] => {
  if (data.length === 0) return [];
  
  const changes: { startIndex: number; endIndex: number; config: AIConfigOutput }[] = [];
  let currentConfig: AIConfigOutput | null = null;
  let groupStart = 0;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const testInput: AIInput = {
      fields: [row],
      hasLogo,
      logoRatio,
      canvasWidth,
    };
    
    const newConfig = runAiMagicLayout(testInput);
    
    // If this is the first row or config changed significantly, record the change
    if (currentConfig === null || 
        currentConfig.layout !== newConfig.layout ||
        Math.abs(currentConfig.baseFontSize - newConfig.baseFontSize) > 2 ||
        currentConfig.needsExpansion !== newConfig.needsExpansion) {
      
      // If we had a previous group, record it
      if (currentConfig !== null) {
        changes.push({
          startIndex: groupStart,
          endIndex: i - 1,
          config: currentConfig,
        });
      }
      
      // Start new group
      groupStart = i;
      currentConfig = newConfig;
    }
  }
  
  // Record the last group
  if (currentConfig !== null) {
    changes.push({
      startIndex: groupStart,
      endIndex: data.length - 1,
      config: currentConfig,
    });
  }
  
  return changes;
};

/**
 * Validate if content fits within label boundaries
 */
export const validateContentFit = (
  content: { text: string; fontSize: number }[],
  labelWidth: number,
  labelHeight: number,
  qrSize: number,
  layout: string,
  hasLogo: boolean
): { fits: boolean; overflowAmount: number; suggestions: string[] } => {
  const suggestions: string[] = [];
  let totalTextWidth = 0;
  let totalTextHeight = 0;

  // Calculate total text dimensions
  content.forEach(({ text, fontSize }) => {
    const charWidth = (fontSize * PRINT_CONSTANTS.MM_PER_CHAR) / 12;
    const textWidth = text.length * charWidth;
    const textHeight = (fontSize * 1.3 * PRINT_CONSTANTS.MM_PER_CHAR) / 12;
    
    totalTextWidth = Math.max(totalTextWidth, textWidth);
    totalTextHeight += textHeight;
  });

  // Add QR dimensions
  const qrWidthMm = qrSize / PRINT_CONSTANTS.PX_PER_MM;
  const qrHeightMm = qrSize / PRINT_CONSTANTS.PX_PER_MM;

  let availableWidth = labelWidth;
  let availableHeight = labelHeight;

  // Calculate available space based on layout
  switch (layout) {
    case 'horizontal':
      availableWidth = labelWidth * 0.6;
      break;
    case 'vertical':
      availableHeight = labelHeight * 0.7;
      break;
    case 'qr-only':
      availableWidth = qrWidthMm * 1.2;
      availableHeight = qrHeightMm * 1.2;
      break;
    default:
      break;
  }

  const widthOverflow = totalTextWidth - availableWidth;
  const heightOverflow = totalTextHeight - availableHeight;
  const overflowAmount = Math.max(0, Math.max(widthOverflow, heightOverflow));

  const fits = overflowAmount === 0;

  if (!fits) {
    if (widthOverflow > 0) {
      suggestions.push(`Increase label width by at least ${Math.ceil(widthOverflow)}mm`);
    }
    if (heightOverflow > 0) {
      suggestions.push(`Increase label height by at least ${Math.ceil(heightOverflow)}mm`);
    }
    suggestions.push('Or reduce font size and/or content length');
  }

  return { fits, overflowAmount, suggestions };
};

