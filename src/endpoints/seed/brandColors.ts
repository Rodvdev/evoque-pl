/**
 * E-Voque Brand Color Palette
 * Official brand colors used throughout the application
 * See: docs/BRAND_COLOR_PALETTE.md for full documentation
 *
 * Usage Guidelines:
 * - Primary CTA buttons: GREEN (#00B050) with white text
 * - Secondary buttons/hover: BLUE (#0077A7)
 * - Headings: DARK_NAVY (#0A1F44)
 * - Body text: CHARCOAL (#4A4A4A)
 * - Section backgrounds: Alternate between WHITE and SOFT_GRAY
 * - Accent elements: SKY_BLUE (#25B7D3) or LIME (#A4DE02)
 */
export const BRAND_COLORS = {
  // Primary Colors
  GREEN: '#00B050', // Primary brand accent, highlights, CTA buttons
  BLUE: '#0077A7', // Secondary accent, navigation, and buttons
  DARK_NAVY: '#0A1F44', // Headings and typography
  CHARCOAL: '#4A4A4A', // Body text
  WHITE: '#FFFFFF', // Page background and negative space

  // Secondary Colors
  SOFT_GRAY: '#F4F6F8', // Backgrounds and section dividers
  SKY_BLUE: '#25B7D3', // Decorative shapes, hover effects
  LIME: '#A4DE02', // Subtle geometric accents
} as const

/**
 * Helper function to create SEO template with all metadata
 */
export const createSEOTemplate = (data: {
  keywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  canonicalUrl?: string
  structuredData?: Record<string, unknown>
  robots?: string
  author?: string
  language?: string
}) => {
  const baseUrl = 'https://e-voque.com'
  
  return {
    keywords: data.keywords,
    openGraph: {
      title: data.ogTitle || null,
      description: data.ogDescription || null,
      image: data.ogImage || `${baseUrl}/og-image.jpg`,
      type: data.ogType || 'website',
      siteName: 'E-Voque',
      url: data.canonicalUrl || null,
    },
    twitter: {
      card: data.twitterCard || 'summary_large_image',
      title: data.ogTitle || null,
      description: data.ogDescription || null,
      image: data.ogImage || `${baseUrl}/og-image.jpg`,
    },
    structuredData: data.structuredData || {},
    canonicalUrl: data.canonicalUrl || null,
    robots: data.robots || 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    author: data.author || 'E-Voque',
    language: data.language || 'en-US',
  }
}

/**
 * Base URL for canonical URLs
 */
export const BASE_URL = 'https://e-voque.com'

/**
 * Structured Data - Organization (used across all pages)
 */
export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'E-Voque',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    'Professional call center and language interpretation services. Leading BPO provider specializing in customer service, sales, billing, collections, and multilingual support.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-XXX-XXX-XXXX',
    contactType: 'customer service',
    email: 'info@e-voque.com',
    availableLanguage: ['English', 'Spanish', 'French', 'Portuguese'],
  },
  sameAs: [
    'https://www.linkedin.com/company/e-voque',
    'https://www.facebook.com/e-voque',
    'https://twitter.com/e-voque',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  },
  areaServed: ['Americas', 'North America', 'South America'],
  serviceType: [
    'Call Center Services',
    'Language Interpretation',
    'Customer Service',
    'BPO Services',
  ],
}

