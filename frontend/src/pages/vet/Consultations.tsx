import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Plus, Stethoscope } from 'lucide-react';
import { CardConsulta } from '@/components/cards/CardConsulta';
import { mockConsultations } from '@/data/mockData';

const Consultations = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'completed' | 'scheduled'>('all');

  // Filter vet's consultations (assuming vetId = 'vet1')
  const vetConsultations = mockConsultations.filter(cons => cons.vetId === 'vet1');

  const filteredConsultations = vetConsultations.filter(cons => {
    if (filter === 'all') return true;
    return cons.status === filter;
  });

  return (
    <MobileLayout>
      <MobileHeader
        title="Minhas Consultas"
        action={
          <Button
            size="icon"
            onClick={() => navigate('/vet/consultation/new')}
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
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="flex-1"
          >
            Todas
          </Button>
          <Button
            variant={filter === 'scheduled' ? 'default' : 'outline'}
            onClick={() => setFilter('scheduled')}
            className="flex-1"
          >
            Agendadas
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
            className="flex-1"
          >
            Concluídas
          </Button>
        </div>

        {filteredConsultations.length > 0 ? (
          <div className="space-y-3">
            {filteredConsultations.map((consultation) => (
              <CardConsulta
                key={consultation.id}
                consultation={consultation}
                onClick={() => navigate(`/vet/consultation/${consultation.id}`)}
                showTutor={true}
              />
            ))}
          </div>
        ) : (
          <div className="mobile-card text-center py-12">
            <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma consulta registrada</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Registre sua primeira consulta
            </p>
            <Button
              onClick={() => navigate('/vet/consultation/new')}
              className="gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar Consulta
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Consultations;
