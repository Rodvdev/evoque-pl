# Seed Migration Guide: Prisma to Payload CMS

## Overview

This document describes the current Prisma-based seed implementation and provides a comprehensive guide for migrating to Payload CMS.

---

## Current Prisma Seed Structure

### Seed Files

The project currently uses multiple Prisma seed files located in `packages/prisma/`:

1. **`seed.ts`** - Main comprehensive seed file (6000+ lines)
2. **`seed-evoque.ts`** - E-Voque specific seed with brand colors and components
3. **`seed-complete.ts`** - Complete showcase seed
4. **`seed-complete-showcase.ts`** - Showcase with all components and effects

### Current Architecture

#### Database Models (Prisma Schema)

The current Prisma schema includes the following main models:

- **User** - User accounts with roles and authentication
- **Role** - User roles (super_admin, Admin, Interpreter, Client)
- **Permission** - Granular permissions system
- **Language** - Multi-language support
- **Page** - Content pages with templates and sections
- **Form** - Dynamic forms with fields
- **FormField** - Form field definitions
- **FormSubmission** - Form submission data
- **MediaFile** - Media file management
- **Menu** - Navigation menus
- **MenuItem** - Menu items
- **WebsiteSection** - Page sections
- **SectionComponent** - Section components
- **Background** - Background configurations
- **PageTemplate** - Reusable page templates
- **WebsiteTemplate** - Complete website templates
- **ScrollConfiguration** - GSAP scroll configurations

### Current Seed Execution Flow

#### Phase 1: Database Cleanup
```typescript
// Delete in correct order (respecting foreign key constraints)
await prisma.scrollConfiguration.deleteMany();
await prisma.sectionComponent.deleteMany();
await prisma.background.deleteMany();
await prisma.websiteSection.deleteMany();
await prisma.menuSection.deleteMany();
await prisma.menuItem.deleteMany();
await prisma.menu.deleteMany();
await prisma.formSubmission.deleteMany();
await prisma.formField.deleteMany();
await prisma.formPage.deleteMany();
await prisma.form.deleteMany();
await prisma.page.deleteMany();
await prisma.mediaFile.deleteMany();
await prisma.user.deleteMany();
await prisma.role.deleteMany();
await prisma.language.deleteMany();
```

#### Phase 2: Core Data Creation
1. **Languages** - Create supported languages (en, es, fr, de, it, pt, ru, zh, ja, ko, ar, hi)
2. **Permissions** - Create granular permissions (users.*, roles.*, interpretations.*, system.admin, audit.read)
3. **Roles** - Create roles (super_admin, Admin, Interpreter, Client)
4. **Role Permissions** - Assign permissions to roles
5. **Users** - Create admin and sample users with hashed passwords

#### Phase 3: Content Creation
1. **Page Templates** - Create reusable page templates
2. **Pages** - Create pages with sections and components
3. **Forms** - Create forms (contact, application) with fields
4. **Media Files** - Create media file records
5. **Menus** - Create navigation menus (header, footer)
6. **Sections** - Create website sections with components
7. **Backgrounds** - Create background configurations

### Key Features of Current Seed

#### 1. Complex Relationships
- Pages → Sections → Components → Backgrounds
- Forms → FormFields → FormSubmissions
- Menus → MenuItems → Pages
- Users → Roles → Permissions

#### 2. Rich Content Structure
- **Pages** contain:
  - Template configurations (JSON)
  - Multiple sections
  - SEO metadata
  - Render settings (scroll, navigation, performance)
  - Locale support

- **Sections** contain:
  - Component arrays
  - Background configurations
  - Animation configurations (GSAP)
  - Scroll effects
  - Style configurations

- **Components** contain:
  - Type definitions (TEXT, BUTTON, IMAGE, etc.)
  - Content values
  - Style configurations
  - Animation configs

#### 3. Brand Integration
- E-Voque brand colors defined
- Consistent styling helpers
- Component type system

#### 4. Helper Functions
- `createAnimationConfig()` - GSAP animation configurations
- `createScrollEffect()` - Scroll trigger effects
- `createDarkStyles()` / `createLightStyles()` - Style helpers
- `createImageBackground()` / `createGradientBackground()` - Background helpers
- `createDefaultRenderSettings()` - Page render settings

