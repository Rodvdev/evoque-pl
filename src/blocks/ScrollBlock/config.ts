import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

// Background configuration fields
const backgroundFields: Field[] = [
  {
    name: 'type',
    type: 'select',
    label: 'Background Type',
    defaultValue: 'none',
    options: [
      {
        label: 'None',
        value: 'none',
      },
      {
        label: 'Color',
        value: 'COLOR',
      },
      {
        label: 'Gradient',
        value: 'GRADIENT',
      },
      {
        label: 'Image',
        value: 'IMAGE',
      },
      {
        label: 'Video',
        value: 'VIDEO',
      },
      {
        label: 'Carousel',
        value: 'CAROUSEL',
      },
    ],
    required: true,
  },
  {
    name: 'color',
    type: 'text',
    label: 'Background Color',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'COLOR',
      description: 'Enter a hex color (e.g., #000000) or CSS color name',
    },
  },
  {
    name: 'gradient',
    type: 'text',
    label: 'Gradient',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'GRADIENT',
      description: 'Enter CSS gradient (e.g., linear-gradient(135deg, #667eea 0%, #764ba2 100%))',
    },
  },
  {
    name: 'image',
    type: 'upload',
    label: 'Background Image',
    relationTo: 'media',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'IMAGE',
    },
  },
  {
    name: 'video',
    type: 'upload',
    label: 'Background Video',
    relationTo: 'media',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'VIDEO',
    },
  },
  {
    name: 'size',
    type: 'select',
    label: 'Background Size',
    defaultValue: 'cover',
    options: [
      {
        label: 'Cover',
        value: 'cover',
      },
      {
        label: 'Contain',
        value: 'contain',
      },
      {
        label: 'Auto',
        value: 'auto',
      },
    ],
    admin: {
      condition: (_, siblingData) =>
        ['IMAGE', 'VIDEO', 'CAROUSEL'].includes(siblingData?.type),
    },
  },
  {
    name: 'position',
    type: 'select',
    label: 'Background Position',
    defaultValue: 'center',
    options: [
      {
        label: 'Center',
        value: 'center',
      },
      {
        label: 'Top',
        value: 'top',
      },
      {
        label: 'Bottom',
        value: 'bottom',
      },
      {
        label: 'Left',
        value: 'left',
      },
      {
        label: 'Right',
        value: 'right',
      },
    ],
    admin: {
      condition: (_, siblingData) =>
        ['IMAGE', 'VIDEO', 'CAROUSEL'].includes(siblingData?.type),
    },
  },
  {
    name: 'opacity',
    type: 'number',
    label: 'Opacity',
    defaultValue: 1,
    min: 0,
    max: 1,
    admin: {
      condition: (_, siblingData) => siblingData?.type !== 'none',
      step: 0.1,
    },
  },
  {
    name: 'carousel',
    type: 'group',
    label: 'Carousel Settings',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'CAROUSEL',
    },
    fields: [
      {
        name: 'images',
        type: 'array',
        label: 'Images',
        fields: [
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            required: true,
          },
        ],
      },
      {
        name: 'speed',
        type: 'number',
        label: 'Transition Speed (ms)',
        defaultValue: 3000,
        min: 1000,
        max: 10000,
      },
      {
        name: 'autoplay',
        type: 'checkbox',
        label: 'Autoplay',
        defaultValue: true,
      },
    ],
  },
]

