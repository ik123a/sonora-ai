import type { Track } from '../types';

export interface ScrobbleSettings {
  listenbrainzToken: string;
  lastfmApiKey: string;
  lastfmSecret: string;
  lastfmSession: string;
  lastfmBaseUrl: string;
}

const KEY = 'sonora.scrobble.v1';

export function loadScrobbleSettings(): ScrobbleSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { listenbrainzToken: '', lastfmApiKey: '', lastfmSecret: '', lastfmSession: '', lastfmBaseUrl: 'https://ws.audioscrobbler.com/2.0/', ...(JSON.parse(raw) as Partial<ScrobbleSettings>) };
  } catch {
    return { listenbrainzToken: '', lastfmApiKey: '', lastfmSecret: '', lastfmSession: '', lastfmBaseUrl: 'https://ws.audioscrobbler.com/2.0/' };
  }
  return { listenbrainzToken: '', lastfmApiKey: '', lastfmSecret: '', lastfmSession: '', lastfmBaseUrl: 'https://ws.audioscrobbler.com/2.0/' };
}

export function saveScrobbleSettings(s: ScrobbleSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function shouldScrobble(playedSec: number, durationSec: number): boolean {
  if (durationSec <= 0) return playedSec >= 30;
  return playedSec >= Math.min(240, durationSec / 2) && playedSec >= 30;
}

export async function submitListenBrainz(token: string, t: Track): Promise<void> {
  const res = await fetch('https://api.listenbrainz.org/1/submit-listens', {
    method: 'POST',
    headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listen_type: 'single',
      payload: [{
        listened_at: Math.floor(Date.now() / 1000),
        track_metadata: { artist_name: t.artist, track_name: t.title, release_name: t.album },
      }],
    }),
  });
  if (!res.ok) throw new Error(`ListenBrainz HTTP ${res.status}`);
}

async function lastfmSign(params: Record<string, string>, secret: string): Promise<string> {
  const keys = Object.keys(params).filter((k) => k !== 'format').sort();
  const raw = keys.map((k) => `${k}${params[k]}`).join('') + secret;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  void digest;
  let md5 = '';
  try {
    const mod = await import('blueimp-md5');
    md5 = (mod.default as (s: string) => string)(raw);
  } catch {
    throw new Error('Last.fm signing needs the blueimp-md5 package — run npm install blueimp-md5.');
  }
  return md5;
}

export async function submitLastFm(s: ScrobbleSettings, t: Track): Promise<void> {
  if (!s.lastfmApiKey || !s.lastfmSecret || !s.lastfmSession) throw new Error('Last.fm needs API key + secret + session key.');
  const params: Record<string, string> = {
    method: 'track.scrobble', api_key: s.lastfmApiKey, sk: s.lastfmSession,
    artist: t.artist, track: t.title, album: t.album,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  params.api_sig = await lastfmSign(params, s.lastfmSecret);
  const res = await fetch(s.lastfmBaseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...params, format: 'json' }),
  });
  if (!res.ok) throw new Error(`Last.fm HTTP ${res.status}`);
}

let currentId: string | null = null;
let startedAt = 0;

export async function trackStarted(t: Track): Promise<void> {
  await trackEnded();
  currentId = t.id;
  startedAt = Date.now();
  const s = loadScrobbleSettings();
  if (s.listenbrainzToken) {
    fetch('https://api.listenbrainz.org/1/submit-listens', {
      method: 'POST',
      headers: { Authorization: `Token ${s.listenbrainzToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listen_type: 'playing_now',
        payload: [{ track_metadata: { artist_name: t.artist, track_name: t.title, release_name: t.album } }],
      }),
    }).catch(() => undefined);
  }
}

export async function trackEnded(): Promise<void> {
  if (!currentId) return;
  const id = currentId;
  currentId = null;
  const playedSec = (Date.now() - startedAt) / 1000;
  const s = loadScrobbleSettings();
  if (!s.listenbrainzToken && !s.lastfmSession) return;
  const { useLibrary } = await import('../stores/useLibrary');
  const t = useLibrary.getState().tracks.find((x) => x.id === id);
  if (!t || !shouldScrobble(playedSec, t.duration)) return;
  const jobs: Array<Promise<void>> = [];
  if (s.listenbrainzToken) jobs.push(submitListenBrainz(s.listenbrainzToken, t));
  if (s.lastfmSession) jobs.push(submitLastFm(s, t));
  await Promise.allSettled(jobs);
}
