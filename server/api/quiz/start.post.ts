import { startSession } from '../../../services/quizSession';
import { readBody } from 'h3';
import { z } from 'zod';

const startSchema = z.object({
  playerId: z.string().min(1)
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = startSchema.parse(body);
  const view = await startSession(parsed.playerId);
  return { view };
});
