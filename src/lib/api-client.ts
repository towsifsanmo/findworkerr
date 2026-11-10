import { Worker, Review, PlatformStats, BlogArticle, User, CategoryItem } from '@/types';

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string; message?: string; meta?: any }> {
  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      return {
        success: false,
        error: json?.error || json?.message || `Request failed with status ${res.status}`,
        message: json?.message,
      };
    }

    return {
      success: true,
      data: json.data as T,
      message: json.message,
      meta: json.meta,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network communication error.',
    };
  }
}

// ---------------------------------------------------------------------------
// 1. WORKERS & DIRECTORY
// ---------------------------------------------------------------------------

export async function apiGetWorkers(params: {
  search?: string;
  categories?: string[];
  badges?: string[];
  skills?: string[];
  languages?: string[];
  sortBy?: string;
  page?: number;
  pageSize?: number;
  includeDrafts?: boolean;
} = {}): Promise<{ workers: Worker[]; pagination?: any }> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.includeDrafts) query.set('includeDrafts', 'true');

  if (params.categories) {
    params.categories.forEach((c) => query.append('categories', c));
  }
  if (params.badges) {
    params.badges.forEach((b) => query.append('badges', b));
  }
  if (params.skills) {
    params.skills.forEach((s) => query.append('skills', s));
  }
  if (params.languages) {
    params.languages.forEach((l) => query.append('languages', l));
  }

  const res = await apiFetch<Worker[]>(`/api/workers?${query.toString()}`);
  return {
    workers: res.data || [],
    pagination: res.meta?.pagination,
  };
}

export async function apiGetWorkerById(id: string): Promise<Worker | null> {
  const res = await apiFetch<Worker>(`/api/workers/${encodeURIComponent(id)}`);
  return res.data || null;
}

