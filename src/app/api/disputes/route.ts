import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get('quoteId');

    if (!quoteId) {
      return NextResponse.json(
        { error: 'quoteId query parameter is required' },
        { status: 400 }
      );
    }

    const disputes = await db.dispute.findMany({
      where: { quoteId },
      orderBy: { createdAt: 'desc' },
      include: {
        filedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
        against: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ data: disputes });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { quoteId, filedById, againstId, reason, description } = body;

    if (!quoteId || !filedById || !againstId || !reason || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: quoteId, filedById, againstId, reason, description' },
        { status: 400 }
      );
    }

    const dispute = await db.dispute.create({
      data: {
        quoteId,
        filedById,
        againstId,
        reason,
        description,
        status: 'open',
      },
      include: {
        filedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
        against: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ data: dispute }, { status: 201 });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
