<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { z } from 'zod';
import type {
  CreateQuizQuestionDraft,
  CreateQuizQuestionInput,
  CreateQuizQuestionOptionDraft
} from '../../lib/types';

const props = defineProps<{
  maxQuestions: number | null;
  questions: readonly CreateQuizQuestionDraft[];
  error?: string;
}>();

console.log("this component")

const emit = defineEmits<{
  (event: 'add-question', value: CreateQuizQuestionInput): void;
  (event: 'remove-question', questionId: string): void;
}>();

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const createOption = (): CreateQuizQuestionOptionDraft => ({
  id: createId(),
  text: ''
});

const showForm = ref(false);

const newQuestion = reactive<{
  prompt: string;
  options: CreateQuizQuestionOptionDraft[];
  correctOptionId: string;
}>({
  prompt: '',
  options: [createOption(), createOption()],
  correctOptionId: ''
});

const newQuestionErrors = reactive({
  prompt: '',
  options: '',
  correctOptionId: ''
});

const totalQuestions = computed(() => props.questions.length);
const targetCount = computed(() => props.maxQuestions);
const maxReached = computed(
  () => typeof props.maxQuestions === 'number' && totalQuestions.value >= props.maxQuestions
);
const remaining = computed(() =>
  typeof props.maxQuestions === 'number' ? props.maxQuestions - totalQuestions.value : null
);

const questionSchema = z
  .object({
    prompt: z.string().min(1, 'Please add the question text.'),
    options: z
      .array(
        z.object({
          id: z.string(),
          text: z.string().min(1, 'Answer text is required.')
        })
      )
      .min(2, 'Add at least two answers.'),
    correctOptionId: z.string().min(1, 'Select the correct answer.')
  })
  .refine(
    (value) => value.options.some((option) => option.id === value.correctOptionId),
    {
      message: 'Select which answer is correct.',
      path: ['correctOptionId']
    }
  );

const resetForm = () => {
  newQuestion.prompt = '';
  newQuestion.options.splice(0, newQuestion.options.length, createOption(), createOption());
  newQuestion.correctOptionId = '';
  newQuestionErrors.prompt = '';
  newQuestionErrors.options = '';
  newQuestionErrors.correctOptionId = '';
};

const openForm = () => {
  if (maxReached.value) {
    return;
  }
  showForm.value = true;
  resetForm();
};

const addOption = () => {
  if (newQuestion.options.length >= 6) {
    return;
  }
  newQuestion.options.push(createOption());
};

const removeOption = (optionId: string) => {
  if (newQuestion.options.length <= 2) {
    return;
  }
  const index = newQuestion.options.findIndex((option) => option.id === optionId);
  if (index !== -1) {
    newQuestion.options.splice(index, 1);
  }
  if (newQuestion.correctOptionId === optionId) {
    newQuestion.correctOptionId = '';
  }
};

const selectCorrect = (optionId: string | number) => {
  newQuestion.correctOptionId = String(optionId);
};

const saveQuestion = () => {
  const result = questionSchema.safeParse({
    prompt: newQuestion.prompt.trim(),
    options: newQuestion.options.map((option) => ({
      ...option,
      text: option.text.trim()
    })),
    correctOptionId: newQuestion.correctOptionId
  });

  newQuestionErrors.prompt = '';
  newQuestionErrors.options = '';
  newQuestionErrors.correctOptionId = '';

  if (!result.success) {
    const fieldErrors = result.error.formErrors.fieldErrors;
    newQuestionErrors.prompt = fieldErrors.prompt?.[0] ?? '';
    newQuestionErrors.options = fieldErrors.options?.[0] ?? '';
    newQuestionErrors.correctOptionId = fieldErrors.correctOptionId?.[0] ?? '';
    return;
  }

  emit('add-question', {
    prompt: result.data.prompt,
    options: result.data.options,
    correctOptionId: result.data.correctOptionId
  });

  if (maxReached.value) {
    showForm.value = false;
  } else {
    resetForm();
  }
};

