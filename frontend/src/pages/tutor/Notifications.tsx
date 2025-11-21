import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Bell, Calendar, Heart, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'appointment' | 'triage' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const Notifications = () => {
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'Consulta Confirmada',
      message: 'Sua consulta com Thor foi confirmada para 05/11/2025 às 14:30',
      time: '2 horas atrás',
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Vacina Aplicada',
      message: 'A vacina V10 de Luna foi registrada com sucesso',
      time: '1 dia atrás',
      read: false
    },
    {
      id: '3',
      type: 'triage',
      title: 'Triagem Concluída',
      message: 'Triagem de Thor foi avaliada. Recomenda-se consulta veterinária',
      time: '2 dias atrás',
      read: true
    },
    {
      id: '4',
      type: 'info',
      title: 'Dica de Saúde',
      message: 'Não esqueça de manter a hidratação do seu pet em dias quentes',
      time: '3 dias atrás',
      read: true
    },
    {
      id: '5',
      type: 'appointment',
      title: 'Lembrete de Consulta',
      message: 'Você tem uma consulta agendada para amanhã às 10:00',
      time: '1 semana atrás',
      read: true
    }
  ];

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

  return (
    <MobileLayout>
      <MobileHeader title="Notificações" showBack />

      <div className="px-6 py-6 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const { icon: Icon, color } = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={cn(
                  "mobile-card transition-all",
                  !notification.read && "bg-primary/5 border-primary/20"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={cn(
                        "font-semibold",
                        !notification.read && "text-primary"
                      )}>
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
              </div>
            );
          })
        ) : (
          <div className="mobile-card text-center py-12">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma notificação</h3>
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
