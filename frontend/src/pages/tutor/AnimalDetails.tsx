import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Dog, Cat, Calendar, Edit, Trash2, ChevronRight, Syringe, Plus } from 'lucide-react';
import { toast } from 'sonner';
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
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPet, deletePet, listPetVaccines, createPetVaccine, PetVaccine } from '@/api/pets';
import { getTriagesByAnimalId } from '@/data/mockData';

interface AnimalView {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: string;
  sex: 'male' | 'female';
}

const mapPetToAnimalView = (pet: any): AnimalView => {
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

  const breed =
    pet.breed ||
    (Array.isArray(pet.breeds) && pet.breeds.length > 0
      ? pet.breeds.join(', ')
      : 'SRD / Não informada');

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

const AnimalDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const petId = params.id ?? (params as any).animalId;

  const [animal, setAnimal] = useState<AnimalView | null>(null);
  const [vaccines, setVaccines] = useState<PetVaccine[]>([]);
  const [recentTriages, setRecentTriages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVaccines, setLoadingVaccines] = useState(true);
  const [showNewVaccineForm, setShowNewVaccineForm] = useState(false);
  const [savingVaccine, setSavingVaccine] = useState(false);
  const [newVaccine, setNewVaccine] = useState({
    name: '',
    date: '',
    lot: '',
    next_dose: '',
  });

  useEffect(() => {
    const loadAnimal = async () => {
      if (!petId) {
        toast.error('Animal não encontrado');
        navigate('/tutor/animals');
        return;
      }

      try {
        const pet = await getPet(petId);
        setAnimal(mapPetToAnimalView(pet));

        const animalTriages = getTriagesByAnimalId(String(pet.id)).slice(0, 3);
        setRecentTriages(animalTriages);
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Erro ao carregar informações do animal');
        navigate('/tutor/animals');
      } finally {
        setLoading(false);
      }
    };

    loadAnimal();
  }, [petId, navigate]);

  useEffect(() => {
    const loadVaccines = async () => {
      if (!petId) return;
      try {
        setLoadingVaccines(true);
        const data = await listPetVaccines(petId);
        setVaccines(data);
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Erro ao carregar vacinas');
      } finally {
        setLoadingVaccines(false);
      }
    };

    loadVaccines();
  }, [petId]);

  const handleDelete = async () => {
    if (!petId) {
      toast.error('Animal não encontrado');
      return;
    }
    try {
      await deletePet(petId);
      toast.success('Animal removido com sucesso!');
      navigate('/tutor/animals');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Erro ao remover animal');
    }
  };

  const handleCreateVaccine = async () => {
    if (!petId) {
      toast.error('Animal não encontrado');
      return;
    }

    if (!newVaccine.name || !newVaccine.date) {
      toast.error('Preencha nome e data da vacina');
      return;
    }

    setSavingVaccine(true);
    try {
      const created = await createPetVaccine(petId, {
        name: newVaccine.name.trim(),
        date: newVaccine.date,
        lot: newVaccine.lot || undefined,
        next_dose: newVaccine.next_dose || undefined,
      });

      setVaccines((prev) => [created, ...prev]);
      setNewVaccine({ name: '', date: '', lot: '', next_dose: '' });
      setShowNewVaccineForm(false);
      toast.success('Vacina registrada com sucesso!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Erro ao registrar vacina');
    } finally {
      setSavingVaccine(false);
    }
  };

  if (loading || !animal) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader title="Detalhes do Animal" showBack />
        <div className="px-6 py-6">
          <div className="mobile-card text-center py-12">
            <p className="text-sm text-muted-foreground">Carregando informações do animal...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const SpeciesIcon = animal.species === 'cat' ? Cat : Dog;

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader title="Detalhes do Animal" showBack />

      <div className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="mobile-card text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <SpeciesIcon className="w-12 h-12 text-primary" />
          </div>

          {/* Nome em preto + #id em cinza */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">{animal.name}</h2>
            <span className="text-sm text-muted-foreground">#{animal.id}</span>
          </div>

          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {animal.species === 'dog'
              ? 'Cachorro'
              : animal.species === 'cat'
              ? 'Gato'
              : 'Outro'}
          </span>
        </div>

        {/* Info */}
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
            <span className="font-semibold">
              {animal.sex === 'male' ? 'Macho' : 'Fêmea'}
            </span>
          </div>
        </div>

        {/* Ações rápidas */}
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

        {/* Carteira de Vacinação */}
        <div className="mobile-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Syringe className="w-5 h-5 text-primary" />
              Carteira de Vacinação
            </h3>
            <Button
              size="sm"
              variant={showNewVaccineForm ? 'outline' : 'default'}
              className={showNewVaccineForm ? '' : 'gradient-primary'}
              onClick={() => setShowNewVaccineForm((prev) => !prev)}
            >
              <Plus className="w-4 h-4 mr-1" />
              {showNewVaccineForm ? 'Cancelar' : 'Nova Vacina'}
            </Button>
          </div>

          {showNewVaccineForm && (
            <div className="space-y-3 border border-border rounded-lg p-3">
              <div className="space-y-1">
                <Label htmlFor="vaccine-name">Nome da vacina</Label>
                <Input
                  id="vaccine-name"
                  placeholder="Ex: V10, Antirrábica..."
                  value={newVaccine.name}
                  onChange={(e) =>
                    setNewVaccine((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="vaccine-date">Data da aplicação</Label>
                <Input
                  id="vaccine-date"
                  type="date"
                  value={newVaccine.date}
                  onChange={(e) =>
                    setNewVaccine((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="vaccine-lot">Lote (opcional)</Label>
                <Input
                  id="vaccine-lot"
                  placeholder="Número do lote"
                  value={newVaccine.lot}
                  onChange={(e) =>
                    setNewVaccine((prev) => ({ ...prev, lot: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="vaccine-next-dose">Próxima dose (opcional)</Label>
                <Input
                  id="vaccine-next-dose"
                  type="date"
                  value={newVaccine.next_dose}
                  onChange={(e) =>
                    setNewVaccine((prev) => ({ ...prev, next_dose: e.target.value }))
                  }
                />
              </div>

              <Button
                onClick={handleCreateVaccine}
                disabled={savingVaccine}
                className="w-full h-10 text-sm font-semibold gradient-primary mt-1"
              >
                {savingVaccine ? 'Salvando...' : 'Salvar vacina'}
              </Button>
            </div>
          )}

          {loadingVaccines ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Carregando vacinas...
            </p>
          ) : vaccines.length > 0 ? (
            <div className="space-y-3">
              {vaccines.map((vaccine) => (
                <div key={vaccine.id} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{vaccine.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {vaccine.date
                          ? new Date(vaccine.date).toLocaleDateString('pt-BR')
                          : ''}
                      </span>
                    </div>
                    {vaccine.lot && (
                      <p className="text-xs text-muted-foreground">
                        Lote: {vaccine.lot}
                      </p>
                    )}
                  </div>
                  {vaccine.next_dose && (
                    <p className="text-xs text-primary mt-1">
                      Próxima dose:{' '}
                      {new Date(vaccine.next_dose).toLocaleDateString('pt-BR')}
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

        {/* Triagens recentes */}
        {recentTriages.length > 0 && (
          <div className="mobile-card">
            <h3 className="font-semibold mb-4">Triagens Recentes</h3>
            <div className="space-y-3">
              {recentTriages.map((triage) => (
                <div key={triage.id} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">
                        {triage.symptoms.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(triage.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        triage.urgency === 'high'
                          ? 'bg-red-500/10 text-red-500'
                          : triage.urgency === 'medium'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-success/10 text-success'
                      }`}
                    >
                      {triage.urgency === 'high'
                        ? 'Urgente'
                        : triage.urgency === 'medium'
                        ? 'Atenção'
                        : 'Normal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Histórico completo */}
        <div className="mobile-card">
          <h3 className="font-semibold mb-4">Histórico Completo</h3>
          <Button
            onClick={() => navigate(`/tutor/animal/${animal.id}/history`)}
            variant="outline"
            className="w-full justify-between"
          >
            <span>Ver Histórico Detalhado</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Botões finais */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate(`/tutor/animal/${animal.id}/edit`)}
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
                  Tem certeza que deseja remover {animal.name}? Esta ação não pode ser
                  desfeita.
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
