import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'
import {
  createHeadingNode,
  createParagraphNode,
  createRichTextRoot,
} from './richTextHelpers'

type ServicesArgs = {
  heroImage: Media
  metaImage: Media
}

export const services: (args: ServicesArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage,
  metaImage,
}) => {
  return {
    slug: 'services',
    _status: 'published',
    hero: {
      type: 'highImpact',
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Contact Us',
            url: '/contact',
          },
        },
        {
          link: {
            type: 'custom',
            appearance: 'outline',
            label: 'Learn More',
            url: '/about',
          },
        },
      ],
      media: heroImage.id,
      richText: {
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
                  text: 'Our full-scale inbound call center service cover',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h1',
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
                  text: 'We do more than answering your calls; we can respond to customer service questions, dispatch urgent requests, speak different languages, schedule appointments, and more. We are here to save you time, save you money, and make running your business a breeze.',
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
    },
    layout: [
      {
        blockName: 'Service Portfolio',
        blockType: 'content',
        columns: [
          {
            richText: createRichTextRoot([
              createHeadingNode('Our Service Portfolio', 'h2'),
            ]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Sales', 'h3'),
              createParagraphNode(
                'Our professional sales team helps you grow revenue through proven techniques and exceptional customer engagement. We specialize in outbound sales, lead qualification, and closing deals that drive business growth.',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Billing', 'h3'),
              createParagraphNode(
                'Accurate, efficient billing services that streamline your payment processes. We handle invoice generation, payment processing, and account management with precision and professionalism.',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Collections', 'h3'),
              createParagraphNode(
                'Professional collection services that recover outstanding payments while maintaining positive customer relationships. Our approach is firm yet respectful, ensuring maximum recovery rates.',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Customer Service', 'h3'),
              createParagraphNode(
                'Exceptional customer support that enhances satisfaction and builds loyalty. Our trained representatives handle inquiries, resolve issues, and create positive experiences with every interaction.',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Language Interpretation', 'h3'),
              createParagraphNode(
                'Professional interpretation services in multiple languages, breaking down communication barriers for global business. Our certified interpreters ensure accurate, culturally-sensitive communication.',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Help Desk', 'h3'),
              createParagraphNode(
                '24/7 technical support and help desk services to assist your customers whenever they need it. We provide tier 1 and tier 2 support, troubleshooting, and issue escalation.',
              ),
            ]),
            size: 'oneThird',
          },
        ],
      },
      {
        blockName: 'Call to Action',
        blockType: 'cta',
        links: [
          {
            link: {
              type: 'custom',
              appearance: 'default',
              label: 'Get a Quote',
              url: '/contact',
            },
          },
          {
            link: {
              type: 'custom',
              appearance: 'outline',
              label: 'Contact Us',
              url: '/contact',
            },
          },
        ],
        richText: createRichTextRoot([
          createHeadingNode('Ready to Get Started?', 'h2'),
          createParagraphNode(
            'Contact us today to learn how E-Voque can help your business with our professional call center and interpretation services.',
          ),
        ]),
      },
    ],
    meta: {
      description:
        'Comprehensive call center services including customer service, sales, billing, collections, language interpretation, and help desk. 24/7 multilingual support. Full-scale inbound call center solutions for businesses across the Americas.',
      image: metaImage.id,
      title: 'Call Center Services | Customer Service | Language Interpretation | E-Voque',
    },
    title: 'Call Center Services | Customer Service | Language Interpretation | E-Voque',
  } as RequiredDataFromCollectionSlug<'pages'>
}


