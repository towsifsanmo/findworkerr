import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function getWorkerReviews(workerId: string, approvedOnly = false) {
  const where: any = { workerId };
  if (approvedOnly) {
    where.approved = true;
  }
  return prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllPlatformReviews() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      worker: {
        select: { id: true, name: true, trade: true, image: true },
      },
    },
  });

  return reviews.map((r) => ({
    id: r.id,
    author: r.author,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    date: r.createdAt.toISOString().split('T')[0],
    flagged: r.flagged,
    approved: r.approved,
    workerId: r.workerId,
    workerName: r.worker?.name || 'Specialist',
    workerTrade: r.worker?.trade || 'Freelancer',
    workerImage: r.worker?.image || '/assets/images/hero_craftsman.jpg',
    deviceId: r.deviceId,
  }));
}

export async function getDeviceReviewForWorker(workerId: string, deviceId: string) {
  if (!workerId || !deviceId) return null;
  return prisma.review.findFirst({
    where: { workerId, deviceId },
  });
}

export async function addWorkerReview(
  workerId: string,
  data: { author: string; rating: number; title?: string; comment: string },
  deviceId: string
) {
  // Check if this device already reviewed this worker
  const existing = await getDeviceReviewForWorker(workerId, deviceId);
  if (existing) {
    return {
      success: false,
      alreadyReviewed: true,
      message: 'This device has already submitted a review for this freelancer.',
      review: existing,
    };
  }

  // Create review and atomically update worker's average rating
  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        workerId,
        author: data.author.trim(),
        rating: Math.max(1, Math.min(5, data.rating)),
        title: data.title?.trim() || `${data.rating}★ Verified Client Review`,
        comment: data.comment.trim(),
        deviceId,
        approved: true,
        flagged: false,
      },
    });

    // Recompute worker score
    const aggregates = await tx.review.aggregate({
      where: { workerId, approved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.workerProfile.update({
      where: { id: workerId },
      data: {
        rating: aggregates._avg.rating || 5.0,
        reviewsCount: aggregates._count.rating || 0,
      },
    });

    return review;
  });

  logger.info({ workerId, reviewId: result.id }, 'New client review registered');
  return { success: true, review: result };
}

export async function moderateReview(reviewId: string, action: 'approve' | 'flag' | 'unflag' | 'delete') {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return false;

  if (action === 'delete') {
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      const aggregates = await tx.review.aggregate({
        where: { workerId: review.workerId, approved: true },
        _avg: { rating: true },
        _count: { rating: true },
      });
      await tx.workerProfile.update({
        where: { id: review.workerId },
        data: {
          rating: aggregates._avg.rating ? Number(aggregates._avg.rating.toFixed(1)) : 5.0,
          reviewsCount: aggregates._count.rating || 0,
        },
      });
    });
    return true;
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.update({
      where: { id: reviewId },
      data: {
        flagged: action === 'flag',
        approved: action === 'approve' || action === 'unflag',
      },
    });

    const aggregates = await tx.review.aggregate({
      where: { workerId: review.workerId, approved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.workerProfile.update({
      where: { id: review.workerId },
      data: {
        rating: aggregates._avg.rating ? Number(aggregates._avg.rating.toFixed(1)) : 5.0,
        reviewsCount: aggregates._count.rating || 0,
      },
    });
  });

  return true;
}

