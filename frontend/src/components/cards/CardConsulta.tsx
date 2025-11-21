import { Stethoscope, Calendar, User } from 'lucide-react';
import { Consultation } from '@/data/mockData';

interface CardConsultaProps {
  consultation: Consultation;
  onClick: () => void;
  showTutor?: boolean;
}

export const CardConsulta = ({ consultation, onClick, showTutor = false }: CardConsultaProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'scheduled':
        return 'bg-primary/10 text-primary';
      case 'cancelled':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'scheduled':
        return 'Agendada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full mobile-card hover:shadow-lg transition-all active:scale-95"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{consultation.animalName}</h3>
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(consultation.status)}`}>
              {getStatusLabel(consultation.status)}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-1">
            {consultation.diagnosis !== 'Pendente' ? consultation.diagnosis : 'Aguardando atendimento'}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(consultation.date).toLocaleDateString('pt-BR')}</span>
            <span>•</span>
            <span>{consultation.time}</span>
          </div>
          
          {showTutor && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>Tutor: {consultation.tutorName}</span>
            </div>
          )}
          
          {!showTutor && (
            <p className="text-xs text-muted-foreground">
              Dr(a): {consultation.vetName}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};
