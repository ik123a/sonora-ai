# ARCHITECTURE — SONORA AI

frontend/src: types, audio/engine (WebAudio), library/scanner, services/db (Tauri SQL + IndexedDB fallback), providers (types/registry/local/musicbrainz/jamendo/mock), ai (providers/models/tools/agent/recommendations/memory), voice, stores (usePlayer/useLibrary/useTheme/useAI), layouts/pages/components.
src-tauri: main.rs commands (store_api_key/load_api_key via keyring, list_music_dir allowlisted), SQLite, CSP, plugins sql/store/dialog/fs/notification/global-shortcut. Android identifier com.sonora.ai, minSdk 24.
Agent loop: user → LLM → tool? (max 8, 60s, cancel) → validate permission → execute → structured ToolResult → LLM → final. Permissions READ/PLAYBACK/PLAYLIST/DOWNLOAD/SYSTEM; destructive needs confirmation in UI.
