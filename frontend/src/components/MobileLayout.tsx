import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Activity, BookOpen, User, Stethoscope, ClipboardList } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const MobileLayout = ({ children, showBottomNav = true }: MobileLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const tutorNavItems = [
    { icon: Home, label: 'Início', path: '/tutor/dashboard' },
    { icon: Activity, label: 'Animais', path: '/tutor/animals' },
    { icon: Calendar, label: 'Agenda', path: '/tutor/appointments' },
    { icon: BookOpen, label: 'Conteúdo', path: '/tutor/education' },
    { icon: User, label: 'Perfil', path: '/tutor/profile' },
  ];

  const vetNavItems = [
    { icon: Home, label: 'Início', path: '/vet/dashboard' },
    { icon: ClipboardList, label: 'Consultas', path: '/vet/consultations' },
    { icon: Calendar, label: 'Agenda', path: '/vet/appointments' },
    { icon: Stethoscope, label: 'Registrar', path: '/vet/consultation/new' },
    { icon: User, label: 'Perfil', path: '/vet/profile' },
  ];

  const navItems = user?.type === 'veterinarian' ? vetNavItems : tutorNavItems;

  return (
    <div className="mobile-container bg-background">
      <main className="h-full overflow-y-auto pb-20">
        {children}
      </main>

      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card border-t border-border z-50">
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};
