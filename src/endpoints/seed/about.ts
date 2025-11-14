import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'
import {
  createHeadingNode,
  createParagraphNode,
  createRichTextRoot,
} from './richTextHelpers'

type AboutArgs = {
  heroImage: Media
  metaImage: Media
}

export const about: (args: AboutArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage,
  metaImage,
}) => {
  return {
    slug: 'about',
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
            label: 'Join Our Team',
            url: '/join',
          },
        },
      ],
      media: heroImage.id,
      richText: createRichTextRoot([
        createHeadingNode('We Are More Than An Inbound Call Center', 'h1'),
        createParagraphNode(
          'E-Voque is a contact center, with a call center beginning. However, by utilizing all communication channels and employing Omnichannel support, e-voque has established a firm foothold in the contact center industry.',
        ),
      ]),
    },
    layout: [
      {
        blockName: 'Company Overview',
        blockType: 'content',
        columns: [
          {
            richText: createRichTextRoot([
              createHeadingNode('Who We Are & What Motivates Us', 'h2'),
            ]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Who we are', 'h3'),
              createParagraphNode(
                'We are a company that provides an excellent service by which our customers can highly meet their needs. Our depth of coverage across global markets effectively meets your strategy and any people, process and technology requirements.',
              ),
            ]),
            size: 'half',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('What motivate us', 'h3'),
              createParagraphNode(
                'Being a reference leader of the Latin-American BPO Industry with international recognition, for the service quality we provide as well as for the solidity, effectiveness and efficiency of our professional team.',
              ),
            ]),
            size: 'half',
          },
        ],
      },
      {
        blockName: 'Our Values',
        blockType: 'content',
        columns: [
          {
            richText: createRichTextRoot([
              createHeadingNode('Our Core Values', 'h2'),
            ]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Attitude', 'h3'),
              createParagraphNode(
                'No matter how upset a customer might be, agents must keep a positive attitude.',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Adaptability', 'h3'),
              createParagraphNode(
                'Of the most essential customer service skills, adaptability to changing situations is crucial.',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Organization', 'h3'),
              createParagraphNode(
                'During customer service exchanges, agents must be organized at all times to deliver timely service.',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Cloud', 'h3'),
              createParagraphNode(
                'Choose the technology that best meets your operational constraints while enjoying the same features.',
              ),
            ]),
            size: 'half',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Process', 'h3'),
              createParagraphNode(
                "We create SLAs geared around our partners' objectives and quality that go beyond.",
              ),
            ]),
            size: 'half',
          },
        ],
      },
      {
        blockName: 'Company Features',
        blockType: 'content',
        columns: [
          {
            richText: createRichTextRoot([
              createHeadingNode('Why Choose E-Voque', 'h2'),
            ]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createParagraphNode('Innovative Working Activities'),
              createParagraphNode('100% Guarantee Issued for Client'),
              createParagraphNode('Dedicated Team Member'),
              createParagraphNode('Safe & Secure Environment'),
            ]),
            size: 'full',
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
              label: 'Contact Us',
              url: '/contact',
            },
          },
        ],
        richText: createRichTextRoot([
          createHeadingNode('Ready to Work With Us?', 'h2'),
          createParagraphNode(
            'Discover how E-Voque can help your business with our professional call center and interpretation services.',
          ),
        ]),
      },
    ],
    meta: {
      description:
        'Learn about E-Voque, a leading call center and BPO company specializing in customer service, language interpretation, sales, billing, and collections. Discover our commitment to excellence and our values.',
      image: metaImage.id,
      title: 'About E-Voque | Leading Call Center & BPO Company',
    },
    title: 'About E-Voque | Leading Call Center & BPO Company',
  } as RequiredDataFromCollectionSlug<'pages'>
}

