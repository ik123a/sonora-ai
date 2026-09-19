import type { ToolResult } from '../types';
import type { MusicProvider } from './types';

export const musicBrainzProvider: MusicProvider = {
  id: 'musicbrainz', name: 'MusicBrainz (metadata)', enabled: true, authenticated: true,
  async search(q) {
    const res = await fetch(`https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(q)}&fmt=json&limit=10&inc=isrcs`);
    if (!res.ok) throw new Error(`MusicBrainz responded ${res.status}`);
    const json = await res.json() as { recordings?: Array<{ id: string; title: string; isrcs?: string[]; 'artist-credit'?: Array<{ name: string }>; releases?: Array<{ title: string; date?: string }> }> };
    return (json.recordings ?? []).map((r, i) => ({
      id: `mb-${r.id}`,
      title: r.title,
      artist: r['artist-credit']?.map((a) => a.name).join(', ') ?? 'Unknown',
      album: r.releases?.[0]?.title ?? 'Unknown',
      year: r.releases?.[0]?.date ? Number(r.releases[0].date?.slice(0, 4)) : undefined,
      isrc: r.isrcs?.[0],
      duration: 0, source: 'provider' as const, providerId: 'musicbrainz', addedAt: Date.now() + i,
    }));
  },
  async getTrack() { return null; },
  async getAlbum() { return null; },
  async getArtist() { return null; },
  async getPlaylist() { return null; },
  async getRecommendations() { return []; },
  async getLyrics() { return null; },
  async getStream() { return null; },
  async download(): Promise<ToolResult> { return { success: false, message: 'MusicBrainz is metadata-only; no audio downloads.' }; },
  async authenticate() { return true; },
};