### Current Seed Execution

```bash
# Run main seed
pnpm seed

# Run specific seeds
pnpm seed:showcase
pnpm seed:templates
pnpm seed:test-page
```

---

## Migration to Payload CMS

### Why Migrate to Payload CMS?

1. **Built-in Admin UI** - No need to build custom admin panels
2. **Type Safety** - Automatic TypeScript types generation
3. **API-First** - REST and GraphQL APIs out of the box
4. **Rich Field Types** - Blocks, arrays, relationships, uploads
5. **Localization** - Built-in i18n support
6. **Versioning** - Built-in version control
7. **Access Control** - Built-in authentication and authorization
8. **Hooks & Validation** - Lifecycle hooks and field validation

### Migration Strategy

#### Step 1: Install Payload CMS

```bash
npm install payload @payloadcms/db-postgres @payloadcms/plugin-cloud-storage
```

#### Step 2: Create Payload Configuration

Create `payload.config.ts`:

```typescript
import { buildConfig } from 'payload/config';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { s3Storage } from '@payloadcms/plugin-cloud-storage';
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3';

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  collections: [
    // Collections will be defined here
  ],
  globals: [
    // Globals will be defined here
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          adapter: s3Adapter({
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
              },
              region: process.env.S3_REGION,
            },
            bucket: process.env.S3_BUCKET,
          }),
        },
      },
    }),
  ],
});
```

#### Step 3: Map Prisma Models to Payload Collections

##### Users Collection

**Prisma Model:**
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  firstName     String
  lastName      String
  phone         String?
  roleId        String
  role          Role     @relation(...)
  // ... other fields
}
```

**Payload Collection:**
```typescript
import { CollectionConfig } from 'payload/types';

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'roles',
      required: true,
    },
  ],
};
```

##### Pages Collection

**Prisma Model:**
```prisma
model Page {
  id            String   @id @default(cuid())
  title         String
  slug          String
  content       String
  status        String
  locale        String
  seoTitle      String?
  seoDescription String?
  template      Json?
  renderSettings Json?
  // ... relationships
}
```

**Payload Collection:**
```typescript
const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published'],
      defaultValue: 'draft',
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        // Define block types for sections
      ],
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
  ],
};
```

##### Forms Collection

**Prisma Model:**
```prisma
model Form {
  id          String   @id @default(cuid())
  name        String
  slug        String
  description String?
  settings    Json?
  fields      FormField[]
  // ... relationships
}
```

**Payload Collection:**
```typescript
const Forms: CollectionConfig = {
  slug: 'forms',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'fields',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: ['text', 'email', 'textarea', 'select', 'checkbox'],
          required: true,
        },
        {
          name: 'required',
          type: 'checkbox',
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'successMessage',
          type: 'text',
        },
        {
          name: 'redirectUrl',
          type: 'text',
        },
        {
          name: 'emailNotification',
          type: 'checkbox',
        },
      ],
    },
  ],
};
```

##### Media Collection

Payload CMS has a built-in Media collection, but you can customize it:

```typescript
const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'folder',
      type: 'text',
    },
  ],
};
```

#### Step 4: Create Seed Function for Payload

Create `src/seed/index.ts`:

```typescript
import { Payload } from 'payload';
import { PayloadRequest } from 'payload/types';

