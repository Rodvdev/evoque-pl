import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import AccordionComponent from '@/components/accordion'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'
import type { AccordionContent } from '@/components/accordion/config'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size, contentType, accordion } = col

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                {contentType === 'accordion' && accordion && (
                  <AccordionComponent
                    content={
                      {
                        size: (accordion.size as 'sm' | 'md' | 'lg') || 'md',
                        allowMultiple: accordion.allowMultiple || false,
                        items: (accordion.items || []).map((item) => ({
                          id: item.id || `accordion-item-${index}`,
                          title: item.title || '',
                          content: item.content || '',
                          icon: item.icon,
                          disabled: item.disabled || false,
                        })),
                      } as AccordionContent
                    }
                  />
                )}

                {(contentType !== 'accordion' || !contentType) && richText && (
                  <RichText data={richText} enableGutter={false} />
                )}

                {(contentType !== 'accordion' || !contentType) && enableLink && <CMSLink {...link} />}
              </div>
            )
          })}
      </div>
    </div>
  )
}
