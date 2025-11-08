<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 py-16 dark:bg-gray-900">
    <UCard class="w-full max-w-4xl shadow-lg">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Step {{ activeStep + 1 }} of 3
            </p>
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Create your quiz
            </h1>
          </div>
          <UButton color="gray" variant="ghost" @click="router.back()">
            Cancel
          </UButton>
        </div>
      </template>

      <div class="space-y-6">
        <UTabs v-model="activeStep" :items="tabItems" class="w-full">
          <template #item="{ index }">
            <CreateQuizDetailsStep
              v-if="index === 0"
              v-model="detailsForm"
              :errors="detailsErrors"
            />
            <CreateQuizQuestionsStep
              v-else-if="index === 1"
              :max-questions="detailsForm.questions"
              :questions="questions"
              :error="questionsError"
              @add-question="handleAddQuestion"
              @remove-question="handleRemoveQuestion"
            />
            <CreateQuizReviewStep
              v-else
              :details="detailsForm"
              :questions="questions"
            />
          </template>
        </UTabs>

        <div v-if="submissionError" class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-900/40 dark:text-rose-200">
          {{ submissionError }}
        </div>
        <div v-else-if="successMessage" class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200">
          {{ successMessage }}
        </div>

        <div class="flex items-center justify-between">
          <UButton
            color="gray"
            variant="soft"
            :disabled="activeStep === 0"
            @click="goPrevious"
          >
            Back
          </UButton>
          <div class="flex items-center gap-2">
            <UButton
              v-if="activeStep < tabs.length - 1"
              color="primary"
              @click="goNext"
            >
              Next
            </UButton>
            <UButton
              v-else
              color="primary"
              :loading="submitting"
              :disabled="submitting"
              @click="submitQuiz"
            >
              Create quiz
            </UButton>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'nuxt/app';
import { z } from 'zod';
import CreateQuizDetailsStep from '../../components/create-quiz/DetailsStep.vue';
import CreateQuizQuestionsStep from '../../components/create-quiz/QuestionsStep.vue';
import CreateQuizReviewStep from '../../components/create-quiz/ReviewStep.vue';
import type {
  CreateQuizDetails,
  CreateQuizQuestionDraft,
  CreateQuizQuestionInput
} from '../../lib/types';

const router = useRouter();

const tabs = [
  { key: 'details', label: 'Details' },
  { key: 'questions', label: 'Questions' },
  { key: 'review', label: 'Review' }
] as const;

const activeStep = ref(0);
const unlockedSteps = ref([true, false, false]);

const detailsForm = ref<CreateQuizDetails>({
  questions: null,
  responseTime: null,
  maxPlayers: null
});

const detailsErrors = reactive({
  questions: '',
  responseTime: '',
  maxPlayers: ''
});

const questions = ref<CreateQuizQuestionDraft[]>([]);
const questionsError = ref('');
const submissionError = ref<string | null>(null);
const submitting = ref(false);
const successMessage = ref<string | null>(null);

const clearDetailErrors = () => {
  detailsErrors.questions = '';
  detailsErrors.responseTime = '';
  detailsErrors.maxPlayers = '';
};

const detailSchema = z.object({
  questions: z
    .number({
      invalid_type_error: 'Please enter how many questions you need.',
      required_error: 'Please enter how many questions you need.'
    })
    .int()
    .min(1, 'Quizzes need at least 1 question.')
    .max(15, 'You can configure up to 15 questions.'),
  responseTime: z
    .number({
      invalid_type_error: 'Enter how many seconds each question should last.',
      required_error: 'Enter how many seconds each question should last.'
    })
    .int()
    .min(5, 'You need at least 5 seconds per question.')
    .max(60, 'Keep the timer under a minute for now.'),
  maxPlayers: z
    .number({
      invalid_type_error: 'Enter how many players can join.',
      required_error: 'Enter how many players can join.'
    })
    .int()
    .min(2, 'At least two players are required.')
    .max(10, 'Rooms support up to 10 players.')
});

