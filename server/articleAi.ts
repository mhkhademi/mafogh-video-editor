import { Project, Slide, SlideElement, AspectRatioType } from '../src/types';

interface ArticleExtractResult {
  title: string;
  description: string;
  content: string;
  headings: string[];
  paragraphs: string[];
}

interface SynthesizedPoint {
  title: string;
  badge: string;
  content: string;
  subcontent: string;
  icon: string;
}

/**
 * Fetch and extract article content from URL
 */
export async function fetchArticleFromUrl(url: string): Promise<ArticleExtractResult> {
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fa,en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`خطا در دریافت صفحه: کد وضعیت ${response.status}`);
  }

  const html = await response.text();

  // 1. Extract Title
  let title = '';
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (ogTitleMatch) {
    title = ogTitleMatch[1];
  } else {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) title = titleMatch[1];
  }
  title = cleanHtmlText(title).split(/[-|–]/)[0].trim();

  // 2. Extract Description
  let description = '';
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  if (ogDescMatch) {
    description = ogDescMatch[1];
  } else {
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (metaDescMatch) description = metaDescMatch[1];
  }
  description = cleanHtmlText(description);

  // 3. Remove script, style, nav, footer, header tags
  let cleanedHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');

  // 4. Extract headings (h2, h3)
  const headings: string[] = [];
  const headingMatches = cleanedHtml.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/gi);
  for (const match of headingMatches) {
    const hText = cleanHtmlText(match[1]);
    if (hText.length > 5 && hText.length < 90) {
      headings.push(hText);
    }
  }

  // 5. Extract article/main text paragraphs
  const paragraphs: string[] = [];
  const pMatches = cleanedHtml.matchAll(/<p[^>]*>(.*?)<\/p>/gi);
  for (const match of pMatches) {
    const pText = cleanHtmlText(match[1]);
    if (pText.length > 35 && pText.length < 300) {
      paragraphs.push(pText);
    }
  }

  const content = paragraphs.slice(0, 15).join('\n\n');

  return {
    title: title || 'مقاله وب‌سایت مافوق',
    description,
    content: content || description,
    headings: headings.slice(0, 6),
    paragraphs: paragraphs.slice(0, 10),
  };
}

function cleanHtmlText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Intelligent topic knowledge synthesizer:
 * Generates rich, diverse, non-repetitive educational content for any subject
 */
