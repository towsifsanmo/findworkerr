import { headers } from 'next/headers';
import { auth } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export async function getServerSession() {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });
    return session;
  } catch (error) {
    return null;
  }
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session || !session.user) {
    return null;
  }
  return session;
}

export async function requireAdmin() {
  const session = await getServerSession();
  if (!session || !session.user) {
    return null;
  }
  
  // Verify role from database to never trust client claim
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true, name: true, workerProfileId: true },
  });

  if (!dbUser || dbUser.role !== 'admin') {
    return null;
  }

  return { session, user: dbUser };
}

export async function requireFreelancerOrAdmin(allowedWorkerId?: string) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true, name: true, workerProfileId: true },
  });

  if (!dbUser) return null;

  if (dbUser.role === 'admin') {
    return { session, user: dbUser, isAdmin: true };
  }

  if (allowedWorkerId && dbUser.workerProfileId && dbUser.workerProfileId !== allowedWorkerId) {
    return null;
  }

  return { session, user: dbUser, isAdmin: false };
}

