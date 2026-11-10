import { BlogArticle } from '@/types';
import initialArticlesData from './initial-articles.json';
import { apiGetArticles, apiGetArticleById, apiIncrementClap } from './api-client';

export const BLOG_ARTICLES: BlogArticle[] = initialArticlesData as BlogArticle[];

let cachedArticles: BlogArticle[] = [...BLOG_ARTICLES];

export function getAllArticles(): BlogArticle[] {
  return cachedArticles;
}

export async function fetchArticlesFromDb(): Promise<BlogArticle[]> {
  const articles = await apiGetArticles();
  if (articles && articles.length > 0) {
    cachedArticles = articles;
  }
  return cachedArticles;
}

export function getArticleById(id: string): BlogArticle {
  if (!id) return cachedArticles[0];
  const match = cachedArticles.find((a) => a.id === id);
  return match || cachedArticles[0];
}

export async function fetchArticleByIdFromDb(id: string): Promise<BlogArticle | null> {
  const article = await apiGetArticleById(id);
  if (article) {
    const idx = cachedArticles.findIndex((a) => a.id === article.id);
    if (idx !== -1) {
      cachedArticles[idx] = article;
    } else {
      cachedArticles.push(article);
    }
  }
  return article;
}

export function getRelatedArticles(currentId: string, count = 3): BlogArticle[] {
  return cachedArticles.filter((a) => a.id !== currentId).slice(0, count);
}

export function getNextAndPrevArticles(currentId: string): { prev: BlogArticle; next: BlogArticle } {
  const currentIndex = cachedArticles.findIndex((a) => a.id === currentId);
  const validIndex = currentIndex >= 0 ? currentIndex : 0;
  const prev = cachedArticles[validIndex - 1] || cachedArticles[cachedArticles.length - 1];
  const next = cachedArticles[validIndex + 1] || cachedArticles[0];
  return { prev, next };
}

export function getClapCount(articleId: string): number {
  const article = cachedArticles.find((a) => a.id === articleId);
  return article ? article.claps : 140;
}

export async function incrementClap(articleId: string): Promise<number> {
  const newCount = await apiIncrementClap(articleId);
  const article = cachedArticles.find((a) => a.id === articleId);
  if (article) {
    article.claps = newCount;
  }
  return newCount;
}
