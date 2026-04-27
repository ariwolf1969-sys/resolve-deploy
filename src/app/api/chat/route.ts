import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const threads = await db.chatThread.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      },
      include: {
        need: {
          select: { id: true, title: true, category: true }
        },
        participant1: {
          select: { id: true, name: true, avatar: true }
        },
        participant2: {
          select: { id: true, name: true, avatar: true }
        },
        _count: {
          select: {
            messages: {
              where: { read: false, senderId: { not: userId } }
            }
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    const formattedThreads = threads.map(thread => ({
      ...thread,
      otherUser: thread.participant1Id === userId ? thread.participant2 : thread.participant1,
      unreadCount: thread._count.messages,
    }));

    return NextResponse.json(formattedThreads);
  } catch (error) {
    console.error('Error fetching chat threads:', error);
    return NextResponse.json({ error: 'Failed to fetch chat threads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participant1Id, participant2Id, needId } = body;

    if (!participant1Id || !participant2Id) {
      return NextResponse.json({ error: 'Both participant IDs are required' }, { status: 400 });
    }

    // Check if thread already exists
    const existing = await db.chatThread.findFirst({
      where: {
        OR: [
          { participant1Id, participant2Id },
          { participant1Id: participant2Id, participant2Id: participant1Id }
        ],
        ...(needId ? { needId } : {})
      }
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const thread = await db.chatThread.create({
      data: {
        participant1Id,
        participant2Id,
        needId: needId || null,
      },
      include: {
        participant1: { select: { id: true, name: true, avatar: true } },
        participant2: { select: { id: true, name: true, avatar: true } },
      }
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Error creating chat thread:', error);
    return NextResponse.json({ error: 'Failed to create chat thread' }, { status: 500 });
  }
}
