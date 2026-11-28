import { NextRequest } from 'next/server';
import { recordPageView } from '@/server/services/visitor.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, path } = body;

    if (!visitorId || !path) {
      return errorResponse('visitorId and path are required.');
    }

    // Extract IP address from request headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');

    const result = await recordPageView({
      ...body,
      ipAddress,
    });

    return successResponse({
      pageViewId: result.pageViewId,
      visitorId: result.visitor.visitorId,
    });
  } catch (err) {
    return serverErrorResponse(err, 'Failed to record visitor page view.');
  }
}
