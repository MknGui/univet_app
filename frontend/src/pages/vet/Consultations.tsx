// src/pages/vet/Consultations.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Plus, Stethoscope } from "lucide-react";
import { CardConsulta } from "@/components/cards/CardConsulta";

// Mesmo tipo usado pelos cards de agendamento
import type { Appointment as UIAppointment } from "@/data/mockData";

// Tipo/serviço da API real
import {
  listAppointments,
  type Appointment as ApiAppointment,
} from "@/api/appointments";

// Mapeia status da API (PENDING/CONFIRMED/CANCELLED/COMPLETED)
// para o status usado nos cards (pending/confirmed/cancelled/completed)
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

// Converte o Appointment da API para o formato esperado pelo CardConsulta
const mapApiToUi = (appt: ApiAppointment): UIAppointment => {
  const dt = new Date(appt.scheduled_at);

  const date = dt.toISOString(); // cards usam new Date(appointment.date)
  const time = dt.toTimeString().slice(0, 5); // HH:MM

  return {
    id: String(appt.id),

    animalId: String(appt.pet_id),
    animalName: (appt as any).pet_name ?? `Pet ${appt.pet_id}`,

    tutorId: String(appt.tutor_id),
    tutorName: (appt as any).tutor_name ?? `Tutor #${appt.tutor_id}`,

    vetId: String(appt.vet_id),
    vetName: (appt as any).vet_name ?? `Vet #${appt.vet_id}`,

    date,
    time,
    status: mapStatus(appt.status),

    // usa o motivo como tipo, com fallback "Consulta"
    type: appt.reason || "Consulta",
  };
};

const Consultations = () => {
  const navigate = useNavigate();
  const [filter, setFilter] =
    useState<"all" | "completed" | "scheduled">("all");
  const [consultations, setConsultations] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // /appointments já retorna só as consultas do vet logado
        const data = await listAppointments();
        const mapped = data.map(mapApiToUi);
        setConsultations(mapped);
      } catch (error) {
        console.error("Erro ao carregar consultas do vet", error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredConsultations = consultations.filter((cons) => {
    if (filter === "all") return true;

    if (filter === "completed") {
      return cons.status === "completed";
    }

    if (filter === "scheduled") {
      // considera como "agendada" tudo que ainda não foi concluído nem cancelado
      return cons.status !== "completed" && cons.status !== "cancelled";
    }

    return true;
  });

  return (
    <MobileLayout>
      <MobileHeader
        title="Minhas Consultas"
        action={
          <Button
            size="icon"
            onClick={() => navigate("/vet/consultation/new")}
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
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="flex-1"
          >
            Todas
          </Button>
          <Button
            variant={filter === "scheduled" ? "default" : "outline"}
            onClick={() => setFilter("scheduled")}
            className="flex-1"
          >
            Agendadas
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
            className="flex-1"
          >
            Concluídas
          </Button>
        </div>

        {loading ? (
          <div className="mobile-card text-center py-12">
            <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">
              Carregando consultas...
            </h3>
            <p className="text-sm text-muted-foreground">
              Buscando suas consultas no sistema
            </p>
          </div>
        ) : filteredConsultations.length > 0 ? (
          <div className="space-y-3">
            {filteredConsultations.map((consultation) => (
              <CardConsulta
                key={consultation.id}
                consultation={consultation}
                onClick={() =>
                  navigate(`/vet/consultation/${consultation.id}`)
                }
                showTutor={true}
              />
            ))}
          </div>
        ) : (
          <div className="mobile-card text-center py-12">
            <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">
              Nenhuma consulta registrada
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Registre sua primeira consulta
            </p>
            <Button
              onClick={() => navigate("/vet/consultation/new")}
              className="gradient-primary"
            >
              Nova Consulta
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Consultations;
