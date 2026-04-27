import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
            profession: true,
            ratingAvg: true,
            completedJobs: true,
            location: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
            location: true,
          },
        },
        need: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        checkIns: {
          orderBy: { createdAt: 'desc' },
        },
        disputes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: quote });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, clientMessage } = body;

    const validStatuses = ['accept', 'reject', 'complete', 'cancel'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const quote = await db.quote.findUnique({ where: { id } });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    switch (status) {
      case 'accept':
        updateData.status = 'accepted';
        updateData.acceptedAt = new Date();
        if (clientMessage) updateData.clientMessage = clientMessage;
        break;
      case 'reject':
        updateData.status = 'rejected';
        updateData.rejectedAt = new Date();
        if (clientMessage) updateData.clientMessage = clientMessage;
        break;
      case 'complete':
        updateData.status = 'completed';
        updateData.completedAt = new Date();
        break;
      case 'cancel':
        updateData.status = 'cancelled';
        break;
    }

    const updatedQuote = await db.quote.update({
      where: { id },
      data: updateData,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
            profession: true,
          },
        },
        client: {
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

    return NextResponse.json({ data: updatedQuote });
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
