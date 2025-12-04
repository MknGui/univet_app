import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MobileLayout } from "@/components/MobileLayout";
import {
  Stethoscope,
  Calendar,
  ClipboardList,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CardAgendamento,
  type AppointmentCard,
  type AppointmentCardStatus,
} from "@/components/cards/CardAgendamento";

import {
  listAppointments,
  type Appointment as ApiAppointment,
} from "@/api/appointments";
import {
  listConsultations,
  type Consultation,
} from "@/api/consultations";
import { listNotifications } from "@/api/notifications";

const mapStatus = (
  apiStatus: ApiAppointment["status"]
): AppointmentCardStatus => {
  switch (apiStatus) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
      return "confirmed";
    case "CANCELLED":
      return "cancelled";
    case "COMPLETED":
      return "completed";
    default:
      return "pending";
  }
};

const mapApiToCard = (appt: ApiAppointment): AppointmentCard => {
  const dt = new Date(appt.scheduled_at);

  const date = dt.toISOString();
  const time = dt.toTimeString().slice(0, 5);

  return {
    id: String(appt.id),

    animalId: String(appt.pet_id),
    animalName: (appt as any).pet_name ?? `Pet ${appt.pet_id}`,

    tutorId: String(appt.tutor_id),
    tutorName: (appt as any).tutor_name ?? `Tutor #${appt.tutor_id}`,

    vetId: appt.vet_id ? String(appt.vet_id) : undefined,
    vetName:
      (appt as any).vet_name ??
      (appt.vet_id ? `Vet #${appt.vet_id}` : undefined),

    date,
    time,
    status: mapStatus(appt.status),
    type: appt.reason || "Consulta",
  };
};

const VetDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentCard[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // Agenda do vet
        const appts = await listAppointments("vet");
        const mapped = appts.map(mapApiToCard);
        setAppointments(mapped);

        // Consultas clínicas registradas
        const consults = await listConsultations();
        setConsultations(consults);

        // Notificações não lidas
        const notifs = await listNotifications();
        setUnreadNotifications(notifs.filter((n) => !n.read).length);
      } catch (error) {
        console.error("Erro ao carregar dashboard do vet", error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  // Referência para o dia de hoje (zerando hora)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Agenda de hoje (apenas pelo dia, como já estava)
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime();
  });

  // Consultas pendentes:
  // próximas consultas que ainda não foram realizadas nem canceladas,
  // incluindo hoje (PENDING ou CONFIRMED a partir de hoje).
  const pendingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);

    const isTodayOrFuture = aptDate.getTime() >= today.getTime();
    const isPendingStatus =
      apt.status === "pending" || apt.status === "confirmed";

    return isTodayOrFuture && isPendingStatus;
  });

  // Total de consultas com diagnóstico
  const consultationsWithDiagnosis = consultations.filter(
    (c) => c.diagnosis && c.diagnosis.trim() !== ""
  ).length;

  return (
    <MobileLayout>
      <div className="gradient-hero pb-8">
        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Bem-vindo(a),</p>
              <h1 className="text-2xl font-bold text-foreground">
                {user?.name}
              </h1>
              {user?.crmv && (
                <p className="text-sm text-primary font-medium mt-1">
                  {user.crmv}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
              onClick={() => navigate("/vet/notifications")}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                icon: Stethoscope,
                label: "Registrar Consulta",
                description: "Nova consulta",
                path: "/vet/consultation/new",
                color: "bg-blue-500/10 text-blue-600",
              },
              {
                icon: ClipboardList,
                label: "Minhas Consultas",
                description: "Histórico",
                path: "/vet/consultations",
                color: "bg-green-500/10 text-green-600",
              },
              {
                icon: Calendar,
                label: "Agenda",
                description: "Ver horários",
                path: "/vet/appointments",
                color: "bg-purple-500/10 text-purple-600",
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="mobile-card text-left hover:shadow-lg transition-all active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{action.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Agenda de Hoje</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/vet/appointments")}
            className="text-primary"
          >
            Ver todas
          </Button>
        </div>

        {loading ? (
          <div className="mobile-card text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Carregando agenda de hoje...
            </p>
          </div>
        ) : todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <CardAgendamento
                key={appointment.id}
                appointment={appointment}
                onClick={() =>
                  navigate(`/vet/appointment/${appointment.id}`)
                }
                showTutor={true}
              />
            ))}
          </div>
        ) : (
          <div className="mobile-card text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma consulta agendada para hoje
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {/* Consultas pendentes: próximas não realizadas nem canceladas, incluindo hoje */}
          <div className="mobile-card text-center">
            <Stethoscope className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {pendingAppointments.length}
            </p>
            <p className="text-xs text-muted-foreground">
              Consultas pendentes
            </p>
          </div>

          {/* Hoje: apenas hoje, como já estava */}
          <div className="mobile-card text-center">
            <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {todayAppointments.length}
            </p>
            <p className="text-xs text-muted-foreground">Hoje</p>
          </div>

          {/* Concluídas: total de consultas com diagnóstico */}
          <div className="mobile-card text-center">
            <ClipboardList className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {consultationsWithDiagnosis}
            </p>
            <p className="text-xs text-muted-foreground">Concluídas</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default VetDashboard;
