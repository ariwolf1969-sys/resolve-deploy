import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/chat - list chat threads for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    const threads = await db.chatThreadParticipant.findMany({
      where: { userId },
      include: {
        thread: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: { select: { id: true, name: true, avatar: true } },
              },
            },
            participants: {
              include: {
                user: { select: { id: true, name: true, avatar: true } },
              },
            },
          },
        },
      },
      orderBy: { lastReadAt: 'desc' },
    })

    // Transform to flat structure
    const formattedThreads = threads.map((tp) => {
      const otherParticipant = tp.thread.participants.find((p) => p.userId !== userId)
      const lastMessage = tp.thread.messages[0]
      return {
        id: tp.thread.id,
        otherUser: otherParticipant?.user,
        lastMessage: lastMessage
          ? { ...lastMessage, sender: lastMessage.sender }
          : null,
        unreadCount: 0, // Would need aggregation for real count
        updatedAt: tp.thread.updatedAt,
      }
    })

    return NextResponse.json(formattedThreads)
  } catch (error) {
    console.error('Chat list error:', error)
    return NextResponse.json({ error: 'Error al obtener chats' }, { status: 500 })
  }
}

// POST /api/chat - create a new chat thread
export async function POST(req: NextRequest) {
  try {
    const { participantIds } = await req.json()

    if (!participantIds || participantIds.length < 2) {
      return NextResponse.json({ error: 'Se requieren al menos 2 participantes' }, { status: 400 })
    }

    const thread = await db.chatThread.create({
      data: {
        participants: {
          create: participantIds.map((userId: string) => ({
            userId,
          })),
        },
      },
    })

    return NextResponse.json(thread, { status: 201 })
  } catch (error) {
    console.error('Create chat error:', error)
    return NextResponse.json({ error: 'Error al crear chat' }, { status: 500 })
  }
}
