import { Dog, Cat, ChevronRight } from 'lucide-react';
import { Animal } from '@/data/mockData';

interface CardAnimalProps {
  animal: Animal;
  onClick: () => void;
}

export const CardAnimal = ({ animal, onClick }: CardAnimalProps) => {
  const getSpeciesIcon = (species: string) => {
    return species === 'cat' ? Cat : Dog;
  };

  const SpeciesIcon = getSpeciesIcon(animal.species);

  return (
    <button
      onClick={onClick}
      className="w-full mobile-card hover:shadow-lg transition-all active:scale-95"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <SpeciesIcon className="w-8 h-8 text-primary" />
        </div>
        
        <div className="flex-1 text-left min-w-0">
          {/* Nome em preto + #id em cinza, igual CardAgendamento */}
          <div className="flex items-center gap-1 mb-1 min-w-0">
            <span className="font-semibold text-lg truncate">{animal.name}</span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              #{animal.id}
            </span>
          </div>

          <p className="text-sm text-muted-foreground truncate">{animal.breed}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{animal.age}</span>
            <span>•</span>
            <span>{animal.sex === 'male' ? 'Macho' : 'Fêmea'}</span>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
    </button>
  );
};
