import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/professionals
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const profession = searchParams.get('profession')
    const city = searchParams.get('city')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = {
      role: 'professional',
      isAvailable: true,
    }

    if (profession) where.profession = profession
    if (city) where.city = { contains: city }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { profession: { contains: search } },
        { bio: { contains: search } },
      ]
    }

    const professionals = await db.user.findMany({
      where,
      take: limit,
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      select: {
        id: true,
        name: true,
        avatar: true,
        profession: true,
        bio: true,
        city: true,
        province: true,
        hourlyRate: true,
        rating: true,
        reviewCount: true,
        isVerified: true,
      },
    })

    return NextResponse.json(professionals)
  } catch (error) {
    console.error('Professionals error:', error)
    return NextResponse.json({ error: 'Error al obtener profesionales' }, { status: 500 })
  }
}
