import React from 'react';
import { Slide, WatermarkConfig } from '../types';
import { Plus, Copy, Trash2, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { SlideThumbnail } from './SlideThumbnail';

interface SlideSidebarProps {
  slides: Slide[];
  activeSlideId: string;
  watermark: WatermarkConfig;
  onSelectSlide: (id: string) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (id: string) => void;
  onDeleteSlide: (id: string) => void;
  onMoveSlide: (index: number, direction: 'up' | 'down') => void;
  onUpdateDuration: (id: string, duration: number) => void;
}

export const SlideSidebar: React.FC<SlideSidebarProps> = ({
  slides,
  activeSlideId,
  watermark,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  onUpdateDuration,
}) => {
  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full select-none shrink-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-slate-100 text-sm truncate">صفحات ویدیو</span>
          <span className="px-2 py-0.5 text-xs bg-slate-800 text-indigo-400 rounded-full font-mono font-bold shrink-0 border border-slate-700/60">
            {slides.length}
          </span>
        </div>
        <button
          onClick={onAddSlide}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm cursor-pointer shrink-0"
          title="افزودن اسلاید جدید"
        >
          <Plus size={15} />
          <span>افزودن</span>
        </button>
      </div>

      {/* Slide Thumbnails List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;

          return (
            <div
              key={slide.id}
              onClick={() => onSelectSlide(slide.id)}
              className={`group relative rounded-xl border p-3 transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800/90 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {/* Top metadata row with clean non-overlapping layout */}
              <div className="flex items-center justify-between gap-2 mb-2.5 text-xs">
                {/* Title & Index Badge */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-5 h-5 rounded-md bg-slate-700/90 text-indigo-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {index + 1}
                  </span>
                  <span
                    className="truncate font-bold text-slate-200 text-xs"
                    title={slide.title}
                  >
                    {slide.title}
                  </span>
                </div>

                {/* Duration Control (shrink-0, perfectly ordered) */}
                <div
                  className="flex items-center gap-1.5 text-slate-300 bg-slate-800/90 px-2 py-1 rounded-md border border-slate-700/70 shrink-0 select-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Clock size={12} className="text-amber-400 shrink-0" />
                  <input
                    type="number"
                    min="1"
                    max="60"
                    step="0.5"
                    value={slide.duration}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        onUpdateDuration(slide.id, val);
                      }
                    }}
                    className="w-7 bg-transparent text-center font-mono text-xs text-amber-300 font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[10px] text-slate-400">ثانیه</span>
                </div>
              </div>

              {/* True 1:1 Scaled Slide Preview (Exact replicate of slide contents) */}
              <SlideThumbnail slide={slide} watermark={watermark} />

              {/* Action Toolbar on Hover / Active */}
              <div
                className={`mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1">
                  <button
                    disabled={index === 0}
                    onClick={() => onMoveSlide(index, 'up')}
                    className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-700/60 transition-colors"
                    title="انتقال به بالا"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    disabled={index === slides.length - 1}
                    onClick={() => onMoveSlide(index, 'down')}
                    className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-700/60 transition-colors"
                    title="انتقال به پایین"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDuplicateSlide(slide.id)}
                    className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-700/60 transition-colors"
                    title="تکرار / کپی اسلاید"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteSlide(slide.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700/60 transition-colors"
                    title="حذف اسلاید"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
