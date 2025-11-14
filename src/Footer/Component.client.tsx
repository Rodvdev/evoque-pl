'use client'

import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import Link from 'next/link'
import { ActionButtons } from './ActionButtons'

interface FooterClientProps {
  data: Footer
  isAuthenticated: boolean
}

export const FooterClient: React.FC<FooterClientProps> = ({ data, isAuthenticated }) => {
  const navItems = data?.navItems || []

  const visibleNavItems = navItems.filter((item) => {
    if (isAuthenticated) {
      return item.showWhenLoggedIn !== false
    }
    return item.showWhenLoggedOut !== false
  })

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {visibleNavItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
          <ActionButtons data={data} isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </footer>
  )
}

