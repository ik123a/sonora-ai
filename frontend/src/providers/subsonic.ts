import type { ToolResult } from '../types';
import type { MusicProvider } from './types';

export interface SubsonicConfig { baseUrl: string; user: string; password: string; }

const KEY = 'sonora.subsonic.v1';

export function loadSubsonic(): SubsonicConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { baseUrl: '', user: '', password: '', ...(JSON.parse(raw) as Partial<SubsonicConfig>) };
  } catch {
    return { baseUrl: '', user: '', password: '' };
  }
  return { baseUrl: '', user: '', password: '' };
}

export function saveSubsonic(c: SubsonicConfig): void {
  localStorage.setItem(KEY, JSON.stringify(c));
}

function buildUrl(c: SubsonicConfig, view: string, extra: Record<string, string> = {}): string {
  const q = new URLSearchParams({ u: c.user, p: c.password, v: '1.16.1', c: 'sonora-ai', f: 'json', ...extra });
  return `${c.baseUrl.replace(/\/$/, '')}/rest/${view}?${q.toString()}`;
}

interface SubsonicSong { id: string; title?: string; artist?: string; album?: string; duration?: number; genre?: string; year?: number; }

function toTrack(s: SubsonicSong, c: SubsonicConfig) {
  return {
    id: `sub-${s.id}`, title: s.title ?? 'Unknown', artist: s.artist ?? 'Unknown', album: s.album ?? 'Unknown',
    genre: s.genre, year: s.year, duration: s.duration ?? 0,
    filePath: buildUrl(c, 'stream', { id: s.id }),
    source: 'provider' as const, providerId: 'subsonic', addedAt: Date.now(),
  };
}

export const subsonicProvider: MusicProvider = {
  id: 'subsonic', name: 'Subsonic / Navidrome', enabled: false, authenticated: false,
  async search(q) {
    const c = loadSubsonic();
    if (!c.baseUrl || !c.user) throw new Error('Set server URL + user in Providers → Subsonic first.');
    const res = await fetch(buildUrl(c, 'search3', { query: q }));
    if (!res.ok) throw new Error(`Subsonic HTTP ${res.status}`);
    const json = await res.json() as { 'subsonic-response'?: { song?: SubsonicSong[] | SubsonicSong } };
    const songs = json['subsonic-response']?.song;
    const list = Array.isArray(songs) ? songs : songs ? [songs] : [];
    return list.map((s) => toTrack(s, c));
  },
  async getTrack() { return null; },
  async getAlbum() { return null; },
  async getArtist() { return null; },
  async getPlaylist() { return null; },
  async getRecommendations() { return []; },
  async getLyrics() { return null; },
  async getStream(trackId) {
    const c = loadSubsonic();
    const id = trackId.replace(/^sub-/, '');
    return buildUrl(c, 'stream', { id });
  },
  async download(): Promise<ToolResult> { return { success: false, message: 'Subsonic streaming only — use its download endpoint where your server allows.' }; },
  async authenticate() {
    const c = loadSubsonic();
    if (!c.baseUrl || !c.user) return false;
    try {
      const res = await fetch(buildUrl(c, 'ping'));
      const json = await res.json() as { 'subsonic-response'?: { status?: string } };
      this.authenticated = json['subsonic-response']?.status === 'ok';
      return this.authenticated;
    } catch {
      this.authenticated = false;
      return false;
    }
  },
};
