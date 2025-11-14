import type { ScrollBlock as ScrollBlockType, Media as MediaType } from '@/payload-types'
import type { ScrollConfig, ScrollItem, LandingZoneConfig, BackgroundConfig } from '@/scroll/types'

/**
 * Convert Payload block background to scroll background format
 */
export function convertBackground(
  background: ScrollBlockType['background'],
): {
  type: 'COLOR' | 'GRADIENT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'NONE'
  value?: string
  size?: string
  position?: string
  repeat?: string
  opacity?: number
  carousel?: {
    images: Array<{ image: number | { id: number } }>
    speed: number
    autoplay: boolean
  }
} {
  if (!background || background.type === 'none') {
    return { type: 'NONE' }
  }

  const result: ReturnType<typeof convertBackground> = {
    type: background.type as 'COLOR' | 'GRADIENT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL',
    size: background.size || 'cover',
    position: background.position || 'center',
    opacity: background.opacity ?? 1,
  }

  switch (background.type) {
    case 'COLOR':
      result.value = background.color || '#000000'
      break
    case 'GRADIENT':
      result.value = background.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      break
    case 'IMAGE':
      if (background.image) {
        // Handle both number ID and object reference
        const imageId = typeof background.image === 'number' ? background.image : background.image.id
        result.value = `/api/media/file/${imageId}`
      }
      break
    case 'VIDEO':
      if (background.video) {
        const videoId = typeof background.video === 'number' ? background.video : background.video.id
        result.value = `/api/media/file/${videoId}`
      }
      break
    case 'CAROUSEL':
      if (background.carousel?.images) {
        result.carousel = {
          images: background.carousel.images.map((item) => {
            const imageId = typeof item.image === 'number' ? item.image : item.image.id
            return { image: imageId }
          }),
          speed: background.carousel.speed || 3000,
          autoplay: background.carousel.autoplay ?? true,
        }
      }
      break
  }

  return result
}

/**
 * Convert Payload scroll items to scroll config items
 */
export function convertScrollItems(items?: Array<{
  title?: string | null
  description?: string | null
  icon?: number | MediaType | null
  enableCTA?: boolean | null
  cta?: {
    text?: string | null
    href?: string | null
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | null
    size?: 'sm' | 'md' | 'lg' | null
  } | null
}> | null): ScrollItem[] {
  if (!items || items.length === 0) return []

  return items
    .filter((item): item is NonNullable<typeof item> => item != null)
    .map((item, index) => {
      let icon: string | { id: number; url?: string; alt?: string; [key: string]: any } = ''
      
      if (item.icon) {
        // If icon is a full Media object (has url property), pass it through
        if (typeof item.icon === 'object' && 'url' in item.icon && item.icon.url) {
          icon = item.icon as { id: number; url?: string; alt?: string; [key: string]: any }
        } else {
          // Otherwise, convert to URL string for backward compatibility
          const iconId = typeof item.icon === 'number' ? item.icon : (item.icon as MediaType).id
          icon = `/api/media/file/${iconId}`
        }
      }

      return {
        id: `item-${index}`,
        title: item.title || '',
        description: item.description || '',
        icon,
        cta: item.enableCTA && item.cta
          ? {
              text: item.cta.text || '',
              href: item.cta.href || '',
              variant: (item.cta.variant || 'primary') as 'primary' | 'secondary' | 'outline' | 'ghost',
              size: (item.cta.size || 'md') as 'sm' | 'md' | 'lg',
            }
          : undefined,
      } as ScrollItem
    })
}

/**
 * Convert Payload title animation background to BackgroundConfig format
 */
