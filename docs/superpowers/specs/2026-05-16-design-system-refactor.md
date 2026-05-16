# CoursePalette Design System & Frontend Refactor — Design Spec

**Date:** 2026-05-16  
**Status:** Approved  
**Scope:** Design system foundation + top 20 most-used components + component structure refactor

---

## 1. Vision & Aesthetic

**Personality:** MasterClass meets modern SaaS. Premium, intentional, trustworthy — not cold, not a toy. Serious learners and professional teachers trust this platform.

**Aesthetic pillars:**

- Dark-only background (no light mode)
- Sharp, editorial typography (Inter body + Playfair Display headings)
- Purposeful animations that communicate state changes — not decorative
- Violet glow on focused/active elements — the signature premium touch
- Generous spacing — breathing room signals quality
- Muted palette with strategic accent pops (coral for action, amber for achievement)

---

## 2. Design Tokens

### 2.1 Color Palette

All tokens are CSS custom properties on `:root`. No light mode variables needed.

```css
/* Backgrounds — layered depth */
--color-bg-base: #0f172a; /* Page background (slate-950) */
--color-bg-surface: #1e293b; /* Cards, panels (slate-800) */
--color-bg-elevated: #334155; /* Dropdowns, tooltips (slate-700) */
--color-bg-overlay: #475569; /* Hover states (slate-600) */

/* Violet — Authority & Primary */
--color-violet-50: #f5f3ff;
--color-violet-100: #ede9fe;
--color-violet-200: #ddd6fe;
--color-violet-300: #c4b5fd;
--color-violet-400: #a78bfa;
--color-violet-500: #8b5cf6; /* Primary interactive */
--color-violet-600: #7c3aed; /* Primary default */
--color-violet-700: #6d28d9; /* Primary hover */
--color-violet-800: #5b21b6; /* Primary active */
--color-violet-900: #4c1d95;

/* Coral — Action & Energy */
--color-coral-400: #fb7185;
--color-coral-500: #f43f5e; /* Action default */
--color-coral-600: #e11d48; /* Action hover */
--color-coral-700: #be123c; /* Action active */

/* Amber — Achievement & Progress */
--color-amber-300: #fcd34d;
--color-amber-400: #fbbf24;
--color-amber-500: #f59e0b; /* Achievement default */
--color-amber-600: #d97706; /* Achievement hover */
--color-amber-700: #b45309; /* Achievement active */

/* Neutrals — Text & Borders */
--color-neutral-50: #f8fafc;
--color-neutral-100: #f1f5f9;
--color-neutral-200: #e2e8f0;
--color-neutral-300: #cbd5e1;
--color-neutral-400: #94a3b8; /* Muted text */
--color-neutral-500: #64748b; /* Placeholder text */
--color-neutral-600: #475569; /* Borders */
--color-neutral-700: #334155; /* Subtle borders */
--color-neutral-800: #1e293b; /* Surface */
--color-neutral-900: #0f172a; /* Base */

/* Semantic aliases */
--color-text-primary: var(--color-neutral-50);
--color-text-secondary: var(--color-neutral-400);
--color-text-muted: var(--color-neutral-500);
--color-text-disabled: var(--color-neutral-600);

--color-border-default: var(--color-neutral-700);
--color-border-subtle: var(--color-neutral-800);
--color-border-strong: var(--color-neutral-600);

/* Error */
--color-error-500: #ef4444;
--color-error-700: #b91c1c;
```

### 2.2 Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.25);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.35);

