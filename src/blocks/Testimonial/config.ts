import type { Block, Field } from 'payload'

// Original testimonialConfig for the editor and component
export const testimonialConfig = {
  defaultContent: {
    variant: 'spotlight' as const,
    headline: '',
    description: '',
    testimonials: [],
  },
  variantStyles: {
    spotlight: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accent: '#a855f7',
      layout: 'split' as const,
    },
    cascade: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      accent: '#f5576c',
      layout: 'grid' as const,
    },
    flow: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      accent: '#00f2fe',
      layout: 'carousel' as const,
    },
    layered: {
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      accent: '#38f9d7',
      layout: 'layered' as const,
    },
    horizontal: {
      background: '#ffffff',
      accent: '#0A1F44',
      layout: 'horizontal-scroll' as const,
    },
  },
  layoutStyles: {
    split: {
      display: 'grid',
      gap: '2.5rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    },
    grid: {
      display: 'grid',
      gap: '1.5rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    },
    carousel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    layered: {
      position: 'relative',
    },
    'horizontal-scroll': {
      display: 'flex',
      flexDirection: 'row',
      overflowX: 'auto',
      gap: '1.5rem',
    },
  },
  containerStyles: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '2rem',
  },
  overlayStyles: {
    position: 'absolute',
    inset: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  accentStyles: {
    position: 'absolute',
    bottom: '3.5rem',
    right: '2.5rem',
    height: '10rem',
    width: '10rem',
    borderRadius: '50%',
    opacity: 0.35,
    pointerEvents: 'none',
  },
  testimonialCardStyles: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '1.5rem',
    textAlign: 'left',
    color: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
  },
  quoteStyles: {
    fontSize: '1rem',
    lineHeight: '1.625',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  authorStyles: {
    marginTop: '1.25rem',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  authorNameStyles: {
    fontWeight: '600',
    color: 'white',
  },
  authorTitleStyles: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  authorMetricStyles: {
    marginTop: '0.5rem',
    fontWeight: '600',
    color: 'white',
  },
  carouselControlsStyles: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  carouselButtonStyles: {
    borderRadius: '9999px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  carouselButtonHoverStyles: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  carouselDotsStyles: {
    display: 'flex',
    gap: '0.5rem',
  },
  carouselDotStyles: {
    height: '0.5rem',
    width: '2rem',
    borderRadius: '9999px',
    transition: 'background-color 0.2s ease',
  },
  carouselDotActiveStyles: {
    backgroundColor: '#06b6d4',
  },
  carouselDotInactiveStyles: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  layeredItemStyles: {
    position: 'relative',
    marginBottom: '1.5rem',
  },
  labelPosition: {
    // Label positioning relative to cursor
    // Negative values move left/up, positive values move right/down
    translateX: -8, // pixels to move left from cursor
    translateY: -8, // pixels to move up from cursor (in addition to label height)
  },
  availableVariants: ['spotlight', 'cascade', 'flow', 'layered', 'horizontal'] as const,
  availableLayouts: ['split', 'grid', 'carousel', 'layered', 'horizontal-scroll'] as const,
}

// Testimonial item fields for Payload Block
const testimonialItemFields: Field[] = [
  {
    name: 'quote',
    type: 'textarea',
    label: 'Quote',
    required: true,
  },
  {
    name: 'author',
    type: 'text',
    label: 'Author Name',
    required: true,
  },
  {
    name: 'title',
    type: 'text',
    label: 'Title/Position',
  },
  {
    name: 'company',
    type: 'text',
    label: 'Company',
  },
  {
    name: 'avatar',
    type: 'upload',
    label: 'Avatar Image',
    relationTo: 'media',
  },
  {
    name: 'metric',
    type: 'text',
    label: 'Metric (optional)',
    admin: {
      description: 'Optional metric or stat to display',
    },
  },
  {
    name: 'videoUrl',
    type: 'text',
    label: 'Video URL (optional)',
    admin: {
      description: 'Optional video URL for modal playback',
    },
  },
]

// Payload Block configuration
export const Testimonial: Block = {
  slug: 'testimonial',
  interfaceName: 'TestimonialBlock',
  fields: [
    {
      name: 'variant',
      type: 'select',
      label: 'Variant',
      defaultValue: 'spotlight',
      options: [
        {
          label: 'Spotlight',
          value: 'spotlight',
        },
        {
          label: 'Cascade',
          value: 'cascade',
        },
        {
          label: 'Flow',
          value: 'flow',
        },
        {
          label: 'Layered',
          value: 'layered',
        },
        {
          label: 'Horizontal View',
          value: 'horizontal',
        },
      ],
    },
    {
      name: 'headline',
      type: 'text',
      label: 'Headline',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Testimonials',
      minRows: 1,
      fields: testimonialItemFields,
    },
  ],
  labels: {
    plural: 'Testimonials',
    singular: 'Testimonial',
  },
}