// Scroll item fields (for text-image-scroll, tabs-scroll, bubble-list-scroll)
const scrollItemFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    label: 'Title',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
    label: 'Description',
    required: true,
  },
  {
    name: 'icon',
    type: 'upload',
    label: 'Icon/Image',
    relationTo: 'media',
  },
  {
    name: 'enableCTA',
    type: 'checkbox',
    label: 'Enable CTA Button',
  },
  {
    name: 'cta',
    type: 'group',
    label: 'CTA Button',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enableCTA),
    },
    fields: [
      {
        name: 'text',
        type: 'text',
        label: 'Button Text',
        admin: {
          description: 'Required when CTA is enabled',
        },
      },
      {
        name: 'href',
        type: 'text',
        label: 'URL',
        admin: {
          description: 'Required when CTA is enabled',
        },
      },
      {
        name: 'variant',
        type: 'select',
        label: 'Button Variant',
        dbName: 'btnVariant',
        defaultValue: 'primary',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Outline', value: 'outline' },
          { label: 'Ghost', value: 'ghost' },
        ],
      },
      {
        name: 'size',
        type: 'select',
        label: 'Button Size',
        dbName: 'btnSize',
        defaultValue: 'md',
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ],
      },
    ],
  },
]

// Landing zone fields (for tabs-scroll, title-scale-scroll)
const landingZoneFields: Field[] = [
  {
    name: 'enabled',
    type: 'checkbox',
    label: 'Enable Landing Zone',
    defaultValue: false,
  },
  {
    name: 'height',
    type: 'number',
    label: 'Height (vh)',
    defaultValue: 20,
    min: 0,
    max: 100,
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: 'backgroundColor',
    type: 'text',
    label: 'Background Color',
    defaultValue: 'transparent',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: 'showTitle',
    type: 'checkbox',
    label: 'Show Title',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: 'titleText',
    type: 'text',
    label: 'Title Text',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled && siblingData?.showTitle),
    },
  },
  {
    name: 'titleColor',
    type: 'text',
    label: 'Title Color',
    defaultValue: '#0A1F44',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled && siblingData?.showTitle),
    },
  },
  {
    name: 'alignment',
    type: 'select',
    label: 'Alignment',
    dbName: 'align',
    defaultValue: 'center',
    options: [
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ],
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: 'padding',
    type: 'group',
    label: 'Padding',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
    fields: [
      {
        name: 'top',
        type: 'number',
        label: 'Top',
        defaultValue: 2,
      },
      {
        name: 'bottom',
        type: 'number',
        label: 'Bottom',
        defaultValue: 2,
      },
      {
        name: 'left',
        type: 'number',
        label: 'Left',
        defaultValue: 4,
      },
      {
        name: 'right',
        type: 'number',
        label: 'Right',
        defaultValue: 4,
      },
    ],
  },
]

// Title animation fields (for title-scale-scroll)
const titleAnimationFields: Field[] = [
  {
    name: 'enabled',
    type: 'checkbox',
    label: 'Enable Title Animation',
    defaultValue: true,
  },
  {
    name: 'variant',
    type: 'select',
    label: 'Animation Variant',
    dbName: 'animVariant',
    defaultValue: 'scale-down',
    options: [
      { label: 'Scale Down', value: 'scale-down' },
      { label: 'Simple Fade', value: 'simple-fade' },
    ],
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: 'pinPosition',
    type: 'text',
    label: 'Pin Position',
    defaultValue: '120vh',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
      description: 'Position where title lands (e.g., 120vh)',
    },
  },
  {
    name: 'initialBackground',
    type: 'text',
    label: 'Initial Background',
    defaultValue: 'linear-gradient(135deg, #0A1F44 0%, #1a3a6b 50%, #2c5aa0 100%)',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: 'finalBackground',
    type: 'text',
    label: 'Final Background',
    defaultValue: 'linear-gradient(to bottom right, #eff6ff, #ffffff)',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: 'cloudBackground',
    type: 'upload',
    label: 'Cloud Background Image',
    relationTo: 'media',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: 'overlayOpacity',
    type: 'number',
    label: 'Overlay Opacity',
    defaultValue: 0.04,
    min: 0,
    max: 1,
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
      step: 0.01,
    },
  },
  {
    name: 'textColor',
    type: 'text',
    label: 'Initial Text Color',
    defaultValue: '#FFFFFF',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: 'darkTextColor',
    type: 'text',
    label: 'Final Text Color',
    defaultValue: '#0A1F44',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: 'initialScale',
    type: 'number',
    label: 'Initial Scale',
    defaultValue: 1.8,
    min: 0.5,
    max: 3,
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
      step: 0.1,
    },
  },
  {
    name: 'pinnedY',
    type: 'text',
    label: 'Pinned Y Position',
    defaultValue: '42vw',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: 'exitY',
    type: 'text',
    label: 'Exit Y Position',
    defaultValue: '50vh',
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: 'containerHeight',
    type: 'number',
    label: 'Container Height (vh)',
    defaultValue: 150,
    min: 50,
    max: 500,
    admin: {
      condition: (_, siblingData) => Boolean(siblingData?.enabled),
    },
  },
]

