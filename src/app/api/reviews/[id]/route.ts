import { NextRequest } from 'next/server';
import { moderateReview } from '@/server/services/review.service';
import { successResponse, forbiddenResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/utils/auth-check';
import { ReviewModerateSchema } from '@/schemas';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to moderate reviews.');
    }

    const body = await req.json();
    const parsed = ReviewModerateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid moderation action.');
    }

    const ok = await moderateReview(id, parsed.data.action);
    if (!ok) {
      return errorResponse('Failed to execute moderation action.');
    }

    return successResponse({ id, action: parsed.data.action }, `Review ${parsed.data.action} action executed.`);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to moderate review.');
  }
}
