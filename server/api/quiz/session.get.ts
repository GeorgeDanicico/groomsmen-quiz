import { getSessionView } from '../../../services/quizSession';

export default defineEventHandler(async () => {
  const view = await getSessionView();
  return { view };
});