const validateDetails = (): boolean => {
  clearDetailErrors();
  const result = detailSchema.safeParse({
    questions: detailsForm.value.questions,
    responseTime: detailsForm.value.responseTime,
    maxPlayers: detailsForm.value.maxPlayers
  });

  console.log(detailsForm);

  if (!result.success) {
    const fieldErrors = result.error.formErrors.fieldErrors;
    detailsErrors.questions = fieldErrors.questions?.[0] ?? '';
    detailsErrors.responseTime = fieldErrors.responseTime?.[0] ?? '';
    detailsErrors.maxPlayers = fieldErrors.maxPlayers?.[0] ?? '';
  }

  return result.success;
};

const validateQuestions = (): boolean => {
  questionsError.value = '';
  if (!detailsForm.value.questions) {
    questionsError.value =
      'Set the total number of questions in the Details step before continuing.';
    return false;
  }

  if (questions.value.length !== detailsForm.value.questions) {
    const remaining = detailsForm.value.questions - questions.value.length;
    questionsError.value =
      remaining > 0
        ? `Add ${remaining} more question${remaining === 1 ? '' : 's'} to continue.`
        : 'Remove extra questions to match the total from the Details step.';
    return false;
  }

  return true;
};

const validateStep = (step: number): boolean => {
  if (step === 0) {
    return validateDetails();
  }
  if (step === 1) {
    return validateQuestions();
  }
  return true;
};

const tabItems = computed(() =>
  tabs.map((tab, index) => ({
    ...tab,
    disabled: !unlockedSteps.value[index]
  }))
);

const normalizedPayload = computed(() => ({
  questions: detailsForm.value.questions,
  responseTime: detailsForm.value.responseTime,
  maxPlayers: detailsForm.value.maxPlayers,
  totalConfiguredQuestions: questions.value.length,
  questionData: questions.value.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    correctOptionId: question.correctOptionId,
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text
    }))
  }))
}));

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const handleAddQuestion = (question: CreateQuizQuestionInput) => {
  const totalAllowed = detailsForm.value.questions;
  if (typeof totalAllowed === 'number' && questions.value.length >= totalAllowed) {
    return;
  }

  let resolvedCorrectId = question.correctOptionId;
  const normalizedOptions = question.options.map((option) => {
    const optionId = option.id || createId();
    if (option.id !== optionId && question.correctOptionId === option.id) {
      resolvedCorrectId = optionId;
    }
    return {
      ...option,
      id: optionId
    };
  });

  questions.value = [
    ...questions.value,
    {
      id: createId(),
      prompt: question.prompt,
      options: normalizedOptions,
      correctOptionId: resolvedCorrectId
    }
  ];

  if (
    typeof totalAllowed === 'number' &&
    questions.value.length === totalAllowed
  ) {
    questionsError.value = '';
  }
};

const handleRemoveQuestion = (questionId: string) => {
  questions.value = questions.value.filter((question) => question.id !== questionId);
  if (
    typeof detailsForm.value.questions === 'number' &&
    questions.value.length < detailsForm.value.questions
  ) {
    questionsError.value = '';
  }
};

const goNext = async () => {
  if (!validateStep(activeStep.value)) {
    return;
  }

  if (activeStep.value < tabs.length - 1) {
    const nextIndex = activeStep.value + 1;
    unlockedSteps.value[nextIndex] = true;
    await nextTick();
    activeStep.value = nextIndex;
  }
};

const submitQuiz = async () => {
  if (!validateDetails() || !validateQuestions()) {
    activeStep.value = 0;
    return;
  }

  submissionError.value = null;
  successMessage.value = null;
  submitting.value = true;

  const roomNumber = `RM-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  try {
    await $fetch('/api/quiz/create', {
      method: 'POST',
      body: {
        roomNumber,
        status: 'draft',
        details: normalizedPayload.value
      }
    });

    successMessage.value = `Quiz created! Room code: ${roomNumber}`;
  } catch (error) {
    submissionError.value =
      error instanceof Error ? error.message : 'Failed to create the quiz.';
  } finally {
    submitting.value = false;
  }
};

const goPrevious = () => {
  if (activeStep.value > 0) {
    activeStep.value -= 1;
  }
};

watch(
  () => detailsForm.value.questions,
  (next) => {
    if (typeof next === 'number' && questions.value.length > next) {
      questions.value = questions.value.slice(0, next);
    }
    if (next === null) {
      questionsError.value = '';
    }
  }
);
</script>
