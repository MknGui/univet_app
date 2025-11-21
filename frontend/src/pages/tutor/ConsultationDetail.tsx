import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { FileText, Calendar as CalendarIcon, User, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { mockConsultations } from '@/data/mockData';

const ConsultationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState<any>(null);

  useEffect(() => {
    const found = mockConsultations.find(c => c.id === id);
    
    if (!found) {
      toast.error('Consulta não encontrada');
      navigate('/tutor/dashboard');
      return;
    }
    
    setConsultation(found);
  }, [id, navigate]);

  if (!consultation) {
    return null;
  }

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Detalhes da Consulta" showBack />

      <div className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="mobile-card text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-1">{consultation.animal}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(consultation.date).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Veterinarian */}
        <div className="mobile-card">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Veterinário(a)</p>
              <p className="font-semibold">Dr(a). Veterinário</p>
            </div>
          </div>
        </div>

        {/* Consultation Description */}
        <div className="mobile-card">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Descrição da Consulta</h3>
          </div>
          <p className="text-sm leading-relaxed">{consultation.diagnosis}</p>
        </div>

        {/* Treatment */}
        <div className="mobile-card">
          <h3 className="font-semibold mb-3">Tratamento Prescrito</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {consultation.treatment}
          </p>
        </div>

        {/* Observations */}
        {consultation.observations && (
          <div className="mobile-card">
            <h3 className="font-semibold mb-3">Observações</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {consultation.observations}
            </p>
          </div>
        )}

        {/* Next Visit */}
        {consultation.nextVisit && (
          <div className="mobile-card bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3 mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold">Próxima Consulta Recomendada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(consultation.nextVisit).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/tutor/appointment/new', {
                state: { 
                  animalId: consultation.animalId,
                  suggestedDate: consultation.nextVisit
                }
              })}
              className="w-full gradient-primary"
            >
              Agendar Nova Consulta
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default ConsultationDetail;
