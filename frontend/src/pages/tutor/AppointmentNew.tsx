import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MapPin, Clock, Stethoscope } from 'lucide-react';
import { mockVeterinarians, mockAnimals } from '@/data/mockData';

interface Animal {
  id: string;
  name: string;
}

const AppointmentNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedAnimalId = location.state?.animalId;
  
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [formData, setFormData] = useState({
    animalId: preSelectedAnimalId || '',
    vetId: '',
    date: '',
    time: '',
    type: '',
    notes: ''
  });
  const [selectedRegion, setSelectedRegion] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  useEffect(() => {
    const storedAnimals = JSON.parse(localStorage.getItem('univet_animals') || '[]');
    if (storedAnimals.length > 0) {
      setAnimals(storedAnimals);
    } else {
      setAnimals(mockAnimals.map(a => ({ id: a.id, name: a.name })));
    }
  }, []);

  useEffect(() => {
    if (formData.vetId && formData.date) {
      const vet = mockVeterinarians.find(v => v.id === formData.vetId);
      const slot = vet?.availableSlots.find(s => s.date === formData.date);
      setAvailableTimes(slot?.times || []);
    } else {
      setAvailableTimes([]);
    }
  }, [formData.vetId, formData.date]);

  const appointmentTypes = [
    'Consulta de rotina',
    'Vacinação',
    'Retorno',
    'Emergência',
    'Exame',
    'Cirurgia'
  ];

  const regions = ['Todas', ...new Set(mockVeterinarians.map(v => v.region))];
  
  const filteredVets = selectedRegion && selectedRegion !== 'Todas' 
    ? mockVeterinarians.filter(v => v.region === selectedRegion)
    : mockVeterinarians;

  const handleSubmit = () => {
    if (!formData.animalId || !formData.vetId || !formData.date || !formData.time || !formData.type) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const appointments = JSON.parse(localStorage.getItem('univet_appointments') || '[]');
    const selectedVet = mockVeterinarians.find(v => v.id === formData.vetId);
    const selectedAnimal = animals.find(a => a.id === formData.animalId);
    
    const newAppointment = {
      id: Date.now().toString(),
      ...formData,
      animal: selectedAnimal?.name || '',
      vet: selectedVet?.name || '',
      location: selectedVet?.location || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    localStorage.setItem('univet_appointments', JSON.stringify(appointments));

    toast.success('Agendamento solicitado com sucesso!');
    navigate('/tutor/appointments');
  };

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Novo Agendamento" showBack />

      <div className="px-6 py-6 space-y-4">
        {/* Animal Selection */}
        <div className="mobile-card space-y-2">
          <Label htmlFor="animal">Animal *</Label>
          <Select value={formData.animalId} onValueChange={(value) => setFormData({ ...formData, animalId: value })}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o animal" />
            </SelectTrigger>
            <SelectContent>
              {animals.map((animal) => (
                <SelectItem key={animal.id} value={animal.id}>
                  {animal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Appointment Type */}
        <div className="mobile-card space-y-2">
          <Label htmlFor="type">Tipo de Consulta *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {appointmentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Region Filter */}
        <div className="mobile-card space-y-2">
          <Label htmlFor="region">Filtrar por Região</Label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Todas as regiões" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Veterinarian Selection */}
        <div className="space-y-3">
          <Label>Selecione o Veterinário *</Label>
          {filteredVets.map((vet) => (
            <div
              key={vet.id}
              onClick={() => setFormData({ ...formData, vetId: vet.id, time: '' })}
              role="button"
              className={`mobile-card w-full text-left hover:shadow-lg transition-all cursor-pointer ${
                formData.vetId === vet.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{vet.name}</h3>
                  <p className="text-sm text-primary">{vet.specialty}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{vet.location}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{vet.region}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Date Selection */}
        {formData.vetId && (
          <div className="mobile-card space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
              min={new Date().toISOString().split('T')[0]}
              className="h-12"
            />
          </div>
        )}

        {/* Time Selection */}
        {availableTimes.length > 0 && (
          <div className="mobile-card space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horários Disponíveis *
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setFormData({ ...formData, time })}
                  className={`h-12 rounded-lg border-2 font-medium transition-all ${
                    formData.time === time
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mobile-card space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            placeholder="Descreva os sintomas ou motivo da consulta..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="min-h-24"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!formData.animalId || !formData.vetId || !formData.date || !formData.time || !formData.type}
          className="w-full h-12 text-base font-semibold gradient-primary"
        >
          Solicitar Agendamento
        </Button>
      </div>
    </MobileLayout>
  );
};

export default AppointmentNew;
