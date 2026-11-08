import { Worker, Review, PlatformStats, PlatformLink } from '@/types';
import initialWorkersData from './initial-workers.json';
import initialCategoriesData from './initial-categories.json';

export const INITIAL_WORKERS: Worker[] = initialWorkersData as Worker[];
export const DEFAULT_CATEGORIES: string[] = initialCategoriesData as string[];

const STORAGE_KEY_WORKERS = 'findworker_custom_profiles';
const STORAGE_KEY_OVERRIDES = 'findworker_worker_overrides';
const STORAGE_KEY_PLATFORMS = 'findworker_platform_overrides';
const STORAGE_KEY_CATEGORIES = 'findworker_custom_categories';
const STORAGE_KEY_CLICKS = 'findworker_platform_clicks';
const STORAGE_KEY_REVIEWS = 'findworker_user_reviews';
const STORAGE_KEY_DELETED = 'findworker_deleted_workers';

function getStoredCustomWorkers(): Worker[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORKERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function getWorkerOverrides(): Record<string, Partial<Worker>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OVERRIDES);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function getCustomPlatformOverrides(): Record<string, PlatformLink[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLATFORMS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function getDeletedWorkerIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getAllWorkers(options: { includeDrafts?: boolean } = {}): Worker[] {
  const custom = getStoredCustomWorkers();
  const overrides = getWorkerOverrides();
  const platformOverrides = getCustomPlatformOverrides();
  const deletedIds = getDeletedWorkerIds();

  // Merge initial workers with stored overrides
  const processedInitials = INITIAL_WORKERS
    .filter(w => !deletedIds.includes(w.id))
    .map(w => {
      const merged = { ...w, ...(overrides[w.id] || {}) };
      if (platformOverrides[w.id]) {
        merged.platforms = platformOverrides[w.id];
      }
      return merged;
    });

  // Combine custom workers + processed initials
  const allMap = new Map<string, Worker>();
  // Custom profiles take priority
  custom.forEach(w => {
    if (!deletedIds.includes(w.id)) {
      const merged = { ...w };
      if (platformOverrides[w.id]) {
        merged.platforms = platformOverrides[w.id];
      }
      allMap.set(w.id, merged);
    }
  });

  processedInitials.forEach(w => {
    if (!allMap.has(w.id)) {
      allMap.set(w.id, w);
    }
  });

  const list = Array.from(allMap.values());

  if (options.includeDrafts) {
    return list;
  }

  return list.filter(w => w.status !== 'draft');
}

export function getWorkerById(workerId: string): Worker | null {
  if (!workerId) return null;
  const all = getAllWorkers({ includeDrafts: true });
  return all.find(w => w.id === workerId) || null;
}

export function saveWorkerProfile(workerData: Partial<Worker> & { id: string }): Worker | null {
  if (typeof window === 'undefined' || !workerData || !workerData.id) return null;
  try {
    const custom = getStoredCustomWorkers();
    const customIndex = custom.findIndex(w => w.id === workerData.id);

    if (customIndex !== -1) {
      custom[customIndex] = { ...custom[customIndex], ...workerData } as Worker;
      localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(custom));
    } else {
      const isInitial = INITIAL_WORKERS.some(w => w.id === workerData.id);
      if (isInitial) {
        const overrides = getWorkerOverrides();
        overrides[workerData.id] = { ...(overrides[workerData.id] || {}), ...workerData };
        localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(overrides));
      } else {
        custom.unshift(workerData as Worker);
        localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(custom));
      }
    }

    if (Array.isArray(workerData.platforms)) {
      saveWorkerPlatformLinks(workerData.id, workerData.platforms);
    }

    window.dispatchEvent(new CustomEvent('findworker:data-updated', { detail: { workerId: workerData.id } }));
    return getWorkerById(workerData.id);
  } catch (e) {
    console.error('Error saving worker profile:', e);
    return null;
  }
}

