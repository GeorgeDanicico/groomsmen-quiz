<template>
  <div class="min-h-screen bg-gray-50 py-16 dark:bg-gray-900">
    <UContainer class="space-y-10">
      <header class="space-y-3 text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to the Groomsmen Quiz Night
        </h1>
        <p class="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-400">
          Set the stage for an unforgettable evening with trivia tailored for your crew.
          Create a custom quiz or join one that's already underway.
        </p>
      </header>

      <div class="grid gap-6 md:grid-cols-2">
        <UCard class="space-y-4">
          <div class="space-y-2">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Create a quiz
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Build a fresh quiz session for your groomsmen. Add your questions and host the game.
            </p>
          </div>
          <UButton color="primary" block @click="router.push('/create-quiz')">
            Create Quiz
          </UButton>
        </UCard>

        <UCard class="space-y-4">
          <div class="space-y-2">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Join a quiz
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Already have an invite? Enter the passcode to join the fun.
            </p>
          </div>
          <UForm class="space-y-3">
            <UInput placeholder="Enter quiz passcode" disabled />
            <UButton color="primary" block disabled>
              Join Quiz (coming soon)
            </UButton>
          </UForm>
        </UCard>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-4">
          <QuizJoinForm
            v-if="!hasPlayer"
            v-model="nameInput"
            :loading="quizStore.loading"
            :error="joinError"
            :disabled="status !== 'lobby'"
            @submit="handleJoin"
          />
          <UCard v-else>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  You are registered as
                </p>
                <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ quizStore.playerName }}
                </p>
              </div>
              <UBadge v-if="quizStore.isHost" color="primary">Host</UBadge>
            </div>
            <template v-if="status === 'in-progress'" #footer>
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  The quiz has started — jump in!
                </p>
                <UButton color="primary" @click="router.push('/quiz')">
                  Go to Quiz
                </UButton>
              </div>
            </template>
          </UCard>

          <UAlert
            v-if="quizStore.errorMessage && status === 'lobby'"
            color="rose"
            title="Something went wrong"
            :description="quizStore.errorMessage"
          />
        </div>

        <QuizLobbyPanel
          :players="players"
          :host-id="hostId"
          :is-host="quizStore.isHost"
          :can-start="canStart"
          :loading="quizStore.loading"
          @start="handleStart"
        />
      </div>

      <section v-if="status === 'finished'" class="mt-8 space-y-4">
        <QuizResultsTable
          :results="quizStore.results"
          :players="players"
          :total-questions="quizStore.view?.session.questionCount ?? 0"
        />
        <QuizAnswerReview
          :players="players"
          :questions="quizStore.questionResults"
        />
        <UButton color="primary" variant="soft" @click="quizStore.syncSession()">
          Refresh Results
        </UButton>
      </section>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useQuizStore } from '../../stores/quiz';
import QuizJoinForm from '../../components/quiz/JoinForm.vue';
import QuizLobbyPanel from '../../components/quiz/LobbyPanel.vue';
import QuizResultsTable from '../../components/quiz/ResultsTable.vue';
import QuizAnswerReview from '../../components/quiz/AnswerReview.vue';
import { useRouter } from 'nuxt/app';

const quizStore = useQuizStore();
const router = useRouter();

if (import.meta.server) {
  await quizStore.syncSession();
}

const nameInput = ref(quizStore.playerName);
const joinError = ref<string | null>(null);

watch(
  () => quizStore.playerName,
  (nextName) => {
    if (!nameInput.value) {
      nameInput.value = nextName;
    }
  }
);

const hasPlayer = computed(() => Boolean(quizStore.playerId));
const players = computed(() => quizStore.players);
const hostId = computed(() => quizStore.view?.session.hostId ?? null);
const canStart = computed(() => players.value.length > 0);
const status = computed(() => quizStore.status);

const handleJoin = async () => {
  joinError.value = null;
  try {
    await quizStore.join(nameInput.value);
  } catch (error) {
    console.error('Unable to join quiz lobby', error);
    joinError.value = quizStore.errorMessage;
  }
};

const handleStart = async () => {
  try {
    await quizStore.startQuiz();
    await router.push('/quiz');
  } catch (error) {
    console.error('Unable to start quiz', error);
  }
};

if (import.meta.client) {
  onMounted(() => {
    quizStore.initialize();
  });

  watch(
    () => quizStore.status,
    async (next) => {
      if (next === 'in-progress') {
        await router.replace('/quiz');
      }
    },
    { immediate: true }
  );
}
</script>
