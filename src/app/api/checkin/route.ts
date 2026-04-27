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

    const checkIns = await db.checkIn.findMany({
      where: { quoteId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
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

    return NextResponse.json({ data: checkIns });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { quoteId, userId, type, lat, lng, address, photoUrl, notes } = body;

    if (!quoteId || !userId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: quoteId, userId, type' },
        { status: 400 }
      );
    }

    const checkIn = await db.checkIn.create({
      data: {
        quoteId,
        userId,
        type,
        lat: lat ?? null,
        lng: lng ?? null,
        address: address ?? null,
        photoUrl: photoUrl ?? null,
        notes: notes ?? null,
        verified: false,
      },
      include: {
        user: {
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

    return NextResponse.json({ data: checkIn }, { status: 201 });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
