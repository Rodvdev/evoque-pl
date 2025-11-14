import { FooterClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getUserAuth } from '@/utilities/getUserAuth'
import React from 'react'

import type { Footer } from '@/payload-types'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()
  const { isAuthenticated } = await getUserAuth()

  return <FooterClient data={footerData} isAuthenticated={isAuthenticated} />
}
