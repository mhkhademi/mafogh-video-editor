import React, { useState, useRef, useEffect } from 'react';

export interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  color?: 'indigo' | 'pink' | 'amber' | 'emerald';
  hint?: string;
  action?: React.ReactNode;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  icon,
  color = 'indigo',
  hint,
  action,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localVal, setLocalVal] = useState<number>(value);
  const trackRef = useRef<HTMLDivElement>(null);

  // Synchronize local optimistic value with incoming prop value
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  // Use localVal for zero-latency 60fps tracking during drag
  const activeVal = isDragging ? localVal : value;

  // Compute percentage [0, 100]
  const pct = Math.max(0, Math.min(100, ((activeVal - min) / (max - min)) * 100));
  // Keep the bubble tail safely within the speech bubble's rounded corners
  const clampedTailPct = Math.max(14, Math.min(86, pct));

  // Color schemes (Gradient track, thumb glow, badge colors)
  const colorSchemes = {
    indigo: {
      gradient: 'from-violet-600 via-indigo-500 to-pink-500',
      activeThumb: 'border-indigo-400 shadow-[0_0_14px_rgba(99,102,241,0.6)]',
      thumbDot: 'bg-indigo-600',
      badgeBg: 'bg-gradient-to-r from-violet-600 to-indigo-600',
      badgeBorder: 'border-indigo-400/50',
      badgeText: 'text-indigo-300',
      tooltipTail: 'bg-indigo-600 border-r border-b border-indigo-400/40',
      ringGlow: 'ring-indigo-500/30',
    },
    pink: {
      gradient: 'from-pink-600 via-rose-500 to-amber-500',
      activeThumb: 'border-pink-400 shadow-[0_0_14px_rgba(244,63,94,0.6)]',
      thumbDot: 'bg-pink-600',
      badgeBg: 'bg-gradient-to-r from-rose-600 to-pink-600',
      badgeBorder: 'border-pink-400/50',
      badgeText: 'text-pink-300',
      tooltipTail: 'bg-pink-600 border-r border-b border-pink-400/40',
      ringGlow: 'ring-pink-500/30',
    },
    amber: {
      gradient: 'from-amber-600 via-orange-500 to-rose-500',
      activeThumb: 'border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.6)]',
      thumbDot: 'bg-amber-600',
      badgeBg: 'bg-gradient-to-r from-amber-600 to-orange-600',
      badgeBorder: 'border-amber-400/50',
      badgeText: 'text-amber-300',
      tooltipTail: 'bg-amber-600 border-r border-b border-amber-400/40',
      ringGlow: 'ring-amber-500/30',
    },
    emerald: {
      gradient: 'from-emerald-600 via-teal-500 to-cyan-500',
      activeThumb: 'border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.6)]',
      thumbDot: 'bg-emerald-600',
      badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
      badgeBorder: 'border-emerald-400/50',
      badgeText: 'text-emerald-300',
      tooltipTail: 'bg-emerald-600 border-r border-b border-emerald-400/40',
      ringGlow: 'ring-emerald-500/30',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  // Format value display nicely
  const displayVal = step < 1 ? activeVal.toFixed(1) : Math.round(activeVal);

  return (
    <div className="space-y-1.5 select-none group">
      {/* Header Row: Label on right (RTL), Value badge and optional Action on left */}
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-slate-300 flex items-center gap-1.5">
          {icon && <span className="opacity-80">{icon}</span>}
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-2">
          {action}
          <div
            dir="ltr"
            className="flex items-center gap-1 font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700/70 shadow-inner"
          >
            <span className={scheme.badgeText}>{displayVal}</span>
            {unit && <span className="text-[10px] text-slate-400">{unit}</span>}
          </div>
        </div>
      </div>

      {/* Interactive Range Slider Container */}
      <div
        className="relative pt-6 pb-1.5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsDragging(false);
        }}
        ref={trackRef}
      >
        {/* Dynamic Floating Tooltip Badge with downward Arrow (Temani Afif style) */}
        {/* Outer container: NO transition on left / transform so it tracks mouse at 0ms latency */}
        <div
          dir="ltr"
          style={{
            left: `${pct}%`,
            transform: `translateX(-${pct}%)`,
          }}
          className="absolute top-0 pointer-events-none z-20"
        >
          {/* Inner container: smooth scale / opacity transition for hover/active */}
          <div
            className={`transition-[opacity,transform] duration-150 ease-out origin-bottom ${
              isHovered || isDragging
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-75 translate-y-1'
            }`}
          >
            <div
              className={`relative px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold text-white shadow-xl flex items-center gap-1 ${scheme.badgeBg} border ${scheme.badgeBorder}`}
            >
              <span>{displayVal}</span>
              {unit && <span className="text-[9px] opacity-85">{unit}</span>}

              {/* Downward Speech Bubble Tail pointing directly to Thumb */}
              <div
                style={{
                  left: `${clampedTailPct}%`,
                  transform: 'translateX(-50%) rotate(45deg)',
                }}
                className={`absolute -bottom-1 w-2 h-2 ${scheme.tooltipTail}`}
              />
            </div>
          </div>
        </div>

        {/* The Track Container (Strict LTR so 0 is left and 100 is right) */}
        <div dir="ltr" className="relative flex items-center h-6 w-full cursor-pointer">
          {/* Base Background Track with subtle inset groove */}
          <div className="absolute inset-x-0 h-2 bg-slate-900/90 rounded-full overflow-hidden shadow-inner border border-slate-700/60">
            {/* Active Filled Gradient Progress Bar - ZERO CSS transition so it locks 1:1 with thumb */}
            <div
              style={{ width: `${pct}%` }}
              className={`h-full bg-gradient-to-r ${scheme.gradient}`}
            />
          </div>

          {/* Native HTML Range Input positioned invisibly over track for full accessibility */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={activeVal}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const safeVal = isNaN(val) ? min : val;
              setLocalVal(safeVal);
              onChange(safeVal);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {/* Styled Physical Circular Thumb - ZERO CSS transition on left, only scale/shadow on hover */}
          <div
            style={{ left: `${pct}%` }}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4.5 h-4.5 bg-white rounded-full border-2 shadow-lg pointer-events-none z-10 flex items-center justify-center transition-[transform,box-shadow] duration-100 ${
              scheme.activeThumb
            } ${
              isDragging
                ? `scale-125 ring-4 ${scheme.ringGlow}`
                : isHovered
                ? `scale-115 ring-2 ${scheme.ringGlow}`
                : 'scale-100'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${scheme.thumbDot}`} />
          </div>
        </div>
      </div>

      {hint && <p className="text-[11px] text-slate-500 leading-relaxed">{hint}</p>}
    </div>
  );
};
