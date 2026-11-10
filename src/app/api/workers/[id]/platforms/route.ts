import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, forbiddenResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';
import { requireFreelancerOrAdmin } from '@/server/utils/auth-check';
import { PlatformLinkSchema } from '@/schemas';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const links = await prisma.platformLink.findMany({
      where: { workerId: id },
      orderBy: { createdAt: 'asc' },
    });
    return successResponse(links);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch platform links.');
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authResult = await requireFreelancerOrAdmin(id);
    if (!authResult) {
      return forbiddenResponse('Not authorized to modify platform links for this profile.');
    }

    const body = await req.json();
    const parsed = PlatformLinkSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid platform link data.');
    }

    const data = parsed.data;
    if (data.id) {
      // Update existing
      const updated = await prisma.platformLink.update({
        where: { id: data.id, workerId: id },
        data: {
          name: data.name,
          url: data.url,
          icon: data.icon,
          badge: data.badge,
          actionText: data.actionText,
          active: data.active,
        },
      });
      return successResponse(updated, 'Platform link updated.');
    }

    // Create new
    const created = await prisma.platformLink.create({
      data: {
        workerId: id,
        name: data.name,
        url: data.url,
        icon: data.icon,
        badge: data.badge,
        actionText: data.actionText,
        active: data.active,
      },
    });
    return successResponse(created, 'Platform link added.', undefined, 201);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to save platform link.');
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authResult = await requireFreelancerOrAdmin(id);
    if (!authResult) {
      return forbiddenResponse('Not authorized to delete platform links for this profile.');
    }

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('linkId');
    if (!linkId) {
      return errorResponse('linkId query parameter is required.');
    }

    await prisma.platformLink.deleteMany({
      where: { id: linkId, workerId: id },
    });

    return successResponse({ id: linkId }, 'Platform link deleted.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to delete platform link.');
  }
}
