// Accordion wrapper configuration and types

export interface AccordionItem {
  id: string;
  title: string;
  content: string; // Component IDs that belong to this accordion item
  icon?: string;
  isOpen?: boolean;
  disabled?: boolean;
}

export interface AccordionContent {
  variant?: 'default' | 'cards' | 'minimal' | 'bordered' | 'outlined' | 'glass' | 'glassThin' | 'glassThick';
  size: 'sm' | 'md' | 'lg';
  allowMultiple: boolean;
  defaultOpen?: string[];
  items: AccordionItem[];
  animation?: 'slide' | 'fade' | 'none';
  spacing?: string;
  accordionStyle?: {
    backgroundColor?: string;
    borderRadius?: string;
    borderColor?: string;
    boxShadow?: string;
  };
  headerStyle?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
  };
  contentStyle?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    borderRadius?: string;
  };
}

export const ACCORDION_WRAPPER_CONFIG = {
  type: 'ACCORDION_WRAPPER' as const,
  name: 'Accordion Layout',
  description: 'Collapsible content sections with multiple variants and styling options',
  icon: '📋',
  variants: ['default', 'cards', 'minimal', 'bordered', 'outlined', 'glass', 'glassThin', 'glassThick'],
  defaultContent: {
    variant: 'default',
    size: 'md',
    allowMultiple: false,
    defaultOpen: [],
    items: [
      {
        id: 'accordion-1',
        title: 'Accordion Item 1',
        content: '',
        disabled: false
      },
      {
        id: 'accordion-2',
        title: 'Accordion Item 2',
        content: '',
        disabled: false
      }
    ],
    animation: 'slide',
    spacing: '1rem',
    accordionStyle: {
      backgroundColor: 'transparent',
      borderRadius: '0.5rem',
      borderColor: '#e5e7eb',
      boxShadow: 'none'
    },
    headerStyle: {
      backgroundColor: '#f8fafc',
      textColor: '#374151',
      fontSize: '1rem',
      fontWeight: '600',
      padding: '1rem 1.5rem'
    },
    contentStyle: {
      backgroundColor: '#ffffff',
      textColor: '#6b7280',
      padding: '1rem 1.5rem',
      borderRadius: '0.375rem'
    }
  } as AccordionContent,
  previewStyles: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }
};
