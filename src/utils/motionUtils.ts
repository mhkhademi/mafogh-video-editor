import { AnimationConfig, AnimationType, ExitAnimationType } from '../types';

export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// Convert Persian digits to Latin
export function persianToLatinDigits(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[۰-۹]/g, (w) => String(persianDigits.indexOf(w)));
}

// Convert Latin digits to Persian
export function latinToPersianDigits(str: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/[0-9]/g, (w) => persianDigits[Number(w)]);
}

/**
 * Extracts number and format (prefix/suffix/Persian) from string content
 */
export function parseCounterTarget(content: string): {
  isPersian: boolean;
  prefix: string;
  target: number;
  suffix: string;
} {
  const isPersian = /[۰-۹]/.test(content);
  const latin = persianToLatinDigits(content);
  const match = latin.match(/^(.*?)(\d+(?:\.\d+)?)(.*?)$/);

  if (match) {
    return {
      isPersian,
      prefix: match[1] || '',
      target: parseFloat(match[2]),
      suffix: match[3] || '',
    };
  }

  return {
    isPersian,
    prefix: '',
    target: 100,
    suffix: '',
  };
}

/**
 * Compute the animated text for Counter
 */
export function getCounterDisplay(
  content: string,
  progress: number,
  config?: AnimationConfig
): string {
  const parsed = parseCounterTarget(content);
  const start = config?.counterStart ?? 0;
  const target = config?.counterEnd ?? parsed.target;
  const prefix = config?.counterPrefix !== undefined ? config.counterPrefix : parsed.prefix;
  const suffix = config?.counterSuffix !== undefined ? config.counterSuffix : parsed.suffix;

  const currentVal = Math.round(start + (target - start) * easeOutCubic(progress));
  const numStr = parsed.isPersian ? latinToPersianDigits(currentVal) : String(currentVal);

  return `${prefix}${numStr}${suffix}`;
}

/**
 * Compute the animated text for Typewriter
 */
export function getTypewriterDisplay(
  content: string,
  progress: number
): string {
  if (progress <= 0) return '';
  if (progress >= 1) return content;
  const charsCount = Math.max(1, Math.floor(progress * content.length));
  return content.slice(0, charsCount);
}

export interface MotionResult {
  opacity: number;
  offsetY: number;
  scale: number;
  displayText: string;
  isVisible: boolean;
}

/**
 * Universal motion calculator used by both Canvas DOM and Video Renderer
 */
export function calculateMotion(
  content: string,
  animation: AnimationConfig,
  slideLocalTime: number,
  slideDuration: number,
  forceVisible = false
): MotionResult {
  if (forceVisible) {
    return {
      opacity: 1,
      offsetY: 0,
      scale: 1,
      displayText: content,
      isVisible: true,
    };
  }

  const inDelay = animation.delay || 0;
  const inDuration = animation.duration || 0.6;
  const inEnd = inDelay + inDuration;

  // 1. Entrance Progress [0, 1]
  let inProgress = 0;
  if (slideLocalTime < inDelay) {
    inProgress = 0;
  } else if (slideLocalTime >= inEnd) {
    inProgress = 1;
  } else {
    inProgress = (slideLocalTime - inDelay) / inDuration;
  }

  // 2. Exit Progress [0, 1]
  const exitType = animation.exitType || 'none';
  const exitDuration = animation.exitDuration ?? 0.5;
  const outTime = animation.outTime !== undefined
    ? animation.outTime
    : (exitType !== 'none' ? slideDuration - exitDuration : slideDuration + 1);

  let exitProgress = 0;
  if (slideLocalTime >= outTime) {
    if (exitDuration <= 0) {
      exitProgress = 1;
    } else {
      exitProgress = Math.min(1, (slideLocalTime - outTime) / exitDuration);
    }
  }

  // If exit is completely finished, element is hidden
  if (exitProgress >= 1 && exitType !== 'none') {
    return {
      opacity: 0,
      offsetY: 0,
      scale: 1,
      displayText: content,
      isVisible: false,
    };
  }

  // If element has not entered yet
  if (inProgress <= 0) {
    return {
      opacity: 0,
      offsetY: 0,
      scale: 1,
      displayText: '',
      isVisible: false,
    };
  }

  const inEased = easeOutCubic(inProgress);
  const exitEased = easeOutCubic(exitProgress);

  let opacity = 1;
  let offsetY = 0;
  let scale = 1;

  // Apply entrance animation
  switch (animation.type) {
    case 'slide-up':
      offsetY = (1 - inEased) * 55;
      opacity = Math.min(1, inProgress * 1.5);
      break;
    case 'slide-down':
      offsetY = (1 - inEased) * -55;
      opacity = Math.min(1, inProgress * 1.5);
      break;
    case 'pop-in': {
      const backEased = easeOutBack(inProgress);
      scale = 0.4 + backEased * 0.6;
      opacity = Math.min(1, inProgress * 2);
      break;
    }
    case 'zoom-in':
      scale = 0.8 + inEased * 0.2;
      opacity = inEased;
      break;
    case 'typewriter':
    case 'counter':
    case 'fade-in':
    default:
      opacity = inEased;
      break;
  }

  // Apply exit animation
  if (exitProgress > 0 && exitType !== 'none') {
    const exitMultiplier = Math.max(0, 1 - exitEased);
    opacity *= exitMultiplier;

    if (exitType === 'slide-down') {
      offsetY += exitEased * 45;
    } else if (exitType === 'slide-up') {
      offsetY -= exitEased * 45;
    } else if (exitType === 'zoom-out') {
      scale *= Math.max(0, 1 - exitEased * 0.3);
    }
  }

  // Display text computation
  let displayText = content;
  if (animation.type === 'typewriter') {
    displayText = getTypewriterDisplay(content, inProgress);
  } else if (animation.type === 'counter') {
    displayText = getCounterDisplay(content, inProgress, animation);
  }

  return {
    opacity: Math.max(0, Math.min(1, opacity)),
    offsetY,
    scale: Math.max(0, scale),
    displayText,
    isVisible: opacity > 0.001,
  };
}
