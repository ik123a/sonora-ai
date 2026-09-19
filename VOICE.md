# VOICE

Pipeline: mic → STT → agent → TTS. Default uses browser SpeechRecognition/Synthesis (frontend/src/voice/voice.ts: listenOnce, speak). Packaged builds can swap Whisper/Piper/Edge/OpenAI/ElevenLabs adapters. Wake-word "Hey Sonora" stays OFF by default; mic status always visible; no background recording without consent.
