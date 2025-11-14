'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

interface ActionButtonsProps {
  data: HeaderType
  isAuthenticated: boolean
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ data, isAuthenticated }) => {
  const actionButtons = data?.actionButtons || []

  if (!actionButtons.length) {
    return null
  }

  const visibleButtons = actionButtons.filter((button) => {
    if (isAuthenticated) {
      return button.showWhenLoggedIn !== false
    }
    return button.showWhenLoggedOut !== false
  })

  if (!visibleButtons.length) {
    return null
  }

  return (
    <div className="flex gap-3 items-center">
      {visibleButtons.map((button, i) => {
        return (
          <CMSLink
            key={i}
            {...button.link}
            appearance={button.variant || 'default'}
            size={button.size || 'default'}
            label={button.label || ''}
          />
        )
      })}
    </div>
  )
}

