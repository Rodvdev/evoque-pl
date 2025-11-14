'use client'

import React from 'react'
import type { TestimonialBlock as TestimonialBlockProps } from '@/payload-types'
import TestimonialShowcaseComponent from './index'

export const TestimonialBlock: React.FC<TestimonialBlockProps> = (props) => {
  const { variant, headline, description, testimonials } = props

  // Transform testimonials to match the component's expected format
  const transformedTestimonials = (testimonials || []).map((testimonial) => {
    const avatarUrl =
      typeof testimonial.avatar === 'object' && testimonial.avatar?.url
        ? testimonial.avatar.url
        : typeof testimonial.avatar === 'string'
          ? testimonial.avatar
          : undefined

    return {
      quote: testimonial.quote || '',
      author: testimonial.author || '',
      title: testimonial.title ?? undefined,
      company: testimonial.company ?? undefined,
      avatar: avatarUrl,
      metric: testimonial.metric ?? undefined,
      videoUrl: testimonial.videoUrl ?? undefined,
    }
  })

  return (
    <TestimonialShowcaseComponent
      content={{
        variant: (variant as 'spotlight' | 'cascade' | 'flow' | 'layered' | 'horizontal') || 'spotlight',
        headline: headline || '',
        description: description || '',
        testimonials: transformedTestimonials,
      }}
    />
  )
}

