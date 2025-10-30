<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { CreateQuizDetails } from '../../lib/types';

const props = defineProps<{
  modelValue: CreateQuizDetails;
  errors: {
    questions: string;
    responseTime: string;
    maxPlayers: string;
  };
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: CreateQuizDetails): void;
}>();

const localForm = reactive<CreateQuizDetails>({
  questions: props.modelValue.questions,
  responseTime: props.modelValue.responseTime,
  maxPlayers: props.modelValue.maxPlayers
});

watch(
  () => props.modelValue,
  (value) => {
    localForm.questions = value.questions;
    localForm.responseTime = value.responseTime;
    localForm.maxPlayers = value.maxPlayers;
  },
  { deep: true }
);

watch(
  localForm,
  (value) => {
    emit('update:modelValue', {
      questions: value.questions ?? null,
      responseTime: value.responseTime ?? null,
      maxPlayers: value.maxPlayers ?? null
    });
  },
  { deep: true }
);
</script>

<template>
  <UForm class="grid gap-4 sm:grid-cols-3">
    <UFormGroup
      label="Questions"
      required
      :error="errors.questions || undefined"
      class="flex flex-col gap-2"
    >
      <UInput
        v-model.number="localForm.questions"
        type="number"
        min="1"
        max="15"
        placeholder="1 - 15"
        size="xs"
        class="w-full max-w-[140px]"
      />
    </UFormGroup>

    <UFormGroup
      label="Seconds"
      required
      :error="errors.responseTime || undefined"
      class="flex flex-col gap-2"
    >
      <UInput
        v-model.number="localForm.responseTime"
        type="number"
        min="5"
        max="60"
        placeholder="5 - 60"
        size="xs"
        class="w-full max-w-[140px]"
      />
    </UFormGroup>

    <UFormGroup
      label="Players"
      required
      :error="errors.maxPlayers || undefined"
      class="flex flex-col gap-2"
    >
      <UInput
        v-model.number="localForm.maxPlayers"
        type="number"
        min="2"
        max="10"
        placeholder="2 - 10"
        size="xs"
        class="w-full max-w-[140px]"
      />
    </UFormGroup>
  </UForm>
</template>

