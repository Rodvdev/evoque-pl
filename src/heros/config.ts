import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
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
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'brRadius',
      type: 'group',
      label: 'Border Radius',
      admin: {
        condition: (_, { type } = {}) => type === 'mediumImpact',
        description: 'Configure static border radius for medium impact hero',
      },
      fields: [
        {
          name: 'topLeft',
          type: 'select',
          dbName: 'tl',
          label: 'Top Left',
          defaultValue: '0',
          options: [
            { label: '0px', value: '0' },
            { label: '8px', value: '8' },
            { label: '16px', value: '16' },
            { label: '24px', value: '24' },
            { label: '32px', value: '32' },
            { label: '48px', value: '48' },
            { label: '64px', value: '64' },
            { label: '96px', value: '96' },
          ],
        },
        {
          name: 'topRight',
          type: 'select',
          dbName: 'tr',
          label: 'Top Right',
          defaultValue: '0',
          options: [
            { label: '0px', value: '0' },
            { label: '8px', value: '8' },
            { label: '16px', value: '16' },
            { label: '24px', value: '24' },
            { label: '32px', value: '32' },
            { label: '48px', value: '48' },
            { label: '64px', value: '64' },
            { label: '96px', value: '96' },
          ],
        },
        {
          name: 'bottomRight',
          type: 'select',
          dbName: 'br',
          label: 'Bottom Right',
          defaultValue: '0',
          options: [
            { label: '0px', value: '0' },
            { label: '8px', value: '8' },
            { label: '16px', value: '16' },
            { label: '24px', value: '24' },
            { label: '32px', value: '32' },
            { label: '48px', value: '48' },
            { label: '64px', value: '64' },
            { label: '96px', value: '96' },
          ],
        },
        {
          name: 'bottomLeft',
          type: 'select',
          dbName: 'bl',
          label: 'Bottom Left',
          defaultValue: '0',
          options: [
            { label: '0px', value: '0' },
            { label: '8px', value: '8' },
            { label: '16px', value: '16' },
            { label: '24px', value: '24' },
            { label: '32px', value: '32' },
            { label: '48px', value: '48' },
            { label: '64px', value: '64' },
            { label: '96px', value: '96' },
          ],
        },
      ],
    },
    {
      name: 'scroll',
      type: 'group',
      label: 'Scroll Effect',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
        description: 'Configure scroll animations for the hero section',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enable Scroll Effect',
          defaultValue: false,
        },
        {
          name: 'type',
          type: 'select',
          dbName: 'effectType',
          label: 'Effect Type',
          defaultValue: 'zoom-out',
          options: [
            {
              label: 'None',
              value: 'none',
            },
            {
              label: 'Zoom Out',
              value: 'zoom-out',
            },
            {
              label: 'Fade Out',
              value: 'fade-out',
            },
            {
              label: 'Parallax',
              value: 'parallax',
            },
          ],
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'zoom',
          type: 'group',
          label: 'Zoom Settings',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'zoom-out' && Boolean(siblingData?.enabled),
          },
          fields: [
            {
              name: 'zoomStart',
              type: 'number',
              label: 'Zoom Start (scale)',
              defaultValue: 1,
              min: 0.5,
              max: 2,
              admin: {
                step: 0.1,
                description: 'Starting scale (1 = normal size)',
              },
            },
            {
              name: 'zoomEnd',
              type: 'number',
              label: 'Zoom End (scale)',
              defaultValue: 0.95,
              min: 0.5,
              max: 2,
              admin: {
                step: 0.1,
                description: 'Ending scale (smaller = more zoom out)',
              },
            },
            {
              name: 'duration',
              type: 'number',
              label: 'Scroll Distance (pixels)',
              defaultValue: 300,
              min: 100,
              max: 2000,
              admin: {
                step: 50,
                description: 'How many pixels to scroll for full effect',
              },
            },
            {
              name: 'enableOnMobile',
              type: 'checkbox',
              label: 'Enable on Mobile',
              defaultValue: true,
            },
            {
              name: 'brRadius',
              type: 'group',
              label: 'Animated Border Radius (on Scroll)',
              admin: {
                description: 'Border radius animates during scroll zoom effect',
              },
              fields: [
                {
                  name: 'corners',
                  type: 'group',
                  label: 'Enabled Corners',
                  admin: {
                    components: {
                      Field: '@/components/admin/BorderRadiusSelector#BorderRadiusSelector',
                    },
                    description: 'Select which corners should have border radius applied',
                  },
                  fields: [
                    {
                      name: 'topLeft',
                      type: 'checkbox',
                      // @ts-expect-error - dbName on checkbox works at runtime, but TS types don't include it
                      dbName: 'tl',
                      label: 'Top Left',
                      defaultValue: false,
                      admin: {
                        hidden: true,
                      },
                    },
                    {
                      name: 'topRight',
                      type: 'checkbox',
                      // @ts-expect-error - dbName on checkbox works at runtime, but TS types don't include it
                      dbName: 'tr',
                      label: 'Top Right',
                      defaultValue: false,
                      admin: {
                        hidden: true,
                      },
                    },
                    {
                      name: 'bottomRight',
                      type: 'checkbox',
                      // @ts-expect-error - dbName on checkbox works at runtime, but TS types don't include it
                      dbName: 'br',
                      label: 'Bottom Right',
                      defaultValue: false,
                      admin: {
                        hidden: true,
                      },
                    },
                    {
                      name: 'bottomLeft',
                      type: 'checkbox',
                      // @ts-expect-error - dbName on checkbox works at runtime, but TS types don't include it
                      dbName: 'bl',
                      label: 'Bottom Left',
                      defaultValue: false,
                      admin: {
                        hidden: true,
                      },
                    },
                  ],
                },
                {
                  name: 'value',
                  type: 'select',
                  dbName: 'brVal',
                  label: 'Border Radius Value',
                  defaultValue: '24',
                  admin: {
                    description: 'Final border radius value when scroll completes',
                  },
                  options: [
                    { label: '0px', value: '0' },
                    { label: '8px', value: '8' },
                    { label: '16px', value: '16' },
                    { label: '24px', value: '24' },
                    { label: '32px', value: '32' },
                    { label: '48px', value: '48' },
                    { label: '64px', value: '64' },
                    { label: '96px', value: '96' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  label: false,
}
