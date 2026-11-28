import { NextRequest } from 'next/server';
import { updatePageViewDuration } from '@/server/services/visitor.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch (e) {
        return errorResponse('Invalid payload format.');
      }
    }

    const { pageViewId, visitorId, duration } = body || {};

    if (!pageViewId) {
      return errorResponse('pageViewId is required.');
    }

    await updatePageViewDuration(pageViewId, visitorId, Number(duration || 0));

    return successResponse({ updated: true });
  } catch (err) {
    return serverErrorResponse(err, 'Failed to update page view duration.');
  }
}
