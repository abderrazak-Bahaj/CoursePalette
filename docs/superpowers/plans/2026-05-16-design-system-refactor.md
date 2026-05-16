# CoursePalette Design System & Frontend Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build a unified CoursePalette design system (tokens + 10 primitives) and refactor the top 20 most-used components to use it, replacing the generic shadcn defaults with the violet/coral/amber premium dark aesthetic.

**Architecture:** Design tokens live in src/components/ds/tokens/. Primitive components in src/components/ds/primitives/ wrap shadcn ui/ components via cva + cn, applying CoursePalette tokens. Feature components in src/components/features/ and shared components in src/components/shared/ import only from ds/. The existing ui/ folder is frozen.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3, shadcn/ui (Radix), cva (class-variance-authority), clsx/tailwind-merge (cn), self-hosted Inter + Playfair Display + JetBrains Mono

---

## File Map

### Created
- `src/components/ds/tokens/colors.ts` — CSS variable names as TS constants
- `src/components/ds/tokens/spacing.ts` — 4px grid spacing scale
- `src/components/ds/tokens/typography.ts` — type scale + font families
- `src/components/ds/tokens/shadows.ts` — shadow + glow values
- `src/components/ds/tokens/radius.ts` — border radius scale
- `src/components/ds/tokens/animation.ts` — duration + easing constants
- `src/components/ds/tokens/index.ts` — barrel export
- `src/components/ds/primitives/Button.tsx` — wraps shadcn Button with cva variants
- `src/components/ds/primitives/Card.tsx` — wraps shadcn Card with cva variants
- `src/components/ds/primitives/Badge.tsx` — wraps shadcn Badge with cva variants
- `src/components/ds/primitives/Input.tsx` — wraps shadcn Input with label/hint/error
- `src/components/ds/primitives/Progress.tsx` — wraps shadcn Progress with variants
- `src/components/ds/primitives/Alert.tsx` — wraps shadcn Alert with variants
- `src/components/ds/primitives/Avatar.tsx` — wraps shadcn Avatar with role rings
- `src/components/ds/primitives/Skeleton.tsx` — shimmer skeleton with shimmer animation
- `src/components/ds/primitives/Tooltip.tsx` — wraps shadcn Tooltip
- `src/components/ds/primitives/Separator.tsx` — wraps shadcn Separator
- `src/components/ds/primitives/index.ts` — barrel export
- `src/components/ds/index.ts` — re-exports tokens + primitives
- `src/components/shared/Navbar.tsx` — refactored from layout/
- `src/components/shared/Sidebar.tsx` — refactored from layout/
- `src/components/shared/UserMenu.tsx` — extracted from Navbar
- `src/components/shared/PageHeader.tsx` — new shared page header
- `src/components/shared/index.ts`
- `src/components/features/course/CourseCard.tsx`
- `src/components/features/course/CourseHeader.tsx`
- `src/components/features/course/CourseCurriculum.tsx`
- `src/components/features/course/CourseInstructor.tsx`
- `src/components/features/course/CourseList.tsx`
- `src/components/features/dashboard/StatCard.tsx`
- `src/components/features/dashboard/CourseProgressCard.tsx`
- `src/components/features/dashboard/CertificateCard.tsx`
- `src/components/features/dashboard/DashboardGrid.tsx`
- `src/components/features/home/HeroSection.tsx`
- `src/components/features/home/FeaturedCourses.tsx`
- `src/components/features/home/CategorySection.tsx`
- `src/components/features/learning/LessonItem.tsx`
- `src/components/features/learning/AssignmentItem.tsx`
- `src/components/features/admin/AdminPanel.tsx`
- `src/components/features/admin/UsersTable.tsx`
- `public/fonts/inter/` — 4 woff2 files
- `public/fonts/playfair/` — 2 woff2 files
- `public/fonts/jetbrains-mono/` — 2 woff2 files

### Modified
- `src/index.css` — replace CSS variables with CoursePalette dark tokens + font-face declarations
- `tailwind.config.ts` — extend with semantic colors, fonts, shadows, animations
- `src/components/dashboard/DashboardStats.tsx` — update imports
- `src/components/ai/StudentQA/AskAiComponent.tsx` — update imports
- `src/pages/auth/LoginPage.tsx` — update imports
- `src/pages/user/ProfilePage.tsx` — update imports
- `src/components/admin/UsersTable.tsx` — update imports (source for features/admin/)
- All page files that import from layout/ Navbar/Sidebar — update to shared/

---

## Task 1: Design Tokens

Create all token files in src/components/ds/tokens/.

