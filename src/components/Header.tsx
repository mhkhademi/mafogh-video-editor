import React, { useRef } from 'react';
import { Video, Download, Upload, Sparkles, Film, FileDown, Monitor, Smartphone, Square, RectangleVertical, Undo2, Redo2 } from 'lucide-react';
import { Project, AspectRatioType } from '../types';

interface HeaderProps {
  project: Project;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onUpdateTitle: (title: string) => void;
  onResetTemplate: () => void;
  onOpenExportModal: () => void;
  onImportProject: (imported: Project) => void;
  onSelectAspectRatio?: (ratio: AspectRatioType) => void;
  hasUpdate?: boolean;
  onOpenUpdateModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onUpdateTitle,
  onResetTemplate,
  onOpenExportModal,
  onImportProject,
  onSelectAspectRatio,
  hasUpdate = false,
  onOpenUpdateModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 select-none shrink-0 z-20">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-4">
        <a
          href="https://mafogh.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3.5 group cursor-pointer hover:opacity-90 transition-opacity"
          title="مشاهده وب‌سایت آژانس برندینگ مافوق (mafogh.com)"
        >
          {/* Official Clean White Mafogh Logo (Includes both mark and wordmark) */}
          <img
            src="/mafogh-logo.svg"
            alt="آژانس برندینگ مافوق"
            className="h-8 w-auto object-contain"
          />

          <div className="flex flex-col justify-center border-r border-slate-800 pr-3.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-100">
                تدوینگر استودیویی
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#6b0b45]/30 text-pink-300 rounded border border-[#6b0b45]/40 font-mono font-bold">
                1080p
              </span>
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-pink-300 transition-colors">
              آژانس برندینگ مافوق | mafogh.com
            </span>
          </div>
        </a>

        <div className="h-6 w-px bg-slate-800"></div>

        {/* Editable Title */}
        <input
          type="text"
          value={project.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="عنوان پروژه..."
          className="bg-transparent hover:bg-slate-900 focus:bg-slate-900 border border-transparent hover:border-slate-800 focus:border-slate-700 rounded-lg px-2.5 py-1 text-sm font-medium text-slate-200 focus:outline-none transition-colors"
        />

        <div className="h-6 w-px bg-slate-800"></div>

        {/* Undo / Redo Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
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
            <Undo2 size={15} />
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
            <Redo2 size={15} />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-800"></div>

        {/* Aspect Ratio Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs shadow-inner">
          <button
            onClick={() => onSelectAspectRatio?.('16:9')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              (project.aspectRatio || '16:9') === '16:9'
                ? 'bg-[#6b0b45] text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="افقی ۱۶:۹ (یوتیوب، وب، دسکتاپ)"
          >
            <Monitor size={13} />
            <span>16:9</span>
          </button>

          <button
            onClick={() => onSelectAspectRatio?.('9:16')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              project.aspectRatio === '9:16'
                ? 'bg-[#6b0b45] text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="عمودی ۹:۱۶ (استوری، ریلز اینستاگرام، شورتز)"
          >
            <Smartphone size={13} />
            <span>9:16</span>
          </button>

          <button
            onClick={() => onSelectAspectRatio?.('1:1')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              project.aspectRatio === '1:1'
                ? 'bg-[#6b0b45] text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="مربعی ۱:۱ (پست اسلایدی اینستاگرام و لینکدین)"
          >
            <Square size={13} />
            <span>1:1</span>
          </button>

          <button
            onClick={() => onSelectAspectRatio?.('4:5')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              project.aspectRatio === '4:5'
                ? 'bg-[#6b0b45] text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="عمودی پرتره ۴:۵ (پست‌های ویدیویی اینستاگرام)"
          >
            <RectangleVertical size={13} />
            <span>4:5</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Reset / Load Sample Template */}
        <button
          onClick={onResetTemplate}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          title="بارگذاری نمونه ویدیوی LTV"
        >
          <Sparkles size={14} className="text-amber-400" />
          <span>قالب نمونه LTV</span>
        </button>

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
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          title="باز کردن فایل پروژه (Import JSON)"
        >
          <Upload size={16} />
        </button>

        {/* Export JSON */}
        <button
          onClick={handleExportJSON}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          title="ذخیره فایل پروژه (Save JSON)"
        >
          <FileDown size={16} />
        </button>

        <div className="h-6 w-px bg-slate-800"></div>

        {/* Update Notification Pill */}
        {hasUpdate && (
          <button
            onClick={onOpenUpdateModal}
            className="px-3 py-1.5 bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-pink-600/30 animate-pulse transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-pink-400/40"
            title="نسخه جدید آماده نصب است، کلیک کنید"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>به‌روزرسانی جدید</span>
          </button>
        )}

        {/* Export MP4 Video Button */}
        <button
          onClick={onOpenExportModal}
          className="px-4 py-2 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-pink-600/25 transition-all transform active:scale-95 cursor-pointer"
        >
          <Video size={16} />
          <span>خروجی و رندر MP4</span>
        </button>
      </div>
    </header>
  );
};
