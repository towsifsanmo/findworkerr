import { NextRequest } from 'next/server';
import { getArticleById } from '@/server/services/article.service';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/server/utils/response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const article = await getArticleById(id);
    if (!article) {
      return notFoundResponse(`Article '${id}' not found.`);
    }
    return successResponse(article);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch article.');
  }
}

