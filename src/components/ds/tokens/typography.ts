export const fontFamily = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  serif: ['Playfair Display', 'Georgia', 'serif'],
  mono: ['JetBrains Mono', 'Menlo', 'monospace'],
} as const;

export const typeScale = {
  xs: { size: '12px', lineHeight: '16px', weight: 400 },
  sm: { size: '14px', lineHeight: '20px', weight: 400 },
  base: { size: '16px', lineHeight: '24px', weight: 400 },
  lg: { size: '18px', lineHeight: '28px', weight: 500 },
  xl: { size: '20px', lineHeight: '28px', weight: 500 },
  '2xl': { size: '24px', lineHeight: '32px', weight: 600 },
  '3xl': { size: '30px', lineHeight: '36px', weight: 600 },
  '4xl': { size: '36px', lineHeight: '40px', weight: 700 },
  '5xl': { size: '48px', lineHeight: '52px', weight: 700 },
} as const;
