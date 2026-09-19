import type { MusicProvider } from './types';
import { localProvider } from './local';
import { musicBrainzProvider } from './musicbrainz';
import { jamendoProvider } from './jamendo';
import { mockProvider } from './mock';

const all: MusicProvider[] = [localProvider, musicBrainzProvider, jamendoProvider, mockProvider];

export const registry = {
  list(): MusicProvider[] { return all; },
  enabled(): MusicProvider[] { return all.filter((p) => p.enabled); },
  get(id: string): MusicProvider | undefined { return all.find((p) => p.id === id); },
  setEnabled(id: string, enabled: boolean): void {
    const p = all.find((x) => x.id === id);
    if (p) p.enabled = enabled;
  },
};
