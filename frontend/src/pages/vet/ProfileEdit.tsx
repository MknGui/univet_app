import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const VetProfileEdit = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // se por algum motivo não tiver user, evita quebrar
  if (!user) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader title="Editar Perfil" showBack />
        <div className="px-6 py-6">
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os dados do usuário.
          </p>
        </div>
      </MobileLayout>
    );
  }

  const [formData, setFormData] = useState({
    name: user.name || "",
    crmv: (user as any).crmv || "",
    specialty: (user as any).specialty || "",
    phone: (user as any).phone || "",
  });

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("Preencha o nome");
      return;
    }

    // se quiser forçar CRMV/especialidade sempre preenchidos:
    // if (!formData.crmv) { toast.error("Informe o CRMV"); return; }
    // if (!formData.specialty) { toast.error("Informe a especialidade"); return; }

    updateUser({
      name: formData.name,
      crmv: formData.crmv,
      specialty: formData.specialty,
      phone: formData.phone,
    });

    toast.success("Perfil atualizado com sucesso!");
    navigate("/vet/profile");
  };

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Editar Perfil" showBack />

      <div className="px-6 py-6">
        <div className="mobile-card space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="h-12"
            />
          </div>

          {/* E-mail (somente leitura, ainda não temos update no back) */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail (login)</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="h-12 bg-muted"
            />
          </div>

          {/* CRMV */}
          <div className="space-y-2">
            <Label htmlFor="crmv">CRMV</Label>
            <Input
              id="crmv"
              value={formData.crmv}
              onChange={(e) =>
                setFormData({ ...formData, crmv: e.target.value })
              }
              placeholder="Ex: CRMV-SP 12345"
              className="h-12"
            />
          </div>

          {/* Especialidade */}
          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidade</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) =>
                setFormData({ ...formData, specialty: e.target.value })
              }
              placeholder="Clínico Geral, Dermatologia..."
              className="h-12"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="(00) 00000-0000"
              className="h-12"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base font-semibold gradient-primary mt-6"
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default VetProfileEdit;
