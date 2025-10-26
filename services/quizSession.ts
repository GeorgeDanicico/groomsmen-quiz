import type {
  QuizAnswer,
  QuizPlayer,
  QuizPlayerAnswerStatus,
  QuizQuestion,
  QuizQuestionView,
  QuizQuestionDetail,
  QuizQuestionResult,
  QuizResult,
  JoinQuizResponse,
  SubmitAnswerPayload,
  QuizSessionState,
  QuizSessionView
} from '../lib/types';
import { QUESTION_DURATION_MS } from '../lib/constants';
import { randomUUID } from 'node:crypto';
import { createError } from 'h3';
import { useStorage } from '#imports';
import { quizQuestions } from '../server/data/questions';

const STORAGE_NAMESPACE = 'quiz';
const SESSION_KEY = 'session';

// const questionLookup = new Map<string, QuizQuestion>(
//   quizQuestions.map((question) => [question.id, question])
// );


const emptyAnswers = (): QuizSessionState['answers'] => {
  const answersState: QuizSessionState['answers'] = {};

  quizQuestions.forEach(question => {
    answersState[question.id] = {};
  })

  return answersState;
};

const createInitialState = (): QuizSessionState => ({
  status: 'lobby',
  hostId: null,
  currentQuestionIndex: -1,
  expiresAt: null,
  questionCount: quizQuestions.length,
  players: [],
  answers: emptyAnswers(),
  startedAt: null,
  finishedAt: null
});

const cloneState = (state: QuizSessionState): QuizSessionState => {
  const answersClone: QuizSessionState['answers'] = {};
  for (const [questionId, answersByPlayer] of Object.entries(state.answers)) {
    answersClone[questionId] = { ...answersByPlayer };
  }

  return {
    ...state,
    players: state.players.map((player) => ({ ...player })),
    answers: answersClone
  };
};

const getStorage = () => useStorage<QuizSessionState>(STORAGE_NAMESPACE);

const readSession = async (): Promise<QuizSessionState> => {
  const storage = getStorage();
  const stored = await storage.getItem(SESSION_KEY);
  if (!stored) {
    const initial = createInitialState();
    await storage.setItem(SESSION_KEY, initial);
    return cloneState(initial);
  }

  /**
   * Keep question count in sync with the server-side source of truth.
   */
  if (stored.questionCount !== quizQuestions.length) {
    stored.questionCount = quizQuestions.length;
  }

  return cloneState(stored);
};

const writeSession = async (state: QuizSessionState): Promise<QuizSessionState> => {
  const storage = getStorage();
  const nextState = {
    ...state,
    questionCount: quizQuestions.length
  };
  await storage.setItem(SESSION_KEY, nextState);
  return cloneState(nextState);
};

const ensureAnswerSlot = (state: QuizSessionState, questionId: string) => {
  if (!state.answers[questionId]) {
    state.answers[questionId] = {};
  }
};

const getCurrentQuestion = (state: QuizSessionState): QuizQuestion | null => {
  if (state.currentQuestionIndex < 0 || state.currentQuestionIndex >= quizQuestions.length) {
    return null;
  }
  return quizQuestions[state.currentQuestionIndex];
};

const finishSession = (state: QuizSessionState, now: number): QuizSessionState => {
  if (state.status === 'finished') {
    return state;
  }

  state.status = 'finished';
  state.expiresAt = null;
  state.finishedAt = now;
  /**
   * Keep the index one past the final question to make it clear there is no active prompt.
   */
  state.currentQuestionIndex = quizQuestions.length;
  return state;
};

const autoAdvance = (state: QuizSessionState, now: number): QuizSessionState => {
  if (state.status !== 'in-progress') {
    return state;
  }

  const currentQuestion = getCurrentQuestion(state);
  if (!currentQuestion) {
    return finishSession(state, now);
  }

  ensureAnswerSlot(state, currentQuestion.id);
  const answersForQuestion = state.answers[currentQuestion.id];
  const allAnswered =
    state.players.length > 0 &&
    state.players.every((player) => Boolean(answersForQuestion[player.id]));
  const expired = typeof state.expiresAt === 'number' && state.expiresAt <= now;

  if (!allAnswered && !expired) {
    return state;
  }

  const nextIndex = state.currentQuestionIndex + 1;
  if (nextIndex >= quizQuestions.length) {
    return finishSession(state, now);
  }

  state.currentQuestionIndex = nextIndex;
  const nextQuestion = quizQuestions[nextIndex];
  ensureAnswerSlot(state, nextQuestion.id);
  state.expiresAt = now + QUESTION_DURATION_MS;
  return state;
};

