import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/quotes/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, name: true, avatar: true, phone: true } },
        receiver: { select: { id: true, name: true, avatar: true, profession: true, rating: true } },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Quote get error:', error)
    return NextResponse.json({ error: 'Error al obtener presupuesto' }, { status: 500 })
  }
}

// PUT /api/quotes/[id] - update quote status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await req.json()
    const { status } = data

    if (!status) {
      return NextResponse.json({ error: 'Estado requerido' }, { status: 400 })
    }

    const quote = await db.quote.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Quote update error:', error)
    return NextResponse.json({ error: 'Error al actualizar presupuesto' }, { status: 500 })
  }
}
