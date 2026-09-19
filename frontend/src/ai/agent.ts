import { chatComplete, defaultProvider, loadProviders } from './providers';
import { getTool } from './tools';
import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';

export interface AgentMessage { role: 'user' | 'assistant' | 'tool'; content: string; }

const MAX_STEPS = 8;

export async function runAgent(userText: string, onStep?: (m: AgentMessage) => void, signal?: AbortSignal): Promise<string> {
  const providers = loadProviders();
  const active = defaultProvider(providers);
  const steps: AgentMessage[] = [{ role: 'user', content: userText }];
  if (!active) {
    return 'No AI provider configured. Open Settings → AI & Providers, add an OpenAI-compatible endpoint or Ollama, then ask again. Your library tools still work without AI.';
  }
  const lower = userText.toLowerCase();
  for (let step = 0; step < MAX_STEPS; step++) {
    if (signal?.aborted) return 'Cancelled.';
    if (lower.includes('play') && lower.includes('liked')) {
      const liked = useLibrary.getState().tracks.filter((t) => t.liked);
      if (liked.length > 0) {
        usePlayer.getState().setQueue(liked, 0);
        return `Playing your ${liked.length} liked songs.`;
      }
      return 'You have no liked songs yet — tap the heart on anything you enjoy.';
    }
    if (lower.startsWith('play ')) {
      const q = userText.slice(5).trim();
      const tool = getTool('search_library');
      const res = await tool!.run({ q });
      const hits = (res.data as Array<{ id: string; title: string }>) ?? [];
      if (hits.length > 0) {
        await getTool('play_track')!.run({ trackId: (hits[0] as { id: string }).id });
        return `Playing ${(hits[0] as { title: string }).title}.`;
      }
    }
    if (lower.includes('analyz') && lower.includes('librar')) {
      const res = await getTool('analyze_library')!.run({});
      onStep?.({ role: 'tool', content: JSON.stringify(res.data) });
      const d = res.data as { total: number; topArtists: Array<[string, number]>; topGenres: Array<[string, number]> };
      return `Your library holds ${d.total} tracks. Top artist: ${d.topArtists[0]?.[0] ?? '—'}. Top genre: ${d.topGenres[0]?.[0] ?? '—'}.`;
    }
    try {
      const reply = await chatComplete(active, [
        { role: 'system', content: 'You are SONORA, a music agent. Be brief. Prefer actions over explanations. Never invent tracks outside the tool results.' },
        ...steps.map((s) => ({ role: s.role, content: s.content })),
      ]);
      if (reply.trim()) return reply;
      return 'Done.';
    } catch (e) {
      return `AI provider failed: ${e instanceof Error ? e.message : 'unknown error'}. Check Settings → AI & Providers → Test Connection.`;
    }
  }
  return 'Stopped after too many steps to avoid a loop. Try a smaller request.';
}
