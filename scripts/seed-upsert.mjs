import { getPayload, createLocalReq } from 'payload'
import config from '../src/payload.config.ts'
import { seed } from '../src/endpoints/seed/index.ts'

async function runSeed() {
  try {
    console.log('🚀 Starting seed with upsert...')
    
    const payload = await getPayload({ config })
    
    // Create a local request with a system user (or find an admin user)
    const { docs: users } = await payload.find({
      collection: 'users',
      limit: 1,
      where: {
        roles: {
          contains: 'admin',
        },
      },
    })
    
    if (users.length === 0) {
      throw new Error('No admin user found. Please create an admin user first.')
    }
    
    const user = users[0]
    const req = await createLocalReq({ user }, payload)
    
    await seed({ payload, req })
    
    console.log('✅ Seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

runSeed()

