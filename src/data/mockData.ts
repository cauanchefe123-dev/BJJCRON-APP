import { AcademyConfig, BJJClass, Graduation, PaymentRecord, Student, Teacher, TeacherObservation, TrainingLog, User, AttendanceRecord } from '../types';
import { DEFAULT_BLACK_GI_AVATAR } from '../constants/avatar';

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'prof-1',
    name: 'Prof. Gabriel "Fera" Santos',
    email: 'professor@bjjcron.com',
    phone: '(11) 98765-4321',
    belt: 'PRETA',
    degrees: 3,
    specialty: 'Jiu-Jitsu Fundamental, Avançado & Competição',
    cref: '012345-G/SP',
    photoUrl: DEFAULT_BLACK_GI_AVATAR,
    bio: 'Faixa preta 3º Grau, 15 anos de experiência no tatame, Campeão Brasileiro IBJJF.',
    active: true,
    startDate: '2015-03-01'
  },
  {
    id: 'prof-2',
    name: 'Profª. Beatriz Santos',
    email: 'beatriz.marrom@email.com',
    phone: '(11) 97777-6655',
    belt: 'MARROM',
    degrees: 2,
    specialty: 'Jiu-Jitsu Kids & Defesa Pessoal Feminina',
    cref: '098765-G/SP',
    photoUrl: DEFAULT_BLACK_GI_AVATAR,
    bio: 'Especialista em pedagogia infantil aplicada às artes marciais e guarda aberta.',
    active: true,
    startDate: '2020-01-20'
  },
  {
    id: 'prof-3',
    name: 'Mestre Carlos Gracie Jr.',
    email: 'admin@bjjcron.com',
    phone: '(11) 99887-1122',
    belt: 'PRETA',
    degrees: 6,
    specialty: 'Open Mat, Treinos de Graduação & Gestão Técnica',
    cref: '001122-G/SP',
    photoUrl: DEFAULT_BLACK_GI_AVATAR,
    bio: 'Líder técnico fundador da equipe e orientador dos exames de faixa.',
    active: true,
    startDate: '2010-01-01'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-cauan',
    name: 'Cauan (Responsável)',
    email: 'cauanchefe123@gmail.com',
    role: 'ADMIN',
    avatarUrl: DEFAULT_BLACK_GI_AVATAR,
    phone: '(11) 99999-9999',
    password: '123',
    approvalStatus: 'APPROVED',
    isActivated: true
  }
];

export const INITIAL_ACADEMY_CONFIG: AcademyConfig = {
  name: 'BJJCRON ACADEMY',
  fantasyName: 'BJJCRON Jiu-Jitsu Headquarter',
  cnpj: '12.345.678/0001-90',
  headCoachName: 'Mestre Gabriel "Fera" Santos',
  headCoachBelt: 'PRETA',
  phone: '(11) 3210-9988',
  email: 'contato@bjjcron.com.br',
  address: 'Av. Paulista, 1500 - 3º Andar, São Paulo - SP',
  logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=200',
  pixKey: '12345678000190',
  environmentMode: 'HOMOLOGATION',
  graduationCriteria: {
    BRANCA: { classesPerStripe: 30, monthsForNextBelt: 12 },
    CINZA: { classesPerStripe: 15, monthsForNextBelt: 6 },
    AMARELA: { classesPerStripe: 15, monthsForNextBelt: 6 },
    LARANJA: { classesPerStripe: 20, monthsForNextBelt: 8 },
    VERDE: { classesPerStripe: 20, monthsForNextBelt: 8 },
    AZUL: { classesPerStripe: 40, monthsForNextBelt: 18 },
    ROXA: { classesPerStripe: 50, monthsForNextBelt: 18 },
    MARROM: { classesPerStripe: 60, monthsForNextBelt: 12 },
    PRETA: { classesPerStripe: 100, monthsForNextBelt: 36 }
  },
  supabaseConfig: {
    url: '',
    anonKey: '',
    connected: false
  }
};

