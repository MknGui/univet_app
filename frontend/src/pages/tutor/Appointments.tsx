import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { CardAgendamento } from "@/components/cards/CardAgendamento";
import { toast } from "sonner";

// Tipo que o CardAgendamento espera (vem do mock)
import type { Appointment as UIAppointment } from "@/data/mockData";

// Tipo da API real + função para buscar no backend
import {
  listAppointments,
  type Appointment as ApiAppointment,
} from "@/api/appointments";

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

const mapApiToUi = (appt: ApiAppointment): UIAppointment => {
  const dt = new Date(appt.scheduled_at);

  const date = dt.toISOString();
  const time = dt.toTimeString().slice(0, 5); // HH:MM

  return {
    id: String(appt.id),

    animalId: String(appt.pet_id),
    animalName: appt.pet_name ?? `Pet ${appt.pet_id}`,

    tutorId: String(appt.tutor_id),
    // usa nome real do tutor se vier do back
    tutorName: appt.tutor_name ?? `Tutor #${appt.tutor_id}`,

    vetId: String(appt.vet_id),
    // AQUI é o ajuste: usa o nome real do vet
    vetName: appt.vet_name ?? undefined,

    date,
    time,
    status: mapStatus(appt.status),

    type: appt.reason || "Consulta",
  };
};

const Appointments = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [appointments, setAppointments] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const apiAppointments = await listAppointments(); // tutor logado
        const mapped = apiAppointments.map(mapApiToUi);
        setAppointments(mapped);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message ?? "Erro ao carregar agendamentos");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);

    if (filter === "upcoming") {
      // Próximas: data >= hoje, e não completed nem cancelled
      return (
        aptDate >= today &&
        apt.status !== "completed" &&
        apt.status !== "cancelled"
      );
    } else {
      // Anteriores: data < hoje ou completed ou cancelled
      return (
        aptDate < today ||
        apt.status === "completed" ||
        apt.status === "cancelled"
      );
    }
  });

  return (
    <MobileLayout>
      <MobileHeader
        title="Agendamentos"
        action={
          <Button
            size="icon"
            onClick={() => navigate("/tutor/appointment/new")}
            className="h-9 w-9 gradient-primary"
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-6 py-6 space-y-4">
        {/* Abas de filtro */}
        <div className="flex gap-2">
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            onClick={() => setFilter("upcoming")}
            className="flex-1"
          >
            Próximas
          </Button>
          <Button
            variant={filter === "past" ? "default" : "outline"}
            onClick={() => setFilter("past")}
            className="flex-1"
          >
            Anteriores
          </Button>
        </div>

        {loading && appointments.length === 0 && (
          <div className="mobile-card text-center py-12">
            <p className="text-sm text-muted-foreground">
              Carregando agendamentos...
            </p>
          </div>
        )}

        {!loading && filteredAppointments.length > 0 ? (
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => (
              <CardAgendamento
                key={appointment.id}
                appointment={appointment}
                onClick={() =>
                  navigate(`/tutor/appointment/${appointment.id}`)
                }
              />
            ))}
          </div>
        ) : !loading ? (
          <div className="mobile-card text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">
              {filter === "upcoming"
                ? "Nenhum agendamento futuro"
                : "Nenhum agendamento anterior"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {filter === "upcoming"
                ? "Agende sua primeira consulta veterinária"
                : "Você ainda não possui consultas anteriores"}
            </p>
            {filter === "upcoming" && (
              <Button
                onClick={() => navigate("/tutor/appointment/new")}
                className="gradient-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agendar Consulta
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </MobileLayout>
  );
};

export default Appointments;
