export type QuizStatus = 'lobby' | 'in-progress' | 'finished';

export interface QuizQuestionOption {
  readonly id: string;
  readonly label: string;
}

export interface QuizQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly QuizQuestionOption[];
  readonly correctOptionId: string;
}

export interface QuizQuestionView {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly QuizQuestionOption[];
}

export interface QuizQuestionDetail extends QuizQuestionView {
  readonly correctOptionId: string;
}

export interface QuizPlayer {
  readonly id: string;
  readonly name: string;
  readonly joinedAt: number;
}

export interface QuizAnswer {
  readonly optionId: string;
  readonly submittedAt: number;
}

export interface QuizSessionState {
  status: QuizStatus;
  hostId: string | null;
  currentQuestionIndex: number;
  expiresAt: number | null;
  questionCount: number;
  players: QuizPlayer[];
  answers: Record<string, Record<string, QuizAnswer>>;
  startedAt: number | null;
  finishedAt: number | null;
}

export interface QuizPlayerAnswerStatus {
  readonly playerId: string;
  readonly optionId: string | null;
  readonly submittedAt: number | null;
  readonly isCorrect: boolean | null;
}

export interface QuizResult {
  readonly playerId: string;
  readonly correctCount: number;
}

export interface QuizQuestionResult {
  readonly question: QuizQuestionDetail;
  readonly answers: readonly QuizPlayerAnswerStatus[];
}

export interface QuizSessionView {
  readonly session: {
    readonly status: QuizStatus;
    readonly hostId: string | null;
    readonly currentQuestionIndex: number;
    readonly expiresAt: number | null;
    readonly questionCount: number;
    readonly players: readonly QuizPlayer[];
    readonly startedAt: number | null;
    readonly finishedAt: number | null;
  };
  readonly question: QuizQuestionView | null;
  readonly answers: readonly QuizPlayerAnswerStatus[];
  readonly results: readonly QuizResult[];
  readonly questionResults: readonly QuizQuestionResult[];
}


export interface JoinQuizRequest {
  readonly name: string;
  readonly playerId: string | null;
}

export interface JoinQuizResponse {
  readonly view: QuizSessionView;
  readonly playerId: string;
  readonly host: boolean;
}

export interface SubmitAnswerPayload {
  readonly playerId: string;
  readonly questionId: string;
  readonly optionId: string;
}

export interface CreateQuizDetails {
  questions: number | null;
  responseTime: number | null;
  maxPlayers: number | null;
}

export interface CreateQuizQuestionOptionDraft {
  readonly id: string;
  readonly text: string;
}

export interface CreateQuizQuestionDraft {
  readonly id: string;
  readonly prompt: string;
  readonly options: CreateQuizQuestionOptionDraft[];
  readonly correctOptionId: string;
}

export type CreateQuizQuestionInput = Omit<CreateQuizQuestionDraft, 'id'>;