export function convertTitleAnimationBackground(
  background?: {
    type?: 'COLOR' | 'GRADIENT' | 'SVG' | 'IMAGE' | 'VIDEO' | null
    color?: string | null
    gradient?: string | null
    svg?: number | MediaType | null
    image?: number | MediaType | null
    video?: number | MediaType | null
    size?: string | null
    position?: string | null
    opacity?: number | null
  } | null
): BackgroundConfig | undefined {
  if (!background || !background.type) {
    return undefined
  }

  const result: BackgroundConfig = {
    type: background.type as 'COLOR' | 'GRADIENT' | 'SVG' | 'IMAGE' | 'VIDEO',
    size: background.size || 'cover',
    position: background.position || 'center',
    opacity: background.opacity ?? 1,
  }

  switch (background.type) {
    case 'COLOR':
      result.color = background.color || '#000000'
      break
    case 'GRADIENT':
      result.gradient = background.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      break
    case 'SVG':
      if (background.svg) {
        // Handle both number ID and object reference
        if (typeof background.svg === 'object' && 'url' in background.svg && background.svg.url) {
          result.svg = background.svg as { id: number; url?: string; alt?: string; [key: string]: any }
        } else {
          const svgId = typeof background.svg === 'number' ? background.svg : (background.svg as MediaType).id
          result.svg = svgId
        }
      }
      break
    case 'IMAGE':
      if (background.image) {
        // Handle both number ID and object reference
        if (typeof background.image === 'object' && 'url' in background.image && background.image.url) {
          result.image = background.image as { id: number; url?: string; alt?: string; [key: string]: any }
        } else {
          const imageId = typeof background.image === 'number' ? background.image : (background.image as MediaType).id
          result.image = imageId
        }
      }
      break
    case 'VIDEO':
      if (background.video) {
        // Handle both number ID and object reference
        if (typeof background.video === 'object' && 'url' in background.video && background.video.url) {
          result.video = background.video as { id: number; url?: string; alt?: string; [key: string]: any }
        } else {
          const videoId = typeof background.video === 'number' ? background.video : (background.video as MediaType).id
          result.video = videoId
        }
      }
      break
  }

  return result
}

/**
 * Convert Payload landing zone to scroll config format
 */
export function convertLandingZone(
  landingZone?: {
    enabled?: boolean | null
    height?: number | null
    backgroundColor?: string | null
    showTitle?: boolean | null
    titleText?: string | null
    titleColor?: string | null
    alignment?: 'left' | 'center' | 'right' | null
    padding?: {
      top?: number | null
      bottom?: number | null
      left?: number | null
      right?: number | null
    } | null
  } | null,
): LandingZoneConfig | undefined {
  if (!landingZone || !landingZone.enabled) return undefined

  return {
    enabled: true,
    height: landingZone.height || 20,
    backgroundColor: landingZone.backgroundColor || 'transparent',
    showTitle: landingZone.showTitle || false,
    titleText: landingZone.titleText || '',
    titleColor: landingZone.titleColor || '#0A1F44',
    alignment: landingZone.alignment || 'center',
    padding: landingZone.padding
      ? {
          top: landingZone.padding.top || 2,
          bottom: landingZone.padding.bottom || 2,
          left: landingZone.padding.left || 4,
          right: landingZone.padding.right || 4,
        }
      : undefined,
    separatorAfter: undefined, // Not in current config, can be added later if needed
  }
}

/**
 * Convert Payload ScrollBlock to ScrollConfig
 */
