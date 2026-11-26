import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function getAllArticles(options?: { includeDrafts?: boolean }) {
  const where: any = {};
  if (!options?.includeDrafts) {
    where.status = 'published';
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: 'desc' },
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

export async function createArticle(data: {
  title: string;
  standfirst: string;
  category: string;
  heroImage?: string;
  caption?: string;
  proseHtml: string;
  readMinutes?: number;
  tags?: string[];
  authorId?: string;
  status?: 'published' | 'draft';
}) {
  const id = `article-${Date.now()}`;
  const slug =
    data.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') + `-${Date.now().toString().slice(-4)}`;

  const readMinutes =
    Number(data.readMinutes) ||
    Math.max(
      1,
      Math.ceil(data.proseHtml.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)
    );
  const readTime = `${readMinutes} min read`;

  // Auto-generate TOC from <h2> tags or default
  const toc: { id: string; label: string }[] = [];
  const h2Regex = /<h2[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/h2>|<h2[^>]*>(.*?)<\/h2>/gi;
  let match;
  let count = 1;
  while ((match = h2Regex.exec(data.proseHtml)) !== null) {
    const rawLabel = (match[2] || match[3] || '').replace(/<[^>]*>/g, '').trim();
    if (rawLabel) {
      const generatedId = match[1] || `section-${count}`;
      toc.push({
        id: generatedId,
        label: `${count}. ${rawLabel.replace(/^\d+\.\s*/, '')}`,
      });
      count++;
    }
  }

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const article = await prisma.article.create({
    data: {
      id,
      slug,
      title: data.title.trim(),
      standfirst: data.standfirst.trim(),
      category: data.category.trim().toUpperCase(),
      date: formattedDate,
      readTime,
      readMinutes,
      claps: 140,
      heroImage: data.heroImage?.trim() || '/assets/images/hero_craftsman.jpg',
      caption: data.caption?.trim() || data.title.trim(),
      toc: toc.length > 0 ? (toc as any) : [{ id: 'intro', label: '1. Overview' }],
      proseHtml: data.proseHtml.trim(),
      tags: data.tags && data.tags.length > 0 ? data.tags : [data.category.trim()],
      status: data.status || 'published',
      authorId: data.authorId || null,
    },
    include: {
      author: true,
    },
  });

  return formatArticle(article);
}

export async function updateArticle(
  articleId: string,
  data: {
    title?: string;
    standfirst?: string;
    category?: string;
    heroImage?: string;
    caption?: string;
    proseHtml?: string;
    readMinutes?: number;
    tags?: string[];
    authorId?: string | null;
    status?: 'published' | 'draft';
  }
) {
  const existing = await prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!existing) return null;

  const updateData: any = {};

  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.standfirst !== undefined) updateData.standfirst = data.standfirst.trim();
  if (data.category !== undefined) updateData.category = data.category.trim().toUpperCase();
  if (data.heroImage !== undefined) updateData.heroImage = data.heroImage.trim();
  if (data.caption !== undefined) updateData.caption = data.caption.trim();
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.authorId !== undefined) updateData.authorId = data.authorId || null;

  if (data.proseHtml !== undefined) {
    updateData.proseHtml = data.proseHtml.trim();
    const toc: { id: string; label: string }[] = [];
    const h2Regex = /<h2[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/h2>|<h2[^>]*>(.*?)<\/h2>/gi;
    let match;
    let count = 1;
    while ((match = h2Regex.exec(data.proseHtml)) !== null) {
      const rawLabel = (match[2] || match[3] || '').replace(/<[^>]*>/g, '').trim();
      if (rawLabel) {
        const generatedId = match[1] || `section-${count}`;
        toc.push({
          id: generatedId,
          label: `${count}. ${rawLabel.replace(/^\d+\.\s*/, '')}`,
        });
        count++;
      }
    }
    if (toc.length > 0) {
      updateData.toc = toc;
    }
  }

  if (data.readMinutes !== undefined) {
    updateData.readMinutes = Number(data.readMinutes) || 5;
    updateData.readTime = `${updateData.readMinutes} min read`;
  } else if (data.proseHtml !== undefined) {
    const calculatedMinutes = Math.max(
      1,
      Math.ceil(data.proseHtml.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)
    );
    updateData.readMinutes = calculatedMinutes;
    updateData.readTime = `${calculatedMinutes} min read`;
  }

  const updated = await prisma.article.update({
    where: { id: articleId },
    data: updateData,
    include: { author: true },
  });

  return formatArticle(updated);
}

export async function toggleArticleStatus(articleId: string) {
  const existing = await prisma.article.findUnique({
    where: { id: articleId },
    select: { status: true },
  });
  if (!existing) return null;

  const newStatus = existing.status === 'draft' ? 'published' : 'draft';
  const updated = await prisma.article.update({
    where: { id: articleId },
    data: { status: newStatus },
    include: { author: true },
  });
  return formatArticle(updated);
}

export async function deleteArticle(articleId: string) {
  try {
    const deleted = await prisma.article.delete({
      where: { id: articleId },
    });
    return !!deleted;
  } catch (err) {
    return false;
  }
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
    status: (a.status as 'published' | 'draft') || 'published',
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