const createPlayerId = (): string => `player-${randomUUID()}`;

const requirePlayer = (state: QuizSessionState, playerId: string): QuizPlayer => {
  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Player not found in session'
    });
  }
  return player;
};

const requireQuestionOption = (question: QuizQuestion, optionId: string) => {
  const optionExists = question.options.some((option) => option.id === optionId);
  if (!optionExists) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid option for this question'
    });
  }
};

const buildQuestionView = (question: QuizQuestion | null): QuizQuestionView | null => {
  if (!question) {
    return null;
  }

  return {
    id: question.id,
    prompt: question.prompt,
    options: question.options
  };
};

const buildQuestionDetail = (question: QuizQuestion): QuizQuestionDetail => ({
  id: question.id,
  prompt: question.prompt,
  options: question.options,
  correctOptionId: question.correctOptionId
});

const buildAnswerStatuses = (
  state: QuizSessionState,
  question: QuizQuestion | null
): QuizPlayerAnswerStatus[] => {
  if (!question) {
    return state.players.map((player) => ({
      playerId: player.id,
      optionId: null,
      submittedAt: null,
      isCorrect: null
    }));
  }

  const answersForQuestion = state.answers[question.id] ?? {};

  return state.players.map((player) => {
    const answer = answersForQuestion[player.id];
    return {
      playerId: player.id,
      optionId: answer?.optionId ?? null,
      submittedAt: answer?.submittedAt ?? null,
      isCorrect:
        state.status === 'finished' && answer
          ? answer.optionId === question.correctOptionId
          : null
    };
  });
};

const buildResults = (state: QuizSessionState): QuizResult[] => {
  if (state.status !== 'finished') {
    return [];
  }

  const scoreByPlayer = new Map<string, number>();

  for (const question of quizQuestions) {
    const answersForQuestion = state.answers[question.id];
    if (!answersForQuestion) {
      continue;
    }

    for (const [playerId, answer] of Object.entries<QuizAnswer>(answersForQuestion)) {
      if (answer.optionId === question.correctOptionId) {
        scoreByPlayer.set(playerId, (scoreByPlayer.get(playerId) ?? 0) + 1);
      }
    }
  }

  return state.players
    .map<QuizResult>((player) => ({
      playerId: player.id,
      correctCount: scoreByPlayer.get(player.id) ?? 0
    }))
    .sort((a, b) => {
      if (b.correctCount !== a.correctCount) {
        return b.correctCount - a.correctCount;
      }
      const playerA = state.players.find((player) => player.id === a.playerId);
      const playerB = state.players.find((player) => player.id === b.playerId);
      if (!playerA || !playerB) {
        return 0;
      }
      return playerA.joinedAt - playerB.joinedAt;
    });
};

const buildQuestionResults = (state: QuizSessionState): QuizQuestionResult[] =>
  quizQuestions.map((question) => {
    const answersForQuestion = state.answers[question.id] ?? {};
    const playerSummaries = state.players.map<QuizPlayerAnswerStatus>((player) => {
      const answer = answersForQuestion[player.id];
      if (!answer) {
        return {
          playerId: player.id,
          optionId: null,
          submittedAt: null,
          isCorrect: null
        };
      }
      return {
        playerId: player.id,
        optionId: answer.optionId,
        submittedAt: answer.submittedAt,
        isCorrect: answer.optionId === question.correctOptionId
      };
    });

    return {
      question: buildQuestionDetail(question),
      answers: playerSummaries
    };
  });

