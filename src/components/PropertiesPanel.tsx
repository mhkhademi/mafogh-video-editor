import React, { useState } from 'react';
import { Slide, SlideElement, ElementType, AnimationType, WatermarkConfig, AudioConfig } from '../types';
import { ColorPicker } from './ColorPicker';
import { RangeSlider } from './RangeSlider';
import {
  Type,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Trash2,
  ListOrdered,
  CreditCard,
  Palette,
  Clock,
  Sliders,
  Music,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Crosshair,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  MoveHorizontal,
  Maximize2,
  Lock,
  Unlock,
  Copy,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowRight,
  Minus,
  Square,
  Circle,
} from 'lucide-react';
import { getLucideIcon } from '../utils/iconRegistry';

interface PropertiesPanelProps {
  slide: Slide;
  selectedElement: SlideElement | null;
  watermark?: WatermarkConfig;
  projectAudio?: AudioConfig;
  onUpdateSlide: (partial: Partial<Slide>) => void;
  onUpdateWatermark?: (partial: Partial<WatermarkConfig>) => void;
  onUpdateAudio?: (audio?: AudioConfig) => void;
  onOpenAudioModal?: () => void;
  onAddElement: (type: ElementType) => void;
  onUpdateElement: (elementId: string, partial: Partial<SlideElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onDuplicateElement?: (elementId: string) => void;
  onBringForward?: (elementId: string) => void;
  onBringToFront?: (elementId: string) => void;
  onSendBackward?: (elementId: string) => void;
  onSendToBack?: (elementId: string) => void;
  onToggleLock?: (elementId: string) => void;
  onSelectElement?: (elementId: string | null) => void;
  onOpenIconPicker?: (mode: 'new' | 'replace') => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  slide,
  selectedElement,
  watermark,
  projectAudio,
  onUpdateSlide,
  onUpdateWatermark,
  onUpdateAudio,
  onOpenAudioModal,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onBringToFront,
  onSendBackward,
  onSendToBack,
  onToggleLock,
  onSelectElement,
  onOpenIconPicker,
}) => {
  const [activeTab, setActiveTab] = useState<'slide' | 'element' | 'layers'>('slide');

  // If user selects an element, automatically switch to element tab
  React.useEffect(() => {
    if (selectedElement) {
      setActiveTab('element');
    }
  }, [selectedElement?.id]);

  return (
    <aside className="w-68 lg:w-72 xl:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none shrink-0 overflow-hidden transition-all">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-medium">
        <button
          onClick={() => setActiveTab('slide')}
          className={`flex-1 py-2.5 xl:py-3 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'slide'
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette size={14} />
          <span>اسلاید</span>
        </button>
        <button
          onClick={() => setActiveTab('element')}
          className={`flex-1 py-2.5 xl:py-3 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'element'
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders size={14} />
          <span>المان</span>
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2.5 xl:py-3 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'layers'
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers size={14} />
          <span>لایه‌ها ({slide.elements.length})</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 xl:p-4 space-y-5 xl:space-y-6">
        {/* ================= TAB 1: SLIDE SETTINGS ================= */}
        {activeTab === 'slide' && (
          <div className="space-y-5">
            {/* Slide Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                عنوان اسلاید
              </label>
              <input
                type="text"
                value={slide.title}
                onChange={(e) => onUpdateSlide({ title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Slide Duration */}
            <RangeSlider
              label="مدت زمان نمایش اسلاید"
              icon={<Clock size={14} className="text-amber-400" />}
              value={slide.duration}
              min={2}
              max={30}
              step={0.5}
              unit="ثانیه"
              color="amber"
              onChange={(val) => onUpdateSlide({ duration: val })}
            />

            {/* Slide Background */}
            <div className="border-t border-slate-800 pt-4">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                پس‌زمینه اسلاید
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() =>
                    onUpdateSlide({
                      background: { ...slide.background, type: 'solid', color1: '#ffffff' },
                    })
                  }
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    slide.background.type === 'solid'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400'
                  }`}
                >
                  تک‌رنگ (Solid)
                </button>
                <button
                  onClick={() =>
                    onUpdateSlide({
                      background: {
                        type: 'gradient',
                        color1: '#ffffff',
                        color2: '#fdf2f8',
                        gradientAngle: 135,
                      },
                    })
                  }
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    slide.background.type === 'gradient'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400'
                  }`}
                >
                  گرادینت نرم
                </button>
              </div>

              {/* Color pickers */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    رنگ اصلی پس‌زمینه
                  </label>
                  <ColorPicker
                    color={slide.background.color1 || '#ffffff'}
                    onChange={(hex) =>
                      onUpdateSlide({
                        background: { ...slide.background, color1: hex },
                      })
                    }
                  />
                </div>

                {slide.background.type === 'gradient' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      رنگ ثانویه گرادینت
                    </label>
                    <ColorPicker
                      color={slide.background.color2 || '#fce7f3'}
                      onChange={(hex) =>
                        onUpdateSlide({
                          background: { ...slide.background, color2: hex },
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Transition Out */}
            <div className="border-t border-slate-800 pt-4">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                ترنزیشن خروج به اسلاید بعد
              </label>
              <select
                value={slide.transitionOut || 'fade'}
                onChange={(e) => onUpdateSlide({ transitionOut: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
              >
                <option value="fade">محو شدن نرم (Crossfade Out)</option>
                <option value="slide-up">اسلاید به بالا (Slide Up)</option>
                <option value="none">بدون ترنزیشن (کات مستقیم)</option>
              </select>
            </div>

            {/* Per-Slide Watermark Override */}
            {watermark && watermark.enabled && (
              <div className="border-t border-slate-800 pt-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    نشان تجاری در این اسلاید
                  </label>
                  <span className="text-[10px] text-pink-400 font-medium">
                    {slide.watermarkOverride?.colorMode === 'hidden'
                      ? 'مخفی در این اسلاید'
                      : slide.watermarkOverride?.colorMode === 'light'
                      ? 'اجبار به سفید'
                      : slide.watermarkOverride?.colorMode === 'dark'
                      ? 'اجبار به تیره'
                      : 'انطباق خودکار هوشمند ✨'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateSlide({ watermarkOverride: undefined })}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-medium border text-center transition-all ${
                      !slide.watermarkOverride || slide.watermarkOverride.colorMode === 'inherit'
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                    title="تشخیص خودکار بر اساس تیرگی/روشنی رنگ پس‌زمینه همین اسلاید"
                  >
                    خودکار ✨
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSlide({
                        watermarkOverride: { colorMode: 'light', visible: true },
                      })
                    }
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-medium border text-center transition-all ${
                      slide.watermarkOverride?.colorMode === 'light'
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                    title="اجبار به رنگ سفید (عالی برای اسلایدهای دارک)"
                  >
                    سفید ⚪
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSlide({
                        watermarkOverride: { colorMode: 'dark', visible: true },
                      })
                    }
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-medium border text-center transition-all ${
                      slide.watermarkOverride?.colorMode === 'dark'
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                    title="اجبار به رنگ تیره (برای اسلایدهای روشن)"
                  >
                    تیره ⚫
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSlide({
                        watermarkOverride: { colorMode: 'hidden', visible: false },
                      })
                    }
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-medium border text-center transition-all ${
                      slide.watermarkOverride?.colorMode === 'hidden'
                        ? 'border-pink-500 bg-pink-500/20 text-pink-300 font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                    title="حذف لوگو فقط از این اسلاید (مثلاً برای اسلاید پایانی CTA)"
                  >
                    مخفی ✕
                  </button>
                </div>
              </div>
            )}

            {/* Background Audio Quick Section */}
            <div className="border-t border-slate-800 pt-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Music size={14} className="text-pink-400" />
                  <span className="text-xs font-bold text-slate-200">موزیک و زیرصدای ویدیو</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenAudioModal}
                  className="text-[11px] font-bold text-pink-400 hover:text-pink-300 transition-colors cursor-pointer"
                >
                  {projectAudio?.url ? 'تغییر موزیک ⚙️' : '+ انتخاب موزیک'}
                </button>
              </div>

              {projectAudio?.url ? (
                <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[170px]">
                      🎵 {projectAudio.name || 'موزیک زیرصدا'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateAudio?.(undefined)}
                      className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      قطع موزیک
                    </button>
                  </div>
                  <RangeSlider
                    label="میزان بلندی زیرصدا"
                    value={Math.round((projectAudio.volume ?? 0.35) * 100)}
                    min={5}
                    max={100}
                    step={5}
                    unit="٪"
                    color="pink"
                    onChange={(val) => onUpdateAudio?.({ ...projectAudio, volume: val / 100 })}
                  />
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  موزیک زیرصدا برای این ویدیو فعال نیست. با کلیک روی «+ انتخاب موزیک» می‌توانید یک تِرک آماده یا فایل دلخواه قرار دهید.
                </p>
              )}
            </div>

            {/* ================= Watermark & Brand Logo Settings ================= */}
            {watermark && onUpdateWatermark && (
              <div className="border-t border-slate-800 pt-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-pink-400" />
                    <span className="text-xs font-bold text-slate-200">نشان و لوگوی ویدیو (Watermark)</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={watermark.enabled}
                    onClick={() => onUpdateWatermark({ enabled: !watermark.enabled })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none shrink-0 ${
                      watermark.enabled ? 'bg-pink-600' : 'bg-slate-700'
                    }`}
                    dir="ltr"
                    title={watermark.enabled ? 'فعال (کلیک برای غیرفعال‌سازی)' : 'غیرفعال (کلیک برای فعال‌سازی)'}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out block ${
                        watermark.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {watermark.enabled && (
                  <div className="space-y-4 bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 shadow-inner">
                    {/* Preset Selector */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">نوع نشان تجاری</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateWatermark({ type: 'image', imageUrl: '/mafogh-logo-brand.svg', color: '' })}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                            watermark.type === 'image' && (!watermark.imageUrl || watermark.imageUrl.includes('brand'))
                              ? 'border-pink-500 bg-pink-500/10 text-pink-300 font-bold'
                              : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          رسمی مافوق (رنگی)
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateWatermark({ type: 'image', imageUrl: '/mafogh-logo.svg', color: '#ffffff' })}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                            watermark.type === 'image' && watermark.imageUrl === '/mafogh-logo.svg'
                              ? 'border-pink-500 bg-pink-500/10 text-pink-300 font-bold'
                              : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          رسمی مافوق (سفید)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            document.getElementById('custom-logo-upload')?.click();
                          }}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                            watermark.type === 'image' && watermark.imageUrl && !watermark.imageUrl.startsWith('/mafogh')
                              ? 'border-pink-500 bg-pink-500/10 text-pink-300 font-bold'
                              : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          آپلود لوگوی دلخواه
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateWatermark({ type: 'text', text: watermark.text || 'مافوق' })}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                            watermark.type === 'text'
                              ? 'border-pink-500 bg-pink-500/10 text-pink-300 font-bold'
                              : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          متن اختصاصی
                        </button>
                      </div>
                      <input
                        id="custom-logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (typeof ev.target?.result === 'string') {
                                onUpdateWatermark({ type: 'image', imageUrl: ev.target.result });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>

                    {/* Text Input if type === 'text' */}
                    {watermark.type === 'text' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">متن نشان</label>
                        <input
                          type="text"
                          value={watermark.text || ''}
                          onChange={(e) => onUpdateWatermark({ text: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                          placeholder="مثلاً: مافوق یا mafogh.com"
                        />
                      </div>
                    )}

                    {/* Logo Size (Scale) */}
                    <div>
                      <RangeSlider
                        label="اندازه لوگو (مقیاس)"
                        value={watermark.size || 48}
                        min={20}
                        max={120}
                        step={2}
                        unit="px"
                        color="pink"
                        onChange={(val) => onUpdateWatermark({ size: val })}
                      />
                      {/* Quick presets */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {[
                          { label: 'کوچک', val: 32 },
                          { label: 'استاندارد', val: 48 },
                          { label: 'بزرگ', val: 68 },
                          { label: 'خیلی بزرگ', val: 92 },
                        ].map((p) => (
                          <button
                            key={p.val}
                            type="button"
                            onClick={() => onUpdateWatermark({ size: p.val })}
                            className={`flex-1 py-1 text-[10px] rounded border transition-colors ${
                              (watermark.size || 48) === p.val
                                ? 'border-pink-500 bg-pink-500/20 text-pink-300 font-bold'
                                : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Smart Auto Contrast Toggle */}
                    <div className="p-3 bg-slate-800/60 border border-slate-700/70 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={14} className="text-pink-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-200">انطباق هوشمند کنتراست</span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={watermark.autoContrast ?? true}
                          onClick={() => onUpdateWatermark({ autoContrast: !(watermark.autoContrast ?? true) })}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none shrink-0 ${
                            (watermark.autoContrast ?? true) ? 'bg-pink-600' : 'bg-slate-700'
                          }`}
                          dir="ltr"
                          title="انطباق خودکار رنگ با پس‌زمینه"
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 block ${
                              (watermark.autoContrast ?? true) ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        سفید شدن خودکار لوگو در اسلایدهای تیره و نمایش رنگ اصلی در اسلایدهای روشن
                      </p>
                    </div>

                    {/* Logo Color / Tint */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-semibold text-slate-400">رنگ لوگو / نشان</label>
                        {watermark.color && (
                          <button
                            type="button"
                            onClick={() => onUpdateWatermark({ color: '' })}
                            className="text-[10px] text-pink-400 hover:text-pink-300 underline"
                          >
                            رنگ اصلی فایل
                          </button>
                        )}
                      </div>
                      <ColorPicker
                        color={watermark.color || '#6B0B45'}
                        onChange={(hex) => onUpdateWatermark({ color: hex })}
                      />
                    </div>

                    {/* Logo Position */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">موقعیت قرارگیری</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'bottom-center', label: 'پایین - وسط' },
                          { id: 'bottom-right', label: 'پایین - راست' },
                          { id: 'bottom-left', label: 'پایین - چپ' },
                          { id: 'top-right', label: 'بالا - راست' },
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => onUpdateWatermark({ position: pos.id as any })}
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                              watermark.position === pos.id
                                ? 'border-pink-500 bg-pink-500/10 text-pink-300 font-bold'
                                : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logo Opacity */}
                    <RangeSlider
                      label="شفافیت (Opacity)"
                      value={Math.round((watermark.opacity ?? 0.95) * 100)}
                      min={10}
                      max={100}
                      step={5}
                      unit="٪"
                      color="indigo"
                      onChange={(val) => onUpdateWatermark({ opacity: val / 100 })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Quick Add Elements Palette */}
            <div className="border-t border-slate-800 pt-4">
              <label className="block text-xs font-semibold text-slate-400 mb-2.5">
                افزودن المان جدید به صفحه
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAddElement('title')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center gap-2 text-xs text-slate-200 transition-colors"
                >
                  <Type size={16} className="text-indigo-400" />
                  <span>تیتر اصلی</span>
                </button>
                <button
                  onClick={() => onAddElement('subtitle')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center gap-2 text-xs text-slate-200 transition-colors"
                >
                  <Type size={14} className="text-sky-400" />
                  <span>زیرنویس</span>
                </button>
                <button
                  onClick={() => onAddElement('paragraph')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center gap-2 text-xs text-slate-200 transition-colors"
                >
                  <Layers size={16} className="text-amber-400" />
                  <span>پاراگراف متن</span>
                </button>
                <button
                  onClick={() => onAddElement('list-box')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center gap-2 text-xs text-slate-200 transition-colors"
                >
                  <ListOrdered size={16} className="text-pink-400" />
                  <span>باکس آیتم مافوق</span>
                </button>
                <button
                  onClick={() => onAddElement('card')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center gap-2 text-xs text-slate-200 transition-colors"
                >
                  <CreditCard size={16} className="text-emerald-400" />
                  <span>کارت نکته / پیام</span>
                </button>
                <button
                  onClick={() => onAddElement('icon')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center gap-2 text-xs text-slate-200 transition-colors"
                >
                  <Circle size={16} className="text-pink-400" />
                  <span>آیکون دایره‌ای</span>
                </button>
                <button
                  onClick={() => onAddElement('image')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center gap-2 text-xs text-slate-200 transition-colors"
                >
                  <ImageIcon size={16} className="text-violet-400" />
                  <span>عکس / تصویر</span>
                </button>
                <button
                  onClick={() => (onOpenIconPicker ? onOpenIconPicker('new') : onAddElement('icon'))}
                  className="col-span-2 p-2.5 bg-pink-950/40 hover:bg-pink-950/60 border border-pink-700/60 hover:border-pink-500 rounded-lg flex items-center justify-center gap-2 text-xs text-pink-200 transition-colors shadow-sm"
                >
                  <Sparkles size={16} className="text-pink-400 animate-pulse" />
                  <span className="font-bold text-pink-300">کتابخانه آیکون‌های وکتور (Icon Library)</span>
                </button>
                <button
                  onClick={() => onAddElement('arrow')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center gap-2 text-xs text-slate-200 transition-colors"
                >
                  <ArrowRight size={16} className="text-rose-400" />
                  <span>فلش راهنما (Arrow)</span>
                </button>
                <button
                  onClick={() => onAddElement('divider')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center gap-2 text-xs text-slate-200 transition-colors"
                >
                  <Minus size={16} className="text-amber-400" />
                  <span>خط جداکننده (Line)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: SELECTED ELEMENT SETTINGS ================= */}
        {activeTab === 'element' && (
          <div>
            {!selectedElement ? (
              <div className="text-center py-12 px-4 text-slate-500 space-y-2">
                <Sparkles size={32} className="mx-auto opacity-40 text-indigo-400" />
                <p className="text-xs">هیچ المانی انتخاب نشده است.</p>
                <p className="text-[11px] text-slate-600">
                  روی هر متنی یا المانی در صفحه وسط کلیک کنید تا تنظیمات آن را ویرایش کنید.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Header with Quick Action Buttons */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-300">
                      ویرایش ({selectedElement.type})
                    </span>
                    {selectedElement.locked && (
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px] flex items-center gap-1">
                        <Lock size={10} />
                        قفل
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Duplicate button */}
                    <button
                      onClick={() => onDuplicateElement?.(selectedElement.id)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="ایجاد کپی (Ctrl+D)"
                    >
                      <Copy size={14} />
                    </button>

                    {/* Lock / Unlock button */}
                    <button
                      onClick={() => onToggleLock?.(selectedElement.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        selectedElement.locked
                          ? 'text-amber-400 bg-amber-500/15'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={selectedElement.locked ? 'باز کردن قفل المان' : 'قفل کردن موقعیت المان'}
                    >
                      {selectedElement.locked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteElement(selectedElement.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="حذف المان (Delete)"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Content Input (Text vs Image URL/Upload vs Icon) */}
                {selectedElement.type === 'icon' ? (
                  <div className="space-y-3.5 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/70">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center border border-slate-650 shadow-inner"
                          style={{
                            backgroundColor: selectedElement.backgroundColor || 'transparent',
                            color: selectedElement.color || '#6b0b45',
                          }}
                        >
                          {React.createElement(getLucideIcon(selectedElement.content || 'Sparkles'), {
                            size: 28,
                            strokeWidth: selectedElement.strokeWidth || 2,
                          })}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white font-mono">{selectedElement.content}</div>
                          <div className="text-[10px] text-pink-300">آیکون وکتور زنده</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenIconPicker?.('replace')}
                        className="px-3 py-1.5 bg-pink-700 hover:bg-pink-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:scale-105"
                      >
                        <Sparkles size={13} />
                        <span>تغییر آیکون</span>
                      </button>
                    </div>

                    {/* Icon Size Slider */}
                    <div>
                      <RangeSlider
                        label="اندازه آیکون"
                        value={selectedElement.fontSize || 84}
                        min={24}
                        max={240}
                        step={4}
                        unit="px"
                        color="pink"
                        onChange={(val) =>
                          onUpdateElement(selectedElement.id, {
                            fontSize: Math.round(val),
                          })
                        }
                      />
                    </div>

                    {/* Stroke Width */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        ضخامت خطوط (Stroke Width)
                      </label>
                      <div className="grid grid-cols-5 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-750">
                        {[1, 1.5, 2, 2.5, 3].map((sw) => (
                          <button
                            key={sw}
                            onClick={() => onUpdateElement(selectedElement.id, { strokeWidth: sw })}
                            className={`py-1 text-xs rounded transition-colors ${
                              (selectedElement.strokeWidth || 2) === sw
                                ? 'bg-pink-700 text-white font-bold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {sw}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Icon Color */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        رنگ آیکون
                      </label>
                      <ColorPicker
                        color={selectedElement.color || '#6b0b45'}
                        onChange={(hex) => onUpdateElement(selectedElement.id, { color: hex })}
                      />
                    </div>

                    {/* Background & Frame Style */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        کادر و پس‌زمینه آیکون
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-750 mb-2">
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              backgroundColor: 'transparent',
                              padding: 0,
                            })
                          }
                          className={`py-1 text-xs rounded transition-colors ${
                            !selectedElement.backgroundColor || selectedElement.backgroundColor === 'transparent'
                              ? 'bg-pink-700 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          بدون کادر
                        </button>
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              backgroundColor:
                                selectedElement.backgroundColor && selectedElement.backgroundColor !== 'transparent'
                                  ? selectedElement.backgroundColor
                                  : '#fdf2f8',
                              borderRadius: 999,
                              padding: 20,
                            })
                          }
                          className={`py-1 text-xs rounded transition-colors ${
                            selectedElement.backgroundColor &&
                            selectedElement.backgroundColor !== 'transparent' &&
                            (selectedElement.borderRadius ?? 0) > 50
                              ? 'bg-pink-700 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          دایره‌ای
                        </button>
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, {
                              backgroundColor:
                                selectedElement.backgroundColor && selectedElement.backgroundColor !== 'transparent'
                                  ? selectedElement.backgroundColor
                                  : '#fdf2f8',
                              borderRadius: 18,
                              padding: 20,
                            })
                          }
                          className={`py-1 text-xs rounded transition-colors ${
                            selectedElement.backgroundColor &&
                            selectedElement.backgroundColor !== 'transparent' &&
                            (selectedElement.borderRadius ?? 0) <= 50
                              ? 'bg-pink-700 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          مربعی
                        </button>
                      </div>

                      {selectedElement.backgroundColor && selectedElement.backgroundColor !== 'transparent' && (
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            رنگ پس‌زمینه کادر
                          </label>
                          <ColorPicker
                            color={selectedElement.backgroundColor}
                            onChange={(hex) => onUpdateElement(selectedElement.id, { backgroundColor: hex })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedElement.type === 'arrow' || (selectedElement.type === 'shape' && selectedElement.shapeKind !== 'divider') ? (
                  <div className="space-y-4 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/70">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <ArrowRight size={16} className="text-pink-400" />
                        <span className="text-xs font-bold text-white">تنظیمات فلش اشاره‌گر</span>
                      </div>
                      <span className="text-[11px] font-mono text-pink-300 bg-pink-950/80 px-2 py-0.5 rounded border border-pink-700/40">
                        {selectedElement.rotation || 0}°
                      </span>
                    </div>

                    {/* Manual Angle Input & Smooth Slider (0° - 360°) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">
                          زاویه و چرخش فلش (درجه)
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={360}
                            value={selectedElement.rotation || 0}
                            onChange={(e) => {
                              let val = Number(e.target.value) || 0;
                              if (val < 0) val = (val % 360) + 360;
                              val = val % 361;
                              onUpdateElement(selectedElement.id, { rotation: val });
                            }}
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs font-mono text-center text-pink-300 focus:outline-none focus:border-pink-500"
                          />
                          <span className="text-xs text-slate-400">°</span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={360}
                        step={1}
                        value={selectedElement.rotation || 0}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, { rotation: Number(e.target.value) })
                        }
                        className="w-full accent-pink-600 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />

                      {/* Quick Angle Presets */}
                      <div className="grid grid-cols-5 gap-1 pt-1">
                        {[
                          { label: 'راست (۰°)', deg: 0 },
                          { label: 'پایین (۹۰°)', deg: 90 },
                          { label: 'چپ (۱۸۰°)', deg: 180 },
                          { label: 'بالا (۲۷۰°)', deg: 270 },
                          { label: 'مایل (۴۵°)', deg: 45 },
                        ].map((preset) => (
                          <button
                            key={preset.deg}
                            onClick={() => onUpdateElement(selectedElement.id, { rotation: preset.deg })}
                            className={`py-1 text-[10px] rounded transition-colors ${
                              (selectedElement.rotation || 0) === preset.deg
                                ? 'bg-pink-700 text-white font-bold'
                                : 'bg-slate-900/80 text-slate-400 hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Arrow Length */}
                    <div>
                      <RangeSlider
                        label="طول فلش"
                        value={selectedElement.width || 25}
                        min={10}
                        max={80}
                        step={1}
                        unit="%"
                        color="pink"
                        onChange={(val) => onUpdateElement(selectedElement.id, { width: Math.round(val) })}
                      />
                    </div>

                    {/* Arrow Thickness */}
                    <div>
                      <RangeSlider
                        label="ضخامت فلش"
                        value={selectedElement.strokeWidth || 5}
                        min={2}
                        max={20}
                        step={1}
                        unit="px"
                        color="pink"
                        onChange={(val) => onUpdateElement(selectedElement.id, { strokeWidth: Math.round(val) })}
                      />
                    </div>

                    {/* Arrow Color */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        رنگ فلش
                      </label>
                      <ColorPicker
                        color={selectedElement.color || '#6b0b45'}
                        onChange={(hex) => onUpdateElement(selectedElement.id, { color: hex })}
                      />
                    </div>
                  </div>
                ) : selectedElement.type === 'divider' || (selectedElement.type === 'shape' && selectedElement.shapeKind === 'divider') ? (
                  <div className="space-y-4 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/70">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-700/60">
                      <Minus size={16} className="text-amber-400" />
                      <span className="text-xs font-bold text-white">تنظیمات خط جداکننده</span>
                    </div>

                    {/* Divider Width */}
                    <div>
                      <RangeSlider
                        label="عرض خط"
                        value={selectedElement.width || 60}
                        min={10}
                        max={95}
                        step={1}
                        unit="%"
                        color="indigo"
                        onChange={(val) => onUpdateElement(selectedElement.id, { width: Math.round(val) })}
                      />
                    </div>

                    {/* Divider Thickness */}
                    <div>
                      <RangeSlider
                        label="ضخامت خط"
                        value={selectedElement.strokeWidth || 3}
                        min={1}
                        max={16}
                        step={1}
                        unit="px"
                        color="indigo"
                        onChange={(val) => onUpdateElement(selectedElement.id, { strokeWidth: Math.round(val) })}
                      />
                    </div>

                    {/* Divider Style (Gradient vs Solid) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        نوع رنگ خط
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-750">
                        <button
                          onClick={() => onUpdateElement(selectedElement.id, { backgroundColor: 'gradient' })}
                          className={`py-1 text-xs rounded transition-colors ${
                            selectedElement.backgroundColor !== 'solid'
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          گرادیانت محوشونده
                        </button>
                        <button
                          onClick={() => onUpdateElement(selectedElement.id, { backgroundColor: 'solid' })}
                          className={`py-1 text-xs rounded transition-colors ${
                            selectedElement.backgroundColor === 'solid'
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          یکدست (ساده)
                        </button>
                      </div>
                    </div>

                    {/* Divider Color */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        رنگ خط
                      </label>
                      <ColorPicker
                        color={selectedElement.color || '#6b0b45'}
                        onChange={(hex) => onUpdateElement(selectedElement.id, { color: hex })}
                      />
                    </div>
                  </div>
                ) : selectedElement.type === 'image' ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-400">
                      آدرس یا فایل تصویر
                    </label>
                    <textarea
                      rows={2}
                      dir="ltr"
                      value={selectedElement.content}
                      placeholder="https://... یا تصویر آپلود شده"
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { content: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-mono text-left"
                    />
                    <label className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 rounded-lg text-xs font-medium border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                      <ImageIcon size={14} />
                      <span>انتخاب و آپلود تصویر از کامپیوتر</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            if (result) {
                              onUpdateElement(selectedElement.id, { content: result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      متن اصلی
                    </label>
                    <textarea
                      rows={3}
                      value={selectedElement.content}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { content: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                    />
                  </div>
                )}

                {/* Subcontent (for list boxes or subtitle) */}
                {selectedElement.type === 'list-box' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      متن انگلیسی / تکمیلی (سمت چپ باکس)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={selectedElement.subcontent || ''}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { subcontent: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans text-left"
                    />
                  </div>
                )}

                {/* Typography, Colors & Text Alignment - ONLY FOR TEXT/CARD ELEMENTS */}
                {selectedElement.type !== 'image' &&
                  selectedElement.type !== 'icon' &&
                  selectedElement.type !== 'arrow' &&
                  selectedElement.type !== 'divider' &&
                  selectedElement.type !== 'shape' &&
                  selectedElement.type !== 'badge' && (
                  <>
                    {/* Typography & Colors */}
                    <div className="space-y-3">
                      <RangeSlider
                        label="اندازه فونت"
                        value={selectedElement.fontSize || 40}
                        min={18}
                        max={140}
                        step={1}
                        unit="px"
                        color="indigo"
                        onChange={(val) =>
                          onUpdateElement(selectedElement.id, {
                            fontSize: Math.round(val),
                          })
                        }
                      />
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">
                          رنگ متن
                        </label>
                        <ColorPicker
                          color={selectedElement.color || '#0f172a'}
                          onChange={(hex) => onUpdateElement(selectedElement.id, { color: hex })}
                        />
                      </div>
                    </div>

                    {/* Optional Box / Card Background Color */}
                    {(selectedElement.type === 'list-box' || selectedElement.type === 'card') && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">
                          رنگ پس‌زمینه کادر / آیکون
                        </label>
                        <ColorPicker
                          color={selectedElement.backgroundColor || '#9d174d'}
                          onChange={(hex) =>
                            onUpdateElement(selectedElement.id, { backgroundColor: hex })
                          }
                        />
                      </div>
                    )}

                    {/* Text Alignment */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        تراز متن
                      </label>
                      <div className="flex rounded-lg border border-slate-700 overflow-hidden">
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, { textAlign: 'right' })
                          }
                          className={`flex-1 py-1.5 flex items-center justify-center text-xs ${
                            selectedElement.textAlign === 'right'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <AlignRight size={14} />
                        </button>
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, { textAlign: 'center' })
                          }
                          className={`flex-1 py-1.5 flex items-center justify-center text-xs ${
                            selectedElement.textAlign === 'center'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <AlignCenter size={14} />
                        </button>
                        <button
                          onClick={() =>
                            onUpdateElement(selectedElement.id, { textAlign: 'left' })
                          }
                          className={`flex-1 py-1.5 flex items-center justify-center text-xs ${
                            selectedElement.textAlign === 'left'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <AlignLeft size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Box / Image Width & Text Wrapping */}
                <div className="border-t border-slate-800 pt-3 space-y-3">
                  <RangeSlider
                    label={selectedElement.type === 'image' ? 'عرض تصویر روی صفحه' : 'عرض کادر باکس'}
                    icon={<MoveHorizontal size={14} className="text-indigo-400" />}
                    value={
                      selectedElement.type === 'image'
                        ? (selectedElement.width ?? 35)
                        : (selectedElement.width || 50)
                    }
                    min={15}
                    max={98}
                    step={1}
                    unit="%"
                    color="indigo"
                    onChange={(val) =>
                      onUpdateElement(selectedElement.id, {
                        width: Math.round(val),
                      })
                    }
                    action={
                      selectedElement.type === 'image' ? (
                        selectedElement.width !== undefined && selectedElement.width !== 35 ? (
                          <button
                            type="button"
                            onClick={() => onUpdateElement(selectedElement.id, { width: 35 })}
                            className="text-[10px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
                          >
                            اندازه پیش‌فرض (35%)
                          </button>
                        ) : null
                      ) : (
                        selectedElement.width ? (
                          <button
                            type="button"
                            onClick={() => onUpdateElement(selectedElement.id, { width: undefined })}
                            className="text-[10px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
                          >
                            ریست به خودکار
                          </button>
                        ) : null
                      )
                    }
                    hint={
                      selectedElement.type === 'image'
                        ? 'نکته: دستگیره‌های گوشه و طرفین تصویر روی اسلاید را هم می‌توانید با موس بکشید.'
                        : 'نکته: دستگیره‌های چپ و راست المان روی اسلاید را هم می‌توانید با موس بکشید.'
                    }
                  />

                  {/* Single-line vs Multi-line Wrap Toggle (Only for text) */}
                  {selectedElement.type !== 'image' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        نحوه شکست متن
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
                        <button
                          onClick={() => onUpdateElement(selectedElement.id, { nowrap: false })}
                          className={`py-1.5 px-2 rounded-md transition-colors text-center cursor-pointer ${
                            !selectedElement.nowrap
                              ? 'bg-indigo-600 text-white font-medium shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          شکست خودکار خطوط
                        </button>
                        <button
                          onClick={() => onUpdateElement(selectedElement.id, { nowrap: true })}
                          className={`py-1.5 px-2 rounded-md transition-colors text-center cursor-pointer ${
                            selectedElement.nowrap
                              ? 'bg-indigo-600 text-white font-medium shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          تک‌خطی (بدون شکست)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alignment of Element to Slide */}
                <div className="border-t border-slate-800 pt-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      تراز المان نسبت به اسلاید
                    </label>
                    <button
                      onClick={() => onUpdateElement(selectedElement.id, { x: 50, y: 50 })}
                      className="px-2 py-0.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded text-[11px] font-bold border border-indigo-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                      title="مرکز کامل صفحه"
                    >
                      <Crosshair size={12} />
                      <span>مرکز اسلاید</span>
                    </button>
                  </div>

                  {/* Horizontal Align */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => onUpdateElement(selectedElement.id, { x: 80 })}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer"
                      title="راست‌چین اسلاید"
                    >
                      <AlignHorizontalJustifyEnd size={14} className="text-indigo-400" />
                      <span>راست</span>
                    </button>
                    <button
                      onClick={() => onUpdateElement(selectedElement.id, { x: 50 })}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer"
                      title="وسط‌چین افقی"
                    >
                      <AlignHorizontalJustifyCenter size={14} className="text-indigo-400" />
                      <span>وسط افقی</span>
                    </button>
                    <button
                      onClick={() => onUpdateElement(selectedElement.id, { x: 20 })}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer"
                      title="چپ‌چین اسلاید"
                    >
                      <AlignHorizontalJustifyStart size={14} className="text-indigo-400" />
                      <span>چپ</span>
                    </button>
                  </div>

                  {/* Vertical Align */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => onUpdateElement(selectedElement.id, { y: 20 })}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer"
                      title="بالای اسلاید"
                    >
                      <AlignVerticalJustifyStart size={14} className="text-pink-400" />
                      <span>بالا</span>
                    </button>
                    <button
                      onClick={() => onUpdateElement(selectedElement.id, { y: 50 })}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer"
                      title="وسط‌چین عمودی"
                    >
                      <AlignVerticalJustifyCenter size={14} className="text-pink-400" />
                      <span>وسط عمودی</span>
                    </button>
                    <button
                      onClick={() => onUpdateElement(selectedElement.id, { y: 80 })}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer"
                      title="پایین اسلاید"
                    >
                      <AlignVerticalJustifyEnd size={14} className="text-pink-400" />
                      <span>پایین</span>
                    </button>
                  </div>
                </div>

                {/* Position Sliders */}
                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <RangeSlider
                    label="موقعیت افقی (X)"
                    value={selectedElement.x}
                    min={5}
                    max={95}
                    step={1}
                    unit="%"
                    color="indigo"
                    onChange={(val) =>
                      onUpdateElement(selectedElement.id, { x: Math.round(val) })
                    }
                  />
                  <RangeSlider
                    label="موقعیت عمودی (Y)"
                    value={selectedElement.y}
                    min={5}
                    max={95}
                    step={1}
                    unit="%"
                    color="pink"
                    onChange={(val) =>
                      onUpdateElement(selectedElement.id, { y: Math.round(val) })
                    }
                  />
                </div>

                {/* Layer Order (Z-Index) Controls */}
                <div className="border-t border-slate-800 pt-4 space-y-2.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    ترتیب لایه (Z-Index)
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => onBringToFront?.(selectedElement.id)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors cursor-pointer"
                      title="انتقال به بالاترین رو"
                    >
                      <ArrowUpToLine size={13} className="text-emerald-400" />
                      <span>بالاترین رو</span>
                    </button>
                    <button
                      onClick={() => onBringForward?.(selectedElement.id)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors cursor-pointer"
                      title="یک لایه به رو"
                    >
                      <ArrowUp size={13} className="text-emerald-400" />
                      <span>یک پله به رو</span>
                    </button>
                    <button
                      onClick={() => onSendBackward?.(selectedElement.id)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors cursor-pointer"
                      title="یک لایه به زیر"
                    >
                      <ArrowDown size={13} className="text-amber-400" />
                      <span>یک پله به زیر</span>
                    </button>
                    <button
                      onClick={() => onSendToBack?.(selectedElement.id)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors cursor-pointer"
                      title="انتقال به پایین‌ترین زیر"
                    >
                      <ArrowDownToLine size={13} className="text-amber-400" />
                      <span>پایین‌ترین زیر</span>
                    </button>
                  </div>
                </div>

                {/* ================= ANIMATION CONTROLS ================= */}
                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                    <Sparkles size={14} />
                    <span>تنظیمات ترنزیشن و انیمیشن ورود</span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">نوع انیمیشن</label>
                    <select
                      value={selectedElement.animation.type}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          animation: {
                            ...selectedElement.animation,
                            type: e.target.value as AnimationType,
                          },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                    >
                      <option value="slide-up">بالا آمدن نرم و روان (Smooth Slide Up)</option>
                      <option value="fade-in">محو شدن به ظاهر شدن (Fade In)</option>
                      <option value="pop-in">پاپ و زوم ارتجاعی (Pop In / Scale)</option>
                      <option value="slide-down">حرکت از بالا به پایین (Slide Down)</option>
                      <option value="zoom-in">بزرگنمایی تدریجی (Zoom In)</option>
                      <option value="typewriter">ماشین تحریر زنده (Typewriter)</option>
                      <option value="counter">شمارنده متحرک اعداد (Animated Counter)</option>
                      <option value="none">بدون انیمیشن (ثابت)</option>
                    </select>
                  </div>

                  {/* Counter configuration if counter animation is selected */}
                  {selectedElement.animation.type === 'counter' && (
                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2.5 text-xs">
                      <div className="text-amber-400 font-bold flex items-center gap-1.5 text-[11px]">
                        <span>تنظیمات شمارنده اعداد</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">عدد شروع</label>
                          <input
                            type="number"
                            value={selectedElement.animation.counterStart ?? 0}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, {
                                animation: {
                                  ...selectedElement.animation,
                                  counterStart: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">عدد هدف (پایان)</label>
                          <input
                            type="number"
                            placeholder="خودکار از متن"
                            value={selectedElement.animation.counterEnd ?? ''}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, {
                                animation: {
                                  ...selectedElement.animation,
                                  counterEnd: e.target.value ? Number(e.target.value) : undefined,
                                },
                              })
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <RangeSlider
                      label="تاخیر ورود به اسلاید (زمان شروع)"
                      value={selectedElement.animation.delay}
                      min={0}
                      max={Math.max(1, slide.duration - 0.5)}
                      step={0.1}
                      unit="s"
                      color="amber"
                      onChange={(val) =>
                        onUpdateElement(selectedElement.id, {
                          animation: {
                            ...selectedElement.animation,
                            delay: val,
                          },
                        })
                      }
                    />
                    <RangeSlider
                      label="مدت زمان اجرای ورود"
                      value={selectedElement.animation.duration}
                      min={0.2}
                      max={3}
                      step={0.1}
                      unit="s"
                      color="indigo"
                      onChange={(val) =>
                        onUpdateElement(selectedElement.id, {
                          animation: {
                            ...selectedElement.animation,
                            duration: val,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* ================= EXIT ANIMATION & OUT TIMING ================= */}
                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <Sparkles size={14} />
                    <span>تنظیمات خروج المان (Exit Animation)</span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">نوع انیمیشن خروج</label>
                    <select
                      value={selectedElement.animation.exitType || 'none'}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          animation: {
                            ...selectedElement.animation,
                            exitType: e.target.value as any,
                          },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                    >
                      <option value="none">بدون خروج (تا پایان اسلاید بماند)</option>
                      <option value="fade-out">محو شدن تدریجی (Fade Out)</option>
                      <option value="slide-down">خروج به سمت پایین (Slide Down)</option>
                      <option value="slide-up">خروج به سمت بالا (Slide Up)</option>
                      <option value="zoom-out">کوچک‌نمایی و خروج (Zoom Out)</option>
                    </select>
                  </div>

                  {selectedElement.animation.exitType && selectedElement.animation.exitType !== 'none' && (
                    <div className="space-y-3">
                      <RangeSlider
                        label="زمان شروع خروج روی اسلاید"
                        value={
                          selectedElement.animation.outTime !== undefined
                            ? selectedElement.animation.outTime
                            : Math.max(0, slide.duration - (selectedElement.animation.exitDuration || 0.5))
                        }
                        min={Number(((selectedElement.animation.delay || 0) + 0.3).toFixed(1))}
                        max={slide.duration}
                        step={0.1}
                        unit="s"
                        color="pink"
                        onChange={(val) =>
                          onUpdateElement(selectedElement.id, {
                            animation: {
                              ...selectedElement.animation,
                              outTime: val,
                            },
                          })
                        }
                      />
                      <RangeSlider
                        label="مدت زمان اجرای خروج"
                        value={selectedElement.animation.exitDuration ?? 0.5}
                        min={0.2}
                        max={2}
                        step={0.1}
                        unit="s"
                        color="rose"
                        onChange={(val) =>
                          onUpdateElement(selectedElement.id, {
                            animation: {
                              ...selectedElement.animation,
                              exitDuration: val,
                            },
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {/* ================= TAB 3: LAYERS MANAGEMENT ================= */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300">
                لایه‌های اسلاید ({slide.elements.length} المان)
              </span>
              <span className="text-[10px] text-slate-500">
                بالاتر = روی همه المان‌ها
              </span>
            </div>

            {slide.elements.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                هیچ المانی در این اسلاید وجود ندارد.
              </div>
            ) : (
              <div className="space-y-1.5">
                {[...slide.elements].reverse().map((el, revIndex) => {
                  const actualIndex = slide.elements.length - 1 - revIndex;
                  const isSelected = selectedElement?.id === el.id;

                  return (
                    <div
                      key={el.id}
                      onClick={() => onSelectElement?.(el.id)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/15 text-white shadow-md'
                          : 'border-slate-800 bg-slate-850 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 ml-2">
                        {el.type === 'image' ? (
                          <ImageIcon size={14} className="text-violet-400 shrink-0" />
                        ) : el.type === 'title' ? (
                          <Type size={14} className="text-indigo-400 shrink-0" />
                        ) : el.type === 'list-box' ? (
                          <ListOrdered size={14} className="text-pink-400 shrink-0" />
                        ) : (
                          <Layers size={14} className="text-amber-400 shrink-0" />
                        )}

                        <span className="truncate text-xs font-medium">
                          {el.content || `(${el.type})`}
                        </span>
                      </div>

                      {/* Layer Actions */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* Lock / Unlock */}
                        <button
                          onClick={() => onToggleLock?.(el.id)}
                          className={`p-1 rounded transition-colors ${
                            el.locked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-200'
                          }`}
                          title={el.locked ? 'باز کردن قفل' : 'قفل کردن'}
                        >
                          {el.locked ? <Lock size={13} /> : <Unlock size={13} />}
                        </button>

                        {/* Move Up in Z-index (Forward) */}
                        <button
                          disabled={actualIndex === slide.elements.length - 1}
                          onClick={() => onBringForward?.(el.id)}
                          className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="یک لایه به رو"
                        >
                          <ArrowUp size={13} />
                        </button>

                        {/* Move Down in Z-index (Backward) */}
                        <button
                          disabled={actualIndex === 0}
                          onClick={() => onSendBackward?.(el.id)}
                          className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="یک لایه به زیر"
                        >
                          <ArrowDown size={13} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteElement(el.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