/* Glow — premium dark-mode signature */
--shadow-glow-violet: 0 0 20px rgba(124, 58, 237, 0.3);
--shadow-glow-coral: 0 0 20px rgba(244, 63, 94, 0.25);
--shadow-glow-amber: 0 0 20px rgba(245, 158, 11, 0.25);
```

### 2.3 Spacing (4px base grid)

```ts
// src/components/ds/tokens/spacing.ts
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;
```

### 2.4 Typography

**Fonts:** Self-hosted. Files placed in `public/fonts/`.

| Font             | Weights            | Usage                                   |
| ---------------- | ------------------ | --------------------------------------- |
| Inter            | 400, 500, 600, 700 | Body, UI, labels, buttons               |
| Playfair Display | 600, 700           | Page headings, hero text, course titles |
| JetBrains Mono   | 400, 500           | Code blocks in AI Q&A, data values      |

**Type scale:**

```ts
// src/components/ds/tokens/typography.ts
export const typeScale = {
  xs: { size: '12px', lineHeight: '16px', weight: 400 },
  sm: { size: '14px', lineHeight: '20px', weight: 400 },
  base: { size: '16px', lineHeight: '24px', weight: 400 },
  lg: { size: '18px', lineHeight: '28px', weight: 500 },
  xl: { size: '20px', lineHeight: '28px', weight: 500 },
  '2xl': { size: '24px', lineHeight: '32px', weight: 600 }, // Playfair
  '3xl': { size: '30px', lineHeight: '36px', weight: 600 }, // Playfair
  '4xl': { size: '36px', lineHeight: '40px', weight: 700 }, // Playfair
  '5xl': { size: '48px', lineHeight: '52px', weight: 700 }, // Playfair
} as const;
```

### 2.5 Border Radius

```ts
export const radius = {
  none: '0px',
  sm: '4px',
  md: '8px', // default for inputs, badges
  lg: '12px', // default for cards
  xl: '16px', // large cards, modals
  full: '9999px', // pills, avatars
} as const;
```

### 2.6 Animation

All transitions use `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out). Durations:

```ts
export const duration = {
  fast: '100ms', // hover color changes
  normal: '200ms', // most transitions (default)
  slow: '300ms', // modals, drawers, page transitions
  slower: '500ms', // progress bars, skeleton shimmer
} as const;
```

**Keyframes to define in Tailwind config:**

- `fade-in`: opacity 0→1 over 200ms
- `slide-up`: translateY(8px)→0 + opacity 0→1 over 200ms
- `slide-down`: translateY(-8px)→0 + opacity 0→1 over 200ms
- `shimmer`: background-position sweep for skeleton loading
- `pulse-glow`: box-shadow violet glow pulse for AI streaming indicator

---

## 3. Component Structure

### 3.1 Directory Layout

```
src/components/
├── ds/                          # Design System — single source of truth
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   ├── shadows.ts
│   │   ├── radius.ts
│   │   └── animation.ts
│   ├── primitives/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Progress.tsx
│   │   ├── Alert.tsx
│   │   ├── Avatar.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Separator.tsx
│   │   ├── Tooltip.tsx
│   │   └── index.ts
│   └── index.ts                 # Re-exports tokens + primitives
│
├── shared/                      # Cross-role shared components
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── UserMenu.tsx
│   ├── PageHeader.tsx
│   └── index.ts
│
├── features/                    # Domain feature components
│   ├── course/
│   │   ├── CourseCard.tsx
│   │   ├── CourseHeader.tsx
│   │   ├── CourseCurriculum.tsx
│   │   ├── CourseInstructor.tsx
│   │   └── CourseList.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── CourseProgressCard.tsx
│   │   ├── CertificateCard.tsx
│   │   └── DashboardGrid.tsx
│   ├── ai/                      # Existing AI components (keep, update imports)
│   │   └── [existing structure preserved]
│   ├── admin/
│   │   └── [existing structure preserved]
│   └── learning/
│       └── [existing structure preserved]
│
├── layouts/
│   ├── MainLayout.tsx
│   ├── AdminLayout.tsx
│   ├── AuthLayout.tsx
│   └── DashboardLayout.tsx
│
└── ui/                          # shadcn/ui originals — DO NOT MODIFY
    └── [existing shadcn components]
```

**Rule:** `ds/primitives/` wraps `ui/` shadcn components with CoursePalette tokens applied via `className` and `cva`. Feature components import from `ds/`, never directly from `ui/`.

### 3.2 Tailwind Config Changes

The existing `tailwind.config.ts` is extended (not replaced) to add:

