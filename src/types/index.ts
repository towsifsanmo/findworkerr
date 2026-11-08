export interface PlatformLink {
  name: string;
  url: string;
  icon: string;
  badge?: string;
  actionText?: string;
  active?: boolean;
}

export interface PortfolioItem {
  title: string;
  category: string;
  year: string;
  image: string;
  description: string;
  tags: string[];
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface ServiceItem {
  title: string;
  price: string;
  description: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  deviceId?: string;
  timestamp?: number;
  flagged?: boolean;
  approved?: boolean;
  workerId?: string;
  workerName?: string;
  workerTrade?: string;
}

export interface Worker {
  id: string;
  name: string;
  trade: string;
  craftTitle: string;
  image: string;
  badge?: string;
  badgeLabel?: string;
  rating: number;
  reviewsCount: number;
  hourlyRate?: number;
  location: string;
  experienceYears: number;
  availability: string;
  instantBooking?: boolean;
  workPreference?: string;
  responseTime?: string;
  impressions?: string | number;
  language?: string;
  email?: string;
  phone?: string;
  website?: string;
  bio: string;
  about?: string;
  skills: string[];
  certifications?: string[];
  guarantee?: string;
  status?: 'published' | 'draft';
  featured?: boolean;
  platforms?: PlatformLink[];
  experience?: ExperienceItem[];
  services?: ServiceItem[];
  portfolio?: PortfolioItem[];
  reviews?: Review[];
}

export interface BlogAuthor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  hourlyRate: string;
  rateNum: number;
  location: string;
  rating: string;
  reviewsCount: number;
  bio: string;
}

export interface TocItem {
  id: string;
  label: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  standfirst: string;
  category: string;
  date: string;
  readTime: string;
  readMinutes: number;
  claps: number;
  author: BlogAuthor;
  heroImage: string;
  caption: string;
  toc: TocItem[];
  proseHtml: string;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'freelancer';
  workerId?: string;
  avatar: string;
  createdAt?: string;
}

export interface PlatformStats {
  totalFreelancers: number;
  publishedFreelancers: number;
  draftFreelancers: number;
  totalCategories: number;
  totalReviews: number;
  averageRating: string;
  totalClicks: number;
}
