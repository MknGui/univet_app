import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { listPets, type Pet } from "@/api/pets";
import { createConsultation } from "@/api/consultations";
import {
  listAppointments,
  type Appointment,
} from "@/api/appointments";

interface AnimalOption {
  id: string;
  name: string;
}

interface AppointmentOption {
  id: string;
  label: string;
  petId: number;
  petName: string;
  tutorId: number;
  tutorName?: string | null;
  scheduledAt: string;
}

const ConsultationNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [animals, setAnimals] = useState<AnimalOption[]>([]);
  const [appointments, setAppointments] = useState<AppointmentOption[]>([]);

  const [loadingPets, setLoadingPets] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    animalId: "",
    appointmentId: "",
    diagnosis: "",
    treatment: "",
    observations: "",
    nextVisit: "",
  });

  // carrega pets (ainda deixo aqui, caso queira permitir consulta sem agendamento no futuro)
  useEffect(() => {
    const loadPets = async () => {
      try {
        setLoadingPets(true);
        const pets: Pet[] = await listPets();

        const mapped: AnimalOption[] = pets.map((p) => ({
          id: String(p.id),
          name: p.name,
        }));

        setAnimals(mapped);
      } catch (error) {
        console.error("Erro ao carregar pets", error);
        toast.error("Não foi possível carregar os animais");
      } finally {
        setLoadingPets(false);
      }
    };

    void loadPets();
  }, []);

