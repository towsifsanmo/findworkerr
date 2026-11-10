import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, forbiddenResponse, errorResponse, serverErrorResponse } from '@/server/utils/response';
import { requireFreelancerOrAdmin } from '@/server/utils/auth-check';
import { PortfolioItemSchema } from '@/schemas';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const items = await prisma.portfolioItem.findMany({
      where: { workerId: id },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(items);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch portfolio items.');
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authResult = await requireFreelancerOrAdmin(id);
    if (!authResult) {
      return forbiddenResponse('Not authorized to modify portfolio projects for this profile.');
    }

    const body = await req.json();
    const parsed = PortfolioItemSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid portfolio data.');
    }

    const data = parsed.data;
    if (data.id) {
      const updated = await prisma.portfolioItem.update({
        where: { id: data.id, workerId: id },
        data: {
          title: data.title,
          category: data.category,
          year: data.year,
          image: data.image,
          description: data.description,
          tags: data.tags,
        },
      });
      return successResponse(updated, 'Project updated.');
    }

    const created = await prisma.portfolioItem.create({
      data: {
        workerId: id,
        title: data.title,
        category: data.category,
        year: data.year,
        image: data.image,
        description: data.description,
        tags: data.tags,
      },
    });
    return successResponse(created, 'Project added to portfolio.', undefined, 201);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to save portfolio project.');
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authResult = await requireFreelancerOrAdmin(id);
    if (!authResult) {
      return forbiddenResponse('Not authorized to delete portfolio projects for this profile.');
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) {
      return errorResponse('projectId query parameter is required.');
    }

    await prisma.portfolioItem.deleteMany({
      where: { id: projectId, workerId: id },
    });

    return successResponse({ id: projectId }, 'Project deleted.');
  } catch (err) {
    return serverErrorResponse(err, 'Failed to delete portfolio project.');
  }
}
