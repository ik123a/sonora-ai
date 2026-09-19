# AI_AGENT — SONORA Agent

Action-taking agent, not a chatbot. Tools in frontend/src/ai/tools.ts (search_library, play_track, pause_music, skip_track, previous_track, set_volume, get_current_track, get_queue, like_song, analyze_library; full 40-tool schema in Phase 4). Loop in agent.ts: max 8 steps, AbortSignal cancel, permission validation per tool, structured ToolResult, LLM final. Fast paths handle play/liked/analyze locally before LLM. Missing provider yields setup guidance, never fake tracks.
