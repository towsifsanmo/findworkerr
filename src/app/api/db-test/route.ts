import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as connected`;
    const latencyMs = Date.now() - startTime;

    const [categoriesCount, workersCount, articlesCount] = await Promise.all([
      prisma.category.count().catch(() => 0),
      prisma.workerProfile.count().catch(() => 0),
      prisma.article.count().catch(() => 0),
    ]);

    return NextResponse.json({
      connected: true,
      status: 'connected',
      message: 'Database connection successful',
      latency: `${latencyMs}ms`,
      stats: {
        categories: categoriesCount,
        workers: workersCount,
        articles: articlesCount,
      },
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      status: 'disconnected',
      message: 'Database connection failed',
      error: error?.message || 'Unknown database connection error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

