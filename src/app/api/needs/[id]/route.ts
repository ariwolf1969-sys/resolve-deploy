import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/needs/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const need = await db.need.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true, city: true } },
        responses: {
          include: {
            user: { select: { id: true, name: true, avatar: true, profession: true, rating: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!need) {
      return NextResponse.json({ error: 'Necesidad no encontrada' }, { status: 404 })
    }

    return NextResponse.json(need)
  } catch (error) {
    console.error('Need get error:', error)
    return NextResponse.json({ error: 'Error al obtener necesidad' }, { status: 500 })
  }
}
