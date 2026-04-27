import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/chat/[threadId]/messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params
    const messages = await db.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Messages get error:', error)
    return NextResponse.json({ error: 'Error al obtener mensajes' }, { status: 500 })
  }
}

// POST /api/chat/[threadId]/messages - send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params
    const { content, senderId, type } = await req.json()

    if (!content || !senderId) {
      return NextResponse.json({ error: 'Contenido y remitente requeridos' }, { status: 400 })
    }

    const message = await db.message.create({
      data: {
        content,
        senderId,
        threadId,
        type: type || 'text',
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    })

    // Update thread timestamp
    await db.chatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Message send error:', error)
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 })
  }
}
