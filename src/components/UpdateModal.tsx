import React from 'react';
import { X, Sparkles, Download, CheckCircle, RefreshCw, AlertTriangle, ShieldAlert, GitCommit, ArrowUpRight } from 'lucide-react';

export interface UpdateInfo {
  hasUpdate: boolean;
  isForce: boolean;
  isOffline?: boolean;
  current: {
    hash: string;
    short: string;
  };
  latest: {
    hash: string;
    short: string;
    message: string;
    author: string;
    date: string;
  } | null;
}

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  onApplyUpdate: () => Promise<void>;
  isUpdating: boolean;
  updateStatus: string;
  updateError: string | null;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  onApplyUpdate,
  isUpdating,
  updateStatus,
  updateError,
}) => {
  if (!isOpen || !updateInfo) return null;

  const isForce = updateInfo.isForce;
  const isCompleted = updateStatus === 'completed';

  return (
    <div
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fadeIn"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        {/* Glow Ambient Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                isForce
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
                  : 'bg-pink-600/20 text-pink-400 border border-pink-500/30 shadow-pink-500/10'
              }`}
            >
              {isForce ? <ShieldAlert size={22} className="animate-pulse" /> : <Sparkles size={20} />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>{isForce ? 'به‌روزرسانی ضروری سیستم' : 'به‌روزرسانی جدید آماده است'}</span>
                {isForce && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                    Force Update
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isForce
                  ? 'این به‌روزرسانی برای عملکرد صحیح برنامه الزامی است'
                  : 'امکانات جدید و بهبودهای نرم‌افزاری تدوینگر مافوق'}
              </p>
            </div>
          </div>

          {!isForce && !isUpdating && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Commit & Version Info Card */}
          {updateInfo.latest && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-mono text-pink-300">
                  <GitCommit size={14} className="text-pink-400" />
                  <span>نسخه: {updateInfo.latest.short}</span>
                </span>
                <span>{updateInfo.latest.date || 'لحظاتی پیش'}</span>
              </div>

              {/* Message / Changelog */}
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3 text-slate-200 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap font-sans text-[11.5px]">
                {updateInfo.latest.message || 'بهبود کارایی، رفع باگ‌ها و ارتقای امکانات تدوینگر'}
              </div>
            </div>
          )}

          {/* Updating State with Animated Bar */}
          {isUpdating && (
            <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-indigo-300 font-medium">
                  <RefreshCw size={14} className="animate-spin text-pink-400" />
                  <span>{updateStatus || 'در حال دریافت کدهای جدید از گیت‌هاب...'}</span>
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-full w-full animate-pulse rounded-full"></div>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                لطفاً شکیبا باشید؛ سیستم به صورت خودکار تغییرات را اعمال و ریفرش خواهد کرد.
              </p>
            </div>
          )}

          {/* Success Notification */}
          {isCompleted && (
            <div className="bg-emerald-950/50 border border-emerald-800/60 rounded-xl p-3.5 flex items-center gap-2.5 text-emerald-300 font-bold">
              <CheckCircle size={18} className="text-emerald-400 shrink-0" />
              <span>به‌روزرسانی با موفقیت اعمال شد! در حال راه‌اندازی مجدد...</span>
            </div>
          )}

          {/* Error Message */}
          {updateError && (
            <div className="bg-rose-950/50 border border-rose-800/60 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-300">
              <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">خطا در اعمال به‌روزرسانی:</span>
                <span className="text-[11px] text-rose-400 font-mono block">{updateError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-end gap-2.5">
          {!isForce && !isUpdating && !isCompleted && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              بعداً یادآوری کن
            </button>
          )}

          {!isCompleted && (
            <button
              disabled={isUpdating}
              onClick={onApplyUpdate}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all transform active:scale-95 cursor-pointer disabled:opacity-50 ${
                isForce
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-rose-600/30'
                  : 'bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-pink-600/25'
              }`}
            >
              {isUpdating ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>در حال نصب...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>{isForce ? 'نصب ضروری و ری‌استارت' : 'به‌روزرسانی و بارگذاری مجدد'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
