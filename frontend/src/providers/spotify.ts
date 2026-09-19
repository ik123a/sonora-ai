import type { ToolResult, Track } from '../types';
import type { MusicProvider } from './types';

const CLIENT_KEY = 'sonora.spotify.clientId';
const TOKEN_KEY = 'sonora.spotify.token.v1';

interface StoredToken { access: string; refresh: string; expiresAt: number; }

function redirectUri(): string {
  return `${window.location.origin}${window.location.pathname}#/providers`;
}

function loadToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as StoredToken) : null;
  } catch {
    return null;
  }
}

function base64url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function getClientId(): string { return localStorage.getItem(CLIENT_KEY) ?? ''; }
export function setClientId(id: string): void { localStorage.setItem(CLIENT_KEY, id.trim()); }
export function spotifyLinked(): boolean { return loadToken() !== null; }
export function spotifyLogout(): void { localStorage.removeItem(TOKEN_KEY); }

export async function spotifyLogin(): Promise<void> {
  const clientId = getClientId();
  if (!clientId) throw new Error('Enter your Spotify Client ID first (free at developer.spotify.com, add this page URL as redirect URI).');
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(64)).buffer);
  const challenge = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  sessionStorage.setItem('sonora.spotify.verifier', verifier);
  const q = new URLSearchParams({
    client_id: clientId, response_type: 'code', redirect_uri: redirectUri(),
    code_challenge_method: 'S256', code_challenge: challenge,
    scope: 'user-top-read user-library-read playlist-read-private user-read-email',
  });
  window.location.href = `https://accounts.spotify.com/authorize?${q.toString()}`;
}

export async function finishSpotifyLogin(): Promise<boolean> {
  const hash = window.location.hash;
  const query = hash.includes('?') ? hash.slice(hash.indexOf('?')) : window.location.search;
  const code = new URLSearchParams(query).get('code');
  if (!code) return false;
  const verifier = sessionStorage.getItem('sonora.spotify.verifier');
  if (!verifier) return false;
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: getClientId(), grant_type: 'authorization_code', code,
      redirect_uri: redirectUri(), code_verifier: verifier,
    }),
  });
  if (!res.ok) return false;
  const json = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ access: json.access_token, refresh: json.refresh_token, expiresAt: Date.now() + json.expires_in * 1000 } satisfies StoredToken));
  window.location.hash = '#/providers';
  return true;
}

async function accessToken(): Promise<string> {
  const t = loadToken();
  if (!t) throw new Error('Link Spotify first.');
  if (Date.now() < t.expiresAt - 60000) return t.access;
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: getClientId(), grant_type: 'refresh_token', refresh_token: t.refresh }),
  });
  if (!res.ok) throw new Error('Spotify session expired — log in again.');
  const json = await res.json() as { access_token: string; expires_in: number; refresh_token?: string };
  const next: StoredToken = { access: json.access_token, refresh: json.refresh_token ?? t.refresh, expiresAt: Date.now() + json.expires_in * 1000 };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(next));
  return next.access;
}

async function api<T>(path: string): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`https://api.spotify.com/v1${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Spotify HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

interface SpotifyTrack { id: string; name: string; duration_ms: number; explicit: boolean; external_ids?: { isrc?: string }; artists: Array<{ name: string }>; album: { name: string; release_date?: string; images?: Array<{ url: string }> }; }

function toTrack(t: SpotifyTrack): Track {
  return {
    id: `spo-${t.id}`, title: t.name, artist: t.artists.map((a) => a.name).join(', '),
    album: t.album.name, year: t.album.release_date ? Number(t.album.release_date.slice(0, 4)) : undefined,
    isrc: t.external_ids?.isrc, duration: Math.round(t.duration_ms / 1000),
    artworkUrl: t.album.images?.[0]?.url, source: 'provider', providerId: 'spotify-data', addedAt: Date.now(),
  };
}

export const spotifyDataProvider: MusicProvider = {
  id: 'spotify-data', name: 'Spotify (official data)', enabled: false, authenticated: false,
  async search(q) {
    const json = await api<{ tracks?: { items: SpotifyTrack[] } }>(`/search?q=${encodeURIComponent(q)}&type=track&limit=10`);
    return (json.tracks?.items ?? []).map(toTrack);
  },
  async getTrack() { return null; },
  async getAlbum() { return null; },
  async getArtist() { return null; },
  async getPlaylist(id) {
    const json = await api<{ name: string; description: string; tracks: { items: Array<{ track: SpotifyTrack }> } }>(`/playlists/${id}`);
    const tracks = json.tracks.items.map((i) => i.track).filter(Boolean).map(toTrack);
    return { id, name: json.name, description: json.description, trackIds: tracks.map((t) => t.id), createdAt: Date.now(), updatedAt: Date.now() };
  },
  async getRecommendations(seedId) {
    const id = seedId.replace(/^spo-/, '');
    const json = await api<{ tracks: SpotifyTrack[] }>(`/recommendations?seed_tracks=${id}&limit=10`).catch(() => ({ tracks: [] as SpotifyTrack[] }));
    return json.tracks.map(toTrack);
  },
  async getLyrics() { return null; },
  async getStream() { return null; },
  async download(): Promise<ToolResult> { return { success: false, message: 'Spotify data only — playback stays with your local library and authorized sources.' }; },
  async authenticate() {
    try {
      await api<{ id: string }>('/me');
      this.authenticated = true;
      return true;
    } catch {
      this.authenticated = false;
      return false;
    }
  },
};

export async function spotifyTopTracks(): Promise<Track[]> {
  const json = await api<{ items: SpotifyTrack[] }>('/me/top/tracks?time_range=medium_term&limit=20');
  return json.items.map(toTrack);
}

export async function spotifyPlaylists(): Promise<Array<{ id: string; name: string; count: number }>> {
  const json = await api<{ items: Array<{ id: string; name: string; tracks: { total: number } }> }>('/me/playlists?limit=20');
  return json.items.map((p) => ({ id: p.id, name: p.name, count: p.tracks.total }));
}
