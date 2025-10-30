<script setup lang="ts">
import type {
  CreateQuizDetails,
  CreateQuizQuestionDraft
} from '../../lib/types';

const props = defineProps<{
  details: CreateQuizDetails;
  questions: readonly CreateQuizQuestionDraft[];
}>();
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Quiz overview
        </h2>
      </template>
      <dl class="grid gap-4 sm:grid-cols-3">
        <div>
          <dt class="text-sm text-gray-500 dark:text-gray-400">Questions</dt>
          <dd class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ details.questions ?? '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500 dark:text-gray-400">Seconds per question</dt>
          <dd class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ details.responseTime ?? '—' }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500 dark:text-gray-400">Max players</dt>
          <dd class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ details.maxPlayers ?? '—' }}
          </dd>
        </div>
      </dl>
    </UCard>

    <div class="space-y-3">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Questions
      </h3>
      <div v-if="questions.length === 0" class="rounded-md border border-gray-200 bg-white/60 p-4 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
        No questions added yet.
      </div>
      <UCard v-else class="divide-y divide-gray-200 dark:divide-gray-800">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="space-y-2 py-4 first:pt-0 last:pb-0"
        >
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ index + 1 }}. {{ question.prompt }}
          </p>
          <ul class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li
              v-for="option in question.options"
              :key="option.id"
              :class="option.id === question.correctOptionId ? 'font-semibold text-primary-600 dark:text-primary-300' : ''"
            >
              {{ option.text }}
              <span
                v-if="option.id === question.correctOptionId"
                class="ml-2 text-xs uppercase tracking-wide text-primary-500"
              >
                Correct
              </span>
            </li>
          </ul>
        </div>
      </UCard>
    </div>
  </div>
</template>

