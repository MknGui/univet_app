import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getPet, updatePet } from '@/api/pets';

interface AnimalForm {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  sex: string;
}

const AnimalEdit = () => {
  const params = useParams();
  const navigate = useNavigate();
  // Suporta rota com :id ou :animalId
  const petId = params.id ?? (params as any).animalId;

  const [formData, setFormData] = useState<AnimalForm>({
    id: '',
    name: '',
    species: '',
    breed: '',
    age: '',
    sex: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadAnimal = async () => {
      if (!petId) {
        toast.error('Animal não encontrado');
        navigate('/tutor/animals');
        return;
      }

      try {
        const pet = await getPet(petId);
        const anyPet = pet as any;

        const breed =
          anyPet.breed ||
          (Array.isArray(anyPet.breeds) && anyPet.breeds.length > 0
            ? anyPet.breeds.join(', ')
            : '');

        setFormData({
          id: String(pet.id),
          name: pet.name ?? '',
          species: pet.species ?? '',
          breed,
          age: pet.age != null ? String(pet.age) : '',
          sex: pet.sex ?? '',
        });
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Erro ao carregar animal');
        navigate('/tutor/animals');
      } finally {
        setLoading(false);
      }
    };

    loadAnimal();
  }, [petId, navigate]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.species || !formData.breed || !formData.sex) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    let ageNumber: number | null = null;
    if (formData.age.trim() !== '') {
      const n = Number(formData.age);
      if (!Number.isFinite(n) || n < 0) {
        toast.error('Idade deve ser um número válido (em anos)');
        return;
      }
      ageNumber = n;
    }

    if (!petId) {
      toast.error('Animal não encontrado');
      return;
    }

    setSaving(true);
    try {
      await updatePet(petId, {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed,
        sex: formData.sex,
        age: ageNumber,
      });

      toast.success('Animal atualizado com sucesso!');
      navigate('/tutor/animals');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader title="Editar Animal" showBack />
        <div className="px-6 py-6">
          <div className="mobile-card text-center py-12">
            <p className="text-sm text-muted-foreground">Carregando dados do animal...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!formData.id) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader title="Editar Animal" showBack />
        <div className="px-6 py-6">
          <div className="mobile-card text-center py-12">
            <p className="text-sm text-muted-foreground">Animal não encontrado.</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

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
            <Select
              value={formData.species}
              onValueChange={(value) => setFormData({ ...formData, species: value })}
            >
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
            <Label htmlFor="breed">Raça(s)</Label>
            <Input
              id="breed"
              placeholder="Ex: Golden Retriever, SRD"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              Use vírgula para separar múltiplas raças.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Idade (em anos)</Label>
            <Input
              id="age"
              placeholder="Ex: 3"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Sexo</Label>
            <Select
              value={formData.sex}
              onValueChange={(value) => setFormData({ ...formData, sex: value })}
            >
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
            disabled={saving}
            className="w-full h-12 text-base font-semibold gradient-primary mt-2"
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default AnimalEdit;
