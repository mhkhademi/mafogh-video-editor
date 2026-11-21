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
    if (pText.length > 35 && pText.length < 400) {
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
 * Intelligent Sentence Extractor:
 * Extracts a complete, natural, grammatically sound sentence without truncation or trailing '...'
 */
function extractCleanSentence(raw: string, preferredMinLen = 40, maxLen = 160): string {
  if (!raw) return '';

  // Clean starting conjunctions that sound disjointed
  let text = cleanHtmlText(raw)
    .replace(/^و\s+این[،,؛]\s*/, '')
    .replace(/^و\s+اینکه\s*/, '')
    .replace(/^اما\s+/, '')
    .replace(/^زیرا\s+/, '')
    .replace(/^به\s+عنوان\s+مثال[،,]\s*/, '')
    .replace(/^در\s+نتیجه[،,]\s*/, '')
    .trim();

  // Split into sentences using Persian/Arabic and English sentence delimiters
  const sentences = text
    .split(/(?<=[.!?؟؛\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);

  if (sentences.length > 0) {
    for (const s of sentences) {
      if (s.length >= preferredMinLen && s.length <= maxLen) {
        let clean = s.replace(/[؛:،,]$/, '').trim();
        if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('؟')) {
          clean += '.';
        }
        return clean;
      }
    }

    // Take the most complete sentence
    let candidate = sentences[0];
    if (candidate.length > maxLen) {
      const lastSpace = candidate.lastIndexOf(' ', maxLen);
      if (lastSpace > 35) {
        candidate = candidate.slice(0, lastSpace);
      }
    }
    candidate = candidate.replace(/[؛:،,]$/, '').trim();
    if (!candidate.endsWith('.') && !candidate.endsWith('!') && !candidate.endsWith('؟')) {
      candidate += '.';
    }
    return candidate;
  }

  let fallback = text.slice(0, maxLen);
  const lastSpace = fallback.lastIndexOf(' ');
  if (lastSpace > 30) {
    fallback = fallback.slice(0, lastSpace);
  }
  fallback = fallback.replace(/[؛:،,]$/, '').trim();
  if (!fallback.endsWith('.') && !fallback.endsWith('!') && !fallback.endsWith('؟')) {
    fallback += '.';
  }
  return fallback;
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

  // Fallback: Smart Diverse Layout Generator (100% reliable, zero API cost)
  return buildDiverseCreativeProject({
    article: articleData,
    aspectRatio,
    width,
    height,
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
وظیفه شما تبدیل متن مقاله وب‌سایت به یک ویدیوی پرزنتیشن انیمیشنی، مدرن و با خلاقیت بصری بالا است.

قوانین حیاتی (بسیار مهم):
۱. هرگز اسلایدها نباید قالب یکنواخت و تکراری داشته باشند! باید اسلایدهای متنوع تولید کنید:
   - اسلاید ۱: کاور جذاب با آیکون مرکزی و قلاب کنجکاوی
   - اسلاید ۲: عدد و فکت آماری شاخص (یک عدد بزرگ مانند ۸۵٪ یا ۳ ثانیه با fontSize: 96 همراه با تیتر و تحلیل)
   - اسلاید ۳: مقایسه دو ستونه رویکرد اشتباه ❌ در برابر راهکار درست ✅
   - اسلاید ۴: کارت آموزنده راهبردی با آیکون و جمله کامل بدون برش
   - اسلاید ۵: کال‌تو‌اکشن نهایی مافوق (CTA) با کارت دکمه‌مانند سفید و لینک mafogh.com
۲. هیچ جمله‌ای نباید با "..." نصفه بماند! تمام جملات باید کامل، شیوا و آموزنده باشند.
۳. رنگ سازمانی پایه: #6B0B45 و گرادینت‌های سازمانی مافوق (#FAF5F8 به #FFFFFF برای اسلایدهای روشن، و #6B0B45 به #2F041E برای اسلاید پایانی).
۴. بج‌ها فقط یک عبارت کوتاه مانند "اصل اول" یا "واقعیت بازار" باشند بدون تکرار شماره.
۵. خروجی باید فقط یک JSON معتبر از نوع Project باشد:
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
 * Smart Diverse Creative Layout Generator
 * Generates 5 distinctly styled slides:
 * 1. Dramatic Cover with glowing emblem
 * 2. Big Stat / Market Reality Slide
 * 3. Two-Column Comparison Slide (Do's vs Don'ts)
 * 4. Actionable Strategy & Key Insight Card
 * 5. Luxury Brand Call-To-Action (CTA)
 */
function buildDiverseCreativeProject(opts: {
  article: ArticleExtractResult;
  aspectRatio: AspectRatioType;
  width: number;
  height: number;
}): Project {
  const isVertical = opts.aspectRatio === '9:16';
  const slides: Slide[] = [];

  const rawTitle = opts.article.title || 'خلاصه مقاله تخصصی';
  const cleanTitle = rawTitle.length > 55 ? `${rawTitle.slice(0, 52)}...` : rawTitle;

  // Extract clean complete sentences from the article
  const rawParagraphs = opts.article.paragraphs || [];
  const cleanSnippets = rawParagraphs.map((p) => extractCleanSentence(p)).filter((s) => s.length > 30);

  const t = cleanTitle.toLowerCase();
  const isPersonalBranding = t.includes('پرسونال') || t.includes('شخصی') || t.includes('personal');

  // =========================================================================
  // SLIDE 1: Cover / Hook (Gradient + Pill + Center Emblem + Question)
  // =========================================================================
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
      {
        id: 'el-c-badge',
        type: 'badge',
        content: 'خلاصه ۳۰ ثانیه‌ای مقاله وبلاگ',
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
        animation: { type: 'slide-down', duration: 0.6, delay: 0.2 },
      },
      {
        id: 'el-c-icon',
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
        animation: { type: 'pop-in', duration: 0.7, delay: 0.4 },
      },
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
      {
        id: 'el-c-sub',
        type: 'subtitle',
        content: isPersonalBranding
          ? 'چرا در دنیای امروز تخصص بدون برند شخصی دیده نمی‌شود؟'
          : 'بررسی راهبردی و بینش‌های عملی در وبلاگ مافوق',
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

  // =========================================================================
  // SLIDE 2: Big Stat / Market Reality (Huge Metric + Insight Card)
  // =========================================================================
  const statSnippet =
    cleanSnippets[0] ||
    (isPersonalBranding
      ? 'بیش از ۸۰٪ کارفرمایان و مشتریان، پیش از هر تصمیم‌گیری، ردپای حرفه‌ای و هویت آنلاین شما را ارزیابی می‌کنند.'
      : 'تصمیم‌گیری ناخودآگاه مخاطب در کمتر از چند ثانیه اولیه بر اساس هویت بصری برند شکل می‌گیرد.');

  slides.push({
    id: `slide-${Date.now()}-2`,
    title: 'واقعیت بازار: قدرت ادراک اولیه',
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
      {
        id: 'el-s2-badge',
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
        animation: { type: 'slide-down', duration: 0.6, delay: 0.2 },
      },
      // Huge Big Metric Number
      {
        id: 'el-s2-stat',
        type: 'title',
        content: isPersonalBranding ? '۸۵٪' : '۳ ثانیه',
        x: 50,
        y: isVertical ? 28 : 27,
        color: '#6B0B45',
        fontSize: isVertical ? 80 : 100,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'pop-in', duration: 0.8, delay: 0.4 },
      },
      // Metric Heading
      {
        id: 'el-s2-heading',
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
        animation: { type: 'slide-up', duration: 0.7, delay: 0.6 },
      },
      // Complete Insight Card
      {
        id: 'el-s2-card',
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
        animation: { type: 'slide-up', duration: 0.8, delay: 0.8 },
      },
    ],
  });

  // =========================================================================
  // SLIDE 3: Two-Column Comparison (Do's vs Don'ts / Right vs Wrong)
  // =========================================================================
  slides.push({
    id: `slide-${Date.now()}-3`,
    title: 'مقایسه رویکردها: اشتباه در برابر راهکار درست',
    duration: 6.5,
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
        id: 'el-s3-badge',
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
        animation: { type: 'slide-down', duration: 0.6, delay: 0.2 },
      },
      {
        id: 'el-s3-title',
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
        animation: { type: 'slide-up', duration: 0.7, delay: 0.4 },
      },
      // Comparison Card A: WRONG APPROACH (Red/Pink Accent)
      {
        id: 'el-s3-wrong',
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
        animation: { type: 'slide-up', duration: 0.7, delay: 0.6 },
      },
      // Comparison Card B: RIGHT APPROACH (Green/Teal Accent)
      {
        id: 'el-s3-right',
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
        animation: { type: 'slide-up', duration: 0.7, delay: 0.8 },
      },
    ],
  });

  // =========================================================================
  // SLIDE 4: Actionable Strategy & Key Insight Card
  // =========================================================================
  const strategySnippet =
    cleanSnippets[1] ||
    (isPersonalBranding
      ? 'یک برند شخصی مقتدر نیازی به تعقیب مداوم مشتریان ندارد؛ کیفیت تخصص و اعتبار محتوا، بهترین فرصت‌ها را به‌سمت شما جذب می‌کند.'
      : 'یکپارچگی در تمام نقاط تماس برند، ضریب اعتماد مخاطبان و ارزش طول عمر مشتریان را تا چند برابر ارتقا می‌دهد.');

  slides.push({
    id: `slide-${Date.now()}-4`,
    title: 'راهکار عملی: استمرار در خلق ارزش',
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
      {
        id: 'el-s4-badge',
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
        animation: { type: 'slide-down', duration: 0.6, delay: 0.2 },
      },
      {
        id: 'el-s4-title',
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
        animation: { type: 'slide-up', duration: 0.7, delay: 0.4 },
      },
      {
        id: 'el-s4-card',
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
        animation: { type: 'slide-up', duration: 0.8, delay: 0.8 },
      },
    ],
  });

  // =========================================================================
  // SLIDE 5: Luxury Call-To-Action (Rich Purple Gradient + White Action Card)
  // =========================================================================
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
      {
        id: 'el-cta-title',
        type: 'title',
        content: 'مطالعه متن کامل مقاله در وبلاگ مافوق',
        x: 50,
        y: isVertical ? 38 : 38,
        width: isVertical ? 88 : 80,
        color: '#FFFFFF',
        fontSize: isVertical ? 46 : 60,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'slide-up', duration: 0.8, delay: 0.5 },
      },
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
