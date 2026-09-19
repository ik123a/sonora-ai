# SECURITY + CONTRIBUTING (summary)

Security: OS keyring for API keys (Tauri commands store_api_key/load_api_key), parameterized queries only, CSP in tauri.conf.json, allowlisted filesystem (list_music_dir), safe IPC, no arbitrary shell from AI, no secret logging, human-readable errors with details field, privacy controls (delete history/memory/db/cache).
Contributing: phases 1–9 incremental, `npm run build` green per change, strict TS, label mocks, never bypass DRM/auth/paywalls, never commit secrets.
