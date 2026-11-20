import React, { useRef, useState, useEffect } from 'react';
import { Slide, WatermarkConfig, SlideElement as ISlideElement } from '../types';
import { SlideElement } from './SlideElement';
import {
  Crosshair,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
} from 'lucide-react';

interface CanvasStageProps {
  slide: Slide;
  slideLocalTime: number;
  watermark: WatermarkConfig;
  selectedElementId: string | null;
  width?: number;
  height?: number;
  onSelectElement: (id: string | null) => void;
  onUpdateElement?: (elementId: string, partial: Partial<ISlideElement>) => void;
  isExporting?: boolean;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  slide,
  slideLocalTime,
  watermark,
  selectedElementId,
  width = 1920,
  height = 1080,
  onSelectElement,
  onUpdateElement,
  isExporting = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [snapping, setSnapping] = useState<{ x: boolean; y: boolean }>({ x: false, y: false });

  // Drag element with mouse directly on canvas
  const handleElementMouseDown = (e: React.MouseEvent, el: ISlideElement) => {
    if (e.button !== 0 || isExporting) return;
    e.stopPropagation();
    onSelectElement(el.id);

    if (!onUpdateElement) return;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startElX = el.x;
    const startElY = el.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaScreenX = moveEvent.clientX - startMouseX;
      const deltaScreenY = moveEvent.clientY - startMouseY;

      // Convert screen pixels to canvas coordinates accurately
      const deltaCanvasX = deltaScreenX / scale;
      const deltaCanvasY = deltaScreenY / scale;

      const deltaPercentX = (deltaCanvasX / width) * 100;
      const deltaPercentY = (deltaCanvasY / height) * 100;

      let calcX = startElX + deltaPercentX;
      let calcY = startElY + deltaPercentY;

      // Smart snapping to center guide (50%)
      let snapX = false;
      let snapY = false;

      if (Math.abs(calcX - 50) < 1.8) {
        calcX = 50;
        snapX = true;
      }
      if (Math.abs(calcY - 50) < 1.8) {
        calcY = 50;
        snapY = true;
      }

      setSnapping({ x: snapX, y: snapY });

      const newX = Math.round(Math.max(2, Math.min(98, calcX)));
      const newY = Math.round(Math.max(2, Math.min(98, calcY)));

      onUpdateElement(el.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setSnapping({ x: false, y: false });
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Interactive resizing of elements via corner handles
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    el: ISlideElement,
    handle: 'se' | 'sw' | 'ne' | 'nw' | 'e' | 'w'
  ) => {
    if (e.button !== 0 || isExporting) return;
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(el.id);

    if (!onUpdateElement) return;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startFontSize = el.fontSize || (el.type === 'title' ? 72 : 36);
    const startWidth = el.width || (el.type === 'paragraph' ? 80 : 45);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaScreenX = moveEvent.clientX - startMouseX;
      const deltaScreenY = moveEvent.clientY - startMouseY;

      // Scale to 1920x1080 canvas coordinates
      const deltaCanvasX = deltaScreenX / scale;
      const deltaCanvasY = deltaScreenY / scale;

      // Dedicated horizontal side handles: widen or narrow the box width ONLY
      if (handle === 'e' || handle === 'w') {
        const deltaX = handle === 'e' ? deltaCanvasX : -deltaCanvasX;
        // Elements are centered at (x, y), so expanding one side expands width symmetrically by 2x
        const widthDeltaPercent = ((deltaX * 2) / 1920) * 100;
        const newWidth = Math.round(Math.max(15, Math.min(98, startWidth + widthDeltaPercent)));
        onUpdateElement(el.id, { width: newWidth });
        return;
      }

      // Corner handles: Scale font size or overall scale
      let delta = 0;
      if (handle === 'se') delta = (deltaCanvasX + deltaCanvasY) / 2;
      else if (handle === 'sw') delta = (-deltaCanvasX + deltaCanvasY) / 2;
      else if (handle === 'ne') delta = (deltaCanvasX - deltaCanvasY) / 2;
      else if (handle === 'nw') delta = (-deltaCanvasX - deltaCanvasY) / 2;

      const scaleFactor = Math.max(0.2, (200 + delta) / 200);
      const updates: Partial<ISlideElement> = {};

      // Text or Card icon: update font size
      if (
        el.type === 'title' ||
        el.type === 'subtitle' ||
        el.type === 'paragraph' ||
        el.type === 'card'
      ) {
        updates.fontSize = Math.round(Math.max(14, Math.min(200, startFontSize * scaleFactor)));
      }

      // Images: update width percentage
      if (el.type === 'image') {
        const widthDeltaPercent = (delta / width) * 100;
        updates.width = Math.round(Math.max(10, Math.min(95, startWidth + widthDeltaPercent)));
      }

      onUpdateElement(el.id, updates);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Auto-scale stage to fit the viewport container perfectly
  useEffect(() => {
    if (isExporting) {
      setScale(1);
      return;
    }

    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const targetWidth = width;
      const targetHeight = height;

      // Available space with padding
      const availW = clientWidth - 48;
      const availH = clientHeight - 48;

      const scaleX = availW / targetWidth;
      const scaleY = availH / targetHeight;
      const nextScale = Math.min(scaleX, scaleY, 1);
      setScale(Math.max(0.2, nextScale));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [isExporting, width, height]);

  // Background style
  const getBackgroundStyle = (): React.CSSProperties => {
    const bg = slide.background;
    if (bg.type === 'gradient' && bg.color2) {
      return {
        background: `linear-gradient(${bg.gradientAngle || 135}deg, ${bg.color1}, ${bg.color2})`,
      };
    }
    if (bg.type === 'image' && bg.imageUrl) {
      return {
        backgroundImage: `url(${bg.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {
      backgroundColor: bg.color1 || '#ffffff',
    };
  };

  return (
    <div
      ref={containerRef}
      id="canvas-stage-wrapper"
      className="flex-1 w-full h-full flex items-center justify-center p-6 bg-slate-900/60 overflow-hidden relative select-none"
      onClick={() => onSelectElement(null)}
    >
      {/* Real-time Video Render Canvas */}
      <div
        id="video-canvas"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          ...getBackgroundStyle(),
        }}
        className="relative shrink-0 shadow-2xl rounded-sm overflow-hidden select-none"
      >
        {/* Render Slide Elements */}
        {slide.elements.map((el) => (
          <SlideElement
            key={el.id}
            element={el}
            slideLocalTime={slideLocalTime}
            slideDuration={slide.duration}
            isSelected={selectedElementId === el.id}
            onSelect={() => onSelectElement(el.id)}
            onMouseDown={(e) => handleElementMouseDown(e, el)}
            onResizeMouseDown={(e, handle) => handleResizeMouseDown(e, el, handle)}
            isExporting={isExporting}
          />
        ))}

        {/* Smart Guide Snap Lines (Figma/Canva style) */}
        {snapping.x && (
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-pink-500 shadow-[0_0_10px_#ec4899] z-50 pointer-events-none"></div>
        )}
        {snapping.y && (
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-pink-500 shadow-[0_0_10px_#ec4899] z-50 pointer-events-none"></div>
        )}

        {/* Branding Watermark (Persistent across slides like in "what is ltv.mp4") */}
        {watermark.enabled && (
          <div
            className={`absolute flex items-center select-none pointer-events-none ${
              watermark.position === 'bottom-center'
                ? 'bottom-10 left-1/2 -translate-x-1/2'
                : watermark.position === 'bottom-right'
                ? 'bottom-10 right-12'
                : watermark.position === 'bottom-left'
                ? 'bottom-10 left-12'
                : 'top-10 right-12'
            }`}
            style={{ opacity: watermark.opacity }}
          >
            {/* Official Mafogh Brand Horizontal Lockup (Emblem on Right, Stylized Wordmark on Left) */}
            <img
              src="/mafogh-logo-brand.svg"
              alt="مافوق"
              className="object-contain"
              style={{
                height: `${(watermark.size || 32) * 1.15}px`,
                width: 'auto',
              }}
            />
          </div>
        )}
      </div>

      {/* Floating Canvas Quick Alignment Toolbar */}
      {selectedElementId && !isExporting && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-1.5 text-xs z-40 select-none animate-fadeIn"
        >
          <span className="text-slate-400 font-semibold text-[11px] ml-1">تراز سریع:</span>

          <button
            onClick={() => onUpdateElement?.(selectedElementId, { x: 50, y: 50 })}
            className="p-1.5 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="مرکز کامل صفحه (افقی و عمودی)"
          >
            <Crosshair size={15} />
            <span className="text-[11px] font-bold">مرکز</span>
          </button>

          <div className="w-px h-4 bg-slate-700 mx-0.5"></div>

          <button
            onClick={() => onUpdateElement?.(selectedElementId, { x: 80 })}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="راست‌چین روی صفحه"
          >
            <AlignHorizontalJustifyEnd size={15} />
          </button>
          <button
            onClick={() => onUpdateElement?.(selectedElementId, { x: 50 })}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="وسط‌چین افقی"
          >
            <AlignHorizontalJustifyCenter size={15} />
          </button>
          <button
            onClick={() => onUpdateElement?.(selectedElementId, { x: 20 })}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="چپ‌چین روی صفحه"
          >
            <AlignHorizontalJustifyStart size={15} />
          </button>

          <div className="w-px h-4 bg-slate-700 mx-0.5"></div>

          <button
            onClick={() => onUpdateElement?.(selectedElementId, { y: 20 })}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="بالای صفحه"
          >
            <AlignVerticalJustifyStart size={15} />
          </button>
          <button
            onClick={() => onUpdateElement?.(selectedElementId, { y: 50 })}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="وسط‌چین عمودی"
          >
            <AlignVerticalJustifyCenter size={15} />
          </button>
          <button
            onClick={() => onUpdateElement?.(selectedElementId, { y: 80 })}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="پایین صفحه"
          >
            <AlignVerticalJustifyEnd size={15} />
          </button>
        </div>
      )}

      {/* Floating Canvas Scale Indicator */}
      <div className="absolute bottom-4 left-6 px-3 py-1 bg-slate-800/80 backdrop-blur rounded-lg text-xs text-slate-400 border border-slate-700/60 flex items-center gap-2">
        <span>مقیاس پیش‌نمایش:</span>
        <span className="font-mono text-indigo-400">{Math.round(scale * 100)}%</span>
        <span className="text-slate-500">|</span>
        <span>1080p (1920x1080)</span>
      </div>
    </div>
  );
};
