import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { MobileHeader } from '@/components/MobileHeader';
import { Heart, Pill, Droplet, Sparkles, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EducationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const contents: any = {
    '1': {
      title: 'Alimentação Saudável para Cães',
      category: 'Alimentação',
      icon: Heart,
      color: 'bg-red-500/10 text-red-600',
      content: `
        <h2>Importância da Alimentação Adequada</h2>
        <p>Uma dieta balanceada é fundamental para a saúde e longevidade do seu cão. A alimentação correta fornece todos os nutrientes necessários para manter seu pet ativo, saudável e feliz.</p>
        
        <h3>Nutrientes Essenciais</h3>
        <ul>
          <li><strong>Proteínas:</strong> Fundamentais para o crescimento e manutenção dos músculos</li>
          <li><strong>Carboidratos:</strong> Fonte de energia para atividades diárias</li>
          <li><strong>Gorduras:</strong> Importantes para a pele, pelo e absorção de vitaminas</li>
          <li><strong>Vitaminas e Minerais:</strong> Essenciais para diversas funções corporais</li>
        </ul>

        <h3>Frequência de Alimentação</h3>
        <p>A frequência ideal varia com a idade:</p>
        <ul>
          <li>Filhotes (2-6 meses): 4 refeições por dia</li>
          <li>Filhotes (6-12 meses): 3 refeições por dia</li>
          <li>Adultos: 2 refeições por dia</li>
          <li>Idosos: 2 refeições menores ou conforme orientação veterinária</li>
        </ul>

        <h3>Dicas Importantes</h3>
        <ul>
          <li>Sempre deixe água fresca e limpa disponível</li>
          <li>Evite alimentos humanos, especialmente chocolate, cebola e uva</li>
          <li>Mantenha horários regulares de alimentação</li>
          <li>Escolha ração de qualidade adequada à idade e porte do animal</li>
          <li>Consulte regularmente o veterinário para ajustes na dieta</li>
        </ul>
      `,
      readTime: '5 min',
      link: 'https://www.exemplo.com/alimentacao-caes'
    },
    '2': {
      title: 'Calendário de Vacinação',
      category: 'Vacinação',
      icon: Pill,
      color: 'bg-blue-500/10 text-blue-600',
      content: `
        <h2>Importância da Vacinação</h2>
        <p>As vacinas são essenciais para proteger seu pet contra doenças graves e potencialmente fatais. Manter o calendário de vacinação em dia é uma das principais responsabilidades de um tutor.</p>

        <h3>Vacinas Essenciais para Cães</h3>
        <ul>
          <li><strong>V8 ou V10:</strong> Protege contra cinomose, parvovirose, hepatite, entre outras</li>
          <li><strong>Antirrábica:</strong> Obrigatória por lei, protege contra a raiva</li>
          <li><strong>Traqueobronquite (Tosse dos Canis):</strong> Recomendada para cães que frequentam locais com outros animais</li>
        </ul>

        <h3>Calendário de Vacinação para Filhotes</h3>
        <ul>
          <li>6-8 semanas: Primeira dose da V8/V10</li>
          <li>12 semanas: Segunda dose da V8/V10</li>
          <li>16 semanas: Terceira dose da V8/V10 + Antirrábica</li>
          <li>Reforço anual de todas as vacinas</li>
        </ul>

        <h3>Vacinas para Gatos</h3>
        <ul>
          <li><strong>V3, V4 ou V5:</strong> Protege contra panleucopenia, rinotraqueíte e calicivirose</li>
          <li><strong>Antirrábica:</strong> Obrigatória por lei</li>
          <li><strong>Leucemia Felina:</strong> Recomendada para gatos com acesso à rua</li>
        </ul>

        <h3>Cuidados Pós-Vacinação</h3>
        <ul>
          <li>Observe o animal por 24-48 horas após a vacinação</li>
          <li>Reações leves como sonolência são normais</li>
          <li>Evite banhos por 48 horas</li>
          <li>Em caso de reações graves, procure o veterinário imediatamente</li>
        </ul>
      `,
      readTime: '6 min',
      link: 'https://www.exemplo.com/vacinacao'
    },
    '3': {
      title: 'Higiene Bucal em Gatos',
      category: 'Higiene',
      icon: Droplet,
      color: 'bg-cyan-500/10 text-cyan-600',
      content: `
        <h2>Saúde Bucal dos Felinos</h2>
        <p>A higiene bucal é frequentemente negligenciada em gatos, mas é fundamental para prevenir doenças graves e garantir qualidade de vida ao seu pet.</p>

        <h3>Principais Problemas Bucais em Gatos</h3>
        <ul>
          <li><strong>Gengivite:</strong> Inflamação das gengivas causada por acúmulo de placa</li>
          <li><strong>Doença Periodontal:</strong> Pode levar à perda de dentes e infecções</li>
          <li><strong>Estomatite:</strong> Inflamação severa da boca</li>
          <li><strong>Reabsorção Dentária:</strong> Lesões dolorosas nos dentes</li>
        </ul>

        <h3>Como Cuidar dos Dentes do seu Gato</h3>
        <ul>
          <li><strong>Escovação:</strong> Ideal diariamente, usando escova e pasta específicas para gatos</li>
          <li><strong>Alimentação:</strong> Ração seca ajuda na limpeza mecânica dos dentes</li>
          <li><strong>Petiscos Dentais:</strong> Auxiliam na remoção de placa bacteriana</li>
          <li><strong>Limpeza Profissional:</strong> Consulte o veterinário anualmente</li>
        </ul>

        <h3>Sinais de Problemas Bucais</h3>
        <ul>
          <li>Mau hálito persistente</li>
          <li>Dificuldade para comer ou preferência por alimentos macios</li>
          <li>Salivação excessiva</li>
          <li>Gengivas vermelhas ou sangrando</li>
          <li>Comportamento alterado ao tocar próximo à boca</li>
        </ul>

        <h3>Introduzindo a Escovação</h3>
        <p>Comece gradualmente, acostumando o gato ao toque na boca. Use recompensas e seja paciente. A escovação regular pode adicionar anos de vida ao seu felino!</p>
      `,
      readTime: '5 min',
      link: 'https://www.exemplo.com/higiene-bucal-gatos'
    },
    '4': {
      title: 'Exercícios e Enriquecimento',
      category: 'Bem-estar',
      icon: Sparkles,
      color: 'bg-purple-500/10 text-purple-600',
      content: `
        <h2>Importância do Enriquecimento Ambiental</h2>
        <p>Exercícios físicos e estimulação mental são essenciais para o bem-estar do seu pet. Um animal ativo e mentalmente estimulado é mais feliz e saudável.</p>

        <h3>Benefícios dos Exercícios</h3>
        <ul>
          <li>Controle de peso e prevenção da obesidade</li>
          <li>Redução de comportamentos destrutivos</li>
          <li>Melhora da saúde cardiovascular</li>
          <li>Fortalecimento do vínculo com o tutor</li>
          <li>Redução de ansiedade e estresse</li>
        </ul>

        <h3>Atividades para Cães</h3>
        <ul>
          <li><strong>Passeios:</strong> Essenciais diariamente, adapte a intensidade à raça e idade</li>
          <li><strong>Brincadeiras de Buscar:</strong> Estimula corpo e mente</li>
          <li><strong>Agility:</strong> Treinos com obstáculos</li>
          <li><strong>Natação:</strong> Excelente para cães com problemas articulares</li>
          <li><strong>Jogos de Inteligência:</strong> Brinquedos interativos e puzzles</li>
        </ul>

        <h3>Enriquecimento para Gatos</h3>
        <ul>
          <li><strong>Torres e Prateleiras:</strong> Gatos adoram altura</li>
          <li><strong>Brinquedos Interativos:</strong> Varinhas, bolinhas e lasers</li>
          <li><strong>Arranhadores:</strong> Essenciais para o comportamento natural</li>
          <li><strong>Esconderijos:</strong> Caixas e túneis</li>
          <li><strong>Janelas com Vista:</strong> Observar o exterior é estimulante</li>
        </ul>

        <h3>Dicas Importantes</h3>
        <ul>
          <li>Respeite os limites do seu pet</li>
          <li>Varie as atividades para evitar o tédio</li>
          <li>Consulte o veterinário antes de iniciar novos exercícios</li>
          <li>Observe sinais de cansaço ou desconforto</li>
          <li>Faça das atividades momentos de diversão e conexão</li>
        </ul>
      `,
      readTime: '6 min',
      link: 'https://www.exemplo.com/exercicios-enriquecimento'
    },
    '5': {
      title: 'Nutrição para Filhotes',
      category: 'Alimentação',
      icon: Heart,
      color: 'bg-red-500/10 text-red-600',
      content: `
        <h2>Alimentação na Fase de Crescimento</h2>
        <p>Os primeiros meses de vida são cruciais para o desenvolvimento do seu filhote. Uma nutrição adequada nesta fase estabelece as bases para uma vida longa e saudável.</p>

        <h3>Necessidades Nutricionais Especiais</h3>
        <p>Filhotes precisam de mais calorias, proteínas e nutrientes específicos do que adultos para suportar seu rápido crescimento e desenvolvimento.</p>

        <h3>Fases da Alimentação</h3>
        <ul>
          <li><strong>0-4 semanas:</strong> Leite materno exclusivo</li>
          <li><strong>4-8 semanas:</strong> Introdução gradual de ração úmida para filhotes</li>
          <li><strong>2-6 meses:</strong> Ração para filhotes 4x ao dia</li>
          <li><strong>6-12 meses:</strong> 3x ao dia, começar transição para adulto</li>
        </ul>

        <h3>Escolhendo a Ração Ideal</h3>
        <ul>
          <li>Opte por rações premium específicas para filhotes</li>
          <li>Considere o porte adulto esperado (pequeno, médio, grande)</li>
          <li>Verifique se é nutricionalmente completa (selo AAFCO ou similar)</li>
          <li>Evite rações com muitos corantes e conservantes artificiais</li>
        </ul>

        <h3>Suplementação</h3>
        <p>Rações de qualidade já são completas. Suplementos só devem ser dados com orientação veterinária, pois o excesso pode ser prejudicial.</p>

        <h3>Sinais de Boa Nutrição</h3>
        <ul>
          <li>Pelo brilhante e saudável</li>
          <li>Energia e disposição para brincar</li>
          <li>Crescimento adequado para a raça</li>
          <li>Fezes firmes e regulares</li>
          <li>Olhos brilhantes e alertas</li>
        </ul>

        <h3>Erros Comuns a Evitar</h3>
        <ul>
          <li>Dar comida de humanos (pode causar problemas digestivos)</li>
          <li>Trocar bruscamente de ração (cause diarreia)</li>
          <li>Superalimentar (obesidade prejudica o desenvolvimento)</li>
          <li>Deixar ração disponível o tempo todo (melhor ter horários)</li>
        </ul>
      `,
      readTime: '7 min',
      link: 'https://www.exemplo.com/nutricao-filhotes'
    },
    '6': {
      title: 'Banho e Tosa',
      category: 'Higiene',
      icon: Droplet,
      color: 'bg-cyan-500/10 text-cyan-600',
      content: `
        <h2>Cuidados com Banho e Tosa</h2>
        <p>A higiene regular é fundamental não apenas para a aparência, mas principalmente para a saúde da pele e pelo do seu pet.</p>

        <h3>Frequência Ideal de Banhos</h3>
        <ul>
          <li><strong>Cães:</strong> A cada 7-15 dias, dependendo da raça e estilo de vida</li>
          <li><strong>Gatos:</strong> Raramente necessário, pois se limpam sozinhos (exceto raças específicas)</li>
          <li><strong>Filhotes:</strong> Após a segunda vacinação, com água morna</li>
        </ul>

        <h3>Produtos Adequados</h3>
        <ul>
          <li>Use sempre shampoo específico para pets</li>
          <li>Evite produtos humanos (pH diferente prejudica a pele)</li>
          <li>Condicionador ajuda em pelos longos</li>
          <li>Para peles sensíveis, use produtos hipoalergênicos</li>
        </ul>

        <h3>Passo a Passo do Banho</h3>
        <ol>
          <li>Escove bem antes do banho para remover pelos soltos</li>
          <li>Use água morna, teste a temperatura</li>
          <li>Molhe todo o corpo, evitando orelhas e olhos</li>
          <li>Aplique shampoo e massageie suavemente</li>
          <li>Enxágue completamente (resíduos causam coceira)</li>
          <li>Seque com toalha e, se necessário, secador em temperatura baixa</li>
        </ol>

        <h3>Tosa e Cuidados com o Pelo</h3>
        <ul>
          <li><strong>Escovação:</strong> Diária para pelos longos, semanal para curtos</li>
          <li><strong>Tosa Higiênica:</strong> A cada 1-2 meses, especialmente em áreas íntimas</li>
          <li><strong>Tosa Completa:</strong> Conforme necessidade e clima</li>
          <li><strong>Corte de Unhas:</strong> Mensalmente ou quando necessário</li>
        </ul>

        <h3>Cuidados Especiais</h3>
        <ul>
          <li>Limpe as orelhas regularmente com produtos específicos</li>
          <li>Verifique a presença de parasitas durante o banho</li>
          <li>Não banhe pets doentes sem orientação veterinária</li>
          <li>Mantenha o ambiente aquecido durante o banho</li>
          <li>Recompense o pet após o banho com carinho ou petisco</li>
        </ul>

        <h3>Quando Procurar um Profissional</h3>
        <p>Para tosas mais elaboradas, raças com pelos complexos ou animais muito ansiosos, um pet shop profissional é a melhor opção.</p>
      `,
      readTime: '6 min',
      link: 'https://www.exemplo.com/banho-tosa'
    }
  };

  const content = contents[id || '1'];
  const Icon = content.icon;

  return (
    <MobileLayout>
      <MobileHeader title="Conteúdo Educacional" showBack />

      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-16 h-16 ${content.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{content.category}</p>
            <h1 className="text-2xl font-bold">{content.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{content.readTime} de leitura</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          className="prose prose-sm max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: content.content }}
          style={{
            color: 'var(--foreground)',
          }}
        />

        {/* External Link */}
        <Button
          onClick={() => window.open(content.link, '_blank')}
          className="w-full gradient-primary"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Ler mais no site oficial
        </Button>
      </div>
    </MobileLayout>
  );
};

export default EducationDetail;
