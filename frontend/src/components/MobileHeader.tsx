import { ArrowLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  className?: string;
  action?: React.ReactNode;
}

export const MobileHeader = ({ 
  title, 
  showBack = false, 
  showMenu = false,
  className,
  action 
}: MobileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className={cn("mobile-header px-4 py-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
        </div>
        
        {action || (showMenu && (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        ))}
      </div>
    </header>
  );
};
