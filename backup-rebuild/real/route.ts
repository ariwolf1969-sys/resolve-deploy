import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products/real - list affiliate products
export async function GET() {
  try {
    const products = await db.affiliateProduct.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Products error:', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}
