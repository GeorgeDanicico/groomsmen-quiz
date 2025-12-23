<template>
  <UCard>
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <UFormGroup label="Your name" :error="error ?? undefined" for="player-name">
        <UInput
          id="player-name"
          v-model="inputValue"
          :disabled="loading || disabled"
          placeholder="Groomsman name"
          autofocus
        />
      </UFormGroup>
      <div class="flex items-center gap-3">
        <UButton
          type="submit"
          color="primary"
          :loading="loading"
          :disabled="disabled || inputValue.trim().length === 0"
        >
          Join Lobby
        </UButton>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          The first groomsman to join becomes the host.
        </p>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
  loading?: boolean;
  error?: string | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'submit'): void;
}>();

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
});

const handleSubmit = () => {
  emit('submit');
};
</script>