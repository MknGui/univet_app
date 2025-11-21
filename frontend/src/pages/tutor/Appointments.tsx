import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { CardAgendamento } from '@/components/cards/CardAgendamento';
import { mockAppointments } from '@/data/mockData';

const Appointments = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  // Filter tutor's appointments (assuming tutorId = 'tutor1')
  const tutorAppointments = mockAppointments.filter(apt => apt.tutorId === 'tutor1');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredAppointments = tutorAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    
    if (filter === 'upcoming') {
      return aptDate >= today && apt.status !== 'completed';
    } else {
      return aptDate < today || apt.status === 'completed';
    }
  });

  return (
    <MobileLayout>
      <MobileHeader
        title="Agendamentos"
        action={
          <Button
            size="icon"
            onClick={() => navigate('/tutor/appointment/new')}
            className="h-9 w-9 gradient-primary"
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-6 py-6 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilter('upcoming')}
            className="flex-1"
          >
            Próximas
          </Button>
          <Button
            variant={filter === 'past' ? 'default' : 'outline'}
            onClick={() => setFilter('past')}
            className="flex-1"
          >
            Anteriores
          </Button>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => (
              <CardAgendamento
                key={appointment.id}
                appointment={appointment}
                onClick={() => navigate(`/tutor/appointment/${appointment.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="mobile-card text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">
              {filter === 'upcoming' ? 'Nenhum agendamento futuro' : 'Nenhum agendamento anterior'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {filter === 'upcoming' ? 'Agende sua primeira consulta veterinária' : 'Você ainda não possui consultas anteriores'}
            </p>
            {filter === 'upcoming' && (
              <Button
                onClick={() => navigate('/tutor/appointment/new')}
                className="gradient-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agendar Consulta
              </Button>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Appointments;
