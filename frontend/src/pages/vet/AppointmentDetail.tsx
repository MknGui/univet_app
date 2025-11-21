import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, Syringe, Activity, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { mockAnimals, getTriagesByAnimalId, getConsultationsByAnimalId, getVaccinesByAnimalId } from '@/data/mockData';

interface Appointment {
  id: string;
  animal: string;
  animalId: string;
  tutor: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'completed';
  notes?: string;
}

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [animalData, setAnimalData] = useState<any>(null);
  const [triages, setTriages] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [vaccines, setVaccines] = useState<any[]>([]);

  useEffect(() => {
    // Mock data
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        animal: 'Thor',
        animalId: 'animal1',
        tutor: 'João Silva',
        date: '2025-11-05',
        time: '14:30',
        type: 'Consulta de rotina',
        status: 'confirmed',
        notes: 'Animal apresenta bom estado geral'
      },
      {
        id: '2',
        animal: 'Luna',
        animalId: 'animal2',
        tutor: 'Maria Santos',
        date: '2025-11-05',
        time: '15:30',
        type: 'Vacinação',
        status: 'pending'
      }
    ];

    const found = mockAppointments.find((a) => a.id === id);
    
    if (!found) {
      toast.error('Agendamento não encontrado');
      navigate('/vet/appointments');
      return;
    }
    
    setAppointment(found);
    
    // Load animal data
    const animal = mockAnimals.find(a => a.id === found.animalId);
    setAnimalData(animal);
    
    // Load related data
    setTriages(getTriagesByAnimalId(found.animalId));
    setConsultations(getConsultationsByAnimalId(found.animalId));
    setVaccines(getVaccinesByAnimalId(found.animalId));
  }, [id, navigate]);

  const handleConfirm = () => {
    if (appointment) {
      setAppointment({ ...appointment, status: 'confirmed' });
      toast.success('Agendamento confirmado');
    }
  };

  const handleComplete = () => {
    toast.success('Redirecionando para registro de consulta');
    navigate('/vet/consultation/new');
  };

  if (!appointment) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'completed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Detalhes do Agendamento" showBack />

      <div className="px-6 py-6 space-y-6">
        {/* Status Badge */}
        <div className="flex justify-center">
          <span className={cn(
            "inline-block px-4 py-2 rounded-full border text-sm font-medium",
            getStatusBadge(appointment.status)
          )}>
            {getStatusLabel(appointment.status)}
          </span>
        </div>

        {/* Main Info */}
        <div className="mobile-card space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{appointment.animal}</h2>
              <p className="text-sm text-muted-foreground">{appointment.type}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Data e Hora</p>
                <p className="font-semibold">
                  {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tutor</p>
                <p className="font-semibold">{appointment.tutor}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Animal Details Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="triages">Triagens</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="vaccines">Vacinas</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <div className="mobile-card space-y-3">
              <h3 className="font-semibold mb-3">Perfil do Animal</h3>
              {animalData ? (
                <>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Espécie</span>
                    <span className="font-medium">
                      {animalData.species === 'dog' ? 'Cachorro' : 'Gato'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Raça</span>
                    <span className="font-medium">{animalData.breed}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Idade</span>
                    <span className="font-medium">{animalData.age}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Sexo</span>
                    <span className="font-medium">
                      {animalData.sex === 'male' ? 'Macho' : 'Fêmea'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Dados não disponíveis</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="triages" className="mt-4">
            <div className="mobile-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Triagens Realizadas
              </h3>
              {triages.length > 0 ? (
                <div className="space-y-3">
                  {triages.map((triage) => (
                    <div key={triage.id} className="border border-border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium">{triage.symptoms.join(', ')}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          triage.urgency === 'high' ? 'bg-red-500/10 text-red-500' :
                          triage.urgency === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-success/10 text-success'
                        }`}>
                          {triage.urgency === 'high' ? 'Urgente' : 
                           triage.urgency === 'medium' ? 'Atenção' : 'Normal'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(triage.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma triagem registrada
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="mobile-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Histórico de Consultas
              </h3>
              {consultations.length > 0 ? (
                <div className="space-y-3">
                  {consultations.map((consultation) => (
                    <div key={consultation.id} className="border border-border rounded-lg p-3">
                      <p className="font-medium mb-1">{consultation.diagnosis}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(consultation.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {consultation.treatment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma consulta anterior
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vaccines" className="mt-4">
            <div className="mobile-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Syringe className="w-5 h-5" />
                Carteira de Vacinação
              </h3>
              {vaccines.length > 0 ? (
                <div className="space-y-3">
                  {vaccines.map((vaccine) => (
                    <div key={vaccine.id} className="border border-border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{vaccine.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(vaccine.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Lote: {vaccine.lot}</p>
                      {vaccine.nextDose && (
                        <p className="text-xs text-primary mt-1">
                          Próxima dose: {new Date(vaccine.nextDose).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma vacina registrada
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Notes */}
        {appointment.notes && (
          <div className="mobile-card">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Observações</h3>
            </div>
            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
          </div>
        )}

        {/* Actions */}
        {appointment.status !== 'completed' && (
          <div className="space-y-3">
            {appointment.status === 'pending' && (
              <Button
                onClick={handleConfirm}
                className="w-full h-12 gradient-primary"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Agendamento
              </Button>
            )}

            {appointment.status === 'confirmed' && (
              <Button
                onClick={handleComplete}
                className="w-full h-12 gradient-primary"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Registrar Consulta
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full h-12 text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar Agendamento
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default AppointmentDetail;
