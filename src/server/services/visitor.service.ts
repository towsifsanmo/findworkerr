import prisma from '@/lib/prisma';

export interface RecordPageViewInput {
  visitorId: string;
  path: string;
  title?: string;
  referrer?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  deviceType?: string;
  deviceModel?: string;
  screenResolution?: string;
  viewport?: string;
  language?: string;
  timezone?: string;
  platform?: string;
}

/**
 * Normalize IP addresses (strip IPv6 mapping prefixes e.g. ::ffff:)
 */
export function normalizeIp(ip?: string | null): string {
  if (!ip) return '127.0.0.1';
  let cleaned = ip.trim();
  if (cleaned.startsWith('::ffff:')) {
    cleaned = cleaned.substring(7);
  }
  if (cleaned === '::1') {
    cleaned = '127.0.0.1';
  }
  return cleaned;
}

/**
 * Record a new page view and update or create the authentic visitor record.
 * Unifies visitors by IP so repeat visits on different dates remain under the same visitor entry.
 */
export async function recordPageView(input: RecordPageViewInput) {
  const {
    visitorId,
    path,
    title,
    referrer,
    userId,
    userName,
    userEmail,
    userRole,
    ipAddress,
    userAgent,
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType = 'Desktop',
    deviceModel,
    screenResolution,
    viewport,
    language,
    timezone,
    platform,
  } = input;

  if (!visitorId || !path) {
    throw new Error('visitorId and path are required');
  }

  const normalizedIp = normalizeIp(ipAddress);

  // 1. Check if a visitor with this IP (or visitorId) already exists
  let visitor = await prisma.visitor.findFirst({
    where: {
      OR: [
        { ipAddress: normalizedIp },
        { visitorId },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  if (visitor) {
    // Re-use this existing IP visitor record — do NOT create a new entry!
    visitor = await prisma.visitor.update({
      where: { id: visitor.id },
      data: {
        lastActiveAt: new Date(),
        totalVisits: { increment: 1 },
        // Update authentic user credentials if authenticated
        userId: userId || visitor.userId || undefined,
        userName: userName || visitor.userName || undefined,
        userEmail: userEmail || visitor.userEmail || undefined,
        userRole: userRole || visitor.userRole || undefined,
        // Update device/environment if present
        userAgent: userAgent || visitor.userAgent || undefined,
        browser: browser || visitor.browser || undefined,
        browserVersion: browserVersion || visitor.browserVersion || undefined,
        os: os || visitor.os || undefined,
        osVersion: osVersion || visitor.osVersion || undefined,
        deviceType: deviceType || visitor.deviceType || undefined,
        deviceModel: deviceModel || visitor.deviceModel || undefined,
        screenResolution: screenResolution || visitor.screenResolution || undefined,
        viewport: viewport || visitor.viewport || undefined,
        language: language || visitor.language || undefined,
        timezone: timezone || visitor.timezone || undefined,
        platform: platform || visitor.platform || undefined,
      },
    });
  } else {
    // First time this IP is visiting the website
    visitor = await prisma.visitor.create({
      data: {
        visitorId,
        userId: userId || undefined,
        userName: userName || undefined,
        userEmail: userEmail || undefined,
        userRole: userRole || undefined,
        ipAddress: normalizedIp,
        userAgent,
        browser,
        browserVersion,
        os,
        osVersion,
        deviceType,
        deviceModel,
        screenResolution,
        viewport,
        language,
        timezone,
        platform,
        referrer: referrer || 'Direct / Bookmark',
        initialLanding: path,
        totalVisits: 1,
        totalDuration: 0,
        firstSeenAt: new Date(),
        lastActiveAt: new Date(),
      },
    });
  }

  // Create the authentic page view entry under this visitor's visitorId
  const pageView = await prisma.pageView.create({
    data: {
      visitorId: visitor.visitorId,
      path,
      title: title || path,
      referrer: referrer || 'Direct / Bookmark',
      duration: 0,
      startedAt: new Date(),
    },
  });

  return {
    visitor,
    pageViewId: pageView.id,
  };
}

/**
 * Update time duration spent on a specific page view
 */
export async function updatePageViewDuration(pageViewId: string, visitorId: string, durationSeconds: number) {
  if (!pageViewId) return null;

  const validDuration = Math.max(0, Math.floor(durationSeconds));

  const pageView = await prisma.pageView.update({
    where: { id: pageViewId },
    data: {
      duration: validDuration,
      updatedAt: new Date(),
    },
  }).catch(() => null);

  const targetVisitorId = pageView?.visitorId || visitorId;

  if (targetVisitorId) {
    const aggregate = await prisma.pageView.aggregate({
      where: { visitorId: targetVisitorId },
      _sum: { duration: true },
    });

    const totalSeconds = aggregate._sum.duration || 0;

    await prisma.visitor.updateMany({
      where: { visitorId: targetVisitorId },
      data: {
        lastActiveAt: new Date(),
        totalDuration: totalSeconds,
      },
    }).catch(() => null);
  }

  return pageView;
}

/**
 * Retrieve high-level visitor metrics for authentic visitors
 */
export async function getVisitorStats() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const [totalVisitors, activeVisitors, totalPageViews, avgResult] = await prisma.$transaction([
    prisma.visitor.count(),
    prisma.visitor.count({
      where: {
        lastActiveAt: { gte: fiveMinutesAgo },
      },
    }),
    prisma.pageView.count(),
    prisma.visitor.aggregate({
      _avg: { totalDuration: true },
    }),
  ]);

  return {
    totalVisitors,
    activeVisitors,
    totalPageViews,
    avgDuration: Math.round(avgResult._avg.totalDuration || 0),
  };
}

/**
 * Get paginated or filtered list of authentic visitors
 */
export async function getVisitorsList(options: {
  page?: number;
  limit?: number;
  search?: string;
  deviceType?: string;
} = {}) {
  const { page = 1, limit = 50, search, deviceType } = options;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (deviceType && deviceType !== 'all') {
    where.deviceType = {
      equals: deviceType,
      mode: 'insensitive',
    };
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { visitorId: { contains: q, mode: 'insensitive' } },
      { userName: { contains: q, mode: 'insensitive' } },
      { userEmail: { contains: q, mode: 'insensitive' } },
      { ipAddress: { contains: q, mode: 'insensitive' } },
      { browser: { contains: q, mode: 'insensitive' } },
      { os: { contains: q, mode: 'insensitive' } },
      { initialLanding: { contains: q, mode: 'insensitive' } },
      { referrer: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, visitors] = await prisma.$transaction([
    prisma.visitor.count({ where }),
    prisma.visitor.findMany({
      where,
      orderBy: { lastActiveAt: 'desc' },
      take: limit,
      skip,
      include: {
        _count: {
          select: { pageViews: true },
        },
      },
    }),
  ]);

  return {
    visitors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get full visitor details with all their page view logs
 */
export async function getVisitorDetails(idOrVisitorId: string) {
  const visitor = await prisma.visitor.findFirst({
    where: {
      OR: [{ id: idOrVisitorId }, { visitorId: idOrVisitorId }],
    },
    include: {
      pageViews: {
        orderBy: { startedAt: 'desc' },
      },
      _count: {
        select: { pageViews: true },
      },
    },
  });

  return visitor;
}

/**
 * Delete a visitor and all associated page views
 */
export async function deleteVisitor(idOrVisitorId: string) {
  const deleted = await prisma.visitor.deleteMany({
    where: {
      OR: [{ id: idOrVisitorId }, { visitorId: idOrVisitorId }],
    },
  });

  return deleted.count > 0;
}
