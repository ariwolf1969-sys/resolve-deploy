import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, role } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }

    if (phone) {
      const digits = phone.replace(/\D/g, '')
      if (digits.length < 8 || digits.length > 11) {
        return NextResponse.json(
          { error: 'El teléfono debe tener entre 8 y 11 dígitos' },
          { status: 400 }
        )
      }
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
    }

    if (phone) {
      const existingPhone = await db.user.findUnique({ where: { phone: '+54' + phone.replace(/\D/g, '') } })
      if (existingPhone) {
        return NextResponse.json({ error: 'El teléfono ya está registrado' }, { status: 409 })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const fullPhone = phone ? '+54' + phone.replace(/\D/g, '') : null

    const user = await db.user.create({
      data: {
        name: name || null,
        email,
        phone: fullPhone,
        password: hashedPassword,
        role: role || 'user',
      },
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}
