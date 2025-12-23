import type { JoinQuizRequest, JoinQuizResponse, QuizSessionView, SubmitAnswerPayload } from '~/lib/types';

interface SessionResponse {
  readonly view: QuizSessionView;
}

export const useQuizSessionApi = () => {
  const fetchSession = async (): Promise<SessionResponse> => {
    return await $fetch<SessionResponse>('/api/quiz/session');
  };

  const joinSession = async (payload: JoinQuizRequest): Promise<JoinQuizResponse> => {
    return await $fetch<JoinQuizResponse>('/api/quiz/join', {
      method: 'POST',
      body: payload
    });
  };

  const startSession = async (playerId: string): Promise<SessionResponse> => {
    return await $fetch<SessionResponse>('/api/quiz/start', {
      method: 'POST',
      body: { playerId }
    });
  };

  const submitAnswer = async (payload: SubmitAnswerPayload): Promise<SessionResponse> => {
    return await $fetch<SessionResponse>('/api/quiz/answer', {
      method: 'POST',
      body: payload
    });
  };

  return {
    fetchSession,
    joinSession,
    startSession,
    submitAnswer
  };
};