export const ScrollBlock: Block = {
  slug: 'scroll',
  interfaceName: 'ScrollBlock',
  fields: [
    {
      name: 'variant',
      type: 'select',
      label: 'Scroll Variant',
      defaultValue: 'zoom',
      required: true,
      options: [
        {
          label: 'Zoom Effect',
          value: 'zoom',
        },
        {
          label: 'Text-Image Scroll',
          value: 'text-image-scroll',
        },
        {
          label: 'Tabs Scroll',
          value: 'tabs-scroll',
        },
        {
          label: 'Title Scale Scroll',
          value: 'title-scale-scroll',
        },
        {
          label: 'Bubble List Scroll',
          value: 'bubble-list-scroll',
        },
      ],
    },
    // Zoom variant fields
    {
      name: 'zoomSettings',
      type: 'group',
      label: 'Zoom Settings',
      admin: {
        condition: (_, siblingData) => siblingData?.variant === 'zoom',
      },
      fields: [
        {
          name: 'zoomStart',
          type: 'number',
          label: 'Zoom Start (scale)',
          defaultValue: 1,
          min: 0.5,
          max: 3,
          admin: {
            step: 0.1,
          },
        },
        {
          name: 'zoomEnd',
          type: 'number',
          label: 'Zoom End (scale)',
          defaultValue: 0.9,
          min: 0.5,
          max: 3,
          admin: {
            step: 0.1,
          },
        },
        {
          name: 'duration',
          type: 'number',
          label: 'Duration (pixels)',
          defaultValue: 300,
          min: 100,
          max: 2000,
        },
        {
          name: 'reverseDuration',
          type: 'number',
          label: 'Reverse Duration (pixels)',
          defaultValue: 1000,
          min: 100,
          max: 2000,
        },
        {
          name: 'borderRadius',
          type: 'number',
          label: 'Border Radius (px)',
          defaultValue: 0,
          min: 0,
          max: 100,
        },
        {
          name: 'smoothness',
          type: 'number',
          label: 'Smoothness',
          defaultValue: 1,
          min: 0.1,
          max: 5,
          admin: {
            step: 0.1,
          },
        },
      ],
    },
    // Text-Image Scroll variant fields
    {
      name: 'textImageSettings',
      type: 'group',
      label: 'Text-Image Scroll Settings',
      // @ts-expect-error - dbName on groups works at runtime, but TS types don't include it
      dbName: 'textImg',
      admin: {
        condition: (_, siblingData) => siblingData?.variant === 'text-image-scroll',
      },
      fields: [
        {
          name: 'items',
          type: 'array',
          label: 'Items',
          fields: scrollItemFields,
        },
        {
          name: 'foundationText',
          type: 'text',
          label: 'Foundation Text',
        },
        {
          name: 'foundationTextVariant',
          type: 'select',
          label: 'Foundation Text Animation',
          dbName: 'foundVar',
          defaultValue: 'random-chars',
          options: [
            { label: 'Random Chars', value: 'random-chars' },
            { label: 'Fade In', value: 'fade-in' },
            { label: 'Slide Up', value: 'slide-up' },
            { label: 'Typewriter', value: 'typewriter' },
          ],
        },
        {
          name: 'duration',
          type: 'number',
          label: 'Duration per Item (pixels)',
          defaultValue: 800,
          min: 100,
          max: 2000,
        },
      ],
    },
    // Tabs Scroll variant fields
    {
      name: 'tabsSettings',
      type: 'group',
      label: 'Tabs Scroll Settings',
      admin: {
        condition: (_, siblingData) => siblingData?.variant === 'tabs-scroll',
      },
      fields: [
        {
          name: 'items',
          type: 'array',
          label: 'Items',
          fields: scrollItemFields,
        },
        {
          name: 'tabClickScrollSpeed',
          type: 'number',
          label: 'Tab Click Scroll Speed',
          defaultValue: 2,
          min: 0.5,
          max: 10,
          admin: {
            step: 0.5,
            description: 'Higher = slower, smoother scroll',
          },
        },
        {
          name: 'imagePosition',
          type: 'select',
          label: 'Image Position',
          defaultValue: 'left',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ],
        },
        {
          name: 'landingZone',
          type: 'group',
          label: 'Landing Zone',
          // @ts-expect-error - dbName on groups works at runtime, but TS types don't include it
          dbName: 'landing',
          fields: landingZoneFields,
        },
        {
          name: 'duration',
          type: 'number',
          label: 'Duration per Item (pixels)',
          defaultValue: 800,
          min: 100,
          max: 2000,
        },
      ],
    },
    // Title Scale Scroll variant fields
    {
      name: 'titleScaleSettings',
      type: 'group',
      label: 'Title Scale Scroll Settings',
      dbName: 'titleScale',
      admin: {
        condition: (_, siblingData) => siblingData?.variant === 'title-scale-scroll',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          defaultValue: 'Our Services',
        },
        {
          name: 'subtitle',
          type: 'text',
          label: 'Subtitle',
          defaultValue: 'We do more than answering your calls',
        },
        {
          name: 'titleAnimation',
          type: 'group',
          label: 'Title Animation',
          // @ts-expect-error - dbName on groups works at runtime, but TS types don't include it
          dbName: 'titleAnim',
          fields: titleAnimationFields,
        },
        {
          name: 'landingZone',
          type: 'group',
          label: 'Landing Zone',
          // @ts-expect-error - dbName on groups works at runtime, but TS types don't include it
          dbName: 'landing',
          fields: landingZoneFields,
        },
      ],
    },
    // Bubble List Scroll variant fields
    {
      name: 'bubbleListSettings',
      type: 'group',
      label: 'Bubble List Scroll Settings',
      admin: {
        condition: (_, siblingData) => siblingData?.variant === 'bubble-list-scroll',
      },
      fields: [
        {
          name: 'items',
          type: 'array',
          label: 'Items',
          fields: scrollItemFields,
        },
        {
          name: 'infinitePhaseText',
          type: 'text',
          label: 'Infinite Phase Text',
        },
        {
          name: 'duration',
          type: 'number',
          label: 'Duration per Item (pixels)',
          defaultValue: 800,
          min: 100,
          max: 2000,
        },
      ],
    },
    // Background configuration
    {
      name: 'background',
      type: 'group',
      label: 'Background',
      fields: backgroundFields,
    },
    // Content (richText)
    {
      name: 'richText',
      type: 'richText',
      label: 'Content',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      admin: {
        description: 'Optional content that will be rendered within the scroll section',
      },
    },
    // Links (optional CTA buttons)
    linkGroup({
      overrides: {
        maxRows: 2,
        admin: {
          description: 'Optional call-to-action buttons',
        },
      },
    }),
    // Common settings
    {
      name: 'settings',
      type: 'group',
      label: 'Settings',
      fields: [
        {
          name: 'enableOnMobile',
          type: 'checkbox',
          label: 'Enable on Mobile',
          defaultValue: true,
        },
        {
          name: 'reducedMotion',
          type: 'checkbox',
          label: 'Respect Reduced Motion',
          defaultValue: false,
        },
        {
          name: 'useGPU',
          type: 'checkbox',
          label: 'Use GPU Acceleration',
          defaultValue: true,
        },
      ],
    },
  ],
  labels: {
    plural: 'Scroll Blocks',
    singular: 'Scroll Block',
  },
}
