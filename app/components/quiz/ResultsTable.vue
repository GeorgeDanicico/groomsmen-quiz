<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold">Results</h2>
    </template>
    <div v-if="rows.length > 0">
      <UTable :rows="rows" :columns="columns" />
    </div>
    <p v-else class="text-sm text-gray-500 dark:text-gray-400">
      No results yet — finish the quiz to see the scoreboard.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { QuizPlayer, QuizResult } from '../../lib/types';

const props = defineProps<{
  results: readonly QuizResult[];
  players: readonly QuizPlayer[];
  totalQuestions: number;
}>();

const columns = [
  { key: 'rank', label: '#' },
  { key: 'name', label: 'Player' },
  { key: 'score', label: 'Score' }
];

const playerNameById = computed(() =>
  props.players.reduce<Record<string, string>>((accumulator, player) => {
    accumulator[player.id] = player.name;
    return accumulator;
  }, {})
);

const rows = computed(() =>
  props.results.map((result, index) => ({
    rank: index + 1,
    name: playerNameById.value[result.playerId] ?? 'Unknown',
    score: `${result.correctCount}/${props.totalQuestions}`
  }))
);
</script>
