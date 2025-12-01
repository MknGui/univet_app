import { Calendar, Stethoscope, User } from "lucide-react";
import { Consultation } from "@/data/mockData";

interface CardConsultaProps {
  consultation: Consultation;
  onClick: () => void;
  showTutor?: boolean;
}

export const CardConsulta = ({
  consultation,
  onClick,
  showTutor = true,
}: CardConsultaProps) => {
  // usamos any para aceitar campos extras vindos da API
  const c: any = consultation;

  const status: string = c.status || "completed";

  const getStatusColor = (s: string) => {
    switch (s) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "scheduled":
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border border-rose-100";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case "completed":
        return "Concluída";
      case "scheduled":
      case "pending":
        return "Pend. diagnóstico";
      case "cancelled":
        return "Cancelada";
      default:
        return s;
    }
  };

  const petName: string =
    c.animalName || c.petName || c.pet_name || `Pet #${c.pet_id ?? ""}`;

  const petId: string | undefined =
    c.petId != null
      ? String(c.petId)
      : c.animalId != null
      ? String(c.animalId)
      : c.pet_id != null
      ? String(c.pet_id)
      : undefined;

  const tutorName: string | undefined =
    c.tutorName || c.tutor_name || (c.tutor_id ? `Tutor #${c.tutor_id}` : "");

  const tutorId: string | undefined =
    c.tutorId != null
      ? String(c.tutorId)
      : c.tutor_id != null
      ? String(c.tutor_id)
      : undefined;

  const vetName: string | undefined =
    c.vetName || c.vet_name || (c.vet_id ? `Vet #${c.vet_id}` : "");

  const vetId: string | undefined =
    c.vetId != null
      ? String(c.vetId)
      : c.vet_id != null
      ? String(c.vet_id)
      : undefined;

  const isPendingDiagnosis = status === "scheduled" || status === "pending";

  const diagnosisText = isPendingDiagnosis
    ? "Aguardando diagnóstico do médico"
    : (c.diagnosis && String(c.diagnosis).trim()) ||
      "Diagnóstico não informado";

  const formattedDate = c.date
    ? new Date(c.date).toLocaleDateString("pt-BR")
    : "";

  const timeText = c.time || "";

  return (
    <button
      onClick={onClick}
      className="w-full text-left mobile-card hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="flex items-start gap-4">
        {/* Ícone */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-6 h-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Cabeçalho: pet + status */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1 min-w-0">
                <span className="font-semibold text-foreground truncate">
                  {petName}
                </span>
                {petId && (
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">
                    #{petId}
                  </span>
                )}
              </div>
            </div>

            <span
              className={`text-[11px] px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(
                status
              )}`}
            >
              {getStatusLabel(status)}
            </span>
          </div>

          {/* Diagnóstico / pendência */}
          <p
            className={`text-sm mb-2 ${
              isPendingDiagnosis
                ? "text-amber-700"
                : "text-foreground font-medium"
            }`}
          >
            {diagnosisText}
          </p>

          {/* Data e hora */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Calendar className="w-3 h-3" />
            {formattedDate && <span>{formattedDate}</span>}
            {timeText && (
              <>
                <span>•</span>
                <span>{timeText}</span>
              </>
            )}
          </div>

          {/* Tutor ou vet, conforme flag */}
          {showTutor && tutorName && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span className="truncate">
                Tutor:{" "}
                <span className="font-medium text-foreground">
                  {tutorName}
                </span>
                {tutorId && (
                  <span className="text-[10px] text-muted-foreground ml-1">
                    #{tutorId}
                  </span>
                )}
              </span>
            </div>
          )}

          {!showTutor && vetName && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span className="truncate">
                Dr(a):{" "}
                <span className="font-medium text-foreground">
                  {vetName}
                </span>
                {vetId && (
                  <span className="text-[10px] text-muted-foreground ml-1">
                    #{vetId}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
