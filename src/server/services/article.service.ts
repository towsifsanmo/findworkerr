import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function getAllArticles() {
  const articles = await prisma.article.findMany({
    orderBy: { id: 'asc' },
    include: {
      author: true,
    },
  });

  return articles.map(formatArticle);
}

export async function getArticleById(idOrSlug: string) {
  if (!idOrSlug) return null;
  const article = await prisma.article.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      author: true,
    },
  });

  if (!article) return null;
  return formatArticle(article);
}

export async function incrementClap(articleId: string) {
  const updated = await prisma.article.update({
    where: { id: articleId },
    data: {
      claps: { increment: 1 },
    },
    select: { id: true, claps: true },
  });

  logger.debug({ articleId, claps: updated.claps }, 'Article applauded');
  return updated.claps;
}

function formatArticle(a: any) {
  return {
    id: a.id,
    title: a.title,
    standfirst: a.standfirst,
    category: a.category,
    date: a.date,
    readTime: a.readTime,
    readMinutes: a.readMinutes,
    claps: a.claps,
    heroImage: a.heroImage,
    caption: a.caption,
    toc: a.toc || [],
    proseHtml: a.proseHtml,
    tags: a.tags || [],
    author: {
      id: a.author?.id || 'author-default',
      name: a.author?.name || 'Editorial Contributor',
      role: a.author?.craftTitle || a.author?.trade || 'Specialist',
      avatar: a.author?.image || '/assets/images/hero_craftsman.jpg',
      hourlyRate: `$${a.author?.hourlyRate || 80}/hr`,
      rateNum: a.author?.hourlyRate || 80,
      location: a.author?.location || 'Remote',
      rating: (a.author?.rating || 5.0).toFixed(2),
      reviewsCount: a.author?.reviewsCount || 0,
      bio: a.author?.bio || '',
    },
  };
}

