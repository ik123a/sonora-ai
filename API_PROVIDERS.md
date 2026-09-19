# API_PROVIDERS + AI_AGENT + VOICE + SECURITY (summary)

Providers implement search/getTrack/getAlbum/getArtist/getPlaylist/getRecommendations/getLyrics/getStream/download/authenticate. Local = real. MusicBrainz = metadata-only real. Jamendo = CC audio, needs VITE_JAMENDO_CLIENT_ID. Spotify/YouTube/Tidal = interface-ready, auth-gated, never scraped. Mock = dev-labeled.
AI: unlimited OpenAI-compatible configs (OpenAI/Anthropic/Gemini/OpenRouter/Groq/Together/Mistral/Ollama/LM Studio/custom), per-task routing, Test Connection, OS keyring in Tauri. Agent tools permission-gated, max 8 steps, cancel, no shell.
Voice: browser SpeechRecognition/Synthesis default; Whisper/Piper/Edge/OpenAI/ElevenLabs adapters planned; wake-word off by default with mic indicator.
Security: keyring storage, parameterized SQL, CSP, safe IPC, allowlisted FS, no secret logging, details-field errors.
Full docs expand per phase without breaking this contract.