export const INITIAL_CLASSES: BJJClass[] = [
  {
    id: 'cls-1',
    title: 'Jiu-Jitsu Fundamental (Gi)',
    professorId: 'user-prof-1',
    professorName: 'Prof. Gabriel "Fera"',
    daysOfWeek: [1, 3, 5], // Seg, Qua, Sex
    time: '07:00',
    durationMinutes: 75,
    category: 'FUNDAMENTAL',
    maxCapacity: 30,
    active: true,
    description: 'Posturas, defesas pessoais, raspagens básicas, passagens e controle de posição.'
  },
  {
    id: 'cls-2',
    title: 'Jiu-Jitsu Avançado & Competição',
    professorId: 'user-prof-1',
    professorName: 'Prof. Gabriel "Fera"',
    daysOfWeek: [1, 2, 3, 4, 5], // Seg a Sex
    time: '12:00',
    durationMinutes: 90,
    category: 'AVANÇADO',
    maxCapacity: 25,
    active: true,
    description: 'Estratégias de luta, guarda moderna, leglocks, drill de alta intensidade e rola específico.'
  },
  {
    id: 'cls-3',
    title: 'No-Gi / Submission Grappling',
    professorId: 'user-prof-1',
    professorName: 'Prof. Gabriel "Fera"',
    daysOfWeek: [2, 4], // Ter, Qui
    time: '19:30',
    durationMinutes: 90,
    category: 'NO_GI',
    maxCapacity: 35,
    active: true,
    description: 'Luta sem kimono. Foco em guilhotinas, leglocks, derrubadas e controle sem esgrima.'
  },
  {
    id: 'cls-4',
    title: 'Open Mat / Treino Livre',
    professorId: 'user-prof-1',
    professorName: 'Mestre Carlos Gracie',
    daysOfWeek: [6], // Sábado
    time: '10:00',
    durationMinutes: 120,
    category: 'OPEN_MAT',
    maxCapacity: 50,
    active: true,
    description: 'Treino aberto para todas as faixas e academias parceiras. Rola livre e estudos.'
  },
  {
    id: 'cls-5',
    title: 'Jiu-Jitsu Kids (6 a 12 anos)',
    professorId: 'user-prof-1',
    professorName: 'Profª. Beatriz Santos',
    daysOfWeek: [2, 4], // Ter, Qui
    time: '17:00',
    durationMinutes: 60,
    category: 'KIDS',
    maxCapacity: 20,
    active: true,
    description: 'Desenvolvimento motor, disciplina, respeito e jogos educativos de Jiu-Jitsu.'
  }
];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    studentId: 'std-1',
    studentName: 'Lucas Silva',
    amount: 220,
    dueDate: '2026-07-10',
    paymentDate: '2026-07-05',
    status: 'PAGO',
    paymentMethod: 'PIX',
    referenceMonth: '07/2026',
    pixCode: '00020126580014BR.GOV.BCB.PIX0114123456780001905204000053039865405220.005802BR5915BJJCRON ACADEMY6009SAO PAULO62070503***6304E2D1'
  },
  {
    id: 'pay-2',
    studentId: 'std-2',
    studentName: 'Ana Paula Oliveira',
    amount: 240,
    dueDate: '2026-07-05',
    paymentDate: '2026-07-02',
    status: 'PAGO',
    paymentMethod: 'CARTAO',
    referenceMonth: '07/2026'
  },
  {
    id: 'pay-3',
    studentId: 'std-3',
    studentName: 'Rodrigo Mendes',
    amount: 260,
    dueDate: '2026-07-15',
    status: 'PENDENTE',
    referenceMonth: '07/2026',
    pixCode: '00020126580014BR.GOV.BCB.PIX0114123456780001905204000053039865405260.005802BR5915BJJCRON ACADEMY6009SAO PAULO62070503***630491A2'
  },
  {
    id: 'pay-4',
    studentId: 'std-4',
    studentName: 'Beatriz Santos',
    amount: 200,
    dueDate: '2026-07-10',
    paymentDate: '2026-07-08',
    status: 'PAGO',
    paymentMethod: 'PIX',
    referenceMonth: '07/2026'
  },
  {
    id: 'pay-5',
    studentId: 'std-5',
    studentName: 'Enzo Gabriel Costa',
    amount: 190,
    dueDate: '2026-07-20',
    paymentDate: '2026-07-18',
    status: 'PAGO',
    paymentMethod: 'PIX',
    referenceMonth: '07/2026'
  },
  {
    id: 'pay-6',
    studentId: 'std-6',
    studentName: 'Felipe Camargo',
    amount: 260,
    dueDate: '2026-07-05',
    status: 'ATRASADO',
    referenceMonth: '07/2026'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-101',
    studentId: 'std-1',
    studentName: 'Lucas Silva',
    classId: 'cls-2',
    className: 'Jiu-Jitsu Avançado & Competição',
    date: '2026-07-28',
    timestamp: '2026-07-28T12:05:00Z',
    method: 'QR_CODE_STUDENT',
    verifiedBy: 'Sistema'
  },
  {
    id: 'att-102',
    studentId: 'std-2',
    studentName: 'Ana Paula Oliveira',
    classId: 'cls-2',
    className: 'Jiu-Jitsu Avançado & Competição',
    date: '2026-07-28',
    timestamp: '2026-07-28T12:10:00Z',
    method: 'QR_CODE_STUDENT',
    verifiedBy: 'Sistema'
  },
  {
    id: 'att-103',
    studentId: 'std-3',
    studentName: 'Rodrigo Mendes',
    classId: 'cls-1',
    className: 'Jiu-Jitsu Fundamental (Gi)',
    date: '2026-07-27',
    timestamp: '2026-07-27T07:02:00Z',
    method: 'MANUAL',
    verifiedBy: 'Prof. Gabriel "Fera"'
  },
  {
    id: 'att-104',
    studentId: 'std-4',
    studentName: 'Beatriz Santos',
    classId: 'cls-2',
    className: 'Jiu-Jitsu Avançado & Competição',
    date: '2026-07-27',
    timestamp: '2026-07-27T12:00:00Z',
    method: 'MANUAL',
    verifiedBy: 'Prof. Gabriel "Fera"'
  },
  {
    id: 'att-105',
    studentId: 'std-1',
    studentName: 'Lucas Silva',
    classId: 'cls-3',
    className: 'No-Gi / Submission Grappling',
    date: '2026-07-26',
    timestamp: '2026-07-26T19:35:00Z',
    method: 'QR_CODE_STUDENT'
  },
  {
    id: 'att-106',
    studentId: 'std-2',
    studentName: 'Ana Paula Oliveira',
    classId: 'cls-3',
    className: 'No-Gi / Submission Grappling',
    date: '2026-07-26',
    timestamp: '2026-07-26T19:30:00Z',
    method: 'QR_CODE_STUDENT'
  }
];

