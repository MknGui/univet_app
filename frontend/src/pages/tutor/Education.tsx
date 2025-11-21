import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, Pill, Droplet, Sparkles } from 'lucide-react';

interface Content {
  id: string;
  title: string;
  summary: string;
  category: string;
  icon: any;
  color: string;
}

const Education = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'nutrition', label: 'Alimentação', icon: Heart },
    { id: 'vaccination', label: 'Vacinação', icon: Pill },
    { id: 'hygiene', label: 'Higiene', icon: Droplet },
    { id: 'wellbeing', label: 'Bem-estar', icon: Sparkles },
  ];

  const contents: Content[] = [
    {
      id: '1',
      title: 'Alimentação Saudável para Cães',
      summary: 'Aprenda sobre a dieta ideal para manter seu cachorro saudável e cheio de energia.',
      category: 'nutrition',
      icon: Heart,
      color: 'bg-red-500/10 text-red-600'
    },
    {
      id: '2',
      title: 'Calendário de Vacinação',
      summary: 'Mantenha as vacinas do seu pet em dia. Veja o calendário completo de imunização.',
      category: 'vaccination',
      icon: Pill,
      color: 'bg-blue-500/10 text-blue-600'
    },
    {
      id: '3',
      title: 'Higiene Bucal em Gatos',
      summary: 'Cuidados essenciais com a saúde bucal do seu felino para prevenir doenças.',
      category: 'hygiene',
      icon: Droplet,
      color: 'bg-cyan-500/10 text-cyan-600'
    },
    {
      id: '4',
      title: 'Exercícios e Enriquecimento',
      summary: 'Atividades para manter seu pet ativo, feliz e mentalmente estimulado.',
      category: 'wellbeing',
      icon: Sparkles,
      color: 'bg-purple-500/10 text-purple-600'
    },
    {
      id: '5',
      title: 'Nutrição para Filhotes',
      summary: 'Tudo sobre alimentação adequada para o crescimento saudável de filhotes.',
      category: 'nutrition',
      icon: Heart,
      color: 'bg-red-500/10 text-red-600'
    },
    {
      id: '6',
      title: 'Banho e Tosa',
      summary: 'Frequência ideal e técnicas para manter a higiene e aparência do seu pet.',
      category: 'hygiene',
      icon: Droplet,
      color: 'bg-cyan-500/10 text-cyan-600'
    }
  ];

  const filteredContents = selectedCategory
    ? contents.filter(c => c.category === selectedCategory)
    : contents;

  return (
    <MobileLayout>
      <MobileHeader title="Conteúdo Educacional" />

      <div className="px-6 py-6 space-y-6">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? 'gradient-primary' : ''}
          >
            Todos
          </Button>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id ? 'gradient-primary' : ''}
              >
                <Icon className="w-4 h-4 mr-2" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="space-y-4">
          {filteredContents.map((content) => {
            const Icon = content.icon;
            return (
              <button
                key={content.id}
                onClick={() => navigate(`/tutor/education/${content.id}`)}
                className="w-full mobile-card text-left hover:shadow-lg transition-all active:scale-95"
              >
                <div className="flex gap-4">
                  <div className={`w-14 h-14 ${content.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 line-clamp-1">{content.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {content.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">5 min de leitura</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Education;