- [ ] Create colors.ts with bg, violet, coral, amber, neutral, error palettes
- [ ] Create spacing.ts with 4px base grid (0-24 scale)
- [ ] Create typography.ts with fontFamily and typeScale
- [ ] Create shadows.ts with sm/md/lg/xl + glow-violet/coral/amber
- [ ] Create radius.ts (none/sm/md/lg/xl/full) and animation.ts (duration + easing)
- [ ] Create tokens/index.ts barrel export
- [ ] git commit -m 'feat(ds): add design tokens'

---

## Task 2: CSS Variables and Tailwind Config

- [ ] npm install @fontsource/inter @fontsource/playfair-display @fontsource/jetbrains-mono
- [ ] Import font CSS in src/main.tsx (400/500/600/700 for Inter, 600/700 for Playfair, 400/500 for JetBrains Mono)
- [ ] Replace src/index.css with dark-only :root block (CoursePalette tokens + shadcn variable remapping)
- [ ] Extend tailwind.config.ts with violet/coral/amber colors, fontFamily, boxShadow glows, keyframes, animations
- [ ] Run npm run dev and verify dark background loads
- [ ] git commit -m 'feat(ds): dark-only CSS tokens, Tailwind config, self-hosted fonts'

---

## Task 3: Button Primitive

File: src/components/ds/primitives/Button.tsx

- [ ] Install cva if not present: npm install class-variance-authority
- [ ] Create Button.tsx wrapping shadcn ui/button with cva variants:
  - variant: primary (violet-600), action (coral-500), success (amber-500), secondary (neutral outline), danger (red outline->fill), ghost (transparent colored text)
  - size: sm (h-8 px-3 text-sm), md (h-10 px-4 text-sm), lg (h-11 px-6 text-base), xl (h-12 px-8 text-lg)
  - loading prop: shows Loader2 spinner, disables pointer events
  - icon + iconPosition props
  - All variants: focus-visible:shadow-glow-violet focus-visible:outline-none
  - ghost variant: bg-transparent border-none, text color matches semantic color
- [ ] Create src/components/ds/primitives/index.ts and export Button
- [ ] git commit -m 'feat(ds): Button primitive with 6 variants + ghost'

---

## Task 4: Card Primitive

File: src/components/ds/primitives/Card.tsx

- [ ] Create Card.tsx wrapping shadcn ui/card with cva variants:
  - elevated: bg-surface-card border-neutral-700 shadow-md
  - flat: bg-transparent border-neutral-700
  - interactive: elevated + hover:border-violet-500 hover:shadow-glow-violet cursor-pointer transition-all duration-200
  - accent: elevated + border-l-4, accentColor prop maps to violet-600/coral-500/amber-500 left border
  - size: sm (p-3 rounded-md), md (p-4 rounded-lg), lg (p-6 rounded-xl)
  - All three accentColor values supported: violet, coral, amber
- [ ] Export Card from primitives/index.ts
- [ ] git commit -m 'feat(ds): Card primitive with elevated/flat/interactive/accent variants'

---

## Task 5: Badge, Progress, Alert Primitives

Files: src/components/ds/primitives/Badge.tsx, Progress.tsx, Alert.tsx

- [ ] Badge.tsx wrapping shadcn ui/badge:
  - variants: default (neutral-700 bg), primary (violet-600 bg), action (coral-500 bg), success (amber-500 bg), warning (amber outline), error (red-700 bg), outline (neutral outline)
  - size: sm (text-xs px-2 py-0.5), md (text-xs px-2.5 py-1)
  - dot prop: colored dot before text using variant color
- [ ] Progress.tsx wrapping shadcn ui/progress:
  - variant: default (violet fill), success (amber fill), action (coral fill)
  - size: sm (h-1), md (h-2), lg (h-3)
  - showValue prop: renders percentage text beside bar
  - animated prop (default true): animate-[width] transition on mount
  - aria-valuenow/min/max set correctly
- [ ] Alert.tsx wrapping shadcn ui/alert:
  - variant: info (violet border-l), success (amber border-l), warning (amber-300 border-l), error (red border-l)
  - dismissible prop + onDismiss callback
  - Default icons per variant (Info, CheckCircle, AlertTriangle, XCircle from lucide-react)
- [ ] Export all three from primitives/index.ts
- [ ] git commit -m 'feat(ds): Badge, Progress, Alert primitives'

---

## Task 6: Input, Avatar, Skeleton, Tooltip, Separator Primitives

Files: Input.tsx, Avatar.tsx, Skeleton.tsx, Tooltip.tsx, Separator.tsx

