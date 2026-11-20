import React, { useRef, useState, useEffect } from 'react';
import { Slide, WatermarkConfig } from '../types';
import { SlideElement } from './SlideElement';

interface SlideThumbnailProps {
  slide: Slide;
  watermark: WatermarkConfig;
}

export const SlideThumbnail: React.FC<SlideThumbnailProps> = ({ slide, watermark }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.14);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setScale(width / 1920);
        }
      }
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

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
      style={{ aspectRatio: '16 / 9' }}
      className="w-full rounded-lg border border-slate-700/80 overflow-hidden relative shadow-md pointer-events-none select-none bg-slate-900"
    >
      <div
        style={{
          width: '1920px',
          height: '1080px',
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

        {/* Branding Watermark */}
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
            {/* Official Mafogh Brand Horizontal Lockup */}
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
    </div>
  );
};
