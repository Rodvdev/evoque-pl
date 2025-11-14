'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { BaseScrollProps, ScrollItem } from '../types';
import { TextColumn } from './TextColumn';
import { ImageColumn } from './ImageColumn';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Camera } from 'lucide-react';

// Register GSAP plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Text Image Scroll Variant - Text on left, images on right with scroll-triggered fade
 * 
 * ANIMATION BREAKDOWN (GSAP-based):
 * 1. Text items fade in/out as they scroll vertically on left side
 * 2. Images crossfade on right side (pinned position, centered vertically)
 * 3. Smooth transitions between items using GSAP ScrollTrigger
 * 
 * ARCHITECTURE:
 * - Two-column layout (text left, image right)
 * - Image panel is pinned and centered vertically (always at center of viewport)
 * - Each item gets scroll space based on duration config
 * - Text scrolls vertically, images crossfade in pinned position
 */
export function TextImageScroll({
  config,
  backgroundElement,
  className,
  style,
  isEditing = false,
  children
}: BaseScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const emptyDivRef = useRef<HTMLDivElement>(null);
  const textItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imageItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  
  // Get items from config
  const items: ScrollItem[] = useMemo(() => config.items || [], [config.items]);
  const itemCount = items.length;
  const enableGPU = config.useGPU !== false;
  const duration = config.duration ?? 800; // Scroll distance per item in pixels
  const title = config.title;
  const reducedMotion = config.reducedMotion || false;
  const enableOnMobile = config.enableOnMobile ?? true;
  
  // Check for reduced motion preference
  const shouldReduceMotion = reducedMotion || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  
  // Check for mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Calculate total scroll height
  // Each item gets duration pixels of scroll space
  const itemScrollHeight = itemCount * duration;
  const totalScrollHeight = itemScrollHeight;
  
  // Active index tracking
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Setup GSAP ScrollTrigger animations
  useEffect(() => {
    if (!containerRef.current || !pinnedRef.current || isEditing || shouldReduceMotion || itemCount === 0) {
      return;
    }
    
    // Check mobile
    if (isMobile && !enableOnMobile) {
      return;
    }
    
    const container = containerRef.current;
    const pinned = pinnedRef.current;
    
    // Calculate scroll distance for main animation
    const scrollDistance = totalScrollHeight;
    
    // Add extra distance at the end to allow smooth unpinning transition
    const extraUnpinDistance = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 500;
    const finalScrollDistance = scrollDistance + extraUnpinDistance;
    
    // Pin the viewport section
    // Use 'top top' for proper pinning behavior
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: `+=${finalScrollDistance}`,
      pin: pinned,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onLeave: () => {
        // When leaving pinned state, ensure smooth transition
        // Don't clear transforms immediately - let ScrollTrigger handle unpinning naturally
        // The pinSpacing should handle the spacing correctly
      },
      onEnterBack: () => {
        // Smooth re-entry when scrolling back up
        // Refresh to ensure proper pinning state
        ScrollTrigger.refresh();
      },
      onLeaveBack: () => {
        // When scrolling back up past the start, ensure clean state
        ScrollTrigger.refresh();
      },
      onUpdate: (self) => {
        const progress = self.progress;
        
        // Clamp progress to prevent overshooting
        const clampedProgress = Math.min(1, Math.max(0, progress));
        
        // Calculate which item should be active
        const itemProgress = clampedProgress * itemCount;
        const currentItemIndex = Math.min(
          Math.floor(itemProgress),
          itemCount - 1
        );
        // Update state only when index actually changes to prevent unnecessary re-renders
        if (currentItemIndex !== activeIndex) {
          setActiveIndex(currentItemIndex);
        }
        
        // Determine which items to show (previous, active, next)
        const visibleStartIndex = Math.max(0, currentItemIndex - 1);
        const visibleEndIndex = Math.min(itemCount - 1, currentItemIndex + 1);
        
        // Calculate the continuous list offset (moves up smoothly as we scroll)
        // Each item takes up 35vh of space (30vh height + 5vh margin)
        const itemHeightVh = 35; // 30vh height + 5vh margin
        // Start items at adjusted position based on whether title exists
        // Position texts lower (down in Y) to center them in their container
        // When title exists, start items lower to account for title space and center them
        const containerStartVh = title ? 20 : 25; // Start position from top (lower = more down)
        // Smooth translation with slight increase for more visible movement
        const translationMultiplier = 1.1;
        
        // Convert vh to pixels for GSAP (GSAP uses pixels, not vh)
        const vhToPx = window.innerHeight / 100;
        const itemHeight = itemHeightVh * vhToPx;
        const containerStart = containerStartVh * vhToPx;
        
        // Use smooth continuous progress instead of discrete index jumps
        // Convert to continuous progress through items (0 to itemCount-1)
        // Clamp to prevent going beyond the last item
        const smoothProgress = Math.min(itemProgress, itemCount - 1);
        const listOffsetVh = containerStartVh - (smoothProgress * itemHeightVh * translationMultiplier);
        const listOffset = listOffsetVh * vhToPx;
        
        // When near the end, prepare for smooth unpinning
        // Don't interfere with ScrollTrigger's natural unpinning mechanism
        // The pinSpacing and extraUnpinDistance should handle the transition smoothly
        
        // Animate empty div (moves with the list)
        if (emptyDivRef.current) {
          // Empty div is positioned before the first item (at -1 * itemHeight)
          const emptyDivBaseYVh = -itemHeightVh;
          // Apply smooth continuous movement using the same offset as text items
          const emptyDivYVh = listOffsetVh + emptyDivBaseYVh;
          const emptyDivY = emptyDivYVh * vhToPx;
          gsap.set(emptyDivRef.current, {
            y: emptyDivY,
            willChange: enableGPU ? 'transform' : 'auto'
          });
        }
        
        // Animate text items
        textItemsRef.current.forEach((textItem, index) => {
          if (!textItem) return;
          
          // Check if this item should be visible (only show previous, active, and next)
          const isVisible = index >= visibleStartIndex && index <= visibleEndIndex;
          
          // Calculate item progress (0 to 1 for each item)
          const itemStart = index / itemCount;
          const itemEnd = (index + 1) / itemCount;
          const itemRange = itemEnd - itemStart;
          const itemProgress = Math.max(0, Math.min(1, (progress - itemStart) / itemRange));
          
          // Opacity: fade in/out for visible items, never reach 0
          // All texts should reach full opacity when they reach the centered position (where they pin)
          // The centered position is when itemProgress = 0.5 (middle of the item's scroll range)
          // Items start from a minimum opacity and reach full opacity, never going to 0
          const minOpacity = 0.3; // Minimum opacity - never go below this
          let opacity = minOpacity;
          if (isVisible) {
            if (index === currentItemIndex) {
              // Active item: reaches full opacity at centered position (itemProgress = 0.5)
              // Fade in as it approaches center, peak at center (0.5), fade out as it leaves (but never below minOpacity)
              if (itemProgress <= 0.5) {
                // Fade in from minOpacity to 1 as it approaches center (0 to 0.5)
                opacity = minOpacity + (itemProgress * 2 * (1 - minOpacity)); // minOpacity to 1
              } else {
                // Fade out from 1 to minOpacity as it leaves center (0.5 to 1)
                opacity = 1 - ((itemProgress - 0.5) * 2 * (1 - minOpacity)); // 1 to minOpacity
              }
              opacity = Math.max(minOpacity, Math.min(1, opacity));
            } else {
              // Previous or next item: reduced opacity, but never below minOpacity
              opacity = itemProgress < 0.5 
                ? minOpacity + (itemProgress * 0.7 * (1 - minOpacity))  // minOpacity to ~0.8
                : 1 - ((itemProgress - 0.5) * 0.7 * (1 - minOpacity)); // ~0.8 to minOpacity
              opacity = Math.max(minOpacity, Math.min(0.8, opacity));
            }
          } else {
            // Items outside visible range still maintain minimum opacity
            opacity = minOpacity;
          }
          
          // Y position: smooth continuous movement based on scroll progress
          // Items are positioned absolutely at index * itemHeight, then offset to position items
          // Container start is at adjusted position based on title
          // Use smooth continuous progress instead of discrete index for fluid movement
          // All items move together smoothly as we scroll
          const itemPositionVh = index * itemHeightVh;
          // Smooth offset: start position minus the continuous progress through all items
          // All items move up together smoothly as we scroll
          const smoothOffsetVh = containerStartVh - (smoothProgress * itemHeightVh * translationMultiplier);
          // Each item's offset is relative to its base position
          const offsetVh = smoothOffsetVh;
          // Convert to pixels for GSAP
          const yOffset = offsetVh * vhToPx;
          
          // Scale: slight scale effect when active
          // Items reach full scale (1) when they're at the centered position
          const scale = (index === currentItemIndex && isVisible)
            ? (itemProgress < 0.5
              ? 0.95 + (itemProgress * 0.1)  // 0.95 to 1
              : 1 - ((itemProgress - 0.5) * 0.1)) // 1 to 0.95
            : 0.95;
          
          gsap.set(textItem, {
            opacity: opacity,
            y: yOffset,
            scale: scale,
            transformOrigin: 'center center',
            willChange: enableGPU ? 'transform, opacity' : 'auto',
            pointerEvents: isVisible ? 'auto' : 'none',
            visibility: isVisible ? 'visible' : 'hidden'
          });
        });
        
        // Show image panel when scroll starts (or immediately if progress is 0)
        if (imagePanelRef.current) {
          const panelOpacity = progress >= 0 ? 1 : 0;
          const panelVisibility = progress >= 0 ? 'visible' : 'hidden';
          gsap.set(imagePanelRef.current, {
            opacity: panelOpacity,
            visibility: panelVisibility
          });
        }
        
        // Animate image items (crossfade in pinned position)
        imageItemsRef.current.forEach((imageItem, index) => {
          if (!imageItem) return;
          
          // Calculate item progress (0 to 1 for each item)
          const itemStart = index / itemCount;
          const itemEnd = (index + 1) / itemCount;
          const itemRange = itemEnd - itemStart;
          const itemProgress = Math.max(0, Math.min(1, (progress - itemStart) / itemRange));
          
          // Opacity: crossfade between images
          const opacity = itemProgress < 0.5
            ? itemProgress * 2  // 0 to 1
            : 1 - ((itemProgress - 0.5) * 2); // 1 to 0
          
          // Scale: slight scale effect
          const scale = itemProgress < 0.5
            ? 0.9 + (itemProgress * 0.1)  // 0.9 to 1
            : 1 - ((itemProgress - 0.5) * 0.05); // 1 to 0.95
          
          // Rotation: subtle rotation effect
          const rotation = itemProgress < 0.5
            ? -5 + (itemProgress * 10)  // -5 to 0
            : 5 * ((itemProgress - 0.5) * 2); // 0 to 5
          
          // Y position: slight parallax (images stay centered, slight movement)
          const y = itemProgress < 0.5
            ? 0
            : -20 * ((itemProgress - 0.5) * 2);
          
          // Use xPercent and yPercent to maintain centering, then add y offset
          gsap.set(imageItem, {
            opacity: Math.max(0, Math.min(1, opacity)),
            scale: scale,
            rotation: rotation,
            xPercent: -50,
            yPercent: -50,
            y: y,
            transformOrigin: 'center center',
            willChange: enableGPU ? 'transform, opacity' : 'auto'
          });
        });
      }
    });
    
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, [itemCount, isEditing, shouldReduceMotion, totalScrollHeight, itemScrollHeight, enableGPU, enableOnMobile, isMobile, title]);
  
  // Fallback for reduced motion or editing mode
  if (shouldReduceMotion || isEditing || itemCount === 0) {
    return (
      <div className={`relative ${className || ''}`} style={style}>
        {backgroundElement && (
          <div className="absolute inset-0 z-0">
            {backgroundElement}
          </div>
        )}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-16">
          {title && (
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-12 prose prose-md md:prose-md">
              {title}
            </h2>
          )}
          <div className="space-y-8">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/2">
                  <h3 className="text-2xl md:text-3xl font-normal mb-4 prose prose-md md:prose-md">
                    {item.title}
                  </h3>
                  <p className="text-base leading-relaxed prose prose-md md:prose-md">
                    {typeof item.description === 'string' ? item.description : String(item.description)}
                  </p>
                </div>
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="relative w-full max-w-md aspect-square">
                    {item.icon && item.icon.trim() !== '' ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.icon}
                        alt={item.title}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <Camera className="text-gray-400 dark:text-gray-600" size={48} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {children}
      </div>
    );
  }
  
  // Calculate container height to match scroll distance exactly
  // Use state to ensure consistent SSR/client rendering and avoid hydration mismatch
  const [containerHeight, setContainerHeight] = useState(totalScrollHeight + 500);
  
  useEffect(() => {
    // Update height after mount to match actual viewport
    if (typeof window !== 'undefined') {
      setContainerHeight(totalScrollHeight + window.innerHeight * 0.5);
    }
  }, [totalScrollHeight]);
  
  // Build style object without undefined values to prevent hydration mismatches
  const containerStyle: React.CSSProperties = {
    minHeight: `${containerHeight}px`,
    height: `${containerHeight}px`,
    overflow: 'visible',
    position: 'relative',
    top: 0,
    marginTop: 0,
    paddingTop: 0,
    width: '100%',
    ...style,  // Apply external styles after base styles
  };
  
  // Remove undefined values to ensure consistent SSR/client rendering
  Object.keys(containerStyle).forEach(key => {
    if (containerStyle[key as keyof React.CSSProperties] === undefined) {
      delete containerStyle[key as keyof React.CSSProperties];
    }
  });
  
  return (
      <div
        ref={containerRef}
        className={`relative w-full text-image-scroll-container ${className || ''}`}
        style={containerStyle}
      >
      {/* Background */}
      {backgroundElement && (
        <div className="absolute inset-0 z-0">
          {backgroundElement}
        </div>
      )}
      
      {/* Pinned viewport section */}
      <div
        ref={pinnedRef}
        className="relative w-full"
        style={{
          minHeight: '100vh',
          height: 'auto',
          overflow: 'visible',
          zIndex: 10,
          backgroundColor: 'transparent',
          position: 'relative',
          top: 0
        }}
      >
        {/* Content container */}
        <div className="relative z-10 w-full max-w-[1620px] mx-auto px-4 md:px-8 flex flex-col" style={{ minHeight: '100vh', height: title ? 'calc(100vh + 120px + 25vh + 600px)' : 'calc(100vh + 25vh + 600px)', overflow: 'visible', top: 0, paddingTop: '2rem' }}>
          {/* Title section */}
          {title && (
            <div className="w-full flex justify-center items-center mb-12 md:mb-16" style={{ paddingTop: '2rem', paddingBottom: '1rem', zIndex: 30 }}>
              <h2 className="text-xl md:text-2xl font-semibold text-center prose prose-md md:prose-md">
                {title}
              </h2>
            </div>
          )}
          
          {/* Two-column layout: text left, image right */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-8 flex-1 relative" style={{ overflow: 'visible', marginTop: 0 }}>
            {/* Text column - left side */}
            <div className="w-full md:w-[50%] max-w-lg pr-0 md:pr-4 z-20" style={{ overflow: 'hidden', position: 'relative', top: 0, height: '105vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: title ? '15vh' : '20vh' }}>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Empty div at the start to center first item */}
                <div 
                  ref={emptyDivRef}
                  style={{ 
                    minHeight: '30vh',
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    overflow: 'visible',
                    height: '30vh',
                    width: '100%',
                    top: '-35vh',
                    marginBottom: '5vh'
                  }} 
                />
                {items.map((item, itemIndex) => {
                  const index = itemIndex;
                  // Calculate initial offset to position first item near top
                  // Start items higher up to reduce whitespace
                  const itemHeight = 35; // 30vh height + 5vh margin
                  const translationMultiplier = 1.1; // Smooth translation with increased movement
                  const containerStart = title ? 20 : 25; // Start items at adjusted position based on title (lower = more down)
                  const initialOffset = containerStart - (0 * itemHeight * translationMultiplier); // Adjusted for index 0
                  return (
                    <div
                      key={item.id}
                      ref={(el) => {
                        textItemsRef.current[index] = el;
                      }}
                      style={{ 
                        minHeight: '30vh',
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'absolute',
                        overflow: 'visible',
                        height: '30vh',
                        width: '100%',
                        top: `${index * 35}vh`,
                        marginBottom: '5vh',
                        opacity: index === 0 ? 1 : 0,
                        transform: index === 0 ? `translateY(${initialOffset}vh) scale(1)` : 'translateY(0px) scale(1)',
                        willChange: enableGPU ? 'transform, opacity' : 'auto'
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%' }}>
                        <h3 className="text-2xl md:text-3xl font-normal mb-4 prose prose-md md:prose-md">
                          {item.title}
                        </h3>
                        <div>
                          {typeof item.description === 'string' ? (
                            <p className="text-base leading-relaxed prose prose-md md:prose-md">{item.description}</p>
                          ) : item.description && typeof item.description === 'object' && 'type' in item.description ? (
                            (() => {
                              const { type, content } = item.description;
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
                              return <p className="text-base leading-relaxed prose prose-md md:prose-md">{String(content)}</p>;
                            })()
                          ) : (
                            <p className="text-base leading-relaxed prose prose-md md:prose-md">{String(item.description)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Image column - right side (pinned at center, below title) */}
            <div 
              ref={imagePanelRef}
              className="w-full md:w-[50%] max-w-md pl-0 md:pl-4 text-image-pinned-panel"
              style={{
                position: 'absolute',
                top: title ? '5%' : '2%',
                right: '1rem',
                height: 'auto',
                minHeight: '600px',
                width: 'calc(50% - 1rem)',
                maxWidth: '28rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                overflow: 'visible',
                opacity: 0,
                visibility: 'hidden'
              }}
            >
              <div 
                className="w-full max-w-md" 
                style={{ 
                  aspectRatio: '1/1', 
                  position: 'relative',
                  width: '100%',
                  height: 'auto',
                  maxHeight: '600px',
                  maxWidth: '500px',
                  overflow: 'visible'
                }}
              >
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    ref={(el) => {
                      imageItemsRef.current[index] = el;
                    }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '100%',
                      height: '100%',
                      opacity: index === 0 ? 1 : 0,
                      transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
                      transformOrigin: 'center center',
                      willChange: enableGPU ? 'transform, opacity' : 'auto',
                      pointerEvents: activeIndex === index ? 'auto' : 'none'
                    }}
                  >
                    <div className="relative w-full h-full">
                      {item.icon && item.icon.trim() !== '' ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.icon}
                          alt={item.title}
                          className="object-contain w-full h-full"
                          style={{ width: '100%', height: '100%' }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <Camera className="text-gray-400 dark:text-gray-600" size={48} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Children content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}
