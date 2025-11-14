'use client';

import BaseModelEditor from '@/components/render/shared/editors/BaseModelEditor';
import { ACCORDION_WRAPPER_CONFIG } from '../config';
import { SectionComponent } from '@evoque/types';

interface AccordionEditorProps {
  component: SectionComponent;
  sectionId: string;
  onComponentUpdate: (updatedComponent: SectionComponent) => void;
  onSave: (component: SectionComponent) => Promise<SectionComponent | null>;
  onDelete?: (componentId: string) => Promise<void>;
  onDuplicate?: (componentId: string) => Promise<void>;
  onClose: () => void;
  onBack: () => void;
  forms?: any[];
  currentPageLocale?: string;
  isSaving?: boolean;
  deleting?: boolean;
  className?: string;
}

export default function AccordionEditor({
  component,
  sectionId,
  onComponentUpdate,
  onSave,
  onDelete,
  onDuplicate,
  onClose,
  onBack,
  forms = [],
  currentPageLocale = 'en',
  isSaving = false,
  deleting = false,
  className = '',
}: AccordionEditorProps) {
  return (
    <BaseModelEditor
      entity={component}
      entityType="component"
      config={ACCORDION_WRAPPER_CONFIG}
      onEntityUpdate={onComponentUpdate}
      onSave={onSave}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onClose={onClose}
      onBack={onBack}
      isLoading={false}
      isSaving={isSaving}
      deleting={deleting}
      className={className}
      sectionId={sectionId}
      availableForms={forms}
      currentPageLocale={currentPageLocale}
    />
  );
}
