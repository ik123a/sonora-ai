import type { RepeatMode, Track } from '../types';

export const EQ_BANDS = [60, 120, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;
export const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  Rock: [4, 3, 2, 1, 0, 1, 2, 3, 4],
  Pop: [2, 3, 4, 3, 1, 0, 1, 2, 3],
  Jazz: [3, 2, 1, 2, 3, 2, 1, 2, 3],
  Classical: [4, 3, 2, 1, 0, 0, 1, 3, 4],
  Electronic: [5, 4, 2, 0, 1, 2, 4, 4, 5],
  'Hip-Hop': [6, 5, 3, 1, 0, 1, 2, 2, 3],
  Vocal: [-1, 0, 1, 3, 4, 3, 2, 1, 0],
  'Bass Boost': [7, 6, 4, 2, 0, 0, 0, 0, 0],
  'Treble Boost': [0, 0, 0, 0, 0, 2, 4, 6, 7],
  Podcast: [-2, -1, 0, 2, 4, 4, 3, 1, 0],
};

interface EngineEvents { onTrackEnd: () => void; onTime: (t: number) => void; }

/**
 * Real WebAudio playback engine: gapless handoff, crossfade, EQ, analyser.
 * Uses HTMLAudioElement as source -> MediaElementSource -> EQ chain -> destination.
 */
export class AudioEngine {
  private elA: HTMLAudioElement | null = null;
  private elB: HTMLAudioElement | null = null;
  private usingA = true;
  private ctx: AudioContext | null = null;
  private filters: BiquadFilterNode[] = [];
  private preamp: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private events: EngineEvents = { onTrackEnd: () => undefined, onTime: () => undefined };
  crossfadeSec = 0;
  repeat: RepeatMode = 'off';

  private ensureGraph(el: HTMLAudioElement): void {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) {
      this.ctx = new AC();
      this.preamp = this.ctx.createGain();
      let head: AudioNode = this.preamp;
      this.filters = EQ_BANDS.map((f) => {
        const b = this.ctx!.createBiquadFilter();
        b.type = 'peaking'; b.frequency.value = f; b.Q.value = 1.1; b.gain.value = 0;
        head.connect(b); head = b; return b;
      });
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      head.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    try {
      const src = this.ctx.createMediaElementSource(el);
      src.connect(this.preamp!);
    } catch { /* already connected */ }
    el.addEventListener('ended', () => this.events.onTrackEnd());
    el.addEventListener('timeupdate', () => this.events.onTime(el.currentTime));
  }

  on(ev: Partial<EngineEvents>): void { this.events = { ...this.events, ...ev }; }

  private element(which: 'a' | 'b'): HTMLAudioElement {
    if (typeof Audio === 'undefined') throw new Error('Audio unavailable outside browser');
    if (which === 'a' && !this.elA) this.elA = new Audio();
    if (which === 'b' && !this.elB) this.elB = new Audio();
    return (which === 'a' ? this.elA : this.elB)!;
  }

  get active(): HTMLAudioElement { return this.element(this.usingA ? 'a' : 'b'); }
  get idle(): HTMLAudioElement { return this.element(this.usingA ? 'b' : 'a'); }

  private resolveUrl(t: Track): string {
    if (t.filePath && (t.filePath.startsWith('blob:') || t.filePath.startsWith('http') || t.filePath.startsWith('/'))) return t.filePath;
    return t.filePath ?? '';
  }

  async play(t: Track): Promise<void> {
    const url = this.resolveUrl(t);
    if (!url) throw new Error(`No playable URL for "${t.title}". Import the file or enable a provider.`);
    const next = this.idle;
    this.ensureGraph(next);
    // Crossfade: fade out active, fade in next
    const fade = Math.min(Math.max(this.crossfadeSec, 0), 12);
    if (fade > 0 && !this.active.paused) {
      const steps = 12; let i = 0;
      const from = this.active.volume;
      const timer = window.setInterval(() => {
        i += 1;
        this.active.volume = Math.max(0, from * (1 - i / steps));
        if (i >= steps) { window.clearInterval(timer); this.active.pause(); }
      }, (fade * 1000) / steps);
    } else { this.active.pause(); }
    next.src = url; next.playbackRate = this.active.playbackRate || 1;
    next.volume = this.active.volume || 0.9;
    await next.play();
    this.usingA = !this.usingA;
  }

  pause(): void { this.active.pause(); }
  resume(): Promise<void> { return this.active.play(); }
  seek(sec: number): void { this.active.currentTime = sec; }
  setVolume(v: number): void {
    if (typeof Audio === 'undefined') return;
    this.element('a').volume = v; this.element('b').volume = v;
  }
  setRate(r: number): void {
    if (typeof Audio === 'undefined') return;
    this.element('a').playbackRate = r; this.element('b').playbackRate = r;
  }
  setEQ(gains: number[], preampDb = 0): void {
    this.filters.forEach((f, i) => { f.gain.value = gains[i] ?? 0; });
    if (this.preamp && this.ctx) this.preamp.gain.value = Math.pow(10, preampDb / 20);
  }
  spectrum(): number[] {
    if (!this.analyser) return new Array(64).fill(0);
    const arr = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(arr);
    return Array.from(arr.slice(0, 64)).map((v) => v / 255);
  }
  devices(): Promise<MediaDeviceInfo[]> {
    return navigator.mediaDevices?.enumerateDevices().then((d) => d.filter((x) => x.kind === 'audiooutput')) ?? Promise.resolve([]);
  }
  async setOutput(deviceId: string): Promise<void> {
    const el = this.active as HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> };
    if (typeof el.setSinkId === 'function') await el.setSinkId(deviceId);
  }
}

export const engine = new AudioEngine();
