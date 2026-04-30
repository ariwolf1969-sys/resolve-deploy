import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createPaymentPreference } from '@/lib/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quoteId, userId } = body;

    if (!quoteId || !userId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: quoteId, userId' },
        { status: 400 }
      );
    }

    // Verify the quote exists and belongs to the user
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: {
        client: { select: { id: true, email: true, name: true } },
        provider: { select: { id: true, name: true } },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      );
    }

    if (quote.clientId !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para pagar este presupuesto' },
        { status: 403 }
      );
    }

    if (quote.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Solo se pueden pagar presupuestos aceptados' },
        { status: 400 }
      );
    }

    // Create Mercado Pago preference
    const preference = await createPaymentPreference({
      quoteId: quote.id,
      title: quote.title,
      description: `Servicio: ${quote.title} - ${quote.provider.name}`,
      amount: quote.amount,
      userId,
      userEmail: quote.client.email || undefined,
    });

    // Create a pending transaction record
    const platformFee = Math.round(quote.amount * 0.08 * 100) / 100;
    const transaction = await db.transaction.create({
      data: {
        quoteId: quote.id,
        userId,
        amount: quote.amount,
        platformFee,
        paymentMethod: 'mercadopago',
        paymentRef: preference.id,
        status: 'pending',
      },
    });

    return NextResponse.json({
      data: {
        transactionId: transaction.id,
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
        isDemo: preference.status === 'demo',
      },
    });
  } catch (error) {
    console.error('Error creating payment preference:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
