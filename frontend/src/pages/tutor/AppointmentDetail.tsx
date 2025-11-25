// src/pages/tutor/AppointmentDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Stethoscope,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Appointment,
  AppointmentStatus,
  getAppointment,
  cancelAppointment,
} from "@/api/appointments";

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
};

const statusClasses: Record<AppointmentStatus, string> = {
  PENDING:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  CONFIRMED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
};

// Componente helper para exibir Nome + #id no padrão desejado
function NameWithId({
  label,
  name,
  id,
}: {
  label: string;
  name?: string | null;
  id: number;
}) {
  return (
    <div>
      <p className="font-medium">{label}</p>
      <p className="text-xs">
        <span className="font-semibold text-foreground">
          {name || `ID ${id}`}
        </span>{" "}
        <span className="text-muted-foreground">#{id}</span>
      </p>
    </div>
  );
}

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      toast.error("Consulta não encontrada");
      navigate("/tutor/dashboard");
      return;
    }

    const load = async () => {
      try {
        const data = await getAppointment(Number(id));
        setAppointment(data);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar consulta");
        navigate("/tutor/dashboard");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!appointment) return;

    if (appointment.status === "CANCELLED") {
      toast.info("Essa consulta já está cancelada.");
      return;
    }

    if (appointment.status === "COMPLETED") {
      toast.info("Não é possível cancelar uma consulta já concluída.");
      return;
    }

    try {
      setCancelLoading(true);
      const updated = await cancelAppointment(appointment.id);
      setAppointment(updated);
      toast.success("Consulta cancelada com sucesso.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cancelar a consulta.");
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDateTime = (iso: string | null | undefined) => {
    if (!iso) return null;
    const date = new Date(iso);
    const datePart = date.toLocaleDateString("pt-BR");
    const timePart = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} às ${timePart}`;
  };

  if (loading || !appointment) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader title="Detalhes da Consulta" showBack />
        <div className="px-6 py-6">
          <div className="mobile-card text-center py-12">
            <p className="text-sm text-muted-foreground">
              Carregando detalhes da consulta.
            </p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const scheduled = formatDateTime(appointment.scheduled_at);
  const createdAt = appointment.created_at
    ? new Date(appointment.created_at).toLocaleDateString("pt-BR")
    : null;

  const statusLabel = statusLabels[appointment.status];
  const statusClass = statusClasses[appointment.status];

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Detalhes da Consulta" showBack />

      <div className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="mobile-card text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-xl font-bold mb-1">
            Consulta {appointment.id}
          </h2>

          {/* Subtítulo com paciente */}
          {appointment.pet_name && (
            <p className="text-sm mb-1">
              Paciente{" "}
              <span className="font-semibold text-foreground">
                {appointment.pet_name}
              </span>{" "}
              <span className="text-muted-foreground">
                #{appointment.pet_id}
              </span>
            </p>
          )}

          {scheduled && (
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              {scheduled}
            </p>
          )}

          <div className="mt-3 flex items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
            >
              {appointment.status === "CONFIRMED" && (
                <CheckCircle2 className="w-3 h-3" />
              )}
              {appointment.status === "PENDING" && (
                <AlertTriangle className="w-3 h-3" />
              )}
              {appointment.status === "CANCELLED" && (
                <XCircle className="w-3 h-3" />
              )}
              <span>{statusLabel}</span>
            </span>
          </div>
        </div>

        {/* Info básica */}
        <div className="mobile-card space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Motivo da consulta</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {appointment.reason || "Nenhum motivo informado."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mt-2">
            <NameWithId
              label="Paciente"
              name={appointment.pet_name}
              id={appointment.pet_id}
            />

            <NameWithId
              label="Tutor"
              name={appointment.tutor_name}
              id={appointment.tutor_id}
            />

            <NameWithId
              label="Veterinário"
              name={appointment.vet_name}
              id={appointment.vet_id}
            />

            {createdAt && (
              <div>
                <p className="font-medium">Criada em</p>
                <p className="text-xs text-muted-foreground">{createdAt}</p>
              </div>
            )}

          </div>
        </div>

        {/* Aviso para consultas pendentes */}
        {appointment.status === "PENDING" && (
          <div className="mobile-card bg-amber-50 border border-amber-100 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4" />
              <span>Importante</span>
            </div>
            <p>
              Caso não possa comparecer, cancele a consulta com antecedência
              para liberar o horário do veterinário.
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>

          <Button
            variant="destructive"
            className="w-full"
            disabled={cancelLoading}
            onClick={handleCancel}
          >
            {cancelLoading ? "Cancelando..." : "Cancelar consulta"}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default AppointmentDetail;
