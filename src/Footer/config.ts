import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
        {
          name: 'showWhenLoggedIn',
          type: 'checkbox',
          label: 'Show when logged in',
          defaultValue: true,
          admin: {
            description: 'Show this navigation item when user is logged in',
          },
        },
        {
          name: 'showWhenLoggedOut',
          type: 'checkbox',
          label: 'Show when logged out',
          defaultValue: true,
          admin: {
            description: 'Show this navigation item when user is logged out',
          },
        },
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'actionButtons',
      type: 'array',
      label: 'Action Buttons',
      admin: {
        description: 'Call-to-action buttons displayed in the footer',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Button text',
          },
        },
        link({
          appearances: false,
          disableLabel: true,
        }),
        {
          name: 'variant',
          type: 'select',
          label: 'Button Style',
          defaultValue: 'default',
          options: [
            {
              label: 'Primary',
              value: 'default',
            },
            {
              label: 'Secondary',
              value: 'secondary',
            },
            {
              label: 'Outline',
              value: 'outline',
            },
            {
              label: 'Ghost',
              value: 'ghost',
            },
          ],
        },
        {
          name: 'size',
          type: 'select',
          label: 'Button Size',
          defaultValue: 'default',
          options: [
            {
              label: 'Small',
              value: 'sm',
            },
            {
              label: 'Default',
              value: 'default',
            },
            {
              label: 'Large',
              value: 'lg',
            },
          ],
        },
        {
          name: 'showWhenLoggedIn',
          type: 'checkbox',
          label: 'Show when logged in',
          defaultValue: true,
          admin: {
            description: 'Show this button when user is logged in',
          },
        },
        {
          name: 'showWhenLoggedOut',
          type: 'checkbox',
          label: 'Show when logged out',
          defaultValue: true,
          admin: {
            description: 'Show this button when user is logged out',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
