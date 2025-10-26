import { joinSession } from '../../../services/quizSession';
import { readBody } from 'h3';
import { z } from 'zod';

const joinSchema = z.object({
  name: z.string().min(1).max(50),
  playerId: z.string().min(1).optional().nullable()
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsed = joinSchema.parse(body);
  const result = await joinSession({
    name: parsed.name,
    playerId: parsed.playerId ?? null
  });
  return result;
});