export const seed = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<void> => {
  console.log('🌱 Seeding database...');

  // Phase 1: Clear existing data
  await clearCollections(payload);

  // Phase 2: Create users and roles
  const { adminUser, roles } = await createUsersAndRoles(payload, req);

  // Phase 3: Create media
  const media = await createMedia(payload, req);

  // Phase 4: Create categories
  const categories = await createCategories(payload, req);

  // Phase 5: Create posts
  await createPosts(payload, req, categories, media);

  // Phase 6: Create forms
  const forms = await createForms(payload, req);

  // Phase 7: Create pages
  await createPages(payload, req, media, forms);

  // Phase 8: Update globals (navigation)
  await updateGlobals(payload, req);

  console.log('✅ Seeding complete!');
};
```

#### Step 5: Map Complex Structures

##### Sections as Blocks

In Payload, sections can be represented as block types:

```typescript
const sectionBlocks = [
  {
    slug: 'hero',
    fields: [
      {
        name: 'headline',
        type: 'text',
        required: true,
      },
      {
        name: 'subtitle',
        type: 'text',
      },
      {
        name: 'backgroundImage',
        type: 'upload',
        relationTo: 'media',
      },
      {
        name: 'animation',
        type: 'group',
        fields: [
          {
            name: 'type',
            type: 'select',
            options: ['fadeIn', 'slideUp', 'parallax'],
          },
          {
            name: 'duration',
            type: 'number',
            defaultValue: 0.8,
          },
        ],
      },
    ],
  },
  {
    slug: 'content',
    fields: [
      {
        name: 'content',
        type: 'richText',
      },
    ],
  },
  // ... more block types
];
```

##### Component Arrays

Components can be nested arrays within blocks:

```typescript
{
  name: 'components',
  type: 'array',
  fields: [
    {
      name: 'type',
      type: 'select',
      options: ['TEXT', 'BUTTON', 'IMAGE', 'VIDEO'],
      required: true,
    },
    {
      name: 'content',
      type: 'json', // Or use specific field types
    },
    {
      name: 'styles',
      type: 'group',
      fields: [
        // Style fields
      ],
    },
  ],
}
```

#### Step 6: Migration Script

Create a migration script to transfer existing data:

```typescript
import { PrismaClient } from '@prisma/client';
import { getPayload } from 'payload';
import config from '../payload.config';

async function migrate() {
  const prisma = new PrismaClient();
  const payload = await getPayload({ config });

  // Migrate users
  const prismaUsers = await prisma.user.findMany({
    include: { role: true },
  });

  for (const user of prismaUsers) {
    await payload.create({
      collection: 'users',
      data: {
        email: user.email,
        password: user.password, // Note: may need rehashing
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.roleId, // Map to Payload role ID
      },
    });
  }

  // Migrate pages
  const prismaPages = await prisma.page.findMany();

  for (const page of prismaPages) {
    await payload.create({
      collection: 'pages',
      data: {
        title: page.title,
        slug: page.slug,
        status: page.status,
        layout: page.template, // Map template to blocks
        meta: {
          title: page.seoTitle,
          description: page.seoDescription,
        },
      },
    });
  }

  // ... migrate other collections

  await prisma.$disconnect();
}
```

### Key Differences: Prisma vs Payload

| Feature | Prisma | Payload CMS |
|---------|--------|-------------|
| **Database Access** | Direct Prisma Client | Payload Local API |
| **Admin UI** | Custom built | Built-in |
| **API** | Custom REST/GraphQL | Built-in REST & GraphQL |
| **Relationships** | Prisma relations | Payload relationships |
| **Validation** | Custom validation | Built-in field validation |
| **Hooks** | Prisma middleware | Payload hooks (before/after) |
| **File Uploads** | Custom S3 integration | Built-in upload handling |
| **Versioning** | Custom implementation | Built-in drafts/versions |
| **Localization** | Custom locale field | Built-in i18n plugin |
| **Access Control** | Custom RBAC | Built-in access control |

### Migration Checklist

- [ ] Install Payload CMS and dependencies
- [ ] Create `payload.config.ts`
- [ ] Define collections for all Prisma models
- [ ] Map complex JSON structures to Payload blocks/arrays
- [ ] Create seed function using Payload Local API
- [ ] Create migration script to transfer existing data
- [ ] Update API routes to use Payload API
- [ ] Update frontend to use Payload API endpoints
- [ ] Test all functionality
- [ ] Update documentation

### Helper Functions Migration

#### Animation Config

**Prisma:**
```typescript
function createAnimationConfig(type: string, delay: number = 0) {
  return {
    animationType: type,
    duration: 0.8,
    delay,
    scrollTrigger: { /* ... */ }
  };
}
```

**Payload:**
```typescript
function createAnimationConfig(type: string, delay: number = 0) {
  return {
    animationType: type,
    duration: 0.8,
    delay,
    scrollTrigger: { /* ... */ }
  };
}
// Same structure, but stored in Payload blocks
```

#### Background Helpers

**Prisma:**
```typescript
function createImageBackground(imageUrl: string) {
  return {
    create: {
      type: 'IMAGE',
      value: imageUrl,
      // ...
    }
  };
}
```

**Payload:**
```typescript
async function createImageBackground(payload: Payload, imageUrl: string) {
  // Upload or reference existing media
  const media = await payload.create({
    collection: 'media',
    data: {
      // ... media data
    },
  });
  
  return media.id; // Reference ID
}
```

### Performance Considerations

1. **Batch Operations** - Use Payload's batch create when possible
2. **Direct DB Access** - For large migrations, consider direct DB access
3. **Caching** - Payload caches collections, clear cache if needed
4. **Hooks** - Disable hooks during seeding for performance

```typescript
await payload.create({
  collection: 'pages',
  data: pageData,
  context: {
    disableRevalidate: true, // Disable Next.js revalidation
  },
});
```

### Testing the Migration

1. **Unit Tests** - Test seed functions individually
2. **Integration Tests** - Test complete seed flow
3. **Data Validation** - Verify all data migrated correctly
4. **API Tests** - Test Payload API endpoints
5. **UI Tests** - Test admin UI functionality

### Rollback Strategy

1. Keep Prisma seed files as backup
2. Export Payload data before migration
3. Maintain database backups
4. Document rollback procedure

---

## Example: Complete Payload Seed Function

```typescript
import { Payload } from 'payload';
import { PayloadRequest } from 'payload/types';

