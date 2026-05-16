import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './index.css';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { performanceMonitor } from '@/utils/ai/performanceMonitor';

// Start observing Core Web Vitals (FCP, LCP, CLS, TTFB) as early as possible
// so that paint and layout-shift entries are not missed.
// Metrics are logged to the console in development mode only.
// @see Requirement 22 – Performance Optimization
performanceMonitor.observeWebVitals();

createRoot(document.getElementById('root')!).render(<App />);
