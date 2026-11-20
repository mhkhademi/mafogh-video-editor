import React, { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { Slide } from '../types';

interface TimelineBarProps {
  slides: Slide[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onRewind: () => void;
  activeSlideId: string;
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
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

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
    <footer className="h-24 bg-slate-950 border-t border-slate-800 flex flex-col justify-between px-6 py-2 select-none shrink-0 z-10">
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

        {/* Hints and status */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Sparkles size={14} className="text-amber-400" />
          <span>اسکراب بلادرنگ تایم‌لاین | پیش‌نمایش زنده ۶۰ فریم</span>
        </div>
      </div>

      {/* Bottom row: Interactive Timeline Track with Slide Divisions */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        dir="ltr"
        className="w-full h-10 relative cursor-pointer select-none group"
      >
        {/* Slide Blocks track container (rounded & clipped cleanly) */}
        <div className="w-full h-8 mt-1 bg-slate-900 rounded-lg border border-slate-800 flex items-center overflow-hidden">
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
          className="absolute top-0 bottom-1 w-0.5 bg-amber-400 shadow-[0_0_10px_#f59e0b] z-30 pointer-events-none -ml-[1px]"
        >
          {/* Top pin indicator (diamond shape, 100% complete & uncropped) */}
          <div className="w-3.5 h-3.5 bg-amber-400 rounded-sm rotate-45 -ml-[6px] shadow-lg border-2 border-slate-950"></div>
        </div>
      </div>
    </footer>
  );
};
