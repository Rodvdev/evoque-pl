'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Text Column Skeleton - Loading state for text column
 */
interface TextColumnSkeletonProps {
  itemCount?: number;
}

export function TextColumnSkeleton({ itemCount = 5 }: TextColumnSkeletonProps) {
  return (
    <div className="w-[50%] pr-8" style={{ overflow: 'visible', position: 'relative' }}>
      <div style={{ marginTop: '10vh', marginBottom: '10vh' }}>
        {/* Empty item at start for spacing */}
        <div style={{ 
          minHeight: '30vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-start', 
          position: 'relative', 
          overflow: 'visible', 
          height: '30vh', 
          marginBottom: '5vh' 
        }}></div>
        
        {/* Skeleton items */}
        {Array.from({ length: itemCount }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            style={{ 
              minHeight: '30vh',
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'flex-start',
              position: 'relative',
              overflow: 'visible',
              height: '30vh',
              marginBottom: '5vh'
            }}
          >
            <div style={{ position: 'relative', width: '100%' }}>
              {/* Title skeleton */}
              <Skeleton className="h-8 w-3/4 mb-4" />
              {/* Description skeleton - 2 lines */}
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

