# Groomsmen Quiz

Groomsmen Quiz is a Nuxt 3 application that lets the wedding party compete in a live trivia session about the couple. The host can launch a quiz session, friends can join from their own devices, and everyone sees questions, timers, and results in real time.

## Features
- **Lobby management:** Track who has joined before starting the quiz.
- **Timed questions:** Each round includes multiple-choice questions with a countdown timer.
- **Answer review:** Reveal the correct answer and per-player responses after each question.
- **Scoreboard:** Summarize results at the end of the quiz to crown the trivia champion.

## Technology
- [Nuxt 3](https://nuxt.com/) with Vue 3, Vite, and Nitro.
- TypeScript-first codebase with composables, Pinia stores, and server API routes.
- Mock data sources under `server/data/` for quiz questions.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

By default the app runs at `http://localhost:3000`.

### Multiplayer on the Same Network

To let multiple people connect from different devices on the same network, start the dev server in host mode and make sure everyone is connected to the same Wi-Fi or LAN:

```bash
npm run dev -- --host
```

Share the host machine’s local IP address (e.g., `http://192.168.0.42:3000`) so others can open the quiz in their browsers.

## Production Build

Create an optimized build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Follow the [Nuxt deployment guide](https://nuxt.com/docs/getting-started/deployment) to publish the app to your hosting platform of choice.
