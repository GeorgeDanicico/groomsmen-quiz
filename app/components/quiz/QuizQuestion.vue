<template>
  <UCard v-if="question">
    <template #header>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ question.prompt }}
      </h2>
    </template>
    <div class="grid gap-3">
      <UButton
        v-for="option in question.options"
        :key="option.id"
        :variant="selectedOptionId === option.id ? 'solid' : 'outline'"
        :disabled="disabled"
        block
        @click="handleSelect(option.id)"
      >
        {{ option.label }}
      </UButton>
    </div>
    <template v-if="showSelectionState" #footer>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Your choice is highlighted above. You can change it until the timer ends.
      </p>
    </template>
  </UCard>
  <UCard v-else>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Waiting for the next question to load.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import type { QuizQuestionView } from '../../lib/types';

const props = defineProps<{
  question: QuizQuestionView | null;
  selectedOptionId?: string | null;
  disabled?: boolean;
  showSelectionState?: boolean;
}>();

const emit = defineEmits<{
  (event: 'select', optionId: string): void;
}>();

const handleSelect = (optionId: string) => {
  if (props.disabled) {
    return;
  }
  emit('select', optionId);
};
</script>
