import { createError, readBody } from 'h3';
import { serverSupabaseClient } from '#supabase/server';
import { z } from 'zod';
import type { Json, TablesInsert } from '@/pages/types/database.types';

const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(jsonSchema)
  ])
);

const payloadSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required.'),
  status: z.string().min(1).optional(),
  details: jsonSchema
});

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const body = await readBody(event);

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid quiz payload',
      data: parsed.error.flatten()
    });
  }

  const { roomNumber, status, details } = parsed.data;

  const insertPayload: TablesInsert<'quiz'> = {
    room_number: roomNumber,
    question_data: details,
    status: status ?? 'draft'
  };

  const { data, error } = await client
    .from('quiz')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create quiz',
      data: error
    });
  }

  return {
    quiz: data
  };
});
