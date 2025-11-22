import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Clock, Stethoscope } from "lucide-react";
import { listPets, type Pet } from "@/api/pets";
import { createAppointment } from "@/api/appointments";

interface AnimalOption {
  id: number;
  name: string;
}

interface VetSlot {
  date: string; // "YYYY-MM-DD"
  times: string[];
}

interface Vet {
  id: number;
  name: string;
  specialty: string;
  location: string;
  region: string;
  slots: VetSlot[];
}

/**
 * Por enquanto não existe backend para veterinários/agenda,
 * então deixei uma lista fixa aqui. Quando tiver API de vets,
 * é só trocar para um listVets() e ler os horários do backend.
 */
const VETS: Vet[] = [
  {
    id: 1,
    name: "Dr. João Silva",
    specialty: "Clínico Geral",
    location: "Clínica Univet Centro",
    region: "Centro",
    slots: [
      {
        date: new Date().toISOString().split("T")[0],
        times: ["09:00", "10:00", "11:00", "14:00", "15:30"],
      },
    ],
  },
  {
    id: 2,
    name: "Dra. Maria Souza",
    specialty: "Dermatologia",
    location: "Clínica Univet Zona Sul",
    region: "Zona Sul",
    slots: [
      {
        date: new Date().toISOString().split("T")[0],
        times: ["08:30", "09:30", "13:00", "16:00"],
      },
    ],
  },
];

const AppointmentNew = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { animalId?: string } };
  const preSelectedAnimalId = location.state?.animalId;

  const [animals, setAnimals] = useState<AnimalOption[]>([]);
  const [formData, setFormData] = useState({
    animalId: preSelectedAnimalId || "",
    vetId: "",
    date: "",
    time: "",
    type: "",
    notes: "",
  });
  const [selectedRegion, setSelectedRegion] = useState<string>("Todas");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega animais do backend (sem fallback para mocks)
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const pets: Pet[] = await listPets();
        setAnimals(
          pets.map((p) => ({
            id: p.id,
            name: p.name,
          }))
        );
      } catch (err) {
        console.error("Erro ao buscar pets da API:", err);
        toast.error(
          "Erro ao carregar seus animais. Cadastre um pet antes de agendar."
        );
      }
    };

    void fetchAnimals();
  }, []);

  // Atualiza horários disponíveis conforme vet + data
  useEffect(() => {
    if (formData.vetId && formData.date) {
      const vet = VETS.find((v) => v.id === Number(formData.vetId));
      const slot = vet?.slots.find((s) => s.date === formData.date);
      setAvailableTimes(slot?.times || []);
    } else {
      setAvailableTimes([]);
    }
  }, [formData.vetId, formData.date]);

  const appointmentTypes = [
    "Consulta de rotina",
    "Vacinação",
    "Retorno",
    "Emergência",
    "Exame",
    "Cirurgia",
  ];

  const regions = ["Todas", ...new Set(VETS.map((v) => v.region))];

  const filteredVets =
    selectedRegion && selectedRegion !== "Todas"
      ? VETS.filter((v) => v.region === selectedRegion)
      : VETS;

  const handleSubmit = async () => {
    if (
      !formData.animalId ||
      !formData.vetId ||
      !formData.date ||
      !formData.time ||
      !formData.type
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);

      const scheduled_at = `${formData.date}T${formData.time}:00`;

      await createAppointment({
        pet_id: Number(formData.animalId),
        vet_id: Number(formData.vetId),
        scheduled_at,
        // backend hoje espera "notes" conforme seu appointments.ts
        reason: formData.notes
          ? `${formData.type} - ${formData.notes}`
          : formData.type,
      });

      toast.success("Agendamento solicitado com sucesso!");
      navigate("/tutor/appointments");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.message ?? "Erro ao solicitar agendamento. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Novo Agendamento" showBack />

      <div className="px-6 py-6 space-y-4">
        {/* Animal */}
        <div className="mobile-card space-y-2">
          <Label htmlFor="animal">Animal *</Label>
          <Select
            value={formData.animalId}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, animalId: value }))
            }
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o animal" />
            </SelectTrigger>
            <SelectContent>
              {animals.map((animal) => (
                <SelectItem key={animal.id} value={String(animal.id)}>
                  {animal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de consulta */}
        <div className="mobile-card space-y-2">
          <Label htmlFor="type">Tipo de Consulta *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {appointmentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Região */}
        <div className="mobile-card space-y-2">
          <Label htmlFor="region">Filtrar por Região</Label>
          <Select
            value={selectedRegion}
            onValueChange={(value) => setSelectedRegion(value)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Todas as regiões" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Veterinário */}
        <div className="space-y-3">
          <Label>Selecione o Veterinário *</Label>
          {filteredVets.map((vet) => (
            <div
              key={vet.id}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  vetId: String(vet.id),
                  time: "",
                }))
              }
              role="button"
              className={`mobile-card w-full text-left hover:shadow-lg transition-all cursor-pointer ${
                Number(formData.vetId) === vet.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{vet.name}</h3>
                  <p className="text-sm text-primary">{vet.specialty}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{vet.location}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {vet.region}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data */}
        {formData.vetId && (
          <div className="mobile-card space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  date: e.target.value,
                  time: "",
                }))
              }
              min={new Date().toISOString().split("T")[0]}
              className="h-12"
            />
          </div>
        )}

        {/* Horários */}
        {availableTimes.length > 0 && (
          <div className="mobile-card space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horários Disponíveis *
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, time: time }))
                  }
                  className={`h-12 rounded-lg border-2 font-medium transition-all ${
                    formData.time === time
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="mobile-card space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            placeholder="Descreva os sintomas ou motivo da consulta..."
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="min-h-24"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={
            loading ||
            !formData.animalId ||
            !formData.vetId ||
            !formData.date ||
            !formData.time ||
            !formData.type
          }
          className="w-full h-12 text-base font-semibold gradient-primary"
        >
          {loading ? "Enviando..." : "Solicitar Agendamento"}
        </Button>
      </div>
    </MobileLayout>
  );
};

export default AppointmentNew;
