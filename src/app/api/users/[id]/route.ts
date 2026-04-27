import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/users/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        profession: true,
        bio: true,
        city: true,
        province: true,
        address: true,
        hourlyRate: true,
        rating: true,
        reviewCount: true,
        isAvailable: true,
        isVerified: true,
        skills: true,
        experience: true,
        education: true,
        certifications: true,
        createdAt: true,
        reviewCount: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      skills: user.skills ? JSON.parse(user.skills) : null,
      certifications: user.certifications ? JSON.parse(user.certifications) : null,
    })
  } catch (error) {
    console.error('User get error:', error)
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 })
  }
}

// PUT /api/users/[id] - update user
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await req.json()

    // Handle phone formatting
    if (data.phone) {
      const digits = data.phone.replace(/\D/g, '')
      if (digits.length >= 8 && digits.length <= 11) {
        data.phone = '+54' + digits
      }
    }

    // Stringify JSON fields
    if (data.skills && Array.isArray(data.skills)) {
      data.skills = JSON.stringify(data.skills)
    }
    if (data.certifications && Array.isArray(data.certifications)) {
      data.certifications = JSON.stringify(data.certifications)
    }

    const user = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        profession: true,
        bio: true,
        city: true,
        province: true,
        address: true,
        hourlyRate: true,
        rating: true,
        reviewCount: true,
        isAvailable: true,
        isVerified: true,
        skills: true,
        experience: true,
        education: true,
        certifications: true,
      },
    })

    return NextResponse.json({
      ...user,
      skills: user.skills ? JSON.parse(user.skills) : null,
      certifications: user.certifications ? JSON.parse(user.certifications) : null,
    })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}
