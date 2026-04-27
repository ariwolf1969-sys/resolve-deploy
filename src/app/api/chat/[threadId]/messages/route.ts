import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const messages = await db.message.findMany({
      where: { threadId },
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const body = await request.json();
    const { content, senderId } = body;

    if (!content || !senderId) {
      return NextResponse.json({ error: 'Content and senderId are required' }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        content,
        threadId,
        senderId,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      }
    });

    // Update thread last message
    await db.chatThread.update({
      where: { id: threadId },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
