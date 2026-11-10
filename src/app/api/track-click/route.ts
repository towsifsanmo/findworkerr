import { NextRequest } from 'next/server';
import { trackPlatformClick, getPlatformClicks } from '@/server/services/stats.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workerId, platformName, deviceId } = body;
    if (!workerId || !platformName) {
      return errorResponse('workerId and platformName are required.');
    }

    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || undefined;

    const count = await trackPlatformClick(workerId, platformName, ip, deviceId);
    return successResponse({ workerId, platformName, clicks: count }, 'Click tracked.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to track platform click.');
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get('workerId') || undefined;
    const clicks = await getPlatformClicks(workerId);
    return successResponse({ workerId, clicks });
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch platform clicks.');
  }
}