const handleRemoveQuestion = (questionId: string) => {
  emit('remove-question', questionId);
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between rounded-md border border-dashed border-gray-300 bg-white/60 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900/40">
      <div>
        <p class="font-medium text-gray-800 dark:text-gray-100">Questions added</p>
        <p class="text-gray-500 dark:text-gray-400">
          {{ totalQuestions }}<span v-if="targetCount !== null"> / {{ targetCount }}</span>
          <span v-if="remaining !== null" class="ml-2 text-xs text-gray-400">
            {{ remaining }} remaining
          </span>
        </p>
      </div>
      <UButton
        color="primary"
        size="sm"
        :disabled="maxReached"
        @click="openForm"
      >
        Add Question
      </UButton>
    </div>

    <UAlert
      v-if="error"
      color="amber"
      variant="subtle"
      :description="error"
    />

    <transition name="fade">
      <UCard v-if="showForm" class="space-y-4">
        <UFormGroup label="Question" required :error="newQuestionErrors.prompt || undefined">
          <UTextarea
            v-model="newQuestion.prompt"
            placeholder="Type the question prompt"
            autoresize
            size="sm"
          />
        </UFormGroup>

        <div>
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Answers
            </span>
            <UButton
              color="gray"
              variant="soft"
              size="xs"
              :disabled="newQuestion.options.length >= 6"
              @click="addOption"
            >
              Add answer
            </UButton>
          </div>

          <div class="space-y-2">
            <div
              v-for="option in newQuestion.options"
              :key="option.id"
              class="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2 dark:border-gray-800"
            >
              <URadio
                :model-value="newQuestion.correctOptionId"
                :value="option.id"
                name="correct-option"
                size="sm"
                @update:model-value="selectCorrect"
              />
              <UInput
                v-model="option.text"
                placeholder="Answer text"
                size="xs"
                class="flex-1"
              />
              <UTooltip text="Remove answer" :disabled="newQuestion.options.length <= 2">
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  size="xs"
                  :disabled="newQuestion.options.length <= 2"
                  @click="removeOption(option.id)"
                />
              </UTooltip>
            </div>
          </div>

          <p v-if="newQuestionErrors.options" class="mt-2 text-xs text-rose-500">
            {{ newQuestionErrors.options }}
          </p>
          <p v-else-if="newQuestionErrors.correctOptionId" class="mt-2 text-xs text-rose-500">
            {{ newQuestionErrors.correctOptionId }}
          </p>
        </div>

        <div class="flex items-center justify-end gap-2">
          <UButton color="gray" variant="soft" size="sm" @click="showForm = false">
            Cancel
          </UButton>
          <UButton color="primary" size="sm" @click="saveQuestion">
            Save question
          </UButton>
        </div>
      </UCard>
    </transition>

    <div v-if="questions.length > 0" class="space-y-3">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Current questions
      </h3>
      <UCard
        v-for="question in questions"
        :key="question.id"
        class="space-y-3"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-medium text-gray-900 dark:text-gray-100">
              {{ question.prompt }}
            </p>
            <ul class="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li
                v-for="option in question.options"
                :key="option.id"
                class="flex items-center gap-2"
              >
                <span
                  class="h-2 w-2 rounded-full"
                  :class="option.id === question.correctOptionId ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'"
                />
                <span
                  :class="option.id === question.correctOptionId ? 'font-semibold text-primary-600 dark:text-primary-300' : ''"
                >
                  {{ option.text }}
                  <span
                    v-if="option.id === question.correctOptionId"
                    class="ml-2 text-xs uppercase tracking-wide text-primary-500"
                  >
                    Correct
                  </span>
                </span>
              </li>
            </ul>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-trash"
            size="xs"
            @click="handleRemoveQuestion(question.id)"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
