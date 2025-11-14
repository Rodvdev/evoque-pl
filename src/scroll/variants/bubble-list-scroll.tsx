'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { BaseScrollProps } from '../types';
import { Skeleton } from '@/components/ui/skeleton';
import { BRAND_COLORS } from '@/lib/brand-colors';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas } from '@react-three/fiber';
import { Balloon3D } from './Balloon3D';

// Register GSAP plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Brand colors for balloons
const BRAND_BLUE = BRAND_COLORS.BLUE; // #0077A7
const BRAND_BLUE_LIGHT = '#0077A780'; // 50% opacity

// Balloon repulsion constants (like magnets - same charge repels)
const REPULSION_RADIUS = 200; // Distance at which balloons start repelling
const REPULSION_STRENGTH = 80; // Maximum repulsion force
const MIN_DISTANCE = 150; // Minimum distance balloons should maintain

// Gravity constants (pulls balloons toward bottom center)
const GRAVITY_STRENGTH = 50; // Strength of gravity pull toward bottom center
const GRAVITY_RADIUS = 1000; // Distance at which gravity affects balloons

// Coordinate conversion constant (consistent across all conversions)
const SCALE_FACTOR_2D_TO_3D = 0.012; // Convert pixels to Three.js units

// Calculate organic/random positions for balloons
// Creates a natural spread pattern around the center
function calculateOrganicPositions(count: number, containerWidth: number, containerHeight: number) {
  const positions: Array<{ x: number; y: number; originalX: number; originalY: number }> = [];
  
  if (count === 0) return positions;
  
  // Center of container
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  
  // Spread area - elliptical area for organic feel
  const spreadRadiusX = Math.min(containerWidth * 0.5, 600); // Horizontal spread
  const spreadRadiusY = Math.min(containerHeight * 0.5, 500); // Vertical spread
  
  // Use deterministic "random" based on index for consistent results
  // This creates a natural-looking spread without true randomness
  for (let i = 0; i < count; i++) {
    // Create pseudo-random angles and distances using index
    // Use golden angle (137.5 degrees) for natural distribution
    const goldenAngle = 137.508;
    const angle = (i * goldenAngle) % 360;
    const angleRad = (angle * Math.PI) / 180;
    
    // Distance from center - increases with index for spiral effect
    const normalizedIndex = i / count;
    const distanceFactor = 0.5 + (normalizedIndex * 1.0); // Start closer, spread outward more
    const distanceX = spreadRadiusX * distanceFactor;
    const distanceY = spreadRadiusY * distanceFactor;
    
    // Add some variation for organic feel
    const variationX = (Math.sin(i * 0.5) * 0.3 + Math.cos(i * 0.7) * 0.2) * spreadRadiusX * 0.2;
    const variationY = (Math.cos(i * 0.6) * 0.3 + Math.sin(i * 0.8) * 0.2) * spreadRadiusY * 0.2;
    
    // Calculate position
    const x = centerX + Math.cos(angleRad) * distanceX + variationX;
    const y = centerY + Math.sin(angleRad) * distanceY + variationY;
      
      positions.push({
        x,
        y,
        originalX: x,
        originalY: y
      });
  }
  
  return positions;
}

/**
 * Balloon List Scroll Variant
 *
 * Features:
 * - Balloon list with intercalated blue colors (full and light opacity)
 * - Scroll-triggered animation with repulsion physics
 */
