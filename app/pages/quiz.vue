<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { QUESTION_DURATION_SECONDS } from '../lib/constants';
import { useQuizStore } from '~/stores/quiz';
import QuizPlayerStatusList from '~/components/quiz/PlayerStatusList.vue';
import QuizQuestion from '~/components/quiz/QuizQuestion.vue';
import QuizResultsTable from '~/components/quiz/ResultsTable.vue';
import QuizTimer from '~/components/quiz/QuizTimer.vue';
import QuizAnswerReview from '~/components/quiz/AnswerReview.vue';
import { useRouter } from 'nuxt/app';

const quizStore = useQuizStore();
const router = useRouter();

if (import.meta.server) {
  await quizStore.syncSession();
}

const status = computed(() => quizStore.status);
const currentQuestion = computed(() => quizStore.currentQuestion);
const players = computed(() => quizStore.players);
const answers = computed(() => quizStore.answers);
const myAnswer = computed(() =>
  answers.value.find((answer) => answer.playerId === quizStore.playerId) ?? null
);
const selectedOptionId = computed(() => myAnswer.value?.optionId ?? null);
const canAnswer = computed(
  () => status.value === 'in-progress' && Boolean(quizStore.playerId) && Boolean(currentQuestion.value)
);

const handleSelectOption = async (optionId: string) => {
  if (!canAnswer.value || quizStore.loading) {
    return;
  }
  try {
    await quizStore.submitAnswer(optionId);
  } catch (error) {
    console.error('Failed to submit answer', error);
  }
};

if (import.meta.client) {
  onMounted(async () => {
    await quizStore.initialize();
    if (!quizStore.playerId && quizStore.status === 'lobby') {
      await router.replace('/');
    }
  });

  watch(
    () => quizStore.playerId,
    async (playerId) => {
      if (!playerId && quizStore.status === 'lobby') {
        await router.replace('/');
      }
    }
  );

  watch(
    () => quizStore.status,
    async (nextStatus) => {
      if (nextStatus === 'lobby') {
        await router.replace('/');
      }
    }
  );
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
    <UContainer>
      <div class="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Groomsmen Quiz
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Answer each question within 15 seconds. The quiz advances when everyone responds or time runs out.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UBadge v-if="quizStore.isHost" color="primary">Host</UBadge>
          <UBadge v-if="quizStore.playerId" color="primary" variant="soft">
            {{ quizStore.playerName || 'You' }}
          </UBadge>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-4">
          <QuizTimer
            :remaining-seconds="quizStore.remainingSeconds"
            :duration="QUESTION_DURATION_SECONDS"
            :status="status"
          />
          <QuizQuestion
            :question="currentQuestion"
            :selected-option-id="selectedOptionId"
            :disabled="!canAnswer || quizStore.loading"
            :show-selection-state="Boolean(selectedOptionId)"
            @select="handleSelectOption"
          />
          <UAlert
            v-if="myAnswer && status === 'in-progress'"
            color="primary"
            variant="soft"
            title="Answer received"
            description="You can change it until the timer expires."
          />
          <UAlert
            v-if="status === 'finished'"
            variant="soft"
            title="Quiz complete"
            description="Head back to the lobby to review the final standings."
          />
          <QuizAnswerReview
            v-if="status === 'finished'"
            :players="players"
            :questions="quizStore.questionResults"
          />
        </div>
        <div class="space-y-4">
          <QuizPlayerStatusList
            :players="players"
            :answers="answers"
            :current-player-id="quizStore.playerId"
            :host-id="quizStore.view?.session.hostId ?? null"
          />
          <QuizResultsTable
            v-if="status === 'finished'"
            :results="quizStore.results"
            :players="players"
            :total-questions="quizStore.view?.session.questionCount ?? 0"
          />
          <UButton
            v-if="status === 'finished'"
            block
            variant="soft"
            @click="router.push('/')"
          >
            Back to Lobby
          </UButton>
        </div>
      </div>

      <UAlert
        v-if="quizStore.errorMessage && status !== 'lobby'"
        class="mt-6"
        title="Connection issue"
        :description="quizStore.errorMessage"
      />
    </UContainer>
  </div>
</template>
