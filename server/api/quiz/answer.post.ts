import { submitAnswer } from '../../../services/quizSession';
import { readBody } from 'h3';
import { z } from 'zod';

const answerSchema = z.object({
  playerId: z.string().min(1),
  questionId: z.string().min(1),
  optionId: z.string().min(1)
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = answerSchema.parse(body);
  const view = await submitAnswer(parsed);
  return { view };
});
