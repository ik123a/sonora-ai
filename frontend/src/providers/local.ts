import { useLibrary } from '../stores/useLibrary';
import type { ToolResult, Track } from '../types';
import type { MusicProvider } from './types';

export const localProvider: MusicProvider = {
  id: 'local', name: 'Local Library', enabled: true, authenticated: true,
  async search(q) {
    const needle = q.toLowerCase();
    return useLibrary.getState().tracks.filter((t) =>
      [t.title, t.artist, t.album, t.genre ?? ''].join(' ').toLowerCase().includes(needle));
  },
  async getTrack(id) { return useLibrary.getState().tracks.find((t) => t.id === id) ?? null; },
  async getAlbum(id) {
    const tracks = useLibrary.getState().tracks.filter((t) => t.album === id);
    if (tracks.length === 0) return null;
    return { id, title: id, artist: tracks[0].artist, trackIds: tracks.map((t) => t.id) };
  },
  async getArtist(id) {
    const tracks = useLibrary.getState().tracks.filter((t) => t.artist === id);
    if (tracks.length === 0) return null;
    return { id, name: id, trackIds: tracks.map((t) => t.id) };
  },
  async getPlaylist() { return null; },
  async getRecommendations(seedId) {
    const tracks = useLibrary.getState().tracks;
    const seed = tracks.find((t) => t.id === seedId);
    if (!seed) return tracks.slice(0, 10);
    return tracks
      .filter((t) => t.id !== seedId)
      .map((t) => ({ t, score: (t.genre === seed.genre ? 2 : 0) + (t.artist === seed.artist ? 3 : 0) + (t.liked ? 1 : 0) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((x) => x.t);
  },
  async getLyrics(trackId) {
    return useLibrary.getState().tracks.find((t) => t.id === trackId)?.lyrics ?? null;
  },
  async getStream(trackId) {
    return useLibrary.getState().tracks.find((t) => t.id === trackId)?.filePath ?? null;
  },
  async download(trackId): Promise<ToolResult> {
    const t: Track | undefined = useLibrary.getState().tracks.find((x) => x.id === trackId);
    if (!t?.filePath) return { success: false, message: 'Only user-owned local files can be referenced for offline use.' };
    return { success: true, message: 'Local file already available offline.', data: { path: t.filePath } };
  },
  async authenticate() { return true; },
};
