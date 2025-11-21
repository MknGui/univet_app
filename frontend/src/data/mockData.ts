// Mock data for UNIVET app - centralized data source

export interface Animal {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: string;
  sex: 'male' | 'female';
  tutorId: string;
  photo?: string;
}

export interface Triage {
  id: string;
  animalId: string;
  animalName: string;
  date: string;
  signs: string[];
  severity: 'urgent' | 'monitor' | 'ok';
  recommendation: string;
}

export interface Consultation {
  id: string;
  animalId: string;
  animalName: string;
  tutorName: string;
  vetId: string;
  vetName: string;
  date: string;
  time: string;
  diagnosis: string;
  treatment: string;
  observations: string;
  status: 'completed' | 'scheduled' | 'cancelled';
  nextVisit?: string;
}

export interface Appointment {
  id: string;
  animalId: string;
  animalName: string;
  tutorId: string;
  tutorName: string;
  vetId?: string;
  vetName?: string;
  date: string;
  time: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
}

export interface EducationalContent {
  id: string;
  title: string;
  category: 'nutricao' | 'comportamento' | 'saude' | 'cuidados';
  description: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'appointment' | 'triage' | 'consultation' | 'reminder';
  read: boolean;
}

export interface Veterinarian {
  id: string;
  name: string;
  crmv: string;
  specialty: string;
  location: string;
  region: string;
  availableSlots: {
    date: string;
    times: string[];
  }[];
}

export interface Vaccine {
  id: string;
  animalId: string;
  name: string;
  date: string;
  lot: string;
  nextDose?: string;
}

// Mock Animals
export const mockAnimals: Animal[] = [
  {
    id: '1',
    name: 'Thor',
    species: 'dog',
    breed: 'Golden Retriever',
    age: '3 anos',
    sex: 'male',
    tutorId: 'tutor1',
  },
  {
    id: '2',
    name: 'Luna',
    species: 'cat',
    breed: 'Siamês',
    age: '2 anos',
    sex: 'female',
    tutorId: 'tutor1',
  },
  {
    id: '3',
    name: 'Rex',
    species: 'dog',
    breed: 'Pastor Alemão',
    age: '5 anos',
    sex: 'male',
    tutorId: 'tutor2',
  },
];

// Mock Triages
export const mockTriages: Triage[] = [
  {
    id: 't1',
    animalId: '1',
    animalName: 'Thor',
    date: '2025-11-03',
    signs: ['Febre', 'Apatia', 'Perda de apetite'],
    severity: 'monitor',
    recommendation: 'Monitore nas próximas 24h. Se piorar, procure atendimento.',
  },
  {
    id: 't2',
    animalId: '2',
    animalName: 'Luna',
    date: '2025-10-28',
    signs: ['Vômito', 'Diarreia'],
    severity: 'urgent',
    recommendation: 'Procure atendimento veterinário imediatamente.',
  },
  {
    id: 't3',
    animalId: '1',
    animalName: 'Thor',
    date: '2025-10-15',
    signs: ['Tosse'],
    severity: 'ok',
    recommendation: 'Continue observando. Agende consulta se persistir.',
  },
];

// Compatibility - map severity to urgency for triages
export const getTriagesByAnimalId = (animalId: string) => 
  mockTriages
    .filter(t => t.animalId === animalId)
    .map(t => ({ ...t, urgency: t.severity, symptoms: t.signs }));

// Mock Consultations
export const mockConsultations: Consultation[] = [
  {
    id: 'c1',
    animalId: '1',
    animalName: 'Thor',
    tutorName: 'João Silva',
    vetId: 'vet1',
    vetName: 'Dra. Maria Santos',
    date: '2025-10-20',
    time: '14:30',
    diagnosis: 'Gripe canina leve',
    treatment: 'Repouso e medicação sintomática',
    observations: 'Retornar em 7 dias para reavaliação',
    status: 'completed',
    nextVisit: '2025-11-27',
  },
  {
    id: 'c2',
    animalId: '2',
    animalName: 'Luna',
    tutorName: 'João Silva',
    vetId: 'vet1',
    vetName: 'Dra. Maria Santos',
    date: '2025-10-25',
    time: '15:00',
    diagnosis: 'Gastroenterite',
    treatment: 'Dieta leve e probióticos',
    observations: 'Manter hidratação adequada',
    status: 'completed',
    nextVisit: '2025-11-08',
  },
  {
    id: 'c3',
    animalId: '3',
    animalName: 'Rex',
    tutorName: 'Maria Costa',
    vetId: 'vet1',
    vetName: 'Dra. Maria Santos',
    date: '2025-11-05',
    time: '10:00',
    diagnosis: 'Pendente',
    treatment: 'Pendente',
    observations: 'Consulta agendada',
    status: 'scheduled',
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: 'a1',
    animalId: '1',
    animalName: 'Thor',
    tutorId: 'tutor1',
    tutorName: 'João Silva',
    vetId: 'vet1',
    vetName: 'Dra. Maria Santos',
    date: '2025-11-05',
    time: '14:30',
    type: 'Consulta de rotina',
    status: 'confirmed',
    notes: 'Checkup anual',
  },
  {
    id: 'a2',
    animalId: '2',
    animalName: 'Luna',
    tutorId: 'tutor1',
    tutorName: 'João Silva',
    vetId: 'vet1',
    vetName: 'Dra. Maria Santos',
    date: '2025-11-05',
    time: '15:30',
    type: 'Vacinação',
    status: 'confirmed',
  },
  {
    id: 'a3',
    animalId: '3',
    animalName: 'Rex',
    tutorId: 'tutor2',
    tutorName: 'Maria Costa',
    date: '2025-11-06',
    time: '10:00',
    type: 'Consulta de emergência',
    status: 'pending',
  },
  {
    id: 'a4',
    animalId: '1',
    animalName: 'Thor',
    tutorId: 'tutor1',
    tutorName: 'João Silva',
    vetId: 'vet1',
    vetName: 'Dra. Maria Santos',
    date: '2025-10-20',
    time: '14:30',
    type: 'Consulta de rotina',
    status: 'completed',
  },
];

