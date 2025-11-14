import { RequiredDataFromCollectionSlug } from 'payload'

export const applicationForm: RequiredDataFromCollectionSlug<'forms'> = {
  confirmationMessage: {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Thank you for your application!',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          tag: 'h2',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'We have received your application and our talent team will review it shortly. We will contact you within a few days if your profile matches our open positions.',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  },
  confirmationType: 'message',
  createdAt: '2023-01-12T21:47:41.374Z',
  emails: [
    {
      emailFrom: '"E-Voque Talent Team" <talent@e-voque.com>',
      emailTo: '{{email}}',
      message: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Thank you for applying to join the E-Voque team. We have received your application and will review it shortly.',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      subject: 'Thank you for your application to E-Voque',
    },
  ],
  fields: [
    {
      name: 'firstName',
      blockName: 'firstName',
      blockType: 'text',
      label: 'Full Name',
      required: true,
      width: 100,
    },
    {
      name: 'email',
      blockName: 'email',
      blockType: 'email',
      label: 'Email Address',
      required: true,
      width: 100,
    },
    {
      name: 'phone',
      blockName: 'phone',
      blockType: 'number',
      label: 'Phone Number',
      required: true,
      width: 100,
    },
    {
      name: 'position',
      blockName: 'position',
      blockType: 'select',
      label: 'Position of Interest',
      required: true,
      width: 100,
      options: [
        {
          label: 'Sales Representative',
          value: 'sales-representative',
        },
        {
          label: 'Billing Specialist',
          value: 'billing-specialist',
        },
        {
          label: 'Collections Agent',
          value: 'collections-agent',
        },
        {
          label: 'Customer Service Representative',
          value: 'customer-service-representative',
        },
        {
          label: 'Interpreter',
          value: 'interpreter',
        },
        {
          label: 'Help Desk Technician',
          value: 'help-desk-technician',
        },
      ],
    },
    {
      name: 'coverLetter',
      blockName: 'coverLetter',
      blockType: 'textarea',
      label: 'Why do you want to join E-Voque?',
      required: true,
      width: 100,
    },
  ],
  redirect: undefined,
  submitButtonLabel: 'Submit Application',
  title: 'Application Form',
  updatedAt: '2023-01-12T21:47:41.374Z',
}

