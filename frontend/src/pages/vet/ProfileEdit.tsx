import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const VetProfileEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    crmv: user?.crmv || ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Atualizar dados no localStorage
    const users = JSON.parse(localStorage.getItem('univet_users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.email === user?.email 
        ? { ...u, name: formData.name, email: formData.email, crmv: formData.crmv }
        : u
    );
    localStorage.setItem('univet_users', JSON.stringify(updatedUsers));
    localStorage.setItem('univet_user', JSON.stringify({ 
      ...user, 
      name: formData.name, 
      email: formData.email, 
      crmv: formData.crmv 
    }));

    toast.success('Perfil atualizado com sucesso!');
    navigate('/vet/profile');
  };

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Editar Perfil" showBack />

      <div className="px-6 py-6">
        <div className="mobile-card space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crmv">CRMV</Label>
            <Input
              id="crmv"
              value={formData.crmv}
              onChange={(e) => setFormData({ ...formData, crmv: e.target.value })}
              placeholder="Ex: CRMV-SP 12345"
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
