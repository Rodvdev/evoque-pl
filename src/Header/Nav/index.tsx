'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

interface HeaderNavProps {
  data: HeaderType
  isAuthenticated: boolean
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, isAuthenticated }) => {
  const navItems = data?.navItems || []

  const visibleNavItems = navItems.filter((item) => {
    if (isAuthenticated) {
      return item.showWhenLoggedIn !== false
    }
    return item.showWhenLoggedOut !== false
  })

  return (
    <nav className="flex gap-3 items-center">
      {visibleNavItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
