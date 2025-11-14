'use client';

import React from 'react';
import { BaseScrollProps } from '../types';
import { ZoomScroll } from './zoom';
import { TextImageScroll } from './text-image-scroll';
import { TabsScroll } from './tabs-scroll';
import { TitleScaleScroll } from './title-scale-scroll';
import { BubbleListScroll } from './bubble-list-scroll';

/**
 * Registry that maps scroll variants to their corresponding components
 */
export function ScrollRenderer(props: BaseScrollProps) {
  const { config } = props;

  switch (config.variant) {
    case 'zoom':
      return <ZoomScroll {...props} />;
    case 'text-image-scroll':
      return <TextImageScroll {...props} />;
    case 'tabs-scroll':
      return <TabsScroll {...props} />;
    case 'title-scale-scroll':
      return <TitleScaleScroll {...props} />;
    case 'bubble-list-scroll':
      return <BubbleListScroll {...props} />;
    default:
      console.warn(`Unknown scroll variant: ${config.variant}`);
      return <ZoomScroll {...props} />;
  }
}
