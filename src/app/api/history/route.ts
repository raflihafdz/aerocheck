import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = parseInt(entityId);

    const history = await prisma.activityHistory.findMany({
      where,
      include: {
        performedBy: { select: { id: true, fullName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json({ error: 'Gagal mengambil riwayat' }, { status: 500 });
  }
}
