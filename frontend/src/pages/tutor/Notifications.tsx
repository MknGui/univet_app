import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Bell, Calendar, Heart, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from '@/api/notifications';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await listNotifications();
      setNotifications(data);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    // marca como lida de forma otimista
    if (!notification.read) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n,
        ),
      );
      try {
        await markNotificationAsRead(notification.id);
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Erro ao marcar como lida');
        // rollback se der erro
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: false } : n,
          ),
        );
      }
    }

    // se tiver link, navega
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!notifications.some((n) => !n.read)) return;

    setMarkingAll(true);
    const prev = notifications;
    setNotifications((old) => old.map((n) => ({ ...n, read: true })));

    try {
      await markAllNotificationsAsRead();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Erro ao marcar todas como lidas');
      setNotifications(prev);
    } finally {
      setMarkingAll(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return { icon: Calendar, color: 'bg-blue-500/10 text-blue-600' };
      case 'triage':
        return { icon: Heart, color: 'bg-red-500/10 text-red-600' };
      case 'success':
        return { icon: CheckCircle, color: 'bg-green-500/10 text-green-600' };
      case 'info':
        return { icon: Info, color: 'bg-purple-500/10 text-purple-600' };
      default:
        return { icon: Bell, color: 'bg-muted text-muted-foreground' };
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <MobileLayout>
      <MobileHeader
        title="Notificações"
        showBack
        action={
          notifications.length > 0 && unreadCount > 0 ? (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="text-xs font-medium text-primary disabled:opacity-50"
            >
              {markingAll ? '...' : 'Marcar todas como lidas'}
            </button>
          ) : undefined
        }
      />

      <div className="px-6 py-6 space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="mobile-card text-center py-12">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">
              Carregando notificações...
            </h3>
            <p className="text-sm text-muted-foreground">
              Buscando atualizações para você
            </p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => {
            const { icon: Icon, color } = getNotificationIcon(notification.type);
            return (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'w-full text-left mobile-card transition-all hover:shadow-lg active:scale-95',
                  !notification.read && 'bg-primary/5 border-primary/20',
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className={cn(
                          'font-semibold',
                          !notification.read && 'text-primary',
                        )}
                      >
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="mobile-card text-center py-12">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-sm text-muted-foreground">
              Você está em dia com todas as suas notificações
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Notifications;