export const INITIAL_GRADUATIONS: Graduation[] = [
  {
    id: 'grad-1',
    studentId: 'std-1',
    belt: 'AZUL',
    stripes: 2,
    promotedBy: 'Prof. Gabriel "Fera" Santos',
    promotedAt: '2026-04-15',
    notes: 'Outorgado 2º grau por mérito técnico e vice-campeonato regional.',
    classesCountAtPromotion: 90
  },
  {
    id: 'grad-2',
    studentId: 'std-1',
    belt: 'AZUL',
    stripes: 1,
    promotedBy: 'Prof. Gabriel "Fera" Santos',
    promotedAt: '2025-10-10',
    notes: 'Primeiro grau na faixa azul.',
    classesCountAtPromotion: 50
  },
  {
    id: 'grad-3',
    studentId: 'std-2',
    belt: 'ROXA',
    stripes: 3,
    promotedBy: 'Mestre Carlos Gracie',
    promotedAt: '2026-02-20',
    notes: 'Excelente desempenho técnico no exame de graduação.',
    classesCountAtPromotion: 260
  }
];

export const INITIAL_TRAINING_LOGS: TrainingLog[] = [
  {
    id: 'log-1',
    studentId: 'std-1',
    date: '2026-07-28',
    durationMinutes: 90,
    techniquesLearned: ['Raspagem da Guarda Aranha', 'Passagem de Guarda Emborcando', 'Triângulo Ajustado'],
    roundsCount: 6,
    notes: 'Treino muito puxado. Consegui ajustar bem o quadril na raspagem de aranha.',
    moodRating: 5
  },
  {
    id: 'log-2',
    studentId: 'std-1',
    date: '2026-07-26',
    durationMinutes: 90,
    techniquesLearned: ['Entrada de Leg Lock No-Gi', 'Defesa de Guillotine'],
    roundsCount: 5,
    notes: 'Treino de No-Gi pegado. Foco no posicionamento de calcanhar.',
    moodRating: 4
  }
];

export const INITIAL_BELT_REQUESTS = [
  {
    id: 'req-1',
    studentId: 'std-1',
    studentName: 'Lucas Oliveira',
    currentBelt: 'AZUL' as const,
    currentStripes: 3,
    requestedBelt: 'ROXA' as const,
    requestedStripes: 0,
    requestDate: '2026-07-28',
    notes: 'Atingi a quantidade necessária de aulas e cumpri o tempo mínimo de permanência na faixa azul.',
    status: 'PENDING' as const,
  }
];

export const INITIAL_TEACHER_OBSERVATIONS: TeacherObservation[] = [
  {
    id: 'obs-1',
    studentId: 'std-1',
    studentName: 'Lucas Silva',
    teacherId: 'tch-1',
    teacherName: 'Prof. Gabriel "Fera" Santos',
    date: '2026-07-27',
    title: 'Ajuste na Postura da Guarda Fechada',
    content: 'Excelente aproveitamento nos treinos desta semana! Atenção apenas na postura dentro da guarda fechada para não ceder a gola com facilidade no início do rola.',
    category: 'TÉCNICA'
  },
  {
    id: 'obs-2',
    studentId: 'std-1',
    studentName: 'Lucas Silva',
    teacherId: 'tch-1',
    teacherName: 'Prof. Gabriel "Fera" Santos',
    date: '2026-07-20',
    title: 'Evolução no Gas e Ritmo de Luta',
    content: 'Ótima constância na frequência de treinos. Seu ritmo no treino de competição subiu bastante. Mantenha essa pegada rumo ao próximo grau!',
    category: 'EVOLUÇÃO'
  }
];

