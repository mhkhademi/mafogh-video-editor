import React, { useRef, useState, useEffect } from 'react';
import { Video, Download, Upload, Sparkles, Film, FileDown, Monitor, Smartphone, Square, RectangleVertical, Undo2, Redo2, ChevronDown, BookOpen, Layers, Music, RefreshCw } from 'lucide-react';
import { Project, AspectRatioType } from '../types';
import { articleTipsTemplate, articleProblemSolutionTemplate } from '../templates/articleTemplates';

interface HeaderProps {
  project: Project;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onUpdateTitle: (title: string) => void;
  onResetTemplate: () => void;
  onSelectTemplate?: (template: Project) => void;
  onOpenArticleModal?: () => void;
  onOpenExportModal: () => void;
  onImportProject: (imported: Project) => void;
  onSelectAspectRatio?: (ratio: AspectRatioType) => void;
  onOpenAudioModal?: () => void;
  hasUpdate?: boolean;
  onOpenUpdateModal?: () => void;
  onCheckForUpdates?: () => void;
  isCheckingUpdate?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onUpdateTitle,
  onResetTemplate,
  onSelectTemplate,
  onOpenArticleModal,
  onOpenExportModal,
  onImportProject,
  onSelectAspectRatio,
  onOpenAudioModal,
  hasUpdate = false,
  onOpenUpdateModal,
  onCheckForUpdates,
  isCheckingUpdate = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const templatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (templatesRef.current && !templatesRef.current.contains(e.target as Node)) {
        setIsTemplatesOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title || 'project'}.mafogh.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.slides && Array.isArray(parsed.slides)) {
          onImportProject(parsed);
        } else {
          alert('فرمت فایل پروژه نامعتبر است.');
        }
      } catch (err) {
        alert('خطا در خواندن فایل پروژه.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="h-14 xl:h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-3 md:px-5 select-none shrink-0 z-20 gap-2 min-w-0 overflow-x-auto">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-2 md:gap-3.5 shrink-0">
        <a
          href="https://mafogh.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 md:gap-3 group cursor-pointer hover:opacity-90 transition-opacity shrink-0"
          title="مشاهده وب‌سایت آژانس برندینگ مافوق (mafogh.com)"
        >
          {/* Official Clean White Mafogh Logo */}
          <img
            src="/mafogh-logo.svg"
            alt="آژانس برندینگ مافوق"
            className="h-7 xl:h-8 w-auto object-contain shrink-0"
          />

          <div className="flex flex-col justify-center border-r border-slate-800 pr-2.5 md:pr-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-100 whitespace-nowrap">
                تدوینگر استودیویی
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#6b0b45]/30 text-pink-300 rounded border border-[#6b0b45]/40 font-mono font-bold">
                1080p
              </span>
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-pink-300 transition-colors hidden 2xl:block whitespace-nowrap">
              آژانس برندینگ مافوق | mafogh.com
            </span>
          </div>
        </a>

        <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>

        {/* Editable Title */}
        <input
          type="text"
          value={project.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="عنوان پروژه..."
          className="bg-transparent hover:bg-slate-900 focus:bg-slate-900 border border-transparent hover:border-slate-800 focus:border-slate-700 rounded-lg px-2 py-1 text-xs md:text-sm font-medium text-slate-200 focus:outline-none transition-all w-24 sm:w-32 md:w-40 lg:w-48 xl:w-56 truncate"
        />

        <div className="h-5 w-px bg-slate-800 hidden md:block"></div>

        {/* Undo / Redo Buttons */}
        <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5 shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              canUndo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 cursor-not-allowed opacity-40'
            }`}
            title="بازگشت به عقب (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              canRedo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 cursor-not-allowed opacity-40'
            }`}
            title="انجام مجدد (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden lg:block"></div>

        {/* Aspect Ratio Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs shadow-inner shrink-0">
          <button
            onClick={() => onSelectAspectRatio?.('16:9')}
            className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
              (project.aspectRatio || '16:9') === '16:9'
                ? 'bg-[#6b0b45] text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="افقی ۱۶:۹ (یوتیوب، وب، دسکتاپ)"
          >
            <Monitor size={13} />
            <span className="hidden xl:inline">16:9</span>
          </button>

          <button
            onClick={() => onSelectAspectRatio?.('9:16')}
            className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
              project.aspectRatio === '9:16'
                ? 'bg-[#6b0b45] text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="عمودی ۹:۱۶ (استوری، ریلز اینستاگرام، شورتز)"
          >
            <Smartphone size={13} />
            <span className="hidden xl:inline">9:16</span>
          </button>

          <button
            onClick={() => onSelectAspectRatio?.('1:1')}
            className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
              project.aspectRatio === '1:1'
                ? 'bg-[#6b0b45] text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="مربعی ۱:۱ (پست اسلایدی اینستاگرام و لینکدین)"
          >
            <Square size={13} />
            <span className="hidden xl:inline">1:1</span>
          </button>

          <button
            onClick={() => onSelectAspectRatio?.('4:5')}
            className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
              project.aspectRatio === '4:5'
                ? 'bg-[#6b0b45] text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="عمودی پرتره ۴:۵ (پست‌های ویدیویی اینستاگرام)"
          >
            <RectangleVertical size={13} />
            <span className="hidden xl:inline">4:5</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
        {/* AI Article-to-Video Button */}
        <button
          onClick={onOpenArticleModal}
          className="px-2.5 md:px-3 py-1.5 bg-gradient-to-r from-[#6B0B45] via-[#A81970] to-[#D73697] hover:brightness-110 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-pink-950/40 border border-pink-400/40 transition-all hover:scale-102 active:scale-95 cursor-pointer shrink-0"
          title="تبدیل هوشمند مقالات وب‌سایت به ویدیو با هوش مصنوعی"
        >
          <Sparkles size={13} className="text-pink-200 animate-pulse shrink-0" />
          <span className="hidden sm:inline">تولید ویدیو از مقاله ✨</span>
          <span className="sm:hidden">ویدیو از مقاله ✨</span>
        </button>

        {/* Background Music Button */}
        <button
          onClick={onOpenAudioModal}
          className={`px-2.5 md:px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            project.audio?.url
              ? 'bg-pink-950/40 border-pink-500/60 text-pink-300 shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="تنظیمات موزیک و زیرصدای ویدیو"
        >
          <Music size={13} className={project.audio?.url ? 'text-pink-400' : 'text-slate-400'} />
          <span className="hidden sm:inline">
            {project.audio?.url ? (project.audio.name || 'موزیک فعال') : 'موزیک زیرصدا'}
          </span>
          {project.audio?.url && (
            <span className="text-[10px] px-1 rounded bg-pink-500/30 text-pink-200">
              {Math.round((project.audio.volume ?? 0.35) * 100)}٪
            </span>
          )}
        </button>

        {/* Templates Dropdown */}
        <div className="relative shrink-0" ref={templatesRef}>
          <button
            onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
            className="px-2.5 md:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="انتخاب از قالب‌های آماده ویدیو"
          >
            <BookOpen size={13} className="text-pink-400 shrink-0" />
            <span className="hidden sm:inline">قالب‌ها</span>
            <ChevronDown size={12} className={`transition-transform shrink-0 ${isTemplatesOpen ? 'rotate-180' : ''}`} />
          </button>

          {isTemplatesOpen && (
            <div
              dir="rtl"
              className="absolute left-0 mt-2 w-64 bg-[#0d121f] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-fadeIn"
            >
              <div className="text-[10px] text-slate-400 font-bold px-2 py-1 border-b border-slate-800/80 mb-1">
                قالب‌های استاندارد مقالات مافوق
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onSelectTemplate) {
                    onSelectTemplate(articleTipsTemplate);
                  } else {
                    onImportProject(articleTipsTemplate);
                  }
                  setIsTemplatesOpen(false);
                }}
                className="w-full text-right p-2 rounded-lg hover:bg-slate-800/80 text-xs text-slate-200 flex flex-col gap-0.5 cursor-pointer transition-colors"
              >
                <span className="font-bold text-pink-300">📌 ۳ نکته کلیدی مقاله (Tips)</span>
                <span className="text-[10px] text-slate-400">کاور + ۳ اسلاید نکته + اسلاید CTA</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSelectTemplate) {
                    onSelectTemplate(articleProblemSolutionTemplate);
                  } else {
                    onImportProject(articleProblemSolutionTemplate);
                  }
                  setIsTemplatesOpen(false);
                }}
                className="w-full text-right p-2 rounded-lg hover:bg-slate-800/80 text-xs text-slate-200 flex flex-col gap-0.5 cursor-pointer transition-colors"
              >
                <span className="font-bold text-amber-300">⚖️ چالش و راه‌حل (Problem & Solution)</span>
                <span className="text-[10px] text-slate-400">قلاب + ریشه مشکل + راهکار مافوق + CTA</span>
              </button>

              <div className="h-px bg-slate-800/80 my-1" />

              <button
                type="button"
                onClick={() => {
                  onResetTemplate();
                  setIsTemplatesOpen(false);
                }}
                className="w-full text-right p-2 rounded-lg hover:bg-slate-800/80 text-xs text-slate-200 flex flex-col gap-0.5 cursor-pointer transition-colors"
              >
                <span className="font-bold text-slate-300">📊 قالب نمونه LTV</span>
                <span className="text-[10px] text-slate-400">پرزنتیشن آموزشی کامل شاخص LTV</span>
              </button>

              <div className="h-px bg-slate-800/80 my-1" />

              <button
                type="button"
                onClick={() => {
                  setIsTemplatesOpen(false);
                  onCheckForUpdates?.();
                }}
                disabled={isCheckingUpdate}
                className="w-full text-right p-2 rounded-lg hover:bg-slate-800/80 text-xs text-slate-200 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <RefreshCw size={12} className={`text-indigo-400 shrink-0 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                  <span className="font-semibold text-slate-300">
                    {isCheckingUpdate ? 'در حال بررسی نسخه...' : 'بررسی به‌روزرسانی تدوینگر'}
                  </span>
                </div>
                {hasUpdate && (
                  <span className="text-[10px] bg-pink-500/25 text-pink-300 px-1.5 py-0.5 rounded-full font-bold">
                    نسخه جدید!
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Import JSON */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 md:p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer shrink-0"
          title="باز کردن فایل پروژه (Import JSON)"
        >
          <Upload size={15} />
        </button>

        {/* Export JSON */}
        <button
          onClick={handleExportJSON}
          className="p-1.5 md:p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer shrink-0"
          title="ذخیره فایل پروژه (Save JSON)"
        >
          <FileDown size={15} />
        </button>

        <div className="h-5 w-px bg-slate-800 hidden sm:block shrink-0"></div>

        {/* Update Notification Pill or Check Button */}
        {hasUpdate ? (
          <button
            onClick={onOpenUpdateModal}
            className="px-2.5 py-1.5 bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-pink-600/30 animate-pulse transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-pink-400/40 shrink-0"
            title="نسخه جدید آماده نصب است، برای مشاهده تغییرات و نصب کلیک کنید"
          >
            <Sparkles size={13} className="text-amber-300 shrink-0" />
            <span className="hidden sm:inline">به‌روزرسانی</span>
          </button>
        ) : (
          <button
            onClick={onCheckForUpdates}
            disabled={isCheckingUpdate}
            className="p-1.5 md:p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer shrink-0"
            title={isCheckingUpdate ? 'در حال بررسی به‌روزرسانی...' : 'بررسی وضعیت به‌روزرسانی'}
          >
            <RefreshCw size={14} className={isCheckingUpdate ? 'animate-spin text-pink-400' : ''} />
          </button>
        )}

        {/* Export MP4 Video Button */}
        <button
          onClick={onOpenExportModal}
          className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 md:gap-2 shadow-lg shadow-pink-600/25 transition-all transform active:scale-95 cursor-pointer shrink-0"
        >
          <Video size={15} className="shrink-0" />
          <span className="hidden sm:inline">خروجی و رندر MP4</span>
          <span className="sm:hidden">رندر MP4</span>
        </button>
      </div>
    </header>
  );
};