function synthesizePointsForTopic(
  title: string,
  paragraphs: string[],
  headings: string[]
): {
  hookSubtitle: string;
  points: SynthesizedPoint[];
} {
  const t = title.toLowerCase();

  // 1. If headings and paragraphs were extracted from an actual article
  if (headings.length >= 2 && paragraphs.length >= 2) {
    const points: SynthesizedPoint[] = [];
    const icons = ['Target', 'ShieldCheck', 'TrendingUp', 'Lightbulb', 'Award'];
    const badgeNames = ['اصل اول', 'اصل دوم', 'اصل سوم', 'اصل چهارم', 'اصل پنجم'];

    for (let i = 0; i < Math.min(headings.length, 3); i++) {
      const heading = headings[i];
      const p = paragraphs[i] || paragraphs[0];
      const cleanP = p.length > 140 ? `${p.slice(0, 135)}...` : p;

      points.push({
        title: heading,
        badge: badgeNames[i] || `نکته شماره ${i + 1}`,
        content: cleanP,
        subcontent: 'نکته کلیدی و راهبردی مقاله',
        icon: icons[i % icons.length],
      });
    }

    return {
      hookSubtitle: 'خلاصه راهبردی و بینش‌های عملی در وبلاگ مافوق',
      points,
    };
  }

  // 2. Personal Branding Topic
  if (t.includes('پرسونال') || t.includes('شخصی') || t.includes('personal')) {
    return {
      hookSubtitle: 'چرا در دنیای امروز تخصص بدون برند شخصی دیده نمی‌شود؟',
      points: [
        {
          title: 'برند شخصی، خودنمایی نیست؛ سرمایه‌گذاری روی اعتبار است',
          badge: 'اصل اول',
          content:
            'برند شخصی یعنی وقتی در اتاق نیستید، دیگران درباره شما و تخصصتان چه می‌گویند. این ادراک بر اساس صداقت، مهارت و ارزش واقعی شکل می‌گیرد.',
          subcontent: 'پایه‌ریزی اعتبار و اثرگذاری پایدار در ذهن مخاطب',
          icon: 'ShieldCheck',
        },
        {
          title: 'تمایز معنادار در برابر هیاهوی توخالی شبکه‌های اجتماعی',
          badge: 'اصل دوم',
          content:
            'بیش از ۸۵٪ فرصت‌های کاری و مالی بر اساس تصویری است که در ذهن بازار ایجاد کرده‌اید؛ خلق ارزش واقعی، شما را دست‌نیافتنی می‌کند.',
          subcontent: 'ساخت مزیت رقابتی فردی در بازار کار',
          icon: 'Target',
        },
        {
          title: 'استمرار در تولید ارزش و انتقال تخصص به مخاطبان هدف',
          badge: 'اصل سوم',
          content:
            'یک برند شخصی مقتدر نیازی به تعقیب مداوم مشتریان ندارد؛ کیفیت محتوا و شهرت تخصصی، بهترین فرصت‌ها را به‌سمت شما جذب می‌کند.',
          subcontent: 'تبدیل تخصص فردی به فرصت‌های کلان تجاری',
          icon: 'TrendingUp',
        },
      ],
    };
  }

  // 3. Logo & Visual Identity Topic
  if (
    t.includes('لوگو') ||
    t.includes('هویت') ||
    t.includes('بصری') ||
    t.includes('logo') ||
    t.includes('visual')
  ) {
    return {
      hookSubtitle: 'چگونه هویتی خلق کنیم که در شلوغی بازار ماندگار شود؟',
      points: [
        {
          title: 'قانون ۳ ثانیه: سادگی و قدرت به خاطرسپاری',
          badge: 'اصل اول',
          content:
            'هویت بصری موفق آن است که در کمتر از ۳ ثانیه در ذهن مخاطب ثبت شود؛ پیچیدگی بیش‌از‌حد، دشمن اصلی ماندگاری برند است.',
          subcontent: 'روانشناسی ادراک بصری در طراحی مدرن',
          icon: 'Target',
        },
        {
          title: 'یکپارچگی و همسانی در تمام نقاط تماس برند',
          badge: 'اصل دوم',
          content:
            'رنگ، تایپوگرافی و ساختار گرافیکی باید در وب‌سایت، شبکه‌های اجتماعی و بسته‌بندی یک حس کاملاً هماهنگ و بدون تناقض را منتقل کند.',
          subcontent: 'افزایش ۳۳ درصدی وفاداری با هویت یکپارچه',
          icon: 'ShieldCheck',
        },
        {
          title: 'انتقال حس و پیام به جای زیبایی صِرف',
          badge: 'اصل سوم',
          content:
            'یک لوگوی حرفه‌ای یک اثر هنری انتزاعی نیست، بلکه پرچم و شناسه استراتژیک کسب‌وکار شما در میدان نبرد رقابت است.',
          subcontent: 'استراتژی دیزاین هدفمند در آژانس مافوق',
          icon: 'Award',
        },
      ],
    };
  }

  // 4. Marketing / Sales / Advertising Topic
  if (
    t.includes('کمپین') ||
    t.includes('تبلیغ') ||
    t.includes('فروش') ||
    t.includes('مارکتینگ') ||
    t.includes('marketing')
  ) {
    return {
      hookSubtitle: 'تحلیل استراتژیک کمپین‌های موفق و روش‌های افزایش بازدهی',
      points: [
        {
          title: 'شناخت دقیق درد و نیاز ناگفته مخاطب هدف',
          badge: 'گام اول',
          content:
            'تبلیغاتی که تلاش می‌کنند به همه چیز و برای همه کس بفروشند، به هیچ‌کس نمی‌فروشند؛ وضوح در تعریف پرسونای هدف کلید موفقیت است.',
          subcontent: 'هدف‌گذاری دقیق و جلوگیری از هدررفت بودجه',
          icon: 'Target',
        },
        {
          title: 'ارائه ارزش پیشنهادی شفاف و غیرقابل مقایسه',
          badge: 'گام دوم',
          content:
            'ارزش پیشنهادی شما باید آن‌قدر روشن و قانع‌کننده باشد که مخاطب تفاوت را در لحظه اول احساس کند و بهای خدمات شما را منطقی بداند.',
          subcontent: 'خلق مزیت رقابتی پایدار در بازار',
          icon: 'ShieldCheck',
        },
        {
          title: 'تست مداوم پیام، ترنزیشن و مسیر تبدیل مشتری',
          badge: 'گام سوم',
          content:
            'بازاریابی مدرن یک علم تجربی است؛ بهینه‌سازی مداوم قیف فروش، بازدهی سرمایه‌گذاری تبلیغاتی را تا ۲ برابر افزایش می‌دهد.',
          subcontent: 'اندازه‌گیری و بهینه‌سازی علمی بازگشت سرمایه (ROI)',
          icon: 'TrendingUp',
        },
      ],
    };
  }

  // 5. General Strategy / Rebranding / Business Topic
  return {
    hookSubtitle: 'مهم‌ترین بینش‌ها و نکات راهبردی برای رشد کسب‌وکار',
    points: [
      {
        title: 'شناخت عمیق جایگاه فعلی در برابر رقبای اصلی بازار',
        badge: 'بینش اول',
        content:
          'پیش از هر اقدام اجرایی، باید دقیقاً بدانید مشتریان شما را با چه ویژگی منحصربه‌فردی می‌شناسند و چه فرصت‌های بکری در بازار وجود دارد.',
        subcontent: 'تحلیل دقیق ماتریس جایگاه‌سازی رقابتی',
        icon: 'Search',
      },
      {
        title: 'تمرکز بر مزیت نهایی و حذف فعالیت‌های بی‌اثر',
        badge: 'بینش دوم',
        content:
          'موفقیت پایدار حاصل انجام کارهای کمتر اما با تمرکز و کیفیت فوق‌العاده بالاست؛ پراکنده‌کاری انرژی برند را هدر می‌دهد.',
        subcontent: 'قانون ۸۰/۲۰ در بهره‌وری و رشد کسب‌وکار',
        icon: 'Zap',
      },
      {
        title: 'استمرار در ساخت اعتماد و وفاداری درازمدت مشتریان',
        badge: 'بینش سوم',
        content:
          'وفاداری مشتریان ارزشمندترین دارایی یک برند است که هزینه‌های بازاریابی را کاهش داده و فروش ارگانیک را تقویت می‌کند.',
        subcontent: 'ارتقای شاخص ارزش طول عمر مشتری (LTV)',
        icon: 'ShieldCheck',
      },
    ],
  };
}

