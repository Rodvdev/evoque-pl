import type { Form, Media } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'
import {
  createHeadingNode,
  createParagraphNode,
  createRichTextRoot,
} from './richTextHelpers'

type ContactArgs = {
  contactForm: Form
  heroImage: Media
  metaImage: Media
}

export const contact: (args: ContactArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  contactForm,
  heroImage,
  metaImage,
}) => {
  return {
    slug: 'contact',
    _status: 'published',
    hero: {
      type: 'highImpact',
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Send Message',
            url: '#contact-form',
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
                  text: "Let's Connect",
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
                  text: 'We\'re here to answer your questions and discuss how we can help your business',
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
        blockName: 'Contact Form',
        blockType: 'formBlock',
        enableIntro: true,
        form: contactForm,
        introContent: createRichTextRoot([
          createHeadingNode('Send Us a Message', 'h2'),
          createParagraphNode(
            'Fill out the form below and we\'ll get back to you within 24 hours',
          ),
        ]),
      },
      {
        blockName: 'Contact Information',
        blockType: 'content',
        columns: [
          {
            richText: createRichTextRoot([
              createHeadingNode('Get In Touch', 'h2'),
            ]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('General Inquiries', 'h3'),
              createParagraphNode(
                'For information about our services, partnerships, or general questions',
              ),
              createParagraphNode('Email: info@e-voque.com'),
            ]),
            size: 'half',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Join Our Team', 'h3'),
              createParagraphNode(
                'Interested in career opportunities? Contact our talent acquisition team',
              ),
              createParagraphNode('Email: talent@e-voque.com'),
            ]),
            size: 'half',
          },
        ],
      },
    ],
    meta: {
      description:
        'Contact E-Voque for call center services, language interpretation, and BPO solutions. Email info@e-voque.com for inquiries or talent@e-voque.com for careers. Get a free quote today!',
      image: metaImage.id,
      title: 'Contact E-Voque | Call Center Services | Get a Quote',
    },
    title: 'Contact E-Voque | Call Center Services | Get a Quote',
  } as RequiredDataFromCollectionSlug<'pages'>
}
