import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mail, Phone, MessageSquare } from 'lucide-react';

const ProfileContact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  const handleSubmit = () => {
    if (!formData.subject || !formData.message) {
      toast.error('Preencha todos os campos');
      return;
    }

    // Simular envio de mensagem
    toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    navigate('/tutor/profile');
  };

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Contato" showBack />

      <div className="px-6 py-6 space-y-6">
        {/* Contact Info */}
        <div className="mobile-card space-y-4">
          <h3 className="font-semibold text-lg mb-4">Entre em Contato</h3>
          
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">contato@univet.com.br</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">(11) 0000-0000</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mobile-card space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Enviar Mensagem</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              placeholder="Sobre o que você quer falar?"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="min-h-32"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base font-semibold gradient-primary mt-2"
          >
            Enviar Mensagem
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ProfileContact;
