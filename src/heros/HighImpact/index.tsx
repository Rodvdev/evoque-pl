'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect, useRef } from 'react'
// @ts-expect-error - GSAP doesn't have type definitions
import gsap from 'gsap'
// @ts-expect-error - GSAP doesn't have type definitions
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export const HighImpactHero: React.FC<Page['hero']> = (props) => {
  const { links, media, richText } = props
  // @ts-expect-error - scroll is in the type but TypeScript isn't recognizing it yet
  const scrollEffect = props.scroll
  // @ts-expect-error - brRadius is in the type but TypeScript isn't recognizing it yet
  const borderRadius = props.brRadius
  const { setHeaderTheme } = useHeaderTheme()
  const heroRef = useRef<HTMLDivElement>(null)
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

  useEffect(() => {
    setHeaderTheme('dark')
  })

  // Set up scroll effect
  useEffect(() => {
    if (!scrollEffect?.enabled || scrollEffect?.type !== 'zoom-out' || !heroRef.current) return

    const {
      zoomStart = 1,
      zoomEnd = 0.95,
      duration = 300,
      enableOnMobile = true,
      brRadius,
    } = scrollEffect.zoom || {}

    // Handle null values
    const finalZoomStart = zoomStart ?? 1
    const finalZoomEnd = zoomEnd ?? 0.95
    const finalDuration = duration ?? 300
    const finalEnableOnMobile = enableOnMobile ?? true

    // Border radius settings
    const borderRadiusValue = parseInt(brRadius?.value || '0', 10)
    const enabledCorners = brRadius?.corners || {}
    const hasBorderRadius = borderRadiusValue > 0 && (
      enabledCorners.topLeft || enabledCorners.topRight ||
      enabledCorners.bottomRight || enabledCorners.bottomLeft
    )

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Check for mobile
    const isMobile = window.innerWidth <= 768
    if (isMobile && !finalEnableOnMobile) {
      return
    }

    const heroElement = heroRef.current

    // Set initial scale and border radius
    gsap.set(heroElement, {
      scale: finalZoomStart,
      transformOrigin: 'center center',
    })

    // Set initial border radius (0 when enabled, or static value when not)
    if (hasBorderRadius) {
      gsap.set(heroElement, {
        borderTopLeftRadius: enabledCorners.topLeft ? '0px' : '0px',
        borderTopRightRadius: enabledCorners.topRight ? '0px' : '0px',
        borderBottomRightRadius: enabledCorners.bottomRight ? '0px' : '0px',
        borderBottomLeftRadius: enabledCorners.bottomLeft ? '0px' : '0px',
      })
    }

    // Calculate start position considering promotion height
    const getStartPosition = () => {
      const promotionHeight = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--promotion-height')
      ) || 0
      
      if (promotionHeight > 0) {
        return `top top-=${promotionHeight}`
      }
      return 'top top'
    }

    // Create scroll-triggered zoom effect
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: heroElement,
      start: getStartPosition(),
      end: `+=${finalDuration}`,
      scrub: true,
      onUpdate: (self: any) => {
        const progress = self.progress
        const scale = finalZoomStart + (finalZoomEnd - finalZoomStart) * progress

        // Apply scale
        gsap.set(heroElement, { scale })

        // Animate border radius if enabled
        if (hasBorderRadius) {
          const currentRadius = borderRadiusValue * progress
          const borderRadiusStyles: Record<string, string> = {}
          
          if (enabledCorners.topLeft) {
            borderRadiusStyles.borderTopLeftRadius = `${currentRadius}px`
          }
          if (enabledCorners.topRight) {
            borderRadiusStyles.borderTopRightRadius = `${currentRadius}px`
          }
          if (enabledCorners.bottomRight) {
            borderRadiusStyles.borderBottomRightRadius = `${currentRadius}px`
          }
          if (enabledCorners.bottomLeft) {
            borderRadiusStyles.borderBottomLeftRadius = `${currentRadius}px`
          }

          if (Object.keys(borderRadiusStyles).length > 0) {
            gsap.set(heroElement, borderRadiusStyles)
          }
        }
      },
      invalidateOnRefresh: true,
    })

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill()
        scrollTriggerRef.current = null
      }
    }
  }, [scrollEffect])

  // Calculate static border radius style (only for non-scroll effects or medium impact)
  // For zoom-out, border radius is animated on scroll
  const hasZoomOut = scrollEffect?.enabled && scrollEffect?.type === 'zoom-out'
  const borderRadiusStyle = !hasZoomOut && borderRadius
    ? {
        borderTopLeftRadius: `${parseInt(borderRadius.topLeft || '0', 10)}px`,
        borderTopRightRadius: `${parseInt(borderRadius.topRight || '0', 10)}px`,
        borderBottomRightRadius: `${parseInt(borderRadius.bottomRight || '0', 10)}px`,
        borderBottomLeftRadius: `${parseInt(borderRadius.bottomLeft || '0', 10)}px`,
        overflow: 'hidden' as const,
      }
    : hasZoomOut
    ? { overflow: 'hidden' as const } // Overflow needed for animated border radius
    : {}

  return (
    <div
      ref={heroRef}
      className="relative -mt-[10.4rem] flex items-center justify-center text-white"
      data-theme="dark"
      style={borderRadiusStyle}
    >
      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="max-w-[36.5rem] md:text-center">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="min-h-[80vh] select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="-z-10 object-cover" priority resource={media} />
        )}
      </div>
    </div>
  )
}
