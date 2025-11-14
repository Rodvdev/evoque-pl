'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FoundationTextProps {
  text: string;
  variant?: 'random-chars' | 'fade-in' | 'slide-up' | 'typewriter';
  scrollProgress?: number; // Progress from 0 to 1, where 1 means last item is disappearing
  isEditing?: boolean;
  shouldReduceMotion?: boolean;
}

export function FoundationText({ 
  text, 
  variant = 'random-chars',
  scrollProgress = 0,
  isEditing = false, 
  shouldReduceMotion = false 
}: FoundationTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const randomOrderRef = useRef<Map<number, number> | null>(null); // Store random order for consistency

  useEffect(() => {
    if (!containerRef.current || !textRef.current || isEditing || shouldReduceMotion) {
      return;
    }

    const textElement = textRef.current;
    const originalText = text;
    const chars = originalText.split('');

    // Create spans for each character
    const charSpans = chars.map((char, index) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space for spaces
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.willChange = 'transform, opacity';
      
      return span;
    });

    // Clear and add spans
    textElement.innerHTML = '';
    charSpans.forEach(span => textElement.appendChild(span));

    // Initialize based on variant
    if (variant === 'random-chars') {
      // Random initial positions for each character
      charSpans.forEach((span) => {
        const randomX = (Math.random() - 0.5) * 400;
        const randomY = (Math.random() - 0.5) * 400;
        span.style.transform = `translate(${randomX}px, ${randomY}px)`;
      });

      // Create random order for character appearance (only once)
      if (!randomOrderRef.current) {
        const randomOrder = chars.map((_, index) => index).sort(() => Math.random() - 0.5);
        const charOrderMap = new Map<number, number>();
        randomOrder.forEach((originalIndex, randomIndex) => {
          charOrderMap.set(originalIndex, randomIndex);
        });
        randomOrderRef.current = charOrderMap;
      }
      const charOrderMap = randomOrderRef.current;

      // Update based on scroll progress
      const updateRandomChars = (progress: number) => {
        const visibleCount = Math.floor(progress * chars.length);
        
        charSpans.forEach((span, originalIndex) => {
          const randomOrderIndex = charOrderMap.get(originalIndex) || 0;
          
          if (randomOrderIndex < visibleCount) {
            const charProgress = Math.min(1, (progress * chars.length - randomOrderIndex) / 0.3);
            gsap.to(span, {
              opacity: charProgress,
              x: 0,
              y: 0,
              duration: 0.3,
              ease: 'power2.out',
              overwrite: true
            });
          } else {
            if (parseFloat(span.style.opacity) > 0) {
              const randomX = (Math.random() - 0.5) * 400;
              const randomY = (Math.random() - 0.5) * 400;
              gsap.set(span, {
                opacity: 0,
                x: randomX,
                y: randomY,
                overwrite: true
              });
            }
          }
        });
      };

      // Use scrollProgress prop if provided, otherwise create ScrollTrigger
      if (scrollProgress !== undefined) {
        // Update based on external progress (from parent scroll progress)
        updateRandomChars(scrollProgress);
      } else {
        // Create ScrollTrigger
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true,
          onUpdate: (self) => {
            updateRandomChars(self.progress);
          },
          invalidateOnRefresh: true
        });
      }
    } else if (variant === 'fade-in') {
      // Fade in entire text
      const updateFadeIn = (progress: number) => {
        gsap.set(textElement, {
          opacity: progress,
          overwrite: true
        });
      };

      if (scrollProgress !== undefined) {
        updateFadeIn(scrollProgress);
      } else {
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true,
          onUpdate: (self) => {
            updateFadeIn(self.progress);
          },
          invalidateOnRefresh: true
        });
      }
    } else if (variant === 'slide-up') {
      // Slide up from bottom with fade
      gsap.set(textElement, {
        opacity: 0,
        y: 50
      });

      const updateSlideUp = (progress: number) => {
        gsap.set(textElement, {
          opacity: progress,
          y: 50 * (1 - progress),
          overwrite: true
        });
      };

      if (scrollProgress !== undefined) {
        updateSlideUp(scrollProgress);
      } else {
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true,
          onUpdate: (self) => {
            updateSlideUp(self.progress);
          },
          invalidateOnRefresh: true
        });
      }
    } else if (variant === 'typewriter') {
      // Typewriter effect - characters appear one by one
      charSpans.forEach((span) => {
        span.style.opacity = '0';
      });

      const updateTypewriter = (progress: number) => {
        const visibleCount = Math.floor(progress * chars.length);
        
        charSpans.forEach((span, index) => {
          if (index < visibleCount) {
            gsap.set(span, {
              opacity: 1,
              overwrite: true
            });
          } else {
            gsap.set(span, {
              opacity: 0,
              overwrite: true
            });
          }
        });
      };

      if (scrollProgress !== undefined) {
        updateTypewriter(scrollProgress);
      } else {
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true,
          onUpdate: (self) => {
            updateTypewriter(self.progress);
          },
          invalidateOnRefresh: true
        });
      }
    }


    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      // Restore original text
      if (textElement) {
        textElement.textContent = originalText;
        gsap.set(textElement, {
          opacity: 1,
          y: 0,
          overwrite: true
        });
      }
      // Reset random order when text changes
      if (text !== originalText) {
        randomOrderRef.current = null;
      }
    };
  }, [text, variant, isEditing, shouldReduceMotion]);

  // Separate effect for scrollProgress updates when using external progress
  useEffect(() => {
    if (!textRef.current || isEditing || shouldReduceMotion || scrollProgress === undefined) {
      return;
    }

    const textElement = textRef.current;
    const chars = text.split('');
    const charSpans = Array.from(textElement.children) as HTMLSpanElement[];

    if (charSpans.length !== chars.length) {
      return; // Not initialized yet
    }

    if (variant === 'random-chars') {
      // Use the stored random order
      if (!randomOrderRef.current) {
        const randomOrder = chars.map((_, index) => index).sort(() => Math.random() - 0.5);
        const charOrderMap = new Map<number, number>();
        randomOrder.forEach((originalIndex, randomIndex) => {
          charOrderMap.set(originalIndex, randomIndex);
        });
        randomOrderRef.current = charOrderMap;
      }
      const charOrderMap = randomOrderRef.current;
      
      const visibleCount = Math.floor(scrollProgress * chars.length);
      charSpans.forEach((span, originalIndex) => {
        const randomOrderIndex = charOrderMap.get(originalIndex) || 0;
        if (randomOrderIndex < visibleCount) {
          const charProgress = Math.min(1, (scrollProgress * chars.length - randomOrderIndex) / 0.3);
          gsap.set(span, {
            opacity: charProgress,
            x: 0,
            y: 0,
            overwrite: true
          });
        } else {
          gsap.set(span, {
            opacity: 0,
            overwrite: true
          });
        }
      });
    } else if (variant === 'fade-in') {
      gsap.set(textElement, { opacity: scrollProgress, overwrite: true });
    } else if (variant === 'slide-up') {
      gsap.set(textElement, {
        opacity: scrollProgress,
        y: 50 * (1 - scrollProgress),
        overwrite: true
      });
    } else if (variant === 'typewriter') {
      const visibleCount = Math.floor(scrollProgress * chars.length);
      charSpans.forEach((span, index) => {
        gsap.set(span, { opacity: index < visibleCount ? 1 : 0, overwrite: true });
      });
    }
  }, [scrollProgress, variant, text, isEditing, shouldReduceMotion]);

  // Fallback for reduced motion or editing
  if (shouldReduceMotion || isEditing) {
    return (
      <div ref={containerRef} className="w-full max-w-[1620px] mx-auto px-4 md:px-8 py-16">
        <p className="text-center text-lg md:text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative z-10 w-full max-w-[1620px] mx-auto px-4 md:px-8 py-16"
      style={{ overflow: 'visible' }}
    >
      <p 
        ref={textRef}
        className="text-center text-lg md:text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto"
        style={{ 
          willChange: 'contents',
          minHeight: '4rem' // Prevent layout shift
        }}
      />
    </div>
  );
}