- Semantic color aliases pointing to CSS variables
- New font families (inter, playfair, mono)
- New shadow utilities (glow variants)
- New animation keyframes
- Extended spacing scale

The existing shadcn CSS variable names (`--primary`, `--background`, etc.) are **remapped** to point to the new CoursePalette tokens so all existing shadcn components automatically inherit the new palette.

### 3.3 CSS Variable Remapping Strategy

`src/index.css` is updated to:

1. Remove the `:root` light mode block entirely
2. Remove the `.dark` block (dark is now the only mode)
3. Define a single `:root` block with all CoursePalette tokens
4. Remap shadcn variables to CoursePalette tokens:

```css
:root {
  /* CoursePalette tokens */
  --color-bg-base: #0f172a;
  /* ... all tokens ... */

  /* shadcn variable remapping */
  --background: 220 47% 11%; /* maps to bg-base */
  --foreground: 210 40% 98%; /* maps to text-primary */
  --primary: 263 70% 50%; /* maps to violet-600 */
  /* ... etc ... */
}
```

---

## 4. Component APIs

### 4.1 Button

```tsx
type ButtonVariant =
  | 'primary'
  | 'action'
  | 'success'
  | 'secondary'
  | 'danger'
  | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant; // default: 'primary'
  size?: ButtonSize; // default: 'md'
  loading?: boolean; // shows spinner, disables interaction
  icon?: React.ReactNode; // leading icon
  iconPosition?: 'left' | 'right'; // default: 'left'
  asChild?: boolean; // Radix Slot passthrough
}
```

**Variant semantics:**

- `primary` — Violet. Navigation, save, submit. Authority actions.
- `action` — Coral. Enroll, buy, start. High-energy CTAs.
- `success` — Amber. Claim certificate, complete, achieve.
- `secondary` — Neutral outline. Cancel, back, secondary.
- `danger` — Red outline → red fill on hover. Delete, remove.
- `ghost` — Transparent, no border, colored text. Nav links, breadcrumbs, icon buttons.

**Focus state:** All variants show `box-shadow: var(--shadow-glow-violet)` on `:focus-visible`.

### 4.2 Card

```tsx
type CardVariant = 'elevated' | 'flat' | 'interactive' | 'accent';
type CardAccentColor = 'violet' | 'coral' | 'amber';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant; // default: 'elevated'
  size?: CardSize; // default: 'md'
  accentColor?: CardAccentColor; // only used when variant='accent'
  asChild?: boolean;
}
```

**Variant semantics:**

- `elevated` — `bg-surface` + `border-default` + `shadow-md`. Default for content cards.
- `flat` — `bg-transparent` + `border-default`. Lightweight data display.
- `interactive` — `elevated` + violet border + glow on hover/focus. Clickable cards.
- `accent` — `elevated` + 4px colored left border. All three accent colors supported: violet (authority), coral (action/alert), amber (achievement/certificate).

### 4.3 Badge

```tsx
type BadgeVariant =
  | 'default'
  | 'primary'
  | 'action'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant; // default: 'default'
  size?: BadgeSize; // default: 'md'
  dot?: boolean; // shows colored dot before text
}
```

**Variant semantics:**

- `default` — Neutral. Status labels, categories.
- `primary` — Violet bg. Role indicators, featured tags.
- `action` — Coral bg. "New", "Hot", urgency.
- `success` — Amber bg. "Completed", "Certified", achievements.
- `warning` — Amber outline. Warnings, pending states.
- `error` — Red bg. Errors, failed states.
- `outline` — Neutral outline. Subtle labels.

### 4.4 Input

```tsx
type InputVariant = 'default' | 'search' | 'error' | 'success';
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant; // default: 'default'
  size?: InputSize; // default: 'md'
  label?: string; // floating or top label
  hint?: string; // helper text below input
  error?: string; // error message (overrides hint, sets error variant)
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean; // shows spinner in trailing position
}
```

**States:**

- Default: `bg-surface` + `border-default`
- Focus: `border-violet-500` + `shadow-glow-violet`
- Error: `border-error-500` + red hint text
- Success: `border-amber-500` + amber hint text
- Disabled: `opacity-50`, `cursor-not-allowed`

