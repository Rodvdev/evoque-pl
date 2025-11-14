'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AccordionContent } from './config';

interface AccordionComponentProps {
  content?: AccordionContent;
  styles?: Record<string, unknown>;
  className?: string;
  onClick?: () => void;
}

export default function AccordionComponent({ content, styles, className = '', onClick }: AccordionComponentProps) {
  const accordionContent = content;
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(accordionContent?.defaultOpen || [])
  );
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  // Reset animation state when items change
  useEffect(() => {
    hasAnimated.current = false;
    setVisibleItems(new Set());
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];
  }, [accordionContent?.items?.length]);

  // Intersection Observer for clean scroll animations
  useEffect(() => {
    if (!accordionContent?.items?.length || !containerRef.current) return;

    const container = containerRef.current;

    // Create observer for the accordion container
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            
            // Clear any existing timeouts
            timeoutIdsRef.current.forEach((id) => clearTimeout(id));
            timeoutIdsRef.current = [];
            
            // Animate items one by one in sequence
            accordionContent.items.forEach((_, index) => {
              const timeoutId = setTimeout(() => {
                setVisibleItems((prev) => {
                  const newSet = new Set(prev);
                  newSet.add(index);
                  return newSet;
                });
              }, index * 120); // 120ms delay between each item for smooth staggered effect
              
              timeoutIdsRef.current.push(timeoutId);
            });

            // Unobserve after animation sequence starts
            observer.unobserve(container);
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of container is visible
        rootMargin: '0px 0px -100px 0px', // Start animation when container is 100px from bottom
      }
    );

    observer.observe(container);

    // Cleanup observer and timeouts on unmount
    return () => {
      observer.disconnect();
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, [accordionContent?.items]);

  // Get size styles
  const getSizeStyles = () => {
    const sizes = {
      sm: {
        headerPadding: '0.75rem 1rem',
        contentPadding: '0.75rem 1rem',
        fontSize: '0.875rem',
        iconSize: '1rem'
      },
      md: {
        headerPadding: '1rem 1.5rem',
        contentPadding: '1rem 1.5rem',
        fontSize: '1rem',
        iconSize: '1.25rem'
      },
      lg: {
        headerPadding: '1.25rem 2rem',
        contentPadding: '1.25rem 2rem',
        fontSize: '1.125rem',
        iconSize: '1.5rem'
      }
    };
    return sizes[accordionContent?.size || 'md'] || sizes.md;
  };

  const sizeStyles = getSizeStyles();

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      
      if (accordionContent?.allowMultiple) {
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
      } else {
        // Only allow one item open at a time
        if (newSet.has(itemId)) {
          newSet.clear();
        } else {
          newSet.clear();
          newSet.add(itemId);
        }
      }
      
      return newSet;
    });
  };

  // Build variant-specific styles
  const variantStyles = useMemo(() => {
    if (!accordionContent) {
      return {
        item: {
          marginBottom: '1rem',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          width: '100%'
        },
        header: {
          padding: '1.5rem 2rem',
          backgroundColor: '#f4f6f8',
          color: '#374151',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease',
          border: 'none',
          borderRadius: '12px',
          width: '100%'
        },
        content: {
          padding: '1.5rem 2rem',
          backgroundColor: '#ffffff',
          color: '#6b7280',
          fontSize: '1rem',
          lineHeight: '1.6',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px'
        }
      };
    }
    
    return {
      item: {
        marginBottom: accordionContent.spacing || '1rem',
        borderRadius: accordionContent.accordionStyle?.borderRadius || '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        backgroundColor: accordionContent.accordionStyle?.backgroundColor || 'transparent',
        border: 'none',
        boxShadow: 'none',
        width: '100%'
      },
      header: {
        padding: accordionContent.headerStyle?.padding || '1.5rem 2rem',
        backgroundColor: accordionContent.headerStyle?.backgroundColor || '#f4f6f8',
        color: accordionContent.headerStyle?.textColor || '#374151',
        fontSize: accordionContent.headerStyle?.fontSize || sizeStyles.fontSize,
        fontWeight: accordionContent.headerStyle?.fontWeight || '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        border: 'none',
        borderRadius: accordionContent.accordionStyle?.borderRadius || '12px',
        width: '100%'
      },
      content: {
        padding: accordionContent.contentStyle?.padding || '1.5rem 2rem',
        backgroundColor: accordionContent.contentStyle?.backgroundColor || '#ffffff',
        color: accordionContent.contentStyle?.textColor || '#6b7280',
        fontSize: sizeStyles.fontSize,
        lineHeight: '1.6',
        borderTop: 'none',
        borderRadius: accordionContent.contentStyle?.borderRadius || '0 0 12px 12px'
      }
    };
  }, [accordionContent, sizeStyles]);

  return (
    <div 
      ref={containerRef}
      className={`accordion-component ${className}`} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: accordionContent?.spacing || '1rem', 
        width: '100%',
        ...styles 
      }}
    >
      {accordionContent?.items.map((item, index) => {
        const itemId = item.id || `accordion-item-${index}`;
        const isOpen = openItems.has(itemId);
        const isVisible = visibleItems.has(index);
        
        return (
          <div
            key={item.id || `accordion-item-${index}`}
            className="accordion-item"
            style={{
              ...variantStyles.item,
              opacity: isVisible ? 1 : 0,
              transform: isVisible 
                ? 'translateY(0) scale(1)' 
                : 'translateY(25px) scale(0.98)',
              transition: isVisible 
                ? 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' 
                : 'opacity 0s, transform 0s',
              pointerEvents: isVisible ? 'auto' : 'none',
            }}
          >
            {/* Header */}
            <div
              className="accordion-header"
              style={{
                ...(variantStyles.header || {}),
                backgroundColor: isOpen ? '#3b82f6' : (variantStyles.header?.backgroundColor || '#f4f6f8'),
                color: isOpen ? '#ffffff' : (variantStyles.header?.color || '#374151')
              }}
              onClick={() => !item.disabled && toggleItem(itemId)}
            >
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {item.icon && <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>}
                <span style={{ flex: 1 }}>{item.title}</span>
              </div>
              
              <ChevronDown
                style={{ 
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  width: '1.25rem',
                  height: '1.25rem',
                  flexShrink: 0,
                  marginLeft: '1rem'
                }}
              />
            </div>

            {/* Content */}
            <div
              className="accordion-content"
              style={{
                maxHeight: isOpen ? '2000px' : '0',
                opacity: isOpen ? 1 : 0,
                overflow: 'hidden',
                padding: isOpen ? (variantStyles.content?.padding || '1.5rem 2rem') : '0',
                transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, padding 0.3s ease-in-out',
                ...(isOpen ? variantStyles.content : {
                  backgroundColor: 'transparent',
                  color: 'transparent',
                }),
              }}
            >
              {isOpen && (
                <div style={{ whiteSpace: 'pre-line' }}>
                  {item.content || 'No content available'}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}