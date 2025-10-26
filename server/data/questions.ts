import type { QuizQuestion } from '../../lib/types';

export const quizQuestions: readonly QuizQuestion[] = [
  {
    id: 'q10',
    prompt: 'What is the scheduled wedding date?',
    options: [
      { id: 'q10-a', label: '1' },
      { id: 'q10-b', label: '2' },
      { id: 'q10-c', label: '3' },
      { id: 'q10-d', label: '4' }
    ],
    correctOptionId: 'q10-b'
  }
] as const satisfies readonly QuizQuestion[];
