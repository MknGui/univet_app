import { useState } from 'react';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Bell, Calendar, Stethoscope, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockNotifications, Notification } from '@/data/mockData';

const VetNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return Calendar;
      case 'consultation':
        return Stethoscope;
      case 'reminder':
        return Clock;
      default:
        return Bell;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MobileLayout>
      <MobileHeader 
        title="Notificações"
        action={
          unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-primary"
            >
              <Check className="w-4 h-4 mr-1" />
              Marcar todas
            </Button>
          )
        }
      />

      <div className="px-6 py-6 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            
            return (
              <button
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`w-full mobile-card hover:shadow-lg transition-all active:scale-95 ${
                  !notification.read ? 'border-2 border-primary/20' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    !notification.read ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      !notification.read ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-semibold ${
                        !notification.read ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="mobile-card text-center py-12">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma notificação</h3>
            <p className="text-sm text-muted-foreground">
              Você está em dia! Não há notificações no momento.
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default VetNotifications;
