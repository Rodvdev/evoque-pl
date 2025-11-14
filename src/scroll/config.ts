// Scroll Section Configuration and Variants
import { ScrollVariantInfo, ScrollVariant } from './types';

export const SCROLL_VARIANTS: Record<string, ScrollVariantInfo> = {
  'zoom': {
    name: 'Zoom Effect',
    description: 'Section starts at normal scale and zooms out on scroll',
    icon: '🔍',
    settings: {
      zoomStart: 1,        // Start at normal scale
      zoomEnd: 0.95,        // Zoom out to smaller scale (95% - less reduction)
      borderRadius: 0,      // Border radius in px (configurable)
      duration: 300,        // Scroll distance for zoom out (down scroll) in pixels
      reverseDuration: 1000, // Scroll distance for zoom in (up scroll) in pixels - smoother
      smoothness: 1,
      enableOnMobile: true,
      useGPU: true
    }
  },
  'text-image-scroll': {
    name: 'Text-Image Scroll',
    description: 'Text on left fades in/out as you scroll, with synced icon on right',
    icon: '📜',
    settings: {
      duration: 800,        // Scroll distance per item in pixels
      smoothness: 1,
      enableOnMobile: true,
      useGPU: true,
      items: [
        {
          id: 'value-1',
          title: 'Attitude',
          description: 'No matter how upset a customer might be, agents must keep a positive attitude.',
          icon: '/assets/images/attitude-icon.png'
        },
        {
          id: 'value-2',
          title: 'Adaptability',
          description: 'Of the most essential customer service skills, adaptability to changing situations is crucial.',
          icon: '/assets/images/adaptability-icon.png'
        },
        {
          id: 'value-3',
          title: 'Organization',
          description: 'During customer service exchanges, agents must be organized at all times to deliver timely service.',
          icon: '/assets/images/organization-icon.png'
        },
        {
          id: 'value-4',
          title: 'Cloud',
          description: 'Choose the technology that best meets your operational constraints while enjoying the same features.',
          icon: '/assets/images/cloud-icon.png'
        },
        {
          id: 'value-5',
          title: 'Process',
          description: 'We create SLAs geared around our partners\' objectives and quality that go beyond.',
          icon: '/assets/images/process-icon.png'
        }
      ]
    }
  },
  'tabs-scroll': {
    name: 'Tabs Scroll',
    description: 'Layered cards that stack from bottom to top with tab navigation',
    icon: '🗂️',
    settings: {
      duration: 800,
      smoothness: 1,
      enableOnMobile: true,
      useGPU: true,
      landingZone: {
        enabled: true,
        height: 20,
        backgroundColor: 'transparent',
        showTitle: false,
        alignment: 'center',
        padding: {
          top: 2,
          bottom: 2,
          left: 4,
          right: 4
        }
      },
      items: [
        {
          id: 'service-1',
          title: 'Language Interpretation',
          description: 'Scale up your language interpretation teams with our agile solutions.',
          icon: '/assets/images/interpreters-icon.png'
        },
        {
          id: 'service-2',
          title: 'Sales',
          description: 'Add tremendous growth to your company with trained sales agents.',
          icon: '/assets/images/sales-icon.png'
        },
        {
          id: 'service-3',
          title: 'Customer Services',
          description: 'Foster quality communication and support that keeps customers coming back.',
          icon: '/assets/images/customers-icon.png'
        },
        {
          id: 'service-4',
          title: 'Billing',
          description: 'Make accurate and faster billing processes with clients.',
          icon: '/assets/images/bill-icon.png'
        },
        {
          id: 'service-5',
          title: 'Collections',
          description: 'Experienced agents for effective collections and recoveries.',
          icon: '/assets/images/collections-icon.png'
        },
        {
          id: 'service-6',
          title: 'Help Desk',
          description: 'Handle help desk questions from basic to complex.',
          icon: '/assets/images/helpdesk-icon.png'
        }
      ]
    }
  },
  'title-scale-scroll': {
    name: 'Title Scale Scroll',
    description: 'Hero title descends, scales, and hands off to next section',
    icon: '🎯',
    settings: {
      duration: 800,
      smoothness: 1,
      enableOnMobile: true,
      useGPU: true,
      title: 'Our Services',
      subtitle: 'We do more than answering your calls',
      titleAnimation: {
        enabled: true,
        variant: 'scale-down',
        pinPosition: '120vh',
        initialBackground: 'linear-gradient(135deg, #0A1F44 0%, #1a3a6b 50%, #2c5aa0 100%)',
        finalBackground: 'linear-gradient(to bottom right, #eff6ff, #ffffff)',
        cloudBackground: '/hero-1.jpg',
        overlayOpacity: 0.04,
        textColor: '#FFFFFF',
        darkTextColor: '#0A1F44',
        initialScale: 1.8,
        pinnedY: '-42vw',
        exitY: '50vh',
        containerHeight: 150
      }
    }
  }
} as const;

export type ScrollVariantKey = ScrollVariant;

// Helper to generate scroll config based on variant
export function getScrollConfigForVariant(
  variant: ScrollVariantKey,
  customSettings?: Record<string, unknown>
): Record<string, unknown> {
  const baseConfig = SCROLL_VARIANTS[variant].settings;

  return {
    variant,
    ...baseConfig,
    ...customSettings
  };
}

// Validate scroll configuration
export function validateScrollConfig(config: Record<string, unknown>): boolean {
  if (!config || typeof config !== 'object') return false;

  // Check variant is valid
  if (!config.variant || !SCROLL_VARIANTS[config.variant as ScrollVariantKey]) {
    return false;
  }

  return true;
}

// Get recommended settings for device type
export function getDeviceOptimizedSettings(isMobile: boolean, isTablet: boolean) {
  if (isMobile) {
    return {
      enableOnMobile: true,
      paddingEnd: 2,  // Smaller padding on mobile
      borderRadiusEnd: 24,
      smoothness: 0.8
    };
  }

  if (isTablet) {
    return {
      enableOnMobile: true,
      paddingEnd: 3,
      borderRadiusEnd: 28,
      smoothness: 0.9
    };
  }

  // Desktop
  return {
    enableOnMobile: true,
    paddingEnd: 4,
    borderRadiusEnd: 32,
    smoothness: 1
  };
}
