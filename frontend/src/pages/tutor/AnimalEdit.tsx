import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  sex: string;
}

const AnimalEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Animal>({
    id: '',
    name: '',
    species: '',
    breed: '',
    age: '',
    sex: ''
  });

  useEffect(() => {
    const animals = JSON.parse(localStorage.getItem('univet_animals') || '[]');
    const animal = animals.find((a: Animal) => a.id === id);
    
    if (!animal) {
      toast.error('Animal não encontrado');
      navigate('/tutor/animals');
      return;
    }
    
    setFormData(animal);
  }, [id, navigate]);

  const handleSubmit = () => {
    if (!formData.name || !formData.species || !formData.breed || !formData.age || !formData.sex) {
      toast.error('Preencha todos os campos');
      return;
    }

    const animals = JSON.parse(localStorage.getItem('univet_animals') || '[]');
    const updatedAnimals = animals.map((a: Animal) => 
      a.id === id ? formData : a
    );
    localStorage.setItem('univet_animals', JSON.stringify(updatedAnimals));

    toast.success('Animal atualizado com sucesso!');
    navigate(`/tutor/animal/${id}`);
  };

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Editar Animal" showBack />

      <div className="px-6 py-6">
        <div className="mobile-card space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do animal</Label>
            <Input
              id="name"
              placeholder="Ex: Thor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="species">Espécie</Label>
            <Select value={formData.species} onValueChange={(value) => setFormData({ ...formData, species: value })}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione a espécie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Cachorro</SelectItem>
                <SelectItem value="cat">Gato</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">Raça</Label>
            <Input
              id="breed"
              placeholder="Ex: Golden Retriever"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              placeholder="Ex: 3 anos"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Sexo</Label>
            <Select value={formData.sex} onValueChange={(value) => setFormData({ ...formData, sex: value })}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Macho</SelectItem>
                <SelectItem value="female">Fêmea</SelectItem>
              </SelectContent>
            </Select>
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

export default AnimalEdit;
