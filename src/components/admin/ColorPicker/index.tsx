'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'

interface ColorPickerProps {
  path: string
  field: any
  label?: string
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  path,
  field,
  label,
}) => {
  const colorField = useField<string>({ path })
  const value = colorField.value || '#000000'

  const handleColorChange = (newValue: string) => {
    colorField.setValue(newValue)
  }

  // Extract hex color from value for the color input
  // If value is a hex color, use it; otherwise default to #000000
  const getHexColor = (colorValue: string): string => {
    // Check if it's a hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorValue)) {
      return colorValue
    }
    // Try to convert CSS color names to hex (basic conversion)
    // For now, just return a default if it's not a hex
    return '#000000'
  }

  const hexColor = getHexColor(value)

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        <input
          type="color"
          value={hexColor}
          onChange={(e) => handleColorChange(e.target.value)}
          style={{
            width: '60px',
            height: '40px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            padding: '2px',
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => handleColorChange(e.target.value)}
          placeholder="#000000 or color name"
          style={{
            flex: 1,
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}
        />
      </div>
      {field?.admin?.description && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '12px',
            color: '#666',
          }}
        >
          {field.admin.description}
        </div>
      )}
    </div>
  )
}

export default ColorPicker

