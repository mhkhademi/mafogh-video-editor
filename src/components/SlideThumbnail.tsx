import React, { useRef, useState, useEffect } from 'react';
import { Slide, WatermarkConfig } from '../types';
import { SlideElement } from './SlideElement';
import { resolveSlideWatermark } from '../utils/watermarkResolver';

interface SlideThumbnailProps {
  slide: Slide;
  watermark: WatermarkConfig;
  projectWidth?: number;
  projectHeight?: number;
}

export const SlideThumbnail: React.FC<SlideThumbnailProps> = ({
  slide,
  watermark,
  projectWidth = 1920,
  projectHeight = 1080,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.14);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setScale(width / projectWidth);
        }
      }
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [projectWidth]);

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
      style={{ aspectRatio: `${projectWidth} / ${projectHeight}` }}
      className="w-full rounded-lg border border-slate-700/80 overflow-hidden relative shadow-md pointer-events-none select-none bg-slate-900"
    >
      <div
        style={{
          width: `${projectWidth}px`,
          height: `${projectHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          left: 0,
          top: 0,
          ...getBackgroundStyle(),
        }}
        className="absolute"
      >
        {/* Exact Slide Elements 1:1 in fully assembled state */}
        {slide.elements.map((el) => (
          <SlideElement
            key={el.id}
            element={el}
            slideLocalTime={0}
            slideDuration={slide.duration}
            isSelected={false}
            forceVisible={true}
          />
        ))}

        {/* Branding Watermark with Smart Auto-Contrast */}
        {(() => {
          const wm = resolveSlideWatermark(watermark, slide);
          if (!wm.visible) return null;

          return (
            <div
              className={`absolute flex items-center select-none pointer-events-none transition-all duration-300 ${
                wm.position === 'bottom-center'
                  ? 'bottom-10 left-1/2 -translate-x-1/2'
                  : wm.position === 'bottom-right'
                  ? 'bottom-10 right-12'
                  : wm.position === 'bottom-left'
                  ? 'bottom-10 left-12'
                  : 'top-10 right-12'
              }`}
              style={{ opacity: wm.opacity }}
            >
              {wm.type === 'text' ? (
                <span
                  style={{
                    fontSize: `${wm.size * 0.9}px`,
                    color: wm.color,
                    fontWeight: 900,
                    fontFamily: 'Vazirmatn, sans-serif',
                  }}
                >
                  {wm.text}
                </span>
              ) : wm.color ? (
                <div
                  style={{
                    height: `${wm.size * 1.15}px`,
                    width: `${wm.size * 1.15 * 3.3}px`,
                    backgroundColor: wm.color,
                    WebkitMaskImage: `url("${wm.imageUrl}")`,
                    maskImage: `url("${wm.imageUrl}")`,
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                  }}
                />
              ) : (
                <img
                  src={wm.imageUrl}
                  alt={wm.text}
                  className="object-contain"
                  style={{
                    height: `${wm.size * 1.15}px`,
                    width: 'auto',
                  }}
                />
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
