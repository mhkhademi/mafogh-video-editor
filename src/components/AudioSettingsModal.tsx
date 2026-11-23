import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Upload,
  Volume2,
  VolumeX,
  Repeat,
  Sparkles,
  X,
  Check,
  Trash2,
  FileAudio,
  Radio,
} from 'lucide-react';
import { AudioConfig } from '../types';
import { RangeSlider } from './RangeSlider';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAudio?: AudioConfig;
  onSaveAudio: (audio?: AudioConfig) => void;
}

interface AudioPreset {
  id: string;
  nameFa: string;
  nameEn: string;
  desc: string;
  url: string;
  tags: string[];
}

export const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: 'corporate-minimal',
    nameFa: 'مینیمال شرکتی و تجاری',
    nameEn: 'Corporate Minimal',
    desc: 'پیانو و پد گرم هارمونیک، بسیار مناسب پرزنتیشن‌ها و برندینگ',
    url: '/audio/corporate-minimal.wav',
    tags: ['کسب‌وکار', 'پیانو', 'ملایم'],
  },
  {
    id: 'tech-ambient',
    nameFa: 'تکنولوژی و دیجیتال',
    nameEn: 'Tech Ambient',
    desc: 'نبض متمرکز و شفاف با آرپژ مدرن، ایده‌آل برای مباحث فناوری و نرم‌افزار',
    url: '/audio/tech-ambient.wav',
    tags: ['فناوری', 'نبض مدرن', 'شفاف'],
  },
  {
    id: 'deep-focus',
    nameFa: 'تمرکز عمیق و لوفای',
    nameEn: 'Deep Focus',
    desc: 'آکوردهای آرامش‌بخش با فیلتر تنفسی، عالی برای مطالعه و مقالات راهبردی',
    url: '/audio/deep-focus.wav',
    tags: ['آموزش', 'لوفای', 'تمرکز'],
  },
  {
    id: 'inspiring-growth',
    nameFa: 'رشد و الهام‌بخش',
    nameEn: 'Inspiring Growth',
    desc: 'آکوستیک زنگوله‌ای و صعودی، مثبت و پرانرژی برای معرفی خدمات و راهکارها',
    url: '/audio/inspiring-growth.wav',
    tags: ['الهام‌بخش', 'انرژی مثبت', 'صعودی'],
  },
];

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  currentAudio,
  onSaveAudio,
}) => {
  const [selectedUrl, setSelectedUrl] = useState<string>(currentAudio?.url || '');
  const [trackName, setTrackName] = useState<string>(currentAudio?.name || '');
  const [volume, setVolume] = useState<number>(currentAudio?.volume ?? 0.35);
  const [loop, setLoop] = useState<boolean>(currentAudio?.loop ?? true);
  const [fadeIn, setFadeIn] = useState<boolean>(currentAudio?.fadeIn ?? true);
  const [fadeOut, setFadeOut] = useState<boolean>(currentAudio?.fadeOut ?? true);

  // Audio preview player state
  const [previewingUrl, setPreviewingUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentAudio?.url || '');
      setTrackName(currentAudio?.name || '');
      setVolume(currentAudio?.volume ?? 0.35);
      setLoop(currentAudio?.loop ?? true);
      setFadeIn(currentAudio?.fadeIn ?? true);
      setFadeOut(currentAudio?.fadeOut ?? true);
    } else {
      stopPreview();
    }
  }, [isOpen, currentAudio]);

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }
    setPreviewingUrl(null);
    setIsPlayingPreview(false);
  };

  const handleTogglePreview = (url: string) => {
    if (previewingUrl === url && isPlayingPreview) {
      stopPreview();
      return;
    }

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio();
      previewAudioRef.current.onended = () => setIsPlayingPreview(false);
    }

    previewAudioRef.current.src = url;
    previewAudioRef.current.volume = volume;
    previewAudioRef.current.loop = true;
    previewAudioRef.current.play().then(() => {
      setPreviewingUrl(url);
      setIsPlayingPreview(true);
    }).catch((err) => {
      console.warn('Audio preview play prevented:', err);
    });
  };

  const handleSelectPreset = (preset: AudioPreset) => {
    setSelectedUrl(preset.url);
    setTrackName(preset.nameFa);
    handleTogglePreview(preset.url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        const dataUrl = ev.target.result;
        setSelectedUrl(dataUrl);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setTrackName(nameWithoutExt);
        handleTogglePreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    stopPreview();
    if (!selectedUrl) {
      onSaveAudio(undefined);
    } else {
      onSaveAudio({
        url: selectedUrl,
        name: trackName || 'موزیک زیرصدا',
        volume,
        loop,
        fadeIn,
        fadeOut,
      });
    }
    onClose();
  };

  const handleRemoveAudio = () => {
    stopPreview();
    setSelectedUrl('');
    setTrackName('');
    onSaveAudio(undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopPreview();
          onClose();
        }
      }}
    >
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-pink-950/30 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 to-rose-700 flex items-center justify-center shadow-lg shadow-pink-950/50 border border-pink-400/30">
              <Music size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>تنظیمات موزیک و زیرصدای ویدیو</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-medium">
                  Background Audio
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                موزیک ملایم پس‌زمینه برای افزایش ماندگاری، حس لوکس و اثرگذاری محتوا
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopPreview();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Preset Tracks Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles size={14} className="text-pink-400" />
                <span>موزیک‌های آماده شرکتی و لوکس (بدون کپی‌رایت)</span>
              </label>
              <span className="text-[11px] text-slate-400">۴ تِرک اختصاصی مافوق</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AUDIO_PRESETS.map((preset) => {
                const isSelected = selectedUrl === preset.url;
                const isPlayingThis = previewingUrl === preset.url && isPlayingPreview;

                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-pink-500 bg-pink-950/20 shadow-md shadow-pink-950/30'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                          <span>{preset.nameFa}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePreview(preset.url);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                            isPlayingThis
                              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/50 scale-105'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                          }`}
                          title={isPlayingThis ? 'توقف پخش آزمایشی' : 'پخش آزمایشی'}
                        >
                          {isPlayingThis ? <Pause size={12} /> : <Play size={12} className="mr-0.5" />}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <div className="flex items-center gap-1">
                        {preset.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[11px] text-pink-400 font-bold">
                          <Check size={13} />
                          <span>انتخاب‌شده</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Upload Section */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Upload size={14} className="text-indigo-400" />
                <span>آپلود فایل صوتی یا موزیک دلخواه</span>
              </label>
              <span className="text-[11px] text-slate-400">MP3, WAV, M4A, OGG</span>
            </div>

            <div
              onClick={() => document.getElementById('custom-audio-upload')?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-pink-500/80 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/80 group"
            >
              <input
                id="custom-audio-upload"
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-pink-600/20 text-slate-400 group-hover:text-pink-300 flex items-center justify-center mx-auto mb-2 transition-colors">
                <FileAudio size={20} />
              </div>
              <p className="text-xs font-semibold text-slate-200">
                کلیک کنید تا فایل صوتی از کامپیوتر خود انتخاب کنید
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                فایل به‌صورت محلی روی پروژه ذخیره می‌شود و نیازی به سرور ندارد
              </p>
            </div>

            {/* Currently selected custom audio badge */}
            {selectedUrl && !AUDIO_PRESETS.some((p) => p.url === selectedUrl) && (
              <div className="mt-3 p-3 bg-pink-950/20 border border-pink-500/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-pink-600/20 text-pink-300 flex items-center justify-center shrink-0">
                    <Music size={16} />
                  </div>
                  <div className="truncate text-right">
                    <p className="text-xs font-bold text-white truncate">{trackName || 'فایل صوتی آپلود شده'}</p>
                    <p className="text-[10px] text-pink-300/80">فایل سفارشی آماده استفاده در ویدیو</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePreview(selectedUrl)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    title={isPlayingPreview ? 'توقف پخش' : 'پخش آزمایشی'}
                  >
                    {isPlayingPreview && previewingUrl === selectedUrl ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopPreview();
                      setSelectedUrl('');
                      setTrackName('');
                    }}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-colors cursor-pointer"
                    title="حذف این فایل"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Volume & Playback Controls */}
          {selectedUrl && (
            <div className="pt-2 border-t border-slate-800 space-y-4">
              <label className="text-xs font-bold text-slate-200 block">
                تنظیمات پخش و میزان بلندی صدا
              </label>

              {/* Volume Slider */}
              <RangeSlider
                label="میزان بلندی زیرصدا (Volume)"
                icon={<Volume2 size={14} className="text-amber-400" />}
                value={Math.round(volume * 100)}
                min={5}
                max={100}
                step={5}
                unit="٪"
                color="pink"
                onChange={(val) => {
                  const newVol = val / 100;
                  setVolume(newVol);
                  if (previewAudioRef.current) {
                    previewAudioRef.current.volume = newVol;
                  }
                }}
              />
              <p className="text-[10px] text-slate-400 -mt-2">
                پیشنهاد: ولوم ۲۰٪ تا ۳۵٪ برای زیرصدا ایده‌آل است تا کلمات و گوینده به‌خوبی شنیده شوند.
              </p>

              {/* Loop and Fade Controls */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLoop(!loop)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                    loop
                      ? 'border-pink-500/80 bg-pink-950/20 text-pink-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Repeat size={14} />
                    <span>تکرار پیوسته (Loop)</span>
                  </div>
                  <span className="text-[10px] font-bold">{loop ? 'روشن' : 'خاموش'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = !fadeIn;
                    setFadeIn(next);
                    setFadeOut(next);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                    fadeIn
                      ? 'border-pink-500/80 bg-pink-950/20 text-pink-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Radio size={14} />
                    <span>ورود و خروج ملایم (Fade)</span>
                  </div>
                  <span className="text-[10px] font-bold">{fadeIn ? 'روشن' : 'خاموش'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/70 flex items-center justify-between gap-3 shrink-0">
          <div>
            {currentAudio?.url && (
              <button
                type="button"
                onClick={handleRemoveAudio}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 size={13} />
                <span>حذف کامل موزیک از پروژه</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopPreview();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl shadow-lg shadow-pink-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check size={14} />
              <span>اعمال موزیک روی پروژه</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
