import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Calendar, Stethoscope, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Consultation {
  id: string;
  animalName: string;
  date: string;
  diagnosis: string;
  treatment: string;
  observations?: string;
  nextVisit?: string;
  createdAt: string;
}

const ConsultationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState<Consultation | null>(null);

  useEffect(() => {
    const consultations = JSON.parse(localStorage.getItem('univet_consultations') || '[]');
    const found = consultations.find((c: Consultation) => c.id === id);
    
    if (!found) {
      toast.error('Consulta não encontrada');
      navigate('/vet/consultations');
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
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">{consultation.animalName}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(consultation.date).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mobile-card space-y-3">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Stethoscope className="w-5 h-5" />
            <h3 className="font-semibold">Diagnóstico</h3>
          </div>
          <p className="text-sm leading-relaxed">{consultation.diagnosis}</p>
        </div>

        {/* Treatment */}
        <div className="mobile-card space-y-3">
          <div className="flex items-center gap-2 text-primary mb-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Conduta/Tratamento</h3>
          </div>
          <p className="text-sm leading-relaxed">{consultation.treatment}</p>
        </div>

        {/* Observations */}
        {consultation.observations && (
          <div className="mobile-card space-y-3">
            <h3 className="font-semibold text-sm">Observações</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {consultation.observations}
            </p>
          </div>
        )}

        {/* Next Visit */}
        {consultation.nextVisit && (
          <div className="mobile-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Próxima Visita</p>
                <p className="font-semibold">
                  {new Date(consultation.nextVisit).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default ConsultationDetail;
