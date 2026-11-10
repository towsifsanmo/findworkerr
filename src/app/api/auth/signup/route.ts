import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { errorResponse, serverErrorResponse } from '@/server/utils/response';

const SignupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  trade: z.string().optional(),
  craftTitle: z.string().optional(),
  hourlyRate: z.union([z.number(), z.string()]).optional(),
  location: z.string().optional(),
  experienceYears: z.union([z.number(), z.string()]).optional(),
  bio: z.string().optional(),
  about: z.string().optional(),
  skills: z.union([z.array(z.string()), z.string()]).optional(),
  image: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid registration data.', 400);
    }

    const { name, email, password } = parsed.data;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return errorResponse('An account with this email address already exists. Please sign in.', 400);
    }

    // 2. Register user through Better Auth (hashes password securely, creates Account & Session)
    const authRes = await auth.api.signUpEmail({
      body: {
        name: name.trim(),
        email: cleanEmail,
        password,
      },
      asResponse: true,
      headers: req.headers,
    });

    if (!authRes.ok) {
      let errorMsg = 'Failed to create user account.';
      try {
        const errorData = await authRes.json();
        errorMsg = errorData.message || errorData.error || errorMsg;
      } catch (e) {
        // ignore parse error
      }
      return errorResponse(errorMsg, 400);
    }

    // 3. Format profile details
    const trade = parsed.data.trade?.trim() || 'Web Development';
    const craftTitle = parsed.data.craftTitle?.trim() || `Senior ${trade} Specialist`;
    const exp = Number(parsed.data.experienceYears) || 5;
    const rate = Number(parsed.data.hourlyRate) || 85;
    const loc = parsed.data.location?.trim() || 'Remote Available';
    const bioText = parsed.data.bio?.trim() || `Independent ${trade.toLowerCase()} specialist focused on high-quality delivery.`;
    const aboutText = parsed.data.about?.trim() || bioText;
    const avatar = parsed.data.image?.trim() || '/assets/images/hero_craftsman.jpg';

    let skillsArr: string[] = [];
    if (Array.isArray(parsed.data.skills)) {
      skillsArr = parsed.data.skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof parsed.data.skills === 'string') {
      skillsArr = parsed.data.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (skillsArr.length === 0) {
      skillsArr = [trade, 'Creative Direction', 'System Architecture'];
    }

    const workerId = `worker-${Date.now()}`;

    // 4. Create the worker profile in PostgreSQL
    const createdWorker = await prisma.workerProfile.create({
      data: {
        id: workerId,
        name: name.trim(),
        trade,
        craftTitle,
        image: avatar,
        badge: 'PRO',
        badgeLabel: 'Independent Professional',
        rating: 5.0,
        reviewsCount: 0,
        hourlyRate: rate,
        location: loc,
        experienceYears: exp,
        availability: 'Available Today',
        instantBooking: true,
        workPreference: 'Remote First',
        responseTime: 'Within 24 hours',
        language: 'English',
        email: cleanEmail,
        bio: bioText,
        about: aboutText,
        skills: skillsArr,
        certifications: ['Verified Independent Specialist'],
        guarantee: 'Direct contact, 0% platform intermediary commission.',
        status: 'published',
        featured: false,
      },
    });

    // 5. Link user to the newly created worker profile
    const updatedUser = await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        role: 'freelancer',
        workerProfileId: workerId,
      },
    });

    // 6. Build response with user session and forward session cookie
    const responsePayload = {
      success: true,
      message: 'Account created successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        workerId: updatedUser.workerProfileId,
        avatar: createdWorker.image,
      },
      worker: createdWorker,
    };

    const nextResponse = NextResponse.json(responsePayload, { status: 201 });

    // Forward Set-Cookie header so client gets logged in immediately
    const setCookie = authRes.headers.get('set-cookie');
    if (setCookie) {
      nextResponse.headers.set('set-cookie', setCookie);
    }

    return nextResponse;
  } catch (err) {
    return serverErrorResponse(err, 'Internal error during freelancer registration.');
  }
}

