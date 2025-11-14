// Scroll Section Types and Interfaces

export type ScrollVariant =
  | 'zoom'            // Section scales down on scroll (zoom out effect)
  | 'text-image-scroll' // Text on left, image on right with scroll-triggered fade
  | 'tabs-scroll'     // Layered cards that stack on top with tab navigation (simplified, no title)
  | 'title-scale-scroll' // Hero title with dark-to-light background transition, scales 1.8x → 1.0x, color white → black
  | 'bubble-list-scroll'; // Bubble list with cascading stagger animations and micro-hover effects

// Item for text-image-scroll variant
export type RichTextContent = 
  | string  // Simple paragraph text
  | {
      type: 'paragraph' | 'list' | 'numbered-list';
      content: string | string[];  // For paragraph: string, for lists: array of items
      style?: Record<string, unknown>;  // Additional inline styles
    };

// CTA button configuration
export interface ScrollItemCTA {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  borderRadius?: string | number;
  style?: Record<string, unknown>;  // Additional inline styles
}

// Item for text-image-scroll and tabs-scroll variants
export interface ScrollItem {
  id: string;
  title: string;
  description: RichTextContent;  // Support both string and rich text
  icon: string;
  cta?: ScrollItemCTA;  // Optional CTA button
}

// Landing zone configuration for tabs-scroll variant
export interface LandingZoneConfig {
  enabled?: boolean;           // Enable landing zone
  height?: number;             // Height in vh (default: 20)
  backgroundColor?: string;    // Background color (default: transparent)
  showTitle?: boolean;         // Show placeholder title text (default: false)
  titleText?: string;          // Placeholder title text
  titleColor?: string;         // Placeholder title color
  alignment?: 'center' | 'left' | 'right'; // Text alignment (default: center)
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  separatorAfter?: {
    enabled?: boolean;         // Enable separator after landing zone
    height?: number;           // Separator height in vh (default: 10)
  };
}

// Enhanced scroll configuration
export interface ScrollConfig {
  variant: ScrollVariant;
  // Shrink padding options
  paddingStart?: number;      // Starting padding (default: 0)
  paddingEnd?: number;         // Ending padding in rem (default: 4)
  borderRadiusStart?: number;  // Starting border radius (default: 0)
  borderRadiusEnd?: number;    // Ending border radius in px (default: 32)
  // Zoom options
  zoomStart?: number;         // Starting scale (default: 1)
  zoomEnd?: number;           // Ending scale (default: 0.8)
  borderRadius?: number;       // Border radius in px (default: 0)
  duration?: number;           // Scroll distance for zoom out effect in pixels (default: 300)
  reverseDuration?: number;   // Scroll distance for zoom in (reverse) effect in pixels (default: 1000)
  smoothness?: number;         // Smoothness of transition (default: 1)
    // Text-image-scroll options
  items?: ScrollItem[];       // Items for text-image-scroll variant
  foundationText?: string;    // Foundation text displayed at the end of text-image-scroll                                                                      
  foundationTextVariant?: 'random-chars' | 'fade-in' | 'slide-up' | 'typewriter'; // Animation variant for foundation text                                      
  // Tabs-scroll options
  tabClickScrollSpeed?: number; // Scroll speed when clicking tabs (default: 1, higher = slower, lower = faster)
  imagePosition?: 'left' | 'right'; // Position of image in tabs-scroll cards (default: 'left')
  // Landing zone (tabs-scroll only)
  landingZone?: LandingZoneConfig;

  /**
   * Title Animation Configuration (for title-scale-scroll variant ONLY)
   *
   * Creates an animated hero title with dark-to-light background transition:
   * - Title starts BIG (1.8x scale) at top of dark background section (0vh)
   * - Scales down to normal (1.0x) while translating down to 120vh (completes at 60% scroll)
   * - Color transitions from white → black (completes at 50% scroll)
   * - Background transitions: dark (0-120vh) blue section, light (120vh+) white section
   * - Title lands exactly at 120vh (start of white section) - blueSectionHeight
   * - Subtitle appears during transition (30-70% scroll)
   * - Scroll distance: 100vh total
   * - Supports children components in light section
   *
   * NOTE: tabs-scroll variant no longer uses title animation - use title-scale-scroll before tabs-scroll
   */
  title?: string;              // Main title text (title-scale-scroll only)
  subtitle?: string;           // Subtitle text (title-scale-scroll only)
  showTitle?: boolean;         // Whether to show animated title (title-scale-scroll only, deprecated for tabs-scroll)
  titleAnimation?: {           // Title animation configuration (title-scale-scroll only)
    enabled: boolean;
    variant?: 'scale-down' | 'simple-fade'; // scale-down: title starts BIG (1.8x) and scales to normal (1.0x)
    pinPosition?: string;      // Final title Y position (e.g., '120vh' at start of white section = blueSectionHeight)
    initialBackground?: string; // Dark background for title animation (0-120vh blue section)
    finalBackground?: string;   // Light background that appears after transition (120vh+ white section)
    cloudBackground?: string;   // Cloud background image
    overlayOpacity?: number;    // Overlay opacity
    textColor?: string;         // Text color
    darkTextColor?: string;     // Dark text color
    initialScale?: number;      // Initial scale
    pinnedY?: string;           // Pinned Y position
    exitY?: string;             // Exit Y position
    containerHeight?: number;   // Container height
  };
  // Performance options
  enableOnMobile?: boolean;
  reducedMotion?: boolean;
  useGPU?: boolean;
  // Bubble-list-scroll options
  infinitePhaseText?: string; // Text displayed during infinite balloon phase (bubble-list-scroll only)
}

// Base props for all scroll variant components
export interface BaseScrollProps {
  config: ScrollConfig;
  children: React.ReactNode;
  backgroundElement?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  isEditing?: boolean;
  debugMode?: boolean;
}

// Variant info for editor display
export interface ScrollVariantInfo {
  name: string;
  description: string;
  icon: string;
  settings: Partial<ScrollConfig>;
}