const buildSessionView = (state: QuizSessionState): QuizSessionView => {
  const question = getCurrentQuestion(state);
  return {
    session: {
      status: state.status,
      hostId: state.hostId,
      currentQuestionIndex: state.currentQuestionIndex,
      expiresAt: state.expiresAt,
      questionCount: state.questionCount,
      players: state.players,
      startedAt: state.startedAt,
      finishedAt: state.finishedAt
    },
    question: buildQuestionView(question),
    answers: buildAnswerStatuses(state, question),
    results: buildResults(state),
    questionResults: buildQuestionResults(state)
  };
};

export const getSessionView = async (): Promise<QuizSessionView> => {
  const state = await readSession();
  const progressed = await writeSession(autoAdvance(state, Date.now()));
  return buildSessionView(progressed);
};

export const joinSession = async (payload: {
  name: string;
  playerId?: string | null;
}): Promise<JoinQuizResponse> => {
  const now = Date.now();
  const trimmedName = payload.name.trim();

  if (!trimmedName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Player name is required'
    });
  }

  const state = await readSession();

  if (state.status !== 'lobby') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Quiz already started'
    });
  }

  const normalizedName = trimmedName.toLowerCase();
  const playerWithSameName = state.players.find(
    (player) => player.name.toLowerCase() === normalizedName
  );
  if (playerWithSameName && playerWithSameName.id !== payload.playerId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Name already taken'
    });
  }

  let player: QuizPlayer | null = null;

  if (payload.playerId) {
    const existing = state.players.find((candidate) => candidate.id === payload.playerId);
    if (existing) {
      if (existing.name !== trimmedName) {
        const updated: QuizPlayer = {
          ...existing,
          name: trimmedName
        };
        state.players = state.players.map((candidate) =>
          candidate.id === existing.id ? updated : candidate
        );
        player = updated;
      } else {
        player = existing;
      }
    }
  }

  if (!player) {
    const newPlayer: QuizPlayer = {
      id: createPlayerId(),
      name: trimmedName,
      joinedAt: now
    };
    state.players.push(newPlayer);
    player = newPlayer;
  }

  if (!state.hostId) {
    state.hostId = player.id;
  }

  const persisted = await writeSession(state);
  const persistedPlayer =
    persisted.players.find((candidate) => candidate.id === player?.id) ?? player;

  return {
    view: buildSessionView(persisted),
    playerId: persistedPlayer.id,
    host: persisted.hostId === persistedPlayer.id
  };
};

export const startSession = async (playerId: string): Promise<QuizSessionView> => {
  const now = Date.now();
  const state = await readSession();

  if (state.status !== 'lobby') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Quiz already started'
    });
  }

  if (!state.hostId || state.hostId !== playerId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only the host can start the quiz'
    });
  }

  if (state.players.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one player is required to start'
    });
  }

  if (quizQuestions.length === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Quiz questions are not configured'
    });
  }

  state.status = 'in-progress';
  state.currentQuestionIndex = 0;
  state.startedAt = now;
  state.finishedAt = null;
  state.expiresAt = now + QUESTION_DURATION_MS;
  ensureAnswerSlot(state, quizQuestions[0].id);

  const persisted = await writeSession(state);
  return buildSessionView(persisted);
};

export const submitAnswer = async (payload: SubmitAnswerPayload): Promise<QuizSessionView> => {
  const now = Date.now();
  const state = await readSession();

  if (state.status !== 'in-progress') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Quiz is not active'
    });
  }

  const player = requirePlayer(state, payload.playerId);
  const currentQuestion = getCurrentQuestion(state);

  if (!currentQuestion || currentQuestion.id !== payload.questionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Question is no longer active'
    });
  }

  requireQuestionOption(currentQuestion, payload.optionId);

  ensureAnswerSlot(state, currentQuestion.id);
  const answersForQuestion = state.answers[currentQuestion.id];
  answersForQuestion[player.id] = {
    optionId: payload.optionId,
    submittedAt: now
  };

  const progressed = autoAdvance(state, now);
  const persisted = await writeSession(progressed);
  return buildSessionView(persisted);
};

export const resetSession = async (): Promise<QuizSessionView> => {
  const storage = getStorage();
  const initial = createInitialState();
  await storage.setItem(SESSION_KEY, initial);
  return buildSessionView(cloneState(initial));
};
