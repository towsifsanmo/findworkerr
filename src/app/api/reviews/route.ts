import { NextRequest } from 'next/server';
import {
  getWorkerReviews,
  getAllPlatformReviews,
  addWorkerReview,
  getDeviceReviewForWorker,
} from '@/server/services/review.service';
import { successResponse, forbiddenResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/utils/auth-check';
import { ReviewCreateSchema } from '@/schemas';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get('workerId');
    const deviceId = searchParams.get('deviceId');

    // 1. Device check
    if (workerId && deviceId) {
      const devReview = await getDeviceReviewForWorker(workerId, deviceId);
      return successResponse({ hasReviewed: !!devReview, review: devReview });
    }

    // 2. Worker reviews lookup
    if (workerId) {
      const reviews = await getWorkerReviews(workerId, true);
      return successResponse(reviews);
    }

    // 3. Admin moderation queue
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Admin privileges required to view all platform reviews.');
    }

    const allReviews = await getAllPlatformReviews();
    return successResponse(allReviews);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch reviews.');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReviewCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid review data.');
    }

    const { workerId, author, rating, title, comment, deviceId } = parsed.data;
    const res = await addWorkerReview(workerId, { author, rating, title, comment }, deviceId);

    if (!res.success) {
      return errorResponse(res.message || 'Failed to submit review.', 409, 'ALREADY_REVIEWED');
    }

    return successResponse(res.review, 'Review submitted successfully.', undefined, 201);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to submit review.');
  }
}