export function addWorkerProfile(workerData: Partial<Worker>): Worker | null {
  if (typeof window === 'undefined' || !workerData) return null;
  try {
    const custom = getStoredCustomWorkers();
    const id = workerData.id || `fw-worker-${Date.now()}`;
    const newWorker: Worker = {
      id,
      name: workerData.name || 'Anonymous Specialist',
      trade: workerData.trade || 'Web Development',
      craftTitle: workerData.craftTitle || 'Independent Specialist',
      image: workerData.image || 'assets/images/hero_craftsman.jpg',
      badge: workerData.badge || 'PRO',
      badgeLabel: workerData.badgeLabel || 'Independent Professional',
      rating: workerData.rating || 5.0,
      reviewsCount: workerData.reviewsCount || 0,
      hourlyRate: workerData.hourlyRate || 80,
      location: workerData.location || 'Remote Available',
      experienceYears: workerData.experienceYears || 5,
      availability: workerData.availability || 'Available Today',
      instantBooking: workerData.instantBooking ?? true,
      language: workerData.language || 'English',
      email: workerData.email || '',
      phone: workerData.phone || '',
      website: workerData.website || '',
      bio: workerData.bio || '',
      about: workerData.about || workerData.bio || '',
      skills: Array.isArray(workerData.skills) ? workerData.skills : [],
      certifications: workerData.certifications || ['Verified Independent Specialist'],
      guarantee: workerData.guarantee || 'Direct contact, 0% platform intermediary commission.',
      status: workerData.status || 'published',
      featured: workerData.featured ?? false,
      platforms: Array.isArray(workerData.platforms) ? workerData.platforms : [],
      experience: workerData.experience || [],
      services: workerData.services || [],
      portfolio: workerData.portfolio || [],
      reviews: workerData.reviews || []
    };

    custom.unshift(newWorker);
    localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(custom));
    window.dispatchEvent(new CustomEvent('findworker:data-updated', { detail: { workerId: id } }));
    return newWorker;
  } catch (e) {
    console.error('Error adding worker profile:', e);
    return null;
  }
}

export function deleteWorkerProfile(workerId: string): boolean {
  if (typeof window === 'undefined' || !workerId) return false;
  try {
    const custom = getStoredCustomWorkers();
    const filtered = custom.filter(w => w.id !== workerId);
    localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(filtered));

    const deletedIds = getDeletedWorkerIds();
    if (!deletedIds.includes(workerId)) {
      deletedIds.push(workerId);
      localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(deletedIds));
    }

    window.dispatchEvent(new CustomEvent('findworker:data-updated', { detail: { workerId, deleted: true } }));
    return true;
  } catch (e) {
    console.error('Error deleting worker profile:', e);
    return false;
  }
}

export function toggleWorkerStatus(workerId: string): Worker | null {
  const worker = getWorkerById(workerId);
  if (!worker) return null;
  const newStatus = worker.status === 'draft' ? 'published' : 'draft';
  return saveWorkerProfile({ id: workerId, status: newStatus });
}

export function toggleWorkerFeatured(workerId: string): Worker | null {
  const worker = getWorkerById(workerId);
  if (!worker) return null;
  const isFeatured = !worker.featured;
  return saveWorkerProfile({ id: workerId, featured: isFeatured });
}

export function toggleWorkerBadge(workerId: string, badgeText: string): Worker | null {
  return saveWorkerProfile({ id: workerId, badge: badgeText });
}

export function saveWorkerPlatformLinks(workerId: string, platforms: PlatformLink[]): boolean {
  if (typeof window === 'undefined' || !workerId || !Array.isArray(platforms)) return false;
  try {
    const overrides = getCustomPlatformOverrides();
    overrides[workerId] = platforms;
    localStorage.setItem(STORAGE_KEY_PLATFORMS, JSON.stringify(overrides));
    return true;
  } catch (e) {
    console.error('Error saving platform links:', e);
    return false;
  }
}

export function getAllCategories(): string[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    const customCategories: string[] = saved ? JSON.parse(saved) : [];
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...customCategories]));
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
}

export function addCategory(categoryName: string): boolean {
  if (typeof window === 'undefined' || !categoryName || typeof categoryName !== 'string') return false;
  const name = categoryName.trim();
  if (!name) return false;
  try {
    const all = getAllCategories();
    if (!all.includes(name)) {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      const customCategories = saved ? JSON.parse(saved) : [];
      customCategories.push(name);
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(customCategories));
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function deleteCategory(categoryName: string): boolean {
  if (typeof window === 'undefined' || !categoryName) return false;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    const customCategories: string[] = saved ? JSON.parse(saved) : [];
    const filtered = customCategories.filter(c => c.toLowerCase() !== categoryName.toLowerCase());
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(filtered));
    return true;
  } catch (e) {
    return false;
  }
}

export function trackPlatformClick(workerId: string, platformName: string): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLICKS);
    const clicks = raw ? JSON.parse(raw) : {};
    const key = `${workerId}_${platformName}`;
    clicks[key] = (clicks[key] || 0) + 1;
    clicks._total = (clicks._total || 0) + 1;
    localStorage.setItem(STORAGE_KEY_CLICKS, JSON.stringify(clicks));
    return clicks[key];
  } catch (e) {
    return 1;
  }
}

