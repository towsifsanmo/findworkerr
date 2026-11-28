import { NextRequest } from 'next/server';
import { getVisitorStats, getVisitorsList } from '@/server/services/visitor.service';
import { successResponse, forbiddenResponse, serverErrorResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/utils/auth-check';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return forbiddenResponse('Administrator privileges required to view visitors.');
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const search = searchParams.get('search') || undefined;
    const deviceType = searchParams.get('device') || undefined;

    const [stats, listData] = await Promise.all([
      getVisitorStats(),
      getVisitorsList({ page, limit, search, deviceType }),
    ]);

    return successResponse({
      stats,
      visitors: listData.visitors,
      pagination: listData.pagination,
    });
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch visitor analytics.');
  }
}
