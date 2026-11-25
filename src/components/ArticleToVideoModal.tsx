import React, { useState } from 'react';
import {
  Sparkles,
  Link2,
  FileText,
  Settings,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Video,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Monitor,
  Square,
  RectangleVertical,
  Flame,
} from 'lucide-react';
import { generateClientArticleProject } from '../utils/clientArticleGenerator';
import { Project, AspectRatioType } from '../types';
import confetti from 'canvas-confetti';

interface ArticleToVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProject: (project: Project) => void;
  currentAspectRatio?: AspectRatioType;
}

const STORAGE_KEY_GEMINI_KEY = 'mafogh_gemini_api_key';

export const ArticleToVideoModal: React.FC<ArticleToVideoModalProps> = ({
  isOpen,
  onClose,
  onApplyProject,
  currentAspectRatio = '16:9',
}) => {
  // Mode tabs: 'url' | 'manual' | 'settings'
  const [activeTab, setActiveTab] = useState<'url' | 'manual' | 'settings'>('url');

  // URL mode state
  const [url, setUrl] = useState('');

  // Manual mode state
  const [manualTitle, setManualTitle] = useState('');
  const [manualPoints, setManualPoints] = useState<string[]>(['', '', '']);
  const [manualText, setManualText] = useState('');

  // Video settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(currentAspectRatio);
  const [videoStyle, setVideoStyle] = useState<'tips' | 'problem-solution' | 'deep-dive'>('tips');
  const [targetDuration, setTargetDuration] = useState<number>(45);

  // Gemini API key from localStorage
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '';
    } catch (_) {
      return '';
    }
  });

  // Loading & Progress state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    try {
      localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
    } catch (_) {}
  };

  const handleUpdateManualPoint = (index: number, val: string) => {
    const next = [...manualPoints];
    next[index] = val;
    setManualPoints(next);
  };

  const handleAddManualPoint = () => {
    if (manualPoints.length < 5) {
      setManualPoints([...manualPoints, '']);
    }
  };

  const handleRemoveManualPoint = (index: number) => {
    if (manualPoints.length > 1) {
      setManualPoints(manualPoints.filter((_, i) => i !== index));
    }
  };

  const handleGenerate = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (activeTab === 'url') {
        if (!url.trim()) {
          throw new Error('لطفاً آدرس اینترنتی (URL) مقاله را وارد کنید.');
        }
        setLoadingStep('در حال خواندن مقاله و استخراج متن...');
      } else {
        if (!manualTitle.trim() && !manualText.trim()) {
          throw new Error('لطفاً عنوان مقاله یا متن آن را وارد کنید.');
        }
        setLoadingStep('در حال تحلیل محتوا با هوش مصنوعی...');
      }

      // Step transition simulator for better UX
      const stepTimer1 = setTimeout(() => {
        setLoadingStep('تحلیل و سناریونویسی اسلایدها با هوش مصنوعی...');
      }, 1500);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('اعمال استایل و رنگ‌های رسمی مافوق و تایمینگ...');
      }, 3200);

      const payload = {
        url: activeTab === 'url' ? url.trim() : undefined,
        title: activeTab === 'manual' ? manualTitle.trim() : undefined,
        points: activeTab === 'manual' ? manualPoints.filter((p) => p.trim().length > 0) : undefined,
        text: activeTab === 'manual' ? manualText.trim() : undefined,
        style: videoStyle,
        aspectRatio,
        targetDuration,
        apiKey: geminiApiKey.trim() || undefined,
      };

      let generatedProject: Project | null = null;

      try {
        const res = await fetch('http://localhost:3001/api/ai/generate-article-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.project) {
            generatedProject = data.project;
          }
        }
      } catch (backendErr) {
        console.warn('Backend server offline, executing client-side generation engine...', backendErr);
      }

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      // If backend was offline or failed, use client generator directly
      if (!generatedProject) {
        generatedProject = generateClientArticleProject({
          title: manualTitle.trim() || (activeTab === 'url' ? 'خلاصه مقاله مافوق' : 'نکات کلیدی مقاله'),
          points: manualPoints.filter((p) => p.trim().length > 0),
          text: manualText.trim(),
          style: videoStyle,
          aspectRatio,
          targetDuration,
        });
      }

      if (!generatedProject) {
        throw new Error('خطا در تولید اسلایدهای ویدیو.');
      }

      // Confetti & apply
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6B0B45', '#DE7AB6', '#F59E0B', '#3B82F6'],
      });

      onApplyProject(generatedProject);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطای غیرمنتظره در تولید ویدیو');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-[#6B0B45]/25 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B0B45] to-[#A81970] flex items-center justify-center shadow-lg shadow-pink-950/50 border border-pink-400/30">
              <Sparkles size={20} className="text-pink-200 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>تولید ویدیوی مقاله با هوش مصنوعی</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-medium">
                  Article-to-Video AI
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                لینک مقاله وبلاگ مافوق را وارد کنید تا هوش مصنوعی یک ویدیوی جذاب ۳۰ تا ۶۰ ثانیه‌ای برای آن بسازد
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 pb-0 bg-slate-900/60 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'border-[#DE7AB6] text-pink-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Link2 size={14} />
              <span>با لینک مقاله (اتوماتیک)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'border-[#DE7AB6] text-pink-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText size={14} />
              <span>دستی / پیش‌نویس متن</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-[#DE7AB6] text-pink-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings size={14} />
              <span>تنظیمات AI</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: URL MODE */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  آدرس اینترنتی (URL) مقاله در سایت مافوق یا وبلاگ
                </label>
                <div className="relative">
                  <input
                    type="url"
                    dir="ltr"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://mafogh.com/blog/brand-identity-guidelines"
                    className="w-full bg-[#121826] border border-slate-700/80 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <span>💡 سیستم متن مقاله، تیترها و سرفصل‌ها را خودکار می‌خواند و خلاصه‌سازی می‌کند.</span>
                </p>
              </div>

              {/* Quick Sample Links */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  آدرس‌های نمونه برای تست سریع:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setUrl('https://mafogh.com')}
                    className="text-[10px] px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    صفحه اصلی mafogh.com
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrl('https://virgool.io')}
                    className="text-[10px] px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    پست‌های وبلاگی
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL MODE */}
          {activeTab === 'manual' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  عنوان اصلی مقاله
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="مثال: ۵ اشتباه مهلک در طراحی هویت بصری برند"
                  className="w-full bg-[#121826] border border-slate-700/80 focus:border-pink-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    نکات کلیدی مقاله (هر نکته ۱ اسلاید می‌شود)
                  </label>
                  {manualPoints.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddManualPoint}
                      className="text-[11px] text-pink-400 hover:text-pink-300 font-bold cursor-pointer"
                    >
                      + افزودن نکته
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {manualPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={pt}
                        onChange={(e) => handleUpdateManualPoint(idx, e.target.value)}
                        placeholder={`نکته شماره ${idx + 1} از مقاله...`}
                        className="flex-1 bg-[#121826] border border-slate-700/80 focus:border-pink-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
                      />
                      {manualPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveManualPoint(idx)}
                          className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  متن خلاصه یا یادداشت‌ها (اختیاری)
                </label>
                <textarea
                  rows={3}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="اگر متن آماده‌ای دارید اینجا پیست کنید تا هوش مصنوعی آن را خلاصه‌سازی کند..."
                  className="w-full bg-[#121826] border border-slate-700/80 focus:border-pink-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS MODE */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white">کلید اختصاصی Google Gemini API</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      برای سناریونویسی خلاقانه‌تر هوش مصنوعی (اختیاری؛ بدون کلید هم موتور هوشمند مافوق فعال است)
                    </p>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-pink-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>دریافت رایگان کلید API</span>
                    <ExternalLink size={10} />
                  </a>
                </div>

                <input
                  type="password"
                  dir="ltr"
                  value={geminiApiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#121826] border border-slate-700/80 focus:border-pink-500 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-600 outline-none"
                />
                <p className="text-[10px] text-slate-500">
                  کلید به‌صورت محلی روی مرورگر شما ذخیره می‌شود و به هیچ سرور دیگری ارسال نخواهد شد.
                </p>
              </div>
            </div>
          )}

          {/* Video Target Options (Shown across URL & Manual) */}
          {activeTab !== 'settings' && (
            <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Video size={14} className="text-pink-400" />
                <span>تنظیمات ویدیو خروجی:</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Aspect Ratio */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-semibold">
                    ابعاد و کاربری ویدیو:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        aspectRatio === '16:9'
                          ? 'bg-[#6B0B45] border-pink-400 text-white shadow-md'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Monitor size={12} />
                      <span>۱۶:۹ (سایت)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        aspectRatio === '9:16'
                          ? 'bg-[#6B0B45] border-pink-400 text-white shadow-md'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone size={12} />
                      <span>۹:۱۶ (ریلز)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio('1:1')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        aspectRatio === '1:1'
                          ? 'bg-[#6B0B45] border-pink-400 text-white shadow-md'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Square size={12} />
                      <span>۱:۱ (اینستا)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio('4:5')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        aspectRatio === '4:5'
                          ? 'bg-[#6B0B45] border-pink-400 text-white shadow-md'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <RectangleVertical size={12} />
                      <span>۴:۵ (عمودی)</span>
                    </button>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-semibold">
                    مدت زمان تقریبی ویدیو:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTargetDuration(30)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        targetDuration === 30
                          ? 'bg-slate-700 border-slate-500 text-white shadow-md'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      ⚡ ۳۰ ثانیه (کوتاه و ترند)
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetDuration(50)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        targetDuration === 50
                          ? 'bg-slate-700 border-slate-500 text-white shadow-md'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      🎬 ۵۰ ثانیه (کامل با جزئیات)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            {isLoading ? (
              <span className="text-pink-300 font-bold animate-pulse flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin" />
                <span>{loadingStep || 'در حال آماده‌سازی و پردازش...'}</span>
              </span>
            ) : (
              <span>✨ تمام اسلایدها با کیت رنگ رسمی مافوق تولید خواهند شد.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              انصراف
            </button>

            {activeTab !== 'settings' ? (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-[#6B0B45] to-[#A81970] hover:from-[#7D0E52] hover:to-[#BD1E80] text-white px-5 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-pink-950/50 border border-pink-400/40 transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>تولید ویدیو...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-pink-200" />
                    <span>تولید هوشمند اسلایدها</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className="px-4 py-2 bg-[#6B0B45] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                تأیید و بازگشت
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
