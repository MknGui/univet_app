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
  const [filter, setFilter] = useState<"today" | "upcoming" | "pending">("today");
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

  // Base: só agendamentos em aberto (não cancelados e não concluídos)
  const openAppointments = appointments.filter(
    (apt) => apt.status !== "completed" && apt.status !== "cancelled"
  );

  const filteredAppointments = openAppointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);

    if (filter === "today") {
      return aptDate.getTime() === today.getTime();
    } else if (filter === "upcoming") {
      // só futuro
      return aptDate >= tomorrow;
    } else {
      // "pending": já passou da data, mas ainda está em aberto
      return aptDate < today;
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
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            className="flex-1"
          >
            Pendentes
          </Button>
        </div>

        {loading ? (
          <div className="mobile-card text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">
              Carregando agenda...
            </h3>
            <p className="text-sm text-muted-foreground">
              Buscando seus agendamentos em aberto
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
              {filter === "today" && "Nenhum agendamento em aberto hoje"}
              {filter === "upcoming" && "Nenhum agendamento futuro em aberto"}
              {filter === "pending" &&
                "Nenhum agendamento pendente de confirmação"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filter === "today" &&
                "Você não possui consultas em aberto para hoje"}
              {filter === "upcoming" &&
                "No momento não há consultas futuras em aberto"}
              {filter === "pending" &&
                "Nenhuma consulta passada ficou sem confirmação de realização"}
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default VetAppointments;
