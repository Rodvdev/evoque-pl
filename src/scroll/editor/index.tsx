'use client';

import BaseModelEditor from '@/components/render/shared/editors/BaseModelEditor';
import { SCROLL_VARIANTS } from '../config';
import { Section } from '@evoque/types';

// Transform section config to BaseModelEditor format
function transformScrollConfig() {
  const variants = Object.keys(SCROLL_VARIANTS);
  const variantStyles: Record<string, Record<string, any>> = {};
  
  // Convert variant settings to variantStyles
  Object.entries(SCROLL_VARIANTS).forEach(([key, variant]) => {
    variantStyles[key] = variant.settings || {};
  });
  
  return {
    name: 'Scroll Section',
    defaultContent: {
      variant: variants[0] || 'zoom',
    },
    defaultVariant: variants[0] || 'zoom',
    availableVariants: variants,
    variantStyles,
    baseStyles: {},
    availableSizes: [],
  };
}

interface ScrollSectionEditorProps {
  section: Section;
  onSectionUpdate: (updatedSection: Section) => void;
  onSave: (section: Section) => Promise<Section | null>;
  onDelete?: (sectionId: string) => Promise<void>;
  onDuplicate?: (sectionId: string) => Promise<void>;
  onClose: () => void;
  onBack: () => void;
  availableSections?: Section[];
  currentPageLocale?: string;
  isSaving?: boolean;
  deleting?: boolean;
  className?: string;
}

export default function ScrollSectionEditor({
  section,
  onSectionUpdate,
  onSave,
  onDelete,
  onDuplicate,
  onClose,
  onBack,
  availableSections = [],
  currentPageLocale = 'en',
  isSaving = false,
  deleting = false,
  className = '',
}: ScrollSectionEditorProps) {
  const config = transformScrollConfig();
  
  return (
    <BaseModelEditor
      entity={section}
      entityType="section"
      config={config}
      onEntityUpdate={onSectionUpdate}
      onSave={onSave}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onClose={onClose}
      onBack={onBack}
      isLoading={false}
      isSaving={isSaving}
      deleting={deleting}
      className={className}
      availableSections={availableSections}
      currentPageLocale={currentPageLocale}
    />
  );
}
