import React from 'react';
import * as LucideIcons from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

export interface IconDefinition {
  name: string;
  labelFa: string;
  category: 'business' | 'marketing' | 'social' | 'tech' | 'badges' | 'arrows' | 'tools' | 'general';
  tags: string[];
}

export const ICON_CATEGORIES = [
  { id: 'all', label: 'همه' },
  { id: 'business', label: 'کسب‌وکار و مالی' },
  { id: 'marketing', label: 'مارکتینگ و فروش' },
  { id: 'social', label: 'شبکه‌های اجتماعی و پیام' },
  { id: 'tech', label: 'تکنولوژی و رسانه' },
  { id: 'badges', label: 'نشان‌ها و رتبه‌بندی' },
  { id: 'arrows', label: 'فلش‌ها و نشانه‌ها' },
  { id: 'tools', label: 'ابزارها و تنظیمات' },
  { id: 'general', label: 'عمومی و کاربردی' },
] as const;

export const ICON_REGISTRY: IconDefinition[] = [
  // Marketing & Branding
  { name: 'Sparkles', labelFa: 'جرقه و هوش مصنوعی', category: 'marketing', tags: ['sparkles', 'ai', 'جرقه', 'هوش مصنوعی', 'ویژه', 'ستاره'] },
  { name: 'Flame', labelFa: 'آتش و داغ', category: 'marketing', tags: ['flame', 'fire', 'آتش', 'داغ', 'ترند', 'پرطرفدار', 'hot'] },
  { name: 'Rocket', labelFa: 'موشک و رشد', category: 'marketing', tags: ['rocket', 'launch', 'موشک', 'شروع', 'پرتاب', 'رشد', 'پیشرفت'] },
  { name: 'Target', labelFa: 'هدف', category: 'marketing', tags: ['target', 'goal', 'هدف', 'تارگت', 'برنامه‌ریزی'] },
  { name: 'TrendingUp', labelFa: 'روند صعودی', category: 'marketing', tags: ['trending', 'growth', 'رشد', 'صعودی', 'پیشرفت', 'افزایش'] },
  { name: 'Megaphone', labelFa: 'بلندگو و تبلیغات', category: 'marketing', tags: ['megaphone', 'ads', 'تبلیغات', 'اطلاعیه', 'آگهی', 'بلندگو'] },
  { name: 'Award', labelFa: 'جایزه و افتخار', category: 'marketing', tags: ['award', 'prize', 'جایزه', 'مدال', 'افتخار', 'قهرمان'] },
  { name: 'Trophy', labelFa: 'کاپ قهرمانی', category: 'marketing', tags: ['trophy', 'cup', 'جام', 'پیروزی', 'کاپ'] },
  { name: 'Crown', labelFa: 'تاج و پریمیوم', category: 'marketing', tags: ['crown', 'king', 'تاج', 'پریمیوم', 'vip', 'ویژه'] },
  { name: 'Gift', labelFa: 'هدیه و تخفیف', category: 'marketing', tags: ['gift', 'present', 'هدیه', 'جایزه', 'تخفیف', 'کادو'] },
  { name: 'Tag', labelFa: 'برچسب و قیمت', category: 'marketing', tags: ['tag', 'price', 'label', 'تخفیف', 'قیمت', 'برچسب'] },

  // Business & Finance
  { name: 'DollarSign', labelFa: 'دلار و پول', category: 'business', tags: ['dollar', 'money', 'پول', 'دلار', 'درآمد', 'سود'] },
  { name: 'CreditCard', labelFa: 'کارت بانکی', category: 'business', tags: ['card', 'bank', 'کارت', 'بانک', 'پرداخت'] },
  { name: 'Wallet', labelFa: 'کیف پول', category: 'business', tags: ['wallet', 'money', 'کیف پول', 'حساب'] },
  { name: 'ShoppingBag', labelFa: 'کیف خرید', category: 'business', tags: ['shopping', 'bag', 'خرید', 'فروشگاه'] },
  { name: 'ShoppingCart', labelFa: 'سبد خرید', category: 'business', tags: ['cart', 'shop', 'سبد خرید', 'سفارش'] },
  { name: 'Briefcase', labelFa: 'کیف کار و پروژه', category: 'business', tags: ['briefcase', 'work', 'کار', 'کسب‌وکار', 'پروژه'] },
  { name: 'Building2', labelFa: 'سازمان و شرکت', category: 'business', tags: ['company', 'building', 'سازمان', 'شرکت', 'اداره'] },
  { name: 'BarChart3', labelFa: 'نمودار میله‌ای', category: 'business', tags: ['chart', 'analytics', 'آمار', 'نمودار', 'تحلیل'] },
  { name: 'PieChart', labelFa: 'نمودار دایره‌ای', category: 'business', tags: ['chart', 'pie', 'سهم', 'آمار', 'درصد'] },
  { name: 'Receipt', labelFa: 'فاکتور و رسید', category: 'business', tags: ['receipt', 'bill', 'فاکتور', 'رسید', 'صورتحساب'] },

  // Social & Communication
  { name: 'MessageCircle', labelFa: 'گفتگو و پیام', category: 'social', tags: ['message', 'chat', 'پیام', 'چت', 'گفتگو'] },
  { name: 'MessageSquare', labelFa: 'کامنت و نظر', category: 'social', tags: ['comment', 'کامنت', 'نظر', 'بازخورد'] },
  { name: 'Send', labelFa: 'ارسال و تلگرام', category: 'social', tags: ['send', 'telegram', 'ارسال', 'پیام', 'فرستادن'] },
  { name: 'Share2', labelFa: 'اشتراک‌گذاری', category: 'social', tags: ['share', 'اشتراک', 'ارسال', 'دست‌به‌دست'] },
  { name: 'Phone', labelFa: 'تلفن و تماس', category: 'social', tags: ['phone', 'call', 'تلفن', 'تماس', 'پشتیبانی'] },
  { name: 'Mail', labelFa: 'ایمیل و نامه', category: 'social', tags: ['mail', 'email', 'ایمیل', 'نامه', 'پیام'] },
  { name: 'User', labelFa: 'کاربر', category: 'social', tags: ['user', 'person', 'کاربر', 'پروفایل', 'شخص'] },
  { name: 'Users', labelFa: 'تیم و کاربران', category: 'social', tags: ['users', 'team', 'تیم', 'گروه', 'اعضا', 'کاربران'] },
  { name: 'ThumbsUp', labelFa: 'لایک و تایید', category: 'social', tags: ['like', 'thumbs', 'لایک', 'عالی', 'موافقت'] },
  { name: 'Heart', labelFa: 'علاقه‌مندی و قلب', category: 'social', tags: ['heart', 'love', 'قلب', 'دوست‌داشتن', 'علاقه'] },

  // Badges & Signs
  { name: 'CheckCircle2', labelFa: 'تایید سبز و انجام شد', category: 'badges', tags: ['check', 'done', 'تایید', 'درست', 'موفقیت', 'انجام شد'] },
  { name: 'ShieldCheck', labelFa: 'امنیت و گارانتی', category: 'badges', tags: ['shield', 'security', 'امنیت', 'گارانتی', 'ضمانت', 'اطمینان'] },
  { name: 'Star', labelFa: 'ستاره و امتیاز', category: 'badges', tags: ['star', 'rating', 'ستاره', 'امتیاز', 'محبوب'] },
  { name: 'Zap', labelFa: 'سرعت و انرژی', category: 'badges', tags: ['zap', 'bolt', 'flash', 'سرعت', 'صاعقه', 'انرژی', 'فوری'] },
  { name: 'AlertCircle', labelFa: 'هشدار و توجه', category: 'badges', tags: ['alert', 'warning', 'هشدار', 'اخطار', 'مهم'] },
  { name: 'HelpCircle', labelFa: 'راهنما و سوال', category: 'badges', tags: ['help', 'faq', 'راهنما', 'سوال', 'کمک'] },
  { name: 'Lock', labelFa: 'قفل و حریم خصوصی', category: 'badges', tags: ['lock', 'private', 'قفل', 'محرمانه', 'امن'] },
  { name: 'BadgePercent', labelFa: 'درصد و تخفیف', category: 'badges', tags: ['percent', 'discount', 'درصد', 'تخفیف', 'آف'] },

  // Tech & Media
  { name: 'Laptop', labelFa: 'لپ‌تاپ و وب', category: 'tech', tags: ['laptop', 'computer', 'لپ‌تاپ', 'کامپیوتر', 'سایت'] },
  { name: 'Smartphone', labelFa: 'موبایل و اپ', category: 'tech', tags: ['phone', 'mobile', 'موبایل', 'گوشی', 'اپلیکیشن'] },
  { name: 'Monitor', labelFa: 'نمایشگر و مانیتور', category: 'tech', tags: ['monitor', 'screen', 'صفحه', 'مانیتور', 'دسکتاپ'] },
  { name: 'Video', labelFa: 'ویدیو و دوربین', category: 'tech', tags: ['video', 'camera', 'ویدیو', 'فیلم', 'کلیپ'] },
  { name: 'Play', labelFa: 'پخش ویدیو', category: 'tech', tags: ['play', 'start', 'پخش', 'شروع', 'اجرا'] },
  { name: 'Headphones', labelFa: 'هدفون و پادکست', category: 'tech', tags: ['headphones', 'audio', 'صدا', 'موزیک', 'پادکست'] },
  { name: 'Code2', labelFa: 'کد و برنامه‌نویسی', category: 'tech', tags: ['code', 'dev', 'برنامه‌نویسی', 'کد', 'سورس'] },
  { name: 'Database', labelFa: 'دیتابیس و داده', category: 'tech', tags: ['database', 'data', 'داده', 'بانک اطلاعات'] },
  { name: 'Globe', labelFa: 'اینترنت و جهانی', category: 'tech', tags: ['globe', 'web', 'اینترنت', 'وبسایت', 'جهانی'] },
  { name: 'Wifi', labelFa: 'شبکه و اینترنت', category: 'tech', tags: ['wifi', 'network', 'وای‌فای', 'اتصال'] },

  // Arrows & Navigation
  { name: 'ArrowRight', labelFa: 'فلش راست', category: 'arrows', tags: ['arrow', 'right', 'راست', 'فلش'] },
  { name: 'ArrowLeft', labelFa: 'فلش چپ', category: 'arrows', tags: ['arrow', 'left', 'چپ', 'فلش'] },
  { name: 'ArrowUpRight', labelFa: 'فلش شیب‌دار بالا', category: 'arrows', tags: ['arrow', 'diagonal', 'بالا', 'لینک'] },
  { name: 'ChevronRight', labelFa: 'نشانه‌گر راست', category: 'arrows', tags: ['chevron', 'right', 'بعدی'] },
  { name: 'ChevronLeft', labelFa: 'نشانه‌گر چپ', category: 'arrows', tags: ['chevron', 'left', 'قبلی'] },
  { name: 'MousePointerClick', labelFa: 'کلیک ماوس', category: 'arrows', tags: ['cursor', 'click', 'کلیک', 'ماوس', 'انتخاب'] },

  // Tools & Settings
  { name: 'Settings', labelFa: 'تنظیمات', category: 'tools', tags: ['settings', 'gear', 'تنظیمات', 'پیکربندی'] },
  { name: 'Sliders', labelFa: 'فیلتر و کنترل', category: 'tools', tags: ['sliders', 'filter', 'کنترل', 'تنظیم'] },
  { name: 'Search', labelFa: 'جستجو', category: 'tools', tags: ['search', 'find', 'جستجو', 'یافتن'] },
  { name: 'Filter', labelFa: 'فیلتر کردن', category: 'tools', tags: ['filter', 'فیلتر', 'پالایش'] },
  { name: 'PenTool', labelFa: 'طراحی و دیزاین', category: 'tools', tags: ['pen', 'design', 'دیزاین', 'قلم', 'طراحی'] },
  { name: 'Palette', labelFa: 'پالت رنگ و گرافیک', category: 'tools', tags: ['palette', 'color', 'رنگ', 'گرافیک', 'پالت'] },

  // General & Utility
  { name: 'Calendar', labelFa: 'تقویم و تاریخ', category: 'general', tags: ['calendar', 'date', 'تقویم', 'تاریخ', 'زمان'] },
  { name: 'Clock', labelFa: 'ساعت و زمان', category: 'general', tags: ['clock', 'time', 'ساعت', 'زمان', 'مدت'] },
  { name: 'MapPin', labelFa: 'مکان و آدرس', category: 'general', tags: ['map', 'location', 'مکان', 'آدرس', 'نقشه'] },
  { name: 'Compass', labelFa: 'قطب‌نما و هدایت', category: 'general', tags: ['compass', 'قطب‌نما', 'راهنمایی'] },
  { name: 'Sun', labelFa: 'روشنایی و روز', category: 'general', tags: ['sun', 'light', 'خورشید', 'روز'] },
  { name: 'Moon', labelFa: 'حالت شب و ماه', category: 'general', tags: ['moon', 'dark', 'شب', 'دارک'] },
  { name: 'Eye', labelFa: 'بازدید و مشاهده', category: 'general', tags: ['eye', 'view', 'دیدن', 'بازدید', 'مشاهده'] },
  { name: 'Check', labelFa: 'تیک ساده', category: 'general', tags: ['check', 'تیک', 'صحیح'] },
];

/**
 * Returns the Lucide React component for a given icon name.
 * Fallbacks to Sparkles if not found.
 */
export function getLucideIcon(iconName: string): React.ComponentType<any> {
  const icons = LucideIcons as Record<string, any>;
  return icons[iconName] || icons.Sparkles;
}

/**
 * Generates an SVG string representation of a Lucide icon.
 */
export function getIconSvgMarkup(
  iconName: string,
  color = '#ffffff',
  size = 64,
  strokeWidth = 2
): string {
  const IconComponent = getLucideIcon(iconName);
  try {
    return renderToStaticMarkup(
      React.createElement(IconComponent, {
        color,
        size,
        strokeWidth,
      })
    );
  } catch (err) {
    console.error('Failed to render icon SVG:', err);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}"><circle cx="12" cy="12" r="10"/></svg>`;
  }
}

/**
 * Generates a data URI suitable for HTMLImageElement src.
 */
export function getIconSvgDataUri(
  iconName: string,
  color = '#ffffff',
  size = 64,
  strokeWidth = 2
): string {
  const svg = getIconSvgMarkup(iconName, color, size, strokeWidth);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
