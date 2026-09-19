import { create } from 'zustand';
import type { Track } from '../types';

interface LibraryState {
  tracks: Track[];
  setTracks: (t: Track[]) => void;
  addTracks: (t: Track[]) => void;
  toggleLike: (id: string) => void;
}

export const useLibrary = create<LibraryState>((set) => ({
  tracks: [],
  setTracks: (tracks) => set({ tracks }),
  addTracks: (incoming) => set((s) => {
    const isrcs = new Set(s.tracks.map((t) => t.isrc).filter((x) => x !== undefined));
    const seen = new Set(s.tracks.map((t) => `${t.title}|${t.artist}|${Math.round(t.duration)}`));
    const fresh = incoming.filter((t) => {
      if (t.isrc && isrcs.has(t.isrc)) return false;
      return !seen.has(`${t.title}|${t.artist}|${Math.round(t.duration)}`);
    });
    return { tracks: [...s.tracks, ...fresh] };
  }),
  toggleLike: (id) => set((s) => ({
    tracks: s.tracks.map((t) => (t.id === id ? { ...t, liked: !t.liked } : t)),
  })),
}));
