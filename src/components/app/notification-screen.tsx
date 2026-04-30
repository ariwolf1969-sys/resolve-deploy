'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type AppNotification } from '@/store/app-store';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  Info,
  MapPin,
  Shield,
} from 'lucide-react';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'quote_accepted':
      return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    case 'payment_received':
      return { icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' };
    case 'new_message':
      return { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' };
    case 'check_in':
      return { icon: MapPin, color: 'text-orange-600', bg: 'bg-orange-50' };
    case 'dispute':
      return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' };
    default:
      return { icon: Info, color: 'text-gray-600', bg: 'bg-gray-50' };
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins}min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-AR');
}

export function NotificationScreen() {
  const { goBack, setView, currentUser, setUnreadCount } = useAppStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications?unreadOnly=false&limit=50`, {
        headers: { 'x-user-id': currentUser.id },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setUnreadCount(data.meta?.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  }, [currentUser, setUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    const notif = notifications.find((n) => n.id === notificationId);
    if (notif?.read) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', notificationIds: [notificationId] }),
      });
      // Update unread count
      const newUnread = notifications.filter((n) => !n.read && n.id !== notificationId).length;
      setUnreadCount(newUnread);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read', userId: currentUser?.id }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);

    // Navigate based on link
    if (notif.link) {
      const [type, id] = notif.link.split(':');
      if (type === 'quote') {
        // Fetch and navigate to quote
        fetch(`/api/quotes/${id}`)
          .then((r) => r.json())
          .then((data) => {
            useAppStore.getState().setSelectedQuote(data);
            setView('quote-detail');
          })
          .catch(() => {});
      }
    }
  };

  const filteredNotifications =
    activeFilter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={goBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Notificaciones</h1>
            {unreadCount > 0 && (
              <p className="text-[11px] text-blue-500 -mt-0.5">
                {unreadCount} sin leer
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-500 font-medium hover:underline px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Marcar todas
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 px-4 pb-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Sin leer ({unreadCount})
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-blue-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              {activeFilter === 'unread'
                ? '¡Todo leído!'
                : 'No hay notificaciones'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {activeFilter === 'unread'
                ? 'No tenés notificaciones sin leer'
                : 'Las notificaciones aparecerán aquí'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const iconConfig = getNotificationIcon(notif.type);
            const IconComponent = iconConfig.icon;

            return (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`w-full text-left bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md active:scale-[0.99] ${
                  notif.read
                    ? 'border-gray-100 opacity-75'
                    : 'border-blue-100'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl ${iconConfig.bg} flex items-center justify-center shrink-0`}>
                      <IconComponent className={`h-5 w-5 ${iconConfig.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`text-sm font-semibold truncate ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notif.title}
                        </h3>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${notif.read ? 'text-gray-400' : 'text-gray-600'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
