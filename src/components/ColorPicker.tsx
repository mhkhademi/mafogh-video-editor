import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Pipette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
  label?: string;
}

// Convert HEX string to RGB object
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace(/^#/, '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num) || clean.length !== 6) {
    return { r: 15, g: 23, b: 42 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Convert RGB numbers to HEX string
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, v };
}

// Convert HSV to RGB
function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const satValBoxRef = useRef<HTMLDivElement>(null);
  const hueBarRef = useRef<HTMLDivElement>(null);

  // Initialize HSV from prop color
  const initialRgb = hexToRgb(color || '#701A45');
  const initialHsv = rgbToHsv(initialRgb.r, initialRgb.g, initialRgb.b);

  const [hsv, setHsv] = useState(initialHsv);
  // Store hex characters without the leading '#' symbol
  const [hexDigits, setHexDigits] = useState<string>(
    (color || '#701A45').replace(/^#/, '').toUpperCase()
  );
  const [format, setFormat] = useState<'HEX' | 'RGB'>('HEX');

  // Keep internal state synced when prop color changes from outside
  useEffect(() => {
    if (color) {
      const rgb = hexToRgb(color);
      const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      // Avoid resetting hue to 0 when saturation is 0 (white or grey)
      setHsv((prev) => ({
        h: newHsv.s === 0 ? prev.h : newHsv.h,
        s: newHsv.s,
        v: newHsv.v,
      }));
      setHexDigits(color.replace(/^#/, '').toUpperCase());
    }
  }, [color]);

  // Handle click outside to close popover
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Update color and notify parent
  const emitColorChange = useCallback(
    (newHsv: { h: number; s: number; v: number }) => {
      const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      setHexDigits(hex.replace(/^#/, ''));
      onChange(hex);
    },
    [onChange]
  );

  // Drag on Saturation/Value 2D Area
  // Top-left is Pure Hue (S=1, V=1), Top-right is White (S=0, V=1), Bottom is Black (V=0)
  const handleSatValMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!satValBoxRef.current) return;

    const updateFromPosition = (clientX: number, clientY: number) => {
      if (!satValBoxRef.current) return;
      const rect = satValBoxRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

      // In the user's reference:
      // Left = Full Saturation (S = 1), Right = White (S = 0)
      const s = 1 - x / rect.width;
      const v = 1 - y / rect.height;

      const nextHsv = { ...hsv, s, v };
      setHsv(nextHsv);
      emitColorChange(nextHsv);
    };

    updateFromPosition(e.clientX, e.clientY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      updateFromPosition(moveEvent.clientX, moveEvent.clientY);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Drag on Hue Slider Bar
  // Left is Red (360), moving right: Magenta, Blue, Cyan, Green, Yellow, Red (0)
  const handleHueMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!hueBarRef.current) return;

    const updateFromPosition = (clientX: number) => {
      if (!hueBarRef.current) return;
      const rect = hueBarRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = x / rect.width; // 0 to 1

      // Matching the spectrum in user screenshot:
      // Red(360) -> Magenta(300) -> Blue(240) -> Cyan(180) -> Green(120) -> Yellow(60) -> Red(0)
      const h = ((360 - ratio * 360) % 360 + 360) % 360;

      const nextHsv = { ...hsv, h };
      setHsv(nextHsv);
      emitColorChange(nextHsv);
    };

    updateFromPosition(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      updateFromPosition(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Manual HEX input change (clean digits only, with permanent # prefix)
  const handleHexInputChange = (rawVal: string) => {
    // Strip any hashtag or non-hex characters, uppercase, max 6 characters
    const clean = rawVal.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).toUpperCase();
    setHexDigits(clean);
    if (clean.length === 6 || clean.length === 3) {
      const fullHex = `#${clean}`;
      const rgb = hexToRgb(fullHex);
      const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHsv(newHsv);
      onChange(fullHex);
    }
  };

  // EyeDropper API support (browser native color picker eyedropper if supported)
  const handleEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const res = await eyeDropper.open();
        if (res && res.sRGBHex) {
          handleHexInputChange(res.sRGBHex);
        }
      } catch (_) {}
    }
  };

  // Compute handle coordinates on 2D area (percentages 0% to 100%)
  const satValX = (1 - hsv.s) * 100;
  const satValY = (1 - hsv.v) * 100;

  // Compute hue slider thumb position
  const hueRatio = (360 - hsv.h) / 360;
  const hueThumbX = Math.max(0, Math.min(100, hueRatio * 100));

  // Current RGB for display if format is RGB
  const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);

  // Quick brand palette presets
  const presets = [
    '#701A45', // Mafogh Deep Magenta
    '#9D174D', // Pink-800
    '#BE185D', // Pink-700
    '#4C0EC9', // User Indigo/Purple
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#0F172A', // Slate-900
    '#FFFFFF', // White
  ];

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {/* Trigger Button: Swatch on the right, HEX code with # on its left, action on the far left */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-800/80 hover:bg-slate-750 p-1.5 rounded-lg border border-slate-700/80 transition-all cursor-pointer shadow-sm group"
      >
        <div className="flex items-center gap-2">
          {/* Swatch square on the right */}
          <div
            className="w-6 h-6 rounded-md border border-white/20 shadow-inner shrink-0"
            style={{ backgroundColor: color || '#ffffff' }}
          />
          {/* Hex code with fixed # on the left of digits */}
          <span
            dir="ltr"
            className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider inline-block"
          >
            #{hexDigits || 'FFFFFF'}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 group-hover:text-slate-200 flex items-center gap-0.5">
          <span>تغییر</span>
          <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Floating Modern Color Picker Modal matching the User's Screenshot */}
      {isOpen && (
        <div
          dir="ltr"
          style={{ width: '280px' }}
          className="absolute z-50 mt-2 right-0 bg-[#000000] border border-neutral-800 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl animate-fadeIn select-none"
        >
          {/* 1. Large Saturation/Brightness 2D Area (No light border, pure seamless gradient) */}
          <div
            ref={satValBoxRef}
            onMouseDown={handleSatValMouseDown}
            style={{
              height: '140px',
              backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
              backgroundImage: `
                linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 60%, #000000 98%, #000000 100%),
                linear-gradient(to right, transparent 0%, #ffffff 100%)
              `,
            }}
            className="w-full rounded-xl relative cursor-crosshair overflow-hidden"
          >
            {/* Circular Handle */}
            <div
              style={{
                left: `${satValX}%`,
                top: `${satValY}%`,
              }}
              className="absolute w-5 h-5 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,0.9)] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform active:scale-125"
            >
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>

          {/* 2. Rainbow Hue Spectrum Slider (Clean, borderless rainbow track) */}
          <div className="mt-3.5 px-0.5">
            <div
              ref={hueBarRef}
              onMouseDown={handleHueMouseDown}
              style={{
                height: '14px',
                backgroundImage:
                  'linear-gradient(to right, #ff0000 0%, #ff00ff 17%, #0000ff 33%, #00ffff 50%, #00ff00 67%, #ffff00 83%, #ff0000 100%)',
              }}
              className="w-full rounded-full relative cursor-pointer"
            >
              {/* White Circular Thumb */}
              <div
                style={{
                  left: `${hueThumbX}%`,
                  top: '50%',
                }}
                className="absolute w-5 h-5 bg-white rounded-full border border-slate-300 shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none hover:scale-110 active:scale-125 transition-transform"
              />
            </div>
          </div>

          {/* 3. Format Dropdown & Editable Input Row */}
          <div className="mt-4 flex items-center justify-between gap-2">
            {/* Format Selector Button (HEX / RGB) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFormat(format === 'HEX' ? 'RGB' : 'HEX')}
                className="px-2.5 py-1.5 bg-[#121620] hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                title="تغییر فرمت نمایش"
              >
                <span className="text-[10px] text-slate-400">▼</span>
                <span className="font-mono text-[11px]">{format}</span>
              </button>

              {'EyeDropper' in window && (
                <button
                  type="button"
                  onClick={handleEyeDropper}
                  className="p-1.5 bg-[#121620] hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 cursor-pointer transition-colors"
                  title="قطره‌چکان (انتخاب رنگ از صفحه)"
                >
                  <Pipette size={13} />
                </button>
              )}
            </div>

            {/* Editable Text Input with Permanent Fixed # Symbol */}
            <div className="flex-1 max-w-[130px]">
              {format === 'HEX' ? (
                <div
                  dir="ltr"
                  className="flex items-center bg-[#121620] border border-slate-800 focus-within:border-indigo-500 rounded-lg px-2.5 py-1.5 shadow-inner"
                >
                  <span className="font-mono text-xs font-black text-slate-400 select-none mr-1 shrink-0">
                    #
                  </span>
                  <input
                    type="text"
                    value={hexDigits}
                    onChange={(e) => handleHexInputChange(e.target.value)}
                    placeholder="FFFFFF"
                    maxLength={6}
                    className="w-full bg-transparent font-mono text-xs font-bold text-slate-100 outline-none uppercase tracking-wider text-left"
                  />
                </div>
              ) : (
                <div
                  dir="ltr"
                  className="text-[11px] font-mono text-slate-300 text-left bg-[#121620] border border-slate-800 px-2 py-1.5 rounded-lg truncate"
                >
                  rgb({currentRgb.r}, {currentRgb.g}, {currentRgb.b})
                </div>
              )}
            </div>
          </div>

          {/* 4. Quick Palette Presets */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-semibold mb-2 text-right dir-rtl">
              رنگ‌های پرتکرار و سازمانی
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {presets.map((presetHex) => (
                <button
                  key={presetHex}
                  type="button"
                  onClick={() => handleHexInputChange(presetHex)}
                  style={{ backgroundColor: presetHex }}
                  className={`h-5 rounded-md border transition-transform hover:scale-115 active:scale-95 cursor-pointer ${
                    color?.toUpperCase() === presetHex
                      ? 'border-white ring-2 ring-indigo-500/50 scale-105'
                      : 'border-white/10'
                  }`}
                  title={presetHex}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
