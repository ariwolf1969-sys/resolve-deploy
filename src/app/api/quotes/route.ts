import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/quotes - create a quote
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { title, description, senderId, receiverId, price, urgency, city, province } = data

    if (!title || !senderId || !receiverId) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 })
    }

    // Set expiration 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const quote = await db.quote.create({
      data: {
        title,
        description,
        senderId,
        receiverId,
        price,
        urgency,
        city,
        province,
        expiresAt,
      },
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Create quote error:', error)
    return NextResponse.json({ error: 'Error al crear presupuesto' }, { status: 500 })
  }
}

// GET /api/quotes - list quotes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const senderId = searchParams.get('senderId')
    const receiverId = searchParams.get('receiverId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (senderId) where.senderId = senderId
    if (receiverId) where.receiverId = receiverId
    if (status) where.status = status

    const quotes = await db.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true, profession: true } },
      },
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('List quotes error:', error)
    return NextResponse.json({ error: 'Error al obtener presupuestos' }, { status: 500 })
  }
}
