export interface BrandColorShade {
  shade: number;
  hex: string;
  isBase?: boolean;
  name?: string;
}

/**
 * طیف رسمی رنگ سازمانی آژانس برندینگ مافوق
 * رنگ پایه سازمانی (Base Color): #6B0B45 (Shade 500)
 */
export const MAFOGH_BRAND_SCALE: BrandColorShade[] = [
  { shade: 50, hex: '#FBF4F8', name: '۵۰ - خیلی روشن' },
  { shade: 100, hex: '#EABAD7', name: '۱۰۰' },
  { shade: 200, hex: '#DE7AB6', name: '۲۰۰' },
  { shade: 300, hex: '#D73697', name: '۳۰۰' },
  { shade: 400, hex: '#A81970', name: '۴۰۰' },
  { shade: 500, hex: '#6B0B45', isBase: true, name: '۵۰۰ - رنگ اصلی سازمانی (Base)' },
  { shade: 600, hex: '#5C093B', name: '۶۰۰' },
  { shade: 700, hex: '#4D0831', name: '۷۰۰' },
  { shade: 800, hex: '#3E0628', name: '۸۰۰' },
  { shade: 900, hex: '#2F041E', name: '۹۰۰ - تیره عمیق' },
];

export const MAFOGH_BASE_COLOR = '#6B0B45';

export interface ColorPresetCategory {
  id: string;
  label: string;
  colors: string[];
}

export const THEME_PALETTES: ColorPresetCategory[] = [
  {
    id: 'luxe',
    label: 'دارک لوکس و طلا',
    colors: ['#0B0F19', '#1E293B', '#334155', '#D97706', '#F59E0B', '#FBBF24', '#FDE68A', '#FFFFFF'],
  },
  {
    id: 'neon',
    label: 'نئون و سایبرپانک',
    colors: ['#06B6D4', '#3B82F6', '#8B5CF6', '#D946EF', '#EC4899', '#10B981', '#F43F5E', '#FACC15'],
  },
  {
    id: 'corporate',
    label: 'شرکتی و بیزینس',
    colors: ['#0F172A', '#1E3A8A', '#2563EB', '#0284C7', '#0D9488', '#10B981', '#64748B', '#F8FAFC'],
  },
  {
    id: 'monochrome',
    label: 'مونوکروم و خنثی',
    colors: ['#000000', '#1E293B', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#FFFFFF'],
  },
];
