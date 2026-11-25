import { Project, Slide, AspectRatioType } from '../types';
import { getAspectDimensions } from './dimensions';

export function generateClientArticleProject(params: {
  title: string;
  points?: string[];
  text?: string;
  style?: 'tips' | 'problem-solution' | 'deep-dive';
  aspectRatio?: AspectRatioType;
  targetDuration?: number;
}): Project {
  const aspectRatio = params.aspectRatio || '16:9';
  const isVertical = aspectRatio !== '16:9';
  const { width, height } = getAspectDimensions(aspectRatio);

  const title = params.title.trim() || 'نکات طلایی برای رشد کسب‌وکار';
  const cleanTitle = title.length > 55 ? `${title.slice(0, 52)}...` : title;

  const t = cleanTitle.toLowerCase();
  const isPersonalBranding =
    t.includes('پرسونال') || t.includes('شخصی') || t.includes('personal') || t.includes('برند');

  // Extract clean text sentences if user supplied full article text
  const cleanSentences: string[] = [];
  if (params.text) {
    const rawParagraphs = params.text.split('\n').filter((p) => p.trim().length > 25);
    rawParagraphs.forEach((p) => {
      const s = p.trim().replace(/^[-*•\d.]+\s*/, '');
      if (s.length > 25) cleanSentences.push(s);
    });
  }

  const rawPoints =
    params.points && params.points.length > 0
      ? params.points.filter((p) => p.trim().length > 0)
      : [
          'شناخت عمیق نیازها و دغدغه‌های پنهان مخاطب هدف',
          'ایجاد تمایز معنادار در پیام و ارزش پیشنهادی برند',
          'استمرار در خلق ارزش و پایه‌ریزی اعتمادی پایدار',
        ];

  const durationPerSlide = Math.max(5.0, Math.min(8.0, (params.targetDuration || 45) / 5));

  const slides: Slide[] = [];

  // =========================================================================
  // SLIDE 1: Cover / Hook (Gradient + Pill + Center Icon + Title)
  // =========================================================================
  slides.push({
    id: `client-cover-${Date.now()}`,
    title: `کاور: ${cleanTitle}`,
    duration: durationPerSlide,
    background: {
      type: 'gradient',
      color1: '#FAF5F8',
      color2: '#FFFFFF',
      gradientAngle: 135,
    },
    transitionOut: 'fade',
    transitionDuration: 0.6,
    elements: [
      {
        id: 'cov-badge',
        type: 'badge',
        content: 'گزیده راهبردی مقاله',
        badgeNumber: '⏱️',
        x: 50,
        y: isVertical ? 22 : 18,
        color: '#6B0B45',
        backgroundColor: '#FFFFFF',
        borderColor: '#EABAD7',
        fontSize: isVertical ? 22 : 24,
        fontWeight: '700',
        textAlign: 'center',
        padding: 14,
        borderRadius: 99,
        animation: { type: 'slide-down', delay: 0.1, duration: 0.6 },
      },
      {
        id: 'cov-icon',
        type: 'icon',
        content: isPersonalBranding ? 'Award' : 'Sparkles',
        x: 50,
        y: isVertical ? 34 : 33,
        color: '#6B0B45',
        backgroundColor: '#FBF4F8',
        borderColor: '#EABAD7',
        fontSize: isVertical ? 50 : 64,
        padding: isVertical ? 16 : 20,
        borderRadius: 24,
        strokeWidth: 2,
        animation: { type: 'pop-in', delay: 0.3, duration: 0.7 },
      },
      {
        id: 'cov-title',
        type: 'title',
        content: cleanTitle,
        x: 50,
        y: isVertical ? 50 : 52,
        width: isVertical ? 88 : 82,
        color: '#2F041E',
        fontSize: isVertical ? 48 : 56,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'slide-up', delay: 0.5, duration: 0.8 },
      },
      {
        id: 'cov-sub',
        type: 'subtitle',
        content: isPersonalBranding
          ? 'چرا در دنیای امروز تخصص بدون برند شخصی دیده نمی‌شود؟'
          : 'مهم‌ترین نکات و بینش‌های راهبردی که باید بدانید',
        x: 50,
        y: isVertical ? 68 : 68,
        color: '#64748B',
        fontSize: isVertical ? 22 : 26,
        fontWeight: '500',
        textAlign: 'center',
        animation: { type: 'slide-up', delay: 0.7, duration: 0.6 },
      },
    ],
  });

  // =========================================================================
  // SLIDE 2: Big Stat / Reality Metric (Huge Number + Insight Card)
  // =========================================================================
  const statSnippet =
    cleanSentences[0] ||
    (isPersonalBranding
      ? 'بیش از ۸۰٪ کارفرمایان و مشتریان، پیش از هر تصمیم‌گیری، ردپای حرفه‌ای و هویت آنلاین شما را ارزیابی می‌کنند.'
      : 'تصمیم‌گیری ناخودآگاه مخاطب در کمتر از چند ثانیه اولیه بر اساس هویت بصری برند شکل می‌گیرد.');

  slides.push({
    id: `client-stat-${Date.now()}`,
    title: 'واقعیت بازار: قدرت ادراک اولیه',
    duration: durationPerSlide + 0.5,
    background: {
      type: 'gradient',
      color1: '#FDFBFC',
      color2: '#F8F3F6',
      gradientAngle: 135,
    },
    transitionOut: 'fade',
    transitionDuration: 0.6,
    elements: [
      {
        id: 'stat-badge',
        type: 'badge',
        content: 'واقعیت بازار',
        badgeNumber: '📊',
        x: 50,
        y: isVertical ? 16 : 14,
        color: '#ffffff',
        backgroundColor: '#6B0B45',
        borderColor: '#5C093B',
        fontSize: isVertical ? 18 : 20,
        fontWeight: '800',
        textAlign: 'center',
        padding: 12,
        borderRadius: 99,
        animation: { type: 'slide-down', delay: 0.2, duration: 0.6 },
      },
      {
        id: 'stat-num',
        type: 'title',
        content: isPersonalBranding ? '۸۵٪' : '۳ ثانیه',
        x: 50,
        y: isVertical ? 28 : 27,
        color: '#6B0B45',
        fontSize: isVertical ? 80 : 100,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'pop-in', delay: 0.4, duration: 0.8 },
      },
      {
        id: 'stat-heading',
        type: 'title',
        content: isPersonalBranding
          ? 'تصمیم‌گیری مشتریان بر پایه اعتماد و ادراک اولیه است'
          : 'زمان طلایی ماندگاری هویت برند در ذهن مخاطب',
        x: 50,
        y: isVertical ? 44 : 44,
        width: isVertical ? 88 : 82,
        color: '#2F041E',
        fontSize: isVertical ? 38 : 46,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'slide-up', delay: 0.6, duration: 0.7 },
      },
      {
        id: 'stat-card',
        type: 'card',
        content: statSnippet,
        subcontent: 'برگرفته از مقاله تحلیل رفتار مخاطب',
        icon: 'TrendingUp',
        x: 50,
        y: isVertical ? 68 : 68,
        width: isVertical ? 90 : 76,
        color: '#334155',
        backgroundColor: '#FFFFFF',
        borderColor: '#EABAD7',
        fontSize: isVertical ? 24 : 27,
        fontWeight: '500',
        padding: 26,
        borderRadius: 24,
        animation: { type: 'slide-up', delay: 0.8, duration: 0.8 },
      },
    ],
  });

  // =========================================================================
  // SLIDE 3: Two-Column Comparison (Do's vs Don'ts / Right vs Wrong)
  // =========================================================================
  slides.push({
    id: `client-comp-${Date.now()}`,
    title: 'مقایسه رویکردها: اشتباه در برابر راهکار درست',
    duration: durationPerSlide + 1.0,
    background: {
      type: 'gradient',
      color1: '#FAF5F8',
      color2: '#FFFFFF',
      gradientAngle: 135,
    },
    transitionOut: 'fade',
    transitionDuration: 0.6,
    elements: [
      {
        id: 'comp-badge',
        type: 'badge',
        content: 'تمایز رویکردها',
        badgeNumber: '⚖️',
        x: 50,
        y: isVertical ? 16 : 14,
        color: '#ffffff',
        backgroundColor: '#6B0B45',
        borderColor: '#5C093B',
        fontSize: isVertical ? 18 : 20,
        fontWeight: '800',
        textAlign: 'center',
        padding: 12,
        borderRadius: 99,
        animation: { type: 'slide-down', delay: 0.2, duration: 0.6 },
      },
      {
        id: 'comp-title',
        type: 'title',
        content: isPersonalBranding
          ? 'تفاوت برند شخصی اصیل با هیاهوی توخالی'
          : 'تفاوت تبلیغات پرهزینه با ساخت هویت پایدار',
        x: 50,
        y: isVertical ? 28 : 27,
        width: isVertical ? 88 : 82,
        color: '#2F041E',
        fontSize: isVertical ? 38 : 48,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'slide-up', delay: 0.4, duration: 0.7 },
      },
      {
        id: 'comp-wrong',
        type: 'card',
        content: isPersonalBranding
          ? 'تمرکز صرف بر خودنمایی و کپی‌برداری از ترندهای روز، بدون داشتن تخصص واقعی و مهارت حل مسئله.'
          : 'تزریق بودجه سنگین به تبلیغات، پیش از تعریف شفاف مزیت رقابتی و تثبیت هویت برند.',
        subcontent: '❌ رویکرد اشتباه و گذرا',
        icon: 'AlertTriangle',
        x: isVertical ? 50 : 28,
        y: isVertical ? 48 : 58,
        width: isVertical ? 88 : 40,
        color: '#991B1B',
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        fontSize: isVertical ? 22 : 24,
        fontWeight: '500',
        padding: 24,
        borderRadius: 20,
        animation: { type: 'slide-up', delay: 0.6, duration: 0.7 },
      },
      {
        id: 'comp-right',
        type: 'card',
        content: isPersonalBranding
          ? 'خلق مداوم ارزش، اشتراک تجربیات دست‌اول و پایه‌ریزی اعتمادی عمیق که در ذهن مخاطب ماندگار شود.'
          : 'مهندسی دقیق هویت و جایگاه اختصاصی در بازار، تا هر هزینه تبلیغاتی به دارایی ماندگار تبدیل گردد.',
        subcontent: '✅ راهکار استراتژیک مافوق',
        icon: 'ShieldCheck',
        x: isVertical ? 50 : 72,
        y: isVertical ? 76 : 58,
        width: isVertical ? 88 : 40,
        color: '#065F46',
        backgroundColor: '#F0FDF4',
        borderColor: '#A7F3D0',
        fontSize: isVertical ? 22 : 24,
        fontWeight: '600',
        padding: 24,
        borderRadius: 20,
        animation: { type: 'slide-up', delay: 0.8, duration: 0.7 },
      },
    ],
  });

  // =========================================================================
  // SLIDE 4: Actionable Strategy & Key Insight Card
  // =========================================================================
  const strategySnippet =
    cleanSentences[1] ||
    rawPoints[0] ||
    (isPersonalBranding
      ? 'یک برند شخصی مقتدر نیازی به تعقیب مداوم مشتریان ندارد؛ کیفیت تخصص و اعتبار محتوا، بهترین فرصت‌ها را به‌سمت شما جذب می‌کند.'
      : 'یکپارچگی در تمام نقاط تماس برند، ضریب اعتماد مخاطبان و ارزش طول عمر مشتریان را تا چند برابر ارتقا می‌دهد.');

  slides.push({
    id: `client-strat-${Date.now()}`,
    title: 'راهکار عملی: استمرار در خلق ارزش',
    duration: durationPerSlide + 0.5,
    background: {
      type: 'gradient',
      color1: '#FDFBFC',
      color2: '#F8F3F6',
      gradientAngle: 135,
    },
    transitionOut: 'fade',
    transitionDuration: 0.6,
    elements: [
      {
        id: 'strat-badge',
        type: 'badge',
        content: 'راهکار عملی',
        badgeNumber: '🎯',
        x: 50,
        y: isVertical ? 18 : 16,
        color: '#ffffff',
        backgroundColor: '#6B0B45',
        borderColor: '#5C093B',
        fontSize: isVertical ? 18 : 20,
        fontWeight: '800',
        textAlign: 'center',
        padding: 12,
        borderRadius: 99,
        animation: { type: 'slide-down', delay: 0.2, duration: 0.6 },
      },
      {
        id: 'strat-title',
        type: 'title',
        content: isPersonalBranding
          ? 'استمرار در تولید ارزش، کلید نهایی پیروزی در بازار'
          : 'اصالت و همسانی پیام در تمام نقاط ارتباط با مخاطب',
        x: 50,
        y: isVertical ? 32 : 32,
        width: isVertical ? 88 : 80,
        color: '#2F041E',
        fontSize: isVertical ? 40 : 50,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'slide-up', delay: 0.4, duration: 0.7 },
      },
      {
        id: 'strat-card',
        type: 'card',
        content: strategySnippet,
        subcontent: 'قانون طلایی توسعه برند • آژانس مافوق',
        icon: 'Target',
        x: 50,
        y: isVertical ? 62 : 62,
        width: isVertical ? 90 : 76,
        color: '#334155',
        backgroundColor: '#FFFFFF',
        borderColor: '#EABAD7',
        fontSize: isVertical ? 24 : 28,
        fontWeight: '500',
        padding: 28,
        borderRadius: 24,
        animation: { type: 'slide-up', delay: 0.8, duration: 0.8 },
      },
    ],
  });

  // =========================================================================
  // SLIDE 5: Luxury Call-To-Action (Rich Maroon Gradient + White Action Card)
  // =========================================================================
  slides.push({
    id: `client-cta-${Date.now()}`,
    title: 'پایان: مطالعه متن کامل در وب‌سایت',
    duration: durationPerSlide,
    background: {
      type: 'gradient',
      color1: '#6B0B45',
      color2: '#2F041E',
      gradientAngle: 145,
    },
    transitionOut: 'none',
    transitionDuration: 0.5,
    elements: [
      {
        id: 'cta-hook',
        type: 'badge',
        content: 'می‌خواهید عمیق‌تر این موضوع را یاد بگیرید؟',
        badgeNumber: '💡',
        x: 50,
        y: isVertical ? 22 : 20,
        color: '#FFFFFF',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        fontSize: isVertical ? 22 : 24,
        fontWeight: '600',
        textAlign: 'center',
        padding: 14,
        borderRadius: 99,
        animation: { type: 'slide-down', delay: 0.2, duration: 0.6 },
      },
      {
        id: 'cta-title',
        type: 'title',
        content: 'مطالعه متن کامل مقاله در وبلاگ مافوق',
        x: 50,
        y: isVertical ? 38 : 38,
        width: isVertical ? 88 : 80,
        color: '#FFFFFF',
        fontSize: isVertical ? 46 : 60,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'slide-up', delay: 0.5, duration: 0.8 },
      },
      {
        id: 'cta-card',
        type: 'card',
        content: 'mafogh.com • کلیک کنید و آنلاین بخوانید ←',
        subcontent: 'دسترسی رایگان به تمام سرفصل‌ها و چک‌لیست‌های تخصصی',
        icon: 'BookOpen',
        x: 50,
        y: isVertical ? 66 : 66,
        width: isVertical ? 88 : 74,
        color: '#6B0B45',
        backgroundColor: '#FFFFFF',
        borderColor: '#FCE7F3',
        fontSize: isVertical ? 24 : 28,
        fontWeight: '800',
        textAlign: 'center',
        padding: 28,
        borderRadius: 24,
        animation: { type: 'pop-in', delay: 0.8, duration: 0.7 },
      },
    ],
  });

  return {
    id: `proj-client-${Date.now()}`,
    title,
    width,
    height,
    aspectRatio,
    fps: 30,
    watermark: {
      enabled: true,
      type: 'image',
      imageUrl: '/mafogh-logo-brand.svg',
      text: 'مافوق',
      position: 'bottom-center',
      opacity: 0.95,
      size: 48,
      color: '',
    },
    slides,
  };
}
