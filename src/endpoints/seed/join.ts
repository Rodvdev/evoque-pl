import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Form, Media } from '@/payload-types'
import {
  createHeadingNode,
  createParagraphNode,
  createRichTextRoot,
} from './richTextHelpers'

type JoinArgs = {
  heroImage: Media
  metaImage: Media
  applicationForm: Form
}

export const join: (args: JoinArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage,
  metaImage,
  applicationForm,
}) => {
  return {
    slug: 'join',
    _status: 'published',
    hero: {
      type: 'highImpact',
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Apply Now',
            url: '#application-form',
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
                  text: 'Start Your Journey With E-Voque',
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
                  text: 'Where your voice makes a difference every day',
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
        blockName: 'Application Form',
        blockType: 'formBlock',
        enableIntro: true,
        form: applicationForm,
        introContent: createRichTextRoot([
          createHeadingNode('Apply Today', 'h2'),
          createParagraphNode(
            'Fill out the application form below and our talent team will review your profile. We\'re always looking for passionate individuals to join our growing team.',
          ),
        ]),
      },
      {
        blockName: 'FAQ Section',
        blockType: 'content',
        columns: [
          {
            richText: createRichTextRoot([
              createHeadingNode('Frequently Asked Questions', 'h2'),
            ]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('What is the recruitment process at E-Voque like?', 'h3'),
              createParagraphNode(
                'At E-Voque, the process is simple and transparent. Once you submit your application, our Talent team reviews your profile to match it with open positions. If selected, you\'ll be invited for an online interview, followed by a short language and skills evaluation. Successful candidates receive a job offer and onboarding instructions within a few days.',
              ),
            ]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('Do I need previous experience in a call center to apply?', 'h3'),
              createParagraphNode(
                'Not necessarily. While experience in customer service or interpretation is a plus, we also welcome applicants with strong communication skills, adaptability, and a willingness to learn. E-Voque provides full training to help you succeed in your role.',
              ),
            ]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('What kind of positions are available?', 'h3'),
              createParagraphNode(
                'We frequently recruit for roles such as: Bilingual Customer Service Representatives, Language Interpreters (English–Spanish and other pairs), Sales and Billing Support Agents, Collections and Help Desk Specialists. Remote and in-office positions may be available depending on your location.',
              ),
            ]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('What training and support will I receive?', 'h3'),
              createParagraphNode(
                'All new hires receive comprehensive onboarding that includes: Company orientation and communication protocols, Language and interpretation techniques, Customer service best practices, and Tools and platform usage. Our team leaders and QA specialists continuously guide you to ensure professional growth and consistent quality.',
              ),
            ]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('What benefits does E-Voque offer its employees?', 'h3'),
              createParagraphNode(
                'E-Voque provides a supportive and rewarding environment that includes: Continuous training and skill development, Performance bonuses and incentives, Flexible schedules for selected roles, Career advancement opportunities, and A positive, multicultural work atmosphere.',
              ),
            ]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: createRichTextRoot([
              createHeadingNode('How can I increase my chances of being hired?', 'h3'),
              createParagraphNode(
                'Make sure your application highlights your language proficiency, clear communication, and customer service skills. Be punctual for interviews, demonstrate empathy and adaptability, and show enthusiasm for helping clients — qualities that define the E-Voque team.',
              ),
            ]),
            size: 'full',
          },
        ],
      },
    ],
    meta: {
      description:
        'Join E-Voque call center team! Apply for call center agent, interpreter, customer service, sales, and billing positions. Bilingual professionals wanted. Remote and on-site opportunities available. Start your career today!',
      image: metaImage.id,
      title: 'Join E-Voque Team | Call Center Jobs & Careers | Apply Today',
    },
    title: 'Join E-Voque Team | Call Center Jobs & Careers | Apply Today',
  } as RequiredDataFromCollectionSlug<'pages'>
}

