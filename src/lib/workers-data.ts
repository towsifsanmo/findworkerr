import { Worker, Review, PlatformStats, PlatformLink, CategoryItem } from '@/types';
import initialWorkersData from './initial-workers.json';
import initialCategoriesData from './initial-categories.json';
import {
  apiGetWorkers,
  apiGetWorkerById,
  apiSaveWorkerProfile,
  apiCreateWorkerProfile,
  apiDeleteWorkerProfile,
  apiToggleWorkerStatus,
  apiToggleWorkerFeatured,
  apiGetCategories,
  apiGetCategoriesDetailed,
  apiAddCategory,
  apiDeleteCategory,
  apiGetWorkerReviews,
  apiGetAllPlatformReviews,
  apiGetDeviceReview,
  apiAddReview,
  apiModerateReview,
  apiGetPlatformStats,
  apiTrackPlatformClick,
  apiGetPlatformClicks,
} from './api-client';

export const INITIAL_WORKERS: Worker[] = initialWorkersData as Worker[];
export const DEFAULT_CATEGORIES: string[] = (initialCategoriesData as any[]).map((c) =>
  typeof c === 'string' ? c : c.name
);

// In-memory cache for fast synchronous access (starts empty, always populated from database)
let cachedWorkers: Worker[] = [];
let cachedCategories: string[] = [];

export function getAllWorkers(options: { includeDrafts?: boolean } = {}): Worker[] {
  if (options.includeDrafts) {
    return cachedWorkers;
  }
  return cachedWorkers.filter((w) => w.status !== 'draft');
}

export function setCachedWorkers(workers: Worker[]) {
  if (Array.isArray(workers)) {
    cachedWorkers = workers;
  }
}

export async function fetchWorkersFromDb(options: { includeDrafts?: boolean; search?: string; categories?: string[] } = {}): Promise<Worker[]> {
  const res = await apiGetWorkers({
    includeDrafts: options.includeDrafts,
    search: options.search,
    categories: options.categories,
  });
  if (res.workers) {
    cachedWorkers = res.workers;
  }
  return res.workers || [];
}

export function getWorkerById(workerId: string): Worker | null {
  if (!workerId) return null;
  return cachedWorkers.find((w) => w.id === workerId) || null;
}

export async function fetchWorkerByIdFromDb(workerId: string): Promise<Worker | null> {
  if (!workerId) return null;
  const worker = await apiGetWorkerById(workerId);
  if (worker) {
    const idx = cachedWorkers.findIndex((w) => w.id === worker.id);
    if (idx !== -1) {
      cachedWorkers[idx] = worker;
    } else {
      cachedWorkers.unshift(worker);
    }
  }
  return worker;
}

export async function saveWorkerProfile(workerData: Partial<Worker> & { id: string }): Promise<Worker | null> {
  if (!workerData || !workerData.id) return null;
  const updated = await apiSaveWorkerProfile(workerData.id, workerData);
  if (updated) {
    const idx = cachedWorkers.findIndex((w) => w.id === updated.id);
    if (idx !== -1) {
      cachedWorkers[idx] = updated;
    } else {
      cachedWorkers.unshift(updated);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('findworker:data-updated', { detail: { workerId: updated.id } }));
    }
  }
  return updated;
}

export async function addWorkerProfile(workerData: Partial<Worker>): Promise<Worker | null> {
  if (!workerData) return null;
  const created = await apiCreateWorkerProfile(workerData);
  if (created) {
    cachedWorkers.unshift(created);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('findworker:data-updated', { detail: { workerId: created.id } }));
    }
  }
  return created;
}

export async function deleteWorkerProfile(workerId: string): Promise<boolean> {
  if (!workerId) return false;
  const ok = await apiDeleteWorkerProfile(workerId);
  if (ok) {
    cachedWorkers = cachedWorkers.filter((w) => w.id !== workerId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('findworker:data-updated', { detail: { workerId, deleted: true } }));
    }
  }
  return ok;
}

export async function toggleWorkerStatus(workerId: string): Promise<Worker | null> {
  const updated = await apiToggleWorkerStatus(workerId);
  if (updated) {
    const idx = cachedWorkers.findIndex((w) => w.id === updated.id);
    if (idx !== -1) {
      cachedWorkers[idx] = updated;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('findworker:data-updated', { detail: { workerId: updated.id } }));
    }
  }
  return updated;
}

export async function toggleWorkerFeatured(workerId: string): Promise<Worker | null> {
  const updated = await apiToggleWorkerFeatured(workerId);
  if (updated) {
    const idx = cachedWorkers.findIndex((w) => w.id === updated.id);
    if (idx !== -1) {
      cachedWorkers[idx] = updated;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('findworker:data-updated', { detail: { workerId: updated.id } }));
    }
  }
  return updated;
}

export function getAllCategories(): string[] {
  return cachedCategories;
}

export async function fetchCategoriesFromDb(): Promise<string[]> {
  const cats = await apiGetCategories();
  if (cats && Array.isArray(cats)) {
    cachedCategories = cats;
  }
  return cachedCategories;
}

export async function fetchCategoriesDetailedFromDb(): Promise<CategoryItem[]> {
  const cats = await apiGetCategoriesDetailed();
  if (cats && Array.isArray(cats)) {
    cachedCategories = cats.map((c) => c.name);
  }
  return cats || [];
}

export async function addCategory(categoryName: string): Promise<boolean> {
  if (!categoryName || !categoryName.trim()) return false;
  const name = categoryName.trim();
  const ok = await apiAddCategory(name);
  if (ok) {
    if (!cachedCategories.includes(name)) {
      cachedCategories.push(name);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('findworker:data-updated', { detail: { category: name } }));
    }
  }
  return ok;
}

export async function deleteCategory(categoryName: string): Promise<boolean> {
  if (!categoryName) return false;
  const ok = await apiDeleteCategory(categoryName);
  if (ok) {
    cachedCategories = cachedCategories.filter((c) => c.toLowerCase() !== categoryName.toLowerCase());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('findworker:data-updated', { detail: { category: categoryName, deleted: true } }));
    }
  }
  return ok;
}

export async function trackPlatformClick(workerId: string, platformName: string): Promise<number> {
  return apiTrackPlatformClick(workerId, platformName);
}

export async function getPlatformClicks(workerId?: string): Promise<number> {
  return apiGetPlatformClicks(workerId);
}

export async function getWorkerReviews(workerId: string): Promise<Review[]> {
  return apiGetWorkerReviews(workerId);
}

export async function getAllPlatformReviews(): Promise<Review[]> {
  return apiGetAllPlatformReviews();
}

export async function getDeviceReviewForWorker(workerId: string, deviceId: string): Promise<Review | null> {
  const res = await apiGetDeviceReview(workerId, deviceId);
  return res.review;
}

export async function addWorkerReview(
  workerId: string,
  reviewData: Partial<Review>,
  deviceId: string
): Promise<{ success: boolean; message?: string; alreadyReviewed?: boolean; review?: Review }> {
  return apiAddReview(workerId, reviewData, deviceId);
}

export async function moderateReview(reviewId: string, action: 'approve' | 'flag' | 'delete'): Promise<boolean> {
  return apiModerateReview(reviewId, action);
}

export async function getPlatformStats(): Promise<PlatformStats> {
  return apiGetPlatformStats();
}
