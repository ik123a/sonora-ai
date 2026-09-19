import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Playlist, SmartRule, Track } from '../types';

interface PlaylistState {
  playlists: Playlist[];
  create: (name: string, trackIds?: string[], description?: string) => Playlist;
  remove: (id: string) => void;
  rename: (id: string, name: string) => void;
  addTracks: (id: string, trackIds: string[]) => void;
  removeTrack: (id: string, trackId: string) => void;
  createSmart: (name: string, rules: SmartRule[]) => Playlist;
  evaluateSmart: (p: Playlist, tracks: Track[]) => string[];
}

export const usePlaylists = create<PlaylistState>((set) => ({
  playlists: [],
  create: (name, trackIds = [], description) => {
    const p: Playlist = { id: nanoid(), name, description, trackIds, createdAt: Date.now(), updatedAt: Date.now() };
    set((s) => ({ playlists: [...s.playlists, p] }));
    return p;
  },
  remove: (id) => set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),
  rename: (id, name) => set((s) => ({ playlists: s.playlists.map((p) => (p.id === id ? { ...p, name, updatedAt: Date.now() } : p)) })),
  addTracks: (id, trackIds) => set((s) => ({
    playlists: s.playlists.map((p) => (p.id === id ? { ...p, trackIds: [...new Set([...p.trackIds, ...trackIds])], updatedAt: Date.now() } : p)),
  })),
  removeTrack: (id, trackId) => set((s) => ({
    playlists: s.playlists.map((p) => (p.id === id ? { ...p, trackIds: p.trackIds.filter((t) => t !== trackId), updatedAt: Date.now() } : p)),
  })),
  createSmart: (name, rules) => {
    const p: Playlist = { id: nanoid(), name, trackIds: [], createdAt: Date.now(), updatedAt: Date.now(), smart: true, rules };
    set((s) => ({ playlists: [...s.playlists, p] }));
    return p;
  },
  evaluateSmart: (p, tracks) => {
    if (!p.smart || !p.rules) return p.trackIds;
    return tracks.filter((t) => p.rules!.every((r) => {
      if (r.field === 'liked') return Boolean(t.liked) === Boolean(r.value);
      if (r.field === 'genre') return (t.genre ?? '').toLowerCase().includes(String(r.value).toLowerCase());
      if (r.field === 'addedAt' && r.op === 'inLastDays') return Date.now() - t.addedAt < Number(r.value) * 86400000;
      if (r.field === 'playCount' && r.op === '<') return (t.playCount ?? 0) < Number(r.value);
      if (r.field === 'playCount' && r.op === '>') return (t.playCount ?? 0) > Number(r.value);
      return true;
    })).map((t) => t.id);
  },
}));
