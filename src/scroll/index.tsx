'use client';

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { WebsiteSection, ContentValue, SectionType, ComponentType } from '@evoque/types';
import { ScrollRenderer } from './variants/registry';
import { ScrollConfig } from './types';
import { useBackgroundImageUrl } from '@/hooks/useBackgroundImageUrl';
import CarouselBackground from '@/components/render/section/components/CarouselBackground';
import SectionRenderer from '@/components/render/section/renderer';
import VideoSkeleton from '@/components/render/components/models/content/video/skeleton';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Re-export types for backward compatibility
export type { ScrollVariant, ScrollConfig } from './types';

interface ScrollSectionEnhancedProps {
  section: WebsiteSection;
  isEditing?: boolean;
  mode?: 'production' | 'preview';
  onComponentClick?: (sectionId: string, componentId: string) => void;
  onSectionClick?: (section: WebsiteSection) => void;
  scrollType?: 'normal' | 'feed' | 'scroll';
}

export default function ScrollSectionEnhanced({
  section,
  isEditing = false,
  mode = 'production',
  onComponentClick,
  onSectionClick,
  scrollType = 'normal'
}: ScrollSectionEnhancedProps) {

  // Parse scroll configuration from section settings
  // This reads borderRadius and other scroll settings from section.settings.scroll
  // The page renderer passes the full section object, so all settings are available here
  const scrollConfig: ScrollConfig = useMemo(() => {
    let config: Partial<ScrollConfig> = {};

    // Parse from string if needed (from database/seed)
    if (typeof section.settings?.scroll === 'string') {
      try {
        config = JSON.parse(section.settings.scroll);
      } catch {
        // Invalid JSON, use empty config
      }
    } else if (section.settings?.scroll && typeof section.settings.scroll === 'object') {
      // Already an object (from editor updates)
      config = section.settings.scroll as Partial<ScrollConfig>;
    }

    // Return config with defaults
    // borderRadius is read here and will be used in the wrapper style
    const isZoomVariant = config.variant === 'zoom';
    const isTextImageScroll = config.variant === 'text-image-scroll';
    const isTabsScroll = config.variant === 'tabs-scroll';
    return {
      variant: config.variant || 'zoom',
      paddingStart: config.paddingStart ?? 0,
      paddingEnd: config.paddingEnd ?? 4,
      borderRadiusStart: config.borderRadiusStart ?? 0,
      borderRadiusEnd: config.borderRadiusEnd ?? 32,
      zoomStart: config.zoomStart !== undefined ? config.zoomStart : 1,
      zoomEnd: config.zoomEnd !== undefined ? config.zoomEnd : 0.9, // Default to 0.9 (90%) for less reduction
      borderRadius: config.borderRadius !== undefined ? config.borderRadius : 0, // Read from settings
      duration: config.duration !== undefined ? config.duration : (isZoomVariant ? 300 : (isTextImageScroll || isTabsScroll) ? 800 : 300),
      reverseDuration: config.reverseDuration !== undefined ? config.reverseDuration : 1000,
      smoothness: config.smoothness ?? 1,
      items: config.items || [], // Items for text-image-scroll and tabs-scroll variants
      foundationText: config.foundationText || undefined,
      foundationTextVariant: config.foundationTextVariant || 'random-chars',
      tabClickScrollSpeed: config.tabClickScrollSpeed,
      imagePosition: config.imagePosition,
      landingZone: config.landingZone,
      // Title animation properties for tabs-scroll and title-scale-scroll variants
      showTitle: config.showTitle,
      title: config.title,
      subtitle: config.subtitle,
      titleAnimation: config.titleAnimation,
      enableOnMobile: config.enableOnMobile ?? true,
      reducedMotion: config.reducedMotion || false,
      useGPU: config.useGPU !== false
    };
  }, [section.settings]);

  // Convert section components for renderer
  const componentsForRenderer = useMemo(() => {
    return section.components
      ?.filter(component => component.isActive)
      .map(component => ({
        type: component.type as ComponentType,
        content: component.content as Record<string, ContentValue>,
        styles: component.styles || {},
        sectionId: section.id,
        id: component.id,
        name: component.name,
        order: component.order,
        isActive: component.isActive,
        createdAt: component.createdAt || new Date().toISOString(),
        updatedAt: component.updatedAt || new Date().toISOString()
      })) || [];
  }, [section.components, section.id]);

  // Handle section click
  const handleSectionClick = useCallback((e: React.MouseEvent) => {
    if (isEditing && onSectionClick) {
      e.stopPropagation();
      onSectionClick(section);
    }
  }, [isEditing, onSectionClick, section]);

  // Handle component click
  const handleComponentClick = useCallback((sectionId: string, componentId: string) => {
    onComponentClick?.(sectionId, componentId);
  }, [onComponentClick]);

  // Process background image/SVG URL for SCROLL sections
  const { processedUrl: processedBackgroundUrl } = useBackgroundImageUrl(
    (section?.background?.type === 'IMAGE' || section?.background?.type === 'SVG')
      ? (section.background?.value as string) || ''
      : ''
  );

  // Process background video URL for SCROLL sections
  const { processedUrl: processedBackgroundVideoUrl } = useBackgroundImageUrl(
    section?.background?.type === 'VIDEO'
      ? (section.background?.value as string) || ''
      : ''
  );

  // Video loading state for background videos
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // Reset loading state when video URL changes
  useEffect(() => {
    if (section?.background?.type === 'VIDEO') {
      setIsVideoLoading(true);
    }
  }, [section?.background?.type, processedBackgroundVideoUrl]);

  // Compute background styles for scroll sections
  const scrollBackgroundStyles = useMemo<React.CSSProperties>(() => {
    if (!section?.background) return {};

    const background = section.background;
    const styles: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      overflow: 'hidden',
      contain: 'layout style paint',
      willChange: 'transform'
    };

    switch (background.type) {
      case 'COLOR':
        styles.backgroundColor = background.value as string;
        break;
      case 'GRADIENT':
        styles.background = background.value as string;
        break;
      case 'IMAGE': {
        const imageUrl = processedBackgroundUrl || (background.value as string);
        styles.backgroundImage = `url(${imageUrl})`;
        styles.backgroundSize = background.size || 'cover';
        styles.backgroundPosition = background.position || 'center';
        styles.backgroundRepeat = background.repeat || 'no-repeat';
        styles.objectFit = 'cover';
        styles.maxWidth = '100%';
        styles.maxHeight = '100%';
        break;
      }
      case 'SVG': {
        const svgUrl = processedBackgroundUrl || (background.value as string);
        styles.backgroundImage = `url(${svgUrl})`;
        styles.backgroundSize = background.size || 'contain';
        styles.backgroundPosition = background.position || 'center';
        styles.backgroundRepeat = background.repeat || 'no-repeat';
        styles.maxWidth = '100%';
        styles.maxHeight = '100%';
        break;
      }
      case 'VIDEO':
      case 'CAROUSEL':
        // These are rendered as elements, not CSS backgrounds
        break;
      default:
        break;
    }

    if (background.opacity !== undefined) {
      styles.opacity = background.opacity as number;
    }

    return styles;
  }, [section?.background, processedBackgroundUrl]);

  // Get section styles
  const sectionStyle = useMemo(() => {
    const isZoomVariant = scrollConfig.variant === 'zoom';
    const isTextImageScroll = scrollConfig.variant === 'text-image-scroll';
    const isTabsScroll = scrollConfig.variant === 'tabs-scroll';
    
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      width: '100%',
      // For text-image-scroll and tabs-scroll, don't set height - let inner container control it
      ...(isZoomVariant ? { minHeight: '100vh', height: '100vh' } : {}),
      ...(!isZoomVariant && !isTextImageScroll && !isTabsScroll ? { minHeight: 'auto', height: 'auto' } : {}),
      backgroundColor: (section.styles?.appearance?.backgroundColor as string) || 'transparent',
      color: (section.styles?.typography?.color as string) || '#ffffff',
      // Text-image-scroll and tabs-scroll need visible overflow for scroll pinning to work
      overflow: (isTextImageScroll || isTabsScroll) ? 'visible' : 'hidden',
      ...(isTextImageScroll || isTabsScroll ? {} : { isolation: 'isolate' }),
      zIndex: 1, // Lower z-index to stay below mobile sidebar (9999)
      // For zoom variant, prepare for scaling
      ...(isZoomVariant && {
        transformOrigin: 'center center',
        willChange: 'transform'
      })
    };

    // Add scroll snap for feed mode (but not for zoom, text-image-scroll, or tabs-scroll)
    if (scrollType === 'feed' && !isZoomVariant && !isTextImageScroll && !isTabsScroll) {
      baseStyle.scrollSnapAlign = 'start';
      baseStyle.scrollSnapStop = 'always';
    }

    return baseStyle;
  }, [section.styles, scrollType, scrollConfig.variant]);


  // Render background element that will be passed to scroll system
  // Supports all background types: IMAGE, SVG, COLOR, GRADIENT, VIDEO, CAROUSEL
  // Border radius is inherited from parent containers (wrapper -> section -> ScrollRenderer -> background container -> scroll-background)
  const backgroundElement = useMemo(() => {
    if (!section?.background) return null;

    // IMAGE, SVG, COLOR, GRADIENT - render as div with CSS styles
    if (section.background.type === 'IMAGE' || section.background.type === 'SVG' ||
        section.background.type === 'COLOR' || section.background.type === 'GRADIENT') {
      const restStyles = { ...scrollBackgroundStyles };
      delete restStyles.position;
      delete restStyles.inset;
      delete restStyles.top;
      delete restStyles.left;
      delete restStyles.right;
      delete restStyles.bottom;

      return (
        <div
          className="scroll-background"
          style={{
            ...restStyles,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            borderRadius: '0px', // No border radius on background (section itself has no border radius)
            overflow: 'hidden'
          }}
        />
      );
    }

    // VIDEO - render as video element with processed URL and loading skeleton
    if (section.background.type === 'VIDEO') {
      const videoUrl = processedBackgroundVideoUrl || (section.background.value as string);
      if (!videoUrl) return null;

      return (
        <>
          {isVideoLoading && (
            <VideoSkeleton className="absolute inset-0 z-10" />
          )}
          <video
            className="scroll-background w-full h-full object-cover"
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadStart={() => setIsVideoLoading(true)}
            onCanPlay={() => setIsVideoLoading(false)}
            onWaiting={() => setIsVideoLoading(true)}
            onError={() => setIsVideoLoading(false)}
            style={{
              opacity: (section.background.opacity as number) ?? 1,
              width: '100%',
              height: '100%',
              borderRadius: '0px', // No border radius on background (section itself has no border radius)
              overflow: 'hidden'
            }}
          />
        </>
      );
    }

           // CAROUSEL - render using CarouselBackground component
           if (section.background.type === 'CAROUSEL') {
             if (section.background.carousel && section.background.carousel.images.length > 0) {
               return (
                 <div
                   className="scroll-background"
                   style={{
                     position: 'absolute',
                     inset: 0,
                     width: '100%',
                     height: '100%',
                     zIndex: 0,
                     overflow: 'hidden',
                     borderRadius: '0px', // Starts at 0px, will animate to 24px on scroll
                     opacity: (section.background.opacity as number) ?? 1
                   }}
                 >
                   <CarouselBackground
                     config={section.background.carousel}
                     size={section.background.size || 'cover'}
                     position={section.background.position || 'center'}
                     className="absolute inset-0 w-full h-full"
                   />
                 </div>
               );
             }
             return null;
           }

    return null;
  }, [section?.background, scrollBackgroundStyles, processedBackgroundVideoUrl, isVideoLoading]);

  // For zoom variant, we need to apply scale to the section element itself (the outer border)
  // But it needs to be wrapped in a container that allows it to scale without constraints
  const sectionRef = useRef<HTMLElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const isZoomVariant = scrollConfig.variant === 'zoom';

  // Set up zoom effect for the section element when variant is zoom
  useEffect(() => {
    if (!isZoomVariant || isEditing || !sectionRef.current) return;

    const {
      zoomStart = 1,           // Start at normal scale
      zoomEnd = 0.9,           // Zoom out to smaller scale
      duration = 300,          // Scroll distance for zoom out (down scroll)
      reverseDuration = 1000,  // Scroll distance for zoom in (up scroll) - smoother
      enableOnMobile = true,
      reducedMotion = false
    } = scrollConfig;

    // Border radius starts at 0 and goes to 24px as section zooms out
    const borderRadiusStart = 0;
    const borderRadiusEnd = 24;

    // Check for reduced motion preference
    if (reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Check for mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile && !enableOnMobile) {
      return;
    }

    const sectionElement = sectionRef.current;

    // Find the background element within the section
    const backgroundElement = sectionElement.querySelector('.scroll-background') as HTMLElement;

    // Set initial scale and border radius for the entire section (from outer border)
    gsap.set(sectionElement, {
      scale: zoomStart,
      transformOrigin: 'center center'
    });

    // Set initial border radius to 0
    if (backgroundElement) {
      gsap.set(backgroundElement, {
        borderRadius: `${borderRadiusStart}px`
      });
    }

    // Create scroll-triggered zoom effect
    // Use duration for zoom out, reverseDuration for zoom in
    // Note: ScrollTrigger's bidirectional scrub means different durations
    // require more complex implementation. For now, use duration as base.
    
    // Calculate start position considering promotion height
    const getStartPosition = () => {
      // Get promotion height from CSS variable
      const promotionHeight = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--promotion-height')) || 0;
      
      // If promotion is visible, offset start by promotion height
      if (promotionHeight > 0) {
        return `top top-=${promotionHeight}`;
      }
      return 'top top';
    };
    
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: sectionElement,
      start: getStartPosition(),
      end: `+=${duration}`, // Use duration for now - scroll distance for effect
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;

        // Calculate scale value (from zoomStart to zoomEnd)
        const scale = zoomStart + (zoomEnd - zoomStart) * progress;

        // Calculate border radius (from borderRadiusStart to borderRadiusEnd)
        const borderRadius = borderRadiusStart + (borderRadiusEnd - borderRadiusStart) * progress;

        // Apply scale to the ENTIRE section element (outer border and all)
        gsap.set(sectionElement, { scale });

        // Apply border radius to the background element as it zooms out
        if (backgroundElement) {
          gsap.set(backgroundElement, {
            borderRadius: `${borderRadius}px`
          });
        }
      },
      invalidateOnRefresh: true
    });

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, [scrollConfig, isEditing, isZoomVariant]);

  // Refresh ScrollTrigger when promotion height changes
  useEffect(() => {
    if (!isZoomVariant || isEditing) return;
    
    let lastPromotionHeight = 0;
    const checkPromotionHeight = () => {
      const promotionHeight = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--promotion-height')) || 0;
      
      if (promotionHeight !== lastPromotionHeight) {
        lastPromotionHeight = promotionHeight;
        // Refresh all ScrollTriggers to update their positions
        ScrollTrigger.refresh();
      }
    };
    
    // Check periodically for promotion height changes
    const interval = setInterval(checkPromotionHeight, 100);
    
    return () => clearInterval(interval);
  }, [isZoomVariant, isEditing]);

  // For zoom variant, wrap section in a container that allows scaling
  // The wrapper has no padding (starts at edge) and applies border radius where background starts
  if (isZoomVariant) {
    return (
        <div
          className="scroll-zoom-wrapper"
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            padding: '0', // Start with no padding at the page edge
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible', // Allow content to overflow for border radius on inner components
            // Remove any width constraints that would prevent scaling
            maxWidth: 'none',
            boxSizing: 'border-box',
            // No border radius on wrapper - section itself has no border radius
            borderRadius: '0px',
            zIndex: 1 // Lower z-index to stay below mobile sidebar (9999)
          }}
        >
          <section
            ref={sectionRef}
            className="scroll-section-enhanced"
            data-section-id={section.id}
            data-scroll-variant={scrollConfig.variant}
            onClick={handleSectionClick}
            style={{
              ...sectionStyle,
              // No border radius on section itself
              borderRadius: '0px',
              overflow: 'visible' // Allow content to show border radius
            }}
          >
          <ScrollRenderer
            config={scrollConfig}
            backgroundElement={backgroundElement}
            className="w-full h-full"
            style={{
              minHeight: '100vh',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'visible',
              width: '100%',
              // No border radius on ScrollRenderer container
              borderRadius: '0px'
            }}
            isEditing={isEditing}
            debugMode={mode === 'preview'}
          >
            {/* Section content */}
            {componentsForRenderer.length > 0 ? (
              <div
                className="relative z-10 w-full"
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem 1rem', // Reduced padding for zoom effect
                  // Border radius for inner components (24px)
                  borderRadius: '24px',
                  overflow: 'hidden' // Ensure border radius is contained
                }}
              >
                <SectionRenderer
                  components={componentsForRenderer}
                  sectionType={SectionType.SCROLL}
                  isEditing={isEditing}
                  mode={mode}
                  onComponentClick={handleComponentClick}
                  className="section-components"
                  section={section}
                  style={{
                    backgroundColor: 'transparent',
                    width: '100%',
                    maxWidth: '100%',
                    borderRadius: '24px', // Border radius for components inside
                    overflow: 'hidden' // Ensure border radius is contained
                  }}
                />
              </div>
            ) : (
              <div className="relative z-10 text-center space-y-4 px-4" style={{ color: 'white' }}>
               
                {section.content?.subtitle && (
                  <p className="text-lg md:text-xl opacity-90 prose prose-md md:prose-md">
                    {section.content.subtitle as string}
                  </p>
                )}
                {section.content?.description && (
                  <p className="text-base opacity-80 max-w-2xl mx-auto prose prose-md md:prose-md">
                    {section.content.description as string}
                  </p>
                )}
                {mode === 'preview' && (
                  <div className="text-sm opacity-75 mt-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                      Scroll: {scrollConfig.variant} | Padding: {scrollConfig.paddingStart}→{scrollConfig.paddingEnd}rem
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollRenderer> 

          {/* Editing overlay */}
          {isEditing && mode === 'preview' && (
            <div className="absolute top-4 left-4 z-50">
              <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg">
                SCROLL ({scrollConfig.variant}): {section.title || section.sectionKey}
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  // For non-zoom variants, render normally without wrapper
  // For text-image-scroll and tabs-scroll, we need minimal wrapper interference for proper scroll tracking
  const isTextImageScroll = scrollConfig.variant === 'text-image-scroll';
  const isTabsScroll = scrollConfig.variant === 'tabs-scroll';
  const isTitleScaleScroll = scrollConfig.variant === 'title-scale-scroll';
  const isBubbleListScroll = scrollConfig.variant === 'bubble-list-scroll';
  return (
    <section
      className="scroll-section-enhanced"
      data-section-id={section.id}
      data-scroll-variant={scrollConfig.variant}
      onClick={handleSectionClick}
      style={sectionStyle}
    >
      <ScrollRenderer
        config={scrollConfig}
        backgroundElement={backgroundElement}
        className={(isTextImageScroll || isTabsScroll || isBubbleListScroll) ? "w-full" : "w-full h-full"}
        style={
          (isTextImageScroll || isTabsScroll || isBubbleListScroll)
            ? {
                // For text-image-scroll, tabs-scroll, and bubble-list-scroll: minimal wrapper, let component control height/layout
                position: 'relative',
                overflow: 'visible',
                width: '100%'
              }
            : {
                // For other variants: centered layout
                minHeight: '100vh',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'visible',
          width: '100%'
              }
        }
        isEditing={isEditing}
        debugMode={mode === 'preview'}
      >
        {/* Section content */}
        {componentsForRenderer.length > 0 ? (
              <div
                className="relative z-10 w-full"
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem 1rem', // Reduced padding for zoom effect
                  maxWidth: '100%',
                  margin: '0 auto' // Ensure horizontal centering
                }}
              >
            <SectionRenderer
              components={componentsForRenderer}
              sectionType={SectionType.SCROLL}
              isEditing={isEditing}
              mode={mode}
              onComponentClick={handleComponentClick}
              className="section-components"
              section={section}
              style={{
                backgroundColor: 'transparent',
                width: '100%',
                maxWidth: '100%',
                margin: '0 auto' // Ensure horizontal centering
              }}
            />
          </div>
        ) : (
          // For tabs-scroll, text-image-scroll, bubble-list-scroll, and title-scale-scroll, don't show fallback title (content is in items)
          (isTextImageScroll || isTabsScroll || isTitleScaleScroll || isBubbleListScroll) ? null : (
          <div className="relative z-10 text-center space-y-4 px-4" style={{ color: 'white' }}>
            <h2 className="text-4xl md:text-5xl font-normal text-white prose prose-md md:prose-md">
              {section.title || section.sectionKey || 'Scroll Section'}
            </h2>
            {section.content?.subtitle && (
              <p className="text-lg md:text-xl opacity-90 prose prose-md md:prose-md">
                {section.content.subtitle as string}
              </p>
            )}
            {section.content?.description && (
              <p className="text-lg opacity-80 max-w-2xl mx-auto">
                {section.content.description as string}
              </p>
            )}
            {mode === 'preview' && (
              <div className="text-sm opacity-75 mt-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                  Scroll: {scrollConfig.variant} | Padding: {scrollConfig.paddingStart}→{scrollConfig.paddingEnd}rem
                </div>
              </div>
            )}
          </div>
          )
        )}
      </ScrollRenderer>

      {/* Editing overlay */}
      {isEditing && mode === 'preview' && (
        <div className="absolute top-4 left-4 z-50">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg">
            SCROLL ({scrollConfig.variant}): {section.title || section.sectionKey}
          </div>
        </div>
      )}
    </section>
  );
}
