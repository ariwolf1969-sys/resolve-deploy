import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { score, comment, raterId, needId } = body;

    if (!score || !raterId || !id) {
      return NextResponse.json({ error: 'Score, raterId, and ratedId are required' }, { status: 400 });
    }

    if (score < 1 || score > 5) {
      return NextResponse.json({ error: 'Score must be between 1 and 5' }, { status: 400 });
    }

    const rating = await db.rating.create({
      data: {
        score,
        comment: comment || null,
        raterId,
        ratedId: id,
        needId: needId || null,
      },
      include: {
        rater: { select: { id: true, name: true, avatar: true } },
        rated: { select: { id: true, name: true } }
      }
    });

    // Update user average rating
    const ratings = await db.rating.findMany({
      where: { ratedId: id }
    });
    const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
    await db.user.update({
      where: { id },
      data: {
        ratingAvg: Math.round(avg * 10) / 10,
        ratingCount: ratings.length,
      }
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error('Error creating rating:', error);
    return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 });
  }
}
