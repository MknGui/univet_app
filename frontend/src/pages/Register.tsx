import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  FileText,
  Phone,
  Stethoscope,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const [userType, setUserType] = useState<"tutor" | "veterinarian" | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    crmv: "",
    specialty: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (!userType) {
      toast.error("Selecione o tipo de usuário");
      return;
    }

    if (userType === "veterinarian" && !formData.crmv) {
      toast.error("Informe o CRMV");
      return;
    }

    if (userType === "veterinarian" && !formData.specialty) {
      toast.error("Informe a especialidade");
      return;
    }

    setLoading(true);
    const result = await registerUser(
      formData.name,
      formData.email,
      formData.password,
      userType,
      formData.crmv,
      formData.specialty,
      formData.phone
    );
    setLoading(false);

    if (result.ok) {
      toast.success(result.message || "Cadastro realizado com sucesso!");
      navigate(userType === "tutor" ? "/tutor/dashboard" : "/vet/dashboard");
    } else {
      toast.error(result.message || "Erro ao cadastrar");
    }
  };

  // Tela de escolha do tipo de usuário
  if (!userType) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="gradient-hero pb-8">
          <div className="flex flex-col px-6 pt-8 pb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/login")}
              className="self-start mb-8"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex-1 flex flex-col justify-center gap-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Criar Conta
                </h1>
                <p className="text-muted-foreground">
                  Selecione o tipo de usuário
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setUserType("tutor")}
                  className="w-full mobile-card text-left hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Sou Tutor</h3>
                      <p className="text-sm text-muted-foreground">
                        Cuidar dos meus animais de estimação
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setUserType("veterinarian")}
                  className="w-full mobile-card text-left hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <FileText className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        Sou Veterinário
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Profissional com CRMV
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Tela de formulário de cadastro
  return (
    <MobileLayout showBottomNav={false}>
      <div className="gradient-hero pb-8">
        <div className="flex flex-col px-6 pt-8 pb-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setUserType(null)}
            className="self-start mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {userType === "tutor"
                ? "Cadastro de Tutor"
                : "Cadastro de Veterinário"}
            </h1>
            <p className="text-muted-foreground text-sm">
              Preencha seus dados para continuar
            </p>
          </div>

          <div className="mobile-card space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {userType === "veterinarian" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="crmv">CRMV</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="crmv"
                      placeholder="CRMV-UF 12345"
                      value={formData.crmv}
                      onChange={(e) =>
                        setFormData({ ...formData, crmv: e.target.value })
                      }
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="specialty"
                      placeholder="Clínico Geral, Dermatologia..."
                      value={formData.specialty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialty: e.target.value,
                        })
                      }
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full h-12 text-base font-semibold gradient-primary mt-4"
            >
              Criar Conta
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Register;