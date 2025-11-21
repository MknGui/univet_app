import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Dog, Cat, Calendar, Edit, Trash2, ChevronRight, Syringe, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getVaccinesByAnimalId, getTriagesByAnimalId } from '@/data/mockData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Animal {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: string;
  sex: 'male' | 'female';
}

const AnimalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [recentTriages, setRecentTriages] = useState<any[]>([]);

  useEffect(() => {
    // Carregar animal do localStorage
    const animals = JSON.parse(localStorage.getItem('univet_animals') || '[]');
    const foundAnimal = animals.find((a: Animal) => a.id === id);
    
    if (!foundAnimal) {
      toast.error('Animal não encontrado');
      navigate('/tutor/animals');
      return;
    }
    
    setAnimal(foundAnimal);
    
    // Load vaccines and triages
    const animalVaccines = getVaccinesByAnimalId(id || '');
    setVaccines(animalVaccines);
    
    const animalTriages = getTriagesByAnimalId(id || '').slice(0, 3);
    setRecentTriages(animalTriages);
  }, [id, navigate]);

  const handleDelete = () => {
    const animals = JSON.parse(localStorage.getItem('univet_animals') || '[]');
    const updatedAnimals = animals.filter((a: Animal) => a.id !== id);
    localStorage.setItem('univet_animals', JSON.stringify(updatedAnimals));
    toast.success('Animal removido com sucesso');
    navigate('/tutor/animals');
  };

  if (!animal) {
    return null;
  }

  const SpeciesIcon = animal.species === 'cat' ? Cat : Dog;

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Detalhes do Animal" showBack />

      <div className="px-6 py-6 space-y-6">
        {/* Animal Header */}
        <div className="mobile-card text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <SpeciesIcon className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{animal.name}</h2>
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {animal.species === 'dog' ? 'Cachorro' : animal.species === 'cat' ? 'Gato' : 'Outro'}
          </span>
        </div>

        {/* Info Cards */}
        <div className="mobile-card space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Raça</span>
            <span className="font-semibold">{animal.breed}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Idade</span>
            <span className="font-semibold">{animal.age}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Sexo</span>
            <span className="font-semibold">{animal.sex === 'male' ? 'Macho' : 'Fêmea'}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate('/tutor/triage')}
            className="h-20 flex flex-col gap-2 gradient-primary"
          >
            <Calendar className="w-6 h-6" />
            <span className="text-sm">Nova Triagem</span>
          </Button>
          <Button
            onClick={() => navigate('/tutor/appointment/new')}
            variant="outline"
            className="h-20 flex flex-col gap-2"
          >
            <Calendar className="w-6 h-6" />
            <span className="text-sm">Agendar</span>
          </Button>
        </div>

        {/* Vaccination Card */}
        <div className="mobile-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Syringe className="w-5 h-5 text-primary" />
              📘 Carteira de Vacinação
            </h3>
            <Button
              onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nova Vacina
            </Button>
          </div>
          
          {vaccines.length > 0 ? (
            <div className="space-y-3">
              {vaccines.map((vaccine) => (
                <div key={vaccine.id} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{vaccine.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(vaccine.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Lote: {vaccine.lot}</p>
                  {vaccine.nextDose && (
                    <p className="text-xs text-primary mt-1">
                      Próxima dose: {new Date(vaccine.nextDose).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma vacina registrada
            </p>
          )}
        </div>

        {/* Recent Triages */}
        {recentTriages.length > 0 && (
          <div className="mobile-card">
            <h3 className="font-semibold mb-4">Triagens Recentes</h3>
            <div className="space-y-3">
              {recentTriages.map((triage) => (
                <div key={triage.id} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{triage.symptoms.join(', ')}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(triage.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      triage.urgency === 'high' ? 'bg-red-500/10 text-red-500' :
                      triage.urgency === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-success/10 text-success'
                    }`}>
                      {triage.urgency === 'high' ? 'Urgente' : 
                       triage.urgency === 'medium' ? 'Atenção' : 'Normal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Animal History */}
        <div className="mobile-card">
          <h3 className="font-semibold mb-4">Histórico Completo</h3>
          <Button
            onClick={() => navigate(`/tutor/animal/${id}/history`)}
            variant="outline"
            className="w-full justify-between"
          >
            <span>Ver Histórico Detalhado</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate(`/tutor/animal/${id}/edit`)}
            variant="outline"
            className="w-full h-12"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Informações
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 text-destructive hover:bg-destructive/10 border-destructive/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remover Animal
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover Animal</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover {animal.name}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </MobileLayout>
  );
};

export default AnimalDetails;
