import { Project, Slide, SlideElement, AspectRatioType } from '../src/types';

interface ArticleExtractResult {
  title: string;
  description: string;
  content: string;
  headings: string[];
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
    if (hText.length > 5 && hText.length < 80) {
      headings.push(hText);
    }
  }

  // 5. Extract article/main text paragraphs
  const paragraphs: string[] = [];
  const pMatches = cleanedHtml.matchAll(/<p[^>]*>(.*?)<\/p>/gi);
  for (const match of pMatches) {
    const pText = cleanHtmlText(match[1]);
    if (pText.length > 25) {
      paragraphs.push(pText);
    }
  }

  const content = paragraphs.slice(0, 15).join('\n\n');

  return {
    title: title || 'مقاله وب‌سایت مافوق',
    description,
    content: content || description,
    headings: headings.slice(0, 6),
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
 * Generate video project from article using Gemini AI or Smart Fallback
 */
export async function generateArticleVideoProject(params: {
  url?: string;
  text?: string;
  title?: string;
  points?: string[];
  style?: 'tips' | 'problem-solution' | 'deep-dive';
  aspectRatio?: AspectRatioType;
  targetDuration?: number; // seconds (default ~40)
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
 * Gemini AI Engine for generating full Project JSON
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

  const systemInstruction = `شما کارگردان و تدوینگر ارشد آژانس برندینگ «مافوق» (mafogh.com) هستید.
وظیفه شما تبدیل متن مقاله زیر به یک ویدیوی پرزنتیشن انیمیشنی، حرفه‌ای و فوق‌العاده جذاب در حدود ۳۰ تا ۵۰ ثانیه است.

قوانین طراحی و تایپوگرافی مافوق:
۱. رنگ سازمانی پایه (Base Color): #6B0B45
۲. طیف سازمانی مافوق: #FBF4F8 (روشن)، #DE7AB6 (صورتی)، #D73697، #A81970، #6B0B45 (پایه)، #2F041E (تیره)
۳. اسلایدها:
   - اسلاید ۱: کاور و قلاب شوکه‌کننده با عنوان مقاله + بج «خلاصه مقاله در ۳۰ ثانیه» + آرم مافوق
   - اسلایدهای میانی (۲ تا ۴ اسلاید): هر اسلاید فقط روی ۱ نکته یا بینش کلیدی تمرکز دارد با بج «نکته ۱»، «نکته ۲» و تیتر درشت و کلمه کلیدی هایلایت‌شده
   - اسلاید پایانی: دعوت به اقدام (CTA) با عنوان «مطالعه متن کامل در سایت مافوق» و نشانی mafogh.com
۴. رزولوشن: ${opts.width}x${opts.height} (${opts.aspectRatio})
۵. خروجی باید صرفاً و منحصراً یک ساختار معتبر JSON از نوع Project مطابق با ساختار زیر باشد:
{
  "id": "proj-article-ai-...",
  "title": "${opts.article.title.replace(/"/g, '')}",
  "width": ${opts.width},
  "height": ${opts.height},
  "aspectRatio": "${opts.aspectRatio}",
  "fps": 30,
  "watermark": { "enabled": true, "type": "text", "text": "مافوق", "position": "bottom-center", "opacity": 0.9, "size": 26 },
  "slides": [
    {
      "id": "slide-1",
      "title": "عنوان اسلاید",
      "duration": 5.0,
      "background": { "type": "solid", "color1": "#ffffff" },
      "transitionOut": "fade",
      "transitionDuration": 0.6,
      "elements": [
        {
          "id": "el-1",
          "type": "title",
          "content": "متن جذاب فارسی",
          "x": 50,
          "y": 45,
          "color": "#6b0b45",
          "fontSize": ${isVertical ? 54 : 76},
          "fontWeight": "900",
          "textAlign": "center",
          "animation": { "type": "slide-up", "duration": 0.8, "delay": 0.2 }
        }
      ]
    }
  ]
}
فقط و فقط کدهای JSON برگردانده شود بدون تگ‌های اضافی یا متن توضیحی markdown.`;

  const userPrompt = `مقاله برای تبدیل به ویدیو:
عنوان: ${opts.article.title}
توضیحات: ${opts.article.description}
سرفصل‌ها و نکات: ${opts.article.headings.join(' | ')}
متن خلاصه:
${opts.article.content.slice(0, 3000)}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${opts.apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.4,
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
  const cleanTitle = rawTitle.length > 50 ? `${rawTitle.slice(0, 48)}...` : rawTitle;

  // Extract key points
  const points = (opts.article.headings && opts.article.headings.length > 0)
    ? opts.article.headings.slice(0, 3)
    : [
        'تحلیل دقیق هویت و ساختار برند',
        'ایجاد تمایز واقعی در نگاه مخاطب',
        'استمرار و همسانی پیام در تمام نقاط تماس',
      ];

  // SLIDE 1: Cover / Hook
  slides.push({
    id: `slide-${Date.now()}-1`,
    title: `کاور: ${cleanTitle}`,
    duration: 5.0,
    background: {
      type: 'solid',
      color1: '#ffffff',
    },
    transitionOut: 'fade',
    transitionDuration: 0.6,
    elements: [
      // Category / Brand Pill
      {
        id: 'el-c-badge',
        type: 'badge',
        content: 'خلاصه مقاله در ۳۰ ثانیه',
        badgeNumber: '✨',
        x: 50,
        y: isVertical ? 32 : 30,
        color: '#6B0B45',
        backgroundColor: '#FBF4F8',
        borderColor: '#EABAD7',
        fontSize: isVertical ? 22 : 24,
        fontWeight: '700',
        textAlign: 'center',
        padding: 14,
        borderRadius: 99,
        animation: { type: 'slide-down', duration: 0.7, delay: 0.2 },
      },
      // Main Title
      {
        id: 'el-c-title',
        type: 'title',
        content: cleanTitle,
        x: 50,
        y: isVertical ? 45 : 46,
        color: '#2F041E',
        fontSize: isVertical ? 50 : 68,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'slide-up', duration: 0.8, delay: 0.4 },
      },
      // Subtitle / Prompt
      {
        id: 'el-c-sub',
        type: 'subtitle',
        content: 'مهم‌ترین نکات و بینش‌های این مقاله که باید بدانید',
        x: 50,
        y: isVertical ? 60 : 60,
        color: '#64748B',
        fontSize: isVertical ? 24 : 30,
        fontWeight: '500',
        textAlign: 'center',
        animation: { type: 'slide-up', duration: 0.7, delay: 0.7 },
      },
    ],
  });

  // SLIDES 2..N: Points
  points.forEach((point, idx) => {
    const pointNum = idx + 1;
    const persianNums = ['۱', '۲', '۳', '۴', '۵'];
    const pNumStr = persianNums[idx] || String(pointNum);

    slides.push({
      id: `slide-${Date.now()}-${pointNum + 1}`,
      title: `نکته ${pNumStr}: ${point.slice(0, 30)}`,
      duration: 6.0,
      background: {
        type: 'solid',
        color1: '#ffffff',
      },
      transitionOut: 'fade',
      transitionDuration: 0.6,
      elements: [
        // Number badge
        {
          id: `el-p${pointNum}-badge`,
          type: 'badge',
          content: `نکته شماره ${pNumStr}`,
          badgeNumber: pNumStr,
          x: 50,
          y: isVertical ? 32 : 30,
          color: '#ffffff',
          backgroundColor: '#6B0B45',
          fontSize: isVertical ? 22 : 26,
          fontWeight: '800',
          textAlign: 'center',
          padding: 16,
          borderRadius: 99,
          animation: { type: 'slide-down', duration: 0.6, delay: 0.2 },
        },
        // Point Core Heading
        {
          id: `el-p${pointNum}-title`,
          type: 'title',
          content: point,
          x: 50,
          y: isVertical ? 46 : 46,
          color: '#2F041E',
          fontSize: isVertical ? 46 : 60,
          fontWeight: '900',
          textAlign: 'center',
          animation: { type: 'slide-up', duration: 0.8, delay: 0.5 },
        },
        // Context box / takeaway
        {
          id: `el-p${pointNum}-card`,
          type: 'card',
          content: 'این بخش به درک بهتر استراتژی و نتیجه‌گیری عملی در کسب‌وکار کمک می‌کند.',
          x: 50,
          y: isVertical ? 62 : 62,
          color: '#475569',
          backgroundColor: '#FBF4F8',
          borderColor: '#EABAD7',
          fontSize: isVertical ? 24 : 28,
          fontWeight: '500',
          textAlign: 'center',
          borderRadius: 16,
          animation: { type: 'slide-up', duration: 0.7, delay: 0.9 },
        },
      ],
    });
  });

  // FINAL SLIDE: Call-To-Action (CTA)
  slides.push({
    id: `slide-${Date.now()}-cta`,
    title: 'پایان: مطالعه متن کامل',
    duration: 5.0,
    background: {
      type: 'solid',
      color1: '#6B0B45', // Mafogh Brand Base Color
    },
    transitionOut: 'none',
    transitionDuration: 0.5,
    elements: [
      {
        id: 'el-cta-hook',
        type: 'subtitle',
        content: 'می‌خواهید عمیق‌تر این موضوع را یاد بگیرید؟',
        x: 50,
        y: isVertical ? 35 : 34,
        color: '#EABAD7',
        fontSize: isVertical ? 26 : 32,
        fontWeight: '500',
        textAlign: 'center',
        animation: { type: 'slide-down', duration: 0.6, delay: 0.2 },
      },
      {
        id: 'el-cta-title',
        type: 'title',
        content: 'مطالعه متن کامل مقاله در سایت مافوق',
        x: 50,
        y: isVertical ? 46 : 46,
        color: '#ffffff',
        fontSize: isVertical ? 48 : 66,
        fontWeight: '900',
        textAlign: 'center',
        animation: { type: 'slide-up', duration: 0.8, delay: 0.5 },
      },
      // Website URL Pill
      {
        id: 'el-cta-badge',
        type: 'badge',
        content: 'mafogh.com',
        badgeNumber: '🔗',
        x: 50,
        y: isVertical ? 60 : 60,
        color: '#6B0B45',
        backgroundColor: '#ffffff',
        fontSize: isVertical ? 28 : 34,
        fontWeight: '900',
        textAlign: 'center',
        padding: 20,
        borderRadius: 99,
        animation: { type: 'pop-in', duration: 0.7, delay: 0.9 },
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
