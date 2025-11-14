'use client';

import React from 'react';
import { BaseScrollProps } from '../types';

export function ZoomScroll({
  config,
  children,
  backgroundElement,
  className = '',
  style = {},
  isEditing = false,
  debugMode = false
}: BaseScrollProps) {
  // Note: The zoom effect is applied to the section element in ScrollSectionEnhanced
  // This component just renders the content structure
  
  return (
    <div
      className={`scroll-zoom-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // No border radius on container itself
        borderRadius: '0px',
        overflow: 'visible', // Allow inner components to show border radius
        ...style
      }}
    >
      {/* Background element - scales with section */}
      {/* No border radius on background - section itself has no border radius */}
      {backgroundElement && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            overflow: 'hidden',
            // No border radius on background
            borderRadius: '0px'
          }}
        >
          {backgroundElement}
        </div>
      )}

      {/* Content - scales with section, with border radius for inner components */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          // Apply border radius to inner content container (for components inside)
          borderRadius: '24px',
          overflow: 'hidden' // Ensure border radius is contained
        }}
        className="sm:px-4 md:px-6 lg:px-8"
      >
        {children}
      </div>

      {/* Debug overlay */}
      {debugMode && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 50, // Lower z-index to stay below mobile sidebar (9999)
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}
        >
          <div>Variant: zoom</div>
          <div>Scale: {(config as { zoomStart?: number }).zoomStart || 1.5} → {(config as { zoomEnd?: number }).zoomEnd || 1}</div>
          <div>Zoom Out: {(config as { duration?: number }).duration || 300}px</div>
          <div>Zoom In: {(config as { reverseDuration?: number }).reverseDuration || 1000}px</div>
        </div>
      )}
    </div>
  );
}

