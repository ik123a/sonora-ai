import { create } from 'zustand';
import { engine } from '../audio/engine';
import type { RepeatMode, Track } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  index: number;
  isPlaying: boolean;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  setQueue: (tracks: Track[], start?: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (sec: number) => void;
  setVolume: (v: number) => void;
  setShuffle: (s: boolean) => void;
  setRepeat: (r: RepeatMode) => void;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  index: 0,
  isPlaying: false,
  volume: 0.9,
  shuffle: false,
  repeat: 'off',
  setQueue: (tracks, start = 0) => {
    const track = tracks[start] ?? null;
    set({ queue: tracks, index: start, currentTrack: track });
    if (track) void engine.play(track).then(() => set({ isPlaying: true })).catch(() => set({ isPlaying: false }));
  },
  toggle: () => {
    const { isPlaying, currentTrack } = get();
    if (!currentTrack) return;
    if (isPlaying) { engine.pause(); set({ isPlaying: false }); }
    else { void engine.resume().then(() => set({ isPlaying: true })); }
  },
  next: () => {
    const { queue, index, shuffle, repeat, currentTrack } = get();
    if (queue.length === 0) return;
    if (repeat === 'one' && currentTrack) { void engine.play(currentTrack); return; }
    let n = shuffle ? Math.floor(Math.random() * queue.length) : index + 1;
    if (n >= queue.length) { if (repeat === 'all') n = 0; else { set({ isPlaying: false }); return; } }
    const track = queue[n];
    set({ index: n, currentTrack: track });
    void engine.play(track).then(() => set({ isPlaying: true }));
  },
  prev: () => {
    const { queue, index } = get();
    const n = Math.max(0, index - 1);
    const track = queue[n];
    if (!track) return;
    set({ index: n, currentTrack: track });
    void engine.play(track).then(() => set({ isPlaying: true }));
  },
  seek: (sec) => engine.seek(sec),
  setVolume: (v) => { engine.setVolume(v); set({ volume: v }); },
  setShuffle: (s) => set({ shuffle: s }),
  setRepeat: (r) => { engine.repeat = r; set({ repeat: r }); },
}));

engine.on({ onTrackEnd: () => usePlayer.getState().next() });
