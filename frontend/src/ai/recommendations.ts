import { useLibrary } from '../stores/useLibrary';
import type { Track } from '../types';

export function recommend(seedId?: string, limit = 20): Track[] {
  return buildRadio(seedId, limit).map((r) => r.track);
}

export interface RadioPick { track: Track; score: number; }

export function buildRadio(seedId?: string, limit = 20): RadioPick[] {
  const tracks = useLibrary.getState().tracks;
  if (tracks.length === 0) return [];
  const seed = tracks.find((t) => t.id === seedId) ?? tracks.find((t) => t.liked) ?? tracks[0];
  const topArtists = new Map<string, number>();
  for (const t of tracks) {
    if (t.liked || (t.playCount ?? 0) > 2) topArtists.set(t.artist, (topArtists.get(t.artist) ?? 0) + 1);
  }
  const scored = tracks
    .filter((t) => t.id !== seed.id)
    .map((t) => {
      const artistAffinity = t.artist === seed.artist ? 0.3 : (topArtists.get(t.artist) ?? 0) > 0 ? 0.15 : 0;
      const genreOverlap = t.genre && t.genre === seed.genre ? 0.2 : 0;
      const sourceRelevance = t.liked ? 0.15 : t.source === seed.source ? 0.1 : 0;
      const recency = Math.max(0, 0.15 * (1 - (Date.now() - t.addedAt) / (180 * 86400000)));
      const popularity = Math.min(0.1, (t.playCount ?? 0) * 0.02);
      return { track: t, score: artistAffinity + genreOverlap + sourceRelevance + recency + popularity };
    })
    .sort((a, b) => b.score - a.score);
  const picked: RadioPick[] = [];
  const perArtist = new Map<string, number>();
  for (const c of scored) {
    if (picked.length >= limit) break;
    const n = perArtist.get(c.track.artist) ?? 0;
    if (n >= 3) continue;
    perArtist.set(c.track.artist, n + 1);
    picked.push(c);
  }
  return picked;
}
