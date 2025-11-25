import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MobileLayout } from "@/components/MobileLayout";
import { Activity, Calendar, Heart, BookOpen, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardAgendamento } from "@/components/cards/CardAgendamento";

// Tipo que o CardAgendamento espera (mesmo do Appointments.tsx)
import type { Appointment as UIAppointment } from "@/data/mockData";

// Tipo da API real
import {
  listAppointments,
  type Appointment as ApiAppointment,
} from "@/api/appointments";
import { listPets, type Pet } from "@/api/pets";
import {
  listNotifications,
  type Notification as ApiNotification,
} from "@/api/notifications";

// Mapeia status da API (PENDING/CONFIRMED/CANCELLED/COMPLETED)
// para o status que o CardAgendamento espera (pending/confirmed/cancelled/completed)
const mapStatus = (
  apiStatus: ApiAppointment["status"]
): UIAppointment["status"] => {
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

// Converte o Appointment da API para o Appointment usado no CardAgendamento
const mapApiToUi = (appt: ApiAppointment): UIAppointment => {
  const dt = new Date(appt.scheduled_at);

  const date = dt.toISOString(); // CardAgendamento usa new Date(appointment.date)
  const time = dt.toTimeString().slice(0, 5); // HH:MM

  return {
    id: String(appt.id),

    animalId: String(appt.pet_id),
    // nome em preto no card, #id em cinza – aqui vai só o nome
    animalName: (appt as any).pet_name ?? `Pet ${appt.pet_id}`,

    tutorId: String(appt.tutor_id),
    tutorName: `Tutor #${appt.tutor_id}`,

    vetId: String(appt.vet_id),
    vetName: `Vet #${appt.vet_id}`,

    date,
    time,
    status: mapStatus(appt.status),

    // usa o motivo como tipo, com fallback "Consulta"
    type: appt.reason || "Consulta",
  };
};

const TutorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<UIAppointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const quickActions = [
    {
      icon: Activity,
      label: "Meus Animais",
      description: "Ver e gerenciar",
      path: "/tutor/animals",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: Calendar,
      label: "Agendamentos",
      description: "Marcar consulta",
      path: "/tutor/appointments",
      color: "bg-green-500/10 text-green-600",
    },
    {
      icon: Heart,
      label: "Triagem Rápida",
      description: "Avaliar sinais",
      path: "/tutor/triage",
      color: "bg-red-500/10 text-red-600",
    },
    {
      icon: BookOpen,
      label: "Conteúdos",
      description: "Aprenda mais",
      path: "/tutor/education",
      color: "bg-purple-500/10 text-purple-600",
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [apiAppointments, petsData, notifications] = await Promise.all([
          listAppointments(),
          listPets(),
          listNotifications(),
        ]);

        const mappedAppointments = apiAppointments.map(mapApiToUi);
        setAppointments(mappedAppointments);
        setPets(petsData);

        // conta quantas não estão lidas
        const unread = (notifications as ApiNotification[]).filter(
          (n) => !n.read
        ).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  // Calcula próximas consultas:
  // - data >= hoje
  // - status diferente de completed e cancelled (não conta cancelado como próxima)
  // - mostra no máximo 2
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments
    .filter((apt) => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);

      const isFutureOrToday = aptDate >= today;
      const isActive =
        apt.status !== "completed" && apt.status !== "cancelled";

      return isFutureOrToday && isActive;
    })
    .slice(0, 2);

  const totalConsultations = appointments.length;

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
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
              onClick={() => navigate("/tutor/notifications")}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="mobile-card text-left hover:shadow-lg transition-all active:scale-95"
                >
                  <div
                    className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center mb-3`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">
                    {action.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Próximas Consultas */}
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Próximas Consultas</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tutor/appointments")}
            className="text-primary"
          >
            Ver todas
          </Button>
        </div>

        {loading ? (
          <div className="mobile-card text-center py-8">
            <p className="text-sm text-muted-foreground">
              Carregando consultas...
            </p>
          </div>
        ) : upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <CardAgendamento
                key={appointment.id}
                appointment={appointment}
                onClick={() =>
                  navigate(`/tutor/appointment/${appointment.id}`)
                }
              />
            ))}
          </div>
        ) : (
          <div className="mobile-card text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              Nenhuma consulta agendada
            </p>
            <Button
              onClick={() => navigate("/tutor/appointment/new")}
              size="sm"
              className="gradient-primary"
            >
              Agendar Consulta
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="mobile-card text-center">
            <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {loading ? "..." : pets.length}
            </p>
            <p className="text-xs text-muted-foreground">Animais</p>
          </div>
          <div className="mobile-card text-center">
            <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {loading ? "..." : upcomingAppointments.length}
            </p>
            <p className="text-xs text-muted-foreground">Próximas</p>
          </div>
          <div className="mobile-card text-center">
            <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {loading ? "..." : totalConsultations}
            </p>
            <p className="text-xs text-muted-foreground">Consultas</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default TutorDashboard;
