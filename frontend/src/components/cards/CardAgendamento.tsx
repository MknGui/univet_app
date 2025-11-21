import { Calendar, Clock, User } from 'lucide-react';
import { Appointment } from '@/data/mockData';

interface CardAgendamentoProps {
  appointment: Appointment;
  onClick: () => void;
  showTutor?: boolean;
}

export const CardAgendamento = ({ appointment, onClick, showTutor = false }: CardAgendamentoProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'bg-success/10 text-success',
          label: 'Confirmado',
        };
      case 'pending':
        return {
          color: 'bg-warning/10 text-warning',
          label: 'Pendente',
        };
      case 'cancelled':
        return {
          color: 'bg-muted text-muted-foreground',
          label: 'Cancelado',
        };
      case 'completed':
        return {
          color: 'bg-primary/10 text-primary',
          label: 'Concluído',
        };
      default:
        return {
          color: 'bg-muted text-muted-foreground',
          label: status,
        };
    }
  };

  const config = getStatusConfig(appointment.status);

  return (
    <button
      onClick={onClick}
      className="w-full mobile-card hover:shadow-lg transition-all active:scale-95"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold truncate">{appointment.animalName}</h3>
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${config.color}`}>
              {config.label}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">{appointment.type}</p>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{appointment.time}</span>
            </div>
          </div>
          
          {showTutor ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>Tutor: {appointment.tutorName}</span>
            </div>
          ) : (
            appointment.vetName && (
              <p className="text-xs text-muted-foreground">
                Com {appointment.vetName}
              </p>
            )
          )}
        </div>
      </div>
    </button>
  );
};
