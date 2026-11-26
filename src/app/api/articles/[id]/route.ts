import { NextRequest } from 'next/server';
import { getArticleById, deleteArticle, updateArticle, toggleArticleStatus } from '@/server/services/article.service';
import { successResponse, notFoundResponse, forbiddenResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/utils/auth-check';
import { ArticleUpdateSchema } from '@/schemas';

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

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to update blog posts.');
    }

    const body = await req.json();
    const parsed = ArticleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid article data.');
    }

    const updated = await updateArticle(id, parsed.data);
    if (!updated) {
      return notFoundResponse(`Article '${id}' not found.`);
    }

    return successResponse(updated, 'Blog article updated successfully.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to update blog article.');
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to toggle blog status.');
    }

    const updated = await toggleArticleStatus(id);
    if (!updated) {
      return notFoundResponse(`Article '${id}' not found.`);
    }

    return successResponse(updated, 'Blog status toggled successfully.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to toggle blog status.');
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to delete blog posts.');
    }

    const ok = await deleteArticle(id);
    if (!ok) {
      return errorResponse('Failed to delete blog article.');
    }
    return successResponse({ id }, 'Blog article deleted successfully.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to delete blog article.');
  }
}

