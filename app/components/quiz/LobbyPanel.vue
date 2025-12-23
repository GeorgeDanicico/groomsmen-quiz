<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Lobby</h2>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ players.length }} {{ players.length === 1 ? 'player' : 'players' }}
        </span>
      </div>
    </template>
    <ul v-if="players.length > 0" class="space-y-2">
      <li
        v-for="(player, index) in players"
        :key="player.id"
        class="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-800"
      >
        <span class="font-medium text-gray-900 dark:text-gray-100">{{ player.name }}</span>
        <div class="flex items-center gap-2">
          <UBadge
            v-if="player.id === hostId"
            color="primary"
            size="xs"
            variant="solid"
          >
            Host
          </UBadge>
          <span class="text-[11px] text-gray-400 dark:text-gray-500">
            #{{ index + 1 }}
          </span>
        </div>
      </li>
    </ul>
    <div v-else class="flex flex-col items-start justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <p>No groomsmen have joined yet.</p>
    </div>
    <template #footer>
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          <template v-if="isHost">
            You can start when everyone is ready.
          </template>
          <template v-else>
            Waiting for the host to start the quiz.
          </template>
        </div>
        <UButton
          v-if="isHost"
          :disabled="!canStart"
          :loading="loading"
          @click="handleStart"
        >
          Start Quiz
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { QuizPlayer } from '../../lib/types';

const props = defineProps<{
  players: readonly QuizPlayer[];
  hostId: string | null;
  isHost: boolean;
  canStart: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (event: 'start'): void;
}>();

const handleStart = () => {
  if (props.isHost && props.canStart) {
    emit('start');
  }
};
</script>
