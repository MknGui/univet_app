import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { Stethoscope, Calendar, ClipboardList, Bell, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardAgendamento } from '@/components/cards/CardAgendamento';
import { mockAppointments, mockConsultations } from '@/data/mockData';

const VetDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    {
      icon: Stethoscope,
      label: 'Registrar Consulta',
      description: 'Nova consulta',
      path: '/vet/consultation/new',
      color: 'bg-blue-500/10 text-blue-600'
    },
    {
      icon: ClipboardList,
      label: 'Minhas Consultas',
      description: 'Histórico',
      path: '/vet/consultations',
      color: 'bg-green-500/10 text-green-600'
    },
    {
      icon: Calendar,
      label: 'Agenda',
      description: 'Ver horários',
      path: '/vet/appointments',
      color: 'bg-purple-500/10 text-purple-600'
    },
  ];

  // Filter vet's appointments for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayAppointments = mockAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    return apt.vetId === 'vet1' && aptDate.getTime() === today.getTime();
  });

  const vetConsultations = mockConsultations.filter(c => c.vetId === 'vet1');

  return (
    <MobileLayout>
      <div className="gradient-hero pb-8">
        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Bem-vindo(a),</p>
              <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
              {user?.crmv && (
                <p className="text-sm text-primary font-medium mt-1">{user.crmv}</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => navigate('/vet/notifications')}
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="mobile-card text-left hover:shadow-lg transition-all active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{action.label}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Agenda de Hoje</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/vet/appointments')}
            className="text-primary"
          >
            Ver todas
          </Button>
        </div>

        {todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <CardAgendamento
                key={appointment.id}
                appointment={appointment}
                onClick={() => navigate(`/vet/appointment/${appointment.id}`)}
                showTutor={true}
              />
            ))}
          </div>
        ) : (
          <div className="mobile-card text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma consulta agendada para hoje
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="mobile-card text-center">
            <Stethoscope className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{vetConsultations.length}</p>
            <p className="text-xs text-muted-foreground">Consultas</p>
          </div>
          <div className="mobile-card text-center">
            <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{todayAppointments.length}</p>
            <p className="text-xs text-muted-foreground">Hoje</p>
          </div>
          <div className="mobile-card text-center">
            <ClipboardList className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{vetConsultations.filter(c => c.status === 'completed').length}</p>
            <p className="text-xs text-muted-foreground">Concluídas</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default VetDashboard;
