# QuizHero Architecture

## Overview

QuizHero is a React + TypeScript quiz app focused on Indian content, with AI-generated questions (Gemini), multiplayer/bot modes, landmark quizzes, and survival mode. It runs as a web app and can be packaged for Android via Capacitor.

## Folder structure

```
├── App.tsx                 # Main screen router / state orchestrator
├── index.tsx               # Entry point
├── types.ts                # Shared TypeScript types & GameState enum
├── components/             # UI screens and shared components
│   ├── multiplayer/        # Multiplayer-specific screens
│   └── ...
├── context/                # React contexts (Language)
├── data/                   # Static content (questions, landmarks, bots, themes)
├── hooks/                  # Reusable logic
│   ├── useQuizTimer.ts
│   ├── useUserData.ts      # Profile, history, achievements, landmark progress
│   └── useThemeSettings.ts # Theme, wallpaper, sound, accent color
├── lib/                    # Services & utilities
│   ├── backendService.ts   # Gemini question generation
│   ├── gemini.ts           # Gemini client singleton
│   ├── achievements.ts
│   ├── translations.ts
│   ├── audioUtils.ts
│   └── utils.ts
└── ...
```

## Navigation model

Screens are selected via the `GameState` enum in `types.ts`. `App.tsx` holds the current `gameState` and renders the matching screen component. This is intentional for a mobile-style flow without a URL router.

## State ownership

| Concern | Where |
|---------|--------|
| Language / i18n | `context/LanguageContext` |
| User, history, achievements, landmarks | `hooks/useUserData` (prefer this over duplicating in App) |
| Theme, wallpaper, sound | `hooks/useThemeSettings` |
| Active quiz session | Still largely in `App.tsx` (questions, score, answers) |
| Timer | `hooks/useQuizTimer` |

## AI questions

`lib/backendService.ts` calls Gemini (`gemini-2.5-flash`) with a JSON schema to produce multiple-choice questions. Requires `GEMINI_API_KEY` (or `API_KEY`) in the environment at build time via Vite.

## Persistence

User data and preferences are stored in `localStorage`. There is no remote backend for accounts or multiplayer yet — social features use local/mock data.

## Android build

See `README.md` for Capacitor + Android Studio steps. Use `npm run build:android` after setting up icons under `assets/`.

## Cleanup notes (Nov 2026)

- Removed unused root-level duplicates of `QuestionCard` / `QuizScreen`
- Removed empty stubs (chess, Community, BotLeaderboard, FriendsTab)
- Added `useUserData` and `useThemeSettings` hooks for clearer separation of concerns
