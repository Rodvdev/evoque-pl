'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { BaseScrollProps, ScrollItem } from '../types';
import { 
  motion,
  useScroll, 
  useTransform,
  useReducedMotion,
  useMotionValue
} from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Camera } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Media } from '@/components/Media';
import type { Media as MediaType } from '@/payload-types';

// Register GSAP plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Image component with error handling
const SafeImage: React.FC<{
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onError: () => void;
}> = ({ src, alt, fill, className, sizes, priority, onError }) => {
  const [hasError, setHasError] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    setHasError(false);
    
    // Use a hidden img element to detect load errors
    if (!src || src.trim() === '') {
      setHasError(true);
      onError();
      return;
    }
    
    const testImg = new window.Image();
    testImg.onerror = () => {
      setHasError(true);
      onError();
    };
    testImg.onload = () => {
      setHasError(false);
    };
    testImg.src = src;
    
    return () => {
      testImg.onerror = null;
      testImg.onload = null;
    };
  }, [src, onError]);
  
  if (hasError || !src || src.trim() === '') {
    return null;
  }
  
  return (
    <div ref={containerRef} className={fill ? 'absolute inset-0' : ''}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
};

// Helper function to render rich text description
const renderDescription = (description: ScrollItem['description']): React.ReactNode => {
  if (typeof description === 'string') {
    return <p className="text-base leading-relaxed prose prose-md md:prose-md">{description}</p>;
  }
  
  if (description && typeof description === 'object' && 'type' in description) {
    const { type, content } = description;
    
    if (type === 'paragraph') {
      return <p className="text-base leading-relaxed prose prose-md md:prose-md">{content as string}</p>;
    }
    
    if (type === 'list') {
      return (
        <ul className="text-base leading-relaxed space-y-2 list-disc list-inside prose prose-md md:prose-md">
          {(content as string[]).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }
    
    if (type === 'numbered-list') {
      return (
        <ol className="text-base leading-relaxed space-y-2 list-decimal list-inside prose prose-md md:prose-md">
          {(content as string[]).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ol>
      );
    }
  }
  
  return <p className="text-base leading-relaxed prose prose-md md:prose-md">{String(description)}</p>;
};

// Helper function to render CTA button
const renderCTA = (cta: ScrollItem['cta']): React.ReactNode => {
  if (!cta) return null;
  
  const {
    text,
    href,
    variant = 'primary',
    size = 'md',
    borderRadius,
    style = {}
  } = cta;
  
  const baseStyles: React.CSSProperties = {
    borderRadius: borderRadius ? (typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius) : '12px',
    ...style
  };
  
  const variantClasses = {
    primary: 'bg-[#0077A7] text-white hover:bg-[#005a7a]',
    secondary: 'bg-transparent border-2 border-[#0077A7] text-[#0077A7] hover:bg-[#0077A7] hover:text-white',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const variantKey = variant || 'primary';
  const sizeKey = size || 'md';
  
  return (
    <Link
      href={href}
      className={`inline-block font-medium transition-all duration-300 ${variantClasses[variantKey]} ${sizeClasses[sizeKey]}`}
      style={baseStyles}
    >
      {text}
    </Link>
  );
};

/**
 * Tabs Scroll Variant - Layered Cards with Tab Navigation
 * 
 * ANIMATION BREAKDOWN (from YAML):
 * 1. Section intro fade: opacity [0→1], translateY [40px→0], easeOutCubic, 0.6s
 * 2. Scroll-triggered text sequence: opacity [0→1→0], translateY [40px→0→-40px], scale [1→1.05→1], easeInOutCubic
 * 3. Icon crossfade: opacity [0→1→0], scale [0.9→1→0.9], blur [3px→0→3px], easeInOutQuad
 * 4. Section pinning: position fixed during scroll, entire duration
 * 5. Progress indicator (tabs): opacity [0.5→1], scale [0.8→1], easeOut
 * 6. Parallax: foreground [0→20px], background [0→-40px], easeOutSine
 * 
 * ARCHITECTURE:
 * - Tall container (~400-500vh) with pinned viewport
 * - Each layer appears from bottom, stacking on top
 * - Higher z-index for later items
 * - Tabs at bottom for manual navigation
 */
export function TabsScroll({
  config,
  backgroundElement,
  className,
  style,
  isEditing = false,
  children
}: BaseScrollProps) {
  const pinnedRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const shouldReduceMotion = useReducedMotion();
  
  // Get items from config
  const items: ScrollItem[] = useMemo(() => config.items || [], [config.items]);
  
  // Track image load errors
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  // Handle image load errors
  const handleImageError = (itemId: string) => {
    setImageErrors((prev) => new Set(prev).add(itemId));
  };

  const enableGPU = config.useGPU !== false;
  const itemCount = items.length;

  // Get tab-scroll specific configs
  const tabClickScrollSpeed = config.tabClickScrollSpeed ?? 2; // Default: 2 (slower, smoother)
  const imagePosition = config.imagePosition ?? 'left'; // Default: 'left'
  const landingZoneEnabled = config.landingZone?.enabled ?? false;
  const landingZoneHeight = config.landingZone?.height ?? 16;
  const landingZoneBackgroundColor = config.landingZone?.backgroundColor ?? 'transparent';
  const landingZoneShowTitle = config.landingZone?.showTitle ?? false;
  const landingZoneTitleText = config.landingZone?.titleText ?? '';
  const landingZoneTitleColor = config.landingZone?.titleColor ?? '#0A1F44';
  const landingZoneAlignment = config.landingZone?.alignment ?? 'center';
  const landingZonePadding = config.landingZone?.padding ?? {
    top: 2,
    bottom: 2,
    left: 4,
    right: 4
  };
  const landingZoneJustify = landingZoneAlignment === 'left'
    ? 'flex-start'
    : landingZoneAlignment === 'right'
      ? 'flex-end'
      : 'center';

  // Calculate total scroll height
  // Each item gets 80vh of viewport space
  // Add extra 60vh buffer at the end so last tab is fully rendered and visible before next section
  // Subtract 100vh because pinSpacing: true automatically adds the pinned element's height (100vh)
  const scrollHeight = Math.max(100, itemCount * 80 + 60 - 100); // 80vh per item + 60vh buffer - 100vh for pinSpacing, min 100vh
  
  // Create a ref for the cards section (where pinning will happen)
  const cardsSectionRef = useRef<HTMLDivElement>(null);
  
  // Scroll tracking - now on the cards section instead of container
  const { scrollYProgress } = useScroll({
    target: cardsSectionRef,
    offset: ['start start', 'end start']
  });

  // Calculate ranges for each item
  // Adjust so last item completes before scrollYProgress reaches 1.0, leaving buffer space
  // Buffer ensures last tab is fully rendered and visible before next section starts
  const ranges = useMemo(() => {
    // Use scrollHeight which already accounts for pinSpacing adjustment
    const totalScrollVh = scrollHeight + 100; // Add back 100vh for calculation (pinSpacing adds it)
    const bufferRatio = 60 / totalScrollVh;
    const itemsRatio = (itemCount * 80) / totalScrollVh;
    const contentRatio = 1 - bufferRatio; // Everything except buffer

    return items.map((_, i) => {
      const itemStart = (i / itemCount) * itemsRatio;
      const itemCenter = ((i + 0.5) / itemCount) * itemsRatio;
      const itemEnd = ((i + 1) / itemCount) * itemsRatio;

      return {
        start: Math.min(itemStart, contentRatio),
        center: Math.min(itemCenter, contentRatio),
        end: Math.min(itemEnd, contentRatio)
      };
    });
  }, [items, itemCount, scrollHeight]);

  // Active index tracking - based on actual card animation ranges for perfect sync
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (progress) => {
      // Find which range the current progress falls into
      // Card becomes active at its start point
      let newIndex = 0;
      for (let i = 0; i < ranges.length; i++) {
        if (progress >= ranges[i].start) {
          newIndex = i;
        } else {
          break;
        }
      }
      // Clamp to valid range
      const clampedIndex = Math.max(0, Math.min(itemCount - 1, newIndex));
      setActiveIndex(clampedIndex);
    });
    return unsubscribe;
  }, [scrollYProgress, itemCount, ranges]);

  // Setup GSAP pinning for the cards section
  useEffect(() => {
    if (!cardsSectionRef.current || !pinnedRef.current || isEditing || shouldReduceMotion) {
      return;
    }

    // Wait for next frame to ensure DOM is fully laid out
    const setupScrollTrigger = () => {
      if (!cardsSectionRef.current || !pinnedRef.current) return;

      // Calculate scroll distance to match cards section height (includes buffer for last tab)
      const scrollDistance = scrollHeight * (window.innerHeight / 100); // Convert vh to pixels

      // Calculate when the last card reaches full opacity
      // The last card reaches full opacity at its start point (r5.start for card 5)
      // We want unpinning to start at that point so the last card stays visible
      const lastItemIndex = itemCount - 1;
      const lastItemRange = ranges[lastItemIndex];
      const unpinStartProgress = lastItemRange ? lastItemRange.start : 1;
      
      // Calculate the scroll distance that corresponds to when the last card is fully visible
      // This is the point where we want unpinning to begin
      const unpinStartDistance = unpinStartProgress * scrollDistance;

      // Kill existing ScrollTrigger if any
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }

      // Start pinning when the top of the cards section reaches the top of the viewport
      // End pinning when the last card reaches full opacity, so it stays visible during unpin
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: cardsSectionRef.current,
        start: 'top top', // Start pinning when cards section top reaches viewport top
        end: `+=${unpinStartDistance}`, // Unpin starts when last card is fully visible
        pin: pinnedRef.current,
        pinSpacing: true, // Add proper spacing for smooth scrolling
        anticipatePin: 1,
        invalidateOnRefresh: true,
        markers: false
      });

      // Refresh ScrollTrigger after creation to ensure proper positioning
      ScrollTrigger.refresh();
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      // Add a small delay to ensure all layouts are complete
      setTimeout(setupScrollTrigger, 100);
    });

    // Handle window resize
    const handleResize = () => {
      if (scrollTriggerRef.current && cardsSectionRef.current && pinnedRef.current) {
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, [itemCount, isEditing, shouldReduceMotion, scrollHeight, ranges]);

  // Create transform hooks - must call unconditionally (max 6 services)
  const defaultRange = { start: 0, center: 0.5, end: 1 };
  const r0 = ranges[0] || defaultRange;
  const r1 = ranges[1] || defaultRange;
  const r2 = ranges[2] || defaultRange;
  const r3 = ranges[3] || defaultRange;
  const r4 = ranges[4] || defaultRange;
  const r5 = ranges[5] || defaultRange;

  /**
   * ANIMATION 2: Scroll-triggered layer sequence
   * NEW BEHAVIOR:
   * - Current card zooms out and blurs when next card appears
   * - Next card enters from bottom with 100% opacity (full opacity throughout entrance)
   * - Cards stack with higher z-index
   *
   * FIRST ITEM starts visible (no scroll needed)
   */
  // Opacity: Active card fully visible, previous cards fade out as they zoom out and blur
  // Cards enter with FULL OPACITY from the start of their entrance animation
  // Card 0: Visible from start, starts fading at 80% of r0 (overlap with r1 entry)
  const cardOpacity0 = useTransform(scrollYProgress, [0, r0.center, r1.start], [1, 1, 0.7]);
  // Card 1: Starts invisible, jumps to FULL OPACITY when entering begins, fades when next enters
  const cardOpacity1 = useTransform(scrollYProgress, [0, r0.center, r1.start, r1.center, r2.start], [0, 1, 1, 1, 0.7]);
  // Card 2: Same pattern - full opacity throughout entrance
  const cardOpacity2 = useTransform(scrollYProgress, [0, r1.center, r2.start, r2.center, r3.start], [0, 1, 1, 1, 0.7]);
  // Card 3: Same pattern - full opacity throughout entrance
  const cardOpacity3 = useTransform(scrollYProgress, [0, r2.center, r3.start, r3.center, r4.start], [0, 1, 1, 1, 0.7]);
  // Card 4: Same pattern - full opacity throughout entrance
  const cardOpacity4 = useTransform(scrollYProgress, [0, r3.center, r4.start, r4.center, r5.start], [0, 1, 1, 1, 0.7]);
  // Card 5: Stays fully visible - it's the last card, full opacity throughout entrance
  const cardOpacity5 = useTransform(scrollYProgress, [0, r4.center, r5.start, r5.end, 1], [0, 1, 1, 1, 1]);
  const cardOpacity = [cardOpacity0, cardOpacity1, cardOpacity2, cardOpacity3, cardOpacity4, cardOpacity5].slice(0, itemCount);

  // Y position: New cards enter from bottom, previous cards stay at center (with zoom out + blur)
  // Overlap: Next card starts entering from bottom when previous card is at center (50% of its range)
  // Gap: Next card (below active) starts further down (115% instead of 100%) to create separation
  // Card 0: Starts at center, stays at center when next card enters (only zoom out + blur)
  const cardY0 = useTransform(scrollYProgress, [0, r0.center, r1.start], ['0%', '0%', '0%']);
  // Card 1: Starts entering from bottom (with gap) when Card 0 is at center, lands at center when Card 1 is at center
  const cardY1 = useTransform(scrollYProgress, [0, r0.center, r1.start, r1.center, r2.start], ['115%', '115%', '0%', '0%', '0%']);
  // Card 2: Same pattern - starts entering when Card 1 is at center
  const cardY2 = useTransform(scrollYProgress, [0, r1.center, r2.start, r2.center, r3.start], ['115%', '115%', '0%', '0%', '0%']);
  // Card 3: Same pattern
  const cardY3 = useTransform(scrollYProgress, [0, r2.center, r3.start, r3.center, r4.start], ['115%', '115%', '0%', '0%', '0%']);
  // Card 4: Same pattern
  const cardY4 = useTransform(scrollYProgress, [0, r3.center, r4.start, r4.center, r5.start], ['115%', '115%', '0%', '0%', '0%']);
  // Card 5: Enters from bottom (with gap), stays at center - it's the last card
  const cardY5 = useTransform(scrollYProgress, [0, r4.center, r5.start, r5.end, 1], ['115%', '115%', '0%', '0%', '0%']);
  const cardY = [cardY0, cardY1, cardY2, cardY3, cardY4, cardY5].slice(0, itemCount);

  // Combined Y transforms: combine centering (-50%) with scroll animations
  // Convert percentage strings to numbers, add -50 for centering, then convert back to percentage
  const cardYCombined0 = useTransform(cardY0, (val) => {
    const num = parseFloat(val) || 0;
    return `${num - 50}%`;
  });
  const cardYCombined1 = useTransform(cardY1, (val) => {
    const num = parseFloat(val) || 0;
    return `${num - 50}%`;
  });
  const cardYCombined2 = useTransform(cardY2, (val) => {
    const num = parseFloat(val) || 0;
    return `${num - 50}%`;
  });
  const cardYCombined3 = useTransform(cardY3, (val) => {
    const num = parseFloat(val) || 0;
    return `${num - 50}%`;
  });
  const cardYCombined4 = useTransform(cardY4, (val) => {
    const num = parseFloat(val) || 0;
    return `${num - 50}%`;
  });
  const cardYCombined5 = useTransform(cardY5, (val) => {
    const num = parseFloat(val) || 0;
    return `${num - 50}%`;
  });
  const cardYCombined = [cardYCombined0, cardYCombined1, cardYCombined2, cardYCombined3, cardYCombined4, cardYCombined5].slice(0, itemCount);

  // Constant MotionValue for horizontal centering
  const cardX = useMotionValue('-50%');

  // Scale: Previous cards zoom out (1 → 0.75) when next card enters, creating depth effect
  // Overlap: Previous card starts zooming out when it reaches center, as next card begins entering
  // Card 0: Starts at normal size, starts zooming out at center when card 1 begins entering
  const cardScale0 = useTransform(scrollYProgress, [0, r0.center, r1.start], [1, 1, 0.75]);
  // Card 1: Starts at normal size, starts zooming out at center when card 2 begins entering
  const cardScale1 = useTransform(scrollYProgress, [0, r0.center, r1.start, r1.center, r2.start], [1, 1, 1, 1, 0.75]);
  // Card 2: Same pattern - starts zooming out at center when next begins entering
  const cardScale2 = useTransform(scrollYProgress, [0, r1.center, r2.start, r2.center, r3.start], [1, 1, 1, 1, 0.75]);
  // Card 3: Same pattern
  const cardScale3 = useTransform(scrollYProgress, [0, r2.center, r3.start, r3.center, r4.start], [1, 1, 1, 1, 0.75]);
  // Card 4: Same pattern
  const cardScale4 = useTransform(scrollYProgress, [0, r3.center, r4.start, r4.center, r5.start], [1, 1, 1, 1, 0.75]);
  // Card 5: Starts zooming out at center (last card also zooms out)
  const cardScale5 = useTransform(scrollYProgress, [0, r4.center, r5.start, r5.center, 1], [1, 1, 1, 1, 0.75]);
  const cardScale = [cardScale0, cardScale1, cardScale2, cardScale3, cardScale4, cardScale5].slice(0, itemCount);

  // Blur: Previous cards blur (0 → 20px) when next card enters, creating depth effect
  // Overlap: Previous card starts blurring when it reaches center, as next card begins entering
  // Card 0: No blur initially, starts blurring at center when card 1 begins entering
  const cardBlur0Value = useTransform(scrollYProgress, [0, r0.center, r1.start], [0, 0, 20]);
  const cardBlur0 = useTransform(cardBlur0Value, (b) => `blur(${b}px)`);
  // Card 1: No blur when active, starts blurring at center when card 2 begins entering
  const cardBlur1Value = useTransform(scrollYProgress, [0, r0.center, r1.start, r1.center, r2.start], [0, 0, 0, 0, 20]);
  const cardBlur1 = useTransform(cardBlur1Value, (b) => `blur(${b}px)`);
  // Card 2: Same pattern
  const cardBlur2Value = useTransform(scrollYProgress, [0, r1.center, r2.start, r2.center, r3.start], [0, 0, 0, 0, 20]);
  const cardBlur2 = useTransform(cardBlur2Value, (b) => `blur(${b}px)`);
  // Card 3: Same pattern
  const cardBlur3Value = useTransform(scrollYProgress, [0, r2.center, r3.start, r3.center, r4.start], [0, 0, 0, 0, 20]);
  const cardBlur3 = useTransform(cardBlur3Value, (b) => `blur(${b}px)`);
  // Card 4: Same pattern
  const cardBlur4Value = useTransform(scrollYProgress, [0, r3.center, r4.start, r4.center, r5.start], [0, 0, 0, 0, 20]);
  const cardBlur4 = useTransform(cardBlur4Value, (b) => `blur(${b}px)`);
  // Card 5: Starts blurring at center (last card also blurs)
  const cardBlur5Value = useTransform(scrollYProgress, [0, r4.center, r5.start, r5.center, 1], [0, 0, 0, 0, 20]);
  const cardBlur5 = useTransform(cardBlur5Value, (b) => `blur(${b}px)`);
  const cardBlur = [cardBlur0, cardBlur1, cardBlur2, cardBlur3, cardBlur4, cardBlur5].slice(0, itemCount);

  /**
   * ANIMATION 3: Icon crossfade
   * Properties: opacity [0→1→0], scale [0.9→1→0.9], blur [3px→0→3px]
   * Easing: easeInOutQuad
   * 
   * FIRST ICON starts visible (no scroll needed)
   */
  // First icon starts visible
  const iconOpacity0 = useTransform(scrollYProgress, [0, r0.center, r0.end], [1, 1, 0.8]);
  const iconOpacity1 = useTransform(scrollYProgress, [r1.start, r1.center, r1.end], [0, 1, 0.8]);
  const iconOpacity2 = useTransform(scrollYProgress, [r2.start, r2.center, r2.end], [0, 1, 0.8]);
  const iconOpacity3 = useTransform(scrollYProgress, [r3.start, r3.center, r3.end], [0, 1, 0.8]);
  const iconOpacity4 = useTransform(scrollYProgress, [r4.start, r4.center, r4.end], [0, 1, 0.8]);
  const iconOpacity5 = useTransform(scrollYProgress, [r5.start, r5.center, r5.end], [0, 1, 0.8]);
  const iconOpacity = [iconOpacity0, iconOpacity1, iconOpacity2, iconOpacity3, iconOpacity4, iconOpacity5].slice(0, itemCount);

  // First icon starts at scale 1
  const iconScale0 = useTransform(scrollYProgress, [0, r0.center, r0.end], [1, 1, 0.95]);
  const iconScale1 = useTransform(scrollYProgress, [r1.start, r1.center, r1.end], [0.9, 1, 0.95]);
  const iconScale2 = useTransform(scrollYProgress, [r2.start, r2.center, r2.end], [0.9, 1, 0.95]);
  const iconScale3 = useTransform(scrollYProgress, [r3.start, r3.center, r3.end], [0.9, 1, 0.95]);
  const iconScale4 = useTransform(scrollYProgress, [r4.start, r4.center, r4.end], [0.9, 1, 0.95]);
  const iconScale5 = useTransform(scrollYProgress, [r5.start, r5.center, r5.end], [0.9, 1, 0.95]);
  const iconScale = [iconScale0, iconScale1, iconScale2, iconScale3, iconScale4, iconScale5].slice(0, itemCount);

  /**
   * ANIMATION 6: Parallax background motion
   * Properties: translateY foreground [0→20px], background [0→-40px]
   * Easing: easeOutSine
   */
  const iconParallaxY0 = useTransform(scrollYProgress, [r0.start, r0.end], [0, -40]);
  const iconParallaxY1 = useTransform(scrollYProgress, [r1.start, r1.end], [0, -40]);
  const iconParallaxY2 = useTransform(scrollYProgress, [r2.start, r2.end], [0, -40]);
  const iconParallaxY3 = useTransform(scrollYProgress, [r3.start, r3.end], [0, -40]);
  const iconParallaxY4 = useTransform(scrollYProgress, [r4.start, r4.end], [0, -40]);
  const iconParallaxY5 = useTransform(scrollYProgress, [r5.start, r5.end], [0, -40]);
  const iconParallaxY = [iconParallaxY0, iconParallaxY1, iconParallaxY2, iconParallaxY3, iconParallaxY4, iconParallaxY5].slice(0, itemCount);

  // Handle tab click - navigate to the center of the clicked card
  const handleTabClick = (index: number) => {
    if (!cardsSectionRef.current || !scrollTriggerRef.current || index < 0 || index >= itemCount) return;
    
    // Get the range for the clicked card
    const targetRange = ranges[index];
    if (!targetRange) return;
    
    // Use the center point of the card for best visibility
    const targetProgress = targetRange.center;
    
    // Calculate scroll position based on ScrollTrigger setup
    const triggerElement = cardsSectionRef.current;
    const scrollDistance = scrollHeight * (window.innerHeight / 100);
    
    // Get the trigger's start position (when ScrollTrigger activates)
    const rect = triggerElement.getBoundingClientRect();
    const triggerStartScroll = window.scrollY + rect.top;
    
    // Calculate target scroll: trigger start + (progress * scroll distance)
    const targetScroll = triggerStartScroll + (targetProgress * scrollDistance);
    
    // Custom smooth scroll with configurable speed
    // tabClickScrollSpeed: higher = slower/more smooth, lower = faster
    const startScroll = window.scrollY;
    const distance = targetScroll - startScroll;
    const duration = Math.max(300, Math.abs(distance) * tabClickScrollSpeed); // Min 300ms, multiply by speed
    let startTime: number | null = null;
    
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    const animateScroll = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easeInOutCubic(progress);
      window.scrollTo(0, startScroll + distance * easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  };

  // Fallback for reduced motion
  if (shouldReduceMotion) {
    return (
      <div className={`relative ${className || ''}`} style={style}>
        {backgroundElement && (
          <div className="absolute inset-0 z-0">
            {backgroundElement}
          </div>
        )}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="space-y-8">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16">
                    {(() => {
                      // Check if icon is a Media object
                      const isMediaObject = typeof item.icon === 'object' && item.icon !== null && 'url' in item.icon;
                      const isStringUrl = typeof item.icon === 'string' && item.icon.trim() !== '';
                      
                      if (isMediaObject && typeof item.icon === 'object') {
                        return (
                          <Media
                            resource={item.icon as MediaType}
                            fill
                            imgClassName="object-contain"
                          />
                        );
                      }
                      
                      if (isStringUrl && !imageErrors.has(item.id)) {
                        return (
                          <SafeImage
                            src={item.icon}
                            alt={item.title}
                            fill
                            className="object-contain"
                            onError={() => handleImageError(item.id)}
                          />
                        );
                      }
                      
                      return (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                          <Camera className="text-gray-400 dark:text-gray-600" size={24} />
                        </div>
                      );
                    })()}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-normal text-gray-900 prose prose-md md:prose-md">
                    {item.title}
                  </h3>
                </div>
                <div className="text-base leading-relaxed prose prose-md md:prose-md">
                  {renderDescription(item.description)}
                </div>
              </div>
            ))}
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full tabs-scroll-container ${className || ''}`}
      style={{
        overflow: 'visible',
        position: 'relative',
        zIndex: 1, // Ensure proper stacking context
        isolation: 'isolate', // Create new stacking context
        ...style
      }}
    >
      {/* Children content at the top */}
      {children && (
        <div className="relative z-10 w-full">
          {children}
        </div>
      )}

      {/* Cards section that will be pinned */}
      <div
        ref={cardsSectionRef}
        className="relative w-full"
        style={{
          /**
           * ARCHITECTURE: Tall container (~400-500vh)
           * Creates scroll space for pinning
           * pinSpacing: true in ScrollTrigger will add proper spacing
           */
          height: `${scrollHeight}vh`,
          overflow: 'visible',
          position: 'relative',
          zIndex: 1, // Ensure it's in the same stacking context
        }}
      >
        {/**
         * ANIMATION 4: Section pinning
         * Trigger: Start of cards section
         * Properties: position fixed
         * Duration: entire scroll distance
         */}
        <div
          ref={pinnedRef}
          className="relative w-full"
          style={{
            // GSAP will pin this element - contains both cards and tabs
            height: '100vh',
            overflow: 'hidden', // Prevent content from adjacent sections from showing
            zIndex: 1, // Lower z-index so subsequent blocks can appear after
            backgroundColor: 'transparent', // Will be covered by backgroundElement
            display: 'flex',
            flexDirection: 'column',
          }}
        >
        {/* Background from section - merges with landing zone from previous section */}
        {backgroundElement ? (
          <div className="absolute inset-0 z-0" style={{ overflow: 'hidden' }}>
            {backgroundElement}
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 to-white" style={{ overflow: 'hidden' }}>
            {/* Fallback gradient if no section background */}
          </div>
        )}

        {/* Layered cards container - centered, takes remaining space */}
        <div
          className="relative w-full flex-1 flex items-center justify-center px-4 md:px-8"
          style={{
            paddingTop: landingZoneEnabled ? `${landingZoneHeight * 0.5}vh` : 0,
            zIndex: 1, // Keep within the pinned element's stacking context
            minHeight: 0, // Allow flexbox to shrink if needed
          }}
        >

          <div className="relative w-full h-full flex items-center justify-center" style={{ overflow: 'visible', position: 'relative' }}>
            {items.map((item, index) => {
              /**
               * ANIMATION 2: Scroll-triggered layer sequence
               * Each layer appears from bottom, stacks on top with higher z-index
               */
              const isActive = activeIndex === index;

              return (
                <motion.div
                  key={item.id}
                  className="absolute"
                  style={{
                    /**
                     * Z-INDEX STACKING: Later items have higher z-index
                     * Item 0: z-index 1
                     * Item 1: z-index 2
                     * Item 2: z-index 3
                     * etc.
                     */
                    top: '50%',
                    left: '50%',
                    width: '100%',
                    maxWidth: '80rem', // max-w-7xl equivalent
                    zIndex: index + 1,
                    transformOrigin: 'center center',
                    willChange: enableGPU ? 'transform, opacity, filter' : 'auto',
                    pointerEvents: isActive ? 'auto' : 'none',
                    x: cardX,
                    y: cardYCombined[index],
                    opacity: cardOpacity[index],
                    scale: cardScale[index],
                    filter: cardBlur[index] as any
                  }}
                >
                  {/* Card with icon and text - constrained width */}
                  <div className="w-full bg-white rounded-2xl overflow-hidden" style={{ transform: 'none' }}>
                    <div className={`grid grid-cols-1 md:grid-cols-2 min-h-[600px] ${imagePosition === 'right' ? 'md:grid-flow-col-dense' : ''}`}>
                      {/* Image section - position based on config */}
                      <div className={`flex items-center justify-center p-12 ${imagePosition === 'right' ? 'md:col-start-2' : ''}`}>
                        <div className="relative w-full max-w-sm aspect-square">
                          {(() => {
                            // Check if icon is a Media object
                            const isMediaObject = typeof item.icon === 'object' && item.icon !== null && 'url' in item.icon;
                            const isStringUrl = typeof item.icon === 'string' && item.icon.trim() !== '';
                            
                            if (isMediaObject && typeof item.icon === 'object') {
                              return (
                                <Media
                                  resource={item.icon as MediaType}
                                  fill
                                  imgClassName="object-contain"
                                  sizes="(max-width: 768px) 300px, 500px"
                                  priority={index === 0}
                                />
                              );
                            }
                            
                            if (isStringUrl && !imageErrors.has(item.id)) {
                              return (
                                <SafeImage
                                  src={item.icon}
                                  alt={item.title}
                                  fill
                                  className="object-contain"
                                  sizes="(max-width: 768px) 300px, 500px"
                                  priority={index === 0}
                                  onError={() => handleImageError(item.id)}
                                />
                              );
                            }
                            
                            return (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <Camera className="text-gray-400 dark:text-gray-600" size={64} />
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Text content - position based on config */}
                      <div className={`flex flex-col justify-center p-8 md:p-12 ${imagePosition === 'right' ? 'md:col-start-1 md:row-start-1' : ''}`}>
                        <h3 className="text-3xl md:text-4xl font-normal text-gray-900 mb-4 prose prose-md md:prose-md">
                          {item.title}
                        </h3>
                        <div className="mb-6">
                          {renderDescription(item.description)}
                        </div>
                        {item.cta && (
                          <div className="mt-4">
                            {renderCTA(item.cta)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/**
         * ANIMATION 5: Progress indicator (tabs) - fixed at bottom of pinned section
         * Tabs stay fixed at bottom while cards scroll through
         */}
        {!isEditing && (
          <div
            className="relative w-full flex justify-center pb-8 z-10"
            style={{
              flexShrink: 0, // Don't shrink, always stay at bottom
              zIndex: 10, // Above cards
            }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-2 py-2 flex gap-2">
              {items.map((item, index) => (
                <motion.button
                  key={item.id}
                  className="px-4 py-2 rounded-full font-medium text-sm transition-all duration-300"
                  style={{
                    backgroundColor: activeIndex === index ? '#0A1F44' : 'transparent',
                    color: activeIndex === index ? '#ffffff' : '#6B7280',
                    scale: activeIndex === index ? 1 : 0.95,
                    opacity: activeIndex === index ? 1 : 0.7
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTabClick(index)}
                  aria-label={`View ${item.title}`}
                  aria-current={activeIndex === index ? 'true' : undefined}
                >
                  {item.title}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

