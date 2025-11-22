import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { createPet } from '@/api/pets';

const AnimalNew = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breeds: [] as string[],
    age: '',
    sex: ''
  });
  const [customBreed, setCustomBreed] = useState('');
  const [loading, setLoading] = useState(false);

  const breedsBySpecies = {
    dog: [
      'Golden Retriever', 'Labrador', 'Pastor Alemão', 'Bulldog',
      'Poodle', 'Shih Tzu', 'Yorkshire', 'Beagle', 'SRD (Sem Raça Definida)'
    ],
    cat: [
      'Persa', 'Siamês', 'Maine Coon', 'Ragdoll',
      'British Shorthair', 'Bengal', 'SRD (Sem Raça Definida)'
    ],
    other: ['Outra']
  };

  const availableBreeds = formData.species
    ? breedsBySpecies[formData.species as keyof typeof breedsBySpecies] || []
    : [];

  const toggleBreed = (breed: string) => {
    setFormData(prev => ({
      ...prev,
      breeds: prev.breeds.includes(breed)
        ? prev.breeds.filter(b => b !== breed)
        : [...prev.breeds, breed]
    }));
  };

  const addCustomBreed = () => {
    if (customBreed.trim() && !formData.breeds.includes(customBreed.trim())) {
      setFormData(prev => ({
        ...prev,
        breeds: [...prev.breeds, customBreed.trim()]
      }));
      setCustomBreed('');
    }
  };

  const removeBreed = (breed: string) => {
    setFormData(prev => ({
      ...prev,
      breeds: prev.breeds.filter(b => b !== breed)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.species || formData.breeds.length === 0 || !formData.age || !formData.sex) {
      toast.error('Preencha todos os campos');
      return;
    }

    // valida idade numérica
    const ageNumber = Number(formData.age);
    if (!Number.isFinite(ageNumber) || ageNumber <= 0) {
      toast.error('Idade deve ser um número válido (em anos)');
      return;
    }

    setLoading(true);
    try {
      const breedLabel = formData.breeds.join(', ');

        await createPet({
          name: formData.name.trim(),
          species: formData.species,
          breed: breedLabel,
          sex: formData.sex,
          age: ageNumber, // agora vai pro backend
        });


      toast.success('Animal cadastrado com sucesso!');
      navigate('/tutor/animals');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao cadastrar animal. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Cadastrar Animal" showBack />

      <div className="px-6 py-6 space-y-4">
        <div className="mobile-card space-y-2">
          <Label htmlFor="name">Nome do animal</Label>
          <Input
            id="name"
            placeholder="Ex: Thor"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="mobile-card space-y-2">
          <Label htmlFor="species">Espécie</Label>
          <Select
            value={formData.species}
            onValueChange={(value) => setFormData({ ...formData, species: value, breeds: [] })}
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

        {formData.species && (
          <div className="mobile-card space-y-3">
            <Label>Raça(s) - Múltipla Seleção</Label>

            {formData.breeds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.breeds.map((breed) => (
                  <div
                    key={breed}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    <span>{breed}</span>
                    <button
                      onClick={() => removeBreed(breed)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {availableBreeds.map((breed) => (
                  <label
                    key={breed}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.breeds.includes(breed)}
                      onCheckedChange={() => toggleBreed(breed)}
                    />
                    <span>{breed}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Outra raça..."
                  value={customBreed}
                  onChange={(e) => setCustomBreed(e.target.value)}
                  className="h-10"
                />
                <Button type="button" variant="outline" onClick={addCustomBreed}>
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mobile-card space-y-2">
          <Label htmlFor="age">Idade (em anos)</Label>
          <Input
            id="age"
            placeholder="Ex: 3"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="mobile-card space-y-2">
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
          disabled={loading}
          className="w-full h-12 text-base font-semibold gradient-primary mt-2"
        >
          {loading ? 'Salvando...' : 'Cadastrar Animal'}
        </Button>
      </div>
    </MobileLayout>
  );
};

export default AnimalNew;
