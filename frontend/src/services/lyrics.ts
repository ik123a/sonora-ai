import { useLibrary } from '../stores/useLibrary';

export interface LyricLine { time: number; text: string; }

export function parseLRC(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const raw of lrc.split('\n')) {
    const matches = [...raw.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    const text = raw.replace(/\[.*?\]/g, '').trim();
    if (matches.length === 0 || !text) continue;
    for (const m of matches) {
      const min = Number(m[1]);
      const sec = Number(m[2]);
      const frac = m[3] ? Number(m[3].padEnd(3, '0').slice(0, 3)) / 1000 : 0;
      lines.push({ time: min * 60 + sec + frac, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

export function activeLineIndex(lines: LyricLine[], positionSec: number): number {
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= positionSec) idx = i;
    else break;
  }
  return idx;
}

export async function fetchSyncedLyrics(artist: string, title: string): Promise<LyricLine[] | null> {
  const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json() as { syncedLyrics?: string | null };
  if (!json.syncedLyrics) return null;
  const lines = parseLRC(json.syncedLyrics);
  return lines.length ? lines : null;
}

export async function lyricsFor(trackId: string): Promise<{ text: string; synced: boolean }> {
  const t = useLibrary.getState().tracks.find((x) => x.id === trackId);
  if (t?.lyrics) return { text: t.lyrics, synced: false };
  return { text: 'No embedded lyrics found. Karaoke view tries LRCLIB automatically — or edit metadata to add lyrics.', synced: false };
}
