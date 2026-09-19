import type { ToolResult } from '../types';
import type { MusicProvider } from './types';

const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID as string | undefined;

export const jamendoProvider: MusicProvider = {
  id: 'jamendo', name: 'Jamendo (CC-licensed)', enabled: false, authenticated: false,
  async search(q) {
    if (!CLIENT_ID) throw new Error('Set VITE_JAMENDO_CLIENT_ID to enable Jamendo.');
    const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=json&search=${encodeURIComponent(q)}&limit=10&audioformat=mp32`);
    if (!res.ok) throw new Error(`Jamendo responded ${res.status}`);
    const json = await res.json() as { results?: Array<{ id: string; name: string; artist_name: string; album_name: string; duration: number; audio: string }> };
    return (json.results ?? []).map((r) => ({
      id: `jam-${r.id}`, title: r.name, artist: r.artist_name, album: r.album_name,
      duration: r.duration, filePath: r.audio, source: 'provider' as const,
      providerId: 'jamendo', addedAt: Date.now(),
    }));
  },
  async getTrack() { return null; },
  async getAlbum() { return null; },
  async getArtist() { return null; },
  async getPlaylist() { return null; },
  async getRecommendations() { return []; },
  async getLyrics() { return null; },
  async getStream(trackId) { return trackId.startsWith('jam-') ? null : null; },
  async download(): Promise<ToolResult> { return { success: false, message: 'Jamendo downloads require the track audio URL and license check.' }; },
  async authenticate() { this.authenticated = Boolean(CLIENT_ID); return this.authenticated; },
};
