import type { QuizQuestion } from '../../app/lib/types';

export const quizQuestions: readonly QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Din ce an suntem impreuna?',
    options: [
      { id: 'q1-a', label: '2016' },
      { id: 'q1-b', label: '2018' },
      { id: 'q1-c', label: '2019' },
      { id: 'q1-d', label: '2017' }
    ],
    correctOptionId: 'q1-d'
  },
  {
    id: 'q2',
    prompt: 'Cine va fi mostenitorul care va duce numele mai departe?',
    options: [
      { id: 'q2-a', label: 'Brian' },
      { id: 'q2-b', label: 'Bryan' },
      { id: 'q2-c', label: 'Cassiopeia' },
      { id: 'q2-d', label: 'Elinor' }
    ],
    correctOptionId: 'q2-b'
  },
  {
    id: 'q3',
    prompt: 'In ce oras am cerut-o pe Iasmina?',
    options: [
      { id: 'q3-a', label: 'Paris' },
      { id: 'q3-b', label: 'Milano' },
      { id: 'q3-c', label: 'Cluj-Napoca' },
      { id: 'q3-d', label: 'Satu Mare' }
    ],
    correctOptionId: 'q3-b'
  },
  {
    id: 'q4',
    prompt: 'Cum i se mai zice la viitorul meu socru?',
    options: [
      { id: 'q4-a', label: 'Bossangeles' },
      { id: 'q4-b', label: 'Bosanova' },
      { id: 'q4-c', label: 'Nu stiu' },
      { id: 'q4-d', label: 'Bossbaros' }
    ],
    correctOptionId: 'q4-a'
  },
  {
    id: 'q5',
    prompt: 'Care este cea mai mare amenda pe care am primit-o?',
    options: [
      { id: 'q5-a', label: '15 Lei' },
      { id: 'q5-b', label: '75 Euro' },
      { id: 'q5-c', label: '700 Lei' },
      { id: 'q5-d', label: '400 Lei' }
    ],
    correctOptionId: 'q5-c'
  },
  {
    id: 'q6',
    prompt: 'Cati frati am?',
    options: [
      { id: 'q6-a', label: '0' },
      { id: 'q6-b', label: '1' },
      { id: 'q6-c', label: '2' },
      { id: 'q6-d', label: '3' }
    ],
    correctOptionId: 'q6-b'
  },
  {
    id: 'q7',
    prompt: 'E mai mare sau mai mic?',
    options: [
      { id: 'q7-a', label: 'Mai mare' },
      { id: 'q7-b', label: 'Mai mic' }
    ],
    correctOptionId: 'q7-a'
  },
  {
    id: 'q8',
    prompt: 'Cum o sa o cheme pe viitoarea mea sotie?',
    options: [
      { id: 'q8-a', label: 'Gloria' },
      { id: 'q8-b', label: 'Maria' },
      { id: 'q8-c', label: 'Iasmina' },
      { id: 'q8-d', label: 'Elinor' }
    ],
    correctOptionId: 'q8-c'
  },
  {
    id: 'q9',
    prompt: 'Ce voiam sa ma fac cand eram mic?',
    options: [
      { id: 'q9-a', label: 'Pompier' },
      { id: 'q9-b', label: 'Politist' },
      { id: 'q9-c', label: 'Medic' },
      { id: 'q9-d', label: 'Gunoier' }
    ],
    correctOptionId: 'q9-d'
  },
    {
    id: 'q10',
    prompt: 'Cand ma casatoresc?',
    options: [
      { id: 'q10-a', label: '26 Mai 2026' },
      { id: 'q10-b', label: '21 Mai 2026' },
      { id: 'q10-c', label: '23 Mai 2025' },
      { id: 'q10-d', label: '23 Mai 2026' }
    ],
    correctOptionId: 'q10-d'
  }
] as const satisfies readonly QuizQuestion[];
