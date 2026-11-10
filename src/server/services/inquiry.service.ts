import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

export async function createInquiry(data: {
  workerId: string;
  clientName: string;
  clientContact: string;
  targetDate?: string;
  hours?: string;
  description: string;
}) {
  const inquiry = await prisma.inquiry.create({
    data: {
      workerId: data.workerId,
      clientName: data.clientName.trim(),
      clientContact: data.clientContact.trim(),
      targetDate: data.targetDate || null,
      hours: data.hours || '4',
      description: data.description.trim(),
      status: 'pending',
    },
  });

  logger.info({ inquiryId: inquiry.id, workerId: data.workerId }, 'New project inquiry logged');
  return inquiry;
}

export async function getWorkerInquiries(workerId: string) {
  return prisma.inquiry.findMany({
    where: { workerId },
    orderBy: { createdAt: 'desc' },
  });
}

