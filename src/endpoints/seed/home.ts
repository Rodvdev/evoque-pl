import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'
import {
  createHeadingNode,
  createParagraphNode,
  createRichTextRoot,
} from './richTextHelpers'

type HomeArgs = {
  heroImage: Media
  metaImage: Media
}

export const home: (args: HomeArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage,
  metaImage,
}) => {
  return {
    slug: 'home',
    _status: 'published',
    hero: {
      type: 'highImpact',
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Get Started',
            url: '/contact',
          },
        },
        {
          link: {
            type: 'custom',
            appearance: 'outline',
            label: 'Contact us',
            url: '/contact',
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
                  text: 'A Live Voice Makes A Big Difference',
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
                  text: 'We are here to save you time, save you money, and make running your business a breeze.',
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
        blockName: 'Services Overview',
        blockType: 'scroll',
        variant: 'tabs-scroll',
        richText: createRichTextRoot([
          createHeadingNode('Our Services', 'h2'),
          createParagraphNode(
            'We do more than answering your calls. We can respond to customer service questions, dispatch urgent requests, speak different languages, schedule appointments, and more.',
          ),
        ]),
        tabsSettings: {
          items: [
            {
              title: 'Language Interpretation',
              description:
                'There are over 30 million Spanish speakers in the United States. For a perfect customer service score, you need to offer support in both English and Spanish. Let our interpreters represent your business. Scale up your language interpretation teams with our agile over the phone and video solutions.',
            },
            {
              title: 'Sales',
              description:
                'Add tremendous growth to your company. Our trained sales agents will use the right data and approach to bring additional revenue to partners.',
            },
            {
              title: 'Customer Services',
              description:
                'Growing a business requires more than just gaining new customers. You also need to maintain existing customer relationships for the long haul. That means you have to stay ahead of the competition and treat your customers with the utmost care, we can foster quality communication and customer support that will keep your customers coming back.',
            },
            {
              title: 'Billing',
              description:
                'Make accurate and faster billing processes with clients. Regardless of the model, we will support you through all parts of the billing cycle.',
            },
            {
              title: 'Collections Services',
              description:
                'Outsourcing your collections services is a viable cost-cutting measure without compromising on the efficacy factor. It is far cheaper than internal collections as you do not have to maintain payroll, printing/ mailing costs and other petty expenses. We are a multilingual Contact Center with experienced agents for effective collections and recoveries.',
            },
            {
              title: 'Help Desk',
              description:
                'At E-Voque, we know that your time is valuable and so are your customers. We can be standing by to handle help desk questions from basic to complex so that you and your employees can spend your time making more customers. We offer different levels of help desk services, depending on your business needs.',
            },
          ],
          duration: 800,
          imagePosition: 'left',
        },
        background: {
          type: 'none',
        },
        settings: {
          enableOnMobile: true,
          reducedMotion: false,
          useGPU: true,
        },
      },
      {
        blockName: 'Our Values',
        blockType: 'scroll',
        variant: 'text-image-scroll',
        richText: createRichTextRoot([
          createHeadingNode('What Drives Us', 'h2'),
        ]),
        textImageSettings: {
          items: [
            {
              title: 'Attitude',
              description:
                'No matter how upset a customer might be, agents must keep a positive attitude.',
            },
            {
              title: 'Adaptability',
              description:
                'Of the most essential customer service skills, adaptability to changing situations is crucial.',
            },
            {
              title: 'Organization',
              description:
                'During customer service exchanges, agents must be organized at all times to deliver timely service.',
            },
            {
              title: 'Cloud',
              description:
                'Choose the technology that best meets your operational constraints while enjoying the same features.',
            },
            {
              title: 'Process',
              description:
                "We create SLAs geared around our partners' objectives and quality that go beyond.",
            },
          ],
          duration: 800,
        },
        background: {
          type: 'none',
        },
        settings: {
          enableOnMobile: true,
          reducedMotion: false,
          useGPU: true,
        },
      },
      {
        blockName: 'Benefits Preview',
        blockType: 'scroll',
        variant: 'title-scale-scroll',
        titleScaleSettings: {
          title: 'Build Your Career With Us',
          subtitle: 'E-Voque delivers on our promises to our employees by offering an exceptional company culture.',
          titleAnimation: {
            enabled: true,
            variant: 'scale-down',
            pinPosition: '120vh',
            initialBackground: 'linear-gradient(135deg, #0A1F44 0%, #1a3a6b 50%, #2c5aa0 100%)',
            finalBackground: 'linear-gradient(to bottom right, #eff6ff, #ffffff)',
            overlayOpacity: 0.04,
            textColor: '#FFFFFF',
            darkTextColor: '#0A1F44',
            initialScale: 1.8,
            pinnedY: '42vw',
            exitY: '50vh',
            containerHeight: 150,
          },
        },
        background: {
          type: 'none',
        },
        settings: {
          enableOnMobile: true,
          reducedMotion: false,
          useGPU: true,
        },
      },
      {
        blockName: 'Testimonials',
        blockType: 'testimonial',
        variant: 'horizontal',
        headline: "We've Helped 200+ Members",
        description: '',
        testimonials: [
          {
            quote: 'E-Voque has transformed our customer service operations. Their bilingual support team handles our Spanish-speaking customers with professionalism and care, significantly improving our customer satisfaction scores.',
            author: 'Maria Rodriguez',
            title: 'Operations Manager',
            company: 'Tech Solutions Inc.',
          },
          {
            quote: 'The interpretation services provided by E-Voque have been invaluable. They help us communicate effectively with our diverse client base, breaking down language barriers and building stronger relationships.',
            author: 'James Chen',
            title: 'Customer Success Director',
            company: 'Global Services LLC',
          },
          {
            quote: 'Outsourcing our collections to E-Voque was one of the best decisions we made. Their multilingual team understands cultural nuances and communicates with empathy, resulting in higher recovery rates.',
            author: 'Sarah Johnson',
            title: 'Finance Manager',
            company: 'Healthcare Partners',
          },
          {
            quote: 'E-Voque\'s help desk support has been exceptional. They handle complex technical questions with expertise, allowing our internal team to focus on strategic initiatives. Highly recommended!',
            author: 'David Martinez',
            title: 'IT Director',
            company: 'Innovation Corp',
          },
          {
            quote: 'Working with E-Voque has been a game-changer for our sales team. Their trained agents understand our products and can effectively communicate value propositions in multiple languages.',
            author: 'Emily Thompson',
            title: 'Sales VP',
            company: 'Enterprise Solutions',
          },
        ],
      },
      {
        blockName: 'FAQ Section',
        blockType: 'content',
        columns: [
          {
            contentType: 'richText',
            richText: createRichTextRoot([
              createHeadingNode('Frequently Asked Questions', 'h2'),
            ]),
            size: 'full',
          },
          {
            contentType: 'accordion',
            size: 'full',
            accordion: {
              allowMultiple: false,
              size: 'md',
              items: [
                {
                  id: 'faq-recruitment-process',
                  title: 'What is the recruitment process at E-Voque like?',
                  content: 'At E-Voque, the process is simple and transparent. Once you submit your application, our Talent team reviews your profile to match it with open positions. If selected, you\'ll be invited for an online interview, followed by a short language and skills evaluation. Successful candidates receive a job offer and onboarding instructions within a few days.',
                },
                {
                  id: 'faq-experience-required',
                  title: 'Do I need previous experience in a call center to apply?',
                  content: 'Not necessarily. While experience in customer service or interpretation is a plus, we also welcome applicants with strong communication skills, adaptability, and a willingness to learn. E-Voque provides full training to help you succeed in your role.',
                },
                {
                  id: 'faq-positions-available',
                  title: 'What kind of positions are available?',
                  content: 'We frequently recruit for roles such as: Bilingual Customer Service Representatives, Language Interpreters (English–Spanish and other pairs), Sales and Billing Support Agents, Collections and Help Desk Specialists. Remote and in-office positions may be available depending on your location.',
                },
              ],
            },
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
          {
            link: {
              type: 'custom',
              appearance: 'outline',
              label: 'Join Our Team',
              url: '/join',
            },
          },
        ],
        richText: createRichTextRoot([
          createHeadingNode('Ready to Get Started?', 'h2'),
          createParagraphNode(
            'Contact us today to learn how E-Voque can help your business thrive with our professional call center and interpretation services.',
          ),
        ]),
      },
    ],
    meta: {
      description:
        'E-Voque is a leading call center and language interpretation service provider. We offer 24/7 customer service, sales support, billing, collections, and multilingual interpretation. Serving businesses across the Americas with professional BPO solutions.',
      image: heroImage.id,
      title: 'E-Voque | Professional Call Center & Language Interpretation Services',
    },
    title: 'E-Voque | Professional Call Center & Language Interpretation Services',
  } as RequiredDataFromCollectionSlug<'pages'>
}