### 4.5 Progress

```tsx
type ProgressVariant = 'default' | 'success' | 'action';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressProps {
  value: number; // 0–100
  variant?: ProgressVariant; // default: 'default' (violet)
  size?: ProgressSize; // default: 'md'
  label?: string; // accessible label
  showValue?: boolean; // shows percentage text
  animated?: boolean; // fill animation on mount (default: true)
}
```

**Variant semantics:**

- `default` — Violet fill. General progress, lesson completion.
- `success` — Amber fill. Course completion, achievement progress.
- `action` — Coral fill. Urgency indicators, deadlines.

### 4.6 Alert

```tsx
type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant; // default: 'info'
  title?: string;
  description: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode; // overrides default icon
}
```

### 4.7 Avatar

```tsx
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string; // initials, e.g. "JD"
  size?: AvatarSize; // default: 'md'
  online?: boolean; // green dot indicator
  role?: 'admin' | 'teacher' | 'student'; // colored ring
}
```

**Role rings:** Admin = violet, Teacher = coral, Student = amber.

### 4.8 Skeleton

```tsx
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: boolean; // full border-radius (for avatars)
  lines?: number; // renders N stacked skeleton lines
}
```

Uses `shimmer` keyframe animation.

### 4.9 Tooltip

```tsx
type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  content: string;
  side?: TooltipSide; // default: 'top'
  children: React.ReactNode;
  delayDuration?: number; // default: 300ms
}
```

### 4.10 Separator

```tsx
interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'; // default: 'horizontal'
  decorative?: boolean;
}
```

---

## 5. Top 20 Feature Components to Refactor

These existing components are updated to import from `ds/` instead of `ui/` directly:

| #   | Component          | Current Location         | New Location        | Key ds/ primitives used                             |
| --- | ------------------ | ------------------------ | ------------------- | --------------------------------------------------- |
| 1   | CourseCard         | components/course/       | features/course/    | Card(interactive), Badge, Progress, Button(action)  |
| 2   | CourseHeader       | components/course/       | features/course/    | Badge, Button, Avatar                               |
| 3   | CourseCurriculum   | components/course/       | features/course/    | Card(flat), Badge, Progress                         |
| 4   | StatCard           | components/dashboard/    | features/dashboard/ | Card(elevated), Badge                               |
| 5   | CourseProgressCard | components/dashboard/    | features/dashboard/ | Card, Progress(success), Badge(success)             |
| 6   | CertificateCard    | components/dashboard/    | features/dashboard/ | Card(accent/amber), Badge(success), Button(success) |
| 7   | Navbar             | components/layout/       | components/shared/  | Button(ghost), Avatar, Badge                        |
| 8   | Sidebar            | components/layout/       | components/shared/  | Button(ghost), Badge, Separator                     |
| 9   | UserMenu           | (inline in Navbar)       | components/shared/  | Avatar, Button(ghost), Separator                    |
| 10  | HeroSection        | components/home/         | features/home/      | Button(action), Button(secondary)                   |
| 11  | FeaturedCourses    | components/home/         | features/home/      | CourseCard, Skeleton                                |
| 12  | CategorySection    | components/home/         | features/home/      | Card(interactive), Badge                            |
| 13  | LessonItem         | components/learning/     | features/learning/  | Card(flat), Badge, Progress, Button(ghost)          |
| 14  | AssignmentItem     | components/learning/     | features/learning/  | Card, Badge, Button(primary)                        |
| 15  | AskAiComponent     | components/ai/StudentQA/ | features/ai/ (keep) | Input, Button(primary), Card, Skeleton              |
| 16  | AdminPanel         | components/admin/        | features/admin/     | Card, Badge, Button, Alert                          |
| 17  | UsersTable         | components/admin/        | features/admin/     | Badge, Button(ghost), Avatar                        |
| 18  | DashboardStats     | components/dashboard/    | features/dashboard/ | StatCard, Card                                      |
| 19  | LoginPage form     | pages/auth/              | pages/auth/         | Input, Button(action), Alert(error)                 |
| 20  | ProfilePage form   | pages/user/              | pages/user/         | Input, Button(primary), Avatar, Card                |

