import { NextRequest } from 'next/server';
import { toggleWorkerStatus } from '@/server/services/worker.service';
import { successResponse, forbiddenResponse, notFoundResponse, serverErrorResponse } from '@/server/utils/response';
import { requireFreelancerOrAdmin } from '@/server/utils/auth-check';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authResult = await requireFreelancerOrAdmin(id);
    if (!authResult) {
      return forbiddenResponse('Not authorized to change status of this profile.');
    }

    const updated = await toggleWorkerStatus(id);
    if (!updated) {
      return notFoundResponse(`Worker profile ${id} not found.`);
    }

    return successResponse(updated, `Status switched to ${updated.status}.`);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to toggle worker status.');
  }
}

