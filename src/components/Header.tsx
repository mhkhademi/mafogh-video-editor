import React, { useRef } from 'react';
import { Video, Download, Upload, Sparkles, Film, FileDown } from 'lucide-react';
import { Project } from '../types';

interface HeaderProps {
  project: Project;
  onUpdateTitle: (title: string) => void;
  onResetTemplate: () => void;
  onOpenExportModal: () => void;
  onImportProject: (imported: Project) => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateTitle,
  onResetTemplate,
  onOpenExportModal,
  onImportProject,
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
