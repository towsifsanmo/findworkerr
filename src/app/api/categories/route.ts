import { NextRequest } from 'next/server';
import { getAllCategories, createCategory, deleteCategory } from '@/server/services/category.service';
import { successResponse, forbiddenResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/utils/auth-check';
import { CategoryCreateSchema } from '@/schemas';

export async function GET() {
  try {
    const categories = await getAllCategories();
    return successResponse(categories);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch categories.');
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to create categories.');
    }

    const body = await req.json();
    const parsed = CategoryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid category data.');
    }

    const created = await createCategory(parsed.data.name, parsed.data.description, parsed.data.icon);
    return successResponse(created, 'Category created.', undefined, 201);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to create category.');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to delete categories.');
    }

    const { searchParams } = new URL(req.url);
    const target = searchParams.get('name') || searchParams.get('id');
    if (!target) {
      return errorResponse('Category name or ID parameter required.');
    }

    const deleted = await deleteCategory(target);
    if (!deleted) {
      return errorResponse('Category not found or could not be removed.');
    }

    return successResponse({ target }, 'Category removed.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to delete category.');
  }
}
