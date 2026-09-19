import { parseBlob } from 'music-metadata-browser';
import { nanoid } from 'nanoid';
import type { Track } from '../types';

const SUPPORTED = ['mp3', 'flac', 'wav', 'aac', 'm4a', 'ogg', 'opus', 'aiff', 'aif', 'wma'];

export function isSupported(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return SUPPORTED.includes(ext);
}

export async function filesToTracks(files: FileList | File[]): Promise<{ tracks: Track[]; skipped: Array<{ name: string; reason: string }> }> {
  const list = Array.from(files).filter((f) => isSupported(f.name));
  const tracks: Track[] = [];
  const skipped: Array<{ name: string; reason: string }> = [];
  for (const file of list) {
    try {
      const meta = await parseBlob(file);
      const c = meta.common;
      tracks.push({
        id: nanoid(),
        title: c.title ?? file.name.replace(/\.[^.]+$/, ''),
        artist: c.artist ?? c.albumartist ?? 'Unknown Artist',
        album: c.album ?? 'Unknown Album',
        albumArtist: c.albumartist,
        genre: c.genre?.[0],
        year: c.year,
        trackNo: c.track.no ?? undefined,
        discNo: c.disk.no ?? undefined,
        duration: meta.format.duration ?? 0,
        isrc: Array.isArray(c.isrc) ? c.isrc[0] : c.isrc ?? undefined,
        bitrate: meta.format.bitrate ? Math.round(meta.format.bitrate / 1000) : undefined,
        codec: meta.format.codec,
        artworkUrl: undefined,
        filePath: URL.createObjectURL(file),
        source: 'local',
        addedAt: Date.now(),
      });
    } catch (e) {
      skipped.push({ name: file.name, reason: e instanceof Error ? e.message : 'Unreadable file' });
    }
  }
  return { tracks, skipped };
}
