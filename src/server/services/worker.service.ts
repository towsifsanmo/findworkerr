import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { Prisma } from '@/generated/prisma/client';

export interface GetWorkersParams {
  search?: string;
  categories?: string[];
  badges?: string[];
  skills?: string[];
  languages?: string[];
  sortBy?: 'rating-desc' | 'experience-desc' | 'name-asc';
  page?: number;
  pageSize?: number;
  includeDrafts?: boolean;
}

export async function getWorkers(params: GetWorkersParams = {}) {
  const {
    search,
    categories,
    badges,
    skills,
    languages,
    sortBy = 'rating-desc',
    page = 1,
    pageSize = 50,
    includeDrafts = false,
  } = params;

  const where: Prisma.WorkerProfileWhereInput = {};

  if (!includeDrafts) {
    where.status = 'published';
  }

  if (categories && categories.length > 0) {
    where.trade = { in: categories, mode: 'insensitive' };
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { trade: { contains: q, mode: 'insensitive' } },
      { craftTitle: { contains: q, mode: 'insensitive' } },
      { location: { contains: q, mode: 'insensitive' } },
      { skills: { hasSome: [q] } },
    ];
  }

  if (languages && languages.length > 0) {
    where.language = { in: languages, mode: 'insensitive' };
  }

  let orderBy: Prisma.WorkerProfileOrderByWithRelationInput = { rating: 'desc' };
  if (sortBy === 'experience-desc') {
    orderBy = { experienceYears: 'desc' };
  } else if (sortBy === 'name-asc') {
    orderBy = { name: 'asc' };
  }

  const [total, workers] = await prisma.$transaction([
    prisma.workerProfile.count({ where }),
    prisma.workerProfile.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        platforms: { where: { active: true } },
        portfolio: true,
        experience: true,
        reviews: { where: { approved: true }, orderBy: { createdAt: 'desc' } },
      },
    }),
  ]);

  // If badges filter requested (e.g. "Top Rated" is computed by rating >= 4.95)
  let filtered = workers;
  if (badges && badges.length > 0) {
    filtered = workers.filter((w) => {
      if (badges.includes('Top Rated') && w.rating >= 4.95) return true;
      if (w.badge && badges.includes(w.badge)) return true;
      return false;
    });
  }

  // If skills array filter is given
  if (skills && skills.length > 0) {
    filtered = filtered.filter((w) =>
      skills.some((sk) => w.skills.some((s) => s.toLowerCase() === sk.toLowerCase()))
    );
  }

  return {
    workers: filtered,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
}

export async function getWorkerById(id: string) {
  if (!id) return null;
  const worker = await prisma.workerProfile.findUnique({
    where: { id },
    include: {
      platforms: { orderBy: { createdAt: 'asc' } },
      portfolio: { orderBy: { createdAt: 'desc' } },
      experience: { orderBy: { createdAt: 'desc' } },
      reviews: { orderBy: { createdAt: 'desc' } },
    },
  });
  return worker;
}

export async function createWorkerProfile(data: {
  id?: string;
  name: string;
  trade?: string;
  craftTitle?: string;
  image?: string;
  hourlyRate?: number;
  location?: string;
  experienceYears?: number;
  bio?: string;
  about?: string;
  skills?: string[];
  certifications?: string[];
  email?: string;
  phone?: string;
  website?: string;
}) {
  const id = data.id || `worker-${Date.now()}`;
  const trade = data.trade || 'Web Development';
  const craftTitle = data.craftTitle || `Independent ${trade} Specialist`;

  const worker = await prisma.workerProfile.create({
    data: {
      id,
      name: data.name,
      trade,
      craftTitle,
      image: data.image || '/assets/images/hero_craftsman.jpg',
      hourlyRate: data.hourlyRate || 80,
      location: data.location || 'Remote Available',
      experienceYears: data.experienceYears || 5,
      bio: data.bio || `Independent ${trade} specialist focused on high-quality delivery.`,
      about: data.about || data.bio || '',
      skills: data.skills && data.skills.length > 0 ? data.skills : [trade, 'Creative Direction', 'System Architecture'],
      certifications: data.certifications || ['Verified Independent Specialist'],
      email: data.email,
      phone: data.phone,
      website: data.website,
      status: 'published',
      platforms: {
        create: [
          { name: 'Upwork', url: 'https://upwork.com', icon: 'upwork', badge: 'Top Rated Plus', actionText: 'Hire on Upwork' },
          { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin', badge: 'Verified Pro', actionText: 'Connect on LinkedIn' },
          { name: 'GitHub', url: 'https://github.com', icon: 'github', badge: 'Active Repositories', actionText: 'Inspect Code' },
        ],
      },
      experience: {
        create: [
          {
            role: craftTitle,
            company: 'Independent Practice',
            period: `${new Date().getFullYear() - 2} — Present`,
            description: `Delivering bespoke ${trade.toLowerCase()} solutions, creative architecture, and direct client collaborations.`,
          },
        ],
      },
      portfolio: {
        create: [
          {
            title: `${craftTitle} Signature Project`,
            category: trade,
            year: new Date().getFullYear().toString(),
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85',
            description: `A selected engagement showcasing independent creative rigor, production-grade output, and client impact.`,
            tags: [trade, 'Architecture', 'Delivery'],
          },
        ],
      },
    },
    include: {
      platforms: true,
      portfolio: true,
      experience: true,
      reviews: true,
    },
  });

  logger.info({ workerId: worker.id }, 'Worker profile created successfully');
  return worker;
}

export async function updateWorkerProfile(id: string, updates: Prisma.WorkerProfileUpdateInput) {
  const worker = await prisma.workerProfile.update({
    where: { id },
    data: updates,
    include: {
      platforms: true,
      portfolio: true,
      experience: true,
      reviews: true,
    },
  });
  logger.info({ workerId: id }, 'Worker profile updated successfully');
  return worker;
}

export async function toggleWorkerStatus(id: string) {
  const current = await prisma.workerProfile.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!current) return null;

  const newStatus = current.status === 'draft' ? 'published' : 'draft';
  return prisma.workerProfile.update({
    where: { id },
    data: { status: newStatus },
  });
}

export async function toggleWorkerFeatured(id: string) {
  const current = await prisma.workerProfile.findUnique({
    where: { id },
    select: { featured: true },
  });
  if (!current) return null;

  return prisma.workerProfile.update({
    where: { id },
    data: { featured: !current.featured },
  });
}

export async function deleteWorkerProfile(id: string) {
  const deleted = await prisma.workerProfile.delete({
    where: { id },
  });
  logger.info({ workerId: id }, 'Worker profile deleted');
  return deleted;
}

