import { AlertCircle, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { Triage } from '@/data/mockData';

interface CardTriagemProps {
  triage: Triage;
  onClick: () => void;
}

export const CardTriagem = ({ triage, onClick }: CardTriagemProps) => {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'urgent':
        return {
          icon: AlertCircle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          label: 'Urgente',
        };
      case 'monitor':
        return {
          icon: Clock,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          label: 'Monitorar',
        };
      case 'ok':
        return {
          icon: CheckCircle2,
          color: 'text-success',
          bgColor: 'bg-success/10',
          label: 'Normal',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: 'Desconhecido',
        };
    }
  };

  const config = getSeverityConfig(triage.severity);
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className="w-full mobile-card hover:shadow-lg transition-all active:scale-95"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{triage.animalName}</h3>
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${config.bgColor} ${config.color}`}>
              {config.label}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {triage.signs.join(', ')}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{new Date(triage.date).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </button>
  );
};
