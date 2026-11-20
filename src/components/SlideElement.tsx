import React from 'react';
import { Lock } from 'lucide-react';
import { SlideElement as ISlideElement } from '../types';

interface SlideElementProps {
  element: ISlideElement;
  slideLocalTime: number;
  slideDuration: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onResizeMouseDown?: (e: React.MouseEvent, handle: 'se' | 'sw' | 'ne' | 'nw' | 'e' | 'w') => void;
  isExporting?: boolean;
  forceVisible?: boolean;
}

// Cubic bezier ease-out approximation: smooth decelerate
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

// Spring-like pop easing
function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export const SlideElement: React.FC<SlideElementProps> = ({
  element,
  slideLocalTime,
  slideDuration,
  isSelected,
  onSelect,
  onMouseDown,
  onResizeMouseDown,
  isExporting = false,
  forceVisible = false,
}) => {
  const { animation } = element;
  const animStart = animation.delay || 0;
  const animDur = animation.duration || 0.6;
  const animEnd = animStart + animDur;

  // Calculate entrance progress [0, 1]
  let progress = forceVisible ? 1 : 0;
  if (!forceVisible) {
    if (slideLocalTime < animStart) {
      progress = 0;
    } else if (slideLocalTime >= animEnd) {
      progress = 1;
    } else {
      progress = (slideLocalTime - animStart) / animDur;
    }
  }

  // Calculate slide exit fade if near the end of slide
  const exitDuration = 0.5;
  let exitOpacity = 1;
  if (!forceVisible && slideLocalTime > slideDuration - exitDuration) {
    const exitProgress = (slideLocalTime - (slideDuration - exitDuration)) / exitDuration;
    exitOpacity = Math.max(0, 1 - easeOutCubic(exitProgress));
  }

  // Compute visual transform based on animation type
  let opacity = 1;
  let animTransform = '';

  if (forceVisible) {
    opacity = 1;
    animTransform = '';
  } else if (progress === 0) {
    opacity = 0;
  } else {
    const eased = easeOutCubic(progress);
    switch (animation.type) {
      case 'slide-up': {
        const translateY = (1 - eased) * 50; // starts 50px below
        opacity = Math.min(1, progress * 1.5) * exitOpacity;
        animTransform = `translateY(${translateY}px)`;
        break;
      }
      case 'slide-down': {
        const translateY = (1 - eased) * -50;
        opacity = Math.min(1, progress * 1.5) * exitOpacity;
        animTransform = `translateY(${translateY}px)`;
        break;
      }
      case 'pop-in': {
        const backEased = easeOutBack(progress);
        const scale = 0.4 + backEased * 0.6;
        opacity = Math.min(1, progress * 2) * exitOpacity;
        animTransform = `scale(${Math.max(0, scale)})`;
        break;
      }
      case 'zoom-in': {
        const scale = 0.8 + eased * 0.2;
        opacity = eased * exitOpacity;
        animTransform = `scale(${scale})`;
        break;
      }
      case 'fade-in':
      default: {
        opacity = eased * exitOpacity;
        animTransform = '';
        break;
      }
    }
  }

  // For images, width is an explicit percentage (defaults to 35%) so preview matches canvasRenderer exactly
  const elementWidth = element.type === 'image'
    ? (element.width ?? 35)
    : element.width;

  // Position based on percentage
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    transform: animTransform ? `translate(-50%, -50%) ${animTransform}` : 'translate(-50%, -50%)',
    width: elementWidth ? `${elementWidth}%` : 'max-content',
    maxWidth: elementWidth ? undefined : '92%',
    opacity,
    transition: 'outline 0.15s ease',
  };

  // Render element content based on type
  const renderContent = () => {
    switch (element.type) {
      case 'title':
        return (
          <h1
            style={{
              color: element.color || '#0f172a',
              fontSize: `${element.fontSize || 72}px`,
              fontWeight: element.fontWeight || '800',
              textAlign: element.textAlign || 'center',
              lineHeight: 1.25,
            }}
            className={`w-full tracking-tight select-none ${element.nowrap ? 'whitespace-nowrap' : ''}`}
          >
            {element.content}
          </h1>
        );

      case 'subtitle':
        return (
          <p
            style={{
              color: element.color || '#64748b',
              fontSize: `${element.fontSize || 36}px`,
              fontWeight: element.fontWeight || '400',
              textAlign: element.textAlign || 'center',
              lineHeight: 1.4,
            }}
            className={`w-full tracking-normal select-none ${element.nowrap ? 'whitespace-nowrap' : ''}`}
          >
            {element.content}
          </p>
        );

      case 'paragraph':
        return (
          <p
            style={{
              color: element.color || '#334155',
              fontSize: `${element.fontSize || 34}px`,
              fontWeight: element.fontWeight || '500',
              textAlign: element.textAlign || 'center',
              lineHeight: 1.8,
            }}
            className={`w-full leading-relaxed select-none ${element.nowrap ? 'whitespace-nowrap' : ''}`}
          >
            {element.content}
          </p>
        );

      case 'list-box':
        return (
          <div
            className="w-full flex items-stretch border border-pink-700/40 rounded-lg overflow-hidden shadow-sm"
            style={{
              backgroundColor: '#ffffff',
            }}
          >
            {/* English / Subtitle section on left */}
            <div
              className="flex-1 px-8 py-4 flex items-center justify-start text-slate-700 font-sans text-left border-r border-pink-100"
              style={{ fontSize: '26px' }}
            >
              {element.subcontent}
            </div>

            {/* Persian text on right with brand magenta background */}
            <div
              className="w-2/5 px-8 py-4 flex items-center justify-center font-bold text-white shadow-inner"
              style={{
                backgroundColor: element.backgroundColor || '#9d174d',
                fontSize: '28px',
              }}
            >
              {element.content}
            </div>
          </div>
        );

      case 'card':
        return (
          <div
            className="flex items-center justify-center shadow-lg"
            style={{
              width: `${(element.fontSize || 80) * 1.8}px`,
              height: `${(element.fontSize || 80) * 1.8}px`,
              borderRadius: `${element.borderRadius ?? 999}px`,
              backgroundColor: element.backgroundColor || '#9d174d',
              color: element.color || '#ffffff',
              fontSize: `${element.fontSize || 80}px`,
              fontWeight: '900',
            }}
          >
            {element.content}
          </div>
        );

      case 'image':
        return (
          <img
            src={element.content}
            alt="slide element"
            className="rounded-xl shadow-md object-contain max-h-[600px] pointer-events-none"
            style={{ width: '100%' }}
          />
        );

      default:
        return <div>{element.content}</div>;
    }
  };

  return (
    <div
      style={style}
      onMouseDown={onMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={`group relative select-none ${
        isSelected
          ? element.locked
            ? 'cursor-default ring-2 ring-amber-500/80 ring-offset-2 ring-offset-transparent shadow-xl rounded-lg'
            : 'cursor-grab active:cursor-grabbing ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent shadow-2xl rounded-lg'
          : 'cursor-pointer hover:ring-1 hover:ring-indigo-400/50'
      }`}
    >
      {renderContent()}

      {/* Interactive Selection Resize Handles & coordinate indicator */}
      {isSelected && !isExporting && (
        element.locked ? (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-amber-600/90 text-white rounded-md text-[11px] font-bold shadow-lg pointer-events-none flex items-center gap-1.5 whitespace-nowrap border border-amber-400/40 z-30">
            <Lock size={12} />
            <span>المان قفل شده است</span>
          </div>
        ) : (
          <>
            {/* Top-right handle */}
            <div
              onMouseDown={(e) => onResizeMouseDown?.(e, 'ne')}
              className="absolute -top-2.5 -right-2.5 w-4 h-4 bg-white rounded-full border-2 border-indigo-600 shadow-md flex items-center justify-center cursor-nesw-resize hover:scale-125 transition-transform z-40"
              title="تغییر اندازه"
            >
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
            </div>

            {/* Top-left handle */}
            <div
              onMouseDown={(e) => onResizeMouseDown?.(e, 'nw')}
              className="absolute -top-2.5 -left-2.5 w-4 h-4 bg-white rounded-full border-2 border-indigo-600 shadow-md flex items-center justify-center cursor-nwse-resize hover:scale-125 transition-transform z-40"
              title="تغییر اندازه"
            >
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
            </div>

            {/* Bottom-right handle */}
            <div
              onMouseDown={(e) => onResizeMouseDown?.(e, 'se')}
              className="absolute -bottom-2.5 -right-2.5 w-4 h-4 bg-white rounded-full border-2 border-indigo-600 shadow-md flex items-center justify-center cursor-nwse-resize hover:scale-125 transition-transform z-40"
              title="تغییر اندازه"
            >
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
            </div>

            {/* Bottom-left handle */}
            <div
              onMouseDown={(e) => onResizeMouseDown?.(e, 'sw')}
              className="absolute -bottom-2.5 -left-2.5 w-4 h-4 bg-white rounded-full border-2 border-indigo-600 shadow-md flex items-center justify-center cursor-nesw-resize hover:scale-125 transition-transform z-40"
              title="تغییر اندازه"
            >
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
            </div>

            {/* Right edge handle (Widen/Narrow box width independently) */}
            <div
              onMouseDown={(e) => onResizeMouseDown?.(e, 'e')}
              className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-2.5 h-7 bg-white rounded-full border-2 border-indigo-600 shadow-md flex items-center justify-center cursor-ew-resize hover:scale-125 hover:bg-indigo-50 transition-all z-40"
              title="تغییر عرض کادر (تک‌خطی یا چندخطی کردن متن)"
            >
              <div className="w-0.5 h-3 bg-indigo-600 rounded-full"></div>
            </div>

            {/* Left edge handle (Widen/Narrow box width independently) */}
            <div
              onMouseDown={(e) => onResizeMouseDown?.(e, 'w')}
              className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-2.5 h-7 bg-white rounded-full border-2 border-indigo-600 shadow-md flex items-center justify-center cursor-ew-resize hover:scale-125 hover:bg-indigo-50 transition-all z-40"
              title="تغییر عرض کادر (تک‌خطی یا چندخطی کردن متن)"
            >
              <div className="w-0.5 h-3 bg-indigo-600 rounded-full"></div>
            </div>

            {/* Floating coordinate and size badge */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-indigo-600 text-white rounded-md text-[11px] font-mono font-bold shadow-lg pointer-events-none flex items-center gap-1.5 whitespace-nowrap border border-indigo-400/40 z-30">
              <span>X: {element.x}%</span>
              <span className="opacity-60">|</span>
              <span>Y: {element.y}%</span>
              {element.type !== 'image' && element.fontSize && (
                <>
                  <span className="opacity-60">|</span>
                  <span>فونت: {element.fontSize}px</span>
                </>
              )}
              {elementWidth && (
                <>
                  <span className="opacity-60">|</span>
                  <span>عرض: {elementWidth}%</span>
                </>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
};
