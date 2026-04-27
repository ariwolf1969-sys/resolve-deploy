import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const providerId = searchParams.get('providerId');

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (providerId) {
      where.providerId = providerId;
    }

    const quotes = await db.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
      },
    });

    return NextResponse.json({ data: quotes });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { title, description, amount, providerId, clientId, needId, includesMaterials, estimatedHours, validityHours, providerMessage } = body;

    if (!title || !description || amount == null || !providerId || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, amount, providerId, clientId' },
        { status: 400 }
      );
    }

    const hours = validityHours || 48;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    const quote = await db.quote.create({
      data: {
        title,
        description,
        amount,
        providerId,
        clientId,
        needId: needId || null,
        includesMaterials: includesMaterials ?? false,
        estimatedHours: estimatedHours ?? null,
        validityHours: hours,
        providerMessage: providerMessage ?? null,
        expiresAt,
      },
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

    return NextResponse.json({ data: quote }, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
