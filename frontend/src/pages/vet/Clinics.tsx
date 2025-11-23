// src/pages/vet/Clinics.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Phone,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import {
  listClinics,
  createClinic,
  setCurrentClinic,
  type Clinic,
  type CreateClinicPayload,
} from "@/api/clinics";

const VetClinics = () => {
  const { user, updateUser } = useAuth();

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateClinicPayload>({
    name: "",
    region: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
  });

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await listClinics();
        setClinics(data);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.message ?? "Erro ao carregar clínicas. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchClinics();
  }, []);

  const handleSelectClinic = async (clinic: Clinic) => {
    try {
      await setCurrentClinic(clinic.id); // salva no backend (PUT)
      updateUser({ clinic_id: clinic.id }); // atualiza no front
      toast.success(`Clínica "${clinic.name}" definida como atual.`);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.message ?? "Erro ao definir clínica atual. Tente novamente."
      );
    }
  };

  const handleCreateClinic = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome da clínica é obrigatório");
      return;
    }

    try {
      setCreating(true);
      const newClinic = await createClinic(formData);
      setClinics((prev) => [...prev, newClinic]);

      // opcional: já seleciona essa clínica como atual também no backend
      try {
        await setCurrentClinic(newClinic.id);
        updateUser({ clinic_id: newClinic.id });
      } catch (error: any) {
        console.error("Erro ao definir nova clínica como atual:", error);
      }

      toast.success("Clínica cadastrada com sucesso!");
      setFormData({
        name: "",
        region: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        phone: "",
      });
      setShowForm(false);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.message ?? "Erro ao cadastrar clínica. Tente novamente."
      );
    } finally {
      setCreating(false);
    }
  };

  // se não for vet, não deveria estar aqui
  if (!user || user.role !== "veterinarian") {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader title="Clínicas" showBack />
        <div className="px-6 py-6">
          <p className="text-sm text-muted-foreground">
            Esta tela é destinada a veterinários.
          </p>
        </div>
      </MobileLayout>
    );
  }

  const currentClinicId = (user as any).clinic_id as number | undefined;

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Minhas Clínicas" showBack />

      <div className="px-6 py-6 space-y-6">
        {/* Botão para abrir/fechar formulário */}
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold">Clínicas cadastradas</h2>
          <Button
            size="sm"
            variant={showForm ? "outline" : "default"}
            onClick={() => setShowForm((prev) => !prev)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Fechar" : "Nova clínica"}
          </Button>
        </div>

        {/* Formulário de nova clínica */}
        {showForm && (
          <div className="mobile-card space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name">Nome da clínica *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Clínica Univet Centro"
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="region">Região (para filtros)</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    region: e.target.value,
                  }))
                }
                placeholder="Centro, Zona Sul..."
                className="h-10"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="Rua, número..."
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="state">UF</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                  maxLength={2}
                  className="h-10 uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      zip_code: e.target.value,
                    }))
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="(00) 00000-0000"
                  className="h-10"
                />
              </div>
            </div>

            <Button
              onClick={handleCreateClinic}
              disabled={creating}
              className="w-full h-10 text-sm font-semibold mt-2"
            >
              {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar clínica
            </Button>
          </div>
        )}

        {/* Lista de clínicas */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Carregando clínicas...</span>
            </div>
          ) : clinics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma clínica cadastrada ainda. Toque em &quot;Nova clínica&quot;
              para adicionar.
            </p>
          ) : (
            clinics.map((clinic) => {
              const isCurrent = clinic.id === currentClinicId;
              return (
                <div
                  key={clinic.id}
                  className="mobile-card flex items-start justify-between gap-3"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="font-semibold">{clinic.name}</div>
                      {(clinic.region || clinic.city || clinic.state) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {clinic.region ? clinic.region + " • " : ""}
                            {clinic.city}
                            {clinic.city && clinic.state ? " / " : ""}
                            {clinic.state}
                          </span>
                        </div>
                      )}
                      {clinic.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{clinic.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Atual
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs px-3"
                        onClick={() => handleSelectClinic(clinic)}
                      >
                        Definir como atual
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default VetClinics;