// Mock Educational Content
export const mockEducationalContent: EducationalContent[] = [
  {
    id: 'e1',
    title: 'Alimentação Balanceada para Cães',
    category: 'nutricao',
    description: 'Aprenda sobre os nutrientes essenciais para manter seu cão saudável.',
    content: `
## Introdução
A alimentação adequada é fundamental para a saúde e bem-estar do seu cão.

## Nutrientes Essenciais
- **Proteínas**: Fundamentais para o desenvolvimento muscular
- **Carboidratos**: Fonte de energia
- **Gorduras**: Importantes para a saúde da pele e pelo
- **Vitaminas e minerais**: Essenciais para o funcionamento do organismo

## Quantidade Recomendada
A quantidade de alimento varia conforme:
- Porte do animal
- Idade
- Nível de atividade física
- Condições de saúde

## Dicas Importantes
1. Mantenha água fresca sempre disponível
2. Evite dar alimentos humanos
3. Respeite os horários das refeições
4. Consulte sempre seu veterinário
    `,
    author: 'Dra. Maria Santos',
    date: '2025-10-15',
    readTime: '5 min',
  },
  {
    id: 'e2',
    title: 'Comportamento Felino: Entendendo seu Gato',
    category: 'comportamento',
    description: 'Desvende os mistérios do comportamento dos gatos e melhore sua relação.',
    content: `
## Comunicação Felina
Os gatos se comunicam de diversas formas:

### Linguagem Corporal
- Cauda levantada: felicidade e confiança
- Orelhas para trás: medo ou agressividade
- Ronronar: geralmente contentamento

### Vocalizações
- Miados: forma de comunicação com humanos
- Rosnados: alerta ou defesa
- Chiados: medo ou ameaça

## Comportamentos Comuns
- **Arranhar**: comportamento natural para marcar território
- **Amassar**: sinal de conforto e afeto
- **Esconder-se**: necessidade de segurança

## Como Melhorar a Convivência
1. Respeite o espaço do gato
2. Ofereça arranhadores adequados
3. Brinque regularmente
4. Mantenha a caixa de areia limpa
    `,
    author: 'Dr. Carlos Mendes',
    date: '2025-10-20',
    readTime: '7 min',
  },
  {
    id: 'e3',
    title: 'Vacinação: Protegendo seu Pet',
    category: 'saude',
    description: 'Conheça o calendário de vacinação e sua importância.',
    content: `
## Importância da Vacinação
As vacinas protegem seu pet contra doenças graves e potencialmente fatais.

## Calendário Canino
### Filhotes
- 6-8 semanas: primeira dose múltipla
- 12 semanas: segunda dose múltipla
- 16 semanas: terceira dose múltipla + raiva

### Adultos
- Reforço anual das vacinas múltiplas
- Raiva a cada 3 anos

## Calendário Felino
### Filhotes
- 8 semanas: primeira dose tríplice
- 12 semanas: segunda dose tríplice
- 16 semanas: terceira dose + raiva

### Adultos
- Reforço anual

## Cuidados Pós-Vacinação
- Evite banhos por 7 dias
- Observe reações adversas
- Mantenha o animal em repouso
    `,
    author: 'Dra. Ana Paula',
    date: '2025-10-25',
    readTime: '6 min',
  },
  {
    id: 'e4',
    title: 'Cuidados com a Higiene do seu Pet',
    category: 'cuidados',
    description: 'Dicas essenciais para manter seu animal limpo e saudável.',
    content: `
## Banho
### Frequência
- Cães: a cada 15 dias (varia conforme raça)
- Gatos: raramente necessário

### Produtos
Use sempre produtos específicos para pets.

## Escovação
- Cães de pelo longo: diariamente
- Cães de pelo curto: semanalmente
- Gatos: 2-3 vezes por semana

## Higiene Dental
- Escove os dentes regularmente
- Ofereça brinquedos dentais
- Consultas odontológicas anuais

## Cuidados com Unhas
- Corte regular
- Observe se não estão ferindo
- Use cortador específico
    `,
    author: 'Dr. Pedro Oliveira',
    date: '2025-11-01',
    readTime: '4 min',
  },
];