export function convertScrollBlockToConfig(
  block: Partial<ScrollBlockType> | {
    variant: 'zoom' | 'text-image-scroll' | 'tabs-scroll' | 'title-scale-scroll' | 'bubble-list-scroll'
    background?: any
    richText?: any
    links?: any[]
    zoomSettings?: any
    textImageSettings?: any
    tabsSettings?: any
    titleScaleSettings?: any
    bubbleListSettings?: any
    settings?: any
    blockName?: string | null
    blockType: 'scroll'
  },
): ScrollConfig {
  const variant = block.variant || 'zoom'
  const settings = block.settings || {}
  const baseConfig: Partial<ScrollConfig> = {
    variant: variant as ScrollConfig['variant'],
    enableOnMobile: settings.enableOnMobile ?? true,
    reducedMotion: settings.reducedMotion || false,
    useGPU: settings.useGPU !== false,
  }

  // Variant-specific configurations
  switch (variant) {
    case 'zoom': {
      const zoomSettings = block.zoomSettings || {}
      return {
        ...baseConfig,
        zoomStart: zoomSettings.zoomStart ?? 1,
        zoomEnd: zoomSettings.zoomEnd ?? 0.9,
        duration: zoomSettings.duration ?? 300,
        reverseDuration: zoomSettings.reverseDuration ?? 1000,
        borderRadius: zoomSettings.borderRadius ?? 0,
        smoothness: zoomSettings.smoothness ?? 1,
      } as ScrollConfig
    }

    case 'text-image-scroll': {
      const textImageSettings = block.textImageSettings || {}
      // Extract title from richText (first heading)
      let title: string | undefined = undefined
      if (block.richText?.root?.children) {
        const firstHeading = block.richText.root.children.find(
          (child: any) => child.type === 'heading'
        )
        if (firstHeading?.children?.[0]?.text) {
          title = firstHeading.children[0].text
        }
      }
      return {
        ...baseConfig,
        items: convertScrollItems(textImageSettings.items),
        foundationText: textImageSettings.foundationText || undefined,
        foundationTextVariant: (textImageSettings.foundationTextVariant || 'random-chars') as
          | 'random-chars'
          | 'fade-in'
          | 'slide-up'
          | 'typewriter',
        duration: textImageSettings.duration ?? 800,
        title: title,
      } as ScrollConfig
    }

    case 'tabs-scroll': {
      const tabsSettings = block.tabsSettings || {}
      return {
        ...baseConfig,
        items: convertScrollItems(tabsSettings.items),
        tabClickScrollSpeed: tabsSettings.tabClickScrollSpeed ?? 2,
        imagePosition: (tabsSettings.imagePosition || 'left') as 'left' | 'right',
        landingZone: convertLandingZone(tabsSettings.landingZone),
        duration: tabsSettings.duration ?? 800,
      } as ScrollConfig
    }

    case 'title-scale-scroll': {
      const titleScaleSettings = block.titleScaleSettings || {}
      const titleAnimation = titleScaleSettings.titleAnimation || {}
      
      // Convert backgrounds - handle both old string format and new structured format
      let initialBackground: BackgroundConfig | undefined
      let finalBackground: BackgroundConfig | undefined
      
      // Check if backgrounds are in new structured format
      if (titleAnimation.initialBackground && typeof titleAnimation.initialBackground === 'object') {
        initialBackground = convertTitleAnimationBackground(titleAnimation.initialBackground)
      } else if (typeof titleAnimation.initialBackground === 'string') {
        // Legacy format: assume it's a gradient string
        initialBackground = {
          type: 'GRADIENT',
          gradient: titleAnimation.initialBackground,
          opacity: 1,
        }
      } else {
        // Default gradient
        initialBackground = {
          type: 'GRADIENT',
          gradient: 'linear-gradient(135deg, #0A1F44 0%, #1a3a6b 50%, #2c5aa0 100%)',
          opacity: 1,
        }
      }
      
      if (titleAnimation.finalBackground && typeof titleAnimation.finalBackground === 'object') {
        finalBackground = convertTitleAnimationBackground(titleAnimation.finalBackground)
      } else if (typeof titleAnimation.finalBackground === 'string') {
        // Legacy format: assume it's a gradient string
        finalBackground = {
          type: 'GRADIENT',
          gradient: titleAnimation.finalBackground,
          opacity: 1,
        }
      } else {
        // Default gradient
        finalBackground = {
          type: 'GRADIENT',
          gradient: 'linear-gradient(to bottom right, #eff6ff, #ffffff)',
          opacity: 1,
        }
      }
      
      return {
        ...baseConfig,
        title: titleScaleSettings.title || 'Our Services',
        subtitle: titleScaleSettings.subtitle || 'We do more than answering your calls',
        showTitle: true,
        titleAnimation: titleAnimation.enabled
          ? {
              enabled: true,
              variant: (titleAnimation.variant || 'scale-down') as 'scale-down' | 'simple-fade',
              pinPosition: titleAnimation.pinPosition || '120vh',
              initialBackground,
              finalBackground,
              overlayOpacity: titleAnimation.overlayOpacity ?? 0.04,
              textColor: titleAnimation.textColor || '#FFFFFF',
              darkTextColor: titleAnimation.darkTextColor || '#0A1F44',
              initialScale: titleAnimation.initialScale ?? 1.8,
              pinnedY: titleAnimation.pinnedY || '42vw',
              exitY: titleAnimation.exitY || '50vh',
              containerHeight: titleAnimation.containerHeight ?? 150,
            }
          : undefined,
        landingZone: convertLandingZone(titleScaleSettings.landingZone),
      } as ScrollConfig
    }

    case 'bubble-list-scroll': {
      const bubbleListSettings = block.bubbleListSettings || {}
      return {
        ...baseConfig,
        items: convertScrollItems(bubbleListSettings.items),
        infinitePhaseText: bubbleListSettings.infinitePhaseText || undefined,
        duration: bubbleListSettings.duration ?? 800,
      } as ScrollConfig
    }

    default:
      return baseConfig as ScrollConfig
  }
}
