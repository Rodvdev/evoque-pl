'use client';

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Media } from '@/components/Media';
import { testimonialConfig } from './config';

// Type for testimonial variant keys
type TestimonialVariantKey = keyof typeof testimonialConfig.variantStyles;

// Simplified background config type
type BackgroundConfig = {
  type: 'IMAGE' | 'VIDEO' | 'GRADIENT' | 'COLOR' | 'SVG';
  value: string;
  alt?: string;
};

type Testimonial = {
  quote: string;
  author: string;
  title?: string;
  company?: string;
  avatar?: string;
  metric?: string;
  videoUrl?: string; // Optional video URL for modal playback
  cardBackground?: BackgroundConfig;
  hoverBackground?: BackgroundConfig;
  modalMedia?: BackgroundConfig;
  cardImage?: string;
  cardImageAlt?: string;
  hoverVideoUrl?: string;
  modalVideoUrl?: string;
};


interface TestimonialShowcaseComponentProps {
  content?: {
    variant?: TestimonialVariantKey;
    headline?: string;
    description?: string;
    testimonials?: Testimonial[];
    cardSpacing?: 'overlap' | 'gap'; // Control card spacing: overlap or gap
    textAlign?: 'left' | 'center' | 'right'; // Text alignment for cards only
    titleAlign?: 'left' | 'center' | 'right'; // Text alignment for title and subtitle
    showPlayButton?: boolean; // Show play button on cards (default: true)
    // Size configurations
    cardWidth?: number; // Card width in pixels (default: 260)
    cardHeight?: number; // Card height in pixels (default: 380)
    cardOverlap?: number; // Overlap amount in pixels for overlap mode (default: 65)
    // Font size configurations
    quoteFontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'; // Quote text size (default: 'base')
    authorFontSize?: 'xs' | 'sm' | 'base' | 'lg'; // Author name size (default: 'sm')
    titleFontSize?: 'xs' | 'sm' | 'base'; // Title/company size (default: 'xs')
    metricFontSize?: 'xs' | 'sm'; // Metric size (default: 'xs')
    headlineFontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'; // Section headline size (default: '2xl')
    descriptionFontSize?: 'xs' | 'sm' | 'base' | 'lg'; // Section description size (default: 'sm')
  };
  styles?: Record<string, unknown>;
  className?: string;
}

// Helper function to map font size values to Tailwind classes
const getFontSizeClass = (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'): string => {
  const sizeMap: Record<string, string> = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  };
  return sizeMap[size] || 'text-base';
};

const mergeTestimonials = (
  content?: TestimonialShowcaseComponentProps['content']
) => {
  const testimonials = Array.isArray(content?.testimonials)
    ? content.testimonials
        .filter((item) => item && item.quote)
        .map((item) => {
          const cardBackground: BackgroundConfig | undefined = item.cardBackground
            ?? (item.cardImage
              ? { type: 'IMAGE' as const, value: item.cardImage, alt: item.cardImageAlt }
              : undefined);
          const hoverBackground: BackgroundConfig | undefined = item.hoverBackground
            ?? (item.hoverVideoUrl
              ? { type: 'VIDEO' as const, value: item.hoverVideoUrl }
              : undefined);
          const modalMedia: BackgroundConfig | undefined = item.modalMedia
            ?? (item.modalVideoUrl || item.videoUrl
              ? { type: 'VIDEO' as const, value: item.modalVideoUrl ?? item.videoUrl ?? '' }
              : undefined);

          return {
            quote: item.quote ?? '',
            author: item.author ?? '',
            title: item.title,
            company: item.company,
            avatar: item.avatar,
            metric: item.metric,
            videoUrl: item.videoUrl,
            cardBackground,
            hoverBackground,
            modalMedia,
            cardImage: item.cardImage ?? item.avatar,
            cardImageAlt: item.cardImageAlt,
            hoverVideoUrl: item.hoverVideoUrl ?? item.videoUrl,
            modalVideoUrl: item.modalVideoUrl ?? item.videoUrl,
          };
        })
    : [];

  return {
    headline: content?.headline?.trim() ?? '',
    description: content?.description?.trim() ?? '',
    testimonials,
  };
};

