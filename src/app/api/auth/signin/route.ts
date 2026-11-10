import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { errorResponse, serverErrorResponse } from '@/server/utils/response';

const SigninSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SigninSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Please enter both email and password.', 400);
    }

    const { email, password } = parsed.data;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Authenticate with Better Auth
    const authRes = await auth.api.signInEmail({
      body: {
        email: cleanEmail,
        password,
      },
      asResponse: true,
      headers: req.headers,
    });

    if (!authRes.ok) {
      return errorResponse('Invalid email or password.', 401);
    }

    // 2. Fetch fresh user & profile from PostgreSQL
    const dbUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        workerProfile: true,
      },
    });

    if (!dbUser) {
      return errorResponse('User account not found.', 404);
    }

    if (dbUser.banned) {
      return errorResponse('This account has been suspended. Please contact platform administrators.', 403);
    }

    // 3. Ensure freelancer has an associated worker profile
    let workerProfile = dbUser.workerProfile;
    let workerId = dbUser.workerProfileId;

    if (dbUser.role === 'freelancer' && (!workerProfile || !workerId)) {
      const newWorkerId = `worker-${Date.now()}`;
      workerProfile = await prisma.workerProfile.create({
        data: {
          id: newWorkerId,
          name: dbUser.name,
          email: cleanEmail,
          trade: 'Web Development',
          craftTitle: 'Independent Specialist',
          image: dbUser.image || '/assets/images/hero_craftsman.jpg',
          hourlyRate: 80,
          location: 'Remote Available',
          experienceYears: 5,
          bio: 'Independent digital specialist delivering high quality solutions.',
          about: 'Independent digital specialist delivering high quality solutions.',
          skills: ['Web Development', 'System Architecture'],
          status: 'published',
          rating: 5.0,
          reviewsCount: 0,
        },
      });

      await prisma.user.update({
        where: { id: dbUser.id },
        data: { workerProfileId: newWorkerId },
      });

      workerId = newWorkerId;
    }

    const userPayload = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      workerId: workerId || undefined,
      avatar: workerProfile?.image || dbUser.image || '/assets/images/hero_craftsman.jpg',
    };

    const nextResponse = NextResponse.json(
      {
        success: true,
        message: 'Signed in successfully!',
        user: userPayload,
        worker: workerProfile,
      },
      { status: 200 }
    );

    // Forward session cookie
    const setCookie = authRes.headers.get('set-cookie');
    if (setCookie) {
      nextResponse.headers.set('set-cookie', setCookie);
    }

    return nextResponse;
  } catch (err) {
    return serverErrorResponse(err, 'Internal error during authentication.');
  }
}

