import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'
import {
  createHeadingNode,
  createParagraphNode,
  createRichTextRoot,
} from './richTextHelpers'

type BenefitsArgs = {
  heroImage: Media
  metaImage: Media
}

export const benefits: (args: BenefitsArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage,
  metaImage,
}) => {
  return {
    slug: 'benefits',
    _status: 'published',
    hero: {
      type: 'highImpact',
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Join Our Team',
            url: '/join',
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
                  text: 'Build Your Future With E-Voque',
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
                  text: 'Join a team that invests in your growth and success',
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
        blockName: 'Benefits Overview',
        blockType: 'content',
        columns: [
          {
            richText: createRichTextRoot([
              createHeadingNode('Build Your Career With Us', 'h2'),
            ]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createParagraphNode(
                'E-Voque delivers on our promises to our employees by offering an exceptional company culture.',
              ),
            ]),
            size: 'full',
          },
        ],
      },
      {
        blockName: 'Benefits List',
        blockType: 'content',
        columns: [
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Numerous Welfare and Benefits', 'h3'),
              createParagraphNode('Comprehensive benefits package for all team members'),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Key Takeaway', 'h3'),
              createParagraphNode('Make an impact from day one'),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Career Growth', 'h3'),
              createParagraphNode(
                'Clear paths for advancement and professional development',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('High Income and Faster Promotion', 'h3'),
              createParagraphNode('Competitive compensation with performance-based advancement'),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Training and Coaching', 'h3'),
              createParagraphNode('Continuous learning opportunities with expert guidance'),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Growth and Skill Development', 'h3'),
              createParagraphNode('Expand your skillset with ongoing development programs'),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Teamwork Makes the Dream Work', 'h3'),
              createParagraphNode('Collaborative culture that values every contribution'),
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
              label: 'Apply Now',
              url: '/join',
            },
          },
        ],
        richText: createRichTextRoot([
          createHeadingNode('Ready to Join Our Team?', 'h2'),
          createParagraphNode(
            'Start your career with E-Voque and discover opportunities for growth, development, and success.',
          ),
        ]),
      },
    ],
    meta: {
      description:
        'Build your career with E-Voque. Exceptional employee benefits, career growth, faster promotions, high income, comprehensive training, and teamwork culture. Join our call center and interpretation services team today.',
      image: metaImage.id,
      title: 'Employee Benefits & Careers | Join E-Voque Call Center Team',
    },
    title: 'Employee Benefits & Careers | Join E-Voque Call Center Team',
  } as RequiredDataFromCollectionSlug<'pages'>
}


