import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { User, Award, LogOut, ChevronRight } from 'lucide-react';

const VetProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          <p className="text-sm text-muted-foreground mb-2">{user?.email}</p>
          {user?.crmv && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{user.crmv}</span>
            </div>
          )}
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            Veterinário(a)
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="mobile-card text-center">
            <p className="text-2xl font-bold text-primary">12</p>
            <p className="text-sm text-muted-foreground">Consultas</p>
          </div>
          <div className="mobile-card text-center">
            <p className="text-2xl font-bold text-primary">45</p>
            <p className="text-sm text-muted-foreground">Registros</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mobile-card space-y-1">
          <button
            onClick={() => navigate('/vet/profile/edit')}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <span className="flex-1 text-left font-medium">Editar Perfil</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
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

export default VetProfile;
