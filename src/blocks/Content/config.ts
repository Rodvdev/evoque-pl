import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'One Third',
        value: 'oneThird',
      },
      {
        label: 'Half',
        value: 'half',
      },
      {
        label: 'Two Thirds',
        value: 'twoThirds',
      },
      {
        label: 'Full',
        value: 'full',
      },
    ],
  },
  {
    name: 'contentType',
    type: 'radio',
    defaultValue: 'richText',
    options: [
      {
        label: 'Rich Text',
        value: 'richText',
      },
      {
        label: 'Accordion',
        value: 'accordion',
      },
    ],
    admin: {
      layout: 'horizontal',
    },
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
    admin: {
      condition: (_data, siblingData) => {
        return siblingData?.contentType !== 'accordion'
      },
    },
  },
  {
    name: 'accordion',
    type: 'group',
    label: 'Accordion',
    admin: {
      condition: (_data, siblingData) => {
        return siblingData?.contentType === 'accordion'
      },
    },
    fields: [
      {
        name: 'allowMultiple',
        type: 'checkbox',
        defaultValue: false,
        label: 'Allow Multiple Open',
      },
      {
        name: 'size',
        type: 'select',
        defaultValue: 'md',
        label: 'Size',
        options: [
          {
            label: 'Small',
            value: 'sm',
          },
          {
            label: 'Medium',
            value: 'md',
          },
          {
            label: 'Large',
            value: 'lg',
          },
        ],
      },
      {
        name: 'items',
        type: 'array',
        label: 'Accordion Items',
        minRows: 1,
        fields: [
          {
            name: 'id',
            type: 'text',
            required: true,
            admin: {
              description: 'Unique identifier for this item',
            },
          },
          {
            name: 'title',
            type: 'text',
            required: true,
            label: 'Title',
          },
          {
            name: 'content',
            type: 'textarea',
            required: true,
            label: 'Content',
          },
          {
            name: 'icon',
            type: 'text',
            label: 'Icon (optional)',
            admin: {
              description: 'Emoji or icon string',
            },
          },
          {
            name: 'disabled',
            type: 'checkbox',
            defaultValue: false,
            label: 'Disabled',
          },
        ],
      },
    ],
  },
  {
    name: 'enableLink',
    type: 'checkbox',
    admin: {
      condition: (_data, siblingData) => {
        return siblingData?.contentType !== 'accordion'
      },
    },
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink) && siblingData?.contentType !== 'accordion'
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
