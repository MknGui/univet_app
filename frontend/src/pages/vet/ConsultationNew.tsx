import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Animal {
  id: string;
  name: string;
  tutorName?: string;
}

const ConsultationNew = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [formData, setFormData] = useState({
    animalId: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    observations: '',
    nextVisit: ''
  });

  useEffect(() => {
    // Carregar animais do localStorage
    const storedAnimals = JSON.parse(localStorage.getItem('univet_animals') || '[]');
    setAnimals(storedAnimals);
  }, []);

  const handleSubmit = () => {
    if (!formData.animalId || !formData.diagnosis || !formData.treatment) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const consultations = JSON.parse(localStorage.getItem('univet_consultations') || '[]');
    const newConsultation = {
      id: Date.now().toString(),
      ...formData,
      animalName: animals.find(a => a.id === formData.animalId)?.name || '',
      createdAt: new Date().toISOString()
    };

    consultations.push(newConsultation);
    localStorage.setItem('univet_consultations', JSON.stringify(consultations));

    toast.success('Consulta registrada com sucesso!');
    navigate('/vet/consultations');
  };

  return (
    <MobileLayout>
      <MobileHeader title="Registrar Consulta" showBack />

      <div className="px-6 py-6">
        <div className="mobile-card space-y-4">
          <div className="space-y-2">
            <Label htmlFor="animal">Animal *</Label>
            <Select value={formData.animalId} onValueChange={(value) => setFormData({ ...formData, animalId: value })}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione o animal" />
              </SelectTrigger>
              <SelectContent>
                {animals.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name} {animal.tutorName && `- ${animal.tutorName}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data da Consulta *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnóstico *</Label>
            <Textarea
              id="diagnosis"
              placeholder="Descreva o diagnóstico..."
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="min-h-24"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Conduta/Tratamento *</Label>
            <Textarea
              id="treatment"
              placeholder="Descreva o tratamento prescrito..."
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="min-h-24"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Observações adicionais..."
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextVisit">Próxima Visita</Label>
            <Input
              id="nextVisit"
              type="date"
              value={formData.nextVisit}
              onChange={(e) => setFormData({ ...formData, nextVisit: e.target.value })}
              className="h-12"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base font-semibold gradient-primary mt-6"
          >
            Registrar Consulta
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ConsultationNew;