/**
 * Generate video project from article using Gemini AI or Smart Fallback
 */
export async function generateArticleVideoProject(params: {
  url?: string;
  text?: string;
  title?: string;
  points?: string[];
  style?: 'tips' | 'problem-solution' | 'deep-dive';
  aspectRatio?: AspectRatioType;
  targetDuration?: number; // seconds
  apiKey?: string;
}): Promise<Project> {
  const aspectRatio = params.aspectRatio || '16:9';
  const isVertical = aspectRatio === '9:16';
  const width = isVertical ? 1080 : 1920;
  const height = isVertical ? 1920 : 1080;

  let articleData: ArticleExtractResult = {
    title: params.title || '',
    description: '',
    content: params.text || '',
    headings: params.points || [],
    paragraphs: params.text ? params.text.split('\n').filter((p) => p.trim().length > 20) : [],
  };

  // If URL is provided, fetch article
  if (params.url) {
    try {
      const fetched = await fetchArticleFromUrl(params.url);
      articleData = {
        title: params.title || fetched.title,
        description: fetched.description,
        content: params.text || fetched.content,
        headings: params.points && params.points.length > 0 ? params.points : fetched.headings,
        paragraphs: fetched.paragraphs,
      };
    } catch (err: any) {
      console.warn('[Article Fetch Warning]:', err.message);
      if (!articleData.title && !articleData.content) {
        throw new Error(`امکان خواندن لینک مقاله وجود ندارد: ${err.message}`);
      }
    }
  }

  const apiKey = params.apiKey || process.env.GEMINI_API_KEY;

  // Try Gemini AI if API key is provided
  if (apiKey) {
    try {
      return await callGeminiArticleToVideo({
        article: articleData,
        aspectRatio,
        width,
        height,
        targetDuration: params.targetDuration || 45,
        apiKey,
      });
    } catch (aiErr: any) {
      console.error('[Gemini AI Generation Failed, falling back to smart heuristic]:', aiErr.message);
    }
  }

  // Fallback: Smart Heuristic Generator (100% reliable, zero API cost)
  return buildSmartHeuristicProject({
    article: articleData,
    aspectRatio,
    width,
    height,
    style: params.style || 'tips',
  });
}

