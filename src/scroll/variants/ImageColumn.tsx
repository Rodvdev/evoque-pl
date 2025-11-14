'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ScrollItem } from '../types';

/**
 * Image Column Component - Right side with pinned images
 * Images are always centered vertically, only opacity and scale change
 */
interface ImageColumnProps {
  items: ScrollItem[];
  iconOpacity: any[];
  iconScale: any[];
  iconY: any[];
  iconRotation: any[];
  activeIndex: number;
  enableGPU: boolean;
  imagePanelRef: React.RefObject<HTMLDivElement | null>;
  imageColumnY?: any; // Y translation for the entire column container (not used for pinning)
}

export function ImageColumn({
  items,
  iconOpacity,
  iconScale,
  iconY,
  iconRotation,
  activeIndex,
  enableGPU,
  imagePanelRef,
  imageColumnY
}: ImageColumnProps) {
  return (
    <div 
      ref={imagePanelRef}
      className="w-[50%] max-w-md pl-8 text-image-pinned-panel"
      style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        zIndex: 10,
        overflow: 'visible',
        paddingTop: 0
      }}
    >
      <motion.div 
        className="w-full max-w-md" 
        style={{ 
          aspectRatio: '1/1', 
          position: 'relative',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              opacity: iconOpacity[index],
              scale: iconScale[index],
              x: '-50%',
              y: '-50%',
              rotate: iconRotation[index] || 0,
              willChange: enableGPU ? 'transform, opacity' : 'auto',
              pointerEvents: activeIndex === index ? 'auto' : 'none'
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={item.icon}
                alt={item.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 300px, 500px"
                priority={index === 0}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
