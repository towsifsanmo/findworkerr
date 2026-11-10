import { NextRequest } from 'next/server';
import { incrementClap } from '@/server/services/article.service';
import { successResponse, serverErrorResponse } from '@/server/utils/response';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const claps = await incrementClap(id);
    return successResponse({ id, claps }, 'Clap recorded.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to record clap.');
  }
}

