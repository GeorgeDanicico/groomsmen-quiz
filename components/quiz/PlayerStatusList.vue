<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold">Players</h2>
    </template>
    <ul class="space-y-2">
      <li
        v-for="player in players"
        :key="player.id"
        class="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm transition dark:border-gray-800"
        :class="{
          'bg-primary-50 dark:bg-primary-950': player.id === currentPlayerId
        }"
      >
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ player.name }}</span>
          <UBadge v-if="player.id === hostId" color="primary" size="xs">Host</UBadge>
          <UBadge
            v-if="answerLookup[player.id]?.isCorrect === true"
            color="emerald"
            size="xs"
            variant="soft"
          >
            Correct
          </UBadge>
        </div>
        <UBadge :color="getStatusColor(player.id)" size="xs">
          {{ getStatusLabel(player.id) }}
        </UBadge>
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { QuizPlayer, QuizPlayerAnswerStatus } from '../../lib/types';

const props = defineProps<{
  players: readonly QuizPlayer[];
  answers: readonly QuizPlayerAnswerStatus[];
  currentPlayerId?: string | null;
  hostId?: string | null;
}>();

const answerLookup = computed(() =>
  props.answers.reduce<Record<string, QuizPlayerAnswerStatus>>((accumulator, answer) => {
    accumulator[answer.playerId] = answer;
    return accumulator;
  }, {})
);

const getStatusLabel = (playerId: string): string => {
  const answer = answerLookup.value[playerId];
  if (!answer || !answer.optionId) {
    return 'Pending';
  }
  return 'Answered';
};

const getStatusColor = (playerId: string) => {
  const answer = answerLookup.value[playerId];
  if (!answer || !answer.optionId) {
    return 'gray';
  }
  return answer.isCorrect === true ? 'emerald' : 'primary';
};
</script>
