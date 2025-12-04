// src/pages/vet/Consultations.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Plus, Stethoscope } from "lucide-react";

import { CardConsulta } from "@/components/cards/CardConsulta";
import {
  CardAgendamento,
  type AppointmentCard,
  type AppointmentCardStatus,
} from "@/components/cards/CardAgendamento";

import {
  listConsultations,
  type Consultation as ApiConsultation,
} from "@/api/consultations";
import {
  listAppointments,
  type Appointment as ApiAppointment,
} from "@/api/appointments";

type Filter = "all" | "pending_diagnosis" | "completed";

type ConsultationStatus = "completed" | "scheduled" | "cancelled";

interface ConsultationCardModel {
  id: string;
  date: string;
  time: string;

  diagnosis: string;
  treatment: string;
  observations: string;

  animalId: string;
  animalName: string;

  tutorId: string;
  tutorName: string;
  vetId: string;
  vetName: string;

  status: ConsultationStatus;
  type?: string;
}

// Consulta da API no formato que o CardConsulta entende
const mapConsultationToCard = (c: ApiConsultation): ConsultationCardModel => {
  const dt = new Date(c.date);

  const date = dt.toISOString();
  const time = dt.toTimeString().slice(0, 5);

  return {
    id: String(c.id),
    date,
    time,
    diagnosis: c.diagnosis ?? "",
    treatment: c.treatment ?? "",
    observations: c.observations ?? "",
    animalId: String(c.pet_id),
    animalName: (c as any).pet_name ?? `Pet #${c.pet_id}`,
    tutorId: String(c.tutor_id),
    tutorName: (c as any).tutor_name ?? `Tutor #${c.tutor_id}`,
    vetId: String(c.vet_id),
    vetName: (c as any).vet_name ?? `Vet #${c.vet_id}`,
    status: "completed",
    type: "Consulta",
  };
};

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

// Appointment da API no formato que o CardAgendamento usa
const mapAppointmentToCard = (appt: ApiAppointment): AppointmentCard => {
  const dt = new Date(appt.scheduled_at);

  const date = dt.toISOString();
  const time = dt.toTimeString().slice(0, 5);

  return {
    id: String(appt.id),

    animalId: String(appt.pet_id),
    animalName: (appt as any).pet_name ?? `Pet #${appt.pet_id}`,

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

const Consultations = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState<Filter>("all");
  const [completedConsultations, setCompletedConsultations] = useState<
    ConsultationCardModel[]
  >([]);
  const [pendingAppointments, setPendingAppointments] = useState<
    AppointmentCard[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // carrega consultas (com diagnostico) e agendamentos do vet
        const [consultationsApi, appointmentsApi] = await Promise.all([
          listConsultations(),
          listAppointments("vet"),
        ]);

        const completed = consultationsApi.map(mapConsultationToCard);

        const now = new Date();

        // pendentes de diagnostico:
        // appointments que ja passaram do horario atual e nao estao cancelados
        const pending = appointmentsApi
          .filter((appt) => {
            const apptDateTime = new Date(appt.scheduled_at);
            const alreadyHappened = apptDateTime.getTime() < now.getTime();
            const notCancelled = appt.status !== "CANCELLED";
            return alreadyHappened && notCancelled;
          })
          .map((appt) => {
            const baseCard = mapAppointmentToCard(appt);
            return {
              ...baseCard,
              // aqui aparece no card como "Diagnóstico pendente"
              type: "Diagnóstico pendente",
            };
          });

        setCompletedConsultations(completed);
        setPendingAppointments(pending);
      } catch (error) {
        console.error("Erro ao carregar consultas", error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const hasAny =
    completedConsultations.length > 0 || pendingAppointments.length > 0;

  const renderPendingList = () => {
    if (pendingAppointments.length === 0) {
      return (
        <div className="mobile-card text-center py-8">
          <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            Nenhuma consulta pendente de diagnóstico.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {pendingAppointments
          .slice()
          .sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .map((appointment) => (
            <CardAgendamento
              key={appointment.id}
              appointment={appointment}
              onClick={() => {
                // vai para o detalhe do agendamento para completar diagnostico
                navigate(`/vet/appointment/${appointment.id}`);
              }}
              showTutor={true}
            />
          ))}
      </div>
    );
  };

  const renderCompletedList = () => {
    if (completedConsultations.length === 0) {
      return (
        <div className="mobile-card text-center py-8">
          <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            Nenhuma consulta com diagnóstico registrada.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {completedConsultations
          .slice()
          .sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .map((consultation) => (
            <CardConsulta
              key={consultation.id}
              // consulta ja vem com diagnostico, mapeada para o modelo do card
              // o "as any" aqui so serve para o TS nao encher o saco com o tipo do mock
              consultation={consultation as any}
              onClick={() =>
                navigate(`/vet/consultation/${consultation.id}`)
              }
              showTutor={true}
            />
          ))}
      </div>
    );
  };

  return (
    <MobileLayout>
      <MobileHeader
        title="Consultas"
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
        {/* Filtros */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="flex-1"
          >
            Todas
          </Button>

          <Button
            variant={filter === "pending_diagnosis" ? "default" : "outline"}
            onClick={() => setFilter("pending_diagnosis")}
            className="flex-1"
          >
            Pendentes de diagnóstico
          </Button>

          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
            className="flex-1"
          >
            Com diagnóstico
          </Button>
        </div>

        {loading ? (
          <div className="mobile-card text-center py-12">
            <p className="text-sm text-muted-foreground">
              Carregando consultas...
            </p>
          </div>
        ) : !hasAny ? (
          <div className="mobile-card text-center py-12">
            <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">
              Nenhuma consulta encontrada
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Não há consultas com diagnóstico ou pendentes de diagnóstico
              para exibir.
            </p>
            <Button
              onClick={() => navigate("/vet/consultation/new")}
              className="gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar nova consulta
            </Button>
          </div>
        ) : filter === "pending_diagnosis" ? (
          renderPendingList()
        ) : filter === "completed" ? (
          renderCompletedList()
        ) : (
          // filtro "Todas": mostra os dois blocos
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold mb-2">
                Pendentes de diagnóstico
              </h2>
              {renderPendingList()}
            </div>
            <div>
              <h2 className="text-sm font-semibold mb-2">
                Com diagnóstico
              </h2>
              {renderCompletedList()}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Consultations;