export function BubbleListScroll({
  config,
  backgroundElement,
  className,
  style,
  isEditing = false,
  children
}: BaseScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const textColumnRef = useRef<HTMLDivElement>(null);
  const balloonColumnRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const textItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const finalTextRef = useRef<HTMLDivElement | null>(null);
  
  // State for balloon 3D positions (updated by GSAP scroll animation)
  const [balloonStates, setBalloonStates] = useState<Map<number, {
    x: number;
    y: number;
    z: number;
    opacity: number;
    scale: number;
  }>>(new Map());
  
  // Ref to track current balloon states (to avoid infinite loops in ScrollTrigger)
  const balloonStatesRef = useRef<Map<number, {
    x: number;
    y: number;
    z: number;
    opacity: number;
    scale: number;
  }>>(new Map());
  
  // Active index tracking
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Get config values - must be declared before useMemo
  const headline = config.subtitle || '';
  const subhead = config.title || '';
  const items = config.items || [];
  const hasItems = items.length > 0;
  const skeletonItemCount = 6;
  const duration = config.duration ?? 800; // Scroll distance per item in pixels
  const reducedMotion = config.reducedMotion || false;
  const enableOnMobile = config.enableOnMobile ?? true;
  const enableGPU = config.useGPU !== false;
  const infinitePhaseText = config.infinitePhaseText || ''; // Text to display with extra balloons
  
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
  const itemCount = items.length;
  const totalScrollHeight = itemCount * duration;
  
  // Extra distance at the end to allow smooth unpinning transition and balloon fade out
  // Increased to give more space for balloons to scale down and fade out completely
  // This must match the calculation inside useEffect
  const extraUnpinDistance = typeof window !== 'undefined' ? window.innerHeight * 4.0 : 4000;
  const finalScrollDistance = totalScrollHeight + extraUnpinDistance;
  
  // Get balloon column dimensions for organic positioning
  const balloonColumnWidth = 800; // Approximate width of balloon column (increased)
  const balloonColumnHeight = 600; // Height of balloon column
  
  // Memoize organic positions to avoid recalculation on every render
  const organicPositions = useMemo(() => {
    if (!hasItems) return [];
    return calculateOrganicPositions(
      items.length,
      balloonColumnWidth,
      balloonColumnHeight
    );
  }, [items.length, hasItems]);
  
  // Setup GSAP ScrollTrigger animations
  useEffect(() => {
    if (!containerRef.current || !pinnedRef.current || !balloonColumnRef.current || isEditing || shouldReduceMotion || !hasItems || itemCount === 0) {
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
    
    if (itemCount === 0) return;
    
    // Use the finalScrollDistance calculated outside useEffect
    // This ensures container height matches ScrollTrigger end point
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: `+=${finalScrollDistance}`,
      pin: pinned,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;
        
        // Calculate normalized progress: can go beyond 1.0 to allow smooth sliding during unpin
        // Progress is 0-1 relative to finalScrollDistance
        // normalizedProgress relative to totalScrollHeight (can exceed 1.0 for extra unpin distance)
        // So: normalizedProgress = progress * (finalScrollDistance / totalScrollHeight)
        // This allows progress to continue beyond 1.0 for smooth sliding during unpin phase
        const normalizedProgress = progress * (finalScrollDistance / totalScrollHeight);
        
        // Text animation - finishes when last item reaches full opacity
          const pinnedRect = pinned?.getBoundingClientRect();
          if (pinnedRect) {
          // Calculate when last item reaches full opacity (at peak of its opacity curve)
          // Last item reaches opacity 1 when itemProgressForItem = 0.5 (peak of active item curve)
          // Last item range: [(itemCount - 1) / itemCount, 1.0]
          // So last item reaches opacity 1 when: normalizedProgress = (itemCount - 1) / itemCount + 0.5 * (1 / itemCount)
          const lastItemStart = (itemCount - 1) / itemCount;
          const lastItemRange = 1 / itemCount;
          const lastItemOpacity1Progress = lastItemStart + (0.5 * lastItemRange); // When last item reaches opacity 1
          const isLastItemAtOpacity1 = normalizedProgress >= lastItemOpacity1Progress;
          
          // Calculate extra balloons timing (same as balloon logic below)
          const extraBalloonsStartProgress = lastItemOpacity1Progress;
          const extraBalloonsRange = 0.3;
          const extraBalloonsEndProgress = extraBalloonsStartProgress + extraBalloonsRange;
          const slideUpStartProgress = extraBalloonsEndProgress;
          
          // Calculate which item should be active
          const itemProgress = normalizedProgress * itemCount;
          const currentItemIndex = Math.max(0, Math.min(
            Math.floor(itemProgress),
            itemCount - 1
          ));
          // Update state only when index actually changes to prevent unnecessary re-renders
          if (currentItemIndex !== activeIndex) {
            setActiveIndex(currentItemIndex);
          }
          
          // Determine which items to show (previous, active, next)
          // Always show first item when progress <= 0
          // When last item reaches opacity 1, show last item and previous
          const visibleStartIndex = normalizedProgress <= 0 
            ? 0 
            : isLastItemAtOpacity1
            ? Math.max(0, itemCount - 2) // Show last two items when last item reaches opacity 1
            : Math.max(0, currentItemIndex - 1);
          const visibleEndIndex = Math.min(itemCount - 1, currentItemIndex + 1);
          
          // Text column animation (similar to text-image-scroll)
          const itemHeightVh = 35; // 30vh height + 5vh margin
          const containerCenterVh = 52.5; // 50% of 105vh
          const translationMultiplier = 1.1;
          const vhToPx = window.innerHeight / 100;
          
          // Calculate smooth progress: continuous and smooth throughout entire scroll
          // Use a single continuous formula to avoid jumps at transition points
          // Base progress: normal linear progress
          const baseProgress = normalizedProgress * itemCount;
          
          // When last item reaches opacity 1, smoothly accelerate sliding
          // Use a smooth transition function that starts gradually and accelerates
          let smoothProgress = baseProgress;
          
          if (normalizedProgress > lastItemOpacity1Progress) {
            // After transition point: add accelerated sliding smoothly
            // Calculate how far beyond the transition point we are
            const progressBeyondTransition = normalizedProgress - lastItemOpacity1Progress;
            
            // Use a smooth easing function for gradual acceleration (ease-in-out)
            // This ensures no sudden jumps - acceleration starts slow and increases gradually
            const easingFactor = progressBeyondTransition * progressBeyondTransition; // Quadratic ease-in
            // Add smooth acceleration: gradually increase sliding speed
            const accelerationAmount = easingFactor * itemCount * 1.0; // Smooth, gradual acceleration
            smoothProgress = baseProgress + accelerationAmount;
          }
          const listOffsetVh = containerCenterVh - (smoothProgress * itemHeightVh * translationMultiplier);
          const listOffset = listOffsetVh * vhToPx;
          
          // Animate text items - last item stops at opacity 1 and starts sliding up
          textItemsRef.current.forEach((textItem, index) => {
            if (!textItem) return;
            
            // Show only visible items
            const isVisible = index >= visibleStartIndex && index <= visibleEndIndex;
            
            const itemStart = index / itemCount;
            const itemEnd = (index + 1) / itemCount;
            const itemRange = itemEnd - itemStart;
            // Use normalizedProgress for opacity calculation (not effectiveProgress) to ensure last item reaches opacity 1 correctly
            const itemProgressForItem = Math.max(0, Math.min(1, (normalizedProgress - itemStart) / itemRange));
            
            // Opacity: fade in/out for visible items
            let opacity = 0;
            if (isVisible) {
              // First item should be fully visible when progress <= 0
              if (index === 0 && normalizedProgress <= 0) {
                opacity = 1;
              } else if (isLastItemAtOpacity1) {
                // When last item reaches opacity 1, keep it at opacity 1 and start sliding
                if (index === itemCount - 1) {
                  opacity = 1; // Last item stays at full opacity
                } else if (index === itemCount - 2) {
                  // Previous item fades out as we slide up
                  // Calculate slide progress: how far we've progressed beyond lastItemOpacity1Progress
                  // Use a larger range to allow smooth fading during unpin phase
                  const maxProgress = finalScrollDistance / totalScrollHeight; // Maximum normalized progress
                  const fadeRange = maxProgress - lastItemOpacity1Progress;
                  const slideProgress = fadeRange > 0 
                    ? Math.min(1, (normalizedProgress - lastItemOpacity1Progress) / fadeRange)
                    : 1;
                  opacity = Math.max(0, 0.6 - (slideProgress * 0.6)); // Fade from 0.6 to 0
                } else {
                  opacity = 0; // Other items hidden
                }
              } else {
                // Normal phase opacity logic
                if (index === currentItemIndex) {
                  opacity = itemProgressForItem < 0.5 
                    ? 0.2 + (itemProgressForItem * 1.6)
                    : 1 - ((itemProgressForItem - 0.5) * 1.6);
                  opacity = Math.max(0.2, Math.min(1, opacity));
                } else {
                  opacity = itemProgressForItem < 0.5 
                    ? 0.2 + (itemProgressForItem * 0.8)
                    : 1 - ((itemProgressForItem - 0.5) * 0.8);
                  opacity = Math.max(0.2, Math.min(0.6, opacity));
                }
              }
            }
            
            const itemPositionVh = index * itemHeightVh;
            const smoothOffsetVh = containerCenterVh - (smoothProgress * itemHeightVh * translationMultiplier);
            const offsetVh = smoothOffsetVh;
            const yOffset = offsetVh * vhToPx;
            
            // Scale: last item stays at full scale when it reaches opacity 1
            let scale = 0.95;
            if (isLastItemAtOpacity1 && index === itemCount - 1) {
              scale = 1.0; // Last item at full scale
            } else if (index === currentItemIndex && isVisible && !isLastItemAtOpacity1) {
              scale = itemProgressForItem < 0.5
                ? 0.95 + (itemProgressForItem * 0.1)
                : 1 - ((itemProgressForItem - 0.5) * 0.1);
            }
            
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
          
          // Animate final text (infinitePhaseText) - appears with extra balloons and slides up with them
          if (finalTextRef.current && infinitePhaseText) {
            // Calculate final text progress - appears with extra balloons
            let finalTextProgress = 0;
            if (normalizedProgress < extraBalloonsStartProgress) {
              finalTextProgress = 0; // Not started appearing
            } else if (normalizedProgress >= extraBalloonsStartProgress && normalizedProgress <= extraBalloonsEndProgress) {
              // Appear during extra balloons appearance range
              finalTextProgress = (normalizedProgress - extraBalloonsStartProgress) / extraBalloonsRange;
            } else {
              finalTextProgress = 1; // Fully visible until slide up starts
            }
            
            // Calculate slide-up offset (same as balloons) - starts when slideUpStartProgress is reached
            let finalTextSlideUpOffset = 0;
            let finalTextScale = finalTextProgress; // Scale from 0 to 1 during appearance
            if (normalizedProgress >= slideUpStartProgress) {
              const progressBeyondTransition = normalizedProgress - slideUpStartProgress;
              const maxProgress = finalScrollDistance / totalScrollHeight;
              const slideRange = maxProgress - slideUpStartProgress;
              
              if (slideRange > 0) {
                const slideProgress = Math.min(1, progressBeyondTransition / slideRange);
                const easingFactor = slideProgress * slideProgress;
                const slideDistance = 400; // Same as balloons
                finalTextSlideUpOffset = easingFactor * slideDistance;
                
                // Scale down with balloons (from 1.0 to 0.3)
                const minScale = 0.3;
                const scaleRange = 1.0 - minScale;
                finalTextScale = 1.0 - (easingFactor * scaleRange);
              }
            }
            
            // Calculate opacity - fade in with extra balloons, stay visible until slide up, then fade out when scaling down
            let finalTextOpacity = finalTextProgress;
            if (normalizedProgress >= slideUpStartProgress && finalTextProgress >= 1) {
              // When sliding up, fade out as scale decreases (same logic as balloons)
              if (finalTextScale < 0.7) {
                const fadeStartScale = 0.7;
                const fadeRange = fadeStartScale - 0.3;
                const fadeProgress = (fadeStartScale - finalTextScale) / fadeRange;
                finalTextOpacity = Math.max(0, 1 - fadeProgress);
              } else {
                finalTextOpacity = 1; // Keep visible when sliding but not scaling down much
              }
            }
            
            // Position: appears right after last item and slides up with balloons
            // Calculate position based on last item's position + one item height
            const itemHeightVh = 35;
            const containerCenterVh = 52.5;
            const translationMultiplier = 1.1;
            const vhToPx = window.innerHeight / 100;
            
            // Calculate smooth progress for positioning (same as text items)
            const baseProgress = normalizedProgress * itemCount;
            let smoothProgress = baseProgress;
            
            if (normalizedProgress > lastItemOpacity1Progress) {
              const progressBeyondTransition = normalizedProgress - lastItemOpacity1Progress;
              const easingFactor = progressBeyondTransition * progressBeyondTransition;
              const accelerationAmount = easingFactor * itemCount * 1.0;
              smoothProgress = baseProgress + accelerationAmount;
            }
            
            // Position final text: calculate offset for the position after last item
            // Use the same calculation as text items but treat final text as if it's at index = itemCount
            // The last item uses: smoothOffsetVh = containerCenterVh - (smoothProgress * itemHeightVh * translationMultiplier)
            // For final text, we need to account for it being one position after the last item
            // So we use smoothProgress + 1 to account for the extra position
            const finalTextSmoothProgress = smoothProgress + 1; // One position after last item
            const finalTextSmoothOffsetVh = containerCenterVh - (finalTextSmoothProgress * itemHeightVh * translationMultiplier);
            const baseOffset = finalTextSmoothOffsetVh * vhToPx;
            
            // Apply slide-up offset (same as balloons)
            const finalYOffset = baseOffset - finalTextSlideUpOffset;
            
            gsap.set(finalTextRef.current, {
              opacity: finalTextOpacity,
              y: finalYOffset,
              scale: finalTextScale,
              transformOrigin: 'center center',
              willChange: enableGPU ? 'transform, opacity' : 'auto',
              pointerEvents: finalTextOpacity > 0 ? 'auto' : 'none',
              visibility: finalTextOpacity > 0 ? 'visible' : 'hidden'
            });
          }
        }
        
        // Balloon animation - only process seeded balloons
        if (pinnedRect) {
          // Calculate when all balloons have appeared (same logic as text)
          const lastItemStart = (itemCount - 1) / itemCount;
          const lastItemRange = 1 / itemCount;
          const lastItemOpacity1Progress = lastItemStart + (0.5 * lastItemRange);
          const allBalloonsVisible = normalizedProgress >= lastItemOpacity1Progress;
          
          // Add 5 extra balloons that appear after all original balloons are visible
          const extraBalloonsCount = 5;
          // Extra balloons appear in a range after all original balloons are visible
          // They appear during a scroll range before slide-up starts
          const extraBalloonsStartProgress = lastItemOpacity1Progress;
          const extraBalloonsRange = 0.3; // Range for extra balloons to appear (30% of total scroll)
          const extraBalloonsEndProgress = extraBalloonsStartProgress + extraBalloonsRange;
          const slideUpStartProgress = extraBalloonsEndProgress; // Slide up starts after extra balloons appear
          
          // Calculate base positions for all balloons
          const balloonPositions: Array<{ x: number; y: number; index: number }> = [];
          
          // Center target position (in 2D pixel space) - gravity target, positioned upper center
          const centerX = pinnedRect.width / 2;
          const centerY = pinnedRect.height * 0.35; // Position balloons at upper center (35% from top)
          
          // Viewport center for coordinate conversion
          const viewportCenterX = pinnedRect.width / 2;
          const viewportCenterY = pinnedRect.height / 2;
          const scaleFactor = SCALE_FACTOR_2D_TO_3D;
          
          // Calculate positions for original balloons - start at center from the beginning
          for (let index = 0; index < itemCount; index++) {
            // Calculate when this balloon should start appearing
            // Start balloons earlier: first balloon starts at progress -0.1, others start progressively earlier
            const balloonStartOffset = -0.1; // Start balloons 10% earlier
            const balloonStart = (index / itemCount) + balloonStartOffset;
            const balloonEnd = ((index + 1) / itemCount) + balloonStartOffset;
            const balloonRange = balloonEnd - balloonStart;
            
            // Calculate progress for this specific balloon (0 to 1)
            // First balloon (index 0) should be fully visible (progress = 1) when normalizedProgress = 0
            let balloonProgress = 0;
            if (index === 0 && normalizedProgress <= 0) {
              // First balloon starts fully visible
              balloonProgress = 1;
            } else if (normalizedProgress < balloonStart) {
              balloonProgress = 0;
            } else if (normalizedProgress > balloonEnd) {
              balloonProgress = 1;
            } else {
              balloonProgress = (normalizedProgress - balloonStart) / balloonRange;
            }
            
            // Start all balloons at center (with small initial offsets for physics)
            // Use golden angle for deterministic but natural-looking initial spread
            const goldenAngle = 137.508;
            const angle = (index * goldenAngle) % 360;
            const angleRad = (angle * Math.PI) / 180;
            
            // Small initial radius for physics to work (balloons will spread naturally)
            const initialRadius = 20 + (index * 5); // Small spread, increases slightly with index
            const offsetX = Math.cos(angleRad) * initialRadius;
            const offsetY = Math.sin(angleRad) * initialRadius;
            
            // Base position: center with small offset
            const baseX = centerX + offsetX;
            const baseY = centerY + offsetY;
            
            balloonPositions.push({ x: baseX, y: baseY, index });
          }
          
          // Add 5 extra balloons that appear after all original balloons are visible
          // They should also disappear when scrolling backwards
          for (let extraIndex = 0; extraIndex < extraBalloonsCount; extraIndex++) {
            const index = itemCount + extraIndex; // Index for extra balloons
            
            // Calculate when this extra balloon should appear
            const extraBalloonStart = extraBalloonsStartProgress + (extraIndex / extraBalloonsCount) * extraBalloonsRange;
            const extraBalloonEnd = extraBalloonsStartProgress + ((extraIndex + 1) / extraBalloonsCount) * extraBalloonsRange;
            const extraBalloonRange = extraBalloonEnd - extraBalloonStart;
            
            // Calculate progress for this extra balloon (0 to 1)
            // This handles both forward and backward scrolling
            let extraBalloonProgress = 0;
            if (normalizedProgress < extraBalloonStart) {
              extraBalloonProgress = 0; // Not started appearing yet
            } else if (normalizedProgress > extraBalloonEnd) {
              // Check if we're scrolling backwards from beyond the end
              // If we're past slideUpStartProgress and scrolling back, balloon should disappear
              if (normalizedProgress > slideUpStartProgress) {
                // Balloon should disappear when scrolling backwards from slide up phase
                // Calculate reverse progress: as we scroll back from slide up, balloon fades out
                const reverseProgress = Math.max(0, (slideUpStartProgress - normalizedProgress) / extraBalloonsRange);
                extraBalloonProgress = Math.max(0, 1 - reverseProgress);
              } else {
                extraBalloonProgress = 1; // Fully visible
              }
            } else {
              // Within the appearance range
              extraBalloonProgress = (normalizedProgress - extraBalloonStart) / extraBalloonRange;
            }
            
            // Only add balloon if it has started appearing (progress > 0)
            if (extraBalloonProgress > 0) {
              // Use golden angle for deterministic but natural-looking spread
              const goldenAngle = 137.508;
              const angle = (index * goldenAngle) % 360;
              const angleRad = (angle * Math.PI) / 180;
              
              // Small initial radius for physics to work
              const initialRadius = 20 + (index * 5);
              const offsetX = Math.cos(angleRad) * initialRadius;
              const offsetY = Math.sin(angleRad) * initialRadius;
              
              // Base position: center with small offset
              const baseX = centerX + offsetX;
              const baseY = centerY + offsetY;
              
              balloonPositions.push({ x: baseX, y: baseY, index });
            }
          }
          
          // Apply physics: repulsion + gravity
          // First pass: Calculate repulsion forces
          const repulsionOffsets = new Map<number, { x: number; y: number }>();
          
          balloonPositions.forEach((pos1, i) => {
            let totalRepulsionX = 0;
            let totalRepulsionY = 0;
            
            balloonPositions.forEach((pos2, j) => {
              if (i === j) return; // Skip self
              
              // Calculate distance between balloons
              const dx = pos2.x - pos1.x;
              const dy = pos2.y - pos1.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              // Apply repulsion if balloons are too close
              if (distance < REPULSION_RADIUS && distance > 0) {
                // Calculate repulsion force (stronger when closer)
                const force = REPULSION_STRENGTH * (1 - distance / REPULSION_RADIUS);
                
                // Direction away from other balloon (normalized)
                const angle = Math.atan2(dy, dx);
                
                // Apply repulsion force
                totalRepulsionX -= Math.cos(angle) * force;
                totalRepulsionY -= Math.sin(angle) * force;
              }
            });
            
            repulsionOffsets.set(pos1.index, { x: totalRepulsionX, y: totalRepulsionY });
          });
          
          // Calculate slide-up offset for balloons (similar to text sliding)
          // Start sliding up after extra balloons have appeared
          let balloonSlideUpOffset = 0;
          let scaleDownFactor = 1; // Scale factor: starts at 1, decreases as scroll continues
          if (normalizedProgress >= slideUpStartProgress) {
            // Calculate how far beyond the slide up start point we are
            const progressBeyondTransition = normalizedProgress - slideUpStartProgress;
            const maxProgress = finalScrollDistance / totalScrollHeight;
            const slideRange = maxProgress - slideUpStartProgress;
            
            if (slideRange > 0) {
              // Calculate slide progress (0 to 1)
              const slideProgress = Math.min(1, progressBeyondTransition / slideRange);
              // Apply easing for smooth acceleration
              const easingFactor = slideProgress * slideProgress; // Quadratic ease-in
              // Slide distance in 2D pixels (similar to text sliding distance)
              const slideDistance = 400; // Distance to slide up in pixels
              balloonSlideUpOffset = easingFactor * slideDistance;
              
              // Calculate scale down: balloons shrink as they slide up
              // Scale from 1.0 (full size) to 0.3 (small) as slideProgress goes from 0 to 1
              const minScale = 0.3; // Minimum scale when fully scrolled
              const scaleRange = 1.0 - minScale; // Range of scaling (0.7)
              scaleDownFactor = 1.0 - (easingFactor * scaleRange); // Smooth scale down
            }
          }
          
          // Calculate total balloons count (original + extra)
          const totalBalloonsCount = itemCount + extraBalloonsCount;
          
          // Second pass: Apply gravity toward bottom center
          balloonPositions.forEach((pos) => {
            const index = pos.index;
            const isExtraBalloon = index >= itemCount;
            
            // Calculate progress for this specific balloon
            let balloonProgress = 0;
            
            if (isExtraBalloon) {
              // Extra balloon progress - handles both forward and backward scrolling
              const extraIndex = index - itemCount;
              const extraBalloonStart = extraBalloonsStartProgress + (extraIndex / extraBalloonsCount) * extraBalloonsRange;
              const extraBalloonEnd = extraBalloonsStartProgress + ((extraIndex + 1) / extraBalloonsCount) * extraBalloonsRange;
              const extraBalloonRange = extraBalloonEnd - extraBalloonStart;
              
              if (normalizedProgress < extraBalloonStart) {
                balloonProgress = 0; // Not started appearing - disappears when scrolling back
              } else if (normalizedProgress >= extraBalloonStart && normalizedProgress <= extraBalloonEnd) {
                // Within the appearance range - progress linearly from 0 to 1
                // When scrolling backwards, progress will decrease naturally
                balloonProgress = (normalizedProgress - extraBalloonStart) / extraBalloonRange;
              } else {
                // Past the appearance end
                if (normalizedProgress > extraBalloonEnd && normalizedProgress < slideUpStartProgress) {
                  // Fully visible between appearance end and slide up start
                  balloonProgress = 1;
                } else if (normalizedProgress >= slideUpStartProgress) {
                  // In slide up phase - balloon stays visible but will fade out with scale
                  balloonProgress = 1;
                } else {
                  // This shouldn't happen, but default to 1
                  balloonProgress = 1;
                }
              }
            } else {
              // Original balloon progress
              const balloonStartOffset = -0.1; // Start balloons 10% earlier
              const balloonStart = (index / itemCount) + balloonStartOffset;
              const balloonEnd = ((index + 1) / itemCount) + balloonStartOffset;
              const balloonRange = balloonEnd - balloonStart;
              
              // First balloon (index 0) should be fully visible (progress = 1) when normalizedProgress = 0
              if (index === 0 && normalizedProgress <= 0) {
                balloonProgress = 1;
              } else if (normalizedProgress < balloonStart) {
                balloonProgress = 0;
              } else if (normalizedProgress > balloonEnd) {
                balloonProgress = 1;
              } else {
                balloonProgress = (normalizedProgress - balloonStart) / balloonRange;
              }
            }
            
            // Calculate gravity force toward center
            const dx = centerX - pos.x;
            const dy = centerY - pos.y;
            const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
            
            let gravityX = 0;
            let gravityY = 0;
            
            if (distanceToCenter > 0 && distanceToCenter < GRAVITY_RADIUS) {
              // Gravity strength decreases with distance
              const gravityForce = GRAVITY_STRENGTH * (1 - distanceToCenter / GRAVITY_RADIUS);
              const angle = Math.atan2(dy, dx);
              
              gravityX = Math.cos(angle) * gravityForce;
              gravityY = Math.sin(angle) * gravityForce;
            }
            
            // Apply repulsion offset
            const repulsionOffset = repulsionOffsets.get(index) || { x: 0, y: 0 };
            
            // Final position: base position + repulsion + gravity
            const currentX = pos.x + repulsionOffset.x + gravityX;
            const currentY = pos.y + repulsionOffset.y + gravityY;
            
            // Opacity: fade in as balloon appears, stay at 1 when visible, then fade out as they scale down
            let opacity = balloonProgress;
            // For extra balloons, they should be fully visible once they appear
            // For original balloons, use the same logic as before
            if (isExtraBalloon && balloonProgress >= 1) {
              // Extra balloons stay visible until slide up starts
              if (normalizedProgress >= slideUpStartProgress) {
                // When sliding up, fade out as scale decreases
                if (scaleDownFactor < 0.7) {
                  const fadeStartScale = 0.7;
                  const fadeRange = fadeStartScale - 0.3;
                  const fadeProgress = (fadeStartScale - scaleDownFactor) / fadeRange;
                  opacity = Math.max(0, 1 - fadeProgress);
                } else {
                  opacity = 1;
                }
              } else {
                opacity = 1; // Keep extra balloons fully visible before slide up
              }
            } else if (!isExtraBalloon && allBalloonsVisible && balloonProgress >= 1) {
              // Original balloons: when sliding up, keep opacity at 1 initially, then fade out as scale decreases
              if (normalizedProgress >= slideUpStartProgress) {
                if (scaleDownFactor < 0.7) {
                  const fadeStartScale = 0.7;
                  const fadeRange = fadeStartScale - 0.3;
                  const fadeProgress = (fadeStartScale - scaleDownFactor) / fadeRange;
                  opacity = Math.max(0, 1 - fadeProgress);
                } else {
                  opacity = 1;
                }
              } else {
                opacity = 1; // Keep balloons fully visible before slide up
              }
            }
            
            // Scale: scale from 0 to 1.0 during appearance, then scale down when sliding up
            let scale = balloonProgress;
            // Apply scale down only when sliding up starts
            if (normalizedProgress >= slideUpStartProgress && balloonProgress >= 1) {
              // Apply scale down factor when sliding up (for both original and extra balloons)
              scale = scaleDownFactor;
            }
            
            // Appearance Y offset: translate upward from bottom during appearance
            // When balloonProgress = 0, balloon starts lower (appearanceDistance below)
            // When balloonProgress = 1, balloon is at final position
            const appearanceDistance = 150; // Distance in 2D pixels to translate upward during appearance
            const appearanceYOffset = (1 - balloonProgress) * appearanceDistance;
            
            // Apply slide-up offset when slide up starts (for both original and extra balloons)
            // This makes balloons slide up similar to text
            const totalYOffset = appearanceYOffset - balloonSlideUpOffset; // Negative because we're moving up (decreasing Y)
            
            // Z-index: later items appear on top
            const zIndex = (index / totalBalloonsCount) * 2;
            
            // Update balloon state for Three.js rendering
            setBalloonStates(prev => {
              const newMap = new Map(prev);
              // Convert 2D pixel positions to 3D coordinates relative to viewport center
              const viewportCenterX = pinnedRect.width / 2;
              const viewportCenterY = pinnedRect.height / 2;
              
              const x3D = (currentX - viewportCenterX) * SCALE_FACTOR_2D_TO_3D;
              // Apply appearance Y offset and slide-up offset
              // When balloonProgress = 0, appearanceYOffset = appearanceDistance, so balloon starts lower
              // When balloonProgress = 1, appearanceYOffset = 0, so balloon is at final position
              // When all balloons visible, balloonSlideUpOffset increases, moving balloons up
              const y3D = -((currentY + totalYOffset) - viewportCenterY) * SCALE_FACTOR_2D_TO_3D; // Invert Y for Three.js
              
              newMap.set(index, {
                x: x3D,
                y: y3D,
                z: zIndex,
                opacity: opacity,
                scale: scale
              });
              // Update ref to track current state
              balloonStatesRef.current = newMap;
              return newMap;
            });
          });
        }
      }
    });

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, [itemCount, isEditing, shouldReduceMotion, totalScrollHeight, finalScrollDistance, hasItems, enableGPU, enableOnMobile, isMobile, infinitePhaseText]);

  // Show skeleton if no items configured
  if (!hasItems) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full bubble-list-scroll-container ${className || ''}`}
        style={{
          minHeight: '100vh',
          overflow: 'visible',
          position: 'relative',
          ...style
        }}
      >
        {backgroundElement && (
          <div ref={backgroundRef} className="absolute inset-0 z-0">
            {backgroundElement}
          </div>
        )}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <Skeleton className="h-12 w-3/4 mb-6 mx-auto" />
          <Skeleton className="h-6 w-2/3 mb-12 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: skeletonItemCount }).map((_, index) => (
              <Skeleton key={`skeleton-${index}`} className="h-64 w-full rounded-[30px]" />
            ))}
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Background layers - no pointer events */
        .bubble-list-scroll-container > div[class*="absolute"]:not(.balloon-item) {
          pointer-events: none;
        }
        
        .balloon-item {
          will-change: transform;
        }
        
      `}} />
      
      <div
        ref={containerRef}
        className={`relative w-full bubble-list-scroll-container ${className || ''}`}
        style={{
          height: `${finalScrollDistance}px`, // Use height (not minHeight) to match ScrollTrigger end point exactly
          overflow: 'visible',
          position: 'relative',
          backgroundColor: '#FFFFFF', // White background
          ...style,  // Apply external styles first
          // Then override with critical styles that GSAP needs
          top: 0,
          marginTop: 0,
          paddingTop: 0,
          transform: undefined,  // Prevent external transforms from interfering
          willChange: undefined  // Let GSAP control will-change
        }}
      >
        {/* White background - no parallax needed */}
        <div 
          ref={backgroundRef} 
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: '#FFFFFF',
            zIndex: 0,
            pointerEvents: 'none', // Background doesn't interfere with balloons
          }}
        />

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
        {/* Content container - two column layout: text left, balloons right */}
        <div className="relative z-10 w-full max-w-[1620px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between" style={{ minHeight: '100vh', height: '100vh', overflow: 'visible', top: 0, paddingTop: 0, position: 'relative', gap: '2rem' }}>
          {/* Centered content */}
          <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-between" style={{ overflow: 'visible', position: 'relative', gap: '2rem' }}>
            {/* Text items - left side, vertically centered */}
            <div ref={textColumnRef} className="w-full md:w-[45%] max-w-xl z-20" style={{ overflow: 'hidden', position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {items.map((item, itemIndex) => {
                  const index = itemIndex;
                  const itemHeight = 35; // 30vh height + 5vh margin
                  const translationMultiplier = 1.1;
                  const containerCenter = 52.5; // 50% of 105vh
                  const initialOffset = containerCenter - (0 * itemHeight * translationMultiplier);
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
                      <div style={{ position: 'relative', width: '100%', textAlign: 'left' }}>
                        <h3 className="text-2xl md:text-3xl font-normal mb-4 text-gray-900 prose prose-md md:prose-md">
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
                
                {/* Final text that appears with extra balloons and slides up with them */}
                {infinitePhaseText && (
                  <div
                    ref={finalTextRef}
                    style={{
                      minHeight: '30vh',
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      overflow: 'visible',
                      height: '30vh',
                      width: '100%',
                      top: `${itemCount * 35}vh`,
                      marginBottom: '5vh',
                      opacity: 0,
                      transform: 'translateY(0px) scale(0)',
                      visibility: 'hidden',
                      willChange: enableGPU ? 'transform, opacity' : 'auto'
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', textAlign: 'left' }}>
                      <h3 className="text-2xl md:text-3xl font-normal mb-4 text-gray-900 prose prose-md md:prose-md">
                        {infinitePhaseText}
                      </h3>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Unified Balloons Canvas - right side, vertically centered */}
            <div 
              ref={balloonColumnRef}
              className="w-full md:w-[45%] h-full"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                overflow: 'visible',
                pointerEvents: 'none'
              }}
            >
              {/* Unified Three.js Canvas for all balloons (seeded only) */}
              <Canvas
                camera={{ position: [0, 0, 25], fov: 60 }}
                style={{ width: '100%', height: '100%' }}
                gl={{ antialias: true, alpha: true }}
              >
                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <directionalLight position={[-5, -5, -5]} intensity={0.4} />
                <pointLight position={[0, 5, 5]} intensity={0.5} />
                
                {/* Render original balloons */}
                {items.map((item, index) => {
                  const isEven = index % 2 === 0;
                  const balloonColor = isEven ? BRAND_BLUE : BRAND_BLUE_LIGHT;
                  const balloonState = balloonStates.get(index);
                  
                  // Initialize with default values if state not set yet
                  const defaultState = {
                    x: 0,
                    y: 0,
                    z: 0,
                    opacity: 0,
                    scale: 0
                  };
                  const state = balloonState || defaultState;
                  
                  return (
                    <Balloon3D
                      key={`seeded-${item.id}`}
                      position={[state.x, state.y, state.z]}
                      color={balloonColor}
                      rotationSpeed={0.1}
                      scale={state.scale}
                      opacity={state.opacity}
                      showString={false}
                    />
                  );
                })}
                
                {/* Render 5 extra balloons */}
                {Array.from({ length: 5 }).map((_, extraIndex) => {
                  const index = itemCount + extraIndex;
                  const isEven = index % 2 === 0;
                  const balloonColor = isEven ? BRAND_BLUE : BRAND_BLUE_LIGHT;
                  const balloonState = balloonStates.get(index);
                  
                  // Initialize with default values if state not set yet
                  const defaultState = {
                    x: 0,
                    y: 0,
                    z: 0,
                    opacity: 0,
                    scale: 0
                  };
                  const state = balloonState || defaultState;
                  
                  // Only render if balloon has started appearing (opacity > 0 or scale > 0)
                  if (state.opacity === 0 && state.scale === 0) {
                    return null;
                  }
                  
                  return (
                    <Balloon3D
                      key={`extra-${extraIndex}`}
                      position={[state.x, state.y, state.z]}
                      color={balloonColor}
                      rotationSpeed={0.1}
                      scale={state.scale}
                      opacity={state.opacity}
                      showString={false}
                    />
                  );
                })}
              </Canvas>
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
    </>
  );
}
