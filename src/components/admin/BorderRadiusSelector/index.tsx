'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'

type CornerKey = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'

interface BorderRadiusSelectorProps {
  path: string
  field: any
  label?: string
}

export const BorderRadiusSelector: React.FC<BorderRadiusSelectorProps> = ({
  path,
  field,
  label = 'Enable Corners',
}) => {
  const topLeftField = useField<boolean>({ path: `${path}.topLeft` })
  const topRightField = useField<boolean>({ path: `${path}.topRight` })
  const bottomRightField = useField<boolean>({ path: `${path}.bottomRight` })
  const bottomLeftField = useField<boolean>({ path: `${path}.bottomLeft` })

  const topLeft = topLeftField.value || false
  const topRight = topRightField.value || false
  const bottomRight = bottomRightField.value || false
  const bottomLeft = bottomLeftField.value || false

  const toggleCorner = (corner: CornerKey) => {
    switch (corner) {
      case 'topLeft':
        topLeftField.setValue(!topLeft)
        break
      case 'topRight':
        topRightField.setValue(!topRight)
        break
      case 'bottomRight':
        bottomRightField.setValue(!bottomRight)
        break
      case 'bottomLeft':
        bottomLeftField.setValue(!bottomLeft)
        break
    }
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
        {label}
      </label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 80px)',
          gridTemplateRows: 'repeat(3, 80px)',
          gap: '4px',
          width: 'fit-content',
          position: 'relative',
        }}
      >
        {/* Empty corner */}
        <div></div>
        {/* Top row */}
        <button
          type="button"
          onClick={() => toggleCorner('topLeft')}
          style={{
            gridColumn: '1',
            gridRow: '1',
            border: `2px solid ${topLeft ? '#0077A7' : '#ccc'}`,
            backgroundColor: topLeft ? '#E6F4F8' : '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          TL
        </button>
        <button
          type="button"
          onClick={() => toggleCorner('topRight')}
          style={{
            gridColumn: '3',
            gridRow: '1',
            border: `2px solid ${topRight ? '#0077A7' : '#ccc'}`,
            backgroundColor: topRight ? '#E6F4F8' : '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          TR
        </button>
        {/* Empty middle */}
        <div></div>
        {/* Center visual box */}
        <div
          style={{
            gridColumn: '2',
            gridRow: '2',
            border: '2px dashed #ddd',
            backgroundColor: '#f9f9f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#666',
          }}
        >
          Hero
        </div>
        {/* Empty middle */}
        <div></div>
        {/* Bottom row */}
        <button
          type="button"
          onClick={() => toggleCorner('bottomLeft')}
          style={{
            gridColumn: '1',
            gridRow: '3',
            border: `2px solid ${bottomLeft ? '#0077A7' : '#ccc'}`,
            backgroundColor: bottomLeft ? '#E6F4F8' : '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          BL
        </button>
        <button
          type="button"
          onClick={() => toggleCorner('bottomRight')}
          style={{
            gridColumn: '3',
            gridRow: '3',
            border: `2px solid ${bottomRight ? '#0077A7' : '#ccc'}`,
            backgroundColor: bottomRight ? '#E6F4F8' : '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          BR
        </button>
        {/* Empty corner */}
        <div></div>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '12px', color: '#666' }}>
        Click corners to enable/disable border radius
      </div>
    </div>
  )
}
