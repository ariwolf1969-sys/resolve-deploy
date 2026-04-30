import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [
      totalUsers,
      totalProfessionals,
      activeQuotes,
      completedJobs,
      totalRevenue,
      openDisputes,
      pendingVerifications,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { profession: { not: null } } }),
      db.quote.count({ where: { status: { in: ['accepted', 'pending'] } } }),
      db.quote.count({ where: { status: 'completed' } }),
      db.transaction.aggregate({
        where: { status: { in: ['held', 'released'] } },
        _sum: { amount: true },
      }),
      db.dispute.count({ where: { status: 'open' } }),
      db.user.count({
        where: {
          profession: { not: null },
          dniVerified: false,
        },
      }),
    ]);

    // Recent quotes
    const recentQuotes = await db.quote.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, avatar: true } },
        provider: { select: { id: true, name: true, avatar: true, profession: true } },
      },
    });

    // Open disputes
    const openDisputesList = await db.dispute.findMany({
      where: { status: 'open' },
      include: {
        filedBy: { select: { id: true, name: true, avatar: true } },
        against: { select: { id: true, name: true, avatar: true } },
        quote: { select: { id: true, title: true, amount } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      data: {
        stats: {
          totalUsers,
          totalProfessionals,
          activeQuotes,
          completedJobs,
          totalRevenue: totalRevenue._sum.amount || 0,
          openDisputes,
          pendingVerifications,
        },
        recentQuotes,
        openDisputes: openDisputesList,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
