import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Mercado Pago webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle payment notification
    if (body.type === 'payment') {
      const paymentId = body.data?.id;

      if (!paymentId) {
        return NextResponse.json({ error: 'Payment ID faltante' }, { status: 400 });
      }

      // For demo mode: handle directly from the body
      // In production, you would call MP API to get payment details
      const paymentStatus = body.data?.status || 'pending';
      const externalReference = body.external_reference;

      if (externalReference) {
        const [quoteId, userId] = externalReference.split(':');

        // Update transaction status
        const transaction = await db.transaction.findFirst({
          where: {
            paymentRef: String(paymentId),
            OR: [{ quoteId, userId }],
          },
        });

        if (transaction) {
          let newStatus = 'pending';
          if (paymentStatus === 'approved') newStatus = 'held';
          else if (paymentStatus === 'rejected') newStatus = 'rejected';
          else if (paymentStatus === 'cancelled') newStatus = 'refunded';
          else if (paymentStatus === 'refunded') newStatus = 'refunded';

          await db.transaction.update({
            where: { id: transaction.id },
            data: {
              status: newStatus,
              updatedAt: new Date(),
              ...(newStatus === 'held' ? {} : {}),
              ...(newStatus === 'refunded' ? { refundedAt: new Date() } : {}),
            },
          });

          // Create notification for payment status change
          if (paymentStatus === 'approved') {
            await db.notification.create({
              data: {
                userId,
                title: 'Pago confirmado',
                message: `El pago de $${transaction.amount} fue confirmado y retenido de forma segura.`,
                type: 'payment_received',
                link: quoteId ? `quote:${quoteId}` : null,
              },
            });

            // Notify provider too
            const quote = await db.quote.findUnique({
              where: { id: transaction.quoteId },
              select: { providerId: true },
            });
            if (quote) {
              await db.notification.create({
                data: {
                  userId: quote.providerId,
                  title: 'Pago recibido',
                  message: `Recibiste un pago de $${transaction.amount}. El dinero será liberado cuando el cliente confirme el trabajo.`,
                  type: 'payment_received',
                  link: transaction.quoteId ? `quote:${transaction.quoteId}` : null,
                },
              });
            }
          }
        }
      }

      return NextResponse.json({ received: true });
    }

    // Handle merchant order notifications
    if (body.type === 'merchant_order') {
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Error procesando notificación' },
      { status: 500 }
    );
  }
}

// GET for webhook verification (Mercado Pago sends this to verify the endpoint)
export async function GET() {
  return NextResponse.json({ status: 'webhook_active' });
}
