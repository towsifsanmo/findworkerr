import { NextRequest } from 'next/server';
import { updateCategory, deleteCategory } from '@/server/services/category.service';
import { successResponse, forbiddenResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/utils/auth-check';
import { CategoryUpdateSchema } from '@/schemas';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to update categories.');
    }

    const body = await req.json();
    const parsed = CategoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid category data.');
    }

    const updated = await updateCategory(id, parsed.data);
    if (!updated) {
      return notFoundResponse('Category not found or could not be updated.');
    }

    return successResponse(updated, 'Category updated.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to update category.');
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to delete categories.');
    }

    const deleted = await deleteCategory(id);
    if (!deleted) {
      return errorResponse('Category not found or could not be removed.');
    }

    return successResponse({ id }, 'Category removed.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to delete category.');
  }
}
