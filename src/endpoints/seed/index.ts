import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'

import { about } from './about'
import { applicationForm as applicationFormData } from './application-form'
import { benefits } from './benefits'
import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { join } from './join'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'
import { services } from './services'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
  'search',
]

const globals: GlobalSlug[] = ['header', 'footer']

const categories = ['Technology', 'News', 'Finance', 'Design', 'Software', 'Engineering']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('🌱 Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info('— Clearing collections and globals...')

  // clear the database
  payload.logger.info('  Clearing globals...')
  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  payload.logger.info(`  Clearing ${collections.length} collections...`)
  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  payload.logger.info('  Clearing versions...')
  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  payload.logger.info('✅ Collections and globals cleared')
  payload.logger.info('— Seeding users...')
  payload.logger.info('  Creating admin users...')

  // Delete existing users first
  await Promise.all([
    payload.delete({
      collection: 'users',
      depth: 0,
      where: {
        email: {
          equals: 'admin@e-voque.com',
        },
      },
    }).catch(() => {}), // Ignore if doesn't exist
    payload.delete({
      collection: 'users',
      depth: 0,
      where: {
        email: {
          equals: 'rodrigovdev01@gmail.com',
        },
      },
    }).catch(() => {}),
    payload.delete({
      collection: 'users',
      depth: 0,
      where: {
        email: {
          equals: 'alberto@matmax.world',
        },
      },
    }).catch(() => {}),
    payload.delete({
      collection: 'users',
      depth: 0,
      where: {
        email: {
          equals: 'demo-author@example.com',
        },
      },
    }).catch(() => {}),
  ])

  // Create admin user
  const adminUser = await payload.create({
    collection: 'users',
    data: {
      name: 'Admin User',
      email: 'admin@e-voque.com',
      password: 'admin123',
    },
  })

  // Create Rodrigo user
  const rodrigoUser = await payload.create({
    collection: 'users',
    data: {
      name: 'Rodrigo Vasquez',
      email: 'rodrigovdev01@gmail.com',
      password: '1Ewe9920.',
    },
  })

  // Create Alberto user
  const albertoUser = await payload.create({
    collection: 'users',
    data: {
      name: 'Alberto Matmax',
      email: 'alberto@matmax.world',
      password: 'Matmax2026',
    },
  })

  // Create demo author for posts
  const demoAuthor = await payload.create({
    collection: 'users',
    data: {
      name: 'Demo Author',
      email: 'demo-author@example.com',
      password: 'password',
    },
  })

  payload.logger.info(`✅ Created 4 users (admin, rodrigo, alberto, demo-author)`)
  payload.logger.info('— Seeding media...')
  payload.logger.info('  Fetching images from remote URLs...')

  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
  ])

  payload.logger.info('  Creating media documents...')
  const [image1Doc, image2Doc, image3Doc, imageHomeDoc, ...categoryDocs] = await Promise.all([
    payload.create({
      collection: 'media',
      data: image1,
      file: image1Buffer,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image2Buffer,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image3Buffer,
    }),
    payload.create({
      collection: 'media',
      data: imageHero1,
      file: hero1Buffer,
    }),
    ...categories.map((category) =>
      payload.create({
        collection: 'categories',
        data: {
          title: category,
          slug: category.toLowerCase().replace(/\s+/g, '-'),
        },
      }),
    ),
  ])

  payload.logger.info(`  Created ${categories.length} categories`)
  payload.logger.info('✅ Media and categories created')
  payload.logger.info('— Seeding posts...')

  // Do not create posts with `Promise.all` because we want the posts to be created in order
  // This way we can sort them by `createdAt` or `publishedAt` and they will be in the expected order
  const post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })

  const post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
  })

  const post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoAuthor }),
  })

  payload.logger.info('  Updating post relationships...')
  // update each post with related posts using direct-to-db calls for better performance
  // We don't need the returned documents or hooks to run, so we can bypass the API layer
  await Promise.all([
    payload.db.updateOne({
      collection: 'posts',
      id: post1Doc.id,
      data: {
        relatedPosts: [post2Doc.id, post3Doc.id],
      },
      req,
      returning: false,
    }),
    payload.db.updateOne({
      collection: 'posts',
      id: post2Doc.id,
      data: {
        relatedPosts: [post1Doc.id, post3Doc.id],
      },
      req,
      returning: false,
    }),
    payload.db.updateOne({
      collection: 'posts',
      id: post3Doc.id,
      data: {
        relatedPosts: [post1Doc.id, post2Doc.id],
      },
      req,
      returning: false,
    }),
  ])

  payload.logger.info('✅ Posts created and relationships updated')
  payload.logger.info('— Seeding forms...')
  payload.logger.info('  Creating contact form and application form...')

  const [contactForm, applicationForm] = await Promise.all([
    payload.create({
      collection: 'forms',
      depth: 0,
      data: contactFormData,
    }),
    payload.create({
      collection: 'forms',
      depth: 0,
      data: applicationFormData,
    }),
  ])

  payload.logger.info('✅ Forms created')
  payload.logger.info('— Seeding pages...')
  payload.logger.info('  Creating homepage...')

  // Create all pages in sequence for proper ordering
  const homepage = await payload.create({
    collection: 'pages',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: home({ heroImage: imageHomeDoc, metaImage: image2Doc }),
  })

  payload.logger.info('  Creating about page...')
  const aboutPage = await payload.create({
    collection: 'pages',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: about({ heroImage: imageHomeDoc, metaImage: image2Doc }),
  })

  payload.logger.info('  Creating services page...')
  const servicesPage = await payload.create({
    collection: 'pages',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: services({ heroImage: imageHomeDoc, metaImage: image2Doc }),
  })

  payload.logger.info('  Creating benefits page...')
  const benefitsPage = await payload.create({
    collection: 'pages',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: benefits({ heroImage: imageHomeDoc, metaImage: image2Doc }),
  })

  payload.logger.info('  Creating join page...')
  const joinPage = await payload.create({
    collection: 'pages',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: join({
      heroImage: imageHomeDoc,
      metaImage: image2Doc,
      applicationForm: applicationForm,
    }),
  })

  payload.logger.info('  Creating contact page...')
  const contactPage = await payload.create({
    collection: 'pages',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: contactPageData({
      contactForm: contactForm,
      heroImage: imageHomeDoc,
      metaImage: image2Doc,
    }),
  })

  payload.logger.info('✅ All 6 pages created (home, about, services, benefits, join, contact)')
  payload.logger.info('— Seeding globals...')
  payload.logger.info('  Updating header and footer navigation...')

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'reference',
              label: 'About',
              reference: {
                relationTo: 'pages',
                value: aboutPage.id,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Services',
              reference: {
                relationTo: 'pages',
                value: servicesPage.id,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Benefits',
              reference: {
                relationTo: 'pages',
                value: benefitsPage.id,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
          },
        ],
      },
      context: {
        disableRevalidate: true,
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          {
            link: {
              type: 'reference',
              label: 'About Us',
              reference: {
                relationTo: 'pages',
                value: aboutPage.id,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Services',
              reference: {
                relationTo: 'pages',
                value: servicesPage.id,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Careers',
              reference: {
                relationTo: 'pages',
                value: joinPage.id,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
          },
        ],
      },
      context: {
        disableRevalidate: true,
      },
    }),
  ])

  payload.logger.info('✅ Header and footer navigation updated')
  payload.logger.info('')
  payload.logger.info('🎉 Seeded database successfully!')
  payload.logger.info('')
  payload.logger.info('📊 Created:')
  payload.logger.info(`   • ${categories.length} categories`)
  payload.logger.info('   • 4 media files')
  payload.logger.info('   • 3 posts')
  payload.logger.info('   • 2 forms (contact, application)')
  payload.logger.info('   • 6 pages (home, about, services, benefits, join, contact)')
  payload.logger.info('   • 4 users (admin, rodrigo, alberto, demo-author)')
  payload.logger.info('   • Header and footer navigation configured')
  payload.logger.info('')
  payload.logger.info('🔐 Admin Credentials:')
  payload.logger.info('   Email: admin@e-voque.com')
  payload.logger.info('   Password: admin123')
  payload.logger.info('')
  payload.logger.info('📧 Contact Information:')
  payload.logger.info('   General: info@e-voque.com')
  payload.logger.info('   Careers: talent@e-voque.com')
  payload.logger.info('')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
