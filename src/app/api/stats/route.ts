import { getPlatformStats } from '@/server/services/stats.service';
import { successResponse, serverErrorResponse } from '@/server/utils/response';

export async function GET() {
  try {
    const stats = await getPlatformStats();
    return successResponse(stats);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch platform statistics.');
  }
}

