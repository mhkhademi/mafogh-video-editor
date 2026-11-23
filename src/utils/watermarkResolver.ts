import { Slide, SlideBackground, WatermarkConfig } from '../types';

/**
 * Calculates luminance (0 to 255) of a hex color string
 */
export function getHexLuminance(hex: string): number {
  if (!hex) return 255;
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return 255;

  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;

  // Standard WCAG relative luminance weighting
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Determines whether a slide background is dark or light
 */
export function isBackgroundDark(bg?: SlideBackground): boolean {
  if (!bg) return false;

  if (bg.type === 'solid') {
    return getHexLuminance(bg.color1 || '#ffffff') < 140;
  }

  if (bg.type === 'gradient') {
    const lum1 = getHexLuminance(bg.color1 || '#ffffff');
    const lum2 = getHexLuminance(bg.color2 || bg.color1 || '#ffffff');
    // For watermark (usually at the bottom), color2 often dominates in 135deg gradient
    const avgLum = lum1 * 0.4 + lum2 * 0.6;
    return avgLum < 140;
  }

  if (bg.type === 'image') {
    return true; // Default assumption for background images is dark for safety
  }

  return false;
}

export interface ResolvedSlideWatermark {
  visible: boolean;
  type: 'text' | 'image';
  text: string;
  imageUrl: string;
  color: string;
  size: number;
  opacity: number;
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right';
  isDarkSlide: boolean;
}

/**
 * Resolves the final effective watermark parameters for a given slide
 */
export function resolveSlideWatermark(
  watermark: WatermarkConfig,
  slide: Slide
): ResolvedSlideWatermark {
  const isEnabled = Boolean(watermark && watermark.enabled);
  const override = slide.watermarkOverride;

  // Check visibility override
  if (!isEnabled || override?.visible === false || override?.colorMode === 'hidden') {
    return {
      visible: false,
      type: watermark?.type || 'image',
      text: watermark?.text || 'مافوق',
      imageUrl: watermark?.imageUrl || '/mafogh-logo-brand.svg',
      color: '#6B0B45',
      size: watermark?.size || 48,
      opacity: watermark?.opacity ?? 0.95,
      position: watermark?.position || 'bottom-center',
      isDarkSlide: false,
    };
  }

  const isDark = isBackgroundDark(slide.background);
  let effectiveColor = watermark.color || '';

  if (override?.colorMode === 'light') {
    effectiveColor = '#FFFFFF';
  } else if (override?.colorMode === 'dark') {
    effectiveColor = watermark.color || '#6B0B45';
  } else if (override?.colorMode === 'inherit' && override.customColor) {
    effectiveColor = override.customColor;
  } else {
    // Auto-contrast mode (default true)
    const autoContrast = watermark.autoContrast ?? true;
    if (autoContrast) {
      if (isDark) {
        effectiveColor = '#FFFFFF';
      } else {
        effectiveColor = watermark.color || '#6B0B45';
      }
    }
  }

  let effectiveImageUrl = watermark.imageUrl || '/mafogh-logo-brand.svg';
  // If slide is dark and logo is brand colored SVG without explicit tint, switch to white SVG
  if (isDark && (!effectiveColor || effectiveColor === '#FFFFFF') && effectiveImageUrl.includes('brand')) {
    effectiveImageUrl = '/mafogh-logo.svg'; // Official white logo
    effectiveColor = '#FFFFFF';
  }

  return {
    visible: true,
    type: watermark.type || 'image',
    text: watermark.text || 'مافوق',
    imageUrl: effectiveImageUrl,
    color: effectiveColor,
    size: watermark.size || 48,
    opacity: watermark.opacity ?? 0.95,
    position: watermark.position || 'bottom-center',
    isDarkSlide: isDark,
  };
}
