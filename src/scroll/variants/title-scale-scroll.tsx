'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { BaseScrollProps } from '../types';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Title Scale Scroll Variant - 3-Phase Animation
 *
 * ANIMATION BREAKDOWN (3 Phases):
 *
 * Phase 1: Initial State (0-25% scroll) - Visible & Biggest
 *    - Y position: 0vh (centered at top)
 *    - Scale: 1.8 (BIGGEST - hero size)
 *    - Opacity: 1 (fully visible)
 *    - Color: White
 *    - State: Title starts large and prominent at top of viewport
 *
 * Phase 2: Descending & Shrinking (25-50% scroll)
 *    - Y position: 0vh → 42vw (descends down)
 *    - Scale: 1.8 → 1.0 (shrinks to normal size)
 *    - Opacity: 1 (stays visible)
 *    - Color: White
 *    - Animation: Title moves down while shrinking
 *
 * Phase 3: Subtitle & Landing (50-100% scroll) - EARLIER START
 *    - Y position: 42vw → bottom (continues descending to landing zone)
 *    - Scale: 1.0 (stays at normal)
 *    - Opacity: 1 (fully visible)
 *    - Color: White → Dark (cross-fade during phase 3, starts at 50%)
 *    - Subtitle: Appears and fades in (starts at 50%)
 *    - Landing zone: Slides up from bottom (starts at 50%)
 *    - Final position: Lands at bottom of viewport (on landing zone)
 *
 * ADDITIONAL LAYERS:
 * 1. Background - gets pushed up by landing zone
 *    Background: Background from seed (can be video, image, color, svg, or gradient) that gets pushed up by landing zone
 *
 * ARCHITECTURE:
 * - PINNING ENABLED - viewport pinned until phase 3 starts (0.5), allows subtitle to appear earlier
 * - 150vh container height for smooth 3-phase animation
 * - Scroll offset: ['start start', 'end start'] (triggers when section hits viewport top)
 * - Pinning ends at 50% scroll progress (when subtitle appears) - earlier start for faster animation
 * - Title only moves DOWN, never up - lands at bottom of viewport on landing zone
 * - Three layers: background (from seed), text (3-phase animation), landing zone
 */
