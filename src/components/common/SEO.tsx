import { Helmet } from 'react-helmet-async';

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
const BASE_URL = 'https://skillorai.bahaj.dev';
const DEFAULT_DESCRIPTION =
  "Master new skills with Skillorai's AI-powered learning platform. Access expert-led courses, interactive assignments, and personalized learning paths.";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * SEO component using react-helmet-async.
 * Place at the top of each page component to set page-specific metadata.
 */
const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonical,
  noIndex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta
        name="robots"
        content={noIndex ? 'noindex, nofollow' : 'index, follow'}
      />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}
    </Helmet>
  );
};

export default SEO;
