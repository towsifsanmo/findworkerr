export interface PlatformLink {
  id?: string;
  name: string;
  url: string;
  icon: string;
  badge?: string;
  actionText?: string;
  active?: boolean;
}

export interface PortfolioItem {
  id?: string;
  title: string;
  category: string;
  year?: string;
  image: string;
  description?: string;
  tags?: string[];
}

export interface ExperienceItem {
  id?: string;
  role: string;
  company: string;
  period: string;
  description?: string;
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
  workerImage?: string;
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
  status?: 'published' | 'draft';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'freelancer';
  workerId?: string;
  workerProfileId?: string;
  image?: string;
  avatar: string;
  createdAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
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

export interface PageViewItem {
  id: string;
  visitorId: string;
  path: string;
  title?: string | null;
  referrer?: string | null;
  duration: number; // in seconds
  startedAt: string;
  createdAt: string;
}

export interface VisitorItem {
  id: string;
  visitorId: string;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  browser?: string | null;
  browserVersion?: string | null;
  os?: string | null;
  osVersion?: string | null;
  deviceType?: string | null; // Desktop | Mobile | Tablet
  deviceModel?: string | null;
  screenResolution?: string | null;
  viewport?: string | null;
  language?: string | null;
  timezone?: string | null;
  platform?: string | null;
  referrer?: string | null;
  initialLanding?: string | null;
  totalVisits: number;
  totalDuration: number;
  firstSeenAt: string;
  lastActiveAt: string;
  createdAt: string;
  pageViews?: PageViewItem[];
  _count?: {
    pageViews: number;
  };
}

export interface VisitorStats {
  totalVisitors: number;
  activeVisitors: number;
  totalPageViews: number;
  avgDuration: number; // in seconds
}
