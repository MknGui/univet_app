import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MobileLayout } from "@/components/MobileLayout";
import { MobileHeader } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, LogOut, ChevronRight } from "lucide-react";
import { apiRequest } from "@/api/client";

type SimplePet = { id: number };
type SimpleAppointment = { id: number };

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [petsCount, setPetsCount] = useState<number | null>(null);
  const [appointmentsCount, setAppointmentsCount] = useState<number | null>(
    null
  );
  const [loadingStats, setLoadingStats] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { icon: User, label: "Meus Dados", path: "/tutor/profile/edit" },
    { icon: Phone, label: "Contato", path: "/tutor/profile/contact" },
    // { icon: MapPin, label: "Endereços", path: "/tutor/profile/addresses" }, // removido do mvp
  ];

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);

        const [pets, appointments] = await Promise.all([
          apiRequest<SimplePet[]>("/pets"),
          apiRequest<SimpleAppointment[]>("/appointments"),
        ]);

        setPetsCount(pets.length);
        setAppointmentsCount(appointments.length);
      } catch (error) {
        console.error("Erro ao carregar estatísticas do perfil", error);
        // se der erro você pode escolher deixar null ou zerar
        setPetsCount(0);
        setAppointmentsCount(0);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  const roleLabel =
    user?.role === "veterinarian" ? "Veterinário" : "Tutor";

  return (
    <MobileLayout>
      <MobileHeader title="Meu Perfil" />

      <div className="px-6 py-6 space-y-6">
        {/* User Info Card */}
        <div className="mobile-card text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
          <p className="text-sm text-muted-foreground mb-1">{user?.email}</p>
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {roleLabel}
          </span>
        </div>

        {/* Menu Items */}
        <div className="mobile-card space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="flex-1 text-left font-medium">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="mobile-card text-center">
            <p className="text-2xl font-bold text-primary">
              {loadingStats || petsCount === null ? "..." : petsCount}
            </p>
            <p className="text-sm text-muted-foreground">Animais</p>
          </div>
          <div className="mobile-card text-center">
            <p className="text-2xl font-bold text-primary">
              {loadingStats || appointmentsCount === null
                ? "..."
                : appointmentsCount}
            </p>
            <p className="text-sm text-muted-foreground">Consultas</p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 text-destructive hover:bg-destructive/10 border-destructive/20"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </MobileLayout>
  );
};

export default Profile;
