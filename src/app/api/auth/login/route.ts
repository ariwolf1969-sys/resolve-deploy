import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, phone } = await req.json()

    if (!password) {
      return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 })
    }

    // Find user by email or phone
    let user
    if (email) {
      user = await db.user.findUnique({ where: { email } })
    } else if (phone) {
      const fullPhone = '+54' + phone.replace(/\D/g, '')
      user = await db.user.findUnique({ where: { phone: fullPhone } })
    } else {
      return NextResponse.json({ error: 'Email o teléfono requerido' }, { status: 400 })
    }

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    // Simple token - in production use JWT
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        profession: user.profession,
        bio: user.bio,
        city: user.city,
        province: user.province,
        address: user.address,
        hourlyRate: user.hourlyRate,
        rating: user.rating,
        reviewCount: user.reviewCount,
        isAvailable: user.isAvailable,
        isVerified: user.isVerified,
        skills: user.skills ? JSON.parse(user.skills) : null,
        experience: user.experience,
        education: user.education,
        certifications: user.certifications ? JSON.parse(user.certifications) : null,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}
