'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface TestimonialSkeletonProps {
  className?: string;
}

export default function TestimonialSkeleton({ className = '' }: TestimonialSkeletonProps) {
  return (
    <div className={`testimonial-skeleton space-y-6 ${className}`}>
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </div>
      <div className="flex items-center justify-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}
