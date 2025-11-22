import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Stethoscope, Activity, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { listPets } from '@/api/pets';

interface HistoryItem {
  id: string;
  type: 'consultation' | 'triage' | 'vaccine';
  date: string;
  title: string;
  description: string;
  vet?: string;
}

const AnimalHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        toast.error('Animal não encontrado');
        navigate('/tutor/animals');
        return;
      }

      try {
        const pets = await listPets();
        const pet = pets.find((p) => String(p.id) === id);

        if (!pet) {
          toast.error('Animal não encontrado');
          navigate('/tutor/animals');
          return;
        }

        setAnimal(pet);

        // Mock history data (MVP)
        const mockHistory: HistoryItem[] = [
          {
            id: '1',
            type: 'consultation',
            date: '2025-10-15',
            title: 'Consulta de rotina',
            description: 'Avaliação geral, animal saudável. Peso: 28kg',
            vet: 'Dra. Maria Santos',
          },
          {
            id: '2',
            type: 'vaccine',
            date: '2025-09-10',
            title: 'Vacinação V10',
            description: 'Aplicada vacina polivalente V10',
            vet: 'Dr. João Silva',
          },
          {
            id: '3',
            type: 'triage',
            date: '2025-08-20',
            title: 'Triagem - Vômito',
            description: 'Sugestão: Observar por 24h. Manter hidratação.',
          },
        ];

        setHistory(mockHistory);
      } catch (error) {
        console.error(error);
        toast.error('Erro ao carregar histórico');
        navigate('/tutor/animals');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return Stethoscope;
      case 'triage':
        return Activity;
      case 'vaccine':
        return FileText;
      default:
        return Calendar;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consulta';
      case 'triage':
        return 'Triagem';
      case 'vaccine':
        return 'Vacinação';
      default:
        return type;
    }
  };

  if (loading || !animal) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader title="Histórico" showBack />
        <div className="px-6 py-6">
          <div className="mobile-card text-center py-12">
            <p className="text-sm text-muted-foreground">Carregando histórico...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title={`Histórico - ${animal.name}`} showBack />

      <div className="px-6 py-6">
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => {
              const Icon = getIcon(item.type);
              return (
                <div key={item.id} className="mobile-card">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {getTypeLabel(item.type)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description}
                      </p>

                      {item.vet && (
                        <p className="text-xs text-muted-foreground">
                          {item.vet}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mobile-card text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">Nenhum registro</h3>
            <p className="text-sm text-muted-foreground">
              O histórico aparecerá aqui conforme as consultas forem registradas
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default AnimalHistory;