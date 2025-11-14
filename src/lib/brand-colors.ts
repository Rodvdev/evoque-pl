// ============================================================================
// E-Voque Brand Color Palette
// ============================================================================
// Official brand colors used throughout the application
// See: docs/BRAND_COLOR_PALETTE.md for full documentation
// ============================================================================
export const BRAND_COLORS = {
  // Primary Colors
  GREEN: '#00B050',        // Primary brand accent, highlights, CTA buttons
  BLUE: '#0077A7',         // Secondary accent, navigation, and buttons
  DARK_NAVY: '#0A1F44',    // Headings and typography
  CHARCOAL: '#4A4A4A',     // Body text
  WHITE: '#FFFFFF',        // Page background and negative space
  
  // Secondary Colors
  SOFT_GRAY: '#F4F6F8',    // Backgrounds and section dividers
  SKY_BLUE: '#25B7D3',     // Decorative shapes, hover effects
  LIME: '#A4DE02'           // Subtle geometric accents
} as const;

// Default text colors based on context
// All colors meet WCAG AA contrast requirements on white/light backgrounds
export const TEXT_COLORS = {
  DEFAULT: BRAND_COLORS.DARK_NAVY,      // Default text color (black/navy) - 12.6:1 contrast ✅
  BODY: BRAND_COLORS.CHARCOAL,          // Body text - 7.1:1 contrast ✅
  HEADING: BRAND_COLORS.DARK_NAVY,      // Headings - 12.6:1 contrast ✅
  LIGHT: BRAND_COLORS.WHITE,            // Text on dark backgrounds
  MUTED: '#6B7280',                      // Muted/secondary text - 4.6:1 contrast ✅
  // Accessible variants for better contrast when needed
  MUTED_DARK: '#4B5563',                 // Darker muted text - 6.3:1 contrast ✅
} as const;

// Semantic colors for UI feedback
export const SEMANTIC_COLORS = {
  SUCCESS: BRAND_COLORS.GREEN,          // Success states
  ERROR: '#DC2626',                      // Error states
  WARNING: '#F59E0B',                    // Warning states
  INFO: BRAND_COLORS.BLUE                // Info states
} as const;

// Typography scale (base 16px, 1.25× ratio)
export const TYPOGRAPHY = {
  XS: '12px',      // 0.75rem
  SM: '14px',      // 0.875rem
  BASE: '16px',    // 1rem (base)
  LG: '18px',      // 1.125rem
  XL: '20px',      // 1.25rem
  '2XL': '24px',   // 1.5rem
  '3XL': '32px',   // 2rem
  '4XL': '40px',   // 2.5rem
  '5XL': '48px'    // 3rem
} as const;

// Spacing scale (4px base unit)
export const SPACING = {
  1: '4px',        // 0.25rem
  2: '8px',        // 0.5rem
  3: '12px',       // 0.75rem
  4: '16px',       // 1rem
  5: '20px',       // 1.25rem
  6: '24px',       // 1.5rem
  8: '32px',       // 2rem
  10: '40px',      // 2.5rem
  12: '48px',      // 3rem
  16: '64px'       // 4rem
} as const;

// Button style tokens
export const BUTTON_STYLES = {
  BORDER_RADIUS: {
    SM: '4px',     // Small radius
    MD: '6px',     // Medium radius (default)
    LG: '8px'      // Large radius
  },
  PADDING: {
    VERTICAL: {
      SM: '8px',
      MD: '12px',
      LG: '16px'
    },
    HORIZONTAL: {
      SM: '16px',
      MD: '24px',
      LG: '32px'
    }
  }
} as const;

// Transition timings
export const TRANSITIONS = {
  FAST: '150ms',
  NORMAL: '200ms',
  SLOW: '300ms'
} as const;

