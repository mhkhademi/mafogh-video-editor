import React, { useState } from 'react';
import { Slide, SlideElement, ElementType, AnimationType } from '../types';
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
} from 'lucide-react';

interface PropertiesPanelProps {
  slide: Slide;
  selectedElement: SlideElement | null;
  onUpdateSlide: (partial: Partial<Slide>) => void;
  onAddElement: (type: ElementType) => void;
  onUpdateElement: (elementId: string, partial: Partial<SlideElement>) => void;
  onDeleteElement: (elementId: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  slide,
  selectedElement,
  onUpdateSlide,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
}) => {
  const [activeTab, setActiveTab] = useState<'slide' | 'element' | 'elements-list'>('slide');

  // If user selects an element, automatically switch to element tab
  React.useEffect(() => {
    if (selectedElement) {
      setActiveTab('element');
    }
  }, [selectedElement?.id]);

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none shrink-0 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-medium">
        <button
          onClick={() => setActiveTab('slide')}
          className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'slide'
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette size={14} />
          <span>تنظیمات اسلاید</span>
        </button>
        <button
          onClick={() => setActiveTab('element')}
          className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'element'
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders size={14} />
          <span>المان انتخابی</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
                  <span>آیکون دایره‌ای</span>
                </button>
                <button
                  onClick={() => onAddElement('image')}
                  className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg flex items-center gap-2 text-xs text-slate-200 transition-colors"
                >
                  <ImageIcon size={16} className="text-violet-400" />
                  <span>عکس / تصویر</span>
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
                {/* Header with Delete Button */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300">
                    ویرایش المان ({selectedElement.type})
                  </span>
                  <button
                    onClick={() => onDeleteElement(selectedElement.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1 text-xs"
                    title="حذف المان"
                  >
                    <Trash2 size={14} />
                    <span>حذف</span>
                  </button>
                </div>

                {/* Content Input (Text vs Image URL/Upload) */}
                {selectedElement.type === 'image' ? (
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
                {selectedElement.type !== 'image' && (
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
                      <option value="none">بدون انیمیشن (ثابت)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <RangeSlider
                      label="تاخیر ورود به اسلاید"
                      value={selectedElement.animation.delay}
                      min={0}
                      max={10}
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
                      label="مدت زمان اجرای انیمیشن"
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
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