export const seed = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<void> => {
  console.log('🌱 Seeding database...');

  // Clear collections
  console.log('— Clearing collections...');
  const collections = ['pages', 'posts', 'forms', 'media', 'categories'];
  for (const collection of collections) {
    const { docs } = await payload.find({
      collection: collection as any,
      limit: 1000,
    });
    for (const doc of docs) {
      await payload.delete({
        collection: collection as any,
        id: doc.id,
        req,
      });
    }
  }

  // Create demo user
  console.log('— Creating demo user...');
  try {
    await payload.delete({
      collection: 'users',
      where: { email: { equals: 'demo-author@example.com' } },
      req,
    });
  } catch (e) {
    // User doesn't exist
  }

  const demoUser = await payload.create({
    collection: 'users',
    data: {
      email: 'demo-author@example.com',
      password: 'password',
      roles: ['admin'],
    },
    req,
  });

  // Create media
  console.log('— Creating media...');
  const mediaFiles = await Promise.all([
    fetchFileByURL('https://github.com/.../image1.jpg'),
    fetchFileByURL('https://github.com/.../image2.jpg'),
  ].map(file => payload.create({
    collection: 'media',
    data: { file },
    req,
  })));

  // Create categories
  console.log('— Creating categories...');
  const categories = await Promise.all([
    { name: 'Technology', slug: 'technology' },
    { name: 'News', slug: 'news' },
    // ...
  ].map(cat => payload.create({
    collection: 'categories',
    data: cat,
    req,
  })));

  // Create pages
  console.log('— Creating pages...');
  const homepage = await payload.create({
    collection: 'pages',
    data: home({
      heroImage: mediaFiles[0].id,
      metaImage: mediaFiles[0].id,
    }),
    req,
    context: { disableRevalidate: true },
  });

  // ... create other pages

  // Update globals
  console.log('— Updating globals...');
  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        { link: { type: 'reference', value: homepage.id } },
        // ...
      ],
    },
    req,
  });

  console.log('✅ Seeding complete!');
};
```

---

## Conclusion

Migrating from Prisma to Payload CMS requires:

1. **Understanding** the current data structure
2. **Mapping** Prisma models to Payload collections
3. **Converting** complex JSON structures to Payload blocks/arrays
4. **Rewriting** seed functions to use Payload Local API
5. **Migrating** existing data
6. **Testing** thoroughly

The migration provides significant benefits including built-in admin UI, type safety, and powerful content management features, but requires careful planning and execution.

