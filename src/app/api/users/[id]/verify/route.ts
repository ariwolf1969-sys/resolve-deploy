import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Submit identity verification / Get verification status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { action } = body;

    // Get verification status
    if (action === 'get_status') {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          dniVerified: true,
          dniNumber: true,
          dniPhotoUrl: true,
          selfieDniUrl: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }

      // Determine verification step
      let step = 1;
      if (user.dniNumber) step = 2;
      if (user.dniPhotoUrl) step = 3;
      if (user.selfieDniUrl) step = 4;
      if (user.dniVerified) step = 5; // verified

      return NextResponse.json({
        data: {
          step,
          dniVerified: user.dniVerified,
          dniNumber: user.dniNumber,
          dniPhotoUrl: user.dniPhotoUrl,
          selfieDniUrl: user.selfieDniUrl,
        },
      });
    }

    // Step 1: Submit DNI number
    if (action === 'submit_dni_number') {
      const { dniNumber } = body;
      
      if (!dniNumber || dniNumber.length < 7) {
        return NextResponse.json(
          { error: 'Número de DNI inválido (mínimo 7 dígitos)' },
          { status: 400 }
        );
      }

      await db.user.update({
        where: { id: userId },
        data: { dniNumber: dniNumber.trim() },
      });

      return NextResponse.json({ success: true, step: 2 });
    }

    // Step 2: Upload DNI photo (base64)
    if (action === 'submit_dni_photo') {
      const { dniPhotoUrl } = body;

      if (!dniPhotoUrl) {
        return NextResponse.json(
          { error: 'Foto del DNI requerida' },
          { status: 400 }
        );
      }

      await db.user.update({
        where: { id: userId },
        data: { dniPhotoUrl },
      });

      return NextResponse.json({ success: true, step: 3 });
    }

    // Step 3: Upload selfie with DNI
    if (action === 'submit_selfie') {
      const { selfieDniUrl } = body;

      if (!selfieDniUrl) {
        return NextResponse.json(
          { error: 'Selfie con DNI requerida' },
          { status: 400 }
        );
      }

      await db.user.update({
        where: { id: userId },
        data: { selfieDniUrl },
      });

      return NextResponse.json({ success: true, step: 4 });
    }

    // Step 4: Confirm and submit for verification
    if (action === 'confirm_verification') {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { dniNumber: true, dniPhotoUrl: true, selfieDniUrl: true },
      });

      if (!user?.dniNumber || !user?.dniPhotoUrl || !user?.selfieDniUrl) {
        return NextResponse.json(
          { error: 'Faltan datos para la verificación' },
          { status: 400 }
        );
      }

      // In production, this would send to a verification service
      // For now, we auto-approve after a brief delay simulation
      // Create notification about verification request
      await db.notification.create({
        data: {
          userId,
          title: 'Verificación enviada',
          message: 'Tu solicitud de verificación de identidad fue recibida. Te notificaremos cuando sea aprobada.',
          type: 'system',
        },
      });

      // Auto-approve in demo mode (in production would need manual review)
      await db.user.update({
        where: { id: userId },
        data: {
          dniVerified: true,
          verified: true,
        },
      });

      // Success notification
      await db.notification.create({
        data: {
          userId,
          title: '¡Identidad verificada! ✅',
          message: 'Tu identidad fue verificada exitosamente. Ahora tus clientes verán la insignia de verificación en tu perfil.',
          type: 'system',
        },
      });

      return NextResponse.json({ success: true, step: 5, verified: true });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error in verify route:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// GET: Get verification status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        dniVerified: true,
        dniNumber: true,
        dniPhotoUrl: true,
        selfieDniUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    let step = 1;
    if (user.dniNumber) step = 2;
    if (user.dniPhotoUrl) step = 3;
    if (user.selfieDniUrl) step = 4;
    if (user.dniVerified) step = 5;

    return NextResponse.json({
      data: {
        step,
        dniVerified: user.dniVerified,
        hasDniNumber: !!user.dniNumber,
        hasDniPhoto: !!user.dniPhotoUrl,
        hasSelfie: !!user.selfieDniUrl,
      },
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
