import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    cpf: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    // Atualizar no localStorage (mock)
    const currentUser = JSON.parse(localStorage.getItem('univet_user') || '{}');
    const updatedUser = {
      ...currentUser,
      ...formData
    };
    localStorage.setItem('univet_user', JSON.stringify(updatedUser));

    toast.success('Dados atualizados com sucesso!');
    navigate('/tutor/profile');
  };

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Editar Perfil" showBack />

      <div className="px-6 py-6">
        <div className="mobile-card space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
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

export default ProfileEdit;
