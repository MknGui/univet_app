import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { CardAgendamento } from '@/components/cards/CardAgendamento';
import { mockAppointments } from '@/data/mockData';

const VetAppointments = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'past'>('today');

  // Filter vet's appointments (assuming vetId = 'vet1')
  const vetAppointments = mockAppointments.filter(apt => apt.vetId === 'vet1');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const filteredAppointments = vetAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    
    if (filter === 'today') {
      return aptDate.getTime() === today.getTime();
    } else if (filter === 'upcoming') {
      return aptDate >= tomorrow && apt.status !== 'completed';
    } else {
      return aptDate < today || apt.status === 'completed';
    }
  });

  return (
    <MobileLayout>
      <MobileHeader title="Agenda" />

      <div className="px-6 py-6 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'today' ? 'default' : 'outline'}
            onClick={() => setFilter('today')}
            className="flex-1"
          >
            Hoje
          </Button>
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
                onClick={() => navigate(`/vet/appointment/${appointment.id}`)}
                showTutor={true}
              />
            ))}
          </div>
        ) : (
          <div className="mobile-card text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">
              {filter === 'today' && 'Nenhum agendamento para hoje'}
              {filter === 'upcoming' && 'Nenhum agendamento futuro'}
              {filter === 'past' && 'Nenhum agendamento anterior'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filter === 'today' && 'Você não possui consultas agendadas para hoje'}
              {filter === 'upcoming' && 'Não há consultas futuras agendadas'}
              {filter === 'past' && 'Você ainda não possui consultas anteriores'}
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default VetAppointments;
