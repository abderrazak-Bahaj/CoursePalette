import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noIndex?: boolean;
}

const BASE_TITLE = 'Skillorai';
const BASE_URL = 'https://skillorai.com';
const DEFAULT_DESCRIPTION =
  "Master new skills with Skillorai's AI-powered learning platform. Access expert-led courses, interactive assignments, and personalized learning paths.";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * SEO hook that dynamically updates document head meta tags.
 * Use at the top of each page component to set page-specific metadata.
 */
export function useSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonical,
  noIndex = false,
}: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard meta
    setMeta('name', 'description', description);
    if (keywords) setMeta('name', 'keywords', keywords);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:type', ogType);
    if (canonical) setMeta('property', 'og:url', canonical);

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    // Canonical link
    if (canonical) {
      let link = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
  }, [title, description, keywords, ogImage, ogType, canonical, noIndex]);
}
