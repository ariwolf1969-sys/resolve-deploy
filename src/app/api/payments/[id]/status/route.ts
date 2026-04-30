import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Check payment status by preference/transaction ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Look up the transaction by paymentRef (preference ID) or transaction ID
    const transaction = await db.transaction.findFirst({
      where: {
        OR: [
          { id: id },
          { paymentRef: id },
        ],
      },
      include: {
        quote: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: transaction.id,
        quoteId: transaction.quoteId,
        amount: transaction.amount,
        platformFee: transaction.platformFee,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        paymentRef: transaction.paymentRef,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        releasedAt: transaction.releasedAt,
        refundedAt: transaction.refundedAt,
        quote: transaction.quote,
      },
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