---

## 6. Font Loading

Self-hosted fonts placed in `public/fonts/`:

```
public/fonts/
├── inter/
│   ├── inter-400.woff2
│   ├── inter-500.woff2
│   ├── inter-600.woff2
│   └── inter-700.woff2
├── playfair/
│   ├── playfair-600.woff2
│   └── playfair-700.woff2
└── jetbrains-mono/
    ├── jetbrains-mono-400.woff2
    └── jetbrains-mono-500.woff2
```

`@font-face` declarations added to `src/index.css` with `font-display: swap`.

Tailwind `fontFamily` extended:

```ts
fontFamily: {
  sans:  ['Inter', 'system-ui', 'sans-serif'],
  serif: ['Playfair Display', 'Georgia', 'serif'],
  mono:  ['JetBrains Mono', 'Menlo', 'monospace'],
}
```

---

## 7. Tailwind Config Changes

The existing `tailwind.config.ts` is **extended** with:

```ts
theme: {
  extend: {
    colors: {
      // Semantic palette
      violet: { 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6' },
      coral:  { 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c' },
      amber:  { 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
      // Surface layers
      surface: { base: '#0f172a', card: '#1e293b', elevated: '#334155' },
    },
    fontFamily: {
      sans:  ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Playfair Display', 'Georgia', 'serif'],
      mono:  ['JetBrains Mono', 'Menlo', 'monospace'],
    },
    boxShadow: {
      'glow-violet': '0 0 20px rgba(124, 58, 237, 0.3)',
      'glow-coral':  '0 0 20px rgba(244, 63, 94, 0.25)',
      'glow-amber':  '0 0 20px rgba(245, 158, 11, 0.25)',
    },
    keyframes: {
      'fade-in':    { from: { opacity: '0' }, to: { opacity: '1' } },
      'slide-up':   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      'slide-down': { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      'shimmer':    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      'pulse-glow': { '0%, 100%': { boxShadow: '0 0 10px rgba(124,58,237,0.2)' }, '50%': { boxShadow: '0 0 25px rgba(124,58,237,0.5)' } },
    },
    animation: {
      'fade-in':    'fade-in 200ms ease-in-out',
      'slide-up':   'slide-up 200ms ease-in-out',
      'slide-down': 'slide-down 200ms ease-in-out',
      'shimmer':    'shimmer 1.5s ease-in-out infinite',
      'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
    },
  },
}
```

---

## 8. Migration Rules

1. **Never import from `src/components/ui/` in feature or page components.** All imports go through `ds/primitives/` or `ds/index.ts`.
2. **`ds/primitives/` wraps shadcn `ui/` components.** They apply CoursePalette tokens via `cva` and `cn`. They do not reimplement Radix primitives.
3. **`shared/` components are not primitives.** They compose `ds/` primitives and contain layout/navigation logic.
4. **Feature components live in `features/`.** They compose `ds/` primitives and `shared/` components.
5. **`ui/` is frozen.** No modifications to shadcn originals. Token changes happen in `index.css` CSS variables only.
6. **All `className` composition uses `cn()` from `lib/utils.ts`.** No raw string concatenation.
7. **`cva` (class-variance-authority) is used for all variant logic.** No inline ternaries for variant classes.

---

## 9. Accessibility

- All interactive elements have `:focus-visible` styles (violet glow ring)
- Color is never the sole differentiator — icons, text, or patterns accompany color
- WCAG AA contrast maintained: all text on dark backgrounds checked against `--color-bg-base`
- `aria-label` required on all icon-only buttons
- `role="status"` on progress bars, `aria-valuenow` / `aria-valuemin` / `aria-valuemax` set
- Skeleton components use `aria-busy="true"` on their container

---

## 10. Out of Scope

- Storybook
- Light mode
- Animation library (Framer Motion) — CSS transitions only
- New pages or routes
- Backend changes
- AI component logic changes (only visual/import updates)