- [ ] Input.tsx wrapping shadcn ui/input:
  - variant: default, search, error, success
  - size: sm (h-8 text-sm), md (h-10 text-sm), lg (h-11 text-base)
  - label prop: renders <label> above input
  - hint prop: muted helper text below
  - error prop: overrides hint, sets error variant (red border + red hint text)
  - leadingIcon / trailingIcon props
  - loading prop: Loader2 spinner in trailing position
  - Focus: border-violet-500 shadow-glow-violet
- [ ] Avatar.tsx wrapping shadcn ui/avatar:
  - size: xs(24px) sm(32px) md(40px) lg(48px) xl(64px)
  - online prop: green dot indicator bottom-right
  - role prop: admin=violet ring, teacher=coral ring, student=amber ring
  - fallback renders initials
- [ ] Skeleton.tsx:
  - Uses animate-shimmer with bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800
  - width/height/rounded props
  - lines prop: renders N stacked lines with decreasing widths
  - aria-busy on container
- [ ] Tooltip.tsx wrapping shadcn ui/tooltip:
  - content, side (default top), delayDuration (default 300) props
  - Dark bg-surface-elevated styling
- [ ] Separator.tsx wrapping shadcn ui/separator:
  - orientation prop (default horizontal)
  - bg-neutral-700
- [ ] Export all from primitives/index.ts
- [ ] Create src/components/ds/index.ts re-exporting tokens + primitives
- [ ] git commit -m 'feat(ds): Input, Avatar, Skeleton, Tooltip, Separator primitives + ds/index.ts'

---

## Task 7: Shared Components (Navbar, Sidebar, UserMenu, PageHeader)

Files: src/components/shared/{Navbar,Sidebar,UserMenu,PageHeader}.tsx

- [ ] Create src/components/shared/Navbar.tsx:
  - Imports from ds/ (Button ghost, Avatar, Badge)
  - Logo on left, nav links as Button ghost, UserMenu on right
  - bg-surface-base border-b border-neutral-700
  - Mobile: hamburger menu using Sheet from ui/
- [ ] Create src/components/shared/UserMenu.tsx:
  - Avatar with role ring + dropdown (DropdownMenu from ui/)
  - Items: Profile, Settings, Logout as Button ghost
  - Separator between sections
- [ ] Create src/components/shared/Sidebar.tsx:
  - Vertical nav with Button ghost items
  - Active item: bg-violet-600/10 text-violet-400 border-l-2 border-violet-500
  - Collapsed state support
- [ ] Create src/components/shared/PageHeader.tsx:
  - title (Playfair Display font-serif), subtitle, optional action slot
  - border-b border-neutral-700 pb-6 mb-8
- [ ] Create src/components/shared/index.ts barrel
- [ ] Update all page files that import Navbar/Sidebar from layout/ to import from shared/
- [ ] git commit -m 'feat(shared): Navbar, Sidebar, UserMenu, PageHeader using ds/ primitives'

---

## Task 8: Feature Components — Course

Files: src/components/features/course/{CourseCard,CourseHeader,CourseCurriculum,CourseInstructor,CourseList}.tsx

- [ ] CourseCard.tsx (replaces components/course/CourseCard.tsx):
  - Uses Card(interactive), Badge(primary for category), Progress(success for completion), Button(action for enroll)
  - Thumbnail image with aspect-video, Playfair title, Inter body
  - Price display with amber color for paid courses
- [ ] CourseHeader.tsx: Badge for level/category, Button(action) for enroll CTA, Avatar for instructor
- [ ] CourseCurriculum.tsx: Card(flat) per section, Badge for lesson count, Progress(default) for section completion
- [ ] CourseInstructor.tsx: Avatar(lg) with teacher role ring, Card(elevated)
- [ ] CourseList.tsx: grid layout composing CourseCard, Skeleton fallback
- [ ] Update all pages importing from components/course/ to import from features/course/
- [ ] git commit -m 'feat(features): Course components refactored to use ds/ primitives'

---

## Task 9: Feature Components — Dashboard

Files: src/components/features/dashboard/{StatCard,CourseProgressCard,CertificateCard,DashboardGrid}.tsx

- [ ] StatCard.tsx (replaces DashboardStats):
  - Card(elevated), large number in Playfair, label in Inter muted
  - trend prop: up/down arrow with coral/amber color
- [ ] CourseProgressCard.tsx:
  - Card(elevated), course thumbnail, Progress(success), Badge(success for completed)
  - Amber color for completion percentage
