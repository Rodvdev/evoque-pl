'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Image Column Skeleton - Loading state for image column
 */
interface ImageColumnSkeletonProps {
  imagePanelRef?: React.RefObject<HTMLDivElement | null>;
}

export function ImageColumnSkeleton({ imagePanelRef }: ImageColumnSkeletonProps) {
  return (
    <div 
      ref={imagePanelRef}
      className="w-[50%] pl-8 text-image-pinned-panel"
      style={{
        // Don't set position in inline styles - let ScrollTrigger control it
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        zIndex: 10,
        overflow: 'visible'
      }}
    >
      <div className="relative w-full max-w-md" style={{ aspectRatio: '1/1' }}>
        {/* Single skeleton image */}
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
}

