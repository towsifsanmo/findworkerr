import { BlogArticle } from '@/types';
import initialArticlesData from './initial-articles.json';

export const BLOG_ARTICLES: BlogArticle[] = initialArticlesData as BlogArticle[];

export function getArticleById(id: string): BlogArticle {
  if (!id) return BLOG_ARTICLES[0];
  const match = BLOG_ARTICLES.find(a => a.id === id);
  return match || BLOG_ARTICLES[0];
}

export function getAllArticles(): BlogArticle[] {
  return BLOG_ARTICLES;
}

export function getRelatedArticles(currentId: string, count = 3): BlogArticle[] {
  return BLOG_ARTICLES.filter(a => a.id !== currentId).slice(0, count);
}

export function getNextAndPrevArticles(currentId: string): { prev: BlogArticle; next: BlogArticle } {
  const currentIndex = BLOG_ARTICLES.findIndex(a => a.id === currentId);
  const validIndex = currentIndex >= 0 ? currentIndex : 0;
  const prev = BLOG_ARTICLES[validIndex - 1] || BLOG_ARTICLES[BLOG_ARTICLES.length - 1];
  const next = BLOG_ARTICLES[validIndex + 1] || BLOG_ARTICLES[0];
  return { prev, next };
}

export function getClapCount(articleId: string): number {
  if (typeof window === 'undefined') {
    const article = getArticleById(articleId);
    return article ? article.claps : 140;
  }
  const stored = localStorage.getItem(`findworker_claps_${articleId}`);
  if (stored !== null) {
    return parseInt(stored, 10) || 0;
  }
  const article = getArticleById(articleId);
  return article ? article.claps : 140;
}

export function incrementClap(articleId: string): number {
  const current = getClapCount(articleId);
  const updated = current + 1;
  if (typeof window !== 'undefined') {
    localStorage.setItem(`findworker_claps_${articleId}`, String(updated));
  }
  return updated;
}

