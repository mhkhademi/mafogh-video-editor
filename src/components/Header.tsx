import React, { useRef, useState, useEffect } from 'react';
import { Video, Upload, Sparkles, FileDown, Monitor, Smartphone, Square, RectangleVertical, Undo2, Redo2, ChevronDown, BookOpen } from 'lucide-react';
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
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const templatesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleInput(project.title);
  }, [project.title]);

  // Close dropdown on click outside
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
          className="flex items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity"
          title="مشاهده آژانس برندینگ مافوق (mafogh.com)"
        >
          {/* Official Mafogh Logo Vector */}
          <img
            src="/mafogh-logo-brand.svg"
            alt="لوگوی رسمی مافوق"
            className="h-7 md:h-8 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col text-right justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] md:text-[13px] font-black tracking-tight text-white group-hover:text-pink-300 transition-colors">
                تدوینگر استودیویی
              </span>
              <span className="text-[9px] font-bold bg-[#6B0B45]/40 text-pink-300 px-1.5 py-0.5 rounded border border-pink-500/30">
                1080p
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              آژانس برندینگ مافوق | mafogh.com
            </span>
          </div>
        </a>

        <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>

        {/* Project Title with inline editing */}
        <div className="flex items-center max-w-[120px] md:max-w-[200px] lg:max-w-xs xl:max-w-sm">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                onUpdateTitle(titleInput.trim() || 'پروژه جدید');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingTitle(false);
                  onUpdateTitle(titleInput.trim() || 'پروژه جدید');
                }
              }}
              autoFocus
              className="bg-slate-900 border border-indigo-500/50 rounded px-2 py-0.5 text-xs text-white outline-none w-full"
            />
          ) : (
            <span
              onClick={() => setIsEditingTitle(true)}
              className="text-xs md:text-sm font-medium text-slate-300 hover:text-white cursor-pointer truncate transition-colors"
              title="برای تغییر نام کلیک کنید"
            >
              {project.title || 'پروژه جدید'}
            </span>
          )}
        </div>
      </div>

      {/* Center Controls: Undo/Redo & Aspect Ratio Selector */}
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-900 border border-slate-800/80 rounded-xl p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg transition-colors ${
              canUndo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="بازگشت به حرکت قبل (Undo - Ctrl+Z)"
          >
            <Undo2 size={13} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg transition-colors ${
              canRedo
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="انجام مجدد حرکت (Redo - Ctrl+Y)"
          >
            <Redo2 size={13} />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        {onSelectAspectRatio && (
          <div className="flex items-center bg-slate-900 border border-slate-800/80 rounded-xl p-0.5">
            <button
              onClick={() => onSelectAspectRatio('16:9')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                project.aspectRatio === '16:9'
                  ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="نسبت عریض یوتیوب و وب (16:9 - 1920x1080)"
            >
              <Monitor size={12} />
              <span className="text-[11px]">16:9</span>
            </button>
            <button
              onClick={() => onSelectAspectRatio('9:16')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                project.aspectRatio === '9:16'
                  ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="ریلز، استوری و تیک‌تاک (9:16 - 1080x1920)"
            >
              <Smartphone size={12} />
              <span className="text-[11px]">9:16</span>
            </button>
            <button
              onClick={() => onSelectAspectRatio('1:1')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                project.aspectRatio === '1:1'
                  ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="پست مربعی اینستاگرام (1:1 - 1080x1080)"
            >
              <Square size={12} />
              <span className="text-[11px]">1:1</span>
            </button>
            <button
              onClick={() => onSelectAspectRatio('4:5')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                project.aspectRatio === '4:5'
                  ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="پست عمودی اینستاگرام (4:5 - 1080x1350)"
            >
              <RectangleVertical size={12} />
              <span className="text-[11px]">4:5</span>
            </button>
          </div>
        )}
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

        {/* Export MP4 Video Button */}
        <button
          onClick={onOpenExportModal}
          className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-pink-600/25 transition-all transform active:scale-95 cursor-pointer shrink-0"
          title="دریافت فایل ویدیویی با فرمت MP4"
        >
          <Video size={15} className="shrink-0" />
          <span>خروجی</span>
        </button>
      </div>
    </header>
  );
};
