import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    
    if (role) {
      where.role = role;
    }
    if (role === 'provider') {
      where.profession = { not: null };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          profession: true,
          verified: true,
          dniVerified: true,
          ratingAvg: true,
          completedJobs: true,
          balance: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      data: users,
      meta: { total, limit, offset },
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
