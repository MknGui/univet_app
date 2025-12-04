import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import {
  Calendar,
  Stethoscope,
  FileText,
  Clock,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  getConsultation,
  type Consultation,
} from "@/api/consultations";

const ConsultationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState<Consultation | null>(
    null
  );

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        const data = await getConsultation(id);
        setConsultation(data);
      } catch (error) {
        console.error(error);
        toast.error("Consulta não encontrada");
        navigate("/vet/consultations");
      }
    };

    void load();
  }, [id, navigate]);

  if (!consultation) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader title="Detalhes da Consulta" showBack />
        <div className="px-6 py-6">
          <p className="text-sm text-muted-foreground">
            Carregando consulta...
          </p>
        </div>
      </MobileLayout>
    );
  }

  // Nome bonito do pet e tutor, com fallback
  const petName =
    (consultation as any).pet_name ??
    `pet #${consultation.pet_id}`;

  const tutorName = (consultation as any).tutor_name as
    | string
    | undefined;

  const formattedDate = consultation.date
    ? new Date(consultation.date).toLocaleDateString("pt-BR")
    : "";

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Detalhes da Consulta" showBack />

      <div className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="mobile-card text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>

          {/* Título com nome do pet */}
          <h2 className="text-xl font-bold mb-2">
            Consulta para {petName}
          </h2>

          {/* Data da consulta */}
          {consultation.date && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
          )}

          {/* Tutor, se vier da API */}
          {tutorName && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
              <User className="w-4 h-4" />
              <span>Tutor: {tutorName}</span>
            </div>
          )}
        </div>

        {/* Diagnóstico */}
        <div className="mobile-card space-y-3">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Stethoscope className="w-5 h-5" />
            <h3 className="font-semibold">Diagnóstico</h3>
          </div>
          <p className="text-sm leading-relaxed">
            {consultation.diagnosis || "Nenhum diagnóstico informado."}
          </p>
        </div>

        {/* Conduta / Tratamento */}
        <div className="mobile-card space-y-3">
          <div className="flex items-center gap-2 text-primary mb-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Conduta/Tratamento</h3>
          </div>
          <p className="text-sm leading-relaxed">
            {consultation.treatment || "Nenhuma conduta registrada."}
          </p>
        </div>

        {/* Observações */}
        {consultation.observations && (
          <div className="mobile-card space-y-3">
            <div className="flex items-center gap-2 text-primary mb-2">
              <FileText className="w-5 h-5" />
              <h3 className="font-semibold">Observações</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {consultation.observations}
            </p>
          </div>
        )}

        {/* Próxima visita */}
        {consultation.next_visit && (
          <div className="mobile-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Próxima visita recomendada
                </p>
                <p className="font-semibold">
                  {new Date(
                    consultation.next_visit
                  ).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default ConsultationDetail;
