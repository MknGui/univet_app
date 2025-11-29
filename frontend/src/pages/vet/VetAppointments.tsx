import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  CardAgendamento,
  type AppointmentCard,
  type AppointmentCardStatus,
} from "@/components/cards/CardAgendamento";

import {
  listAppointments,
  type Appointment as ApiAppointment,
} from "@/api/appointments";

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
    animalName: appt.pet_name ?? `Pet ${appt.pet_id}`,

    tutorId: String(appt.tutor_id),
    tutorName: appt.tutor_name ?? `Tutor #${appt.tutor_id}`,

    vetId: appt.vet_id ? String(appt.vet_id) : undefined,
    vetName: appt.vet_name ?? (appt.vet_id ? `Vet #${appt.vet_id}` : undefined),

    date,
    time,
    status: mapStatus(appt.status),
    type: appt.reason || "Consulta",
  };
};

const VetAppointments = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"today" | "upcoming" | "past">("today");
  const [appointments, setAppointments] = useState<AppointmentCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // /appointments?role=vet
        const data = await listAppointments("vet");
        const mapped = data.map(mapApiToCard);
        setAppointments(mapped);
      } catch (err) {
        console.error("Erro ao carregar consultas do vet", err);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);

    if (filter === "today") {
      return aptDate.getTime() === today.getTime();
    } else if (filter === "upcoming") {
      return aptDate >= tomorrow && apt.status !== "completed";
    } else {
      // past
      return aptDate < today || apt.status === "completed";
    }
  });

  return (
    <MobileLayout>
      <MobileHeader title="Agenda" />

      <div className="px-6 py-6 space-y-4">
        {/* Abas de filtro */}
        <div className="flex gap-2">
          <Button
            variant={filter === "today" ? "default" : "outline"}
            onClick={() => setFilter("today")}
            className="flex-1"
          >
            Hoje
          </Button>
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

        {loading ? (
          <div className="mobile-card text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">
              Carregando agenda...
            </h3>
            <p className="text-sm text-muted-foreground">
              Buscando seus agendamentos
            </p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => (
              <CardAgendamento
                key={appointment.id}
                appointment={appointment}
                onClick={() => navigate(`/vet/appointment/${appointment.id}`)}
                showTutor={true}
              />
            ))}
          </div>
        ) : (
          <div className="mobile-card text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">
              {filter === "today" && "Nenhum agendamento para hoje"}
              {filter === "upcoming" && "Nenhum agendamento futuro"}
              {filter === "past" && "Nenhum agendamento anterior"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filter === "today" &&
                "Você não possui consultas agendadas para hoje"}
              {filter === "upcoming" &&
                "Não há consultas futuras agendadas"}
              {filter === "past" &&
                "Você ainda não possui consultas anteriores"}
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default VetAppointments;
