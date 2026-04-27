import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/transactions - create a transaction
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { type, amount, description, quoteId, userId } = data

    if (!type || !amount || !userId) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 })
    }

    const transaction = await db.transaction.create({
      data: { type, amount, description, quoteId, userId, status: 'completed' },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json({ error: 'Error al crear transacción' }, { status: 500 })
  }
}

// GET /api/transactions - list transactions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    const transactions = await db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('List transactions error:', error)
    return NextResponse.json({ error: 'Error al obtener transacciones' }, { status: 500 })
  }
}
