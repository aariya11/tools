export type ToolCategory = 'images' | 'pdf' | 'text' | 'generators' | 'ai' | 'business' | 'developer' | 'file' | 'social' | 'calculators';

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

export interface EducationalSection {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  useCases?: string[];
  whyChoose?: string[];
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
  
  // Search Engine Optimization (SEO)
  seoTitle?: string;
  metaDescription?: string;
  h1Heading?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  educationalSection?: EducationalSection;

  keywords?: string[]; // Internal helper/search filter tags
  features: ToolFeature[];
  howToSteps: HowToStep[];
  faqs: FAQItem[];
  relatedToolIds: string[];
}
