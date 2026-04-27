import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/needs - create a need
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { userId, title, description, category, urgency, budgetMin, budgetMax, city, province } = data

    if (!userId || !title) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 })
    }

    const need = await db.need.create({
      data: { userId, title, description, category, urgency, budgetMin, budgetMax, city, province },
    })

    return NextResponse.json(need, { status: 201 })
  } catch (error) {
    console.error('Create need error:', error)
    return NextResponse.json({ error: 'Error al crear necesidad' }, { status: 500 })
  }
}

// GET /api/needs - list needs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (status) where.status = status
    if (category) where.category = category

    const needs = await db.need.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json(needs)
  } catch (error) {
    console.error('List needs error:', error)
    return NextResponse.json({ error: 'Error al obtener necesidades' }, { status: 500 })
  }
}