export function TitleScaleScroll({
  config,
  backgroundElement,
  className,
  style,
  isEditing = false,
  debugMode = false,
  children
}: BaseScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Get config options
  const title = config.title || 'Our Services';
  const subtitle = config.subtitle || 'We do more than answering your calls';
  const titleAnimationEnabled = config.titleAnimation?.enabled ?? true;

  // Gradient background and SVG icons configuration
  const gradientBackground = config.titleAnimation?.initialBackground || 'linear-gradient(135deg, #0A1F44 0%, #1a3a6b 50%, #2c5aa0 100%)';
  const overlayOpacity = config.titleAnimation?.overlayOpacity || 0.04;
  const textColor = config.titleAnimation?.textColor || '#FFFFFF'; // First color (white)
  const darkTextColor = config.titleAnimation?.darkTextColor || '#000000'; // Second color (black)
  const initialScale = config.titleAnimation?.initialScale || 1.8;
  const pinnedY = config.titleAnimation?.pinnedY || '42vw'; // Positive value moves down
  const exitY = config.titleAnimation?.exitY || '50vh';
  const containerHeight = config.titleAnimation?.containerHeight || 150; // 150vh for 4 phases
  const enableGPU = config.useGPU !== false;

  // Landing zone configuration (for title to land on)
  const landingZoneEnabled = config.landingZone?.enabled ?? true;
  const landingZoneHeight = config.landingZone?.height ?? 20;
  const landingZoneBackground = config.landingZone?.backgroundColor ?? 'transparent';
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
  
  // Check if background is a gradient (starts with 'linear-gradient' or 'radial-gradient')
  const isGradientBackground = typeof landingZoneBackground === 'string' && 
    (landingZoneBackground.startsWith('linear-gradient') || landingZoneBackground.startsWith('radial-gradient'));
  const separatorAfterEnabled = config.landingZone?.separatorAfter?.enabled ?? false;
  const separatorAfterHeight = config.landingZone?.separatorAfter?.height ?? 10;

  // Fallback background if not using animation
  const fallbackBackground = gradientBackground;

  // Scroll tracking - start when section hits viewport top
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  // THREE PHASES: 
  // Phase 1 (0-25%): Initial - title at top, large scale, white
  // Phase 2 (25-50%): Moving down + color change - title descends, scale reduces, white → black transition
  // Phase 3 (25-100%): Subtitle appears (starts at 25% when color change begins), landing zone pushes up, title continues descending to landing zone (color change complete)
  
  // Calculate landing position - title should be centered inside landing zone
  // Landing zone is at bottom: 0 with height: landingZoneHeight * 2 vh (2x for pushed distance)
  // Landing zone center is at: 100vh - landingZoneHeight from top (center of 2x height zone)
  // Title container uses justify-center, so content is centered at 50vh when y: 0
  // To center title inside landing zone, move container to: landingZoneCenter - 50vh
  const landingZoneCenter = 100 - landingZoneHeight; // Center of landing zone in vh (e.g., 80vh if landing zone config is 20vh, actual height is 40vh)
  const landingPositionOffset = landingZoneCenter - 50; // Offset to center title inside landing zone
  const landingPosition = exitY || `${landingPositionOffset}vh`; // Position container to center title inside landing zone
  
  // Convert pinnedY to vh for consistency (assuming 1vw ≈ 1vh for square-ish viewports, adjust if needed)
  // Extract numeric value from pinnedY (e.g., '42vw' -> 42)
  const pinnedYNumeric = parseFloat(pinnedY) || 42;
  // Convert vw to vh (approximate, assumes viewport aspect ratio is close to 1:1)
  // For more accuracy, we could use window.innerWidth/innerHeight, but for simplicity use 1:1 ratio
  const pinnedYVh = `${pinnedYNumeric}vh`; // Convert to vh for consistency
  
  // Extract numeric value from landingPosition to ensure monotonic sequence (only moves down)
  const landingPositionNumeric = parseFloat(landingPosition) || landingPositionOffset;
  const pinnedYVhNumeric = pinnedYNumeric;
  
  // Ensure landing position is always >= pinnedY to prevent upward movement
  // Use the maximum of both values to ensure title only moves down
  const finalPositionNumeric = Math.max(landingPositionNumeric, pinnedYVhNumeric);
  const finalPosition = `${finalPositionNumeric}vh`;
  
  // PHASE 1-3: Title Y position (only goes down, never up - monotonic increase)
  // Title reaches pinnedY position and stays fixed at the end of blue zone
  // Title should remain pinned at pinnedY position, not continue to landing zone
  // Start moving down earlier (at 0% instead of 25%)
  const titleYBase = useTransform(
    scrollYProgress,
    [0,    0.15,   0.4,   1.0],
    ['0vh', '0vh', pinnedYVh, pinnedYVh] // Moves to pinnedY and stays fixed at end of blue zone
  );

  // PHASE 1-3: Title scale - smooth transition to prevent jump
  // Scale completes gradually from 0.15 to 0.5 to ensure smooth transition with Y movement
  const titleScale = useTransform(
    scrollYProgress,
    [0,           0.15,        0.5,   1.0],
    [initialScale, initialScale, 1.0,  1.0] // Gradual completion prevents jump
  );

  // PHASE 1-3: Title opacity (stays fully visible)
  const titleOpacity = useTransform(
    scrollYProgress,
    [0,  1.0],
    [1,  1]
  );

  // PHASE 2: Color transition merged with moving down (white → black during descent) - smooth crossfade
  // Starts when title begins moving down (15%) and completes by subtitle appearance (40%)
  // Perfect overlap ensures title is always visible (white + black opacity always >= 1.0)
  const titleGreenOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.3, 0.4, 1.0],
    [1, 1, 0.5, 0, 0] // Starts fading when title moves down (15%), completes by subtitle (40%)
  );

  const titleBlueOpacity = useTransform(
    scrollYProgress,
    [0.15, 0.3, 0.4, 1.0],
    [0, 0.5, 1, 1] // Starts fading in when title moves down (15%), completes by subtitle (40%)
  );

  // Subtitle appears when title color starts changing (0.15) - synchronized with color change
  const subtitleOpacity = useTransform(scrollYProgress, [0.15, 1.0], [0, 1]);
  const subtitleY = useTransform(scrollYProgress, [0.15, 1.0], ['100%', '0%']);

  // Landing zone slides up from bottom and pushes background up
  // Starts appearing at 0.15, exactly when title color starts changing
  const landingZoneY = useTransform(
    scrollYProgress,
    [0.15, 1.0],
    [`${landingZoneHeight * 2}vh`, '0vh'] // Slides up from below viewport (2x height)
  );

  // Title stays fixed at pinnedY position (end of blue zone)
  // Title does not move with landing zone - it remains pinned at the end of blue zone
  const titleY = titleYBase;

  // Background gets pushed up as landing zone appears (starts when color change begins at 0.15)
  const backgroundPushY = useTransform(
    scrollYProgress,
    [0.15, 1.0],
    ['0vh', `-${landingZoneHeight * 2}vh`] // Pushes background up by 2x landing zone height
  );

  // Setup GSAP pinning for the section
  // Pinning ends smoothly to allow smooth transition to next section
  useEffect(() => {
    if (!containerRef.current || !pinnedRef.current || isEditing || shouldReduceMotion) {
      return;
    }

    // Calculate scroll distance - pin until title reaches final position
    // Use full container height (including separator) for smooth transition
    // Add extra spacing for smooth transition to next section
    const totalHeight = containerHeight + (separatorAfterEnabled ? separatorAfterHeight : 0);
    const scrollDistance = totalHeight * (window.innerHeight / 100);
    const extraSpacing = 20 * (window.innerHeight / 100); // Extra 20vh for smooth transition

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: `+=${scrollDistance + extraSpacing}`, // Add extra spacing for smooth transition
      pin: pinnedRef.current,
      pinSpacing: true, // Automatically adds spacing equal to pinned element height
      anticipatePin: 1,
      invalidateOnRefresh: true,
      markers: debugMode
    });

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, [isEditing, shouldReduceMotion, containerHeight, debugMode]);

  // Fallback for reduced motion
  if (shouldReduceMotion) {
    return (
      <div className={`relative ${className || ''}`} style={style}>
        <div
          className="relative w-full min-h-screen flex items-center justify-center"
          style={{ background: fallbackBackground }}
        >
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal mb-6 prose prose-md md:prose-md" style={{ color: textColor }}>
              {title}
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto prose prose-md md:prose-md" style={{ color: textColor, opacity: 0.9 }}>
              {subtitle}
            </p>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Calculate total container height including separator for smooth transition
  const totalContainerHeight = containerHeight + (separatorAfterEnabled ? separatorAfterHeight : 0);

  return (
    <div
      ref={containerRef}
      className={`relative w-full title-scale-scroll-container ${className || ''}`}
      data-parallax="trigger"
      style={{
        height: `${totalContainerHeight}vh`,
        overflow: 'visible',
        position: 'relative',
        ...style
      }}
    >
      {/* Pinned viewport */}
      <div
        ref={pinnedRef}
        className="relative w-full"
        style={{
          height: '100vh',
          overflow: 'visible',
          zIndex: 200
        }}
      >
        {/* LAYER 1: Background - gets pushed up by landing zone */}
        {titleAnimationEnabled ? (
          <>
            {/* Background from seed (can be video, image, color, svg, or gradient) - gets pushed up by landing zone */}
            {backgroundElement ? (
              <motion.div
                className="absolute inset-0 z-0"
                style={{
                  y: backgroundPushY,
                  willChange: enableGPU ? 'transform' : 'auto'
                }}
              >
                {backgroundElement}
              </motion.div>
            ) : (
              /* Fallback to config background color or black if no backgroundElement */
              <motion.div
                className="absolute inset-0 z-0"
                style={{
                  backgroundColor: config.titleAnimation?.initialBackground || '#000000',
                  y: backgroundPushY,
                  willChange: enableGPU ? 'transform' : 'auto'
                }}
              />
            )}
          </>
        ) : (
          /* Fallback background if animation disabled */
          <div
            className="absolute inset-0 z-0"
            style={{
              background: fallbackBackground
            }}
          >
            {backgroundElement}
          </div>
        )}

        {/* LAYER 3: Text content (4-phase animation) */}
        {titleAnimationEnabled && (
          <motion.div
            data-parallax="text"
            className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-8"
            style={{
              y: titleY,
              willChange: enableGPU ? 'transform' : 'auto',
              pointerEvents: 'none',
              zIndex: 100 // Higher than landing zone (z-50) to land on top
            }}
          >
            {/* Title with 4-phase animation + color transition */}
            <motion.div
              className="relative"
              style={{
                scale: titleScale,
                opacity: titleOpacity,
                y: 0, // Keep Y at 0 for this element, parent handles movement
                willChange: enableGPU ? 'transform, opacity' : 'auto',
                transformOrigin: 'center center'
              }}
            >
              {/* First color text layer (fades out during transition) */}
              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-center prose prose-md md:prose-md"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: textColor, // First color (white)
                  opacity: titleGreenOpacity,
                  willChange: enableGPU ? 'opacity' : 'auto',
                  whiteSpace: 'nowrap',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}
              >
                {title}
              </motion.h2>

              {/* Second color text layer (fades in during transition) */}
              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-center prose prose-md md:prose-md"
                style={{
                  position: 'relative',
                  color: darkTextColor, // Second color (black)
                  opacity: titleBlueOpacity,
                  willChange: enableGPU ? 'opacity' : 'auto',
                  whiteSpace: 'nowrap',
                  textShadow: '0 1px 5px rgba(0,0,0,0.1)'
                }}
              >
                {title}
              </motion.h2>
            </motion.div>

            {/* Subtitle with delayed fade + slide up - black color */}
            {subtitle && (
              <motion.p
                className="text-base md:text-lg text-center max-w-3xl prose prose-md md:prose-md"
                style={{
                  color: darkTextColor, // Black color for subtitle
                  opacity: subtitleOpacity,
                  y: subtitleY,
                  willChange: enableGPU ? 'transform, opacity' : 'auto',
                  textShadow: '0 1px 5px rgba(0,0,0,0.1)'
                }}
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Landing Zone - slides up from bottom and pushes background up */}
        {landingZoneEnabled && (
          <motion.div
            className="absolute left-0 right-0 z-50"
            data-landing-zone="true"
            style={{
              bottom: 0, // Position at bottom of 100vh pinned viewport
              height: `${landingZoneHeight * 2}vh`, // Size matches pushed distance (2x)
              // Use background for gradients, backgroundColor for solid colors
              ...(isGradientBackground 
                ? { background: landingZoneBackground }
                : { backgroundColor: landingZoneBackground }
              ),
              display: 'flex',
              alignItems: 'center',
              justifyContent: landingZoneJustify,
              paddingTop: `${landingZonePadding.top ?? 2}rem`,
              paddingBottom: `${landingZonePadding.bottom ?? 2}rem`,
              paddingLeft: `${landingZonePadding.left ?? 4}rem`,
              paddingRight: `${landingZonePadding.right ?? 4}rem`,
              pointerEvents: 'none',
              y: landingZoneY, // Slides up from bottom
              willChange: enableGPU ? 'transform' : 'auto'
            }}
          >
              {landingZoneShowTitle && landingZoneTitleText && (
              <h2
                className="text-2xl md:text-3xl font-semibold prose prose-md md:prose-md"
                style={{
                  color: landingZoneTitleColor,
                  textAlign: landingZoneAlignment as React.CSSProperties['textAlign']
                }}
              >
                {landingZoneTitleText}
              </h2>
            )}
          </motion.div>
        )}
      </div>

      {/* Separator after landing zone - creates space before next section */}
      {separatorAfterEnabled && (
        <div
          className="relative w-full z-40"
          style={{
            height: `${separatorAfterHeight}vh`,
            backgroundColor: 'transparent',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Children content (rendered below pinned section) */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}

      {/* Debug overlay */}
      {debugMode && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontFamily: 'monospace',
            maxWidth: '300px'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>3-Phase Animation</div>
          <div>Phase 1 (0-25%): Initial</div>
          <div style={{ fontSize: '10px', paddingLeft: '10px', color: '#aaa' }}>
            0vh, scale {initialScale}, opacity 1, white
          </div>
          <div style={{ marginTop: '4px' }}>Phase 2 (25-50%): Descending ↓</div>
          <div style={{ fontSize: '10px', paddingLeft: '10px', color: '#aaa' }}>
            0vh → +{pinnedY} (down), scale {initialScale}→1.0, white
          </div>
          <div style={{ marginTop: '4px' }}>Phase 3 (50-100%): Landing & Subtitle</div>
          <div style={{ fontSize: '10px', paddingLeft: '10px', color: '#aaa' }}>
            +{pinnedY} → bottom (continues down), white→dark, subtitle appears (earlier)
          </div>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #555' }}>
            Container: {containerHeight}vh (pinned)
          </div>
          <div>Overlay: {overlayOpacity} (static)</div>
        </div>
      )}
    </div>
  );
}
