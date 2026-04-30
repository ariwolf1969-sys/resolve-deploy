import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = { userId };
    if (unreadOnly) where.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.notification.count({ where: { userId } }),
      db.notification.count({ where: { userId, read: false } }),
    ]);

    return NextResponse.json({
      data: notifications,
      meta: { total, unreadCount, limit, offset },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST: Mark notifications as read / create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, notificationIds, userId, title, message, type, link } = body;

    // Mark as read
    if (action === 'mark_read') {
      if (!notificationIds || !Array.isArray(notificationIds)) {
        return NextResponse.json({ error: 'notificationIds requerido' }, { status: 400 });
      }

      await db.notification.updateMany({
        where: { id: { in: notificationIds } },
        data: { read: true },
      });

      return NextResponse.json({ success: true });
    }

    // Mark all as read for a user
    if (action === 'mark_all_read') {
      if (!userId) {
        return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
      }

      await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });

      return NextResponse.json({ success: true });
    }

    // Create notification
    if (action === 'create') {
      if (!userId || !title || !message) {
        return NextResponse.json(
          { error: 'Faltan campos: userId, title, message' },
          { status: 400 }
        );
      }

      const notification = await db.notification.create({
        data: {
          userId,
          title,
          message,
          type: type || 'system',
          link: link || null,
        },
      });

      return NextResponse.json({ data: notification }, { status: 201 });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error processing notification:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
