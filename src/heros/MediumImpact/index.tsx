import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = (props) => {
  const { links, media, richText } = props
  // @ts-expect-error - brRadius is in the type but TypeScript isn't recognizing it yet
  const borderRadius = props.brRadius

  // Calculate border radius style (using parseInt for select values)
  const borderRadiusStyle = borderRadius
    ? {
        borderTopLeftRadius: `${parseInt(borderRadius.topLeft || '0', 10)}px`,
        borderTopRightRadius: `${parseInt(borderRadius.topRight || '0', 10)}px`,
        borderBottomRightRadius: `${parseInt(borderRadius.bottomRight || '0', 10)}px`,
        borderBottomLeftRadius: `${parseInt(borderRadius.bottomLeft || '0', 10)}px`,
        overflow: 'hidden' as const,
      }
    : {}

  return (
    <div className="">
      <div className="container mb-8">
        {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
            {links.map(({ link }, i) => {
              return (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="container">
        {media && typeof media === 'object' && (
          <div style={borderRadiusStyle}>
            <Media
              className="-mx-4 md:-mx-8 2xl:-mx-16"
              imgClassName=""
              priority
              resource={media}
            />
            {media?.caption && (
              <div className="mt-3">
                <RichText data={media.caption} enableGutter={false} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
