import { create } from 'zustand';
import { usePlayer } from './usePlayer';

export type SleepMode = { kind: 'off' } | { kind: 'minutes'; endsAt: number } | { kind: 'endOfTrack' } | { kind: 'endOfQueue' };

interface SleepState {
  mode: SleepMode;
  remainingSec: number;
  setMinutes: (min: number) => void;
  setEndOfTrack: () => void;
  setEndOfQueue: () => void;
  cancel: () => void;
}

let timer: ReturnType<typeof setInterval> | null = null;
let ticker: ReturnType<typeof setInterval> | null = null;

function stopClocks(): void {
  if (timer) clearTimeout(timer);
  if (ticker) clearInterval(ticker);
  timer = null; ticker = null;
}

function fire(): void {
  usePlayer.getState().toggle();
  useSleep.getState().cancel();
}

function startTicker(): void {
  if (ticker) clearInterval(ticker);
  ticker = setInterval(() => {
    const m = useSleep.getState().mode;
    if (m.kind === 'minutes') useSleep.setState({ remainingSec: Math.max(0, Math.round((m.endsAt - Date.now()) / 1000)) });
  }, 1000);
}

export const useSleep = create<SleepState>((set) => ({
  mode: { kind: 'off' },
  remainingSec: 0,
  setMinutes: (min) => {
    stopClocks();
    const endsAt = Date.now() + min * 60000;
    set({ mode: { kind: 'minutes', endsAt }, remainingSec: min * 60 });
    timer = setTimeout(fire, min * 60000);
    startTicker();
  },
  setEndOfTrack: () => { stopClocks(); set({ mode: { kind: 'endOfTrack' }, remainingSec: -1 }); },
  setEndOfQueue: () => { stopClocks(); set({ mode: { kind: 'endOfQueue' }, remainingSec: -1 }); },
  cancel: () => { stopClocks(); set({ mode: { kind: 'off' }, remainingSec: 0 }); },
}));

export function notifyTrackEnded(): void {
  const m = useSleep.getState().mode;
  if (m.kind === 'endOfTrack') fire();
  else if (m.kind === 'endOfQueue' && usePlayer.getState().queue.length <= usePlayer.getState().index + 1) fire();
}

export function handleTrackEnded(): boolean {
  const m = useSleep.getState().mode;
  if (m.kind === 'endOfTrack') { fire(); return true; }
  if (m.kind === 'endOfQueue' && usePlayer.getState().queue.length <= usePlayer.getState().index + 1) { fire(); return true; }
  return false;
}
