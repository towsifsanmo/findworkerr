import { NextRequest } from 'next/server';
import { getWorkerById, updateWorkerProfile, deleteWorkerProfile } from '@/server/services/worker.service';
import { successResponse, notFoundResponse, serverErrorResponse, forbiddenResponse, errorResponse } from '@/server/utils/response';
import { requireFreelancerOrAdmin, requireAdmin } from '@/server/utils/auth-check';
import { WorkerProfileUpdateSchema } from '@/schemas';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const worker = await getWorkerById(id);
    if (!worker) {
      return notFoundResponse(`Freelancer profile with ID '${id}' not found.`);
    }
    return successResponse(worker);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch worker profile.');
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authResult = await requireFreelancerOrAdmin(id);
    if (!authResult) {
      return forbiddenResponse('You are not authorized to edit this freelancer profile.');
    }

    const body = await req.json();
    const parsed = WorkerProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid worker update data.');
    }

    const updated = await updateWorkerProfile(id, parsed.data);
    return successResponse(updated, 'Profile updated successfully.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to update worker profile.');
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to delete profiles.');
    }

    await deleteWorkerProfile(id);
    return successResponse({ id }, 'Profile deleted successfully.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to delete worker profile.');
  }
}
