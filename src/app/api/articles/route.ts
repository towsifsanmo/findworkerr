import { NextRequest } from 'next/server';
import { getAllArticles, createArticle } from '@/server/services/article.service';
import { successResponse, errorResponse, forbiddenResponse, serverErrorResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/utils/auth-check';
import { ArticleCreateSchema } from '@/schemas';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const includeDraftsParam = url.searchParams.get('includeDrafts') === 'true';
    let includeDrafts = false;
    if (includeDraftsParam) {
      const admin = await requireAdmin();
      if (admin) includeDrafts = true;
    }
    const articles = await getAllArticles({ includeDrafts });
    return successResponse(articles);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch field notes articles.');
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to create blog posts.');
    }

    const body = await req.json();
    const parsed = ArticleCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid article data.');
    }

    const article = await createArticle(parsed.data);
    return successResponse(article, 'Blog article created successfully.', undefined, 201);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to create blog article.');
  }
}

