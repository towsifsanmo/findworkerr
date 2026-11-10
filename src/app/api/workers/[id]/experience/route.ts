import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, forbiddenResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';
import { requireFreelancerOrAdmin } from '@/server/utils/auth-check';
import { ExperienceItemSchema } from '@/schemas';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const items = await prisma.experienceItem.findMany({
      where: { workerId: id },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(items);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch experience items.');
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authResult = await requireFreelancerOrAdmin(id);
    if (!authResult) {
      return forbiddenResponse('Not authorized to modify experience items for this profile.');
    }

    const body = await req.json();
    const parsed = ExperienceItemSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid experience data.');
    }

    const data = parsed.data;
    if (data.id) {
      const updated = await prisma.experienceItem.update({
        where: { id: data.id, workerId: id },
        data: {
          role: data.role,
          company: data.company,
          period: data.period,
          description: data.description,
        },
      });
      return successResponse(updated, 'Experience milestone updated.');
    }

    const created = await prisma.experienceItem.create({
      data: {
        workerId: id,
        role: data.role,
        company: data.company,
        period: data.period,
        description: data.description,
      },
    });
    return successResponse(created, 'Experience milestone added.', undefined, 201);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to save experience item.');
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authResult = await requireFreelancerOrAdmin(id);
    if (!authResult) {
      return forbiddenResponse('Not authorized to delete experience items for this profile.');
    }

    const { searchParams } = new URL(req.url);
    const expId = searchParams.get('expId');
    if (!expId) {
      return errorResponse('expId query parameter is required.');
    }

    await prisma.experienceItem.deleteMany({
      where: { id: expId, workerId: id },
    });

    return successResponse({ id: expId }, 'Experience milestone deleted.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to delete experience item.');
  }
}
