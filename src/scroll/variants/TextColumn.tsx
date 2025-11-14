'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScrollItem } from '../types';

/**
 * Helper function to render rich text description
 */
const renderDescription = (description: ScrollItem['description']): React.ReactNode => {
  if (typeof description === 'string') {
    return <p className="text-base leading-relaxed prose prose-md md:prose-md">{description}</p>;
  }
  
  if (description && typeof description === 'object' && 'type' in description) {
    const { type, content } = description;
    
    if (type === 'paragraph') {
      return <p className="text-base leading-relaxed prose prose-md md:prose-md">{content as string}</p>;
    }
    
    if (type === 'list') {
      return (
        <ul className="text-base leading-relaxed space-y-2 list-disc list-inside prose prose-md md:prose-md">
          {(content as string[]).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }
    
    if (type === 'numbered-list') {
      return (
        <ol className="text-base leading-relaxed space-y-2 list-decimal list-inside prose prose-md md:prose-md">
          {(content as string[]).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ol>
      );
    }
  }
  
  return <p className="text-base leading-relaxed prose prose-md md:prose-md">{String(description)}</p>;
};

/**
 * Text Column Component - Left side with scrolling text items
 */
interface TextColumnProps {
  items: ScrollItem[];
  textOpacity: any[];
  textY: any[];
  textScale: any[];
  activeIndex: number;
  enableGPU: boolean;
}

export function TextColumn({
  items,
  textOpacity,
  textY,
  textScale,
  activeIndex,
  enableGPU
}: TextColumnProps) {
  return (
    <div className="w-[50%] max-w-lg pr-8" style={{ overflow: 'visible', position: 'relative' }}>
      <div style={{ marginBottom: '10vh' }}>
        {items.map((item, itemIndex) => {
          const index = itemIndex;
          return (
            <div
              key={item.id}
              style={{ 
                minHeight: '30vh',
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center', // Center text content
                position: 'relative',
                overflow: 'visible',
                // Ensure each text item can be centered in viewport
                height: '30vh',
                marginBottom: '5vh'
              }}
            >
              <motion.div
                style={{
                  opacity: textOpacity[index],
                  y: textY[index], // When at full opacity (center), y: 0 centers text in viewport
                  scale: textScale[index],
                  willChange: enableGPU ? 'transform, opacity' : 'auto',
                  pointerEvents: activeIndex === index ? 'auto' : 'none',
                  position: 'relative',
                  width: '100%'
                }}
              >
                <h3 className="text-2xl md:text-3xl font-normal mb-4 prose prose-md md:prose-md">
                  {item.title}
                </h3>
                <div>
                  {renderDescription(item.description)}
                </div>
              </motion.div>
            </div>
          );
        })}

      </div>
    </div>
  );
}

