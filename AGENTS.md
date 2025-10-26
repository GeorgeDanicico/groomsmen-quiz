## Nuxt 3 Development Guide

This repository is a Nuxt 3 application. Use this guide to implement features safely and idiomatically with Nuxt, Vue, and TypeScript best practices.

---

### Core Principles
- **TypeScript first:** Keep `typescript.strict: true`. Prefer explicit types, `as const`, and `satisfies` over assertions. Never use `any` unless documented.
- **Vue SFCs:** Author components with `<script setup lang="ts">`, `<template>`, and `<style scoped>`. Keep components presentational; move logic into composables or services.
- **Convention over configuration:** Lean on Nuxt’s directory structure for pages, server routes, middleware, and plugins instead of custom wiring.
- **Separation of concerns:**  
  - UI → `components/`  
  - State → `stores/` (Pinia)  
  - Reusable logic → `composables/`  
  - I/O and side effects → `services/` and `server/`
- **SSR awareness:** Guard browser-only APIs (e.g., wrap in `process.client`). Use `useAsyncData`/`useFetch` for data loading.
- **Accessibility & performance:** Prefer semantic HTML, keyboard navigation, lazy loading, and `NuxtImg` where it fits.
- **Quality first:** Aim for small PRs with strong tests and consistent linting.

---

### Project Conventions

#### TypeScript
- Prefer narrow types and discriminated unions.
- Export shared types from `lib/types.ts` (or domain folders) and reuse them.
- Use `zod` or `valibot` to validate runtime boundaries (HTTP, environment).
- Convert external payloads to domain types once, near the boundary (`services/` or `server/api/`).

#### Vue & Nuxt
- Use `defineProps`/`defineEmits` with types, keeping props shallow and documented.
- Manage metadata with `useHead`/`useSeoMeta`.
- Fetch data via `useAsyncData` in pages/layouts; keep components dumb.
- Manage shared state in Pinia stores (`stores/`), exposing data with `storeToRefs`.
- Locate middleware in `middleware/` (named or route-specific).
- Register third-party libraries via plugins in `plugins/` with `defineNuxtPlugin`.
- Rely on file-based routing under `pages/`; use `[param].vue` for dynamic routes.

#### Server & Services
- Keep public API handlers under `server/api/*`.
- Use `defineEventHandler` and H3 utilities for server logic.
- Validate inputs/outputs and convert external data to internal shapes here.
- Call external HTTP services through `services/` using `$fetch` with typed generics.
- Store secrets and configuration in `nuxt.config.ts` `runtimeConfig`; access with `useRuntimeConfig()`.

#### Styling & UI
- Stick to a single utility framework (e.g., Tailwind) or component system.
- Co-locate styles with components and leverage CSS variables for theming.

#### i18n
- Store translations in `locales/`. Never hardcode user-facing strings in components.

#### Errors, Logging, & Loading
- Wrap network calls with `try/catch` and surface typed error results.
- Prefer `showError`/`createError` for Nuxt error pages.
- Expose loading states with skeletons/spinners using `pending` from `useAsyncData`.

#### Testing & Quality
- Use Vitest for unit tests, Vue Test Utils for components, and Playwright for e2e when configured.
- Lint with ESLint + `@nuxtjs/eslint-config-typescript` and Prettier; ensure CI blocks on failures.
- Follow Conventional Commits for commit messages.

---

### Feature Implementation Checklist
1. Define types in `lib/types.ts` (or the relevant domain module).
2. Implement service functions in `services/` for external I/O.  
   ```ts
   const data = await $fetch<MyApiResponse>('/endpoint')
   ```
   Validate responses and map to domain types at this boundary.
3. Create server endpoints in `server/api/` when the browser should not call third parties directly.
4. Add a Pinia store in `stores/` if state spans multiple pages; keep each store focused.
5. Encapsulate view-agnostic logic and data fetching in composables (`composables/`).
6. Build UI components in `components/` and pages in `pages/`, keeping components stateless when possible.
7. Internationalize user-facing strings through `locales/`.
8. Add middleware for route guards or preloading needs.
9. Cover logic with unit tests and UI behavior with component tests.
10. Run lint/tests and update documentation when behavior or environment variables change.
