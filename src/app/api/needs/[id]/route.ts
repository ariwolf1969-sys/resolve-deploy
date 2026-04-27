import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const need = await db.need.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, ratingAvg: true, ratingCount: true, verified: true, phone: true }
        },
        responses: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, ratingAvg: true, ratingCount: true, verified: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!need) {
      return NextResponse.json({ error: 'Need not found' }, { status: 404 });
    }

    return NextResponse.json(need);
  } catch (error) {
    console.error('Error fetching need:', error);
    return NextResponse.json({ error: 'Failed to fetch need' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const need = await db.need.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(need);
  } catch (error) {
    console.error('Error updating need:', error);
    return NextResponse.json({ error: 'Failed to update need' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.need.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting need:', error);
    return NextResponse.json({ error: 'Failed to delete need' }, { status: 500 });
  }
}