const TestimonialCard = ({
  testimonial,
  textAlign = 'left',
  onCardClick,
  showPlayButton = true,
  isHovered = false,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  quoteFontSize = 'base',
  authorFontSize = 'sm',
  titleFontSize = 'xs',
  metricFontSize = 'xs',
}: {
  testimonial: Testimonial;
  textAlign?: 'left' | 'center' | 'right';
  onCardClick?: () => void;
  showPlayButton?: boolean;
  isHovered?: boolean;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  quoteFontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  authorFontSize?: 'xs' | 'sm' | 'base' | 'lg';
  titleFontSize?: 'xs' | 'sm' | 'base';
  metricFontSize?: 'xs' | 'sm';
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Check if card has a gradient or color background
  const hasGradientOrColorBackground = testimonial.cardBackground && 
    (testimonial.cardBackground.type === 'GRADIENT' || testimonial.cardBackground.type === 'COLOR');
  const hasCardImage = testimonial.cardBackground?.type === 'IMAGE' || testimonial.cardBackground?.type === 'SVG';
  const cardImageSrc = testimonial.cardImage ?? testimonial.avatar ?? '';

  // Check for hover background
  const hasHoverImage = testimonial.hoverBackground?.type === 'IMAGE' || testimonial.hoverBackground?.type === 'SVG';
  const hoverImageSrc = testimonial.hoverBackground?.value || '';
  const hasHoverVideo = testimonial.hoverBackground?.type === 'VIDEO';
  const hoverVideoSrc = testimonial.hoverBackground?.value || '';

  // Check if there's a video available for the play button
  const hasVideo = !!(testimonial.modalMedia?.value || testimonial.modalVideoUrl || testimonial.videoUrl);

  // Determine which background to show (hover takes priority if available)
  const currentBackgroundImage = isHovered && hasHoverImage ? hoverImageSrc : cardImageSrc;
  const showHoverVideo = isHovered && hasHoverVideo;

  // Get text alignment classes
  const textAlignClass = textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left';
  const itemsAlignClass = textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start';

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking the play button
    if ((e.target as HTMLElement).closest('.play-button')) {
      e.stopPropagation();
      if (onCardClick) {
        onCardClick();
      }
      return;
    }
    if (onCardClick) {
      onCardClick();
    }
  };

  return (
    <div 
        ref={cardRef}
        className="w-full h-full rounded-lg border shadow-sm relative cursor-pointer overflow-hidden flex flex-col transition-all duration-300"
        style={{
          backgroundColor: hasGradientOrColorBackground || hasCardImage || hasHoverImage ? 'transparent' : '#ffffff',
          background: !hasCardImage && !hasHoverImage && testimonial.cardBackground?.type === 'GRADIENT' ? testimonial.cardBackground.value : undefined,
          backgroundImage: (hasCardImage || hasHoverImage) ? `url(${currentBackgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          zIndex: 10000,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={() => onMouseEnter?.()}
        onMouseLeave={() => onMouseLeave?.()}
        onMouseMove={(e) => onMouseMove?.(e)}
        onClick={(e) => handleCardClick(e)}
      >
      {/* Hover video background */}
      {showHoverVideo && hoverVideoSrc && (
        <div className="absolute inset-0 z-[5]">
          <video
            src={hoverVideoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Dark overlay for image backgrounds */}
      {(hasCardImage || hasHoverImage) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
      )}
      
      {/* Content - aligned to bottom with configurable text alignment */}
      <div className={`relative z-[20] flex flex-col flex-1 p-4 justify-end ${textAlignClass} ${hasGradientOrColorBackground || hasCardImage || hasHoverImage ? 'text-white' : 'text-gray-900'}`}>
        {/* Quote */}
        <blockquote className={`mb-3 italic font-bold ${getFontSizeClass(quoteFontSize)} ${textAlignClass}`}>
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        
        {/* Author Info - aligned to bottom */}
        <div className={`flex items-center gap-3 ${itemsAlignClass}`}>
          {testimonial.avatar && !hasCardImage && !hasHoverImage && (
            <img
              src={testimonial.avatar}
              alt={testimonial.author}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div className={textAlignClass}>
            <div className={`font-semibold ${getFontSizeClass(authorFontSize)}`}>{testimonial.author}</div>
            {(testimonial.title || testimonial.company) && (
              <div className={`${getFontSizeClass(titleFontSize)} ${hasGradientOrColorBackground || hasCardImage || hasHoverImage ? 'text-white/80' : 'text-gray-600'}`}>
                {testimonial.title}{testimonial.title && testimonial.company ? ', ' : ''}{testimonial.company}
              </div>
            )}
            {testimonial.metric && (
              <div className={`${getFontSizeClass(metricFontSize)} mt-1 ${hasGradientOrColorBackground || hasCardImage || hasHoverImage ? 'text-white/60' : 'text-gray-500'}`}>
                {testimonial.metric}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Play Button - Always visible at bottom right corner */}
      {showPlayButton && hasVideo && (
        <div
          className="play-button group absolute bottom-3 right-3 z-[30] bg-black/50 hover:bg-black/70 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (onCardClick) {
              onCardClick();
            }
          }}
        >
          {/* Play icon - always visible, no icon change on hover */}
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}
    </div>
  );
};

// Video Modal Component
const VideoModal = ({ 
  videoUrl, 
  onClose 
}: { 
  videoUrl: string; 
  onClose: () => void;
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play failed, user interaction required
      });
    }
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-black rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClose();
            }
          }}
          className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 rounded-full p-2 text-white transition-colors cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="Close video modal"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default function TestimonialShowcaseComponent({
  content,
  styles,
  className = '',
}: TestimonialShowcaseComponentProps) {
  const variantKey: TestimonialVariantKey = content?.variant && testimonialConfig.variantStyles[content.variant as TestimonialVariantKey] 
    ? (content.variant as TestimonialVariantKey) 
    : 'spotlight';
  const variant = testimonialConfig.variantStyles[variantKey];
  const merged = mergeTestimonials(content);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [modalVideoUrl, setModalVideoUrl] = useState<string | null>(null);
  const [globalMousePosition, setGlobalMousePosition] = useState({ x: 0, y: 0 });

  // Refs for horizontal scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Memoize testimonials - must be before effects that use it
  const testimonials = useMemo(() => merged.testimonials || [], [merged.testimonials]);

  // Get size configurations with defaults (at component level for use in return)
  const cardWidth = content?.cardWidth ?? 260;
  const cardHeight = content?.cardHeight ?? 380;
  const cardOverlap = content?.cardOverlap ?? 65;
  
  // Get font size configurations with defaults
  const quoteFontSize = content?.quoteFontSize ?? 'base';
  const authorFontSize = content?.authorFontSize ?? 'sm';
  const titleFontSize = content?.titleFontSize ?? 'xs';
  const metricFontSize = content?.metricFontSize ?? 'xs';
  const headlineFontSize = content?.headlineFontSize ?? '2xl';
  const descriptionFontSize = content?.descriptionFontSize ?? 'sm';

  // Horizontal scroll effect for cards
  const createHorizontalScrollEffect = useCallback(
    (
      card: HTMLElement,
      container: HTMLElement,
      prefersReducedMotion = false
    ): (() => void) => {
      if (prefersReducedMotion) {
        return () => {}; // No-op cleanup
      }

      let animationFrameId: number;

      const updateCardTransform = () => {
        const containerRect = container.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        // Calculate how close card is to center of viewport (horizontal)
        const containerCenter = containerRect.left + containerRect.width / 2;
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distanceFromCenter = Math.abs(containerCenter - cardCenter);
        const maxDistance = containerRect.width / 2;

        // Map distance to scale (1.0 at center, 0.95 at edges)
        const progress = Math.min(distanceFromCenter / maxDistance, 1);
        const scale = gsap.utils.mapRange(0, 1, 1.0, 0.95, progress);
        const opacity = gsap.utils.mapRange(0, 1, 1.0, 0.7, progress);

        gsap.to(card, {
          scale,
          opacity,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      // Update on scroll
      const handleScroll = () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(updateCardTransform);
      };

      container.addEventListener('scroll', handleScroll);

      // Initial update
      updateCardTransform();

      // Cleanup function
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    },
    []
  );

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Setup scroll-based animations for horizontal-scroll layout
  useEffect(() => {
    if (variant.layout !== 'horizontal-scroll' || prefersReducedMotion) return;

    const container = scrollContainerRef.current?.querySelector('.overflow-x-auto') as HTMLElement;
    if (!container) return;

    const cleanupFunctions: (() => void)[] = [];

    cardRefs.current.forEach((card) => {
      if (card) {
        const cleanupFn = createHorizontalScrollEffect(card, container, prefersReducedMotion);
        cleanupFunctions.push(cleanupFn);
      }
    });

    return () => {
      cleanupFunctions.forEach((fn) => fn());
    };
  }, [variant.layout, prefersReducedMotion, testimonials.length, createHorizontalScrollEffect]);

  // Debug: Log card positions after render
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && variant.layout === 'horizontal-scroll') {
      const timeoutId = setTimeout(() => {
        const firstCard = cardRefs.current[0];
        const firstRect = firstCard ? firstCard.getBoundingClientRect() : null;
        const hasGap = content?.cardSpacing === 'gap';
        
        cardRefs.current.forEach((card, cardIndex) => {
          if (card) {
            const rect = card.getBoundingClientRect();
            const prevCard = cardIndex > 0 ? cardRefs.current[cardIndex - 1] : null;
            const prevRect = prevCard ? prevCard.getBoundingClientRect() : null;
            // Note: These debug values use defaults since they're in a debug block
            // The actual component uses configurable values from content
            const debugCardWidth = content?.cardWidth ?? 260;
            const debugCardOverlap = content?.cardOverlap ?? 65;
            const horizontalOffset = !hasGap ? -(debugCardOverlap * cardIndex) : 0;
            const overlapOffset = horizontalOffset;
            
            // Calculate distance from first card
            const distanceFromFirst = firstRect ? rect.left - firstRect.left : 0;
            const expectedDistanceFromFirst = cardIndex * (debugCardWidth - debugCardOverlap); // Each card should be (width - overlap)px from previous
            
            console.log(`[Card ${cardIndex} Position]`, {
              position: {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
              },
              computedStyles: {
                marginLeft: window.getComputedStyle(card).marginLeft,
                marginRight: window.getComputedStyle(card).marginRight,
                paddingLeft: window.getComputedStyle(card).paddingLeft,
                paddingRight: window.getComputedStyle(card).paddingRight,
                transform: window.getComputedStyle(card).transform,
              },
              horizontalOffset: `${horizontalOffset}px`,
              overlapOffset: `${overlapOffset}px`,
              previousCard: prevRect ? {
                left: prevRect.left,
                right: prevRect.right,
                width: prevRect.width,
              } : null,
              actualDistanceFromPrev: prevRect ? rect.left - prevRect.left : null,
              expectedDistanceFromPrev: cardIndex === 0 ? 0 : (debugCardWidth - debugCardOverlap), // Card width - overlap = visible portion
              actualDistanceFromFirst: distanceFromFirst,
              expectedDistanceFromFirst: expectedDistanceFromFirst,
              difference: distanceFromFirst - expectedDistanceFromFirst,
            });
          }
        });
      }, 100); // Small delay to ensure DOM is fully rendered

      return () => clearTimeout(timeoutId);
    }
  }, [variant.layout, testimonials.length, content?.cardSpacing]);

  const renderCarouselControls = () => {
    if (variant.layout !== 'carousel' || testimonials.length <= 1) return null;
    const next = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
    const prev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    return (
      <div className="mt-6 flex items-center justify-between text-white/70">
        <button
          type="button"
          onClick={prev}
          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:border-white/40 hover:bg-white/15"
        >
          Previous
        </button>
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <span
              key={index}
              className={`h-2 w-8 rounded-full transition ${index === activeIndex ? 'bg-white/80' : 'bg-white/20'}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:border-white/40 hover:bg-white/15"
        >
          Next
        </button>
      </div>
    );
  };

  // Handler to open modal with video
  const handleCardClick = (testimonial: Testimonial) => {
    const videoUrl = testimonial.modalMedia?.value ||
                     testimonial.modalVideoUrl ||
                     testimonial.videoUrl ||
                     null;
    if (videoUrl) {
      setModalVideoUrl(videoUrl);
    }
  };

  // Global mouse handlers for coordinating hover state
  const handleCardMouseEnter = (cardIndex: number) => {
    setHoveredCardIndex(cardIndex);
  };

  const handleCardMouseLeave = () => {
    setHoveredCardIndex(null);
    setGlobalMousePosition({ x: 0, y: 0 });
  };

  const handleCardMouseMove = (e: React.MouseEvent) => {
    // Store absolute position for label (directly from viewport)
    setGlobalMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const renderLayout = () => {
    if (testimonials.length === 0) {
      return null;
    }

    // Get text alignment from content, default to 'left'
    const textAlign = (content?.textAlign || 'left') as 'left' | 'center' | 'right';
    // Get showPlayButton from content, default to true
    const showPlayButton = content?.showPlayButton !== false; // Default to true if not explicitly set to false
    
    // Size configurations are already defined at component level

    switch (variant.layout) {
      case 'split':
        return (
          <div className="grid gap-10 lg:grid-cols-2 justify-items-center items-start" style={{ position: 'relative', zIndex: 9999 }}>
            <div className="space-y-8 w-full max-w-md flex flex-col" style={{ position: 'relative', zIndex: 10000 }}>
              <TestimonialCard
                testimonial={testimonials[0]}
                textAlign={textAlign}
                showPlayButton={showPlayButton}
                onCardClick={() => handleCardClick(testimonials[0])}
                isHovered={hoveredCardIndex === 0}
                onMouseEnter={() => handleCardMouseEnter(0)}
                onMouseLeave={handleCardMouseLeave}
                onMouseMove={handleCardMouseMove}
                quoteFontSize={quoteFontSize}
                authorFontSize={authorFontSize}
                titleFontSize={titleFontSize}
                metricFontSize={metricFontSize}
              />
              {testimonials[1] && (
                <TestimonialCard
                  testimonial={testimonials[1]}
                  textAlign={textAlign}
                  showPlayButton={showPlayButton}
                  onCardClick={() => handleCardClick(testimonials[1])}
                  isHovered={hoveredCardIndex === 1}
                  onMouseEnter={() => handleCardMouseEnter(1)}
                  onMouseLeave={handleCardMouseLeave}
                  onMouseMove={handleCardMouseMove}
                  quoteFontSize={quoteFontSize}
                  authorFontSize={authorFontSize}
                  titleFontSize={titleFontSize}
                  metricFontSize={metricFontSize}
                />
              )}
            </div>
            {testimonials.length > 2 && (
              <div className="space-y-6 w-full max-w-md flex flex-col" style={{ position: 'relative', zIndex: 10000 }}>
                {testimonials.slice(2).map((testimonial, index) => (
                  <TestimonialCard
                    key={`${testimonial.author}-${index}`}
                    testimonial={testimonial}
                    textAlign={textAlign}
                    showPlayButton={showPlayButton}
                    onCardClick={() => handleCardClick(testimonial)}
                    isHovered={hoveredCardIndex === index + 2}
                    onMouseEnter={() => handleCardMouseEnter(index + 2)}
                    onMouseLeave={handleCardMouseLeave}
                    onMouseMove={handleCardMouseMove}
                    quoteFontSize={quoteFontSize}
                    authorFontSize={authorFontSize}
                    titleFontSize={titleFontSize}
                    metricFontSize={metricFontSize}
                  />
                ))}
              </div>
            )}
          </div>
        );
      case 'grid':
        return (
          <div className="grid gap-6 md:grid-cols-2 justify-items-center items-start" style={{ position: 'relative', zIndex: 9999 }}>
            {testimonials.map((testimonial, index) => (
              <div key={`${testimonial.author}-${index}`} className="w-full max-w-md" style={{ position: 'relative', zIndex: 10000 + index }}>
                <TestimonialCard
                  testimonial={testimonial}
                  textAlign={textAlign}
                  showPlayButton={showPlayButton}
                  onCardClick={() => handleCardClick(testimonial)}
                  isHovered={hoveredCardIndex === index}
                  onMouseEnter={() => handleCardMouseEnter(index)}
                  onMouseLeave={handleCardMouseLeave}
                  onMouseMove={handleCardMouseMove}
                  quoteFontSize={quoteFontSize}
                  authorFontSize={authorFontSize}
                  titleFontSize={titleFontSize}
                  metricFontSize={metricFontSize}
                />
              </div>
            ))}
          </div>
        );
      case 'carousel':
        return (
          <div className="flex flex-col items-center" style={{ position: 'relative', zIndex: 9999 }}>
            <div className="mx-auto max-w-md w-full" style={{ position: 'relative', zIndex: 10000 }}>
              <TestimonialCard
                testimonial={testimonials[activeIndex]}
                textAlign={textAlign}
                showPlayButton={showPlayButton}
                onCardClick={() => handleCardClick(testimonials[activeIndex])}
                isHovered={hoveredCardIndex === activeIndex}
                onMouseEnter={() => handleCardMouseEnter(activeIndex)}
                onMouseLeave={handleCardMouseLeave}
                onMouseMove={handleCardMouseMove}
                quoteFontSize={quoteFontSize}
                authorFontSize={authorFontSize}
                titleFontSize={titleFontSize}
                metricFontSize={metricFontSize}
              />
            </div>
            {renderCarouselControls()}
          </div>
        );
      case 'layered':
        return (
          <div className="relative mx-auto max-w-md" style={{ position: 'relative', zIndex: 9999 }}>
            {testimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.author}-${index}`}
                className="relative mb-6"
                style={{
                  transform: `translateY(${index * 12}px)`,
                  position: 'relative',
                  zIndex: 10000 + index
                }}
              >
                <TestimonialCard
                  testimonial={testimonial}
                  textAlign={textAlign}
                  showPlayButton={showPlayButton}
                  onCardClick={() => handleCardClick(testimonial)}
                  isHovered={hoveredCardIndex === index}
                  onMouseEnter={() => handleCardMouseEnter(index)}
                  onMouseLeave={handleCardMouseLeave}
                  onMouseMove={handleCardMouseMove}
                  quoteFontSize={quoteFontSize}
                  authorFontSize={authorFontSize}
                  titleFontSize={titleFontSize}
                  metricFontSize={metricFontSize}
                />
              </div>
            ))}
          </div>
        );
      case 'horizontal-scroll':
        const cardSpacing = content?.cardSpacing || 'gap'; // Default to gap for horizontal scroll
        const hasGap = cardSpacing === 'gap';
        
        return (
          <div className="relative w-full mx-auto" style={{ position: 'relative', zIndex: 9999 }}>
            <div
              ref={scrollContainerRef}
              className="relative -mx-2 px-2 sm:-mx-3 sm:px-3 lg:-mx-4 lg:px-4"
            >
              <div
                className={`flex overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide scroll-smooth items-start ${hasGap ? 'gap-6' : ''}`}
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                  scrollPaddingLeft: '1rem',
                  scrollPaddingRight: '1rem',
                  position: 'relative',
                  zIndex: 9999,
                }}
              >
                {testimonials.map((testimonial, cardIndex) => {
                  const isHovered = hoveredCardIndex === cardIndex;
                  const baseZIndex = 10000 + cardIndex;
                  const zIndex = isHovered ? 20000 : baseZIndex;
                  
                  return (
                    <div
                      key={`testimonial-${cardIndex}-${testimonial.author}-${testimonial.quote?.slice(0, 20)}`}
                      ref={(el) => {
                        cardRefs.current[cardIndex] = el;
                      }}
                      className="flex-shrink-0 snap-start"
                      style={{
                        width: `${cardWidth}px`,
                        height: `${cardHeight}px`,
                        position: 'relative',
                        zIndex: zIndex,
                        transition: 'z-index 0s',
                        transformOrigin: 'center center',
                      }}
                      onMouseEnter={() => {
                        handleCardMouseEnter(cardIndex);
                        const el = cardRefs.current[cardIndex];
                        if (el && !prefersReducedMotion) {
                          gsap.to(el, {
                            scale: 1.05,
                            y: -10,
                            duration: 0.3,
                            ease: 'power2.out',
                            overwrite: 'auto',
                          });
                        }
                      }}
                      onMouseLeave={() => {
                        handleCardMouseLeave();
                        const el = cardRefs.current[cardIndex];
                        if (el && !prefersReducedMotion) {
                          gsap.to(el, {
                            scale: 1,
                            y: 0,
                            duration: 0.3,
                            ease: 'power2.out',
                            overwrite: 'auto',
                          });
                        }
                      }}
                    >
                      <div className="w-full h-full" style={{
                        position: 'relative',
                        zIndex: zIndex,
                      }}>
                        <TestimonialCard
                          testimonial={testimonial}
                          textAlign={textAlign}
                          showPlayButton={showPlayButton}
                          onCardClick={() => handleCardClick(testimonial)}
                          isHovered={hoveredCardIndex === cardIndex}
                          onMouseEnter={() => handleCardMouseEnter(cardIndex)}
                          onMouseLeave={handleCardMouseLeave}
                          onMouseMove={handleCardMouseMove}
                          quoteFontSize={quoteFontSize}
                          authorFontSize={authorFontSize}
                          titleFontSize={titleFontSize}
                          metricFontSize={metricFontSize}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Get text alignment from content - separate for title/subtitle and cards
  const titleAlign = (content?.titleAlign || 'center') as 'left' | 'center' | 'right'; // For title and subtitle
  const titleAlignClass = titleAlign === 'center' ? 'text-center' : titleAlign === 'right' ? 'text-right' : 'text-left';

  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-white p-8 sm:p-12 lg:p-16 ${className}`}
      style={{
        backgroundColor: '#ffffff',
        ...(styles?.appearance as Record<string, unknown> | undefined),
      }}
    >
      <div className="relative z-10 flex flex-col gap-10" style={styles?.layout as React.CSSProperties}>
        <div className={`w-full max-w-3xl mx-auto space-y-4 ${titleAlignClass}`}>
          {merged.headline && (
            <h2 className={`${getFontSizeClass(headlineFontSize)} font-semibold ${headlineFontSize === '2xl' ? 'sm:text-3xl' : ''} text-black ${titleAlignClass}`}>
              {merged.headline}
            </h2>
          )}
          {merged.description && (
            <p className={`${getFontSizeClass(descriptionFontSize)} leading-relaxed text-black ${titleAlignClass}`}>
              {merged.description}
            </p>
          )}
        </div>
        {renderLayout()}
      </div>
      {modalVideoUrl && (
        <VideoModal
          videoUrl={modalVideoUrl}
          onClose={() => setModalVideoUrl(null)}
        />
      )}
      {/* Global Hover Label - rendered at parent level to prevent duplication */}
      {hoveredCardIndex !== null && globalMousePosition.x > 0 && globalMousePosition.y > 0 && testimonials[hoveredCardIndex] && (
        <div
          className="fixed z-[30000] pointer-events-none"
          style={{
            left: `${globalMousePosition.x + testimonialConfig.labelPosition.translateX}px`,
            top: `${globalMousePosition.y + testimonialConfig.labelPosition.translateY}px`,
            transform: 'translate(0, -100%)',
          }}
        >
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg text-gray-900 font-semibold text-xs whitespace-nowrap">
            Show {testimonials[hoveredCardIndex].author}
          </div>
        </div>
      )}
    </section>
  );
}
