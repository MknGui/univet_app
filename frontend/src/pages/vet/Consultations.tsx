import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Plus, Stethoscope } from "lucide-react";
import { CardConsulta } from "@/components/cards/CardConsulta";
import {
  listConsultations,
  type Consultation as ApiConsultation,
} from "@/api/consultations";

type Filter = "all" | "completed" | "scheduled";

// Agora o status não depende mais da data,
// e sim de ter (ou não) diagnóstico preenchido.
const mapApiToUi = (c: ApiConsultation): any => {
  const dt = new Date(c.date);

  const hasDiagnosis =
    typeof c.diagnosis === "string" && c.diagnosis.trim().length > 0;

  // reusamos os mesmos valores que o CardConsulta já conhece
  // "scheduled" = pendente de diagnóstico
  // "completed" = com diagnóstico registrado
  const status: "scheduled" | "completed" = hasDiagnosis
    ? "completed"
    : "scheduled";

  return {
    id: String(c.id),

    date: dt.toISOString(),
    time: dt.toTimeString().slice(0, 5),

    diagnosis: c.diagnosis,
    treatment: c.treatment,

    petId: String(c.pet_id),
    petName: (c as any).pet_name ?? `Pet #${c.pet_id}`,
    tutorId: String(c.tutor_id),
    tutorName: (c as any).tutor_name ?? `Tutor #${c.tutor_id}`,
    vetId: String(c.vet_id),
    vetName: (c as any).vet_name ?? `Vet #${c.vet_id}`,

    status,
  };
};

const Consultations = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await listConsultations();
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
    return cons.status === filter;
  });

  return (
    <MobileLayout>
      <MobileHeader
        title="Consultas realizadas"
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
        ) : filteredConsultations.length > 0 ? (
          <div className="space-y-3">
            {filteredConsultations.map((consultation: any) => (
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
              Nenhuma consulta encontrada
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Não há consultas realizadas ou pendentes de diagnóstico.
            </p>
            <Button
              onClick={() => navigate("/vet/consultation/new")}
              className="gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar nova consulta
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Consultations;
