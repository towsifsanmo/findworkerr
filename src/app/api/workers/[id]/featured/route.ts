import { NextRequest } from 'next/server';
import { toggleWorkerFeatured } from '@/server/services/worker.service';
import { successResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/utils/auth-check';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to toggle featured talent.');
    }

    const updated = await toggleWorkerFeatured(id);
    if (!updated) {
      return notFoundResponse(`Worker profile ${id} not found.`);
    }

    return successResponse(updated, `Featured status updated.`);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to toggle featured status.');
  }
}