- [ ] CertificateCard.tsx:
  - Card(accent, accentColor=amber) — amber left border signals achievement
  - Button(success) for download/claim
  - Badge(success) for certificate status
- [ ] DashboardGrid.tsx: responsive grid composing StatCard + CourseProgressCard
- [ ] Update DashboardStats.tsx and dashboard pages to import from features/dashboard/
- [ ] git commit -m 'feat(features): Dashboard components refactored to use ds/ primitives'

---

## Task 10: Feature Components — Home, Learning, Admin

Files: features/home/, features/learning/, features/admin/

- [ ] HeroSection.tsx: Button(action) for primary CTA, Button(secondary) for secondary, Playfair h1
- [ ] FeaturedCourses.tsx: CourseCard grid + Skeleton fallback
- [ ] CategorySection.tsx: Card(interactive) per category, Badge
- [ ] LessonItem.tsx: Card(flat), Badge for lesson type, Progress(default), Button(ghost) for expand
- [ ] AssignmentItem.tsx: Card(elevated), Badge for status, Button(primary) for start
- [ ] AdminPanel.tsx: Card(elevated) sections, Alert for system messages
- [ ] UsersTable.tsx: Avatar with role ring, Badge for role/status, Button(ghost) for actions
- [ ] Update all page imports to point to features/ paths
- [ ] git commit -m 'feat(features): Home, Learning, Admin components refactored to use ds/ primitives'

---

## Task 11: Auth and Profile Page Updates

Files: src/pages/auth/LoginPage.tsx, src/pages/user/ProfilePage.tsx

- [ ] LoginPage.tsx:
  - Replace shadcn Input with ds/Input (label, error props)
  - Replace shadcn Button with ds/Button(action) for submit
  - Replace shadcn Alert with ds/Alert(error) for auth errors
  - Card(elevated) wrapper for the form
- [ ] ProfilePage.tsx:
  - ds/Input for all form fields
  - ds/Button(primary) for save
  - ds/Avatar(xl) with role ring for profile picture
  - ds/Card(elevated) for each settings section
- [ ] git commit -m 'feat(pages): Auth and Profile pages use ds/ primitives'

---

## Task 12: AI Components Import Update

File: src/components/ai/StudentQA/AskAiComponent.tsx (and other AI components)

- [ ] Update AskAiComponent.tsx imports:
  - Replace ui/input with ds/Input
  - Replace ui/button with ds/Button(primary)
  - Replace ui/card with ds/Card(elevated)
  - Skeleton from ds/Skeleton
  - Add animate-pulse-glow class to streaming indicator
  - Code blocks in StreamingResponse use font-mono (JetBrains Mono)
- [ ] Update ConversationHistory.tsx: ds/Card(flat), ds/Button(ghost), ds/Skeleton
- [ ] Update AssignmentGenerator.tsx: ds/Input, ds/Button(primary), ds/Card
- [ ] Update QuestionEnhancer.tsx: ds/Card(accent, accentColor=violet), ds/Button
- [ ] Update PreGradeReview.tsx: ds/Card, ds/Badge(success), ds/Button
- [ ] Update AiUsageStatistics.tsx: ds/Card(elevated), ds/Badge
- [ ] git commit -m 'feat(ai): AI components updated to use ds/ primitives'

---

## Task 13: Final Verification

- [ ] Run npm run build — zero TypeScript errors
- [ ] Run npm run test — all existing tests pass
- [ ] Visual check: open app, verify dark background, violet primary, coral CTAs, amber achievements
- [ ] Check focus states: Tab through interactive elements, verify violet glow ring appears
- [ ] Check Playfair Display on h1/h2/h3 headings
- [ ] Check JetBrains Mono in AI Q&A code blocks
- [ ] Check Badge(success) amber color on certificate cards
- [ ] Check Card(interactive) violet glow on hover for course cards
- [ ] git commit -m 'feat(ds): design system complete — tokens, primitives, feature components refactored'

---

## Notes for Implementer

- **Never import from src/components/ui/ in feature or page components.** All imports go through ds/ or shared/.
- **ui/ is frozen.** Do not modify shadcn originals. Token changes happen in index.css CSS variables only.
- **All className composition uses cn() from lib/utils.ts.** No raw string concatenation.
- **cva is used for all variant logic.** No inline ternaries for variant classes.
- **ghost Button** has no background and no border — just colored text. Used for nav links, breadcrumbs, icon buttons.
- **Card accent** supports all three colors: violet (authority), coral (action/alert), amber (achievement/certificate).
- **Violet glow** (shadow-glow-violet) appears on focus-visible for ALL interactive elements — this is the premium signature.

