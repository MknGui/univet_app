import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { Activity, Calendar, Heart, BookOpen, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardAgendamento } from '@/components/cards/CardAgendamento';
import { mockAppointments, mockAnimals, getUnreadNotifications, getConsultationsByAnimalId } from '@/data/mockData';

const TutorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    {
      icon: Activity,
      label: 'Meus Animais',
      description: 'Ver e gerenciar',
      path: '/tutor/animals',
      color: 'bg-blue-500/10 text-blue-600'
    },
    {
      icon: Calendar,
      label: 'Agendamentos',
      description: 'Marcar consulta',
      path: '/tutor/appointments',
      color: 'bg-green-500/10 text-green-600'
    },
    {
      icon: Heart,
      label: 'Triagem Rápida',
      description: 'Avaliar sinais',
      path: '/tutor/triage',
      color: 'bg-red-500/10 text-red-600'
    },
    {
      icon: BookOpen,
      label: 'Conteúdos',
      description: 'Aprenda mais',
      path: '/tutor/education',
      color: 'bg-purple-500/10 text-purple-600'
    }
  ];

  // Filter tutor's upcoming appointments
  const tutorAppointments = mockAppointments.filter(
    apt => apt.tutorId === 'tutor1' && apt.status !== 'completed'
  );
  
  const upcomingAppointments = tutorAppointments.slice(0, 2);
  const tutorAnimals = mockAnimals.filter(a => a.tutorId === 'tutor1');
  const unreadCount = getUnreadNotifications().length;

  return (
    <MobileLayout>
      <div className="gradient-hero pb-8">
        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Bem-vindo(a),</p>
              <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full relative"
              onClick={() => navigate('/tutor/notifications')}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="mobile-card text-left hover:shadow-lg transition-all active:scale-95"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{action.label}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Próximas Consultas</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tutor/appointments')}
            className="text-primary"
          >
            Ver todas
          </Button>
        </div>

        {upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <CardAgendamento
                key={appointment.id}
                appointment={appointment}
                onClick={() => navigate(`/tutor/appointment/${appointment.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="mobile-card text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              Nenhuma consulta agendada
            </p>
            <Button
              onClick={() => navigate('/tutor/appointment/new')}
              size="sm"
              className="gradient-primary"
            >
              Agendar Consulta
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="mobile-card text-center">
            <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{tutorAnimals.length}</p>
            <p className="text-xs text-muted-foreground">Animais</p>
          </div>
          <div className="mobile-card text-center">
            <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
            <p className="text-xs text-muted-foreground">Próximas</p>
          </div>
          <div className="mobile-card text-center">
            <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{tutorAnimals.reduce((acc, a) => acc + (getConsultationsByAnimalId(a.id).length || 0), 0)}</p>
            <p className="text-xs text-muted-foreground">Consultas</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default TutorDashboard;
