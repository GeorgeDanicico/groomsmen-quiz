import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import type {
  QuizPlayerAnswerStatus,
  QuizQuestionView,
  QuizResult,
  QuizQuestionResult,
  QuizSessionView,
  JoinQuizRequest
} from '~/lib/types';
import { useQuizSessionApi } from '~/composables/useQuizSessionApi';
import { QUIZ_POLLING_INTERVAL_MS } from '~/lib/constants';

const PLAYER_STORAGE_KEY = 'groomsmen-quiz/player';

const parseErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'statusMessage' in error) {
    return String((error as { statusMessage?: unknown }).statusMessage ?? 'Request failed');
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Request failed';
};

export const useQuizStore = defineStore('quiz', () => {
  const api = useQuizSessionApi();

  const view = ref<QuizSessionView | null>(null);
  const playerId = ref<string | null>(null);
  const playerName = ref<string>('');
  const loading = ref(false);
  const lastSyncedAt = ref<number | null>(null);
  const now = ref<number>(Date.now());
  const errorMessage = ref<string | null>(null);

  let pollInterval: number | null = null;
  let tickInterval: number | null = null;

  const status = computed(() => view.value?.session.status ?? 'lobby');
  const players = computed(() => view.value?.session.players ?? []);
  const isHost = computed(() => {
    if (!playerId.value) {
      return false;
    }
    return view.value?.session.hostId === playerId.value;
  });
  const currentQuestion = computed<QuizQuestionView | null>(() => view.value?.question ?? null);
  const answers = computed(() => view.value?.answers ?? [] as QuizPlayerAnswerStatus[]);
  const results = computed(() => view.value?.results ?? [] as QuizResult[]);
  const questionResults = computed(() => view.value?.questionResults ?? [] as QuizQuestionResult[]);
  const expiresAt = computed(() => view.value?.session.expiresAt ?? null);
  const remainingMs = computed(() => {
    const expires = expiresAt.value;
    if (!expires || status.value !== 'in-progress') {
      return 0;
    }
    return Math.max(0, expires - now.value);
  });
  const remainingSeconds = computed(() => Math.ceil(remainingMs.value / 1000));
  const hasAnsweredCurrent = computed(() => {
    if (!playerId.value || !currentQuestion.value) {
      return false;
    }
    return answers.value.some(
      (answer) => answer.playerId === playerId.value && Boolean(answer.optionId)
    );
  });

  // Persist the identity only when running on the client side.
  const persistIdentity = () => {
    if (!import.meta.client) {
      return;
    }
    const payload = JSON.stringify({ id: playerId.value, name: playerName.value });
    window.localStorage.setItem(PLAYER_STORAGE_KEY, payload);
  };

  const clearIdentity = () => {
    if (!import.meta.client) {
      return;
    }
    window.localStorage.removeItem(PLAYER_STORAGE_KEY);
  };

  const restoreIdentityFromStorage = () => {
    if (!import.meta.client) {
      return;
    }
    try {
      const identityFromStorage = window.localStorage.getItem(PLAYER_STORAGE_KEY);
      if (!identityFromStorage) {
        return;
      }
      const parsedIdentity = JSON.parse(identityFromStorage) as { id?: string; name?: string };
      playerId.value = parsedIdentity.id ?? null;
      playerName.value = parsedIdentity.name ?? '';
    } catch {
      clearIdentity();
    }
  };

  const updatePlayerNameFromView = () => {
    if (!playerId.value || !view.value) {
      return;
    }
    const currentPlayer = view.value.session.players.find((candidate) => candidate.id === playerId.value);
    if (currentPlayer) {
      playerName.value = currentPlayer.name;
    }
  };

  const handleView = (quizSessionView: QuizSessionView) => {
    view.value = quizSessionView;
    lastSyncedAt.value = Date.now();
    updatePlayerNameFromView();

    if (
      playerId.value &&
      !quizSessionView.session.players.some((candidate) => candidate.id === playerId.value)
    ) {
      playerId.value = null;
      playerName.value = '';
      clearIdentity();
    }
  };

  const startTick = () => {
    if (!import.meta.client || tickInterval) {
      return;
    }
    tickInterval = window.setInterval(() => {
      now.value = Date.now();
    }, 500);
  };

  const stopTick = () => {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  };

  // Polling the quiz state for each connected user every {QUIZ_POLLING_INTERVAL_MS} milliseconds
  const startPolling = () => {
    if (!import.meta.client || pollInterval) {
      startTick();
      return;
    }
    pollInterval = window.setInterval(async () => {
      await syncSession();
    }, QUIZ_POLLING_INTERVAL_MS);
    startTick();
  };

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    stopTick();
  };

  const syncSession = async () => {
    try {
      const response = await api.fetchSession();
      handleView(response.view);
      errorMessage.value = null;
    } catch (error) {
      if (import.meta.client) {
        console.error('Failed to sync quiz session', error);
      }
      errorMessage.value = parseErrorMessage(error);
    }
  };

  const initialize = async () => {
    if (import.meta.client) {
      restoreIdentityFromStorage();
      startPolling();
    }
    await syncSession();
  };

  const join = async (name: string) => {
    loading.value = true;
    try {
      const joinRequestPayload: JoinQuizRequest = { name, playerId: playerId.value };

      const response = await api.joinSession(joinRequestPayload);
      playerId.value = response.playerId;
      handleView(response.view);
      errorMessage.value = null;
      persistIdentity();
      return response;
    } catch (error) {
      errorMessage.value = parseErrorMessage(error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const startQuiz = async () => {
    if (!playerId.value) {
      throw new Error('Player id is missing');
    }
    loading.value = true;
    try {
      const response = await api.startSession(playerId.value);
      handleView(response.view);
      errorMessage.value = null;
      return response.view;
    } catch (error) {
      if (import.meta.client) {
        console.error('Failed to start quiz session', error);
      }
      errorMessage.value = parseErrorMessage(error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const submitAnswer = async (optionId: string) => {
    if (!playerId.value || !currentQuestion.value) {
      throw new Error('Unable to submit answer without an active question');
    }
    loading.value = true;
    try {
      const response = await api.submitAnswer({
        playerId: playerId.value,
        questionId: currentQuestion.value.id,
        optionId
      });
      handleView(response.view);
      errorMessage.value = null;
      return response.view;
    } catch (error) {
      if (import.meta.client) {
        console.error('Failed to submit quiz answer', error);
      }
      errorMessage.value = parseErrorMessage(error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const resetLocalState = () => {
    view.value = null;
    playerId.value = null;
    playerName.value = '';
    loading.value = false;
    lastSyncedAt.value = null;
    errorMessage.value = null;
    clearIdentity();
  };

  watch(
    status,
    (next) => {
      if (next === 'finished') {
        stopPolling();
      }
    },
    { immediate: false }
  );

  return {
    view,
    playerId,
    playerName,
    loading,
    errorMessage,
    lastSyncedAt,
    status,
    isHost,
    players,
    currentQuestion,
    answers,
    results,
    questionResults, 
    remainingMs,
    remainingSeconds,
    hasAnsweredCurrent,
    initialize,
    syncSession,
    join,
    startQuiz,
    submitAnswer,
    startPolling,
    stopPolling,
    resetLocalState,
    persistIdentity
  };
});
