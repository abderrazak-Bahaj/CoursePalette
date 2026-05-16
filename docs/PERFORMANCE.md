# Performance Guide — CoursePalette

> **Requirement 22** — Performance Optimization: Lazy Loading and Memoization

This document describes the performance optimisations applied to the CoursePalette
frontend, how to measure Core Web Vitals, and how to run a Lighthouse audit.

---

## Table of Contents

1. [Core Web Vitals Monitoring](#1-core-web-vitals-monitoring)
2. [Optimisations Applied](#2-optimisations-applied)
3. [Running a Lighthouse Audit](#3-running-a-lighthouse-audit)
4. [Interpreting Results](#4-interpreting-results)
5. [Performance Budget](#5-performance-budget)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Core Web Vitals Monitoring

### How it works

`src/utils/ai/performanceMonitor.ts` exports a singleton `performanceMonitor`
that uses the browser's native `PerformanceObserver` API to collect:

| Metric | Entry type                 | Description                                      |
| ------ | -------------------------- | ------------------------------------------------ |
| FCP    | `paint`                    | First Contentful Paint — time until first pixel  |
| LCP    | `largest-contentful-paint` | Largest Contentful Paint — main content visible  |
| CLS    | `layout-shift`             | Cumulative Layout Shift — visual stability score |
| TTFB   | `navigation`               | Time to First Byte — server response latency     |

### Integration

`performanceMonitor.observeWebVitals()` is called **once** in `src/main.tsx`
before the React root is mounted, so paint and layout-shift entries are never
missed:

```ts
// src/main.tsx
import { performanceMonitor } from '@/utils/ai/performanceMonitor';

performanceMonitor.observeWebVitals();

createRoot(document.getElementById('root')!).render(<App />);
```

### Reading metrics in development

Open the browser DevTools console. In **development mode** (`npm run dev`) the
monitor logs each metric as it is recorded:

```
[PerformanceMonitor] FCP: 312ms
[PerformanceMonitor] LCP: 890ms
[PerformanceMonitor] CLS updated: 0.0012
[PerformanceMonitor] TTFB: 45ms
```

You can also call `performanceMonitor.logMetrics()` at any time from the
console to print a full summary:

```js
// In the browser DevTools console:
import('/src/utils/ai/performanceMonitor.js').then((m) =>
  m.performanceMonitor.logMetrics()
);
```

### Measuring AI operation latency

Wrap any AI API call with `measureOperation` to record its duration:

```ts
import { performanceMonitor } from '@/utils/ai/performanceMonitor';

const done = performanceMonitor.measureOperation('generateAssignment');
try {
  const result = await aiApiClient.generateAssignment(courseId, params);
  done(); // records success + duration
  return result;
} catch (err) {
  // operation not recorded on failure — handle error separately
  throw err;
}
```

---

## 2. Optimisations Applied

### 2.1 Code Splitting and Lazy Loading (Task 13.1)

All AI components and every page route are lazy-loaded via `React.lazy()` and
wrapped in `<Suspense>` boundaries.

- **Route-level splitting** — `src/routes/index.tsx` lazy-loads all 40+ pages.
  Each page gets its own chunk that is only downloaded when the user navigates
  to that route.
- **Component-level splitting** — `src/components/ai/lazy.ts` lazy-loads all
  11 AI components. Chunks are only downloaded when the user opens an AI panel.
- **Vendor chunks** — `vite.config.ts` groups heavy third-party libraries into
  named chunks (`vendor-react`, `vendor-charts`, `vendor-editor`, etc.) so
  browsers can cache them independently.

Expected impact: **~60 % reduction** in initial bundle size.

### 2.2 Memoization (Task 13.2)

`src/utils/ai/memoization.ts` provides helpers used throughout the AI layer:

- `createMemoizedSelector` — single-input memoisation for derived state.
- `shallowArrayEqual` / `shallowObjectEqual` — cheap equality checks for
  `useMemo` / `useCallback` dependency arrays.
- All AI hooks use `useCallback` for stable function references and `useMemo`
  for derived values.
- Integration components use `React.memo` to skip re-renders when props are
  unchanged.

### 2.3 Debouncing (Task 13.3)

`src/utils/ai/debounce.ts` provides:

- `debounce(fn, delay)` — generic debounce for event handlers.
- `useDebounce(value, delay)` — React hook used to debounce:
  - Markdown re-renders during SSE streaming (`delay = 50 ms`).
  - Search / filter inputs (`delay = 300 ms`).

### 2.4 Build Optimisation

`vite.config.ts` is configured for production:

- **Minification** — esbuild (built-in, zero extra dependency).
- **Console stripping** — `console.*` and `debugger` statements are dropped in
  production builds via esbuild's `drop` option.
- **Chunk size warning** — set to 1 000 kB to surface unexpectedly large chunks.

### 2.5 Skeleton Screens (CLS = 0)

`src/components/ai/Common/AiLoadingFallback.tsx` renders skeleton screens whose
dimensions match the final content. This prevents layout shift while lazy chunks
are loading, keeping CLS at or near **0**.

---

## 3. Running a Lighthouse Audit

### Option A — Chrome DevTools (recommended for local testing)

1. Build and preview the production bundle:

   ```bash
   npm run build
   npm run preview
   # App is served at http://localhost:4173
   ```

2. Open Chrome and navigate to `http://localhost:4173`.
3. Open DevTools (`F12`) → **Lighthouse** tab.
4. Select categories: **Performance**, **Accessibility**, **Best Practices**, **SEO**.
5. Set device to **Desktop** (or Mobile for mobile audit).
6. Click **Analyze page load**.

### Option B — Lighthouse CLI

```bash
# Install once (globally)
npm install -g lighthouse

# Run audit against the preview server
npm run build && npm run preview &
lighthouse http://localhost:4173 \
  --output html \
  --output-path ./lighthouse-report.html \
  --view
```

The `--view` flag opens the HTML report in your default browser automatically.

### Option C — PageSpeed Insights (production URL)

Navigate to <https://pagespeed.web.dev/> and enter your deployed URL.
This measures real-world performance from Google's servers.

### Option D — web-vitals Chrome Extension

Install the [Web Vitals extension](https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma)
for a live overlay of FCP, LCP, CLS, and INP while browsing the app.

---

## 4. Interpreting Results

### Lighthouse score thresholds

| Score  | Colour    | Meaning           |
| ------ | --------- | ----------------- |
| 90–100 | 🟢 Green  | Good              |
| 50–89  | 🟠 Orange | Needs improvement |
| 0–49   | 🔴 Red    | Poor              |

**Target: ≥ 80** (Requirement 22.7).

### Core Web Vitals thresholds (Google)

| Metric | Good     | Needs improvement | Poor    |
| ------ | -------- | ----------------- | ------- |
| FCP    | ≤ 1.8 s  | 1.8 – 3.0 s       | > 3.0 s |
| LCP    | ≤ 2.5 s  | 2.5 – 4.0 s       | > 4.0 s |
| CLS    | ≤ 0.1    | 0.1 – 0.25        | > 0.25  |
| TTFB   | ≤ 800 ms | 800 ms – 1.8 s    | > 1.8 s |

---

## 5. Performance Budget

| Asset category         | Budget (gzip) | Notes                            |
| ---------------------- | ------------- | -------------------------------- |
| Initial JS (main)      | ≤ 200 kB      | Core app + router, no AI chunks  |
| Per-page chunk         | ≤ 50 kB       | Lazy-loaded on navigation        |
| Per-AI-component chunk | ≤ 30 kB       | Lazy-loaded on user interaction  |
| Vendor: react          | ≤ 55 kB       | React + ReactDOM + React Router  |
| Vendor: charts         | ≤ 115 kB      | Recharts (admin statistics only) |
| CSS (total)            | ≤ 20 kB       | Tailwind purged output           |

---

## 6. Troubleshooting

### "FCP / LCP not logged in console"

- Make sure you are running in **development mode** (`npm run dev`).
  Metrics are only logged when `import.meta.env.DEV === true`.
- The browser must support `PerformanceObserver`. All modern browsers do.
- FCP is only fired once per page load. Reload the page to see it again.

### "CLS is non-zero"

- Check that all lazy-loaded components have a `<Suspense>` fallback whose
  dimensions match the final content.
- Avoid inserting content above existing content after load (e.g. banners,
  cookie notices).

### "Lighthouse score below 80"

Common causes and fixes:

| Symptom                   | Fix                                                    |
| ------------------------- | ------------------------------------------------------ |
| Large initial JS bundle   | Verify lazy loading is working (check Network tab)     |
| Render-blocking resources | Move `<script>` tags to end of `<body>` or use `defer` |
| Unoptimised images        | Use WebP format and set explicit `width`/`height`      |
| No caching headers        | Configure server to send `Cache-Control` headers       |
| High CLS                  | Add skeleton screens; set image dimensions explicitly  |

### "Build fails with terser error"

The project uses **esbuild** for minification (built into Vite). If you see a
terser error, ensure `vite.config.ts` has `minify: 'esbuild'` and not
`minify: 'terser'`.
