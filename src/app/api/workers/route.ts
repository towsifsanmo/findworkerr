import { NextRequest } from 'next/server';
import { getWorkers, createWorkerProfile } from '@/server/services/worker.service';
import { successResponse, serverErrorResponse, unauthorizedResponse, errorResponse } from '@/server/utils/response';
import { requireAdmin, getServerSession } from '@/server/utils/auth-check';
import { WorkerProfileUpdateSchema } from '@/schemas';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const categories = searchParams.getAll('categories');
    const badges = searchParams.getAll('badges');
    const skills = searchParams.getAll('skills');
    const languages = searchParams.getAll('languages');
    const sortBy = (searchParams.get('sortBy') as any) || 'rating-desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const wantDrafts = searchParams.get('includeDrafts') === 'true';

    let includeDrafts = false;
    if (wantDrafts) {
      const admin = await requireAdmin();
      includeDrafts = !!admin;
    }

    const result = await getWorkers({
      search,
      categories: categories.length > 0 ? categories : undefined,
      badges: badges.length > 0 ? badges : undefined,
      skills: skills.length > 0 ? skills : undefined,
      languages: languages.length > 0 ? languages : undefined,
      sortBy,
      page,
      pageSize,
      includeDrafts,
    });

    return successResponse(result.workers, undefined, { pagination: result.pagination });
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch workers list.');
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return unauthorizedResponse('You must be signed in to create a worker profile.');
    }

    const body = await req.json();
    const parsed = WorkerProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid worker payload.');
    }

    const worker = await createWorkerProfile({
      name: parsed.data.name || session.user.name,
      trade: parsed.data.trade,
      craftTitle: parsed.data.craftTitle,
      image: parsed.data.image,
      hourlyRate: parsed.data.hourlyRate,
      location: parsed.data.location,
      experienceYears: parsed.data.experienceYears,
      bio: parsed.data.bio,
      about: parsed.data.about,
      skills: parsed.data.skills,
      certifications: parsed.data.certifications,
      email: parsed.data.email || session.user.email,
      phone: parsed.data.phone,
      website: parsed.data.website,
    });

    return successResponse(worker, 'Profile created successfully.', undefined, 201);
  } catch (err) {
    return serverErrorResponse(err, 'Failed to create worker profile.');
  }
}