// carrega agendamentos do vet para vincular consulta
useEffect(() => {
  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      // agenda do vet
      const appts: Appointment[] = await listAppointments("vet");

      // NÃO mostrar cancelados nem concluídos
      const validAppts = appts.filter(
        (a) => a.status !== "CANCELLED" && a.status !== "COMPLETED"
      );

      // ordena por data/hora da consulta (mais antigas primeiro)
      const sortedAppts = [...validAppts].sort((a, b) => {
        const da = new Date(a.scheduled_at).getTime();
        const db = new Date(b.scheduled_at).getTime();
        return da - db; // dia 1, depois dia 2, etc.
      });

      const mapped: AppointmentOption[] = sortedAppts.map((a) => {
        const dt = new Date(a.scheduled_at);
        const date = dt.toLocaleDateString("pt-BR");
        const time = dt.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const petName = (a as any).pet_name ?? `Pet #${a.pet_id}`;
        const tutorName = (a as any).tutor_name ?? `Tutor #${a.tutor_id}`;

        return {
          id: String(a.id),
          label: `${date} ${time} • ${petName} (${tutorName})`,
          petId: a.pet_id,
          petName,
          tutorId: a.tutor_id,
          tutorName: (a as any).tutor_name ?? null,
          scheduledAt: a.scheduled_at,
        };
      });

      setAppointments(mapped);

      const paramId = searchParams.get("appointmentId");
      if (paramId) {
        const has = mapped.find((m) => m.id === paramId);
        if (has) {
          setFormData((prev) => ({
            ...prev,
            appointmentId: has.id,
            animalId: String(has.petId),
          }));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos", error);
      toast.error("Não foi possível carregar os agendamentos");
    } finally {
      setLoadingAppointments(false);
    }
  };

  void loadAppointments();
}, [searchParams]);



  const selectedAppointment = formData.appointmentId
    ? appointments.find((a) => a.id === formData.appointmentId)
    : undefined;

  // se o vet escolher um agendamento manualmente, sincroniza animal também
  const handleSelectAppointment = (value: string) => {
    const app = appointments.find((a) => a.id === value);
    setFormData((prev) => ({
      ...prev,
      appointmentId: value,
      animalId: app ? String(app.petId) : prev.animalId,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.appointmentId) {
      toast.error("Selecione o agendamento da consulta");
      return;
    }
    if (!formData.diagnosis || !formData.treatment) {
      toast.error("Preencha diagnóstico e conduta/tratamento");
      return;
    }

    const appointment = selectedAppointment;
    if (!appointment) {
      toast.error("Agendamento selecionado é inválido");
      return;
    }

    try {
      setSubmitting(true);

      // usamos a data do próprio agendamento
      const dateOnly = appointment.scheduledAt.split("T")[0];

      await createConsultation({
        pet_id: appointment.petId,
        // mantém compat com API atual
        date: dateOnly,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        observations: formData.observations || undefined,
        next_visit: formData.nextVisit || undefined,
        // novo campo para vincular consulta ao agendamento
        appointment_id: Number(appointment.id),
      } as any);

      toast.success("Consulta registrada com sucesso!");
      navigate("/vet/consultations");
    } catch (error: any) {
      console.error("Erro ao registrar consulta", error);
      const msg =
        error?.message || "Ocorreu um erro ao registrar a consulta.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileLayout>
      <MobileHeader title="Registrar Consulta" showBack />

      <div className="px-6 py-6">
        <div className="mobile-card space-y-4">
          {/* Agendamento vinculado */}
          <div className="space-y-2">
            <Label>Agendamento *</Label>
            <Select
              value={formData.appointmentId}
              onValueChange={handleSelectAppointment}
              disabled={loadingAppointments}
            >
              <SelectTrigger className="h-12">
                <SelectValue
                  placeholder={
                    loadingAppointments
                      ? "Carregando agendamentos..."
                      : "Selecione o agendamento"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {appointments.map((appt) => (
                  <SelectItem key={appt.id} value={appt.id}>
                    {appt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAppointment && (
              <p className="text-xs text-muted-foreground">
                Consulta para{" "}
                <span className="font-semibold">
                  {selectedAppointment.petName}
                </span>{" "}
                (tutor:{" "}
                {selectedAppointment.tutorName ??
                  `Tutor #${selectedAppointment.tutorId}`}
                )
              </p>
            )}
          </div>

          {/* Animal (agora fica só informativo quando vem de agendamento) */}
          <div className="space-y-2">
            <Label htmlFor="animal">Animal</Label>
            <Select
              value={formData.animalId}
              onValueChange={(value) =>
                setFormData({ ...formData, animalId: value })
              }
              disabled={!!selectedAppointment || loadingPets}
            >
              <SelectTrigger className="h-12">
                <SelectValue
                  placeholder={
                    loadingPets ? "Carregando animais..." : "Selecione o animal"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {animals.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAppointment && (
              <p className="text-xs text-muted-foreground">
                Animal definido pelo agendamento.
              </p>
            )}
          </div>

          {/* Diagnóstico */}
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnóstico *</Label>
            <Textarea
              id="diagnosis"
              placeholder="Descreva o diagnóstico..."
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              className="min-h-24"
            />
          </div>

          {/* Tratamento */}
          <div className="space-y-2">
            <Label htmlFor="treatment">Conduta/Tratamento *</Label>
            <Textarea
              id="treatment"
              placeholder="Descreva o tratamento prescrito..."
              value={formData.treatment}
              onChange={(e) =>
                setFormData({ ...formData, treatment: e.target.value })
              }
              className="min-h-24"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Observações adicionais..."
              value={formData.observations}
              onChange={(e) =>
                setFormData({ ...formData, observations: e.target.value })
              }
              className="min-h-20"
            />
          </div>

          {/* Próxima visita */}
          <div className="space-y-2">
            <Label htmlFor="nextVisit">Próxima Visita</Label>
            <Input
              id="nextVisit"
              type="date"
              value={formData.nextVisit}
              onChange={(e) =>
                setFormData({ ...formData, nextVisit: e.target.value })
              }
              className="h-12"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || loadingAppointments}
            className="w-full h-12 text-base font-semibold gradient-primary mt-6"
          >
            {submitting ? "Registrando..." : "Registrar Consulta"}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ConsultationNew;