export async function apiSaveWorkerProfile(id: string, updates: Partial<Worker>): Promise<Worker | null> {
  const res = await apiFetch<Worker>(`/api/workers/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return res.data || null;
}

export async function apiCreateWorkerProfile(data: Partial<Worker>): Promise<Worker | null> {
  const res = await apiFetch<Worker>('/api/workers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data || null;
}

export async function apiDeleteWorkerProfile(id: string): Promise<boolean> {
  const res = await apiFetch(`/api/workers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return res.success;
}

export async function apiToggleWorkerStatus(id: string): Promise<Worker | null> {
  const res = await apiFetch<Worker>(`/api/workers/${encodeURIComponent(id)}/status`, {
    method: 'POST',
  });
  return res.data || null;
}

export async function apiToggleWorkerFeatured(id: string): Promise<Worker | null> {
  const res = await apiFetch<Worker>(`/api/workers/${encodeURIComponent(id)}/featured`, {
    method: 'POST',
  });
  return res.data || null;
}

// ---------------------------------------------------------------------------
// 2. PLATFORMS, PORTFOLIO & EXPERIENCE
// ---------------------------------------------------------------------------

export async function apiSaveWorkerPlatform(workerId: string, platformData: any): Promise<boolean> {
  const res = await apiFetch(`/api/workers/${encodeURIComponent(workerId)}/platforms`, {
    method: 'POST',
    body: JSON.stringify(platformData),
  });
  return res.success;
}

export async function apiDeleteWorkerPlatform(workerId: string, linkId: string): Promise<boolean> {
  const res = await apiFetch(`/api/workers/${encodeURIComponent(workerId)}/platforms?linkId=${encodeURIComponent(linkId)}`, {
    method: 'DELETE',
  });
  return res.success;
}

export async function apiSaveWorkerPortfolio(workerId: string, projectData: any): Promise<boolean> {
  const res = await apiFetch(`/api/workers/${encodeURIComponent(workerId)}/portfolio`, {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
  return res.success;
}

export async function apiDeleteWorkerPortfolio(workerId: string, projectId: string): Promise<boolean> {
  const res = await apiFetch(`/api/workers/${encodeURIComponent(workerId)}/portfolio?projectId=${encodeURIComponent(projectId)}`, {
    method: 'DELETE',
  });
  return res.success;
}

export async function apiSaveWorkerExperience(workerId: string, expData: any): Promise<boolean> {
  const res = await apiFetch(`/api/workers/${encodeURIComponent(workerId)}/experience`, {
    method: 'POST',
    body: JSON.stringify(expData),
  });
  return res.success;
}

export async function apiDeleteWorkerExperience(workerId: string, expId: string): Promise<boolean> {
  const res = await apiFetch(`/api/workers/${encodeURIComponent(workerId)}/experience?expId=${encodeURIComponent(expId)}`, {
    method: 'DELETE',
  });
  return res.success;
}

// ---------------------------------------------------------------------------
// 3. CATEGORIES
// ---------------------------------------------------------------------------

export async function apiGetCategories(): Promise<string[]> {
  const res = await apiFetch<{ name: string }[]>('/api/categories');
  if (res.data && Array.isArray(res.data)) {
    return res.data.map((c) => c.name);
  }
  return [];
}

export async function apiGetCategoriesDetailed(): Promise<CategoryItem[]> {
  const res = await apiFetch<CategoryItem[]>('/api/categories');
  return res.data && Array.isArray(res.data) ? res.data : [];
}

export async function apiAddCategory(name: string): Promise<boolean> {
  const res = await apiFetch('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return res.success;
}

export async function apiDeleteCategory(name: string): Promise<boolean> {
  const res = await apiFetch(`/api/categories?name=${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
  return res.success;
}

// ---------------------------------------------------------------------------
// 4. REVIEWS
// ---------------------------------------------------------------------------

export async function apiGetWorkerReviews(workerId: string): Promise<Review[]> {
  const res = await apiFetch<Review[]>(`/api/reviews?workerId=${encodeURIComponent(workerId)}`);
  return res.data || [];
}

export async function apiGetAllPlatformReviews(): Promise<Review[]> {
  const res = await apiFetch<Review[]>('/api/reviews');
  return res.data || [];
}

export async function apiGetDeviceReview(workerId: string, deviceId: string): Promise<{ hasReviewed: boolean; review: Review | null }> {
  const res = await apiFetch<{ hasReviewed: boolean; review: Review | null }>(
    `/api/reviews?workerId=${encodeURIComponent(workerId)}&deviceId=${encodeURIComponent(deviceId)}`
  );
  return res.data || { hasReviewed: false, review: null };
}

export async function apiAddReview(
  workerId: string,
  reviewData: Partial<Review>,
  deviceId: string
): Promise<{ success: boolean; message?: string; review?: Review }> {
  const res = await apiFetch<Review>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({
      workerId,
      author: reviewData.author || 'Verified Client',
      rating: reviewData.rating || 5,
      title: reviewData.title || 'Verified Client Review',
      comment: reviewData.comment || '',
      deviceId,
    }),
  });

  return {
    success: res.success,
    message: res.error || res.message,
    review: res.data,
  };
}

export async function apiModerateReview(reviewId: string, action: 'approve' | 'flag' | 'delete'): Promise<boolean> {
  const res = await apiFetch(`/api/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
  return res.success;
}

// ---------------------------------------------------------------------------
// 5. ARTICLES & CLAPS
// ---------------------------------------------------------------------------

export async function apiGetArticles(): Promise<BlogArticle[]> {
  const res = await apiFetch<BlogArticle[]>('/api/articles');
  return res.data || [];
}

export async function apiGetArticleById(id: string): Promise<BlogArticle | null> {
  const res = await apiFetch<BlogArticle>(`/api/articles/${encodeURIComponent(id)}`);
  return res.data || null;
}

export async function apiIncrementClap(articleId: string): Promise<number> {
  const res = await apiFetch<{ claps: number }>(`/api/articles/${encodeURIComponent(articleId)}/clap`, {
    method: 'POST',
  });
  return res.data?.claps || 140;
}

// ---------------------------------------------------------------------------
// 6. PLATFORM STATS & DISPATCH CLICKS
// ---------------------------------------------------------------------------

export async function apiGetPlatformStats(): Promise<PlatformStats> {
  const res = await apiFetch<PlatformStats>('/api/stats');
  return (
    res.data || {
      totalFreelancers: 0,
      publishedFreelancers: 0,
      draftFreelancers: 0,
      totalCategories: 0,
      totalReviews: 0,
      averageRating: '5.00',
      totalClicks: 384,
    }
  );
}

export async function apiTrackPlatformClick(workerId: string, platformName: string, deviceId?: string): Promise<number> {
  const res = await apiFetch<{ clicks: number }>('/api/track-click', {
    method: 'POST',
    body: JSON.stringify({ workerId, platformName, deviceId }),
  });
  return res.data?.clicks || 1;
}

export async function apiGetPlatformClicks(workerId?: string): Promise<number> {
  const query = workerId ? `?workerId=${encodeURIComponent(workerId)}` : '';
  const res = await apiFetch<{ clicks: number }>(`/api/track-click${query}`);
  return res.data?.clicks || 42;
}

// ---------------------------------------------------------------------------
// 7. INQUIRIES & FILE UPLOADS
// ---------------------------------------------------------------------------

export async function apiSendInquiry(data: {
  workerId: string;
  clientName: string;
  clientContact: string;
  targetDate?: string;
  hours?: string;
  description: string;
}): Promise<boolean> {
  const res = await apiFetch('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.success;
}

export async function apiUploadFile(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, error: json?.error || 'Upload failed.' };
    }
    return { success: true, url: json.data?.url };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Upload network error.' };
  }
}

// ---------------------------------------------------------------------------
// 8. AUTH & USER PROFILE
// ---------------------------------------------------------------------------

export async function apiGetCurrentUser(): Promise<User | null> {
  const res = await apiFetch<User>('/api/auth/me');
  return res.data || null;
}

export async function apiUpdateCredentials(data: {
  currentPassword: string;
  newPassword?: string;
  newEmail?: string;
  newName?: string;
  adminUpdate?: boolean;
}): Promise<{ success: boolean; message: string; user?: any }> {
  const res = await apiFetch('/api/auth/credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return {
    success: res.success,
    message: res.message || res.error || (res.success ? 'Credentials updated.' : 'Failed to update credentials.'),
    user: res.data,
  };
}

