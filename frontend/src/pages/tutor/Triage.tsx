import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

import { listPets, type Pet } from "@/api/pets";
import { createTriage, type TriageResult } from "@/api/triage";

interface ClinicalSign {
  id: string;
  label: string;
  severity: "high" | "medium" | "low";
}

const Triage = () => {
  const navigate = useNavigate();

  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);

  const [selectedAnimal, setSelectedAnimal] = useState(""); // id do pet (string)
  const [selectedSigns, setSelectedSigns] = useState<string[]>([]);

  const [triageLoading, setTriageLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  const clinicalSigns: ClinicalSign[] = [
    { id: "fever", label: "Febre", severity: "high" },
    { id: "apathy", label: "Apatia", severity: "medium" },
    { id: "cough", label: "Tosse", severity: "medium" },
    { id: "vomit", label: "Vômito", severity: "high" },
    { id: "appetite_loss", label: "Perda de apetite", severity: "medium" },
    { id: "diarrhea", label: "Diarreia", severity: "high" },
    {
      id: "difficulty_breathing",
      label: "Dificuldade para respirar",
      severity: "high",
    },
    { id: "lethargy", label: "Letargia", severity: "medium" },
  ];

  useEffect(() => {
    const loadPets = async () => {
      try {
        setLoadingPets(true);
        const data = await listPets();
        setPets(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message ?? "Erro ao carregar animais");
      } finally {
        setLoadingPets(false);
      }
    };

    void loadPets();
  }, []);

  const toggleSign = (signId: string) => {
    setSelectedSigns((prev) =>
      prev.includes(signId)
        ? prev.filter((id) => id !== signId)
        : [...prev, signId]
    );
    setResult(null);
  };

  const handleSelectAnimal = (value: string) => {
    setSelectedAnimal(value);
    setResult(null);
  };

  const analyzeSymptoms = async () => {
    if (!selectedAnimal) {
      toast.error("Selecione um animal");
      return;
    }

    if (selectedSigns.length === 0) {
      toast.error("Selecione pelo menos um sinal clínico");
      return;
    }

    const petId = Number(selectedAnimal);
    const selectedSignsData = clinicalSigns.filter((sign) =>
      selectedSigns.includes(sign.id)
    );
    const labels = selectedSignsData.map((s) => s.label).join(", ");

    // Texto de sintomas que vai pro backend
    const symptomsText = `Sinais clínicos selecionados: ${labels}.`;

    try {
      setTriageLoading(true);
      const triage = await createTriage({
        pet_id: petId,
        symptoms: symptomsText,
      });
      setResult(triage);
      toast.success("Triagem enviada e salva com sucesso");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.message || "Erro ao enviar a triagem. Tente novamente."
      );
    } finally {
      setTriageLoading(false);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;

    switch (result.risk_level) {
      case "urgent":
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case "monitor":
        return <Clock className="w-12 h-12 text-warning" />;
      case "ok":
      default:
        return <CheckCircle2 className="w-12 h-12 text-success" />;
    }
  };

  const getResultColor = () => {
    if (!result) return "";

    switch (result.risk_level) {
      case "urgent":
        return "bg-red-500/10 border-red-500/20";
      case "monitor":
        return "bg-warning/10 border-warning/20";
      case "ok":
      default:
        return "bg-success/10 border-success/20";
    }
  };

  const selectedPet = pets.find((p) => String(p.id) === selectedAnimal);

  return (
    <MobileLayout>
      <MobileHeader title="Triagem Rápida" />

      <div className="px-6 py-6 space-y-6">
        <div className="mobile-card">
          <Label className="mb-3 block">Selecione o animal</Label>
          <Select
            value={selectedAnimal}
            onValueChange={handleSelectAnimal}
            disabled={loadingPets || pets.length === 0}
          >
            <SelectTrigger className="h-12">
              <SelectValue
                placeholder={
                  loadingPets
                    ? "Carregando animais..."
                    : pets.length === 0
                    ? "Nenhum animal cadastrado"
                    : "Escolha um animal"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {pets.map((pet) => (
                <SelectItem key={pet.id} value={String(pet.id)}>
                  {pet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mobile-card">
          <h3 className="font-semibold mb-4">Sinais Clínicos Observados</h3>
          <div className="space-y-3">
            {clinicalSigns.map((sign) => (
              <div key={sign.id} className="flex items-center space-x-3">
                <Checkbox
                  id={sign.id}
                  checked={selectedSigns.includes(sign.id)}
                  onCheckedChange={() => toggleSign(sign.id)}
                />
                <Label
                  htmlFor={sign.id}
                  className="flex-1 cursor-pointer select-none"
                >
                  {sign.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={analyzeSymptoms}
          disabled={
            !selectedAnimal || selectedSigns.length === 0 || triageLoading
          }
          className="w-full h-12 text-base font-semibold gradient-primary"
        >
          {triageLoading ? "Analisando..." : "Analisar Sinais"}
        </Button>

        {result && (
          <div className={`mobile-card border-2 ${getResultColor()}`}>
            <div className="flex flex-col items-center text-center gap-4">
              {getResultIcon()}
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {result.risk_level === "urgent" && "Atenção Imediata"}
                  {result.risk_level === "monitor" && "Monitoramento Necessário"}
                  {result.risk_level === "ok" && "Situação Controlada"}
                </h3>

                {selectedPet && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Paciente:{" "}
                    <span className="font-medium">{selectedPet.name}</span> (ID{" "}
                    {selectedPet.id})
                  </p>
                )}

                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  <span className="font-medium">Resumo:</span>{" "}
                  {result.ai_summary}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-medium">Recomendações:</span>{" "}
                  {result.recommendations}
                </p>
              </div>

              {(result.risk_level === "urgent" ||
                result.risk_level === "monitor") &&
                selectedAnimal && (
                  <div className="w-full pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-3">
                      Recomendamos uma consulta veterinária
                    </p>
                    <Button
                      onClick={() =>
                        navigate("/tutor/appointment/new", {
                          state: { animalId: Number(selectedAnimal) },
                        })
                      }
                      className="w-full gradient-primary"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Consulta
                    </Button>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Triage;