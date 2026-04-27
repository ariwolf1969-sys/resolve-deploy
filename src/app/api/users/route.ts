import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/users - list users (professionals only)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') || 'professional'
    const profession = searchParams.get('profession')
    const city = searchParams.get('city')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = { role }

    if (profession) where.profession = profession
    if (city) where.city = { contains: city }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { profession: { contains: search } },
        { bio: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { rating: 'desc' },
        select: {
          id: true,
          name: true,
          avatar: true,
          role: true,
          profession: true,
          bio: true,
          city: true,
          province: true,
          hourlyRate: true,
          rating: true,
          reviewCount: true,
          isAvailable: true,
          isVerified: true,
        },
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({ users, total, page, limit })
  } catch (error) {
    console.error('Users list error:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}
