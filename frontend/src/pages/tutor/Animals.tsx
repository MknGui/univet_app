import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Plus, Dog } from 'lucide-react';
import { CardAnimal } from '@/components/cards/CardAnimal';
import { toast } from 'sonner';
import { listPets, Pet } from '@/api/pets';

export interface Animal {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: string; // já vem formatada pra tela
  sex: 'male' | 'female';
}

// converte o Pet do backend para o formato que o CardAnimal espera
const mapPetToAnimal = (pet: Pet): Animal => {
  const rawSpecies = (pet.species || 'other').toLowerCase();
  const species: 'dog' | 'cat' | 'other' =
    rawSpecies === 'dog'
      ? 'dog'
      : rawSpecies === 'cat'
      ? 'cat'
      : 'other';

  const rawSex = (pet.sex || '').toLowerCase();
  const sex: 'male' | 'female' =
    rawSex === 'female' || rawSex === 'fêmea'
      ? 'female'
      : 'male';

  const anyPet = pet as any;

  const breed =
    anyPet.breed ||
    (Array.isArray(anyPet.breeds) && anyPet.breeds.length > 0
      ? anyPet.breeds.join(', ')
      : 'SRD / Não informada');

  // 👇 AQUI estava o problema: antes era sempre "Não informada"
  const ageLabel =
    pet.age != null
      ? `${pet.age} ano${pet.age === 1 ? '' : 's'}`
      : 'Não informada';

  return {
    id: String(pet.id),
    name: pet.name,
    species,
    breed,
    age: ageLabel,
    sex,
  };
};

const Animals = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const pets = await listPets();
        const mapped = pets.map(mapPetToAnimal);
        setAnimals(mapped);
      } catch (error) {
        console.error(error);
        toast.error('Erro ao carregar animais');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  return (
    <MobileLayout>
      <MobileHeader
        title="Meus Animais"
        action={
          <Button
            size="icon"
            onClick={() => navigate('/tutor/animal/new')}
            className="h-9 w-9 gradient-primary"
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-6 py-6 space-y-4">
        {loading && animals.length === 0 ? (
          <div className="mobile-card text-center py-12">
            <Dog className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">Carregando animais...</h3>
            <p className="text-sm text-muted-foreground">
              Buscando seus pets cadastrados
            </p>
          </div>
        ) : animals.length > 0 ? (
          animals.map((animal) => (
            <CardAnimal
              key={animal.id}
              animal={animal}
              onClick={() => navigate(`/tutor/animal/${animal.id}`)}
            />
          ))
        ) : (
          <div className="mobile-card text-center py-12">
            <Dog className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">Nenhum animal cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Cadastre seu pet para começar a usar o UNIVET
            </p>
            <Button
              onClick={() => navigate('/tutor/animal/new')}
              className="gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Animal
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Animals;
