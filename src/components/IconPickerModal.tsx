import React, { useState, useMemo } from 'react';
import { X, Search, Sparkles, Check } from 'lucide-react';
import {
  ICON_REGISTRY,
  ICON_CATEGORIES,
  getLucideIcon,
  IconDefinition,
} from '../utils/iconRegistry';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (config: {
    iconName: string;
    color: string;
    backgroundColor?: string;
    borderRadius?: number;
    padding?: number;
  }) => void;
  initialIconName?: string;
  initialColor?: string;
  isReplacing?: boolean;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
  initialIconName = 'Sparkles',
  initialColor = '#6b0b45',
  isReplacing = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIcon, setSelectedIcon] = useState<string>(initialIconName);
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [bgStyle, setBgStyle] = useState<'transparent' | 'circle' | 'square'>('transparent');

  // Filtered icons based on category and search query
  const filteredIcons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ICON_REGISTRY.filter((item) => {
      // Category check
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Search check
      if (!q) return true;
      const matchName = item.name.toLowerCase().includes(q);
      const matchFa = item.labelFa.includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      return matchName || matchFa || matchTags;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    let backgroundColor = 'transparent';
    let borderRadius = 0;
    let padding = 0;

    if (bgStyle === 'circle') {
      backgroundColor = '#fdf2f8';
      borderRadius = 999;
      padding = 18;
    } else if (bgStyle === 'square') {
      backgroundColor = '#fdf2f8';
      borderRadius = 16;
      padding = 18;
    }

    onSelectIcon({
      iconName: selectedIcon,
      color: selectedColor,
      backgroundColor,
      borderRadius,
      padding,
    });
    onClose();
  };

  const PRESET_COLORS = [
    { label: 'مافوق', value: '#6b0b45' },
    { label: 'سرمه‌ای', value: '#1e293b' },
    { label: 'سفید', value: '#ffffff' },
    { label: 'سبز', value: '#10b981' },
    { label: 'طلایی', value: '#f59e0b' },
    { label: 'قرمز', value: '#ef4444' },
    { label: 'آبی', value: '#3b82f6' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh]"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-950/60 border border-pink-700/50 flex items-center justify-center text-pink-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>کتابخانه آیکون‌های وکتور</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-900/50 text-pink-300 text-[11px] font-normal border border-pink-700/30">
                  {ICON_REGISTRY.length} آیکون مدرن
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isReplacing
                  ? 'یک آیکون جدید برای جایگزینی انتخاب کنید.'
                  : 'آیکون دلخواه را انتخاب کنید تا به عنوان المان به اسلاید اضافه شود.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-850 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={18}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی فارسی یا انگلیسی (مثلاً: ستاره، آتش، موشک، تیک، مارکتینگ، star, flame, check...)"
              className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                پاک کردن
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {ICON_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-pink-700 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Icons Grid Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[280px]">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <Search size={36} className="mx-auto opacity-30 text-pink-400" />
              <p className="text-sm">آیکونی با این مشخصات پیدا نشد.</p>
              <p className="text-xs text-slate-600">
                می‌توانید کلمه دیگری را جستجو کنید یا دسته‌بندی «همه» را انتخاب نمایید.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2.5">
              {filteredIcons.map((item) => {
                const IconComp = getLucideIcon(item.name);
                const isCurrent = selectedIcon === item.name;

                return (
                  <button
                    key={item.name}
                    onClick={() => setSelectedIcon(item.name)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center group ${
                      isCurrent
                        ? 'bg-pink-950/70 border-pink-500 ring-2 ring-pink-500/50 shadow-lg scale-105'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-750 hover:border-slate-600'
                    }`}
                    title={`${item.labelFa} (${item.name})`}
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-lg mb-1.5 transition-transform group-hover:scale-110"
                      style={{
                        color: isCurrent ? selectedColor : '#e2e8f0',
                      }}
                    >
                      <IconComp size={28} strokeWidth={2} />
                    </div>
                    <span
                      className={`text-[11px] leading-tight line-clamp-1 ${
                        isCurrent ? 'text-pink-300 font-bold' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {item.labelFa}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5 opacity-70">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Styling & Confirmation Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-4">
          {/* Quick Color Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">رنگ آیکون:</span>
            <div className="flex items-center gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center transition-transform hover:scale-110 ${
                    selectedColor === c.value ? 'ring-2 ring-pink-400 ring-offset-2 ring-offset-slate-900 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {selectedColor === c.value && (
                    <Check
                      size={12}
                      className={c.value === '#ffffff' ? 'text-slate-900' : 'text-white'}
                    />
                  )}
                </button>
              ))}
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0"
                title="رنگ سفارشی"
              />
            </div>
          </div>

          {/* Background Style Switcher (only for adding new) */}
          {!isReplacing && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">ظاهر:</span>
              <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                <button
                  onClick={() => setBgStyle('transparent')}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    bgStyle === 'transparent' ? 'bg-pink-700 text-white font-medium' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ساده
                </button>
                <button
                  onClick={() => setBgStyle('circle')}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    bgStyle === 'circle' ? 'bg-pink-700 text-white font-medium' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  دایره‌ای
                </button>
                <button
                  onClick={() => setBgStyle('square')}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    bgStyle === 'square' ? 'bg-pink-700 text-white font-medium' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  مربعی
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mr-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-pink-700 hover:bg-pink-600 shadow-md transition-all flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>{isReplacing ? 'اعمال آیکون جدید' : 'افزودن به اسلاید'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