/**
 * Gemini AI Engine for generating full Project JSON with high visual design fidelity
 */
async function callGeminiArticleToVideo(opts: {
  article: ArticleExtractResult;
  aspectRatio: AspectRatioType;
  width: number;
  height: number;
  targetDuration: number;
  apiKey: string;
}): Promise<Project> {
  const isVertical = opts.aspectRatio === '9:16';

  const systemInstruction = `شما کارگردان هنری، طراح موشن‌گرافیک و تدوینگر ارشد آژانس برندینگ «مافوق» (mafogh.com) هستید.
وظیفه شما تبدیل متن مقاله وب‌سایت به یک ویدیوی پرزنتیشن انیمیشنی، جذاب و باهویت بصری لوکس و مدرن است.

قوانین اساسی چیدمان و تایپوگرافی مافوق (بسیار مهم):
۱. هرگز متن‌ها نباید روی هم بیفتند (No overlapping!). مختصات عمودی (Y) المان‌ها باید فاصله کافی داشته باشد:
   - بج / تگ بالای اسلاید: Y = 18% (فقط نام یا عنوان ساده مانند "اصل اول" یا "راهکار اساسی"، بدون تکرار عدد)
   - تیتر اصلی اسلاید: Y = 32% (با width = 80% و fontSize بین 48 تا 58)
   - کارت توضیحات کلیدی: Y = 64% (با width = 76% و fontSize بین 26 تا 30 و دارای آیکون اختصاصی و متن کاملاً یونیک)
۲. پس‌زمینه‌ها نباید سفید ساده یا سیاه خالی باشند؛ حتماً از گرادینت‌های ملایم سازمانی مافوق استفاده شود:
   - اسلایدهای روشن: type: "gradient", color1: "#FAF5F8", color2: "#FFFFFF", gradientAngle: 135
   - اسلاید پایانی CTA: type: "gradient", color1: "#6B0B45", color2: "#2F041E", gradientAngle: 145
۳. آیکون‌های برداری: برای هر نکته حتماً آیکون متناسب انتخاب شود:
   - استراتژی و هدف: "Target"
   - اعتماد و امنیت برند: "ShieldCheck"
   - رشد و فروش: "TrendingUp"
   - ایده و بینش: "Lightbulb"
   - هویت و پرستیژ: "Award" یا "Sparkles"
   - چالش و هشدار: "AlertTriangle"
۴. ساختار اسلایدها:
   - اسلاید ۱ (کاور): بج "⏱️ خلاصه ۳۰ ثانیه‌ای مقاله" + آیکون مرکزی + تیتر جذاب مقاله + تگ "وبلاگ مافوق"
   - اسلایدهای میانی (۳ اسلاید): هر اسلاید فقط یک نکته واقعی از مقاله را با بج شماره نکته + تیتر درشت + کارت شیک با آیکون و توضیح آموزنده پوشش می‌دهد (هر اسلاید متن کارت کاملاً متفاوت دارد)
   - اسلاید پایانی (CTA): پس‌زمینه بنفش مافوق + تیتر "مطالعه متن کامل مقاله در سایت مافوق" + کارت دکمه‌مانند سفید با متن "🔗 mafogh.com/blog • کلیک کنید و آنلاین بخوانید ←"
۵. خروجی باید فقط و فقط یک شیء JSON معتبر مطابق با ساختار Project بدون هیچ تگ markdown یا توضیح اضافه باشد:
{
  "id": "proj-article-ai-${Date.now()}",
  "title": "${opts.article.title.replace(/"/g, '')}",
  "width": ${opts.width},
  "height": ${opts.height},
  "aspectRatio": "${opts.aspectRatio}",
  "fps": 30,
  "watermark": { "enabled": true, "type": "text", "text": "مافوق", "position": "bottom-center", "opacity": 0.9, "size": 26 },
  "slides": [ ... ]
}`;

  const userPrompt = `مقاله برای تبدیل به ویدیو:
عنوان: ${opts.article.title}
توضیحات: ${opts.article.description}
سرفصل‌ها: ${opts.article.headings.join(' | ')}
متن اصلی مقاله:
${opts.article.content.slice(0, 3500)}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${opts.apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`خطای هوش مصنوعی Gemini: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('پاسخی از هوش مصنوعی دریافت نشد.');
  }

  const cleanedJson = textOutput.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  const project: Project = JSON.parse(cleanedJson);
  project.id = `proj-ai-${Date.now()}`;
  project.width = opts.width;
  project.height = opts.height;
  project.aspectRatio = opts.aspectRatio;
  return project;
}

