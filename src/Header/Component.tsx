import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getUserAuth } from '@/utilities/getUserAuth'
import React from 'react'

import type { Header } from '@/payload-types'

export async function Header() {
  const headerData: Header = await getCachedGlobal('header', 1)()
  const { isAuthenticated } = await getUserAuth()

  return <HeaderClient data={headerData} isAuthenticated={isAuthenticated} />
}
