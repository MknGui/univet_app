import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, PawPrint, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  getAppointment,
  cancelAppointment,
  type Appointment,
} from "@/api/appointments";
import { getPet, type Pet } from "@/api/pets";

const VetAppointmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // id vem como string da URL, a API espera number
        const appt = await getAppointment(Number(id));
        setAppointment(appt);

        // carrega o pet associado
        try {
          const petData = await getPet(appt.pet_id);
          setPet(petData);
        } catch (err) {
          console.error("Erro ao carregar pet", err);
        }
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.message || "Não foi possível carregar o agendamento"
        );
        navigate("/vet/appointments");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!appointment) return;

    const confirmed = window.confirm(
      "Tem certeza que deseja cancelar este agendamento?"
    );
    if (!confirmed) return;

    try {
      setCancelling(true);
      const updated = await cancelAppointment(appointment.id);
      setAppointment(updated);
      toast.success("Agendamento cancelado com sucesso");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Erro ao cancelar agendamento");
    } finally {
      setCancelling(false);
    }
  };

  const handleRegisterConsultation = () => {
    if (!appointment) return;
    // Fluxo para registrar consulta a partir deste agendamento
    // ConsultaNew está em /vet/consultation/new
    // Enviamos o appointmentId na query para no futuro pré-preencher
    navigate(`/vet/consultation/new?appointmentId=${appointment.id}`);
  };

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStatusBadge = () => {
    if (!appointment) return null;

    const status = appointment.status;

    let label = "";
    let classes = "px-2 py-1 rounded-full text-xs font-medium ";

    switch (status) {
      case "PENDING":
        label = "Pendente";
        classes += "bg-yellow-100 text-yellow-800";
        break;
      case "CONFIRMED":
        label = "Confirmado";
        classes += "bg-blue-100 text-blue-800";
        break;
      case "CANCELLED":
        label = "Cancelado";
        classes += "bg-red-100 text-red-800";
        break;
      case "COMPLETED":
        label = "Concluído";
        classes += "bg-green-100 text-green-800";
        break;
      default:
        label = status;
        classes += "bg-muted text-muted-foreground";
        break;
    }

    return <span className={classes}>{label}</span>;
  };

  const petAgeLabel =
    pet?.age != null
      ? `${pet.age} ano${pet.age === 1 ? "" : "s"}`
      : "Idade não informada";

  const petBreedLabel =
    pet?.breeds && pet.breeds.length > 0
      ? pet.breeds.join(", ")
      : "Raça não informada";

  const appointmentReason =
    appointment?.reason && appointment.reason.trim().length > 0
      ? appointment.reason
      : "Nenhum motivo informado";

  const canCancel =
    appointment &&
    appointment.status !== "CANCELLED" &&
    appointment.status !== "COMPLETED";

  const canRegisterConsultation =
    appointment &&
    (appointment.status === "PENDING" || appointment.status === "CONFIRMED");

  return (
    <MobileLayout>
      <MobileHeader title="Detalhes do Agendamento" showBack />

      <div className="px-6 py-6 space-y-4">
        {loading ? (
          <div className="mobile-card py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Carregando detalhes do agendamento...
            </p>
          </div>
        ) : !appointment ? (
          <div className="mobile-card py-10 text-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Agendamento não encontrado.
            </p>
          </div>
        ) : (
          <>
            {/* Bloco principal do agendamento */}
            <div className="mobile-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold mb-1">
                    {appointment.pet_name ?? `Pet #${appointment.pet_id}`}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tutor:{" "}
                    {appointment.tutor_name ?? `Tutor #${appointment.tutor_id}`}
                  </p>
                </div>
                {renderStatusBadge()}
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDateTime(appointment.scheduled_at)}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatTime(appointment.scheduled_at)}</span>
              </div>

              <div className="mt-2">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Motivo da consulta
                </p>
                <p className="text-sm">{appointmentReason}</p>
              </div>
            </div>

            {/* Bloco do Pet */}
            <div className="mobile-card space-y-2">
              <div className="flex items-center gap-3 mb-1">
                <PawPrint className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold">Dados do Pet</h3>
              </div>

              {pet ? (
                <>
                  <div>
                    <p className="text-sm font-medium">{pet.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pet.species ?? "Espécie não informada"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{petBreedLabel}</span>
                    <span>•</span>
                    <span>{petAgeLabel}</span>
                    {pet.sex && (
                      <>
                        <span>•</span>
                        <span>
                          {pet.sex === "male"
                            ? "Macho"
                            : pet.sex === "female"
                            ? "Fêmea"
                            : pet.sex}
                        </span>
                      </>
                    )}
                  </div>

                  {pet.notes && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Observações do pet
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {pet.notes}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Não foi possível carregar os dados completos do pet.
                </p>
              )}
            </div>

            {/* Bloco do tutor */}
            <div className="mobile-card space-y-2">
              <div className="flex items-center gap-3 mb-1">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold">Tutor</h3>
              </div>
              <p className="text-sm font-medium">
                {appointment.tutor_name ?? `Tutor #${appointment.tutor_id}`}
              </p>
            </div>

            {/* Ações */}
            <div className="space-y-2">
              {canRegisterConsultation && (
                <Button
                  className="w-full h-11 gradient-primary"
                  onClick={handleRegisterConsultation}
                >
                  Registrar consulta
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="destructive"
                  className="w-full h-11"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelando..." : "Cancelar agendamento"}
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => navigate("/vet/appointments")}
              >
                Voltar para agenda
              </Button>
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
};

export default VetAppointmentDetail;
