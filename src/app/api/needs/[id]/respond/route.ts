import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message, userId } = body;

    if (!message || !userId) {
      return NextResponse.json({ error: 'Message and userId are required' }, { status: 400 });
    }

    const response = await db.response.create({
      data: {
        message,
        needId: id,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, ratingAvg: true, ratingCount: true }
        }
      }
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating response:', error);
    return NextResponse.json({ error: 'Failed to create response' }, { status: 500 });
  }
}
