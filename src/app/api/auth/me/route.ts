import { getServerSession } from '@/server/utils/auth-check';
import prisma from '@/lib/prisma';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/server/utils/response';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return unauthorizedResponse();
    }

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        workerProfile: {
          select: {
            id: true,
            name: true,
            trade: true,
            craftTitle: true,
            image: true,
            status: true,
            email: true,
            rating: true,
          },
        },
      },
    });

    if (!user) {
      return unauthorizedResponse('User not found.');
    }

    // Ensure freelancer has an associated worker profile
    if (user.role === 'freelancer' && (!user.workerProfileId || !user.workerProfile)) {
      const newWorkerId = `worker-${Date.now()}`;
      const newProfile = await prisma.workerProfile.create({
        data: {
          id: newWorkerId,
          name: user.name,
          email: user.email,
          trade: 'Web Development',
          craftTitle: 'Independent Specialist',
          image: user.image || '/assets/images/hero_craftsman.jpg',
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

      user = await prisma.user.update({
        where: { id: user.id },
        data: { workerProfileId: newWorkerId },
        include: {
          workerProfile: {
            select: {
              id: true,
              name: true,
              trade: true,
              craftTitle: true,
              image: true,
              status: true,
              email: true,
              rating: true,
            },
          },
        },
      });
    }

    return successResponse({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      workerId: user.workerProfileId || user.workerProfile?.id || undefined,
      avatar: user.workerProfile?.image || user.image || '/assets/images/hero_craftsman.jpg',
      createdAt: user.createdAt.toISOString(),
      workerProfile: user.workerProfile,
    });
  } catch (err) {
    return serverErrorResponse(err, 'Failed to fetch current user session.');
  }
}
