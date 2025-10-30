import { serverSupabaseClient } from '#supabase/server';

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data } = await client.from('quiz').select('*')
  console.log("quiz data: " + data);

  return {}
})