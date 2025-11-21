import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Plus, Dog } from 'lucide-react';
import { CardAnimal } from '@/components/cards/CardAnimal';
import { Animal } from '@/data/mockData';

const Animals = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    // Carregar animais do localStorage
    const storedAnimals = JSON.parse(localStorage.getItem('univet_animals') || '[]');
    setAnimals(storedAnimals);
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
        {animals.length > 0 ? (
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
