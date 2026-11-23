import { Project, AspectRatioType } from '../types';

export function generateClientArticleProject(params: {
  title: string;
  points?: string[];
  text?: string;
  style?: 'tips' | 'problem-solution' | 'deep-dive';
  aspectRatio?: AspectRatioType;
  targetDuration?: number;
}): Project {
  const aspectRatio = params.aspectRatio || '16:9';
  const isVertical = aspectRatio === '9:16';
  const width = isVertical ? 1080 : 1920;
  const height = isVertical ? 1920 : 1080;

  const title = params.title.trim() || 'نکات طلایی برای رشد کسب‌وکار';
  const rawPoints = params.points && params.points.length > 0
    ? params.points.filter((p) => p.trim().length > 0)
    : [
        'شناخت نیازهای پنهان و اصلی مخاطبان هدف',
        'تمایز واقعی در ارزش پیشنهادی نسبت به رقبا',
        'استمرار در ارائه ارزش و برقراری ارتباط صادقانه',
      ];

  const durationPerSlide = Math.max(4.5, Math.min(8.5, (params.targetDuration || 40) / (rawPoints.length + 2)));

  const slides: any[] = [
    // Slide 1: Cover
    {
      id: `client-cover-${Date.now()}`,
      title: `کاور: ${title}`,
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
          badgeNumber: '✨',
          x: 50,
          y: isVertical ? 22 : 24,
          color: '#6B0B45',
          backgroundColor: '#FFFFFF',
          borderColor: '#EABAD7',
          fontSize: isVertical ? 24 : 22,
          fontWeight: '700',
          textAlign: 'center',
          padding: 14,
          animation: { type: 'slide-up', delay: 0.1, duration: 0.6 },
        },
        {
          id: 'cov-title',
          type: 'title',
          content: title,
          x: 50,
          y: isVertical ? 38 : 42,
          color: '#2F041E',
          fontSize: isVertical ? 48 : 50,
          fontWeight: '900',
          textAlign: 'center',
          animation: { type: 'slide-up', delay: 0.3, duration: 0.7 },
        },
        {
          id: 'cov-sub',
          type: 'subtitle',
          content: 'مهم‌ترین نکات و بینش‌های کاربردی که باید به خاطر بسپارید',
          x: 50,
          y: isVertical ? 54 : 58,
          color: '#64748B',
          fontSize: isVertical ? 24 : 24,
          fontWeight: '500',
          textAlign: 'center',
          animation: { type: 'fade-in', delay: 0.5, duration: 0.6 },
        },
      ],
    },
  ];

  // Dynamic Content Slides
  rawPoints.forEach((point, idx) => {
    const slideNum = idx + 1;
    const badgeText = `اصل کلیدی شماره ${slideNum}`;
    const iconName = idx === 0 ? 'Sparkles' : idx === 1 ? 'TrendingUp' : 'CheckCircle2';

    slides.push({
      id: `client-slide-${slideNum}-${Date.now()}`,
      title: `نکته ${slideNum}: ${point.slice(0, 30)}`,
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
          id: `sl-${slideNum}-badge`,
          type: 'badge',
          content: badgeText,
          badgeNumber: '💡',
          x: 50,
          y: isVertical ? 18 : 22,
          color: '#6B0B45',
          backgroundColor: '#FFFFFF',
          borderColor: '#EABAD7',
          fontSize: 22,
          fontWeight: '700',
          textAlign: 'center',
          padding: 12,
          animation: { type: 'slide-up', delay: 0.1, duration: 0.6 },
        },
        {
          id: `sl-${slideNum}-title`,
          type: 'title',
          content: point,
          x: 50,
          y: isVertical ? 32 : 38,
          color: '#2F041E',
          fontSize: isVertical ? 40 : 44,
          fontWeight: '800',
          textAlign: 'center',
          animation: { type: 'slide-up', delay: 0.25, duration: 0.7 },
        },
        {
          id: `sl-${slideNum}-card`,
          type: 'card',
          content: `اجرای دقیق این راهکار باعث تمایز آشکار در دیدگاه مشتریان و افزایش بازدهی کسب‌وکار می‌شود.`,
          subcontent: 'راهبرد طلایی برگرفته از مقاله مافوق',
          icon: iconName,
          x: 50,
          y: isVertical ? 56 : 62,
          color: '#2F041E',
          backgroundColor: '#FFFFFF',
          borderColor: '#FBF4F8',
          fontSize: isVertical ? 22 : 24,
          fontWeight: '500',
          textAlign: 'right',
          padding: 24,
          animation: { type: 'pop-in', delay: 0.45, duration: 0.7 },
        },
      ],
    });
  });

  // Final CTA Slide
  slides.push({
    id: `client-cta-${Date.now()}`,
    title: 'اسلاید پایانی: دعوت به اقدام مافوق',
    duration: 5.0,
    background: {
      type: 'gradient',
      color1: '#6B0B45',
      color2: '#2F041E',
      gradientAngle: 140,
    },
    transitionOut: 'fade',
    transitionDuration: 0.6,
    elements: [
      {
        id: 'cta-sub',
        type: 'subtitle',
        content: 'می‌خواهید عمیق‌تر این موضوع را بررسی و در بیزینس خود پیاده کنید؟',
        x: 50,
        y: isVertical ? 32 : 36,
        color: '#F9A8D4',
        fontSize: isVertical ? 24 : 26,
        fontWeight: '500',
        textAlign: 'center',
        animation: { type: 'slide-up', delay: 0.15, duration: 0.6 },
      },
      {
        id: 'cta-title',
        type: 'title',
        content: 'مطالعه متن کامل مقاله در سایت مافوق',
        x: 50,
        y: isVertical ? 46 : 48,
        color: '#FFFFFF',
        fontSize: isVertical ? 46 : 52,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'pop-in', delay: 0.35, duration: 0.7 },
      },
      {
        id: 'cta-badge',
        type: 'badge',
        content: 'mafogh.com',
        badgeNumber: '🌐',
        x: 50,
        y: isVertical ? 60 : 64,
        color: '#6B0B45',
        backgroundColor: '#FFFFFF',
        borderColor: '#EABAD7',
        fontSize: 26,
        fontWeight: '900',
        textAlign: 'center',
        padding: 16,
        animation: { type: 'slide-up', delay: 0.55, duration: 0.6 },
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
      type: 'text',
      text: 'مافوق',
      position: 'bottom-center',
      opacity: 0.9,
      size: 26,
    },
    slides,
  };
}