/**
 * Smart Heuristic Fallback Generator (Builds full video project algorithmically)
 * Ultra-polished layout with proper vertical spacing, gradient backgrounds, and real cards!
 */
function buildSmartHeuristicProject(opts: {
  article: ArticleExtractResult;
  aspectRatio: AspectRatioType;
  width: number;
  height: number;
  style: 'tips' | 'problem-solution' | 'deep-dive';
}): Project {
  const isVertical = opts.aspectRatio === '9:16';
  const slides: Slide[] = [];

  const rawTitle = opts.article.title || 'خلاصه مقاله تخصصی';
  const cleanTitle = rawTitle.length > 55 ? `${rawTitle.slice(0, 52)}...` : rawTitle;

  // Synthesize rich, distinct points based on the topic
  const { hookSubtitle, points } = synthesizePointsForTopic(
    rawTitle,
    opts.article.paragraphs || [],
    opts.article.headings || []
  );

  // ==========================================
  // SLIDE 1: Cover / Hook (Gradient + Pill + Icon + Title)
  // ==========================================
  slides.push({
    id: `slide-${Date.now()}-1`,
    title: `کاور: ${cleanTitle}`,
    duration: 5.0,
    background: {
      type: 'gradient',
      color1: '#FAF5F8',
      color2: '#FFFFFF',
      gradientAngle: 135,
    },
    transitionOut: 'fade',
    transitionDuration: 0.6,
    elements: [
      // 1. Top Capsule Tag
      {
        id: 'el-c-badge',
        type: 'badge',
        content: 'خلاصه ۳۰ ثانیه‌ای مقاله وبلاگ',
        badgeNumber: '⏱️',
        x: 50,
        y: isVertical ? 22 : 20,
        color: '#6B0B45',
        backgroundColor: '#FFFFFF',
        borderColor: '#EABAD7',
        fontSize: isVertical ? 22 : 24,
        fontWeight: '700',
        textAlign: 'center',
        padding: 14,
        borderRadius: 99,
        animation: { type: 'slide-down', duration: 0.6, delay: 0.2 },
      },
      // 2. Center Decorative Icon
      {
        id: 'el-c-icon',
        type: 'icon',
        content: 'Sparkles',
        x: 50,
        y: isVertical ? 34 : 33,
        color: '#6B0B45',
        backgroundColor: '#FBF4F8',
        borderColor: '#EABAD7',
        fontSize: isVertical ? 50 : 64,
        padding: isVertical ? 16 : 20,
        borderRadius: 24,
        strokeWidth: 2,
        animation: { type: 'pop-in', duration: 0.7, delay: 0.4 },
      },
      // 3. Main Title
      {
        id: 'el-c-title',
        type: 'title',
        content: cleanTitle,
        x: 50,
        y: isVertical ? 50 : 52,
        width: isVertical ? 88 : 82,
        color: '#2F041E',
        fontSize: isVertical ? 48 : 58,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'slide-up', duration: 0.8, delay: 0.6 },
      },
      // 4. Subtitle / Brand attribution
      {
        id: 'el-c-sub',
        type: 'subtitle',
        content: hookSubtitle,
        x: 50,
        y: isVertical ? 68 : 68,
        color: '#64748B',
        fontSize: isVertical ? 22 : 26,
        fontWeight: '500',
        textAlign: 'center',
        animation: { type: 'slide-up', duration: 0.7, delay: 0.9 },
      },
    ],
  });

  // ==========================================
  // SLIDES 2..N: Points (Pill + Heading + Styled Card with Icon)
  // ==========================================
  points.forEach((pt, idx) => {
    const pointNum = idx + 1;

    slides.push({
      id: `slide-${Date.now()}-${pointNum + 1}`,
      title: `${pt.badge}: ${pt.title.slice(0, 30)}`,
      duration: 6.0,
      background: {
        type: 'gradient',
        color1: '#FDFBFC',
        color2: '#F8F3F6',
        gradientAngle: 135,
      },
      transitionOut: 'fade',
      transitionDuration: 0.6,
      elements: [
        // 1. Number / Section Tag (Clean, single label without duplication)
        {
          id: `el-p${pointNum}-badge`,
          type: 'badge',
          content: pt.badge,
          x: 50,
          y: isVertical ? 20 : 18,
          color: '#ffffff',
          backgroundColor: '#6B0B45',
          borderColor: '#5C093B',
          fontSize: isVertical ? 20 : 22,
          fontWeight: '800',
          textAlign: 'center',
          padding: 14,
          borderRadius: 99,
          animation: { type: 'slide-down', duration: 0.6, delay: 0.2 },
        },
        // 2. Point Core Statement
        {
          id: `el-p${pointNum}-title`,
          type: 'title',
          content: pt.title,
          x: 50,
          y: isVertical ? 34 : 32,
          width: isVertical ? 88 : 80,
          color: '#2F041E',
          fontSize: isVertical ? 42 : 52,
          fontWeight: '900',
          textAlign: 'center',
          animation: { type: 'slide-up', duration: 0.7, delay: 0.4 },
        },
        // 3. High-Fidelity Content Card with Icon & Real Content
        {
          id: `el-p${pointNum}-card`,
          type: 'card',
          content: pt.content,
          subcontent: pt.subcontent,
          icon: pt.icon,
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
          animation: { type: 'slide-up', duration: 0.8, delay: 0.8 },
        },
      ],
    });
  });

  // ==========================================
  // FINAL SLIDE: Call-To-Action (Rich Purple Gradient + White Action Card)
  // ==========================================
  slides.push({
    id: `slide-${Date.now()}-cta`,
    title: 'پایان: مطالعه متن کامل در وب‌سایت',
    duration: 5.0,
    background: {
      type: 'gradient',
      color1: '#6B0B45',
      color2: '#2F041E',
      gradientAngle: 145,
    },
    transitionOut: 'none',
    transitionDuration: 0.5,
    elements: [
      // 1. Top Question Pill
      {
        id: 'el-cta-hook',
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
        animation: { type: 'slide-down', duration: 0.6, delay: 0.2 },
      },
      // 2. Action Title
      {
        id: 'el-cta-title',
        type: 'title',
        content: 'مطالعه متن کامل مقاله در سایت مافوق',
        x: 50,
        y: isVertical ? 38 : 38,
        width: isVertical ? 88 : 80,
        color: '#FFFFFF',
        fontSize: isVertical ? 46 : 60,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'slide-up', duration: 0.8, delay: 0.5 },
      },
      // 3. Prominent White Action Button Card
      {
        id: 'el-cta-card',
        type: 'card',
        content: 'mafogh.com • کلیک کنید و آنلاین بخوانید ←',
        subcontent: 'دسترسی رایگان به تمام سرفصل‌ها و چک‌لیست‌های تخصصی',
        icon: 'BookOpen',
        x: 50,
        y: isVertical ? 64 : 64,
        width: isVertical ? 88 : 64,
        color: '#6B0B45',
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        fontSize: isVertical ? 26 : 30,
        fontWeight: '800',
        padding: 26,
        borderRadius: 24,
        animation: { type: 'pop-in', duration: 0.8, delay: 0.8 },
      },
      // 4. Branding Tagline
      {
        id: 'el-cta-footer',
        type: 'subtitle',
        content: 'آژانس برندینگ مافوق | مرجع خلق و بازسازی برند',
        x: 50,
        y: isVertical ? 82 : 82,
        color: '#EABAD7',
        fontSize: isVertical ? 20 : 24,
        fontWeight: '500',
        textAlign: 'center',
        animation: { type: 'fade-in', duration: 0.8, delay: 1.1 },
      },
    ],
  });

  return {
    id: `proj-article-${Date.now()}`,
    title: `خلاصه مقاله: ${cleanTitle}`,
    width: opts.width,
    height: opts.height,
    aspectRatio: opts.aspectRatio,
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
