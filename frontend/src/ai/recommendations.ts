import { useLibrary } from '../stores/useLibrary';
import type { Track } from '../types';

export function recommend(seedId?: string, limit = 20): Track[] {
  const tracks = useLibrary.getState().tracks;
  if (tracks.length === 0) return [];
  const seed = tracks.find((t) => t.id === seedId) ?? tracks.find((t) => t.liked) ?? tracks[0];
  return tracks
    .filter((t) => t.id !== seed.id)
    .map((t) => ({
      t,
      score: (t.genre && t.genre === seed.genre ? 3 : 0) + (t.artist === seed.artist ? 4 : 0) + (t.liked ? 2 : 0) + Math.min(t.playCount ?? 0, 5) * 0.2,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.t);
}
