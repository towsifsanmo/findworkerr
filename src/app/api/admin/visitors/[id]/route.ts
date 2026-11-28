import { NextRequest } from 'next/server';
import { getVisitorDetails, deleteVisitor } from '@/server/services/visitor.service';
import { successResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/utils/auth-check';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to view visitor details.');
    }

    const { id } = await context.params;
    const visitor = await getVisitorDetails(id);

    if (!visitor) {
      return notFoundResponse('Visitor record not found.');
    }

    return successResponse(visitor);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch visitor details.');
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to delete visitor records.');
    }

    const { id } = await context.params;
    const deleted = await deleteVisitor(id);

    if (!deleted) {
      return notFoundResponse('Visitor record not found or already removed.');
    }

    return successResponse({ deleted: true }, 'Visitor record deleted successfully.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to delete visitor record.');
  }
}