// Mock Veterinarians
export const mockVeterinarians: Veterinarian[] = [
  {
    id: 'vet1',
    name: 'Dra. Maria Santos',
    crmv: 'CRMV-SP 12345',
    specialty: 'Clínica Geral',
    location: 'Clínica Veterinária Centro',
    region: 'Centro',
    availableSlots: [
      { date: '2025-11-05', times: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
      { date: '2025-11-06', times: ['08:00', '09:30', '11:00', '14:30', '16:00'] },
      { date: '2025-11-07', times: ['08:30', '10:00', '14:00', '15:30', '17:00'] },
    ]
  },
  {
    id: 'vet2',
    name: 'Dr. João Silva',
    crmv: 'CRMV-SP 23456',
    specialty: 'Cirurgia',
    location: 'Hospital Veterinário Norte',
    region: 'Zona Norte',
    availableSlots: [
      { date: '2025-11-05', times: ['09:00', '10:30', '14:00', '15:30'] },
      { date: '2025-11-06', times: ['08:30', '10:00', '13:30', '15:00'] },
      { date: '2025-11-07', times: ['09:00', '11:00', '14:30', '16:00'] },
    ]
  },
  {
    id: 'vet3',
    name: 'Dr. Pedro Costa',
    crmv: 'CRMV-SP 34567',
    specialty: 'Dermatologia',
    location: 'Clínica Pet Sul',
    region: 'Zona Sul',
    availableSlots: [
      { date: '2025-11-05', times: ['08:00', '10:00', '14:00', '16:00'] },
      { date: '2025-11-06', times: ['09:00', '11:00', '14:00', '15:30'] },
      { date: '2025-11-07', times: ['08:00', '10:30', '13:30', '15:00'] },
    ]
  }
];

// Mock Vaccines
export const mockVaccines: Vaccine[] = [
  {
    id: 'vac1',
    animalId: '1',
    name: 'V10 (Múltipla)',
    date: '2024-06-15',
    lot: 'ABC123456',
    nextDose: '2025-06-15'
  },
  {
    id: 'vac2',
    animalId: '1',
    name: 'Antirrábica',
    date: '2024-07-20',
    lot: 'XYZ789012',
    nextDose: '2025-07-20'
  },
  {
    id: 'vac3',
    animalId: '2',
    name: 'V4 (Múltipla)',
    date: '2024-05-10',
    lot: 'DEF456789',
    nextDose: '2025-05-10'
  },
  {
    id: 'vac4',
    animalId: '2',
    name: 'Antirrábica',
    date: '2024-06-05',
    lot: 'GHI345678',
    nextDose: '2025-06-05'
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Consulta Confirmada',
    message: 'Sua consulta com Thor foi confirmada para 05/11 às 14:30',
    date: '2025-11-03',
    type: 'appointment',
    read: false,
  },
  {
    id: 'n2',
    title: 'Lembrete de Vacinação',
    message: 'Luna precisa da dose de reforço da vacina múltipla',
    date: '2025-11-02',
    type: 'reminder',
    read: false,
  },
  {
    id: 'n3',
    title: 'Triagem Analisada',
    message: 'A triagem de Thor foi analisada. Monitore nas próximas 24h.',
    date: '2025-11-03',
    type: 'triage',
    read: true,
  },
  {
    id: 'n4',
    title: 'Resultado de Exame',
    message: 'Os resultados dos exames de Luna estão disponíveis',
    date: '2025-10-30',
    type: 'consultation',
    read: true,
  },
];

// Helper functions
export const getAnimalById = (id: string) => mockAnimals.find(a => a.id === id);
export const getConsultationsByAnimalId = (animalId: string) => mockConsultations.filter(c => c.animalId === animalId);
export const getAppointmentsByTutorId = (tutorId: string) => mockAppointments.filter(a => a.tutorId === tutorId);
export const getAppointmentsByVetId = (vetId: string) => mockAppointments.filter(a => a.vetId === vetId);
export const getUnreadNotifications = () => mockNotifications.filter(n => !n.read);
export const getVaccinesByAnimalId = (animalId: string) => mockVaccines.filter(v => v.animalId === animalId);
export const getVeterinarianById = (vetId: string) => mockVeterinarians.find(v => v.id === vetId);
