import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, FileText, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Appointment {
  id: string;
  animal: string;
  date: string;
  time: string;
  vet: string;
  type: string;
  status: 'pending' | 'confirmed' | 'completed';
  location: string;
  notes?: string;
}

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    // Mock data
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        animal: 'Thor',
        date: '2025-11-05',
        time: '14:30',
        vet: 'Dra. Maria Santos',
        type: 'Consulta de rotina',
        status: 'confirmed',
        location: 'Clínica Veterinária Centro',
        notes: 'Consulta de rotina para avaliação geral'
      },
      {
        id: '2',
        animal: 'Luna',
        date: '2025-10-28',
        time: '10:00',
        vet: 'Dr. João Silva',
        type: 'Vacinação',
        status: 'completed',
        location: 'Clínica Veterinária Norte'
      }
    ];

    const found = mockAppointments.find((a) => a.id === id);
    
    if (!found) {
      toast.error('Agendamento não encontrado');
      navigate('/tutor/appointments');
      return;
    }
    
    setAppointment(found);
  }, [id, navigate]);

  const handleCancel = () => {
    toast.success('Agendamento cancelado');
    navigate('/tutor/appointments');
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
        {/* Status */}
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
                <p className="text-xs text-muted-foreground">Veterinário(a)</p>
                <p className="font-semibold">{appointment.vet}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Local</p>
                <p className="font-semibold">{appointment.location}</p>
              </div>
            </div>
          </div>
        </div>

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
        {appointment.status === 'confirmed' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 text-destructive hover:bg-destructive/10 border-destructive/20"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar Agendamento
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Cancelar Agendamento
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </MobileLayout>
  );
};

export default AppointmentDetail;