export function getPlatformClicks(workerId?: string): number {
  if (typeof window === 'undefined') return 384;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLICKS);
    const clicks = raw ? JSON.parse(raw) : {};
    if (!workerId) return clicks._total || 384;
    let total = 0;
    for (const k in clicks) {
      if (k.startsWith(`${workerId}_`)) {
        total += clicks[k];
      }
    }
    return total || 42;
  } catch (e) {
    return 0;
  }
}

export function getStoredReviews(): Record<string, Review[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function getWorkerReviews(workerId: string, deepLookup = true): Review[] {
  let baseReviews: Review[] = [];
  if (deepLookup) {
    const worker = getWorkerById(workerId);
    baseReviews = (worker && Array.isArray(worker.reviews)) ? worker.reviews : [];
  } else {
    const initialWorker = INITIAL_WORKERS.find(w => w.id === workerId);
    baseReviews = (initialWorker && Array.isArray(initialWorker.reviews)) ? initialWorker.reviews : [];
  }
  const stored = getStoredReviews();
  const userReviewsForWorker = (stored[workerId] && Array.isArray(stored[workerId])) ? stored[workerId] : [];
  return [...userReviewsForWorker, ...baseReviews];
}

export function getAllPlatformReviews(): Review[] {
  const allWorkers = getAllWorkers({ includeDrafts: true });
  const reviews: Review[] = [];
  allWorkers.forEach(w => {
    const list = getWorkerReviews(w.id, false);
    list.forEach(r => {
      reviews.push({
        ...r,
        workerId: w.id,
        workerName: w.name,
        workerTrade: w.trade
      });
    });
  });
  return reviews.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
}

export function moderateReview(workerId: string, reviewId: string, action: 'approve' | 'flag' | 'delete'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = getStoredReviews();
    if (stored[workerId]) {
      if (action === 'delete') {
        stored[workerId] = stored[workerId].filter(r => r.id !== reviewId);
      } else if (action === 'flag') {
        stored[workerId] = stored[workerId].map(r => r.id === reviewId ? { ...r, flagged: true } : r);
      } else if (action === 'approve') {
        stored[workerId] = stored[workerId].map(r => r.id === reviewId ? { ...r, flagged: false, approved: true } : r);
      }
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(stored));
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function getDeviceReviewForWorker(workerId: string, deviceId: string): Review | null {
  if (!workerId || !deviceId) return null;
  const stored = getStoredReviews();
  const workerReviews = stored[workerId] || [];
  return workerReviews.find(r => r.deviceId === deviceId) || null;
}

export function addWorkerReview(workerId: string, reviewData: Partial<Review>, deviceId: string): { success: boolean; message?: string; alreadyReviewed?: boolean; existingReview?: Review; review?: Review } {
  if (typeof window === 'undefined' || !workerId || !reviewData || !deviceId) {
    return { success: false, message: 'Invalid review parameters.' };
  }

  const existing = getDeviceReviewForWorker(workerId, deviceId);
  if (existing) {
    return {
      success: false,
      alreadyReviewed: true,
      message: 'This device has already submitted a review for this freelancer.',
      existingReview: existing
    };
  }

  const stored = getStoredReviews();
  if (!stored[workerId]) {
    stored[workerId] = [];
  }

  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    author: reviewData.author || 'Verified Client',
    rating: Math.max(1, Math.min(5, Number(reviewData.rating) || 5)),
    date: new Date().toISOString().split('T')[0],
    title: reviewData.title || 'Exceptional Collaboration',
    comment: reviewData.comment || '',
    deviceId: deviceId,
    timestamp: Date.now()
  };

  stored[workerId].unshift(newReview);

  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(stored));
    return { success: true, review: newReview };
  } catch (e) {
    return { success: false, message: 'Storage capacity exceeded or private mode error.' };
  }
}

export function getPlatformStats(): PlatformStats {
  const allWorkers = getAllWorkers({ includeDrafts: true });
  const published = allWorkers.filter(w => w.status !== 'draft');
  const categories = getAllCategories();
  const reviews = getAllPlatformReviews();
  const totalClicks = getPlatformClicks();

  let ratingSum = 0;
  published.forEach(w => {
    ratingSum += (w.rating || 5);
  });
  const avgRating = published.length ? (ratingSum / published.length).toFixed(2) : '5.00';

  return {
    totalFreelancers: allWorkers.length,
    publishedFreelancers: published.length,
    draftFreelancers: allWorkers.length - published.length,
    totalCategories: categories.length,
    totalReviews: reviews.length,
    averageRating: avgRating,
    totalClicks: totalClicks
  };
}

