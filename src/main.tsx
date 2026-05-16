import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { performanceMonitor } from '@/utils/ai/performanceMonitor';

// Start observing Core Web Vitals (FCP, LCP, CLS, TTFB) as early as possible
// so that paint and layout-shift entries are not missed.
// Metrics are logged to the console in development mode only.
// @see Requirement 22 – Performance Optimization
performanceMonitor.observeWebVitals();

createRoot(document.getElementById('root')!).render(<App />);
