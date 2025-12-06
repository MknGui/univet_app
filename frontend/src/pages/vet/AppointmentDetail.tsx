import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, PawPrint, User, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  getAppointment,
  cancelAppointment,
  confirmAppointment,
  type Appointment,
} from "@/api/appointments";
import { getPet, type Pet } from "@/api/pets";
import {
  listConsultationsByPet,
  type Consultation,
} from "@/api/consultations";
import {
  getConsultationSummary,
  type ConsultationSummaryResponse,
} from "@/api/ai";

const VetAppointmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);

  // estados do resumo IA
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // carrega agendamento, pet e histórico
  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const appt = await getAppointment(Number(id));
        setAppointment(appt);

        // pet
        try {
          const petData = await getPet(appt.pet_id);
          setPet(petData);
        } catch (err) {
          console.error("Erro ao carregar pet", err);
        }

        // histórico de consultas
        try {
          setLoadingConsultations(true);
          const history = await listConsultationsByPet(appt.pet_id);
          setConsultations(history);
        } catch (err) {
          console.error("Erro ao carregar histórico de consultas", err);
        } finally {
          setLoadingConsultations(false);
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

  // carrega o resumo IA separado, depois que a tela já está carregada
  useEffect(() => {
    if (!appointment) {
      setSummary(null);
      return;
    }

    if (consultations.length === 0) {
      setSummary(null);
      return;
    }

    let cancelled = false;

    const loadSummary = async () => {
      try {
        setLoadingSummary(true);
        setSummaryError(null);

        const aiData: ConsultationSummaryResponse =
          await getConsultationSummary(appointment.pet_id);

        if (!cancelled) {
          setSummary(aiData.summary);
        }
      } catch (err) {
        console.error("Erro ao carregar resumo IA", err);
        if (!cancelled) {
          setSummaryError("Não foi possível gerar o resumo automático.");
        }
      } finally {
        if (!cancelled) {
          setLoadingSummary(false);
        }
      }
    };

    loadSummary();

    // se o componente desmontar, evita setState depois
    return () => {
      cancelled = true;
    };
  }, [appointment, consultations.length]);

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

  const handleConfirm = async () => {
    if (!appointment) return;

    const confirmed = window.confirm(
      "Deseja confirmar este agendamento com o tutor?"
    );
    if (!confirmed) return;

    try {
      setConfirming(true);
      const updated = await confirmAppointment(appointment.id);
      setAppointment(updated);
      toast.success("Consulta confirmada com sucesso");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Erro ao confirmar agendamento");
    } finally {
      setConfirming(false);
    }
  };

  const handleRegisterConsultation = () => {
    if (!appointment) return;
    navigate(`/vet/consultation/new?appointmentId=${appointment.id}`);
  };

  const formatConsultationDate = (value?: string | null) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
    let classes =
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ";

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

  const petSpeciesLabel =
    pet?.species === "cat"
      ? "Gato"
      : pet?.species === "dog"
      ? "Cachorro"
      : pet?.species || "Espécie não informada";

  const appointmentReason =
    appointment?.reason && appointment.reason.trim().length > 0
      ? appointment.reason
      : "Nenhum motivo informado";

  const canCancel =
    appointment &&
    appointment.status !== "CANCELLED" &&
    appointment.status !== "COMPLETED";

  const canRegisterConsultation =
    appointment && appointment.status === "CONFIRMED";

  const canConfirm = appointment && appointment.status === "PENDING";

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
                      {petSpeciesLabel}
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

            {/* Histórico de consultas do pet */}
            <div className="mobile-card space-y-2">
              <div className="flex items-center gap-3 mb-1">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold">
                  Histórico de consultas
                </h3>
              </div>

              {loadingConsultations ? (
                <p className="text-sm text-muted-foreground">
                  Carregando histórico...
                </p>
              ) : consultations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma consulta registrada para esse pet ainda.
                </p>
              ) : (
                <ul className="space-y-2">
                  {consultations.slice(0, 5).map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/vet/consultation/${c.id}`)}
                        className="w-full text-left rounded-xl px-3 py-2 bg-background hover:shadow-lg transition-all active:scale-95"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {formatConsultationDate(c.date)}
                          </span>
                          {c.vet_name && (
                            <span className="text-xs text-muted-foreground">
                              {c.vet_name}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {c.diagnosis || "Sem diagnóstico registrado"}
                        </p>

                        {c.next_visit && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Próximo retorno:{" "}
                            {formatConsultationDate(c.next_visit)}
                          </p>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Resumo inteligente (IA) carrega separado */}
            <div className="mobile-card space-y-2">
              <div className="flex items-center gap-3 mb-1">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold">
                  Resumo inteligente (IA)
                </h3>
              </div>

              {loadingSummary ? (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Gerando resumo automático...
                </p>
              ) : summaryError ? (
                <p className="text-sm text-red-500">{summaryError}</p>
              ) : summary ? (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {summary}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Não há dados suficientes para gerar um resumo automático.
                </p>
              )}
            </div>

            {/* Ações */}
            <div className="space-y-2">
              {canConfirm && (
                <Button
                  className="w-full h-11 gradient-primary"
                  onClick={handleConfirm}
                  disabled={confirming}
                >
                  {confirming ? "Confirmando..." : "Confirmar consulta"}
                </Button>
              )}

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
