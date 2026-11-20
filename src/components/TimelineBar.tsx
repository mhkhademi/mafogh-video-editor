import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Layers, ChevronUp, ChevronDown, Type, Image as ImageIcon, ListOrdered } from 'lucide-react';
import { Slide, SlideElement } from '../types';

interface TimelineBarProps {
  slides: Slide[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onRewind: () => void;
  activeSlideId: string;
  activeSlide?: Slide;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onUpdateElement?: (elementId: string, partial: Partial<SlideElement>) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  slides,
  currentTime,
  totalDuration,
  isPlaying,
  onTogglePlay,
  onSeek,
  onRewind,
  activeSlideId,
  activeSlide,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const [showElementTracks, setShowElementTracks] = useState<boolean>(false);

  // Calculate time from clientX position
  const seekToMousePosition = (clientX: number) => {
    if (!trackRef.current || totalDuration === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * totalDuration);
  };

  // Dragging / Scrubbing handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    seekToMousePosition(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      seekToMousePosition(e.clientX);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [totalDuration, onSeek]);

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <footer className={`bg-slate-950 border-t border-slate-800 flex flex-col justify-between px-6 py-2 select-none shrink-0 z-10 transition-all duration-200 ${
      showElementTracks ? 'h-64' : 'h-24'
    }`}>
      {/* Top row: Transport Controls and Timings */}
      <div className="flex items-center justify-between">
        {/* Playback Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRewind}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="شروع مجدد (Rewind)"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-indigo-600/30 cursor-pointer"
            title={isPlaying ? 'توقف (Space)' : 'پخش پیش‌نمایش (Space)'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Time display */}
          <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-indigo-400 font-bold">{formatTime(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Toggle Elements In/Out Track Button & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowElementTracks(!showElementTracks)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
              showElementTracks
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="نمایش/پنهان‌سازی تایم‌لاین لایه‌ها و زمان‌بندی المان‌ها"
          >
            <Layers size={14} />
            <span>زمان‌بندی المان‌ها (In/Out)</span>
            {showElementTracks ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <Sparkles size={14} className="text-amber-400" />
            <span>اسکراب بلادرنگ ۶۰ فریم</span>
          </div>
        </div>
      </div>

      {/* Slide Division Track */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        dir="ltr"
        className="w-full h-8 relative cursor-pointer select-none group"
      >
        {/* Slide Blocks track container (rounded & clipped cleanly) */}
        <div className="w-full h-7 mt-0.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center overflow-hidden">
          {slides.map((slide, i) => {
            const widthPercent = totalDuration > 0 ? (slide.duration / totalDuration) * 100 : 0;
            const isActive = slide.id === activeSlideId;

            return (
              <div
                key={slide.id}
                style={{ width: `${widthPercent}%` }}
                className={`h-full border-r border-slate-800 flex items-center justify-center px-2 text-[11px] font-medium transition-colors relative overflow-hidden ${
                  isActive
                    ? 'bg-indigo-950/40 text-indigo-300'
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <span className="truncate" dir="rtl">
                  {i + 1}. {slide.title}
                </span>
                <span className="text-[9px] font-mono text-slate-500 ml-1">({slide.duration}s)</span>
              </div>
            );
          })}
        </div>

        {/* Playhead Needle (not clipped, with full top pin head visible, 60fps real-time synchronized) */}
        <div
          style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_10px_#f59e0b] z-30 pointer-events-none -ml-[1px]"
        >
          {/* Top pin indicator (diamond shape, 100% complete & uncropped) */}
          <div className="w-3 h-3 bg-amber-400 rounded-sm rotate-45 -ml-[5px] shadow-lg border-2 border-slate-950"></div>
        </div>
      </div>

      {/* Expandable In/Out Element Timeline Tracks */}
      {showElementTracks && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 overflow-y-auto max-h-36 space-y-1.5 animate-fadeIn">
          {activeSlide && activeSlide.elements.length > 0 ? (
            activeSlide.elements.map((el) => {
              const slideDur = activeSlide.duration || 5;
              const inTime = Math.max(0, Math.min(slideDur, el.animation.delay || 0));
              const outTime = el.animation.outTime !== undefined
                ? Math.max(inTime + 0.2, Math.min(slideDur, el.animation.outTime))
                : slideDur;
              const leftPercent = (inTime / slideDur) * 100;
              const widthPercent = Math.max(5, ((outTime - inTime) / slideDur) * 100);
              const isSelected = selectedElementId === el.id;

              return (
                <div
                  key={el.id}
                  onClick={() => onSelectElement?.(el.id)}
                  className={`flex items-center gap-3 px-2 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                    isSelected ? 'bg-indigo-950/50 border border-indigo-500/40' : 'hover:bg-slate-900/60'
                  }`}
                >
                  {/* Element Icon and Label */}
                  <div className="w-28 flex items-center gap-1.5 truncate text-[11px] text-slate-300 shrink-0">
                    {el.type === 'image' ? (
                      <ImageIcon size={12} className="text-violet-400 shrink-0" />
                    ) : el.type === 'title' ? (
                      <Type size={12} className="text-indigo-400 shrink-0" />
                    ) : (
                      <ListOrdered size={12} className="text-pink-400 shrink-0" />
                    )}
                    <span className="truncate">{el.content}</span>
                  </div>

                  {/* Visual In/Out Span Bar on Active Slide Duration */}
                  <div className="flex-1 h-5 bg-slate-900/80 rounded border border-slate-800 relative overflow-hidden" dir="ltr">
                    <div
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      className={`h-full absolute rounded transition-all flex items-center justify-between px-2 text-[10px] font-mono font-bold ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-md'
                          : 'bg-indigo-600/40 text-indigo-200 hover:bg-indigo-600/60'
                      }`}
                    >
                      <span>{inTime.toFixed(1)}s</span>
                      <span className="text-[9px] opacity-80 uppercase tracking-tighter">
                        {el.animation.type} {el.animation.exitType && el.animation.exitType !== 'none' ? `➔ ${el.animation.exitType}` : ''}
                      </span>
                      <span>{outTime.toFixed(1)}s</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-2 text-slate-500 text-xs">
              هیچ المانی در اسلاید فعال وجود ندارد.
            </div>
          )}
        </div>
      )}
    </footer>
  );
};
