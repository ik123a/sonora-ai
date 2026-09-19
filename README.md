# SONORA AI — Your Music. Your Rules. Your AI.

Ad-free, AI-native, voice-controlled, local-first music player. Tauri v2 + React 19 + TypeScript + SQLite.

## Status (Phase 1–4 foundation)
Real and working: app shell/routing/theme, local folder import + metadata, WebAudio engine (gapless handoff, crossfade, 9-band EQ, visualizer data, media keys), SQLite/IndexedDB persistence, Settings → AI & Providers (multi-provider, test connection), tool-calling agent loop with guardrails, local + MusicBrainz + Jamendo (CC) + Mock providers, search, recommendations, voice via browser speech APIs. Labeled MOCK where mocked. No DRM bypass.

## Run
```sh
cd frontend
npm install
npm run dev
npm run build
```

## Android (APK)
Host has Android SDK at `D:\Android\Sdk` but no Java/NDK yet. See `docs/ANDROID.md`. Desktop builds first; `npm run tauri android init/build` after installing Java 17 + NDK.

## Docs
ARCHITECTURE.md, DEVELOPMENT.md, API_PROVIDERS.md, AI_AGENT.md, VOICE.md, SECURITY.md, CONTRIBUTING.md, docs/ANDROID.md
