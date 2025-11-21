import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ClinicalSign {
  id: string;
  label: string;
  severity: 'high' | 'medium' | 'low';
}

const Triage = () => {
  const navigate = useNavigate();
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [selectedSigns, setSelectedSigns] = useState<string[]>([]);
  const [result, setResult] = useState<{
    severity: 'urgent' | 'monitor' | 'ok';
    message: string;
  } | null>(null);

  const clinicalSigns: ClinicalSign[] = [
    { id: 'fever', label: 'Febre', severity: 'high' },
    { id: 'apathy', label: 'Apatia', severity: 'medium' },
    { id: 'cough', label: 'Tosse', severity: 'medium' },
    { id: 'vomit', label: 'Vômito', severity: 'high' },
    { id: 'appetite_loss', label: 'Perda de apetite', severity: 'medium' },
    { id: 'diarrhea', label: 'Diarreia', severity: 'high' },
    { id: 'difficulty_breathing', label: 'Dificuldade para respirar', severity: 'high' },
    { id: 'lethargy', label: 'Letargia', severity: 'medium' },
  ];

  const toggleSign = (signId: string) => {
    setSelectedSigns(prev =>
      prev.includes(signId)
        ? prev.filter(id => id !== signId)
        : [...prev, signId]
    );
    setResult(null);
  };

  const analyzeSymptoms = () => {
    if (!selectedAnimal) {
      toast.error('Selecione um animal');
      return;
    }

    if (selectedSigns.length === 0) {
      toast.error('Selecione pelo menos um sinal clínico');
      return;
    }

    // IA Simulada - Análise baseada em regras simples
    const selectedSignsData = clinicalSigns.filter(sign => selectedSigns.includes(sign.id));
    const highSeveritySigns = selectedSignsData.filter(sign => sign.severity === 'high');
    
    let severity: 'urgent' | 'monitor' | 'ok';
    let message: string;

    if (highSeveritySigns.length >= 2 || selectedSigns.length >= 4) {
      severity = 'urgent';
      message = 'Procure atendimento veterinário imediatamente. Os sinais clínicos identificados indicam necessidade de avaliação profissional urgente.';
    } else if (highSeveritySigns.length === 1 || selectedSigns.length >= 2) {
      severity = 'monitor';
      message = 'Monitore o animal nas próximas 24 horas. Se os sintomas piorarem ou novos sintomas aparecerem, procure um veterinário.';
    } else {
      severity = 'ok';
      message = 'Os sinais clínicos são leves. Continue observando seu animal. Caso persistam ou se intensifiquem, agende uma consulta.';
    }

    setResult({ severity, message });
    toast.success('Análise concluída');
  };

  const getResultIcon = () => {
    if (!result) return null;
    
    switch (result.severity) {
      case 'urgent':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'monitor':
        return <Clock className="w-12 h-12 text-warning" />;
      case 'ok':
        return <CheckCircle2 className="w-12 h-12 text-success" />;
    }
  };

  const getResultColor = () => {
    if (!result) return '';
    
    switch (result.severity) {
      case 'urgent':
        return 'bg-red-500/10 border-red-500/20';
      case 'monitor':
        return 'bg-warning/10 border-warning/20';
      case 'ok':
        return 'bg-success/10 border-success/20';
    }
  };

  return (
    <MobileLayout>
      <MobileHeader title="Triagem Rápida" />

      <div className="px-6 py-6 space-y-6">
        <div className="mobile-card">
          <Label className="mb-3 block">Selecione o animal</Label>
          <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Escolha um animal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thor">Thor</SelectItem>
              <SelectItem value="luna">Luna</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mobile-card">
          <h3 className="font-semibold mb-4">Sinais Clínicos Observados</h3>
          <div className="space-y-3">
            {clinicalSigns.map((sign) => (
              <div key={sign.id} className="flex items-center space-x-3">
                <Checkbox
                  id={sign.id}
                  checked={selectedSigns.includes(sign.id)}
                  onCheckedChange={() => toggleSign(sign.id)}
                />
                <Label
                  htmlFor={sign.id}
                  className="flex-1 cursor-pointer select-none"
                >
                  {sign.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={analyzeSymptoms}
          disabled={!selectedAnimal || selectedSigns.length === 0}
          className="w-full h-12 text-base font-semibold gradient-primary"
        >
          Analisar Sinais
        </Button>

        {result && (
          <div className={`mobile-card border-2 ${getResultColor()}`}>
            <div className="flex flex-col items-center text-center gap-4">
              {getResultIcon()}
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {result.severity === 'urgent' && 'Atenção Imediata'}
                  {result.severity === 'monitor' && 'Monitoramento Necessário'}
                  {result.severity === 'ok' && 'Situação Controlada'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.message}
                </p>
              </div>
              
              {(result.severity === 'urgent' || result.severity === 'monitor') && (
                <div className="w-full pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-3">Recomendamos uma consulta veterinária</p>
                  <Button
                    onClick={() => navigate('/tutor/appointment/new', { 
                      state: { animalId: selectedAnimal } 
                    })}
                    className="w-full gradient-primary"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Consulta
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Triage;
