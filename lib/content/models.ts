export type ContentStatus = 'DRAFT' | 'COMING_SOON' | 'PUBLISHED' | 'ARCHIVED';

export type Article = {
  id: string;
  category: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  reviewedAt: string;
  readingTime: string;
  thumbnail: string;
  slug: string;
  references: Array<{ label: string; url: string }>;
  relatedPodcastEpisodeIds: string[];
};

export type Masterclass = {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  cover: string;
  trailer: string;
  price: number;
  currency: string;
  status: ContentStatus;
  instructor: string;
  modules: unknown[];
  lessons: unknown[];
  attachments: unknown[];
  duration: string;
  faq: Array<{ question: string; answer: string }>;
};

export type ProductType = 'PHYSICAL' | 'DIGITAL' | 'COURSE' | 'MASTERCLASS';

export type Product = {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  type: ProductType;
  images: string[];
  inventory: number | null;
  active: boolean;
};

export const articles: Article[] = [];
export const masterclasses: Masterclass[] = [];
export const products: Product[] = [];
