import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Verify a user (admin action)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Verify user identity
    if (action === 'verify_user') {
      await db.user.update({
        where: { id: userId },
        data: { dniVerified: true, verified: true },
      });

      await db.notification.create({
        data: {
          userId,
          title: '¡Identidad verificada! ✅',
          message: 'Tu identidad fue verificada por un administrador de Resolvé.',
          type: 'system',
        },
      });

      return NextResponse.json({ success: true });
    }

    // Toggle user verified status
    if (action === 'toggle_verified') {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { verified: true, dniVerified: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }

      await db.user.update({
        where: { id: userId },
        data: { verified: !user.verified, dniVerified: !user.dniVerified },
      });

      return NextResponse.json({ success: true });
    }

    // Resolve a dispute
    if (action === 'resolve_dispute') {
      const { disputeId, resolution } = body;

      if (!disputeId) {
        return NextResponse.json({ error: 'disputeId requerido' }, { status: 400 });
      }

      const dispute = await db.dispute.findUnique({
        where: { id: disputeId },
        include: { quote: true },
      });

      if (!dispute) {
        return NextResponse.json({ error: 'Disputa no encontrada' }, { status: 404 });
      }

      await db.dispute.update({
        where: { id: disputeId },
        data: {
          status: 'resolved',
          resolution: resolution || 'Resuelta por el administrador.',
          resolvedAt: new Date(),
        },
      });

      // Notify both parties
      await db.notification.create({
        data: {
          userId: dispute.filedById,
          title: 'Disputa resuelta',
          message: `La disputa por "${dispute.quote.title}" fue resuelta por un administrador.`,
          type: 'dispute',
          link: `quote:${dispute.quoteId}`,
        },
      });

      await db.notification.create({
        data: {
          userId: dispute.againstId,
          title: 'Disputa resuelta',
          message: `La disputa por "${dispute.quote.title}" fue resuelta por un administrador.`,
          type: 'dispute',
          link: `quote:${dispute.quoteId}`,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error in admin action:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
