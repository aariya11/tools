export type ToolCategory = 'images' | 'pdf' | 'text' | 'generators';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  title: string;
  description: string;
}

export interface ToolFeature {
  title: string;
  description: string;
  iconName?: string;
}

export interface ToolMeta {
  id: string;
  name: string;
  path: string;
  category: ToolCategory;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  isPopular?: boolean;
  isRecent?: boolean;
  badge?: string;
  keywords: string[];
  features: ToolFeature[];
  howToSteps: HowToStep[];
  faqs: FAQItem[];
  relatedToolIds: string[];
}
