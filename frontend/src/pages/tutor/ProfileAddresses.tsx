import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  isDefault: boolean;
}

const ProfileAddresses = () => {
  const navigate = useNavigate();
  const [addresses] = useState<Address[]>([
    {
      id: '1',
      name: 'Casa',
      street: 'Rua Exemplo, 123 - Centro',
      city: 'São Paulo - SP',
      isDefault: true
    }
  ]);

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader 
        title="Meus Endereços"
        showBack
        action={
          <Button
            size="icon"
            onClick={() => navigate('/tutor/profile/addresses/new')}
            className="h-9 w-9 gradient-primary"
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-6 py-6 space-y-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div key={address.id} className="mobile-card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{address.name}</h3>
                    {address.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Padrão
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{address.street}</p>
                  <p className="text-sm text-muted-foreground">{address.city}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/tutor/profile/addresses/${address.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="mobile-card text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">Nenhum endereço cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Adicione um endereço para facilitar seus agendamentos
            </p>
            <Button
              onClick={() => navigate('/tutor/profile/addresses/new')}
              className="gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Endereço
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default ProfileAddresses;
