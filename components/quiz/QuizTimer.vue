<template>
  <UCard>
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
        <template v-if="status === 'in-progress'">
          Time remaining
        </template>
        <template v-else-if="status === 'finished'">
          Quiz finished
        </template>
        <template v-else>
          Waiting to start
        </template>
      </span>
      <span class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {{ clampedSeconds }}s
      </span>
    </div>
    <UProgress
      class="mt-3"
      color="primary"
      status
      :value="progress"
      :max="100"
      :ui="{ track: 'h-2 rounded-full', bar: 'rounded-full transition-all duration-300' }"
    />
  </UCard>
</template>


<script setup lang="ts">
import { computed } from 'vue';
import type { QuizStatus } from '../../lib/types';

const props = defineProps<{
  remainingSeconds: number;
  duration: number;
  status: QuizStatus;
}>();

const clampedSeconds = computed(() => Math.max(0, props.remainingSeconds));

const progress = computed(() => {
  if (props.duration <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (clampedSeconds.value / props.duration) * 100));
});
</script>