<template>
  <div class="space-y-6">
    <UCard
      v-for="(questionResult, index) in questions"
      :key="questionResult.question.id"
      class="shadow-sm"
    >
      <template #header>
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Question {{ index + 1 }}
          </p>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ questionResult.question.prompt }}
          </h3>
        </div>
      </template>
      <div class="space-y-2">
        <div
          v-for="answer in questionResult.answers"
          :key="answer.playerId"
          class="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition"
          :class="[
            answer.optionId
              ? answer.isCorrect
                ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200'
                : 'border-rose-200 bg-rose-50/70 text-rose-700 dark:border-rose-900 dark:bg-rose-900/40 dark:text-rose-200'
              : 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400'
          ]"
        >
          <div class="flex flex-col">
            <span class="font-medium text-gray-900 dark:text-gray-100">
              {{ playerLookup[answer.playerId]?.name ?? 'Unknown player' }}
            </span>
            <span>
              {{ optionLabel(questionResult.question, answer.optionId) }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <UBadge
              v-if="answer.optionId && !answer.isCorrect"
              color="rose"
              variant="solid"
              size="xs"
            >
              Wrong
            </UBadge>
            <UBadge
              v-else-if="answer.isCorrect"
              color="emerald"
              variant="solid"
              size="xs"
            >
              Correct
            </UBadge>
            <UBadge
              v-else
              color="gray"
              variant="outline"
              size="xs"
            >
              Pending
            </UBadge>
          </div>
        </div>
      </div>
      <template #footer>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Correct answer: <strong>{{ optionLabel(questionResult.question, questionResult.question.correctOptionId) }}</strong>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { QuizPlayer, QuizQuestionResult } from '../../lib/types';

const props = defineProps<{
  players: readonly QuizPlayer[];
  questions: readonly QuizQuestionResult[];
}>();

const playerLookup = computed(() =>
  props.players.reduce<Record<string, QuizPlayer>>((accumulator, player) => {
    accumulator[player.id] = player;
    return accumulator;
  }, {})
);

const optionLabel = (question: QuizQuestionResult['question'], optionId: string | null): string => {
  if (!optionId) {
    return 'No answer';
  }
  const option = question.options.find((candidate) => candidate.id === optionId);
  return option ? option.label : 'Unknown choice';
};
</script>